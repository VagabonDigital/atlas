/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Humour & Wit
  ---------------------------------------------------------------------------
  A premium interactive speaking subject for exploring what makes humour
  work between people: taste, timing, trust, power, performance, and the
  changing mood of the room. Built for tutor-led conversation, shared-screen
  teaching, thoughtful disagreement, playful experimentation, and sharper
  spoken English.
  Compass active subject · contentVersion 2.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: 'humour-wit',
    schemaVersion: 2,
    contentVersion: '2.0.0',
    title: 'Humour & Wit',
    titleHtml: 'Humour &amp; <em>Wit</em>',
    navTitle: 'Humour',
    bgImage: 'https://photos.smugmug.com/Atlas/i-J7Nwffw/0/MM58x4vnzmfh8WS9JRjGwbxLms377c2GmFfLtWj7d/O/63cb2ddf-077c-45bc-8e5f-2a3e54ef071a.png'
};

const subjectCopy = {
    cover: {
        hook: `The laugh is only part of it.`
    },

    overview: {
        heading: `What Makes It Land?`,
        intro: [
            `The same joke can feel brilliant, awkward, kind, cruel, or completely pointless depending on who says it and who is listening. Humour lives in timing, trust, taste, and the mood of the room.`
        ],
        question: `What usually makes you laugh hardest: the joke itself, the person telling it, or the fact that you probably should not be laughing?`
    },

    paths: {
        culturalLensDescription: `Meet performers, traditions, rules, and rituals that show how different communities organise laughter.`,
        discussionDescription: `Your taste, your timing, the people who make you laugh, and the moments when the room suddenly changes.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A final pause on what humour reveals about trust, timing, and connection.`
    },

    culturalLens: {
        heading: `Different Rooms, Different Rules`,
        intro: `A royal court, a family gathering, a theatre office, a television studio: every room has its own rules about who may be funny and what laughter is for. Step into situations where humour entertains, protects, embarrasses, connects, or quietly changes the balance of power.`
    },

    discussion: {
        heading: `What Makes the Room Laugh`
    },

    reflection: {
        title: `After the Laugh`,
        summary: `Step back from the individual stories. Notice what humour reveals about the people involved and the atmosphere they create together.`,
        questions: [
            `When does humour make people feel closer?`,
            `What kind of humour would you like more of in your own life?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing what makes people laugh, reading the room, and reacting when a joke changes the mood.`
    }
};

const discussionSets = [
    {
        id: 'set-what-makes-you-laugh',
        title: `What Gets You`,
        stage: `React`,
        icon: 'react',
        description: `The silly things that always work, the laugh you hide, and the stories that improve every year.`,

        moments: [
            {
                id: 'moment-humour-that-always-works',
                preview: `You know it is silly. It still works.`,
                question: `What kind of humour gets you every time — terrible puns, impressions, dry comments, absurd videos, or something else? Give us one example that would probably work on you today.`,

                upgrade: {
                    term: `crack someone up`,
                    type: `phrasal verb`,
                    definition: `To make someone laugh a lot.`,
                    ordinary: `“That ridiculous video makes me laugh every time, even though I know exactly what is coming.”`,
                    upgraded: `“That ridiculous video cracks me up every time, even though I know exactly what is coming.”`,
                    priority: 'key',
                    atlasPrompt: `Who can crack you up even when they are not trying to be funny?`
                }
            },
            {
                id: 'moment-laugh-at-the-wrong-time',
                preview: `Do not look at the other person.`,
                question: `When have you had to fight a laugh at exactly the wrong moment — during a meeting, ceremony, class, or serious conversation? What made it so difficult not to laugh?`,

                upgrade: {
                    term: `keep a straight face`,
                    type: `phrase`,
                    definition: `To stop yourself from smiling or laughing.`,
                    ordinary: `“I tried not to smile, but the moment I looked at my sister I completely lost control.”`,
                    upgraded: `“I tried to keep a straight face, but the moment I looked at my sister I completely lost control.”`,
                    priority: 'key',
                    atlasPrompt: `When is it hardest for you to keep a straight face — during a joke, a surprise, or somebody’s very serious speech?`
                }
            },
            {
                id: 'moment-story-improves-every-year',
                preview: `The facts stay still. The story grows.`,
                question: `What story does your family, team, or group keep retelling because it always gets a laugh? Tell us what really happened first — then the version people tell now.`,

                upgrade: {
                    term: `embellish`,
                    type: `verb`,
                    definition: `To make a story more interesting by adding or exaggerating details.`,
                    ordinary: `“The dog was tiny, but he makes it sound enormous whenever he tells the story.”`,
                    upgraded: `“The dog was tiny, but he embellishes the story by describing it as enormous.”`,
                    priority: 'standard',
                    atlasPrompt: `What kinds of stories do people tend to embellish when they tell them again?`
                }
            },
            {
                id: 'moment-ordinary-line-funny',
                preview: `The words are ordinary. The delivery is not.`,
                question: `Who can make you laugh by saying something completely ordinary in exactly the right way? Give us one line they might say, and try to deliver it like them.`,

                upgrade: {
                    term: `deadpan`,
                    type: `adjective`,
                    definition: `Funny because it is delivered with a completely serious expression or voice.`,
                    ordinary: `“His completely serious delivery made the ordinary comment much funnier.”`,
                    upgraded: `“His deadpan delivery made the ordinary comment much funnier.”`,
                    priority: 'standard',
                    atlasPrompt: `Who has a deadpan way of speaking, and when does it work best?`
                }
            },
            {
                id: 'moment-room-helps-the-joke',
                preview: `The joke ends. The room helps.`,
                question: `Someone tells a weak joke and looks around hopefully. Do you laugh, smile, tease them about it, or let the silence sit there? What would decide your reaction?`,

                upgrade: {
                    term: `laugh along`,
                    type: `phrasal verb`,
                    definition: `To join other people in laughing, sometimes mainly to be friendly or polite.`,
                    ordinary: `“I did not find it funny, but everyone else laughed, so I joined them.”`,
                    upgraded: `“I did not find it funny, but everyone else laughed, so I laughed along.”`,
                    priority: 'standard',
                    atlasPrompt: `When do people laugh along even though they have not fully understood the joke?`
                }
            }
        ],

        makeItReal: {
            title: `Same Facts, Funnier Telling`,
            prompt: `Choose a small inconvenience and tell it once as a plain factual report. Then retell it to make your tutor laugh without inventing anything. Change only the timing, emphasis, order, and details you choose to notice.`
        }
    },

    {
        id: 'set-who-gets-to-joke',
        title: `Who Gets to Say It`,
        stage: `Explain`,
        icon: 'explain',
        description: `Permission, timing, repair, and what happens when the same joke lands differently between people.`,

        moments: [
            {
                id: 'moment-risky-joke-still-works',
                preview: `From them, it somehow works.`,
                question: `Think of someone who can make a rude or risky joke and still keep everyone on their side. What do they have that another person would not — trust, warmth, timing, status, or something else?`,

                upgrade: {
                    term: `get away with something`,
                    type: `phrasal verb`,
                    definition: `To do or say something questionable without being challenged or punished.`,
                    ordinary: `“If anybody else made that comment, people would be offended, but nobody challenges her.”`,
                    upgraded: `“If anybody else made that comment, people would be offended, but she gets away with it.”`,
                    priority: 'key',
                    atlasPrompt: `What can somebody you know get away with because people trust or like them?`
                }
            },
            {
                id: 'moment-repair-after-bad-joke',
                preview: `“I was only joking” is not enough.`,
                question: `Someone makes a joke that hurts, then says, “I’m only joking.” What could they say or do next to show they understand what went wrong?`,

                upgrade: {
                    term: `own up to something`,
                    type: `phrasal verb`,
                    definition: `To admit that you did something wrong or were responsible for a mistake.`,
                    ordinary: `“He admitted that the joke was hurtful instead of continuing to make excuses.”`,
                    upgraded: `“He owned up to the fact that the joke was hurtful instead of continuing to make excuses.”`,
                    priority: 'key',
                    atlasPrompt: `When is it difficult for people to own up to a mistake, even when everyone knows what happened?`
                }
            },
            {
                id: 'moment-always-the-target',
                preview: `Everybody laughs. Always at one person.`,
                question: `The same person is always the target of the group’s jokes. They laugh too, but less each time. When would you step in — and what would you actually say?`,

                upgrade: {
                    term: `pick on someone`,
                    type: `phrasal verb`,
                    definition: `To repeatedly treat one person unfairly through teasing, criticism, or unkind behaviour.`,
                    ordinary: `“They always chose the newest employee as the target of their jokes.”`,
                    upgraded: `“They always picked on the newest employee.”`,
                    priority: 'key',
                    atlasPrompt: `Why do some groups repeatedly pick on one person, and what usually makes it stop?`
                }
            },
            {
                id: 'moment-one-line-saves-room',
                preview: `One line, and the room breathes again.`,
                question: `A tense meeting has stalled after a small mistake. Would you use humour? Give one line that might help without embarrassing anyone — or explain why you would stay serious.`,

                upgrade: {
                    term: `defuse`,
                    type: `verb`,
                    definition: `To make a tense or difficult situation calmer.`,
                    ordinary: `“She made a light comment that reduced the tension immediately.”`,
                    upgraded: `“She made a light comment that defused the tension immediately.”`,
                    priority: 'key',
                    atlasPrompt: `Who is good at defusing tension, and what do they do besides making jokes?`
                }
            },
            {
                id: 'moment-adapt-joke-for-new-room',
                preview: `Hilarious at home. Silence here.`,
                question: `Think of a joke, phrase, or type of humour that works where you come from but might fail somewhere else. What would you change so another audience had a chance of enjoying it?`,

                upgrade: {
                    term: `get the reference`,
                    type: `phrase`,
                    definition: `To understand the person, event, film, song, or idea that a comment indirectly mentions.`,
                    ordinary: `“Nobody laughed because they did not understand which television programme I was referring to.”`,
                    upgraded: `“Nobody laughed because they did not get the reference.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you missed a reference that everybody else seemed to understand?`
                }
            }
        ],

        makeItReal: {
            title: `Same Line, Different Room`,
            prompt: `Say “Well, that went perfectly” after your own small mistake, after a close friend’s mistake, and after a colleague’s mistake in a tense meeting. Change your tone and add one sentence each time. Which version feels safest?`
        }
    },

    {
        id: 'set-what-laughter-leaves',
        title: `What Laughter Leaves`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The people who make hard days lighter, the humour you inherit, and what changes with time.`,

        moments: [
            {
                id: 'moment-person-lightens-bad-day',
                preview: `They knew how to help without pretending.`,
                question: `Who has made a bad day feel lighter without pretending the problem was small? What did they say or do that helped rather than annoyed you?`,

                upgrade: {
                    term: `lift the mood`,
                    type: `phrase`,
                    definition: `To make people feel more cheerful, relaxed, or hopeful.`,
                    ordinary: `“Her comment made everyone feel a little better without ignoring the problem.”`,
                    upgraded: `“Her comment lifted the mood without ignoring the problem.”`,
                    priority: 'key',
                    atlasPrompt: `What small thing can lift the mood in a difficult meeting or a tired household?`
                }
            },
            {
                id: 'moment-humour-you-left-behind',
                preview: `You used to laugh. Now you do not.`,
                question: `What kind of humour did you love when you were younger but no longer enjoy? What changed — the jokes, the world around you, or your own taste?`,

                upgrade: {
                    term: `grow out of something`,
                    type: `phrasal verb`,
                    definition: `To stop enjoying or doing something as you become older or change.`,
                    ordinary: `“I loved that kind of comedy when I was younger, but it no longer appeals to me.”`,
                    upgraded: `“I loved that kind of comedy when I was younger, but I grew out of it.”`,
                    priority: 'key',
                    atlasPrompt: `What taste, habit, or opinion have you grown out of in recent years?`
                }
            },
            {
                id: 'moment-person-shaped-your-humour',
                preview: `You sound more like them every year.`,
                question: `Who has influenced the way you joke — a parent, sibling, friend, teacher, or colleague? What do you now say or do because of them?`,

                upgrade: {
                    term: `rub off on someone`,
                    type: `phrasal verb`,
                    definition: `When a person’s habits, attitudes, or style gradually influence somebody else.`,
                    ordinary: `“After working with her for years, I started using the same dry comments.”`,
                    upgraded: `“After working with her for years, her dry sense of humour rubbed off on me.”`,
                    priority: 'key',
                    atlasPrompt: `What positive habit has rubbed off on you from somebody else?`
                }
            },
            {
                id: 'moment-weekend-with-two-extremes',
                preview: `Funny at nine. Exhausting by lunch.`,
                question: `Would you rather spend a weekend with someone who jokes about everything, or someone who takes every sentence seriously? Which person would start annoying you first — and when?`,

                upgrade: {
                    term: `wear thin`,
                    type: `phrase`,
                    definition: `To become less enjoyable or acceptable because something continues for too long.`,
                    ordinary: `“His constant jokes were funny at first, but they became annoying by the end of the day.”`,
                    upgraded: `“His constant jokes were funny at first, but they wore thin by the end of the day.”`,
                    priority: 'standard',
                    atlasPrompt: `What small habit can wear thin very quickly when you spend a lot of time with someone?`
                }
            },
            {
                id: 'moment-month-without-jokes',
                preview: `Take the laughter out and see what changes.`,
                question: `Imagine nobody in one group you know could joke for a month — your family, workplace, class, or friends. Which group would change most, and what would become harder first?`,

                upgrade: {
                    term: `take the edge off`,
                    type: `phrase`,
                    definition: `To make an unpleasant or difficult situation feel less intense.`,
                    ordinary: `“A little humour made the long meeting feel less tense and difficult.”`,
                    upgraded: `“A little humour took the edge off the long meeting.”`,
                    priority: 'standard',
                    atlasPrompt: `What helps take the edge off a stressful day when the problem itself cannot be solved immediately?`
                }
            }
        ],

        makeItReal: {
            title: `Two Sides of the Same Joke`,
            prompt: `Choose a harmless moment of teasing, real or invented. Tell it first as the person making the joke, then as the person receiving it. Keep the facts the same and let the meaning change.`
        }
    }
];

const clCards = [
    {
        id: 'cl-joke-beside-throne',
        contextLine: `Royal courts · Europe and beyond`,
        title: `The Joke Beside the Throne`,
        teaser: `The entertainer stands close enough to mock the powerful.`,

        context: `Royal and noble households in Europe and elsewhere sometimes employed fools or jesters to entertain the court. A few became known for saying things other courtiers would not risk saying. Comedy and playful behaviour gave them some freedom, but not complete safety: a joke that pleased a ruler one day could still cost them their position the next.`,

        mainQuestion: `Would you take a job where you were expected to say what others feared to say, knowing your safety depended on making the ruler laugh?`,

        followTheThread: [
            `Does humour make criticism easier to hear, or easier to dismiss?`,
            `Who plays a similar role now — a comedian, a friend, a colleague, or somebody else?`
        ],

        upgrade: {
            term: `speak your mind`,
            type: `phrase`,
            definition: `To say honestly what you think, even when other people may not like it.`,
            ordinary: `“Everybody else stayed quiet, but the entertainer said exactly what he thought.”`,
            upgraded: `“Everybody else stayed quiet, but the entertainer spoke his mind.”`,
            priority: 'key',
            atlasPrompt: `When is it easy for you to speak your mind, and when do you become more careful?`
        }
    },

    {
        id: 'cl-insults-keep-peace',
        contextLine: `Niger · Joking relationships`,
        title: `Insults That Keep the Peace`,
        teaser: `Certain groups are expected to tease — and to stay friends.`,

        context: `In Niger, some families, communities, and ethnic groups are linked by recognised “joking relationships.” They may trade playful insults in markets, workplaces, weddings, or funerals. These relationships can also include duties to help one another and settle disputes peacefully. The teasing follows shared rules and history; it is not simply rudeness.`,

        mainQuestion: `Would knowing the teasing followed a shared rule make it easier to accept, or would you still wonder whether the insult was real?`,

        followTheThread: [
            `Which relationships in your own life already allow a surprising amount of teasing?`,
            `Can a joke help people tell an uncomfortable truth without starting a fight?`
        ],

        upgrade: {
            term: `no hard feelings`,
            type: `phrase`,
            definition: `Used to say that nobody remains angry or offended after disagreement, criticism, or teasing.`,
            ordinary: `“They traded insults, but neither group remained angry because both understood the rules.”`,
            upgraded: `“They traded insults, but there were no hard feelings because both groups understood the rules.”`,
            priority: 'standard',
            atlasPrompt: `When can people tease each other with no hard feelings — and what makes that possible?`
        }
    },

    {
        id: 'cl-send-joke-to-office',
        contextLine: `Britain · 1737–1968`,
        title: `Send the Joke to the Office`,
        teaser: `The audience cannot hear the line until an official approves it.`,

        context: `From 1737 until 1968, new stage plays in Britain had to be licensed by the Lord Chamberlain before public performance. The office could require cuts or refuse permission. Writers and producers had to explain why a line should remain, rewrite it, or hide a controversial meaning more carefully before the play reached an audience.`,

        mainQuestion: `If every joke in a show needed official approval, would comedy become safer, duller, or more inventive?`,

        followTheThread: [
            `Where do people already edit themselves before speaking — at work, online, or around certain relatives?`,
            `Can a forbidden joke become funnier simply because people know it is forbidden?`
        ],

        upgrade: {
            term: `tone something down`,
            type: `phrasal verb`,
            definition: `To make something less strong, extreme, or likely to offend.`,
            ordinary: `“She rewrote the scene so the criticism was less direct.”`,
            upgraded: `“She toned the scene down so the criticism was less direct.”`,
            priority: 'key',
            atlasPrompt: `When did you last tone down a message, joke, or piece of feedback before sharing it?`
        }
    },

    {
        id: 'cl-rakugo-cushion',
        contextLine: `Japan · Rakugo`,
        title: `A Whole Cast on One Cushion`,
        teaser: `One seated performer becomes every person in the story.`,

        context: `Rakugo is a traditional Japanese form of comic storytelling. A performer sits alone and tells a story, shifting voice, expression, and gaze to play different characters. A folding fan and a small cloth may stand in for different objects, while the audience follows an entire scene created mostly through language, timing, and imagination.`,

        mainQuestion: `Would you rather watch comedy with a huge stage and fast visuals, or one person creating everything from a cushion? What would hold your attention?`,

        followTheThread: [
            `What can a live storyteller do that a filmed comedy cannot?`,
            `Which matters more in a funny story: the words, the voice, or the pauses?`
        ],

        upgrade: {
            term: `bring something to life`,
            type: `phrase`,
            definition: `To make a story, idea, or character feel vivid and real.`,
            ordinary: `“With only her voice and face, she made every character feel real.”`,
            upgraded: `“With only her voice and face, she brought every character to life.”`,
            priority: 'key',
            atlasPrompt: `Who is good at bringing a story to life, and what do they do when they tell it?`
        }
    },

    {
        id: 'cl-striped-paint',
        contextLine: `Workshops and job sites · Many countries`,
        title: `Go and Find the Striped Paint`,
        teaser: `The new person is sent for a tool that does not exist.`,

        context: `A long-running workplace prank sends a newcomer to fetch an impossible item: striped paint, a left-handed screwdriver, a bucket of steam, or a “long weight.” The next person may continue the joke and send them somewhere else. For the experienced workers, the fun is shared knowledge. For the newcomer, it may feel like a welcome, a test, or a public waste of time.`,

        mainQuestion: `At what point does this become a friendly initiation — and at what point is it simply picking on the new person?`,

        followTheThread: [
            `How quickly should somebody reveal the joke?`,
            `Would you rather be fooled for five minutes or be the only person who was not included?`
        ],

        upgrade: {
            term: `be in on something`,
            type: `phrase`,
            definition: `To know about a secret, joke, or plan that other people do not know about.`,
            ordinary: `“Everybody in the workshop knew about the trick except the new employee.”`,
            upgraded: `“Everybody in the workshop was in on the trick except the new employee.”`,
            priority: 'key',
            atlasPrompt: `When were you the last person to be let in on a plan or an inside joke?`
        }
    },

    {
        id: 'cl-inocentes',
        contextLine: `Spain · 28 December`,
        title: `The News May Be Lying Today`,
        teaser: `For one day, friends and broadcasters are allowed to trick you.`,

        context: `In Spain, 28 December is the Día de los Santos Inocentes. Friends play inocentadas — practical jokes — and newspapers, broadcasters, or brands may publish invented stories. Some towns add flour fights, comic officials, dances, or other local celebrations. The date creates a temporary rule: be ready to doubt what you hear, even when it arrives in a serious voice.`,

        mainQuestion: `When everyone knows it is a day for tricks, would you forgive them more easily — or distrust everything you heard?`,

        followTheThread: [
            `Should news organisations ever join a day built around false stories?`,
            `What makes a trick enjoyable even for the person who was fooled?`
        ],

        upgrade: {
            term: `fall for something`,
            type: `phrasal verb`,
            definition: `To believe a trick, lie, or false story.`,
            ordinary: `“I believed the announcement completely until everybody started smiling.”`,
            upgraded: `“I fell for the announcement completely until everybody started smiling.”`,
            priority: 'key',
            atlasPrompt: `What false claim, excuse, or advert have you fallen for because it sounded believable?`
        }
    },

    {
        id: 'cl-audience-in-box',
        contextLine: `United States · Early television`,
        title: `The Audience in a Box`,
        teaser: `A machine decides how loudly the room should laugh.`,

        context: `When television comedy moved away from live audiences, producers began adding recorded laughter after filming. Sound engineer Charles Douglass developed a machine that could supply different reactions: a small chuckle, a bigger laugh, or a smoother response where the original sound was weak. Viewers heard an audience that had partly been created in the edit.`,

        mainQuestion: `Does recorded laughter help you enjoy a comedy, or does it feel like somebody telling you when to laugh?`,

        followTheThread: [
            `Have you ever watched a comedy without its laugh track? What changed?`,
            `Why does hearing other people laugh make a joke feel safer or funnier?`
        ],

        upgrade: {
            term: `take your cue from someone or something`,
            type: `phrase`,
            definition: `To decide how to act by watching or listening to another person or signal.`,
            ordinary: `“The viewers heard the recorded laughter and used it as a signal to laugh.”`,
            upgraded: `“The viewers took their cue from the recorded laughter.”`,
            priority: 'standard',
            atlasPrompt: `Whose reactions do people take their cue from when they enter an unfamiliar room?`
        }
    },

    {
        id: 'cl-cracker-joke',
        contextLine: `Britain and other countries · Christmas`,
        title: `The Joke Everyone Knows Will Be Bad`,
        teaser: `Paper crown on. Tiny toy out. Groan on cue.`,

        context: `At many British Christmas tables, two people pull a paper cracker until it snaps. Inside are usually a paper crown, a tiny gift, and a printed joke. The jokes are famous for being obvious, old-fashioned, or painfully simple. Someone reads one aloud, the table groans, and then another cracker is pulled.`,

        mainQuestion: `Would you keep a tradition whose jokes are meant to be bad, or replace them with jokes people might genuinely laugh at?`,

        followTheThread: [
            `Why can a bad joke be easier to share than a clever one?`,
            `What family routine survives because removing it would feel worse than repeating it?`
        ],

        upgrade: {
            term: `corny`,
            type: `adjective`,
            definition: `Too obvious, old-fashioned, or sentimental to feel clever, but sometimes enjoyable anyway.`,
            ordinary: `“The jokes are old and obvious, but everybody still reads them aloud.”`,
            upgraded: `“The jokes are corny, but everybody still reads them aloud.”`,
            priority: 'key',
            atlasPrompt: `What do you find corny but secretly enjoyable — a song, a film ending, a speech, or a greeting card?`
        }
    }
];
