/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Technology & Innovation
  --------------------------------------------------------------------------
  A premium interactive speaking subject for exploring the trades people make
  with the tools they use — what each device gives, what it quietly asks in
  return, and which bargains people defend, refuse, regret, or cannot
  understand in one another. Built for tutor-led conversation, shared-screen
  teaching, real disagreement, cultural reflection, and sharper spoken English.
  Compass active subject · contentVersion 1.0.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/
const MODULE = {
    id: 'technology-innovation',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Technology & Innovation',
    titleHtml: 'Technology &amp; <em>Innovation</em>',
    navTitle: 'Technology',
    bgImage: 'IMAGE_URL_HERE'
};
const subjectCopy = {
    cover: {
        hook: `You made a deal. You just don’t remember signing anything.`
    },
    overview: {
        heading: `The Deal With the Machine`,
        intro: [
            `Every tool we use asks something of us in return for what it gives. A device saves us effort and takes a little skill in exchange; it saves us time and quietly asks for our attention; it makes life easier and makes us harder to reach without it. Most of these trades we never actually decided on — we simply woke up one day already living inside them. Some were clearly worth it. Some we would take back if we could. And some we cannot understand anyone making at all.`
        ],
        question: `When you think about all the technology in your daily life, what’s one piece you’d happily keep forever — and one you’d throw out tomorrow if you could?`
    },
    paths: {
        culturalLensDescription: `How earlier tools reshaped daily life — the manners they forced, the skills they retired, and the futures people guessed wrong.`,
        discussionDescription: `The tools you rely on, resist, and can’t understand in other people — from small daily habits to the lines you won’t cross.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to connect ideas from across the subject.`
    },
    culturalLens: {
        heading: `The Tools Before These`,
        intro: `Every technology in your pocket was once brand new, strange, and a little suspicious. Step back to earlier tools and the moments they changed — how people behaved, what they knew, and what they gave up — often without noticing until it was done.`
    },
    discussion: {
        heading: `The Tools We Live By`
    },
    reflection: {
        title: `Was It Worth It?`,
        summary: `Step back from the particular gadgets and think about the trades underneath them. Notice which ones you’d defend, which you’d undo, and where you and other people simply weigh things differently.`,
        questions: [
            `Across everything we’ve talked about, do the trades we make with technology feel mostly worth it to you — or mostly not?`,
            `What would make you decide a new technology isn’t worth what it asks of you — ideally before you’d already come to rely on it?`
        ]
    },
    keyLanguage: {
        intro: `Natural ways to talk about relying on things, resisting them, and weighing what they’re worth.`
    }
};
const discussionSets = [
    {
        id: 'set-already-handed-over',
        title: `What You’ve Already Handed Over`,
        stage: `React`,
        icon: 'react',
        description: `The reflexes, reliances, and lost skills you only notice once someone points at them.`,
        moments: [
            {
                id: 'moment-morning-reach',
                preview: `The thing your hand does on its own.`,
                question: `There’s usually one thing people reach for the moment they wake up, sit down on a bus, or feel a gap in a conversation. What’s the thing your hand goes to without you deciding — and is there someone you live with whose reach you notice even more than your own?`,
                upgrade: {
                    term: `second nature`,
                    type: `phrase`,
                    definition: `Something you do so automatically that it no longer takes any thought.`,
                    ordinary: `“I check it without even thinking now — my hand’s on it before I’ve noticed.”`,
                    upgraded: `“Checking it has become second nature — my hand’s on it before I’ve noticed.”`,
                    priority: 'standard',
                    atlasPrompt: `What skill has become so second nature to you that you’d struggle to explain it to a beginner?`
                }
            },
            {
                id: 'moment-skill-you-lost',
                preview: `A skill you quietly stopped needing.`,
                question: `What could you once do without help — arithmetic in your head, directions from memory, a dozen phone numbers — that a device now handles for you? Do you miss it, or are you glad to be rid of it — and do you notice it more in someone else?`,
                upgrade: {
                    term: `rusty`,
                    type: `adjective`,
                    definition: `No longer skilled at something because you have not done it for a long time.`,
                    ordinary: `“I used to be quick at mental arithmetic, but I’m really out of practice now.”`,
                    upgraded: `“I used to be quick at mental arithmetic, but I’m really rusty now.”`,
                    priority: 'key',
                    atlasPrompt: `What skill of yours has got rusty from not using it — a language, an instrument, a sport?`
                }
            },
            {
                id: 'moment-wreck-your-week',
                preview: `The one that would wreck your week.`,
                question: `Think about an ordinary day. Which single piece of technology, if it stopped working for a week, would cause you the most trouble — and is it the one you’d expect, or something duller you never think about, like the card reader or the router?`,
                upgrade: {
                    term: `be lost without something`,
                    type: `phrase`,
                    definition: `Unable to cope or function without a particular thing.`,
                    ordinary: `“If the internet goes down, I honestly don’t know what to do with myself.”`,
                    upgraded: `“I’d be completely lost without the internet.”`,
                    priority: 'key',
                    atlasPrompt: `Who or what at work would you be lost without — a colleague, a system, a routine?`
                }
            },
            {
                id: 'moment-thought-it-understood',
                preview: `When it was sure it understood you.`,
                question: `Voice assistants, autocorrect, and “helpful” suggestions get things wrong in very particular ways. What’s the funniest or most annoying thing a device has done because it thought it understood you — one of yours, or one you’ve heard about?`,
                upgrade: {
                    term: `get the wrong end of the stick`,
                    type: `idiom`,
                    definition: `To misunderstand a situation or what someone means.`,
                    ordinary: `“The voice assistant misunderstood me completely and set an alarm for three in the morning.”`,
                    upgraded: `“The voice assistant got the wrong end of the stick and set an alarm for three in the morning.”`,
                    priority: 'standard',
                    atlasPrompt: `When has someone got the wrong end of the stick about something you said? How did you sort it out?`
                }
            },
            {
                id: 'moment-never-mastered',
                preview: `The one you never quite mastered.`,
                question: `Everyone has one piece of technology they’ve never really mastered — the remote with forty buttons, a system at work, an app everyone else finds obvious. What’s yours — or are you the one everyone else comes to for help?`,
                upgrade: {
                    term: `get the hang of something`,
                    type: `phrase`,
                    definition: `To learn how to do something after some practice.`,
                    ordinary: `“I’ve had this remote for years and I still can’t figure out half the buttons.”`,
                    upgraded: `“I’ve had this remote for years and I’ve never got the hang of it.”`,
                    priority: 'key',
                    atlasPrompt: `What took you longest to get the hang of in a job — a task, a tool, an unwritten rule?`
                }
            }
        ],
        makeItReal: {
            title: `The Last Hour`,
            prompt: `Walk back through the last hour and reconstruct every time you reached for a device. For each one, decide honestly: was it for something you actually needed, or just to fill a gap — a wait, a silence, a moment of boredom? What does the honest ratio turn out to be?`
        }
    },
    {
        id: 'set-where-you-draw-the-line',
        title: `Where You Draw the Line`,
        stage: `Explain`,
        icon: 'explain',
        description: `The trades you’d defend, the tools you refuse, and the conveniences you’re not so sure about.`,
        moments: [
            {
                id: 'moment-change-youd-keep',
                preview: `The change you’d never undo.`,
                question: `Not every change is a loss. What’s one piece of modern technology that genuinely made your life better, with nothing you’d want back — the washing machine, video calls with faraway family, a medical device, online maps? Make the case for it — for yourself, or for someone you’ve seen it change things for.`,
                upgrade: {
                    term: `a game changer`,
                    type: `phrase`,
                    definition: `Something that changes a situation completely, usually for the better.`,
                    ordinary: `“Video calls have completely changed things for my family, since we’re spread across three countries.”`,
                    upgraded: `“Video calls have been a game changer for my family, spread as we are across three countries.”`,
                    priority: 'key',
                    atlasPrompt: `What’s been a game changer in how you work or run your home?`
                }
            },
            {
                id: 'moment-line-you-wont-cross',
                preview: `The line you won’t cross.`,
                question: `Some people deliberately say no to a piece of technology everyone around them uses — no smart speaker in the house, no work messages on their phone, cash instead of cards, a paper diary. Is there one you refuse on purpose, or one you quietly admire someone else for refusing? What’s behind it — and does anyone give you a hard time for it?`,
                upgrade: {
                    term: `put your foot down`,
                    type: `idiom`,
                    definition: `To take a firm stand and refuse to change your mind.`,
                    ordinary: `“My father absolutely refuses to bank online, no matter how much we push him.”`,
                    upgraded: `“My father has put his foot down about banking online, no matter how much we push him.”`,
                    priority: 'key',
                    atlasPrompt: `When have you had to put your foot down about something at home or work?`
                }
            },
            {
                id: 'moment-queue-or-holdout',
                preview: `First in the queue, or last?`,
                question: `When a new device or update lands, are you first in the queue for it, or the one still using a cracked phone three years later? And whichever you are, what is it about the opposite habit that you honestly can’t understand?`,
                upgrade: {
                    term: `make do`,
                    type: `phrase`,
                    definition: `To manage with what you have, even though it is not ideal.`,
                    ordinary: `“My laptop is ancient and slow, but I keep managing with it rather than buying a new one.”`,
                    upgraded: `“My laptop is ancient and slow, but I make do.”`,
                    priority: 'key',
                    atlasPrompt: `When have you had to make do with less than you’d have liked — at work, at home, on a trip?`
                }
            },
            {
                id: 'moment-convenience-that-isnt',
                preview: `The “convenience” that isn’t.`,
                question: `A lot of technology promises to save us time or effort, and often it just moves the work somewhere else — self-checkouts, online forms you fill in yourself, putting the furniture together yourself. What’s a “convenience” you think quietly made things worse — and does everyone agree, or do they think you’re being difficult about it?`,
                upgrade: {
                    term: `more trouble than it’s worth`,
                    type: `phrase`,
                    definition: `Needing more effort or causing more problems than the benefit is worth.`,
                    ordinary: `“The self-service tills are supposed to be faster, but they cause so many problems they’re not worth using.”`,
                    upgraded: `“Honestly, the self-service tills are more trouble than they’re worth.”`,
                    priority: 'standard',
                    atlasPrompt: `What job, favour, or arrangement turned out to be more trouble than it was worth?`
                }
            },
            {
                id: 'moment-only-three-survive',
                preview: `Only three survive.`,
                question: `Imagine you had to give up all but three of the digital tools and devices you use — everything else gone tomorrow. Which three survive the cut, and how many of the rest would you honestly not miss?`,
                upgrade: {
                    term: `gather dust`,
                    type: `phrase`,
                    definition: `To be left unused for a long time.`,
                    ordinary: `“I’ve got dozens of apps I downloaded once and never opened again.”`,
                    upgraded: `“I’ve got dozens of apps just gathering dust.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you bought that’s just gathering dust — an appliance, a hobby kit, an exercise machine?`
                }
            }
        ],
        makeItReal: {
            title: `The Line You’d Defend`,
            prompt: `Pick one piece of technology you refuse to use. Now make the strongest possible argument to someone who thinks you’re wrong — not just why it suits you, but why your position is genuinely reasonable. Can you convince them, or at least make them pause?`
        }
    },
    {
        id: 'set-other-peoples-deals',
        title: `The Deals Other People Make`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The habits you can’t fathom in others, the tools that reshaped a home, and what looks different with time.`,
        moments: [
            {
                id: 'moment-cant-make-sense',
                preview: `The habit you can’t make sense of.`,
                question: `We all know someone whose relationship with technology we quietly can’t make sense of — the person who photographs every meal, the relative who prints out emails, the friend who replies to a text with a phone call. Whose habit puzzles you most, and have you ever asked them why they do it?`,
                upgrade: {
                    term: `can’t get your head around something`,
                    type: `phrase`,
                    definition: `To be unable to understand something, however hard you try.`,
                    ordinary: `“I just don’t understand why anyone would print their emails out.”`,
                    upgraded: `“I can’t get my head around why anyone would print their emails out.”`,
                    priority: 'standard',
                    atlasPrompt: `What decision or habit of someone close to you can you not get your head around?`
                }
            },
            {
                id: 'moment-rearranged-the-home',
                preview: `The device that moved the furniture.`,
                question: `A single new device can quietly rearrange a home — the television that decided where everyone sat, the family computer with its queue and its rules, the phone that appeared at the dinner table. What piece of technology changed the shape of a household you knew, and how?`,
                upgrade: {
                    term: `creep in`,
                    type: `phrasal verb`,
                    definition: `To begin to happen or appear gradually, often without being noticed.`,
                    ordinary: `“The phones appeared at the dinner table so gradually that no one noticed it happening.”`,
                    upgraded: `“The phones crept in at the dinner table, and no one noticed.”`,
                    priority: 'standard',
                    atlasPrompt: `What habit or expense has crept into your life without you deciding on it?`
                }
            },
            {
                id: 'moment-resisted-then-needed',
                preview: `Resisted, then couldn’t live without.`,
                question: `Sometimes we resist a technology for years and then can’t imagine life before it — or the opposite: we’re glued to it for a while, then quietly drop it. Which one flipped on you, and what changed — the tool, your life, or just the novelty wearing off?`,
                upgrade: {
                    term: `go off something`,
                    type: `phrasal verb`,
                    definition: `To stop liking something you used to enjoy.`,
                    ordinary: `“I used that fitness app every day for a month, then completely lost interest.”`,
                    upgraded: `“I used that fitness app every day for a month, then went right off it.”`,
                    priority: 'standard',
                    atlasPrompt: `What did you go off after loving it at first — a food, a show, a place, a hobby?`
                }
            },
            {
                id: 'moment-generation-gap',
                preview: `What the other generation doesn’t get.`,
                question: `Every generation has something about its relationship to technology that the one before or after simply doesn’t get — a younger person’s ease with something, an older person’s patience for something, a habit that looks strange from the outside. What’s a gap like that you’ve noticed up close?`,
                upgrade: {
                    term: `pick something up`,
                    type: `phrasal verb`,
                    definition: `To learn a skill easily or without formal teaching.`,
                    ordinary: `“My niece learned the whole system in an afternoon without anyone teaching her.”`,
                    upgraded: `“My niece just picked the whole system up in an afternoon.”`,
                    priority: 'key',
                    atlasPrompt: `What did you pick up quickly that others seem to find hard — or the other way round?`
                }
            },
            {
                id: 'moment-what-it-replaced',
                preview: `Worth missing, or just gone?`,
                question: `Technology is always replacing things — the handwritten letter, the map on the wall, the corner shop, the photo you could hold. Is there something a device replaced that you genuinely miss — or is wanting it back really just about missing being young?`,
                upgrade: {
                    term: `a thing of the past`,
                    type: `phrase`,
                    definition: `Something that no longer exists or happens.`,
                    ordinary: `“Writing letters by hand has almost completely stopped; hardly anyone does it now.”`,
                    upgraded: `“Writing letters by hand is a thing of the past.”`,
                    priority: 'key',
                    atlasPrompt: `What custom or everyday habit has become a thing of the past in your lifetime?`
                }
            }
        ],
        makeItReal: {
            title: `Their Side of It`,
            prompt: `Choose the technology habit in someone else that you find most baffling — the one you genuinely can’t understand. Now argue their side. Make the case for why they do it as if it were completely reasonable, until you can almost see it their way. What’s the best reason you can find?`
        }
    }
];
const clCards = [
    {
        id: 'cl-every-new-thing',
        contextLine: `Across the centuries`,
        title: `Every New Thing Was Going to Ruin Us`,
        teaser: `Each new invention was once accused of harming memory, morals, or the young.`,
        context: `Almost every major new technology has arrived alongside a wave of worry that it would damage people, especially the young — that it would weaken memory, ruin attention, corrupt morals, or make hard-won skills disappear. Writing, printed books, newspapers, radio, and television were each, in their time, blamed for some of the same harms now blamed on screens. The specific fears change with the tool. The worry itself arrives almost every time.`,
        mainQuestion: `You’ve just heard an older relative say a new device is “rotting children’s brains.” Do you take the worry seriously, brush it off as the thing every generation says — or find yourself secretly agreeing?`,
        followTheThread: [
            `Is there a modern worry about technology that you think will look silly in fifty years?`,
            `Which fear about a new technology do you think turned out to be justified?`
        ],
        upgrade: {
            term: `come to nothing`,
            type: `phrase`,
            definition: `To fail to produce any result or effect.`,
            ordinary: `“People predicted disaster, but in the end all the worry produced nothing at all.”`,
            upgraded: `“People predicted disaster, but in the end the panic came to nothing.”`,
            priority: 'standard',
            atlasPrompt: `What worry in your own life turned out to come to nothing?`
        }
    },
    {
        id: 'cl-nobody-knew-to-answer',
        contextLine: `The early telephone`,
        title: `Nobody Knew How to Answer`,
        teaser: `A new device can arrive before anyone knows how to behave with it.`,
        context: `When the telephone first entered homes, people genuinely did not know how to behave with it. There was uncertainty about what to say when picking it up, whether it was rude to call at certain hours, and who should speak first. New rules of politeness had to be invented from nothing, and different places settled on different habits — including the greeting words people now use without thinking.`,
        mainQuestion: `A new device lands in your home and there are simply no rules yet for the polite way to use it. Would you wait to see what everyone else does, or just decide your own way and stick to it?`,
        followTheThread: [
            `What “rules” do you follow with your phone that nobody actually taught you?`,
            `Is there a piece of technology where you think the polite habits still haven’t been agreed?`
        ],
        upgrade: {
            term: `hard and fast`,
            type: `phrase`,
            definition: `Fixed and unable to be changed.`,
            ordinary: `“There were no fixed rules yet, so everyone did it their own way.”`,
            upgraded: `“There were no hard-and-fast rules yet, so everyone did it their own way.”`,
            priority: 'standard',
            atlasPrompt: `Where in your work or family life are there no hard-and-fast rules, just habits people fall into?`
        }
    },
    {
        id: 'cl-knew-the-way',
        contextLine: `Finding the way`,
        title: `We Used to Know the Way`,
        teaser: `Before devices guided us, finding the way was a skill people carried in their heads.`,
        context: `For most of history, getting somewhere unfamiliar meant asking directions, reading a paper map, or simply remembering routes — and people built a real skill at it. Satellite navigation has made much of that skill unnecessary. Many people now follow a voice turn by turn and arrive without ever forming a picture of where they actually are.`,
        mainQuestion: `Your device dies halfway through a journey somewhere unfamiliar. Do you feel a small thrill at having to find your own way the old-fashioned way — or a genuine flash of panic?`,
        followTheThread: [
            `Is a skill worth keeping just because it once mattered, even when a machine does it better?`,
            `What would you refuse to fully hand to a device, even if it could do it for you?`
        ],
        upgrade: {
            term: `off the top of your head`,
            type: `phrase`,
            definition: `From memory, without checking or preparing.`,
            ordinary: `“I used to be able to give you three routes there from memory, without looking anything up.”`,
            upgraded: `“I used to be able to give you three routes there off the top of my head.”`,
            priority: 'key',
            atlasPrompt: `What could you once rattle off off the top of your head that you’d now have to look up?`
        }
    },
    {
        id: 'cl-skipping-a-step',
        contextLine: `Leapfrogging`,
        title: `Skipping a Step`,
        teaser: `Some places skipped a technology entirely and jumped straight to the next one.`,
        context: `Technology does not spread the same way everywhere. Some regions never built widespread landline networks and moved more or less straight to mobile phones. In several places, paying by phone became normal for everyday purchases while other wealthy countries still leaned heavily on cash or cards. The idea that newer technology always reaches richer places first is often simply untrue; sometimes those with less existing infrastructure adopt a new thing faster and more completely.`,
        mainQuestion: `You arrive somewhere that is years ahead of home in one everyday technology and years behind in another. Which gap unsettles you more — the thing that’s suddenly missing, or the thing you don’t yet know how to use?`,
        followTheThread: [
            `Is there a technology that feels essential to you but that plenty of people manage happily without?`,
            `Would you rather visit somewhere far ahead of home or far behind it, technologically?`
        ],
        upgrade: {
            term: `behind the times`,
            type: `phrase`,
            definition: `Old-fashioned; not keeping up with recent changes.`,
            ordinary: `“Our payment system feels really outdated compared with what they use there.”`,
            upgraded: `“Our payment system feels really behind the times compared with theirs.”`,
            priority: 'key',
            atlasPrompt: `What feels behind the times where you live — a system, a rule, an attitude?`
        }
    },
    {
        id: 'cl-have-to-have-one',
        contextLine: `Built around the car`,
        title: `You Have to Have One`,
        teaser: `Some conveniences quietly become things you cannot manage without.`,
        context: `A technology can begin as a convenience and slowly become almost compulsory. In many towns built around the car, daily life became genuinely difficult without one — shops, work, and services spread too far apart to reach on foot. Something similar is happening with smartphones in some places, where booking, paying, parking, or proving who you are increasingly assumes you own one. What starts as an option can quietly end up as a requirement.`,
        mainQuestion: `A service you rely on announces it will now only work through an app or a device you’d rather not use. Do you give in and get it, find a way round it, or refuse on principle and accept the hassle?`,
        followTheThread: [
            `Is it fair for a service to assume everyone owns a particular device?`,
            `When is refusing on principle worth the inconvenience, and when is it just stubbornness?`
        ],
        upgrade: {
            term: `a necessary evil`,
            type: `phrase`,
            definition: `Something you dislike but accept because it cannot be avoided.`,
            ordinary: `“I don’t enjoy using the parking app, but there’s no way round it if I want to park.”`,
            upgraded: `“The parking app is a necessary evil.”`,
            priority: 'standard',
            atlasPrompt: `What’s a necessary evil in your daily life you’d drop in a heartbeat if you could?`
        }
    },
    {
        id: 'cl-day-off',
        contextLine: `Switching off`,
        title: `The Day Off From Everything`,
        teaser: `Some people deliberately switch it all off, one day a week.`,
        context: `As devices have crept into every hour, a countermovement has grown: people who deliberately switch off. Some keep one day a week free of screens; some leave the phone in another room at night; some communities have long built regular disconnection into their week for reasons that have nothing to do with technology. What these habits share is a deliberate choice to be, for a while, completely unavailable.`,
        mainQuestion: `Someone suggests you go one full day a week with no screens at all. Does part of you feel relief at the idea — or does the thought of being unreachable and bored make you genuinely anxious?`,
        followTheThread: [
            `What would be the hardest part of a full day with no screens — the boredom, being unreachable, or missing out?`,
            `Is being constantly reachable a freedom or a burden?`
        ],
        upgrade: {
            term: `off the grid`,
            type: `phrase`,
            definition: `Disconnected from phones, internet, and normal contact.`,
            ordinary: `“For one day a week he makes himself completely unavailable — no phone, no email, nothing.”`,
            upgraded: `“For one day a week he goes completely off the grid.”`,
            priority: 'standard',
            atlasPrompt: `When did you last go properly off the grid, and what was it like?`
        }
    },
    {
        id: 'cl-end-of-the-dark',
        contextLine: `Electric light`,
        title: `The End of the Dark`,
        teaser: `Cheap light quietly rewrote when people slept, worked, and gathered.`,
        context: `Before cheap, reliable lighting, the day was largely shaped by the sun. Evenings were shorter, darker, and often spent close to a single source of light and warmth. Widespread electric light changed this profoundly: people began staying up later, working and socialising well into the night, and spreading out into rooms that had once been too dark to use. A technology meant simply to let us see quietly reorganised sleep, work, and family time.`,
        mainQuestion: `Picture your evenings if light were once again scarce and precious — everyone gathered close, the day ending when the sun did. Does that sound like a loss you’re glad to have escaped, or something quietly worth missing?`,
        followTheThread: [
            `What might people have gained from evenings that ended when it got dark?`,
            `Is there a modern technology that has reshaped your day without you ever really choosing it?`
        ],
        upgrade: {
            term: `round the clock`,
            type: `phrase`,
            definition: `All day and all night, without stopping.`,
            ordinary: `“Once we had good lighting, people could work and socialise at any hour of the day or night.”`,
            upgraded: `“Once we had good lighting, life could carry on round the clock.”`,
            priority: 'key',
            atlasPrompt: `What in your work or town runs round the clock now that once had to stop at night?`
        }
    },
    {
        id: 'cl-got-it-wrong',
        contextLine: `Guessing the future`,
        title: `They Got It Completely Wrong`,
        teaser: `The people who invent a technology often misjudge what it will actually be used for.`,
        context: `The people closest to a new technology are often badly wrong about what it will become. Early on, the telephone was sometimes imagined mainly as a way to broadcast concerts and news to listeners at home, rather than as a tool for private two-way conversation. Offices were confidently promised they would soon be paperless. Again and again, a technology’s inventors picture one future while ordinary users quietly build a completely different one.`,
        mainQuestion: `You’re handed a brand-new device and asked to guess how people will really use it in twenty years. Would you trust your own guess — or has everyday life surprised you too many times for that?`,
        followTheThread: [
            `What’s a technology that ended up being used for something completely different from its original purpose?`,
            `Do ordinary users or inventors usually understand a technology better?`
        ],
        upgrade: {
            term: `wide of the mark`,
            type: `phrase`,
            definition: `Not accurate; far from correct.`,
            ordinary: `“Their predictions about how we’d use it turned out to be completely wrong.”`,
            upgraded: `“Their predictions turned out to be wide of the mark.”`,
            priority: 'standard',
            atlasPrompt: `When was a confident prediction you or someone else made wide of the mark?`
        }
    }
];
