import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boards,legacyBoards } from '../content.mjs';
import {resolveAnswer,createMatch,applyResolution,revealMissed,nextRound,winner,chooseBoards} from '../engine.mjs';

const source = JSON.parse(readFileSync(new URL('./season26-six-answer-raw.json', import.meta.url), 'utf8'));
test('authored aliases resolve to exactly their own concepts',()=>{
  for(const b of legacyBoards)for(const [i,c] of b.concepts.entries())for(const a of c.aliases)assert.deepEqual(resolveAnswer(b,a),{kind:'match',index:i},`${b.id}: ${a}`);
});
test('paraphrases, punctuation, typo, near misses and neighbouring concepts',()=>{
  const b=legacyBoards[0];
  for(const [phrase,index] of [[' MY KEYS! ',0],['I think it is a mobile phone',1],['phoen',1],['walelt',3],['something to unlock the door',0],['the cable for charging my phone',2],['People forget their phone',1]])assert.deepEqual(resolveAnswer(b,phrase),{kind:'match',index},phrase);
  for(const phrase of ['money','handbag','phone case','contact lenses','battery','a key card','monkey','headphones','phone repair','not a phone','keyboard'])assert.equal(resolveAnswer(b,phrase).kind,'miss',phrase);
  for(const phrase of ['keys or phone','keys, umbrella','phone and headphones','something','either keys or money'])assert.equal(resolveAnswer(b,phrase).kind,'ambiguous',phrase);
  assert.equal(resolveAnswer(legacyBoards[4],'granola').index,2);assert.equal(resolveAnswer(legacyBoards[4],'oatmeal').index,5);
  assert.equal(resolveAnswer(legacyBoards[1],'bike').kind,'miss');assert.equal(resolveAnswer(legacyBoards[3],'bark').kind,'miss');
  const collision=structuredClone(b);collision.concepts[0].aliases.push('phony');assert.throws(()=>resolveAnswer(collision,'phonc'));
  assert.throws(()=>resolveAnswer(null,'phone'));
});
test('successful discovery, already-found, ambiguity and failure preserve fair state',()=>{
  const s=createMatch(legacyBoards.slice(0,3));assert.equal(s.active,1);s.starter=s.active=0;
  applyResolution(s,{kind:'match',index:0});assert.deepEqual(s.scores,[34,0]);assert.equal(s.active,1);
  const before=structuredClone(s);
  assert.equal(applyResolution(s,resolveAnswer(legacyBoards[0],'house keys')).kind,'already');
  for(const kind of ['ambiguous','error'])applyResolution(s,{kind});assert.deepEqual(s,before);
  applyResolution(s,{kind:'match',index:1});assert.deepEqual(s.scores,[34,26]);assert.equal(s.active,0);
});
test('third strike eliminates one player, solo tail continues, missed reveals remain neutral',()=>{
  const s=createMatch(legacyBoards);s.starter=s.active=0;
  for(let i=0;i<5;i++)applyResolution(s,{kind:i%2?'miss':'pass'});
  assert.deepEqual(s.strikes,[3,2]);assert.equal(s.active,1);assert.equal(s.phase,'playing');
  applyResolution(s,{kind:'match',index:0});assert.equal(s.active,1);assert.deepEqual(s.scores,[0,34]);
  applyResolution(s,{kind:'miss'});assert.equal(s.phase,'missed');
  revealMissed(s);assert.deepEqual(s.revealed[1],{owner:null});assert.equal(s.phase,'missed');
  revealMissed(s,true);assert.equal(s.phase,'roundEnd');assert.deepEqual(s.scores,[0,34]);
  nextRound(s);assert.equal(s.active,0);assert.deepEqual(s.strikes,[0,0]);assert.deepEqual(s.contribution,[0,0]);
});
test('three rounds, trailing/tie starters, all found, draw and win',()=>{
  const s=createMatch(legacyBoards);assert.equal(s.starter,1);
  for(let round=0;round<3;round++){
    for(let n=0;n<6;n++)applyResolution(s,{kind:'pass'});
    revealMissed(s,true);nextRound(s);
    if(round<2)assert.equal(s.starter,round===0?0:1);
  }
  assert.equal(s.phase,'final');assert.equal(winner(s),null);
  const win=createMatch(legacyBoards);win.starter=win.active=0;for(let i=0;i<6;i++)applyResolution(win,{kind:'match',index:i});
  assert.equal(win.phase,'roundEnd');assert.deepEqual(win.scores,[58,41]);assert.equal(winner(win),0);nextRound(win);assert.equal(win.starter,1);
});
test('fresh legacyBoards preferred; exhaustion never prevents a full replay',()=>{
  const first=chooseBoards(legacyBoards,[],()=>.4),second=chooseBoards(legacyBoards,first.map(b=>b.id),()=>.4);
  assert.equal(new Set([...first,...second].map(b=>b.id)).size,6);
  assert.equal(chooseBoards(legacyBoards,legacyBoards.map(b=>b.id)).length,3);
});

test('first sourced batch preserves exactly five original Season 26 six-answer records',()=>{
  assert.equal(boards.length,5);
  assert.equal(legacyBoards.length,7);
  assert.deepEqual(boards.map(b=>b.sourceSurveyId),[19,85,111,121,137]);
  assert.equal(new Set([...boards,...legacyBoards].map(b=>b.id)).size,boards.length+legacyBoards.length);
  for(const b of boards){
    const raw=source.find(entry=>entry.id===b.sourceSurveyId);
    assert.ok(raw, b.id);
    assert.equal(b.id, 's26-six-'+String(raw.id).padStart(3,'0'));
    assert.equal(b.kind,'season26');
    assert.equal(b.question,raw.question);
    assert.equal(b.concepts.length,6);
    assert.deepEqual(b.concepts.map(c=>({answer:c.label,points:c.value})),raw.answers);
    assert.equal(b.concepts.reduce((total,c)=>total+c.value,0),raw.total_points);
    assert.ok(b.concepts.every(c=>c.boundary&&Array.isArray(c.excluded)&&Array.isArray(c.rawPhrases)));
  }
});
test('all approved aliases map to one and only one source answer',()=>{
  let accepted=0,excluded=0;
  for(const b of boards)for(const [i,c] of b.concepts.entries()){
    for(const alias of c.aliases){
      assert.deepEqual(resolveAnswer(b,alias),{kind:'match',index:i},b.id+' '+alias);
      accepted++;
    }
    for(const phrase of c.excluded){
      const r=resolveAnswer(b,phrase);
      assert.ok(!(r.kind==='match'&&r.index===i),b.id+' rejects '+phrase+' as '+c.label);
      excluded++;
    }
  }
  assert.ok(accepted>=200);
  assert.ok(excluded>=50);
});
test('conversational forms, British English, near misses and board-specific collisions',()=>{
  const byId=id=>boards.find(b=>b.sourceSurveyId===id);
  const cases=[
    [19,'a daisy',1],[19,'I think it is a lily',2],[19,'petunias',5],
    [85,'a nurse',0],[85,'gp',1],[85,'hospital cleaner',2],[85,'binman',3],[85,'laboratory technician',4],[85,'schoolteacher',5],
    [111,'rattlesnake',0],[111,'a skunk',1],[111,'hammerhead shark',2],[111,'sloths',3],[111,'garden snail',4],[111,'scorpions',5],
    [121,'dog treats',0],[121,'where da cats',1],[121,'buy dog toys',2],[121,'dog parks near me',3],[121,'photos of puppies',4],[121,'fire hydrants',5],
    [137,'look them in the eye',0],[137,'giggle',1],[137,'wave hello',2],[137,"ask why they're staring",3],[137,'avoid eye contact',4],[137,'stick out my tongue',5]
  ];
  for(const [id,phrase,index] of cases)
    assert.deepEqual(resolveAnswer(byId(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrase] of [
    [19,'orchid'],[85,'dentist'],[85,'hospital worker'],[111,'squirrel'],[111,'slug'],
    [121,'cat food'],[121,'food delivery'],[137,'scowl'],[137,'say hello']
  ])assert.equal(resolveAnswer(byId(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [[19,'rose or daisy'],[85,'doctor and nurse'],[111,'snake, shark'],[121,'dog toys and food'],[137,'smile or wave']])
    assert.equal(resolveAnswer(byId(id),phrase).kind,'ambiguous',id+' '+phrase);
  assert.equal(resolveAnswer(byId(85),'nurse').index,0);
  assert.equal(resolveAnswer(byId(85),'doctor').index,1);
  assert.equal(resolveAnswer(byId(137),'stare back').index,0);
  assert.equal(resolveAnswer(byId(137),'look away').index,4);
});
test('three-round matches select sourced boards and never legacy fixtures',()=>{
  const selected=chooseBoards(boards,[],()=>0.37);
  assert.equal(selected.length,3);
  assert.ok(selected.every(b=>b.kind==='season26'));
  const match=createMatch(selected);
  for(let round=0;round<3;round++){
    for(let i=0;i<6;i++)applyResolution(match,resolveAnswer(selected[round],selected[round].concepts[i].label));
    assert.equal(match.phase,'roundEnd');
    if(round<2)nextRound(match);
  }
  nextRound(match);
  assert.equal(match.phase,'final');
  assert.equal(match.scores.reduce((sum,x)=>sum+x,0),selected.reduce((sum,b)=>sum+b.concepts.reduce((s,c)=>s+c.value,0),0));
});
