// Forbidden Words only. The legacy HTTP game remains untouched.
// Every live command resolves only on a server acknowledgement bearing its ID.
export class ForbiddenWordsLiveClient {
  constructor({ api, session, actor, getTicketPayload, getAuthorization,
    onState, onStatus, onFatal, onHeartbeat,
    fetchImpl = fetch, WebSocketImpl = WebSocket }) {
    this.api = api.endsWith("/") ? api : api + "/";
    this.session = session;
    this.actor = actor;
    this.getTicketPayload = getTicketPayload;
    this.getAuthorization = getAuthorization;
    this.onState = onState;
    this.onStatus = onStatus;
    this.onFatal = onFatal;
    this.onHeartbeat = onHeartbeat;
    this.fetchImpl = fetchImpl;
    this.WebSocketImpl = WebSocketImpl;
    this.closed = false;
    this.connected = false;
    this.socket = null;
    this.inFlight = new Map();
    this.reconnectDelay = 500;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.watchdogTimer = null;
    this.lastReply = 0;
  }
  async post(route, payload) {
    const auth = await this.getAuthorization();
    if (this.closed) throw new Error("Room closed.");
    const response = await this.fetchImpl(this.api + "live/" + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: "Bearer " + auth } : {}),
      },
      body: JSON.stringify({ session: this.session, ...payload }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.error || "Could not reach the live game.");
      error.status = response.status;
      throw error;
    }
    return data;
  }
  async initialize(payload) {
    return this.post("create", payload);
  }
  connect() {
    if (this.closed || this.connecting || this.connected) return;
    this.connecting = true;
    this.startConnection().catch(error => this.connectionFailed(error))
      .finally(() => { this.connecting = false; });
  }
  async startConnection() {
    const ticketData = await this.post("ticket", {
      actor: this.actor, ...(await this.getTicketPayload()),
    });
    if (this.closed) return;
    const url = new URL(this.api + "live/socket");
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("session", this.session);
    // The ticket is only a WebSocket subprotocol; never place it in URLs.
    const ws = new this.WebSocketImpl(url.href, ["fw-ticket." + ticketData.ticket]);
    this.socket = ws;
    ws.onopen = () => {
      if (this.closed || this.socket !== ws) return;
      this.lastReply = Date.now();
      this.watchdogTimer = setInterval(() => {
        if (!this.closed && this.socket === ws &&
            Date.now() - this.lastReply > 16000)
          ws.close();
      }, 4000);
    };
    ws.onmessage = event => {
      if (this.closed || this.socket !== ws) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      this.lastReply = Date.now();
      if (message.type === "heartbeat") {
        this.onHeartbeat?.(message.serverNow);
        return;
      }
      if (message.type === "state" && message.state) {
        this.onState(message);
        if (!this.connected) {
          this.connected = true;
          this.reconnectDelay = 500;
          this.onStatus(true);
          this.startHeartbeat();
        }
        return;
      }
      if (message.type === "ack" || message.type === "error") {
        const entry = this.inFlight.get(message.id);
        if (!entry) return;
        this.inFlight.delete(message.id);
        clearTimeout(entry.timer);
        if (message.type === "ack") entry.resolve();
        else {
          const error = new Error(message.error || "Game action rejected.");
          error.status = message.status || 409;
          entry.reject(error);
        }
      }
    };
    ws.onclose = () => this.socketEnded(ws);
    ws.onerror = () => {
      // onclose handles retries. No access to sensitive handshake details.
    };
  }
  connectionFailed(error) {
    if (this.closed) return;
    if ([401, 403, 404, 410].includes(error.status)) {
      this.onFatal(error);
      this.close();
    } else {
      this.onStatus(false);
      this.retry();
    }
  }
  socketEnded(ws) {
    if (this.closed || this.socket !== ws) return;
    this.socket = null;
    this.connected = false;
    this.stopHeartbeat();
    for (const [id, entry] of this.inFlight) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Connection interrupted. Retrying the game action."));
      this.inFlight.delete(id);
    }
    this.onStatus(false);
    this.retry();
  }
  retry() {
    if (this.closed || this.reconnectTimer) return;
    const delay = this.reconnectDelay;
    this.reconnectDelay = Math.min(5000, this.reconnectDelay * 2);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
  startHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => this.heartbeat(), 4000);
    this.heartbeat();
  }
  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    clearInterval(this.watchdogTimer);
    this.heartbeatTimer = null;
    this.watchdogTimer = null;
  }
  heartbeat() {
    if (this.connected && this.socket?.readyState === 1)
      this.socket.send(JSON.stringify({ action: "poll" }));
  }
  command(action, extra = {}, id) {
    if (!id) return Promise.reject(new Error("Live actions require a stable command ID."));
    if (!this.connected || this.socket?.readyState !== 1)
      return Promise.reject(new Error("Connection interrupted. Reconnecting."));
    if (this.inFlight.has(id))
      return Promise.reject(new Error("That game action is already being sent."));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.inFlight.delete(id);
        reject(new Error("The game did not confirm that action. Retry it."));
      }, 10000);
      this.inFlight.set(id, { resolve, reject, timer });
      try {
        this.socket.send(JSON.stringify({ action, id, ...extra }));
      } catch (error) {
        clearTimeout(timer);
        this.inFlight.delete(id);
        reject(error);
      }
    });
  }
  close() {
    this.closed = true;
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    for (const [id, entry] of this.inFlight) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Game room changed."));
      this.inFlight.delete(id);
    }
    const ws = this.socket;
    this.socket = null;
    this.connected = false;
    ws?.close();
  }
}
