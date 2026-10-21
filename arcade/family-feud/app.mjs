import {boards} from './content.mjs';
import {chooseBoards,createMatch,resolveAnswer,applyResolution,revealMissed,nextRound,winner} from './engine.mjs';

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let state=null,busy=false,phrase='',message='',muted=true,audio=null,names=['Player 1','Player 2'];
let seen=[];
try{seen=JSON.parse(localStorage.getItem('atlas:family-feud:seen')||'[]');if(!Array.isArray(seen))seen=[];}catch{}
window.ArcadeGameChrome?.mountLanding({root:'#landing-chrome',appearance:false});
window.ArcadeGameChrome?.mountGame({root:'#game-chrome',returnRoot:'#return-slot'});
window.AtlasSessionPanel?.mount({root:'#atlas-session-panel-root',initialView:'manage'});
function participantNames(){
  // The bridge exposes a named learner session, not an authoritative tutor name.
  // Keep the other contestant's fallback rather than interpreting account data.
  try{const session=window.AtlasBridge?.readActiveSession();names=['Player 1',session?.id!=='default'&&session?.name?.trim()?session.name.trim():'Player 2'];}catch{names=['Player 1','Player 2'];}
}
window.addEventListener('atlas:session-change',()=>{if(!state){participantNames();render();}});
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
  const dock=$('#dock');
  if(!state){dock.innerHTML=button('start','Start Match')+'<small>2 CONTESTANTS · 3 ROUNDS</small>';return;}
  if(state.phase==='playing'){
    dock.innerHTML=`<label for="answer" class="prediction">${esc(names[displayActive])}’s prediction</label><form id="answer-form" autocomplete="off"><input id="answer" name="prediction" aria-label="Your answer" placeholder="Your answer…" maxlength="180" autocomplete="off" autocapitalize="off" spellcheck="false" ${busy?'disabled':''} value="${esc(phrase)}"><div class="actions"><button class="primary submit" type="submit" ${busy?'disabled':''}>${busy?'Resolving…':'Submit Answer'}</button>${button('pass','Pass','secondary',busy)}</div></form>`;
    $('#answer').addEventListener('input',e=>phrase=e.target.value);
    $('#answer-form').addEventListener('submit',e=>{e.preventDefault();void submit();});
  }else if(state.phase==='missed') dock.innerHTML=`<p class="prediction">What did we miss?</p><div class="actions">${button('reveal','Reveal Next','primary',busy)}${button('reveal-all','Reveal All','secondary',busy)}</div>`;
  else if(state.phase==='roundEnd')dock.innerHTML=`<p class="prediction">Board complete</p>${button('next',state.round===2?'Final Result':'Next Round','primary',busy)}`;
  else dock.innerHTML=`<p class="prediction">${boards.filter(b=>!seen.includes(b.id)).length>=3?'Three unseen boards ready':'Replay includes previously played boards'}</p><div class="actions">${button('again','Play Again')}${button('finish','Finish','secondary')}</div><p class="round">MATCH COMPLETE</p>`;
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
  busy=true;phrase='';message='';rememberBoard();render();
  $('#stage').classList.add('opening');await pause(reduced()?150:850);$('#stage').classList.remove('opening');
  busy=false;renderDock();focusAnswer();
}
function recordAtlasPlay(){
  try{
    const bridge=window.AtlasBridge,session=bridge?.readActiveSession?.();
    if(session?.id){
      bridge.touchRecentActivity?.({
        sessionId:session.id,
        registryId:'arcade:family-feud',
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
  if(busy)return;participantNames();state=createMatch(chooseBoards(boards,seen));recordAtlasPlay();await openRound();
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
  if(!pass&&!phrase.trim()){message='Say one answer aloud, then enter it here.';$('#feedback').textContent=message;focusAnswer();return;}
  busy=true;const exact=phrase,previous=state.active,scores=[...state.scores];
  message=pass?`${names[previous]} passes.`:`“${exact}”`;renderDock();$('#feedback').textContent=message;
  const began=performance.now();let resolution;
  try{resolution=pass?{kind:'pass'}:await resolveAnswer(state.boards[state.round],exact);}
  catch{resolution={kind:'error'};}
  await pause(Math.max(0,320-(performance.now()-began)));
  const result=applyResolution(state,resolution);
  if(result.kind==='error'){
    message='Couldn’t resolve that answer. No strike. Please retry.'; // Preserve exact phrase and turn.
  }else if(result.kind==='ambiguous'){
    message='Make that a little clearer. Give one answer. No strike.';
  }else if(result.kind==='already'){
    phrase='';message='Already found. Your turn — try another answer.';
  }else if(result.kind==='match'){
    phrase='';message=`${state.boards[state.round].concepts[result.index].label} · ${result.value} points for ${names[result.player]}.`;
    render({flash:result.index,scores,active:previous});tone('success');lightCrowd(result.value,result.player);
    // Reveal, then transfer, then advance the score and turn light.
    await pause(reduced()?80:260);fly(result.index,result.player,result.value);await pause(reduced()?80:400);
    renderPlayers(state.scores,previous);$(`#player-${result.player} .score`).classList.add('bump');
    await pause(reduced()?50:330);
  }else{
    phrase='';message=`${pass?'Passed. One strike.':'Not on this board.'}${result.out?` ${names[result.player]}: Out this round.`:''}`;
    tone('strike');render({active:previous});await pause(reduced()?80:350);
  }
  busy=false;render();
  if(state.phase==='playing'){if(state.active!==previous)tone('handoff');focusAnswer();}
  else $('#dock button')?.focus({preventScroll:true});
}
$('#dock').addEventListener('click',async e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;if(!action||busy)return;
  if(action==='start'||action==='again')await start();
  else if(action==='pass')await submit(true);
  else if(action==='reveal'||action==='reveal-all'){
    const missing=state.revealed.flatMap((r,i)=>r?[]:[i]),index=action==='reveal-all'?missing:missing[0];revealMissed(state,action==='reveal-all');
    message=state.phase==='roundEnd'?'Every answer is now visible. Unclaimed answers earn no points.':'Unclaimed answer — no points awarded.';
    render({flash:index});$('#dock button')?.focus({preventScroll:true});
  }else if(action==='next'){
    nextRound(state);
    if(state.phase==='final'){message=winner(state)===null?'Equal scores. A shared finish.':`${names[winner(state)]} predicted the crowd best.`;render();tone('final');lightCrowd(75,winner(state));$('#dock button')?.focus({preventScroll:true});}
    else await openRound();
  }else if(action==='finish')location.href=new URL('../index.html',location.href).href;
});
render();
