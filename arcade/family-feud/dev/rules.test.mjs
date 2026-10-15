import test from 'node:test';
import assert from 'node:assert/strict';
import {boards} from '../content.mjs';
import {resolveAnswer,createMatch,applyResolution,revealMissed,nextRound,winner,chooseBoards} from '../engine.mjs';
test('authored aliases resolve to exactly their own concepts',()=>{
  for(const b of boards)for(const [i,c] of b.concepts.entries())for(const a of c.aliases)assert.deepEqual(resolveAnswer(b,a),{kind:'match',index:i},`${b.id}: ${a}`);
});
test('paraphrases, punctuation, typo, near misses and neighbouring concepts',()=>{
  const b=boards[0];
  for(const [phrase,index] of [[' MY KEYS! ',0],['I think it is a mobile phone',1],['phoen',1],['walelt',3],['something to unlock the door',0],['the cable for charging my phone',2],['People forget their phone',1]])assert.deepEqual(resolveAnswer(b,phrase),{kind:'match',index},phrase);
  for(const phrase of ['money','handbag','phone case','contact lenses','battery','a key card','monkey','headphones','phone repair','not a phone','keyboard'])assert.equal(resolveAnswer(b,phrase).kind,'miss',phrase);
  for(const phrase of ['keys or phone','keys, umbrella','phone and headphones','something','either keys or money'])assert.equal(resolveAnswer(b,phrase).kind,'ambiguous',phrase);
  assert.equal(resolveAnswer(boards[4],'granola').index,2);assert.equal(resolveAnswer(boards[4],'oatmeal').index,5);
  assert.equal(resolveAnswer(boards[1],'bike').kind,'miss');assert.equal(resolveAnswer(boards[3],'bark').kind,'miss');
  const collision=structuredClone(b);collision.concepts[0].aliases.push('phony');assert.throws(()=>resolveAnswer(collision,'phonc'));
  assert.throws(()=>resolveAnswer(null,'phone'));
});
test('successful discovery, already-found, ambiguity and failure preserve fair state',()=>{
  const s=createMatch(boards.slice(0,3),()=>0);assert.equal(s.active,0);
  applyResolution(s,{kind:'match',index:0});assert.deepEqual(s.scores,[34,0]);assert.equal(s.active,1);
  const before=structuredClone(s);
  assert.equal(applyResolution(s,resolveAnswer(boards[0],'house keys')).kind,'already');
  for(const kind of ['ambiguous','error'])applyResolution(s,{kind});assert.deepEqual(s,before);
  applyResolution(s,{kind:'match',index:1});assert.deepEqual(s.scores,[34,26]);assert.equal(s.active,0);
});
test('third strike eliminates one player, solo tail continues, missed reveals remain neutral',()=>{
  const s=createMatch(boards,()=>0);
  for(let i=0;i<5;i++)applyResolution(s,{kind:i%2?'miss':'pass'});
  assert.deepEqual(s.strikes,[3,2]);assert.equal(s.active,1);assert.equal(s.phase,'playing');
  applyResolution(s,{kind:'match',index:0});assert.equal(s.active,1);assert.deepEqual(s.scores,[0,34]);
  applyResolution(s,{kind:'miss'});assert.equal(s.phase,'missed');
  revealMissed(s);assert.deepEqual(s.revealed[1],{owner:null});assert.equal(s.phase,'missed');
  revealMissed(s,true);assert.equal(s.phase,'roundEnd');assert.deepEqual(s.scores,[0,34]);
  nextRound(s);assert.equal(s.active,0);assert.deepEqual(s.strikes,[0,0]);assert.deepEqual(s.contribution,[0,0]);
});
test('three rounds, trailing/tie starters, all found, draw and win',()=>{
  const s=createMatch(boards,()=>.9);assert.equal(s.starter,1);
  for(let round=0;round<3;round++){
    for(let n=0;n<6;n++)applyResolution(s,{kind:'pass'});
    revealMissed(s,true);nextRound(s);
    if(round<2)assert.equal(s.starter,round===0?0:1);
  }
  assert.equal(s.phase,'final');assert.equal(winner(s),null);
  const win=createMatch(boards,()=>0);for(let i=0;i<6;i++)applyResolution(win,{kind:'match',index:i});
  assert.equal(win.phase,'roundEnd');assert.deepEqual(win.scores,[58,41]);assert.equal(winner(win),0);nextRound(win);assert.equal(win.starter,1);
});
test('fresh boards preferred; exhaustion never prevents a full replay',()=>{
  const first=chooseBoards(boards,[],()=>.4),second=chooseBoards(boards,first.map(b=>b.id),()=>.4);
  assert.equal(new Set([...first,...second].map(b=>b.id)).size,6);
  assert.equal(chooseBoards(boards,boards.map(b=>b.id)).length,3);
});
