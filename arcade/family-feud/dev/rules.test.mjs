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

test('first nine sourced batches preserve forty-five original Season 26 six-answer records',()=>{
  assert.equal(boards.length,45);
  assert.equal(legacyBoards.length,7);
  assert.deepEqual(boards.map(b=>b.sourceSurveyId),[19,85,111,121,137,3,61,117,136,151,35,50,54,92,104,21,107,135,144,153,8,12,72,147,159,40,82,118,130,152,26,36,64,91,141,39,58,62,74,109,6,70,131,139,143]);
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
