export const normalize = text => String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
function distance(a, b) {
  const d = Array.from({length:a.length+1}, () => Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) d[i][0]=i;
  for(let j=0;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) {
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]));
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[a.length][b.length];
}
// A bounded, authored semantic grammar: remove conversational framing, never
// search arbitrary substrings or expand to broadly associated concepts.
function meaning(text) {
  return normalize(text).replace(/^(?:i think (?:it is |its |people (?:take |forget |have ))?|i would say |my answer is |maybe |probably |they (?:forget |take |have )|people (?:forget |take |have )|forgetting |taking )/, '').replace(/^(?:a |an |the |their |my |your )/, '').replace(/ (?:at home|with them)$/, '').trim();
}
export function resolveAnswer(board, phrase) {
  if(!board?.concepts || board.concepts.length!==6) throw new Error('Board unavailable');
  const n=normalize(phrase);
  if(!n) return {kind:'ambiguous'};
  const exact = board.concepts.map((c,i)=>c.aliases.some(a=>normalize(a)===n)?i:-1).filter(i=>i>=0);
  if(exact.length===1) return {kind:'match',index:exact[0]};
  // Lists must commit to one answer even when only one alternative is on board.
  if(exact.length>1 || /[,;/\n]|\b(?:or|and|also|either)\b/i.test(phrase)) return {kind:'ambiguous'};
  if(/^(?:something|stuff|things|it|that|a thing|i dont know|not sure)$/.test(n)) return {kind:'ambiguous'};
  const m=meaning(n);
  if(board.concepts.some(c=>c.excluded.some(x=>meaning(x)===m))) {
    // A neighbour may be another valid concept: still resolve against ALL six.
    const neighbour=board.concepts.findIndex(c=>c.aliases.some(a=>meaning(a)===m));
    return neighbour>=0?{kind:'match',index:neighbour}:{kind:'miss'};
  }
  const fuzzy=board.concepts.map((c,i)=>c.aliases.some(a=>{
    const s=normalize(a);
    // Short substitutions readily turn unrelated words into answers (bike/bake,
    // bark/bank). For four-letter words accept only insertion/deletion/transposition.
    const shortSafe=Math.min(n.length,s.length)>4 || n.length!==s.length || [...n].sort().join('')===[...s].sort().join('');
    return shortSafe && n.length>=4 && s.length>=4 && Math.abs(s.length-n.length)<=1 && distance(n,s)<=1;
  })?i:-1).filter(i=>i>=0);
  if(fuzzy.length===1) return {kind:'match',index:fuzzy[0]};
  const semantic=board.concepts.map((c,i)=>c.aliases.some(a=>meaning(a)===m)?i:-1).filter(i=>i>=0);
  if(semantic.length===1) return {kind:'match',index:semantic[0]};
  if(fuzzy.length>1||semantic.length>1) throw new Error('Resolver cannot reliably choose a concept');
  return {kind:'miss'};
}
export function chooseBoards(boards, seen=[], random=Math.random) {
  const shuffle = a => {a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;};
  return [...shuffle(boards.filter(b=>!seen.includes(b.id))),...shuffle(boards.filter(b=>seen.includes(b.id)))].slice(0,3);
}
export function createMatch(boards, random=Math.random) {
  const starter=random()<.5?0:1;
  return {boards,round:0,starter,active:starter,scores:[0,0],contribution:[0,0],strikes:[0,0],revealed:Array(6).fill(null),phase:'playing'};
}
function advance(s) {
  if(s.revealed.every(Boolean)) s.phase='roundEnd';
  else if(s.strikes.every(x=>x===3)) s.phase='missed';
  else { const next=1-s.active; if(s.strikes[next]<3)s.active=next; }
}
export function applyResolution(s, result) {
  if(s.phase!=='playing') throw new Error('Not an active turn');
  if(result.kind==='ambiguous'||result.kind==='error')return result;
  if(result.kind==='match') {
    if(s.revealed[result.index])return {kind:'already',index:result.index};
    const player=s.active,value=s.boards[s.round].concepts[result.index].value;
    s.revealed[result.index]={owner:player};s.scores[player]+=value;s.contribution[player]+=value;
    advance(s);return {...result,player,value};
  }
  if(result.kind!=='pass'&&result.kind!=='miss')throw new Error('Unknown resolution');
  const player=s.active;s.strikes[player]++;advance(s);
  return {...result,player,out:s.strikes[player]===3};
}
export function revealMissed(s, all=false) {
  if(s.phase!=='missed')return;
  for(let i=0;i<6;i++)if(!s.revealed[i]){s.revealed[i]={owner:null};if(!all)break;}
  if(s.revealed.every(Boolean))s.phase='roundEnd';
}
export function nextRound(s) {
  if(s.phase!=='roundEnd')return;
  if(s.round===2){s.phase='final';return;}
  s.starter=s.scores[0]===s.scores[1]?1-s.starter:s.scores[0]<s.scores[1]?0:1;
  s.active=s.starter;s.round++;s.strikes=[0,0];s.contribution=[0,0];s.revealed=Array(6).fill(null);s.phase='playing';
}
export function winner(s){return s.scores[0]===s.scores[1]?null:s.scores[0]>s.scores[1]?0:1;}
