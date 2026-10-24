import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { boards,legacyBoards } from '../content.mjs';
import { season25Boards } from '../content-season25.mjs';
import { editorialReview,playableBoards } from '../editorial.mjs';
import {resolveAnswer,createMatch,applyResolution,revealMissed,nextRound,winner,chooseBoards} from '../engine.mjs';

const source = JSON.parse(readFileSync(new URL('./season26-six-answer-raw.json', import.meta.url), 'utf8'));
const source25 = JSON.parse(readFileSync(new URL('./season25-six-answer-raw.json', import.meta.url), 'utf8'));
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

test('first twenty sourced batches preserve one hundred original Season 26 six-answer records',()=>{
  assert.equal(boards.length,100);
  assert.equal(legacyBoards.length,7);
  assert.deepEqual(boards.map(b=>b.sourceSurveyId),[19,85,111,121,137,3,61,117,136,151,35,50,54,92,104,21,107,135,144,153,8,12,72,147,159,40,82,118,130,152,26,36,64,91,141,39,58,62,74,109,6,70,131,139,143,29,60,89,128,145,27,57,67,99,129,14,31,48,76,98,24,41,79,90,155,4,9,18,77,134,10,114,115,140,161,33,51,94,97,123,13,44,88,95,158,7,28,38,47,81,46,56,66,100,160,1,59,110,119,154]);
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

test('Season 25 research source remains complete and Batches 21 and 22 retain original six answers',()=>{
  assert.equal(source25.length,162);
  assert.deepEqual(source25.map(x=>x.id),Array.from({length:162},(_,i)=>i+162));
  assert.ok(source25.every(x=>typeof x.question==='string'&&x.question.length>12&&x.answers?.length===6));
  // The original source itself prints 70 for #306 although its answer points add to 80.
  const totalMismatches=source25.filter(x=>x.answers.reduce((sum,a)=>sum+a.points,0)!==x.total_points).map(x=>x.id);
  assert.deepEqual(totalMismatches,[306]);
  assert.equal(source25.find(x=>x.id===306).total_points,70);
  const screened=[183,187,188,252,282,172,205,224,256,273];
  assert.deepEqual(season25Boards.map(b=>b.sourceSurveyId),screened);
  for(const b of season25Boards){
    const original=source25.find(x=>x.id===b.sourceSurveyId);
    assert.ok(original,b.id);
    assert.equal(b.kind,'season25');
    assert.equal(b.sourceSeason,25);
    assert.equal(b.sourceOrdinal,b.sourceSurveyId-161);
    assert.equal(b.sourceUrl,'https://mstiescott.neocities.org/feud25_6');
    assert.equal(b.id,'s25-six-'+String(b.sourceOrdinal).padStart(3,'0'));
    assert.equal(b.question,original.question);
    assert.equal(b.originalWording,original.question);
    assert.deepEqual(b.concepts.map(c=>({answer:c.label,points:c.value})),original.answers);
    assert.equal(b.concepts.length,6);
    for(const [i,c] of b.concepts.entries()){
      for(const alias of c.aliases) assert.deepEqual(resolveAnswer(b,alias),{kind:'match',index:i},b.id+' alias '+alias);
      for(const x of c.excluded) assert.ok(resolveAnswer(b,x).index!==i,b.id+' exclusion '+x);
    }
  }
  assert.ok(season25Boards.every(b=>playableBoards.some(a=>a.id===b.id)));
});

test('Batch 22 has fair recognition boundaries for each of its six original answers',()=>{
  const examples=[
    [172,['garlic cloves','move away','a crucifix','wooden stake','a blood bag','change the locks']],
    [205,['my wife','photos of myself','my kids','my mother','my brother','my cat']],
    [224,['emergency siren','extension ladder','paint it red','water hose','fire department logo','a dalmatian']],
    [256,['the incredible hulk','the grinch','shrek the ogre','kermit the frog','jolly green giant','dc green lantern']],
    [273,['pay off bills','invest money','buy a house','a holiday','quit my job','give the money to charity']],
  ];
  for(const [id,phrases] of examples){
    const b=season25Boards.find(x=>x.sourceSurveyId===id);
    assert.ok(b,'Batch 22 board exists: '+id);
    for(let i=0;i<6;i++)assert.deepEqual(resolveAnswer(b,phrases[i]),{kind:'match',index:i},id+' '+phrases[i]);
  }
});

test('default pool includes only explicitly approved classroom-ready boards',()=>{
  const approved=new Set(editorialReview.approvedSourceIds);
  const held=new Set(Object.keys(editorialReview.heldReasons).map(Number));
  assert.equal(boards.length,100);
  assert.equal(approved.size,70);
  assert.equal(held.size,40);
  assert.equal(new Set([...approved,...held]).size,boards.length+season25Boards.length);
  for(const b of [...boards,...season25Boards]){
    assert.ok(approved.has(b.sourceSurveyId)!==held.has(b.sourceSurveyId),b.id+' requires one editorial decision');
    if(held.has(b.sourceSurveyId))assert.ok(editorialReview.heldReasons[b.sourceSurveyId].length>15);
  }
  assert.deepEqual(new Set(playableBoards.map(b=>b.sourceSurveyId)),approved);
  for(const id of [1,6,7,8,10,14,18,24,26,28,38,41,44,46,47,50,51,56,59,66,67,74,79,88,90,91,94,97,98,110,119,123,134,139,151,152,154,155,160,161])
    assert.ok(!playableBoards.some(b=>b.sourceSurveyId===id),'Held survey '+id);
  for(const id of [4,9,12,21,27,35,36,39,60,61,64,70,76,77,81,92,95,99,100,107,109,114,115,117,129,130,131,140,147,159]) assert.ok(playableBoards.some(b=>b.sourceSurveyId===id),'Reapproved '+id);
  for(const random of [()=>0,()=>.3,()=>.7,()=>.99]){
    const matchBoards=chooseBoards(playableBoards,[],random);
    assert.equal(matchBoards.length,3);
    assert.ok(matchBoards.every(b=>approved.has(b.sourceSurveyId)));
  }
  assert.equal(approved.has(999),false); // A future new survey is not approved implicitly.
});

test('all approved aliases map to one and only one source answer',()=>{
  let accepted=0,excluded=0;
  for(const b of [...boards,...season25Boards])for(const [i,c] of b.concepts.entries()){
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
  assert.ok(accepted>=650);
  assert.ok(excluded>=300);
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
test('Batch 2 natural guesses, boundary cases and multi-answer rejection',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [[3,["feeling scrambled","easygoing","hard-boiled","sunny side up","devilish","my brain is fried"]],[61,["family emergency","desperate for the loo","i didn't know i was speeding","late for my shift","the throttle jammed","anniversary dinner"]],[117,["a draw bridge","torture chamber","watchtower","no indoor plumbing","knights in armour","a pet dragon"]],[136,["when will i be born","what's for dinner","have you picked my name","are you my mum","what's that sound","where am i"]],[151,["screech owl","yowling cat","a laughing hyena","braying","chimpanzee","humpback whale"]]]){
    for(const [index,phrase] of samples.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  }
  for(const [id,phrase] of [[3,"poached"],[3,"omelette"],[61,"late for a flight"],[61,"brakes failed"],[117,"swimming pool"],[117,"dragon statue"],[136,"who is my dad"],[136,"am i hungry"],[151,"dolphin"],[151,"horse"]])assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [[3,"scrambled or fried"],[61,"toilet or emergency"],[117,"knights and dragons"],[136,"where am i or when do i get out"],[151,"cat and hyena"]])assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});
test('Batch 3 realistic guesses, boundaries and multiple-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [[35,["an ex's face","outgrew it","botched tattoo","a typo","skin got wrinkly","job interview"]],[50,["caught red handed","no valuables","guard dog bit him","someone was home","security cameras","shot in the leg"]],[54,["new iphone","spending money","playstation","my first car","new jeans","airpods"]],[92,["keys to the cage","bolt cutters","a sword","rope ladder","blueprint","food for the journey"]],[104,["bar bouncer","umpire","policewoman","barmaid","shopping mall security","headteacher"]]]){
    for(const [index,phrase] of samples.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  }
  for(const [id,phrase] of [[35,"i regret it"],[35,"current boyfriend"],[50,"the house was empty"],[50,"shot at"],[54,"gift card"],[54,"headset"],[92,"escape plan"],[92,"compass"],[104,"coach"],[104,"hotel doorman"]])assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [[35,"my ex or job"],[50,"dog bite or no loot"],[54,"phone and clothes"],[92,"rope or keys"],[104,"bouncer and bartender"]])assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});
test('Batch 4 natural guesses, exclusions and multiple-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [
    [21,["i smell bad","i talk too much","i bully my colleagues","they got sacked","my lunch smells awful","my desk is messy"]],
    [107,["letting one rip","crying baby","belching","ambulance siren","someone bangs on the door","phone notification"]],
    [135,["its own postcode","a lazy river","guest cottage","shopping centre","private jet","a screening room"]],
    [144,["oral surgeon","hand jewellery model","nail salon worker","blackjack dealer","sleight of hand artist","bsl interpreter"]],
    [153,["drive a truck","put on a jumper","drink from a glass","fit through a doorway","rest my head on a pillow","bend down to kiss"]]
  ]) for(const [index,phrase] of samples.entries())
    assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrase] of [
    [21,"they resigned"],[21,"i got fired"],[21,"i eat lunch"],[21,"i am disorganised"],
    [107,"a door creaks"],[107,"sneezing"],[107,"a radio"],[107,"fire alarm"],
    [135,"swimming pool"],[135,"big tv"],[135,"guest bedroom"],[135,"airport terminal"],
    [144,"nurse"],[144,"pedicurist"],[144,"fashion model"],[144,"spoken language translator"],
    [153,"ride a bike"],[153,"cooking"],[153,"open a door"],[153,"hug"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [
    [21,"i stink or i talk too much"],
    [107,"fart or burp"],
    [135,"guest house or cinema"],
    [144,"hand model or magician"],
    [153,"eat or sleep"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 5 everyday guesses, alternative phrasing, exclusions and multiple guesses',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [
    [8,["a new iphone","underwear","her contact details","gold bracelet","a clutch purse","car key"]],
    [12,["drink through a straw","kiss my partner","whistle a tune","have a conversation","play the trumpet","grin"]],
    [72,["the waiting room","consultation fee","rushed appointment","no empathy","their hands feel like ice","wrong diagnosis"]],
    [147,["let one rip","check social media","pick a bogey","drop the f bomb","go to the loo","light up a cigar"]],
    [159,["flutter my eyelids","take a deep breath","check whatsapp","take a few steps","say bad words","passing wind"]]
  ]) for(const [index,phrase] of samples.entries())
    assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrase] of [
    [8,"phone charger"],[8,"flip flops"],[8,"shopping bag"],[8,"watch strap"],
    [12,"hug"],[12,"sing"],[12,"laugh"],[12,"play piano"],
    [72,"expensive parking"],[72,"cold stethoscope"],[72,"nurse is inexperienced"],[72,"insurance paperwork"],
    [147,"vaping"],[147,"blow your nose"],[147,"chew gum"],[147,"drink coffee"],
    [159,"make a phone call"],[159,"rub eyes"],[159,"sigh"],[159,"burp"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [
    [8,"phone or wallet"],
    [12,"whistle and smile"],
    [72,"waiting time or high fees"],
    [147,"fart or use my phone"],
    [159,"blink or breathe"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
  assert.deepEqual(resolveAnswer(get(8),"phone number"),{kind:'match',index:2});
  assert.deepEqual(resolveAnswer(get(8),"phone"),{kind:'match',index:0});
  assert.deepEqual(resolveAnswer(get(72),"rushes me"),{kind:'match',index:2});
  assert.deepEqual(resolveAnswer(get(72),"long wait"),{kind:'match',index:0});
});

test('Batch 6 guessable answers, natural expressions, exclusions and multi-answer rejection',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [
    [40,["a stetson","cowgirl boots","a pony","texas longhorn","western saddle","a map of the state of texas"]],
    [82,["a massage therapist","oral surgeon","hair colourist","someone who cracks your back","tattooist","personal trainer"]],
    [118,["a bus seat","sole of a shoe","stuck in someone's hair","under a desk","back of my trousers","toilet seat"]],
    [130,["my teenager","my girlfriend","my twin sister","my manager","my best friend","my hamster"]],
    [152,["the lift goes down","sunset","temperature drops","raindrops falling","swallow a drink","a submersible"]]
  ]) for(const [index,phrase] of samples.entries())
    assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrase] of [
    [40,"horseshoe"],[40,"spurs"],[40,"american flag"],[40,"buffalo"],
    [82,"nurse"],[82,"manicurist"],[82,"body piercer"],[82,"physiotherapist"],
    [118,"bathroom floor"],[118,"pillow"],[118,"carpet"],[118,"hat"],
    [130,"my mother"],[130,"my father"],[130,"a stranger"],[130,"my teacher"],
    [152,"a staircase"],[152,"the moon"],[152,"snow"],[152,"sinking ship"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrase] of [
    [40,"horse or saddle"],
    [82,"massage therapist and tattoo artist"],
    [118,"chair or toilet"],
    [130,"boss or sister"],
    [152,"rain or temperature"]
  ]) assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
  assert.deepEqual(resolveAnswer(get(118),"toilet seat"),{kind:'match',index:5});
  assert.deepEqual(resolveAnswer(get(118),"seat"),{kind:'match',index:0});
  assert.deepEqual(resolveAnswer(get(40),"texas longhorn"),{kind:'match',index:3});
  assert.deepEqual(resolveAnswer(get(40),"texas"),{kind:'match',index:5});
});


test('Batch 7 natural guesses, exclusions, neighbouring concepts and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [[26,["blood everywhere","a severed arm","someone threw up","a puddle of urine","rats running around","piles of rubbish"]],[36,["his grin","six pack","dress sense","the way he stands","his beard","nice fragrance"]],[64,["growing a coat of fur","he howls","fingernails growing","sharp canines","biting strangers","his shirt is torn"]],[91,["a stick of deodorant","an electric toothbrush","shower gel","prophylactic","men's fragrance","bog roll"]],[141,["riding a horse","on a motorbike","a limousine","riding a unicycle","kick scooter","atop an elephant"]]])for(const [index,phrase] of samples.entries())
    assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[26,["a syringe","unconscious patient","wheelchair","broken tiles"]],[36,["his personality","his accent","his voice","his jewellery"]],[64,["growling","a full moon","a wolf costume","a tail"]],[91,["mouthwash","dental floss","lubricant","air freshener"]],[141,["a camel","horse carriage","skateboard","mobility scooter","tricycle"]]])for(const phrase of phrases)
    assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[26,["blood or vomit","rats and rubbish"]],[36,["his eyes or his hair","clothes and posture"]],[64,["fangs or claws","howling and biting"]],[91,["toothpaste or soap","cologne and deodorant"]],[141,["horse or elephant","bike and scooter"]]])for(const phrase of phrases)
    assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
  for(const [id,phrase,index] of [[36,'his walk',3],[36,'muscles',1],[64,'sharp teeth',3],[64,'he bites',4],[91,'deodorant',0],[91,'aftershave',4],[141,'bike',3],[141,'motorbike',1],[141,'electric scooter',4]])
    assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
});

test('Batch 8 natural guesses, exclusions and one-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,samples] of [[39,["working at christmas","his beer belly","the north pole","hanging out with elves","toys everywhere","his red suit"]],[58,["freezing weather","waddling on ice","eating raw fish","melting ice","looking like a waiter","swimming in the ocean"]],[62,["sniffing","balance glasses on your nose","snoring","blow your nose","wear a nose ring","sneeze properly"]],[74,["pet rabbit","magic stick","his cape","magic coin","stage assistant","illusion secrets"]],[109,["a baby onesie","baby cot","baby nappies","home pregnancy test","parenting tips","baby name ideas"]]])
    for(const [index,phrase] of samples.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,samples] of [[39,["reindeer","he is always late","cookies","expensive sleigh","christmas pudding"]],[58,["being unable to fly","hunting seals","eating squid","laying eggs"]],[62,["wear earrings","cough","wear contact lenses","taste"]],[74,["playing cards","a dove","poker chips","a ticket to the show"]],[109,["baby stroller","an ultrasound","ovulation test","children's storybooks"]]])
    for(const phrase of samples)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,samples] of [[39,["big belly or elves","north pole and toys"]],[58,["waddling or swimming","cold and global warming"]],[62,["sneeze or sniff","glasses and nose ring"]],[74,["rabbit or wand","cash and secrets"]],[109,["crib or nappies","pregnancy test and baby names"]]])
    for(const phrase of samples)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 9 natural guesses, boundaries and multiple-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[6,["she snores","binge watching","read a bedtime story","keeps socks on","drools in her sleep","eating chocolate in bed"]],[70,["snogging","eating a sandwich","posing for photos","selling tickets","using a payphone","casting my vote"]],[131,["fell asleep","interrupting the judge","passing wind","burst out laughing","throw up","photograph the trial"]],[139,["impulse shopping","drinking wine","overeating","rambling","overthinking","weeping"]],[143,["cockroaches","rattlesnake","a sewer rat","a skunk","soil tracked in","trash panda"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[6,["sleeping","talk in her sleep","wear pyjamas","sweat","drinking water"]],[70,["hug","playing video games","looking at photos","selling online","checking messages"]],[131,["yawn","being bored","belch","silently smile","checking messages"]],[139,["saving money","smoking","cooking","listening","feeling sad"]],[143,["lizard","squirrel","smell","garbage","a stray dog"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[6,["snoring and drooling","reading or watching television"]],[70,["kissing or eating","buying stuff and voting"]],[131,["slept or laughed","talking and farting"]],[139,["eating or drinking","shopping and worrying"]],[143,["rats or spiders","snake and raccoon"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 10 natural guesses, exclusion boundaries and multi-answer attempts',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[29,["squeezing a tube of toothpaste","juice from a lemon","squeeze some ketchup","popping spots","water out of a towel","squeeze water out of sponge"]],[60,["i adore you","you look fantastic","thanks for all you do","let's hit the shops","i'll hoover","want to see a film"]],[89,["a wagging tail","cold wet nose","walking harness","my feeding bowl","dog mattress","woofing"]],[128,["three meals a day","somewhere to live","having a mum and dad","clothes on your back","annoying sister","common sense"]],[145,["heart surgeon","drain specialist","local councillor","nuclear reactor operator","sous chef","airline pilot"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[29,["shampoo","squeezing toothpaste from a toothbrush","tomatoes","sweat","rubber duck"]],[60,["i'm sorry","you are clever","a new car","i'll cook at home","i bought eggs"]],[89,["paws","whiskers","kennel outdoors","dog toys","a human bed"]],[128,["a car","an education","grandparents","school bag","friends"]],[145,["nurse","electrician","judge","ordinary engineer","waiter"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[29,["toothpaste or ketchup","washcloth and sponge"]],[60,["love you or thank you","shopping and cleaning"]],[89,["bark or tail","leash and bowl"]],[128,["food or house","parents and siblings"]],[145,["doctor or pilot","plumber and chef"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 11 natural guesses, boundary exclusions and multiple-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[27,["his ginger hair","he is a clown","big clown shoes","loves big macs","penny pincher","clown nose"]],[57,["meddle in my business","smell the roses","blow their nose in a tissue","inside the fridge","sniffing sweaty armpits","aromatherapy candle"]],[67,["dating the same person","swapping outfits","sharing a toothbrush","sleep in the same bed","sharing a sandwich","sharing bathwater"]],[99,["a big kiss","drinking from a cup","blowing a trumpet","apple bobbing game","applying lip gloss","smiling for pictures"]],[129,["at a job interview","at the supermarket","at mass","in a toilet cubicle","in a rideshare","on my first date"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[27,["he is tall","he is a firefighter","has a beard","his red suit","wears glasses"]],[57,["a suitcase","the oven","a toilet roll","air freshener","someone else's lunch"]],[67,["a pet dog","their education","toothpaste","a bathroom","a shared car"]],[99,["singing","playing the flute","eating apples","putting on mascara","hugging"]],[129,["on a bus","at a beach","in my living room","on an airplane","in a park"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[27,["red hair or red nose","big feet and likes burgers"]],[57,["flowers or candles","fridge and tissue"]],[67,["clothes or food","toothbrush and bath"]],[99,["kissing or smiling","trumpet and lipstick"]],[129,["at work or in the shop","car and restaurant"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 12 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[14,["her flying umbrella","bottomless bag","hat with flowers","her skirt","a posh english voice","be able to sing"]],[31,["foot odour spray","put on some socks","men's fragrance","deodorant stick","rub lotion on his feet","bicarbonate of soda"]],[48,["brush my teeth","comb my hair","my filthy toilet","shower tiles","washing up sink","groom my dog"]],[76,["tay tay","queen bey","cher","mother monster","adele adkins","titanic song singer"]],[98,["an absolute loser","really lame","lazybones","compulsive liar","loudmouth","my secret lover"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[14,["a wand","american accent","briefcase","guitar","parachute"]],[31,["baking powder","wash his feet","new insoles","shampoo","foot bath"]],[48,["cat fur","carpet","floor mop","a garden hose","bathroom mirror"]],[76,["rihanna","dua lipa","madonna","mariah carey","shakira"]],[98,["stupid","bossy","greedy","late","incompetent"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[14,["umbrella or hat","bag and dress"]],[31,["foot powder or deodorant","socks and cologne"]],[48,["teeth or hair","shower and sink"]],[76,["taylor or beyonce","adele and cher"]],[98,["loser or liar","lazy and loud"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 13 natural guesses, neighbour exclusions and multi-answer attempts',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[24,["a cheeky wink","flutter my lashes","lock eyes","wiggle eyebrows","widen my eyes","narrow your eyes"]],[41,["grapefruit juice in eye","they bite my hand","choke on a piece","the fruit falls","citrus allergy","they spit it out"]],[79,["wash his false hair","detangle with a comb","hoover the wig","stick hairpiece to head","ditch the hairpiece","puff it up"]],[90,["a pile of paperwork","empty wrappers","a turd","a nasty bug","wilted flowers","an insulting note"]],[155,["big moth","a fat grub","housefly","tarantula","a damselfly","ladybug"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[24,["blinking normally","look away","roll my eyes","cry","look down"]],[41,["a bad taste","spit juice in their face","they burp","i burn the food","it is unripe"]],[79,["cut the toupee","dye the wig","sell it","buy new hair","put on a hat"]],[90,["birthday cake","a healthy plant","a thank you card","an ordinary cup","a work computer"]],[155,["butterfly","ant","bee","mosquito","earthworm"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[24,["wink or stare","bat my eyes and raise an eyebrow"]],[41,["juice or biting","they choke and spit it out"]],[79,["wash or brush","vacuum and glue"]],[90,["trash or poop","a rat and a dead plant"]],[155,["moth or beetle","fly and spider"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 14 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[4,["playing the trumpet","a bass tuba","silver flute","alto sax","a slide trombone","orchestral french horn"]],[9,["spitting sunflower seeds","adjusting his cup","saying bad words","slide into a base","throwing his baseball bat","wearing a baseball hat"]],[18,["he has no hair","his hair is short","too much hair wax","hair is knotted","he pulls away","dry flaky scalp"]],[77,["at the cathedral","school assembly","funeral service","in the playground","wedding reception","at the nursery"]],[134,["a huge belly","feeling bloated","a lovely belly","jiggly belly","belly sticks out","flabby stomach"]]])for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[4,["clarinet","piccolo","bugle","recorder","oboe"]],[9,["dance on the field","take off his cap","catching a cold","walking","cheering"]],[18,["curly hair","he wears sunglasses","lice","grey hair","has a beard"]],[77,["at a nightclub","in the car","concert hall","living room","on headphones"]],[134,["brilliant","blue","boring","bruised","black"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[4,["trumpet or tuba","flute and saxophone"]],[9,["spit or swear","scratch and wear a cap"]],[18,["bald or short hair","dandruff and greasy hair"]],[77,["school or daycare","funeral and wedding"]],[134,["big or bloated","beautiful and bouncy"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 15 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[10,["jump a hurdle","a waist girdle","a little turtle","the name myrtle","the wordle game","fertile land"]],[114,["during mass","at a cemetery","during a business meeting","at the dentist","in a toilet cubicle","at the shops"]],[115,["jingle","the phrase hells bells","the song silver bells","marriage bells","cathedral bells","festive bells"]],[140,["captain crunch","hook from peter pan","steve rogers","bob keeshan","james kirk","jack sparrow"]],[161,["manhattan","music city usa","beverly hills","french capital","london uk","miami beach"]]])for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[10,["purple","burden","curdle","word","tortoise"]],[114,["at the beach","inside a cinema","at a concert","in the park","at a birthday party"]],[115,["telephone bells","school bells","door bells","blue bells","cow bells"]],[140,["captain nemo","captain planet","picard","horatio hornblower","captain marvel"]],[161,["rome","berlin","sydney","tokyo","san francisco"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[10,["hurdle or turtle","girdle and wordle"]],[114,["church or funeral","hospital and shop"]],[115,["jingle bells or silver bells","wedding and christmas bells"]],[140,["captain hook or captain kirk","captain america and captain kangaroo"]],[161,["paris or london","new york and miami"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 16 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[33,["my girlfriend","mum","my work colleague","my bestie","my daughter","my tutor"]],[51,["a band","cocktails","playing games","old family videos","telling jokes","balloons falling on everyone"]],[94,["queen in drag","drag racing cars","the show dragnet","such a drag","a mythical dragon","drag racing track"]],[97,["walking through manhattan","the windy city","the vegas strip","san fran","capital of france","the emerald city in oz"]],[123,["his famous moustache","money symbol","sparkling teeth","shiny bald head","designer suit","family feud sign"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[33,["my neighbour","delivery driver","a barber","my boss","someone on the bus"]],[51,["a cake","flowers","a slideshow of photos","fireworks","party invitations"]],[94,["dragging luggage","rug","dragonfly","drag someone","strip club"]],[97,["london","seattle","rome","los angeles","tokyo"]],[123,["full beard","dancing shoes","bat symbol","glasses","a crown"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[33,["mum or dad","my girlfriend and my teacher"]],[51,["music or jokes","open bar and balloon drop"]],[94,["dragnet or dragon","drag queen and drag race"]],[97,["new york or paris","chicago and vegas"]],[123,["moustache or bald head","suit and dollar sign"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 17 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[13,["the police","CCTV cameras","a be back later sign","his girlfriend","his mum","another thief"]],[44,["bath towel","kitchen roll","his old t shirt","newspaper sheets","serviettes","loo roll"]],[88,["michael","matthew","marcus","maverick","malcolm","mason"]],[95,["crack him open","make a jar of peanut butter","put him in the oven","eat him whole","smash his monocle","rub out his eyes and mouth"]],[158,["puppy love","true love","first love","undying love","mad love","my love"]]])
    for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[13,["an empty safe","a locked vault","a metal detector","a long queue","a barking dog"]],[44,["baby wipe","old socks","printer paper","a plastic bag","cotton wool"]],[88,["micah","martin","maxwell","morgan","miguel"]],[95,["steal his hat","take his cane","divorce him","hide his shoes","throw water on him"]],[158,["unconditional love","family love","platonic love","lost love","tough love"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[13,["police or cameras","wife and mother"]],[44,["towels or paper towels","napkins and toilet paper"]],[88,["mike or matt","malcolm and mason"]],[95,["crack him or roast him","eat him and grind him"]],[158,["puppy or true love","first love and my love"]]])
    for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 18 natural guesses, exclusions and multiple-answer attempts',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[7,["both have a bald head","two men","both celebrities","nice smile","athletic build","well groomed"]],[28,["leftover sandwiches","a cheap bottle of liquor","disposable plates","nothing at all","a bag of ice","kitchen roll"]],[38,["doing swimming lengths","do a cannonball","wee in the pool","floating on my back","nude swimming","doing handstands"]],[47,["behind her ear","from her bra","her handbag","her palm","her ponytail","inside a cake"]],[81,["her wig","her speaking voice","her sharp tongue","small stature","getting older","her court clothes"]]])for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[7,["they are married","both comedians","wear glasses","both athletes","both actors"]],[28,["chocolate cake","a gift card","napkins","party hats","soft drinks"]],[38,["walk in the pool","drink water","eat a sandwich","wear goggles","sit down"]],[47,["from a top hat","in a glass","her shoe","inside a book","from his pocket"]],[81,["gavel","car","surname","dog","shoes"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[7,["bald or famous","clean and muscular"]],[28,["beer or water","cups and paper towels"]],[38,["swim or float","dive and do handstands"]],[47,["ear or hair","dress and purse"]],[81,["hair or robe","age and height"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 19 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[46,["intoxicated","totally nude","laughing loudly","a white suit","running late","high on weed"]],[56,["seeing a doctor","gym changing room","nudist resort","steam room","spray tanning salon","poolside shower"]],[66,["zimmer frame","a dirty bedpan","false teeth thrown","one of the residents","an electric wheelchair","a used nappy"]],[100,["fresh snow","a bowl of white rice","as pale as a ghost","pale as a sheet","white as heck","sliced white bread"]],[160,["empathetic","doing the washing up","always tell the truth","laid back","make better decisions","plan romantic dates"]]])for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[46,["quiet","at noon","wearing red","early","without flowers"]],[56,["at the supermarket","on a bus","dining in a restaurant","at a cinema","in a classroom"]],[66,["a toothbrush","a television","a plate of food","a broom","a football"]],[100,["milk","paper","cloud","chalk","cotton"]],[160,["rich","tall","athletic","funny","famous"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[46,["drunk or stoned","naked and happy"]],[56,["gym or pool","spa and tanning salon"]],[66,["cane or wheelchair","dentures and bedpan"]],[100,["snow or rice","ghost and bread"]],[160,["kind or honest","smart and romantic"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
});

test('Batch 20 natural guesses, exclusions and multi-answer turns',()=>{
  const get=id=>boards.find(b=>b.sourceSurveyId===id);
  for(const [id,phrases] of [[1,["wade into the water","a romantic commitment","armchair","get in a car","start a new job","an exciting story"]],[59,["give her a mint","call it quits","plug my nose","overlook it","let her know","avoid kissing"]],[110,["chilled water","portable air conditioner","cannabidiol","ice cream cones","fireball whiskey","red dress"]],[119,["a bottle of wine","noise cancelling headphones","book a holiday","a day at the spa","box of chocolates","marijuana"]],[154,["i am cheating","i hate my boss","i feel lonely","i robbed a bank","i let one rip","i put on weight"]]])for(const [index,phrase] of phrases.entries())assert.deepEqual(resolveAnswer(get(id),phrase),{kind:'match',index},id+' '+phrase);
  for(const [id,phrases] of [[1,["dancing","swimming lesson","school","a movie","traffic"]],[59,["offer flowers","marry her","eat garlic","cover my eyes","visit a dentist alone"]],[110,["ski passes","winter boots","blue clothes","a hat","televisions"]],[119,["a new television","board games","a book","an umbrella","new shoes"]],[154,["my favourite food","my dog's name","i like summer","where i went today","i am hungry"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'miss',id+' '+phrase);
  for(const [id,phrases] of [[1,["pool or relationship","bed and car"]],[59,["gum or break up","hold nose and tell her"]],[110,["ice or ice cream","alcohol and cannabis"]],[119,["beer or weed","vacation and massage"]],[154,["affair or robbery","sad and farted"]]])for(const phrase of phrases)assert.equal(resolveAnswer(get(id),phrase).kind,'ambiguous',id+' '+phrase);
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
