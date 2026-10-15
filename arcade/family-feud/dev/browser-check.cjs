const {chromium}=require(process.env.FF_PLAYWRIGHT || 'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const {boards}=await import(pathToFileURL(path.resolve(__dirname,'../content.mjs')));
 const browser=await chromium.launch({headless:true,...(process.env.FF_BROWSER?{executablePath:process.env.FF_BROWSER}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const dir=path.resolve(__dirname,'evidence');fs.mkdirSync(dir,{recursive:true});
 const url='http://127.0.0.1:4177/arcade/family-feud/';
 await page.goto(url);
 await page.getByRole('button',{name:'Start Match',exact:true}).waitFor();
 await page.screenshot({path:path.join(dir,'entrance-1280.png')});
 console.log('entrance',await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,stage:document.querySelector('#stage').getBoundingClientRect().toJSON()})));
 await page.setViewportSize({width:1024,height:768});await page.screenshot({path:path.join(dir,'entrance-1024.png')});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),768);await page.setViewportSize({width:1280,height:720});
 await page.getByRole('button',{name:'Start Match',exact:true}).click();
 await page.getByRole('textbox',{name:'Your answer'}).waitFor();
 await page.waitForFunction(()=>!document.querySelector('#answer').disabled);
 await page.screenshot({path:path.join(dir,'gameplay-1280.png')});
 console.log('gameplay',await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,question:document.querySelector('#heading').innerText})));
 await page.setViewportSize({width:1024,height:768});
 await page.screenshot({path:path.join(dir,'gameplay-1024.png')});
 console.log('1024',await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight})));
 async function fits(){
  const result=await page.evaluate(()=>{
   const selectors=['.question','.board','#player-0','#player-1','#dock','#feedback'];
   return {scroll:document.documentElement.scrollHeight,height:innerHeight,visible:selectors.every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;})};
  });assert.ok(result.visible,JSON.stringify(result));assert.equal(result.scroll,result.height);
 }
 async function ready(){await page.waitForFunction(()=>document.querySelector('#answer')&&!document.querySelector('#answer').disabled);}
 async function answer(value){await ready();await page.getByRole('textbox',{name:'Your answer'}).fill(value);await page.getByRole('button',{name:'Submit Answer',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#answer')||!document.querySelector('#answer').disabled);}
 async function board(){const question=await page.locator('#heading h1').innerText();return boards.find(b=>b.question===question);}
 const active=()=>page.locator('.contestant.active .name').innerText();
 await fits();assert.deepEqual(await page.locator('.answer').allTextContents(),Array(6).fill(''));
 const b=await board(),before=await active();
 await answer('keys or phone');assert.match(await page.locator('#feedback').innerText(),/clearer/);assert.equal(await active(),before);
 await ready();await page.getByRole('textbox',{name:'Your answer'}).fill(b.concepts[0].aliases[1]);await page.getByRole('button',{name:'Submit Answer',exact:true}).click();
 await page.locator('.just-revealed').waitFor();await page.waitForTimeout(200);await page.screenshot({path:path.join(dir,'reveal-in-motion-1024.png')});await ready();assert.equal(await page.locator('.revealed').count(),1);
 await page.screenshot({path:path.join(dir,'correct-reveal-1024.png')});
 const after=await active();assert.notEqual(after,before);
 await answer(b.concepts[0].label);assert.match(await page.locator('#feedback').innerText(),/Already found/);assert.equal(await active(),after);
 await answer('a quantum teleportation machine');assert.match(await page.locator('#feedback').innerText(),/Not on this board/);
 // One contestant is eliminated first; the remaining contestant can still score.
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'Pass',exact:true}).click();await page.waitForTimeout(750);}
 assert.equal(await page.locator('.contestant.out').count(),1);await answer(b.concepts[1].label);assert.equal(await page.locator('.revealed').count(),2);
 await page.screenshot({path:path.join(dir,'solo-tail-1024.png')});
 await page.getByRole('button',{name:'Pass',exact:true}).click();await page.getByRole('button',{name:'Reveal Next',exact:true}).waitFor();
 await page.getByRole('button',{name:'Reveal Next',exact:true}).click();assert.equal(await page.locator('.unclaimed').count(),1);
 await page.getByRole('button',{name:'Reveal All',exact:true}).click();await fits();
 await page.waitForTimeout(450);await page.screenshot({path:path.join(dir,'round-complete-1024.png')});
 for(let r=1;r<3;r++){
  await page.getByRole('button',{name:'Next Round',exact:true}).click();await ready();const current=await board();
  for(const c of current.concepts)await answer(c.label);
 }
 await page.getByRole('button',{name:'Final Result',exact:true}).click();assert.match(await page.locator('#board h2').innerText(),/wins|draw/);await fits();
 await page.screenshot({path:path.join(dir,'final-1024.png')});
 await page.getByRole('button',{name:'Play Again',exact:true}).click();await ready();
 // Entire second match with passes gives a draw; unseen boards are preferred.
 const second=[];
 for(let r=0;r<3;r++){
  second.push((await board()).id);
  for(let i=0;i<6;i++){await page.getByRole('button',{name:'Pass',exact:true}).click();await page.waitForTimeout(750);}
  await page.getByRole('button',{name:'Reveal All',exact:true}).click();
  await page.getByRole('button',{name:r===2?'Final Result':'Next Round',exact:true}).click();if(r<2)await ready();
 }
 assert.match(await page.locator('#board h2').innerText(),/draw/);assert.ok(!second.includes(b.id));
 await page.screenshot({path:path.join(dir,'draw-1024.png')});
 await page.getByRole('button',{name:'Finish',exact:true}).click();await page.waitForURL('**/arcade/index.html');
 // Inject a single resolver outage at the module boundary, never via a game UI control.
 await page.route('**/family-feud/engine.mjs',async route=>{
  const response=await route.fetch();let text=await response.text();text=text.replace('export function resolveAnswer(board, phrase) {','let failOnce=true; export function resolveAnswer(board, phrase) { if(failOnce){failOnce=false;throw new Error("Test outage");}');await route.fulfill({response,body:text});
 });
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.setViewportSize({width:1280,height:720});
 await page.screenshot({path:path.join(dir,'entrance-reduced-1280.png')});await fits();
 await page.getByRole('button',{name:'Start Match',exact:true}).click();await ready();const retry=await board(),same=await active();
 const exact='  '+retry.concepts[0].label+'!  ';await answer(exact);
 assert.match(await page.locator('#feedback').innerText(),/Couldn’t resolve/);assert.equal(await page.locator('#answer').inputValue(),exact);assert.equal(await active(),same);assert.equal(await page.locator('.strike.used').count(),0);
 await page.screenshot({path:path.join(dir,'resolver-retry-1280.png')});
 await page.getByRole('button',{name:'Submit Answer',exact:true}).click();await ready();assert.equal(await page.locator('.revealed').count(),1);await fits();
 assert.deepEqual(errors,[]);
 console.log('errors',errors);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
