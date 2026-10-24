// Forbidden Words only. The legacy HTTP game remains untouched.
// Every live command resolves only on a server acknowledgement bearing its ID.
export class ForbiddenWordsLiveClient {
  constructor({ api, session, actor, getTicketPayload, getAuthorization,
    onState, onStatus, onFatal, onHeartbeat,
    // Keep the native Window receiver; calling a saved fetch function
    // as this.fetchImpl(...) can throw "Illegal invocation" in browsers.
    fetchImpl = (...args) => globalThis.fetch(...args),
    WebSocketImpl = WebSocket }) {
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
    this.suspended = false;
    this.connectionGeneration = 0;
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = response.status === 404
        ? "Live rooms are not enabled yet. Start a regular game instead."
        : data.error || "Could not reach the live game.";
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data;
  }
  async initialize(payload) {
    return this.post("create", payload);
  }
  connect() {
    this.checkConnection();
    if (this.closed || this.suspended || this.connecting || this.connected ||
        this.reconnectTimer ||
        (this.socket && this.socket.readyState <= 1)) return;
    const generation = ++this.connectionGeneration;
    this.connecting = true;
    this.startConnection(generation)
      .catch(error => {
        if (generation === this.connectionGeneration && !this.suspended)
          this.connectionFailed(error);
      })
      .finally(() => {
        // A suspended page can resume while a ticket request is in flight.
        // The old request must never unset a newer connection's guard.
        if (generation === this.connectionGeneration) this.connecting = false;
      });
  }
  async startConnection(generation) {
    const ticketData = await this.post("ticket", {
      actor: this.actor, ...(await this.getTicketPayload()),
    });
    if (this.closed || this.suspended ||
        generation !== this.connectionGeneration) return;
    const url = new URL(this.api + "live/socket");
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("session", this.session);
    // The ticket is only a WebSocket subprotocol; never place it in URLs.
    const ws = new this.WebSocketImpl(url.href, ["fw-ticket." + ticketData.ticket]);
    this.socket = ws;
    ws.onopen = () => {
      if (this.closed || this.socket !== ws) return;
      this.lastReply = Date.now();
      this.watchdogTimer = setInterval(() => this.checkConnection(), 4000);
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
  checkConnection() {
    const ws = this.socket;
    if (this.closed || this.suspended || !ws || ws.readyState === 0 ||
        Date.now() - this.lastReply <= 16000) return;
    // A dead connection's close handshake may not finish promptly. Detach it
    // now so watchdog/foreground recovery can reconnect without a page reload.
    // Late events from this socket are ignored by the socket identity guards.
    this.socketEnded(ws);
    ws.close();
  }
  connectionFailed(error) {
    if (this.closed || this.suspended) return;
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
    if (this.closed || this.suspended || this.reconnectTimer) return;
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
  // pagehide can move a document into the back/forward cache. Park the
  // socket without discarding room identity; pageshow restores it.
  suspend() {
    if (this.closed || this.suspended) return;
    this.suspended = true;
    this.connectionGeneration++;
    this.connecting = false;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.stopHeartbeat();
    const ws = this.socket;
    this.socket = null;
    const wasConnected = this.connected;
    this.connected = false;
    for (const [id, entry] of this.inFlight) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Connection interrupted. Retrying the game action."));
      this.inFlight.delete(id);
    }
    ws?.close(1001, "Page hidden");
    if (wasConnected) this.onStatus(false);
  }
  resume() {
    if (this.closed || !this.suspended) return;
    this.suspended = false;
    this.connect();
  }
  close() {
    this.closed = true;
    this.connectionGeneration++;
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
