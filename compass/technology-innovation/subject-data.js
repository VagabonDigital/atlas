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
  Compass active subject · contentVersion 1.1.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'technology-innovation',
    schemaVersion: 2,
    contentVersion: '1.1.0',
    title: 'Technology & Innovation',
    titleHtml: 'Technology &amp; <em>Innovation</em>',
    navTitle: 'Technology',
    bgImage: 'https://photos.smugmug.com/Atlas/i-HRxxfKm/0/LxfwrSftsBGtshL2rMnbjKdDnxpzS6kRwnZFvCXF5/O/2d9b20d4-fb4f-4a9d-b2de-80dd6a13a04a.png'
};

const subjectCopy = {
    cover: {
        hook: `You made a deal. You just don’t remember signing anything.`
    },
    overview: {
        heading: `The Deal With the Machine`,
        intro: [
            `Technology makes everyday life easier, faster, and more connected. But every tool also changes something — how we spend our time, solve problems, or depend on it.`
        ],
        question: `What piece of technology would be hardest for you to live without — and why?`
    },
    paths: {
        culturalLensDescription: `See how earlier tools changed everyday manners, replaced familiar skills, and inspired confident predictions that turned out to be wrong.`,
        discussionDescription: `The tools you rely on, resist, and can’t understand in other people — from small daily habits to the lines you won’t cross.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A final look at what technology has given you, what it has cost, and which changes you would refuse next time.`
    },
    culturalLens: {
        heading: `The Tools Before These`,
        intro: `Every technology in your pocket was once new, strange, and a little suspicious. Step back to earlier tools and see how they changed behaviour, knowledge, and daily routines — often before people understood what they were gaining or losing.`
    },
    discussion: {
        heading: `The Tools We Live By`
    },
    reflection: {
        title: `Was It Worth It?`,
        summary: `Step back from the gadgets themselves. Notice what technology has made easier, what it has cost, and which changes you would undo.`,
        questions: [
            `Which technology has made your life easier but cost you something you now miss? Would you reverse that change tomorrow?`,
            `When a new technology appears, what would make you decide not to adopt it — the data it collects, the time it demands, the cost, or something else?`
        ]
    },
    keyLanguage: {
        intro: `Natural ways to talk about relying on things, resisting them, and weighing what they’re worth.`
    }
};

const discussionSets = [
    {
        id: 'set-the-human-bit',
        title: `The Human Bit`,
        stage: `First Look`,
        icon: 'first-look',
        description: `The small triumphs, ridiculous failures, private attachments, and moments when a machine makes you feel very human.`,

        moments: [
            {
                id: 'moment-everyone-else-understood-it',
                preview: `Everyone else seemed to understand it.`,
                question: `What piece of technology has ever made you feel completely lost — a ticket machine, a printer, a new phone, or a payment system? What were you trying to do, and how did the situation finally end?`,

                upgrade: {
                    term: `be stumped`,
                    type: `phrase`,
                    definition: `To be unable to understand or solve something.`,
                    ordinary: `“I stared at the ticket machine for five minutes and had no idea what to press.”`,
                    upgraded: `“I was completely stumped by the ticket machine, and eventually a stranger had to help.”`,
                    priority: 'key',
                    atlasPrompt: `What question, problem, or instruction has left you completely stumped recently?`
                }
            },
            {
                id: 'moment-it-saved-the-day',
                preview: `It worked when you really needed it.`,
                question: `When has a piece of technology made the difference exactly when you needed it — by finding the route, recovering a file, translating something, or reaching the right person? What would have happened without it?`,

                upgrade: {
                    term: `save the day`,
                    type: `phrase`,
                    definition: `To solve a serious problem at an important moment.`,
                    ordinary: `“My map found another route just before the road closed, so we still arrived on time.”`,
                    upgraded: `“My map saved the day by finding another route just before the road closed.”`,
                    priority: 'key',
                    atlasPrompt: `Who or what has saved the day for you during a difficult situation?`
                }
            },
            {
                id: 'moment-complain-but-love',
                preview: `You complain about it, but you love it.`,
                question: `What piece of technology do you complain about constantly but would hate to lose? What does it do well enough to keep winning you back?`,

                upgrade: {
                    term: `have a love-hate relationship with something`,
                    type: `phrase`,
                    definition: `To have strong positive and negative feelings about the same thing.`,
                    ordinary: `“My phone annoys me constantly, but I would struggle without it.”`,
                    upgraded: `“I have a real love-hate relationship with my phone.”`,
                    priority: 'standard',
                    atlasPrompt: `What job, habit, place, or activity do you have a love-hate relationship with?`
                }
            },
            {
                id: 'moment-the-machine-was-right',
                preview: `You insisted it was wrong.`,
                question: `Have you ever ignored a warning, argued with a map, or insisted a device was wrong — and then discovered it knew better than you? What happened?`,

                upgrade: {
                    term: `prove someone wrong`,
                    type: `phrase`,
                    definition: `To show through events or evidence that someone’s belief was incorrect.`,
                    ordinary: `“I was certain the map had made a mistake, but the road really was closed.”`,
                    upgraded: `“I was certain the map was wrong, but it proved me wrong.”`,
                    priority: 'standard',
                    atlasPrompt: `When has a person or situation proved you wrong about something?`
                }
            },
            {
                id: 'moment-tiny-pleasure',
                preview: `A small detail you genuinely enjoy.`,
                question: `What small piece of technology gives you far more pleasure than it probably should — a perfectly placed button, noise-cancelling headphones, automatic lights, or the click of a good keyboard? Why that one?`,

                upgrade: {
                    term: `a nice touch`,
                    type: `phrase`,
                    definition: `A small detail that makes something more pleasant, thoughtful, or effective.`,
                    ordinary: `“The light turns on gently instead of suddenly, and that small detail makes it much nicer.”`,
                    upgraded: `“The light turns on gently instead of suddenly, which is a really nice touch.”`,
                    priority: 'standard',
                    atlasPrompt: `What small detail was a nice touch in a hotel, restaurant, gift, or service?`
                }
            }
        ],

        makeItReal: {
            title: `The moment behind the screen`,
            prompt: `Choose one technology story you normally tell quickly. Tell it again with one human detail you usually leave out — the panic, the person beside you, the ridiculous mistake, the sound, or what happened immediately afterwards.`
        }
    },

    {
        id: 'set-what-kind-of-user',
        title: `What Kind of User Are You?`,
        stage: `Closer Look`,
        icon: 'closer-look',
        description: `The habits you defend, the behaviour you judge, and the boundaries people rarely agree on.`,

        moments: [
            {
                id: 'moment-first-or-wait',
                preview: `First in line—or safely behind everyone else.`,
                question: `When a new device or app appears, do you try it early or wait until other people have found the problems? What behaviour from early adopters or cautious users makes no sense to you?`,

                upgrade: {
                    term: `hold off`,
                    type: `phrasal verb`,
                    definition: `To delay doing something until a later time.`,
                    ordinary: `“I usually wait a few months before installing a major update.”`,
                    upgraded: `“I usually hold off for a few months before installing a major update.”`,
                    priority: 'key',
                    atlasPrompt: `When is it sensible to hold off rather than make a quick decision?`
                }
            },
            {
                id: 'moment-old-basic-still-works',
                preview: `Old, basic, and still doing the job.`,
                question: `A colleague says someone should replace their old phone, basic car, cheap headphones, or paper diary. Would you agree, defend the owner, or ask what they actually need it for before deciding? What would shape your response?`,

                upgrade: {
                    term: `do the job`,
                    type: `phrase`,
                    definition: `To work well enough for the purpose it is needed for.`,
                    ordinary: `“The phone is old and unfashionable, but it still works perfectly well for what she needs.”`,
                    upgraded: `“The phone is old and unfashionable, but it still does the job.”`,
                    priority: 'key',
                    atlasPrompt: `What inexpensive or unfashionable thing still does the job perfectly well for you?`
                }
            },
            {
                id: 'moment-phone-on-table',
                preview: `The phone is on the table.`,
                question: `Someone keeps checking their phone while you’re talking. When is that understandable, and when does it become rude?`,

                upgrade: {
                    term: `cross the line`,
                    type: `idiom`,
                    definition: `To go beyond what is acceptable or reasonable.`,
                    ordinary: `“Checking one urgent message is understandable, but answering every notification becomes rude.”`,
                    upgraded: `“Checking one urgent message is understandable, but answering every notification crosses the line.”`,
                    priority: 'key',
                    atlasPrompt: `What behaviour begins as understandable but eventually crosses the line?`
                }
            },
            {
                id: 'moment-convenience-for-privacy',
                preview: `Convenience in exchange for privacy.`,
                question: `An app offers to make life easier if it can track where you go and what you do. What would you agree to, and what would you refuse?`,

                upgrade: {
                    term: `at the expense of something`,
                    type: `phrase`,
                    definition: `If one benefit comes at the expense of another, it is gained by harming or losing the other.`,
                    ordinary: `“The convenience is useful, but I would not accept it if I had to give up too much privacy.”`,
                    upgraded: `“The convenience is useful, but I would not accept it at the expense of my privacy.”`,
                    priority: 'key',
                    atlasPrompt: `When have you chosen a slower or less convenient option because the easier one came at the expense of privacy, quality, or control?`
                }
            },
            {
                id: 'moment-feature-disappears',
                preview: `One feature disappears tomorrow.`,
                question: `If you could remove one feature from modern life — autoplay, read receipts, endless notifications, or targeted adverts — what would go first, and who would complain?`,

                upgrade: {
                    term: `drive someone up the wall`,
                    type: `idiom`,
                    definition: `To annoy or frustrate someone intensely.`,
                    ordinary: `“Endless notifications annoy me because they interrupt everything.”`,
                    upgraded: `“Endless notifications drive me up the wall because they interrupt everything.”`,
                    priority: 'standard',
                    atlasPrompt: `What small sound, habit, or inconvenience drives you up the wall?`
                }
            }
        ],

        makeItReal: {
            title: `The rule you learned the hard way`,
            prompt: `State one technology rule you follow because something once went wrong. Tell the story, then let your tutor challenge the rule with one situation where breaking it might be reasonable. Decide whether the rule survives or needs an exception.`
        }
    },

    {
        id: 'set-what-it-changes',
        title: `What It Changes`,
        stage: `Wider View`,
        icon: 'wider-view',
        description: `The people it brings closer, the skills it replaces, and the future habits we are creating now.`,

        moments: [
            {
                id: 'moment-far-away-felt-close',
                preview: `Far away, but suddenly close.`,
                question: `When has technology made someone far away feel genuinely close? What made the moment feel different from an ordinary call or message?`,

                upgrade: {
                    term: `bring people closer`,
                    type: `phrase`,
                    definition: `To strengthen a relationship or help people feel more connected.`,
                    ordinary: `“The weekly video calls helped our family feel more connected despite the distance.”`,
                    upgraded: `“The weekly video calls genuinely brought our family closer.”`,
                    priority: 'key',
                    atlasPrompt: `What shared experience, routine, or challenge has brought people closer in your life?`
                }
            },
            {
                id: 'moment-device-changed-room',
                preview: `The device that changed the room.`,
                question: `Think of a home that changed after one device arrived — a television, a family computer, or the first smartphone. What did people do together before it, and what changed afterwards?`,

                upgrade: {
                    term: `take over`,
                    type: `phrasal verb`,
                    definition: `To become dominant or begin controlling how a place, activity, or situation works.`,
                    ordinary: `“Once everyone had a smartphone, it gradually became the main focus at dinner.”`,
                    upgraded: `“Once everyone had a smartphone, it gradually took over at dinner.”`,
                    priority: 'standard',
                    atlasPrompt: `What activity, habit, or responsibility has gradually taken over more of your time?`
                }
            },
            {
                id: 'moment-skill-you-carried',
                preview: `A skill you once carried yourself.`,
                question: `What could you once do from memory or by hand that you now immediately give to a device? When did you first notice the skill had faded?`,

                upgrade: {
                    term: `rusty`,
                    type: `adjective`,
                    definition: `No longer skilled at something because you have not practised it for a long time.`,
                    ordinary: `“I used to remember every route, but I am badly out of practice now.”`,
                    upgraded: `“I used to remember every route, but I’m really rusty now.”`,
                    priority: 'key',
                    atlasPrompt: `What skill of yours has become rusty through lack of practice?`
                }
            },
            {
                id: 'moment-future-will-laugh',
                preview: `The habit the future will laugh at.`,
                question: `Which technology habit from today will people look back on and find ridiculous in twenty years — and what do you think will replace it?`,

                upgrade: {
                    term: `a thing of the past`,
                    type: `phrase`,
                    definition: `Something that no longer exists or is no longer commonly done.`,
                    ordinary: `“In twenty years, typing passwords may no longer be something people do.”`,
                    upgraded: `“In twenty years, typing passwords may be a thing of the past.”`,
                    priority: 'standard',
                    atlasPrompt: `What custom, product, or everyday habit has become a thing of the past during your lifetime?`
                }
            },
            {
                id: 'moment-invention-still-missing',
                preview: `The ordinary invention still missing.`,
                question: `What small invention do you wish already existed for an ordinary frustration in your life? What would it do, and who else would want one?`,

                upgrade: {
                    term: `come in handy`,
                    type: `phrase`,
                    definition: `To be useful in a particular situation.`,
                    ordinary: `“It would be a simple tool, but it would be useful whenever this problem appeared.”`,
                    upgraded: `“It would be a simple tool, but it would really come in handy whenever this problem appeared.”`,
                    priority: 'key',
                    atlasPrompt: `What small object, skill, or piece of knowledge has unexpectedly come in handy?`
                }
            }
        ],

        makeItReal: {
            title: `A message to the future`,
            prompt: `Choose one technology habit from today. Explain it to someone living twenty years from now who finds it absurd. Defend it honestly, then admit what they are right about.`
        }
    }
];

const clCards = [
    {
        id: 'cl-every-new-thing',
        contextLine: `Across the centuries`,
        title: `Every New Thing Was Going to Ruin Us`,
        teaser: `Each new invention was once accused of harming memory, morals, or the young.`,
        context: `Long before screens, people feared that new tools would damage society. Some said writing would weaken memory, while printed books would spread dangerous ideas. Later, newspapers were accused of lowering standards, and radio and television of damaging young people’s concentration. Many of the same fears are now directed at phones.`,
        mainQuestion: `You’ve just heard an older relative say a new device is “rotting children’s brains.” Do you take the worry seriously, brush it off as the thing every generation says — or find yourself secretly agreeing?`,
        followTheThread: [
            `Is there a modern worry about technology that you think will look silly in fifty years?`,
            `Which fear about a new technology do you think turned out to be justified?`
        ],
        upgrade: {
            term: `there may be something in it`,
            type: `phrase`,
            definition: `Used to say that an idea or criticism may be partly true or worth considering.`,
            ordinary: `“The warning sounds exaggerated, but part of it may still be true.”`,
            upgraded: `“The warning sounds exaggerated, but there may be something in it.”`,
            priority: 'standard',
            atlasPrompt: `When have you changed from dismissing a warning to thinking there might be something in it?`
        }
    },
    {
        id: 'cl-nobody-knew-to-answer',
        contextLine: `The early telephone`,
        title: `Nobody Knew How to Answer`,
        teaser: `A new device can arrive before anyone knows how to behave with it.`,
        context: `When the telephone first reached homes, nobody was sure how to behave with it. What did you say when you picked it up? Was it rude to ring during dinner, or after dark? Who spoke first? The rules of politeness had to be invented from scratch — down to the very word for hello.`,
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
        context: `For most of history, reaching somewhere new meant asking a stranger, unfolding a paper map, or holding the route in your head — and people grew good at it. Satellite navigation has quietly retired that skill. Many of us now follow a voice turn by turn and arrive with no real picture of where we are.`,
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
            atlasPrompt: `What information could you once give off the top of your head that you’d now have to look up?`
        }
    },
    {
        id: 'cl-skipping-a-step',
        contextLine: `Kenya · Mobile money`,
        title: `Skipping a Step`,
        teaser: `A country moved into mobile payments without waiting for every older system.`,
        context: `In Kenya, M-PESA launched in 2007 and allowed people to send and withdraw money using ordinary mobile phones. It gave many people access to financial services through a phone, even where traditional banking was harder to reach. This is an example of “leapfrogging”: adopting a newer system without first building every older stage.`,
        mainQuestion: `You arrive somewhere where one everyday technology is far more advanced than at home, while another is missing or old-fashioned. Which is harder: losing something you normally rely on, or learning a system you don’t understand?`,
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
        context: `A convenience can become a requirement without anyone choosing it. In towns built around cars, shops, schools, and workplaces may be too far apart to reach easily without one. Smartphones are becoming similar. Many services now assume you have one to book a table, pay for parking, or prove your identity.`,
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
        contextLine: `Jewish communities · Shabbat`,
        title: `The Day Off From Everything`,
        teaser: `A regular day without technology existed long before the smartphone.`,
        context: `Jewish tradition marks Shabbat from Friday evening to Saturday evening. Many observant Jews avoid phones, computers, and other forms of technology during that time, alongside other restrictions on work. Modern screen-free days may be presented as a response to digital overload, but this regular period of disconnection has existed for generations for religious reasons.`,
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
        context: `Before cheap, steady lighting, daylight controlled the rhythm of the day. Evenings were short and dark, with people gathered near one lamp or the fire. When electric light spread through homes, people stayed up later, worked longer, socialised after dark, and used rooms that had previously been impractical at night.`,
        mainQuestion: `Imagine having very little artificial light in the evening. Would you mostly miss the freedom to stay active after dark, or value the slower end to the day?`,
        followTheThread: [
            `What might people have gained from evenings that ended when it got dark?`,
            `Is there a modern technology that has reshaped your day without you ever really choosing it?`
        ],
        upgrade: {
            term: `wind down`,
            type: `phrasal verb`,
            definition: `To gradually relax and become less active at the end of the day.`,
            ordinary: `“Without bright light, people had to slow down and finish their day earlier.”`,
            upgraded: `“Without bright light, people had to wind down and finish their day earlier.”`,
            priority: 'key',
            atlasPrompt: `What helps you wind down at the end of a long day?`
        }
    },
    {
        id: 'cl-got-it-wrong',
        contextLine: `Guessing the future`,
        title: `They Got It Completely Wrong`,
        teaser: `The people who invent a technology often misjudge what it will actually be used for.`,
        context: `The people closest to a new invention are often the worst at guessing what it is for. The telephone was first imagined as a way to pipe concerts and news into the home, not a line for private chatter. Offices were promised, again and again, that paper would soon vanish. The users had other ideas.`,
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
