import {boards} from './content.mjs';
import {chooseBoards,createMatch,resolveAnswer,applyResolution,revealMissed,nextRound,winner} from './engine.mjs';

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const REGISTRY_ID='arcade:family-feud';
let state=null,busy=false,phrase='',message='',muted=true,audio=null,names=['Player 1','Player 2'];
let matchSessionId=null,matchGeneration=0,sessionLoaded=false;
let seen=[];
try{seen=JSON.parse(localStorage.getItem('atlas:family-feud:seen')||'[]');if(!Array.isArray(seen))seen=[];}catch{}
window.ArcadeGameChrome?.mountLanding({root:'#landing-chrome',appearance:false});
window.ArcadeGameChrome?.mountGame({root:'#game-chrome',returnRoot:'#return-slot',onBeforeReturn:()=>saveMatch()});
window.AtlasSessionPanel?.mount({root:'#atlas-session-panel-root',initialView:'manage'});
function participantNames(){
  // The bridge exposes a named learner session, not an authoritative tutor name.
  // Keep the other contestant's fallback rather than interpreting account data.
  try{const session=window.AtlasBridge?.readActiveSession();names=['Player 1',session?.id!=='default'&&session?.name?.trim()?session.name.trim():'Player 2'];}catch{names=['Player 1','Player 2'];}
}
// AtlasBridge owns session identity; Family Feud owns the match snapshot.
function readSnapshot(sessionId){
  if(!sessionId)return null;
  try{
    const record=window.AtlasBridge?.readRegistry?.()?.sessionStates?.[sessionId]?.[REGISTRY_ID];
    if(!record||record.status==='complete')return null;
    const saved=record.familyFeud;
    if(!saved||saved.version!==1||!Array.isArray(saved.boardIds)||saved.boardIds.length!==3)return null;
    const selected=saved.boardIds.map(id=>boards.find(board=>board.id===id));
    if(selected.some(board=>!board)||new Set(saved.boardIds).size!==3)return null;
    const pair=(value,max=Infinity)=>Array.isArray(value)&&value.length===2&&value.every(n=>Number.isInteger(n)&&n>=0&&n<=max);
    const player=n=>n===0||n===1;
    if(!Number.isInteger(saved.round)||saved.round<0||saved.round>2||
      !player(saved.starter)||!player(saved.active)||
      !pair(saved.scores)||!pair(saved.contribution)||!pair(saved.strikes,3)||
      !['playing','missed','roundEnd'].includes(saved.phase)||
      !Array.isArray(saved.revealed)||saved.revealed.length!==6||
      !saved.revealed.every(entry=>entry===null||(entry&&typeof entry==='object'&&
        (entry.owner===null||player(entry.owner)))))return null;
    const restoredNames=Array.isArray(saved.names)&&saved.names.length===2&&
      saved.names.every(name=>typeof name==='string'&&name.length<=120)
      ? saved.names : null;
    return {
      match:{boards:selected,round:saved.round,starter:saved.starter,active:saved.active,
        scores:[...saved.scores],contribution:[...saved.contribution],
        strikes:[...saved.strikes],revealed:saved.revealed.map(entry=>entry?{owner:entry.owner}:null),
        phase:saved.phase},
      names:restoredNames
    };
  }catch{return null;}
}
function saveMatch(){
  if(!state||!matchSessionId||!window.AtlasBridge?.upsertSessionState)return;
  const complete=state.phase==='final';
  const snapshot=complete?null:{
    version:1,boardIds:state.boards.map(board=>board.id),
    round:state.round,starter:state.starter,active:state.active,
    scores:[...state.scores],contribution:[...state.contribution],strikes:[...state.strikes],
    revealed:state.revealed.map(entry=>entry?{owner:entry.owner}:null),
    phase:state.phase,names:[...names]
  };
  try{
    window.AtlasBridge.upsertSessionState(matchSessionId,REGISTRY_ID,{
      world:'arcade',type:'game',title:'Family Feud',
      status:complete?'complete':'in-progress',
      progress:{covered:complete?3:state.round+1,total:3,openEnded:false},
      currentLabel:complete?'Match complete':`Round ${state.round+1} of 3`,
      familyFeud:snapshot,
      launchUrl:new URL('./index.html',location.href).href,
      lastTouchedAt:Date.now()
    });
  }catch{} // Persistence failure must not interrupt a match.
}
function loadActiveMatch(){
  const nextSession=window.AtlasBridge?.readActiveSession?.()||null;
  const nextId=nextSession?.id||null;
  if(sessionLoaded&&nextId===matchSessionId)return;
  ++matchGeneration;sessionLoaded=true;matchSessionId=nextId;
  const restored=readSnapshot(matchSessionId);
  state=restored?.match||null;
  busy=false;phrase='';message='';
  $('#stage').classList.remove('opening');
  participantNames();
  if(restored?.names)names=restored.names;
  render();
}
window.addEventListener('atlas:session-change',loadActiveMatch);
participantNames();
$('#crowd').innerHTML=Array.from({length:5},(_,r)=>`<div class="terrace" style="--tilt:${r%2?.5:-.5}deg">${Array.from({length:20},()=>'<i class="pebble"></i>').join('')}</div>`).join('');
function tone(kind){
  if(muted)return;
  try{
    audio??=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')void audio.resume();
    const notes=kind==='success'?[392,523,659]:kind==='final'?[392,523,659,784]:kind==='strike'?[130,98]:[330];
    notes.forEach((frequency,i)=>{
      const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.065;
      osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.045,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+.16);
      osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.18);
    });
  }catch{} // Audio must never interrupt a turn.
}
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').textContent=muted?'Sound off':'Sound on';$('#sound').setAttribute('aria-pressed',String(!muted));if(!muted)tone('handoff');});
function lightCrowd(value,owner){
  const color=owner===0?'#ffab48':owner===1?'#b5a6ff':'#fff0b5';
  // One fixed field, proportional illuminated fraction; no running simulation.
  const pebbles=[...document.querySelectorAll('.pebble')];
  pebbles.forEach((p,i)=>{p.style.setProperty('--glow',color);p.classList.toggle('lit',(i*37)%100<value);});
  setTimeout(()=>pebbles.forEach(p=>p.classList.remove('lit')),850);
}
function button(action,label,cls='primary',disabled=false){return `<button type="button" data-action="${action}" class="${cls}" ${disabled?'disabled':''}>${label}</button>`;}
function renderPlayers(displayScores=state?.scores,displayActive=state?.active){
  for(let p=0;p<2;p++){
    const el=$(`#player-${p}`),out=state?.phase!=='final'&&state?.strikes[p]===3,active=state?.phase==='playing'&&displayActive===p;
    el.classList.toggle('active',!!active);el.classList.toggle('out',!!out);
    el.innerHTML=`${state?(active?'<span class="turn-label">YOUR TURN</span>':out?'<span class="turn-label">OUT THIS ROUND</span>':''):''}<span class="name" title="${esc(names[p])}">${esc(names[p])}</span><strong class="score" aria-label="${esc(names[p])}: ${displayScores?.[p]||0} points">${displayScores?.[p]||0}</strong>${state?`<div class="strikes" role="img" aria-label="${state.strikes[p]} of 3 strikes">${[0,1,2].map(i=>`<span aria-hidden="true" class="strike ${i<state.strikes[p]?'used':''}">${i<state.strikes[p]?'×':''}</span>`).join('')}</div>${['roundEnd','final'].includes(state.phase)?`<span class="contribution">+${state.contribution[p]} this round</span>`:''}`:''}`;
  }
}
function renderBoard(flash=-1){
  const el=$('#board');el.classList.toggle('final-board',state?.phase==='final');
  if(state?.phase==='final'){
    const w=winner(state);el.innerHTML=`<span class="result-eyebrow">THREE ROUNDS. ONE CROWD.</span><h2>${w===null?'It’s a draw.':`${esc(names[w])} wins!`}</h2><div class="final-scores">${names.map((name,p)=>`<div>${esc(name)}<strong>${state.scores[p]}</strong></div>`).join('')}</div>`;return;
  }
  el.innerHTML=Array.from({length:6},(_,i)=>{
    const r=state?.revealed[i],c=r?state.boards[state.round].concepts[i]:null;
    const owner=r?.owner;return `<div role="group" class="row ${r?'revealed':''} ${r?(owner===0?'claimed-a':owner===1?'claimed-b':'unclaimed'):''} ${(Array.isArray(flash)?flash.includes(i):i===flash)?'just-revealed':''}" style="--reveal-color:${owner===0?'#ffac45':owner===1?'#b6a3ff':'#fff0d9'}" aria-label="Rank ${i+1}${c?`: ${esc(c.label)}, ${c.value} points, ${owner===null?'unclaimed':`found by ${esc(names[owner])}`}`:', hidden'}"><span class="rank" aria-hidden="true">${i+1}</span><span class="answer" aria-hidden="true">${c?esc(c.label):''}</span><span class="value" aria-hidden="true">${c?c.value:''}</span></div>`;
  }).join('');
}
function renderDock(displayActive=state?.active){
  const dock=$('#dock-controls');
  if(!state){dock.innerHTML=button('start','Start Match')+'<small>2 CONTESTANTS · 3 ROUNDS</small>';return;}
  if(state.phase==='playing'){
    dock.innerHTML=`<form id="answer-form" autocomplete="off"><input id="answer" name="prediction" aria-label="Your answer" placeholder="Your answer…" maxlength="180" autocomplete="off" autocapitalize="off" spellcheck="false" ${busy?'disabled':''} value="${esc(phrase)}"><div class="actions"><button class="primary submit" type="submit" ${busy||!phrase.trim()?'disabled':''}>${busy?'Resolving…':'Submit Answer'}</button>${button('pass','Pass','secondary',busy)}</div></form>`;
    $('#answer').addEventListener('input',e=>{phrase=e.target.value;const submitButton=$('#answer-form .submit');if(submitButton)submitButton.disabled=busy||!phrase.trim();});
    $('#answer-form').addEventListener('submit',e=>{e.preventDefault();void submit();});
  }else if(state.phase==='missed') dock.innerHTML=`<div class="reveal-layout"><p class="prediction reveal-heading">What did we miss?</p><div class="actions reveal-actions">${button('reveal','Reveal Next','primary',busy)}${button('reveal-all','Reveal All','secondary',busy)}</div></div>`;
  else if(state.phase==='roundEnd')dock.innerHTML=`<div class="phase-layout"><p class="prediction phase-heading">Board complete</p><div class="actions phase-actions">${button('next',state.round===2?'Final Result':'Next Round','primary',busy)}</div></div>`;
  else dock.innerHTML=`<div class="phase-layout"><div class="actions phase-actions phase-end-actions">${button('again','Play Again')}${button('finish','Finish','secondary')}</div></div>`;
}
function render({flash=-1,scores=state?.scores,active=state?.active}={}){
  $('#stage').classList.toggle('entrance',!state);$('#landing-chrome').hidden=!!state;$('#game-chrome').hidden=!state;
  document.documentElement.style.setProperty('--active',active===1?'#9990ed':'#ff902e');
  $('#heading').innerHTML=state?`<span class="round-kicker">${state.phase==='final'?'MATCH COMPLETE':`ROUND ${state.round+1} OF 3`}</span><h1>${state.phase==='final'?'You met the crowd.':esc(state.boards[state.round].question)}</h1>`:'<h1>FAMILY<br>FEUD</h1><p>You know your answer.<br>Do you know everyone else’s?</p>';
  renderBoard(flash);renderPlayers(scores,active);renderDock(active);$('#feedback').textContent=message;
}
function focusAnswer(){if(!busy&&state?.phase==='playing')$('#answer')?.focus({preventScroll:true});}
function rememberBoard(){
  seen=[...new Set([...seen,state.boards[state.round].id])];
  try{localStorage.setItem('atlas:family-feud:seen',JSON.stringify(seen));}catch{}
}
async function openRound(){
  const generation=matchGeneration,match=state;
  busy=true;phrase='';message='';rememberBoard();render();
  $('#stage').classList.add('opening');await pause(reduced()?150:850);
  if(generation!==matchGeneration||state!==match)return;
  $('#stage').classList.remove('opening');
  busy=false;renderDock();focusAnswer();
}
function recordAtlasPlay(){
  try{
    const bridge=window.AtlasBridge;
    if(matchSessionId){
      bridge?.touchRecentActivity?.({
        sessionId:matchSessionId,
        registryId:REGISTRY_ID,
        world:'arcade',
        type:'game',
        title:'Family Feud',
        launchUrl:new URL('./index.html',location.href).href
      });
    }
    window.AtlasAnalytics?.arcadeGameStart?.('family-feud');
  }catch{} // Recent activity must never interrupt a match.
}
async function start(){
  if(busy)return;participantNames();state=createMatch(chooseBoards(boards,seen));saveMatch();recordAtlasPlay();await openRound();
}
function fly(index,player,value){
  if(reduced())return;
  const from=document.querySelectorAll('.row')[index]?.querySelector('.value')?.getBoundingClientRect(),to=$(`#player-${player} .score`)?.getBoundingClientRect();
  if(!from||!to)return;
  const el=document.createElement('div');el.className='flight';el.textContent=`+${value}`;
  Object.assign(el.style,{left:`${from.left}px`,top:`${from.top}px`});el.style.setProperty('--dx',`${to.left-from.left}px`);el.style.setProperty('--dy',`${to.top-from.top}px`);el.style.setProperty('--glow',player===0?'#ffb056':'#b8a9ff');document.body.append(el);setTimeout(()=>el.remove(),500);
}
async function submit(pass=false){
  if(busy||state?.phase!=='playing')return;
  if(!pass&&!phrase.trim()){focusAnswer();return;}
  busy=true;const match=state,generation=matchGeneration;
  const stillCurrent=()=>generation===matchGeneration&&state===match;
  const exact=phrase,previous=state.active,scores=[...state.scores];
  message='';renderDock();$('#feedback').textContent='';
  const began=performance.now();let resolution;
  try{resolution=pass?{kind:'pass'}:await resolveAnswer(match.boards[match.round],exact);}
  catch{resolution={kind:'error'};}
  if(!stillCurrent())return;
  await pause(Math.max(0,320-(performance.now()-began)));
  if(!stillCurrent())return;
  const result=applyResolution(match,resolution);
  if(!['error','ambiguous','already'].includes(result.kind))saveMatch();
  if(result.kind==='error'){
    message='Couldn’t check that answer. Try again — no strike.'; // Preserve exact phrase and turn.
  }else if(result.kind==='ambiguous'){
    message='Try one specific answer · no strike.';
  }else if(result.kind==='already'){
    phrase='';message='Already on the board · no strike. Try another.';
  }else if(result.kind==='match'){
    phrase='';message=`${state.boards[state.round].concepts[result.index].label} · +${result.value} points`;
    render({flash:result.index,scores,active:previous});tone('success');lightCrowd(result.value,result.player);
    // Reveal, then transfer, then advance the score and turn light.
    await pause(reduced()?80:260);if(!stillCurrent())return;
    fly(result.index,result.player,result.value);await pause(reduced()?80:400);
    if(!stillCurrent())return;
    renderPlayers(match.scores,previous);$(`#player-${result.player} .score`).classList.add('bump');
    await pause(reduced()?50:330);if(!stillCurrent())return;
  }else{
    phrase='';message=state.phase==='missed'?'':result.out?`${names[result.player]} is out this round.`:pass?'Passed · +1 strike':'Not on the board · +1 strike';
    tone('strike');render({active:previous});await pause(reduced()?80:350);
    if(!stillCurrent())return;
  }
  busy=false;
  if(state.phase!=='playing')message='';
  render();
  if(state.phase==='playing'){if(state.active!==previous)tone('handoff');focusAnswer();}
  else $('#dock button')?.focus({preventScroll:true});
}
$('#dock').addEventListener('click',async e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;if(!action||busy)return;
  if(action==='start'||action==='again')await start();
  else if(action==='pass')await submit(true);
  else if(action==='reveal'||action==='reveal-all'){
    const missing=state.revealed.flatMap((r,i)=>r?[]:[i]),index=action==='reveal-all'?missing:missing[0];revealMissed(state,action==='reveal-all');saveMatch();
    message='';
    render({flash:index});$('#dock button')?.focus({preventScroll:true});
  }else if(action==='next'){
    nextRound(state);saveMatch();
    if(state.phase==='final'){message='';render();tone('final');lightCrowd(75,winner(state));$('#dock button')?.focus({preventScroll:true});}
    else await openRound();
  }else if(action==='finish')location.href=new URL('../index.html',location.href).href;
});
loadActiveMatch();
