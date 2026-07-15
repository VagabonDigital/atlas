/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Body Language & Emotions
  --------------------------------------------------------------------------
  A premium interactive speaking subject about the body you did not choose
  and cannot fully control: what it gives away, what it can be made to
  perform, and the handful of things it turns out to know first.
  Built for tutor-led conversation, shared-screen teaching, confession,
  playful disagreement, cultural curiosity, and sharper spoken English.
  Compass active subject · contentVersion 3.0.1
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'body-language-emotions',
    schemaVersion: 2,
    contentVersion: '3.0.1',
    title: 'Body Language & Emotions',
    titleHtml: 'Body Language <br>& <em>Emotions</em>',
    navTitle: 'Body Language',
    bgImage: 'https://denglischdocs.com/storage/media/334/01JTTQF6Y64WY47M7AJRJ1XZ5M.webp'
};

const subjectCopy = {
    cover: {
        hook: `Your face has been telling people things all day. You weren't consulted.`
    },
    overview: {
        heading: `Whose Side Is It On?`,
        intro: [
            `Your body does not always show what you want it to show. You might go red when you feel embarrassed, laugh at the wrong moment, or hide your feelings when something really matters.`
        ],
        question: `Which shows the real you more clearly: the reactions you cannot control, or the behaviour you choose?`
    },
    paths: {
        culturalLensDescription: `Reversed nods, hired mourners, a district that couldn't stop laughing, and the face you didn't choose.`,
        discussionDescription: `Going red, the laugh you couldn't hold in, the face you put on for the present, and the moment your body knew first.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to pull together what came up along the way.`
    },
    culturalLens: {
        heading: `Things Bodies Do`,
        intro: `A nod that means no. A smile the eyes refuse to join. A district that couldn't stop laughing. Some of this was learned, some of it arrived with the body — and some of it you do already, without noticing.`
    },
    discussion: {
        heading: `The One You're In`
    },
    reflection: {
        title: `Now You'll Notice`,
        summary: `Look back at what came up — the reactions you recognised, the habits you questioned, and the moments where the body seemed to know first. Notice what you would now read differently.`,
        questions: [
            `Which of your own habits did you end up defending?`,
            `Is the body worth trusting — or would you rather it kept quiet?`
        ]
    },
    keyLanguage: {
        intro: `Expressions for describing faces, habits, and the things people can't quite hide.`
    }
};

const discussionSets = [
    {
        id: 'set-body-has-its-own-ideas',
        title: `The Body Has Its Own Ideas`,
        stage: `React`,
        icon: 'react',
        description: `Going red when you cannot stop it, laughing at the worst possible moment, and tears at a television advert.`,
        moments: [
            {
                id: 'moment-going-red',
                preview: `You can feel it arriving. You can't stop it.`,
                question: `Your face goes red, everyone can see it, and worrying about it only makes it worse. Does that happen to you — or is there somebody in your life who goes bright red at nothing? What sets it off?`,
                upgrade: {
                    term: `give the game away`,
                    type: `idiom`,
                    definition: `To accidentally reveal something you were trying to keep hidden.`,
                    ordinary: `“I was trying to act completely normal, but my face made it obvious that I knew about the party.”`,
                    upgraded: `“I was trying to act normal, but my face gave the game away.”`,
                    priority: 'key',
                    atlasPrompt: `What has given the game away — a face, a laugh, a receipt, a message left open on a screen?`
                }
            },
            {
                id: 'moment-worst-possible-laugh',
                preview: `The one place you absolutely cannot laugh.`,
                question: `A funeral. An exam hall. Somebody else being told off. The moment laughing is forbidden is the moment it becomes almost impossible to stop. Where has this happened to you — and did you get away with it?`,
                upgrade: {
                    term: `keep a straight face`,
                    type: `phrase`,
                    definition: `To keep your expression serious when you want to laugh.`,
                    ordinary: `“I was desperately trying not to laugh and to keep my expression completely serious, and I failed.”`,
                    upgraded: `“I couldn't keep a straight face.”`,
                    priority: 'key',
                    atlasPrompt: `Who can keep a straight face while telling you something outrageous — and have they ever caught you out?`
                }
            },
            {
                id: 'moment-crying-at-nothing',
                preview: `An advert. A dog. A stranger's wedding.`,
                question: `Some people cry at adverts, at films they don't even like, at other people's good news. Others claim they haven't cried since 1998. Which are you — and what's the most ridiculous thing that has ever made you cry?`,
                upgrade: {
                    term: `well up`,
                    type: `phrasal verb`,
                    definition: `To start to have tears in your eyes.`,
                    ordinary: `“My eyes started filling with tears during an advert about a supermarket.”`,
                    upgraded: `“I welled up at a supermarket advert.”`,
                    priority: 'standard',
                    atlasPrompt: `What reliably makes people well up — a song, a speech, a reunion, an animal?`
                }
            },
            {
                id: 'moment-greeting-collision',
                preview: `Hand, hug, or two cheeks? Decide now.`,
                question: `You go in for a handshake; they go in for a hug. Two cheeks or three? You end up half-kissing a colleague's ear. What's your worst greeting collision — and does your country make this easy or impossible?`,
                upgrade: {
                    term: `leave someone hanging`,
                    type: `phrase`,
                    definition: `To fail to respond to someone's gesture or request, leaving them exposed.`,
                    ordinary: `“I put my hand up for a high five and nobody responded, so it just stayed there in the air.”`,
                    upgraded: `“I went for a high five and he left me hanging.”`,
                    priority: 'standard',
                    atlasPrompt: `When were you last left hanging — a message ignored, a hand out, an offer nobody took up?`
                }
            },
            {
                id: 'moment-forgetting-how-to-walk',
                preview: `They're watching you walk. How do arms work?`,
                question: `Somebody you know spots you from fifty metres away and watches you walk the whole way over. Suddenly you have no idea what your arms are supposed to be doing. When did you last become horribly aware of your own body?`,
                upgrade: {
                    term: `self-conscious`,
                    type: `adjective`,
                    definition: `Uncomfortably aware of yourself and worried about how you look to others.`,
                    ordinary: `“I suddenly became very aware of myself and started worrying about how I must look to everyone.”`,
                    upgraded: `“I suddenly felt incredibly self-conscious.”`,
                    priority: 'standard',
                    atlasPrompt: `What makes you self-conscious — photographs, your own voice, dancing, speaking English?`
                }
            }
        ],
        makeItReal: {
            title: `The five seconds you'd delete`,
            prompt: `Tell the story of a time your body embarrassed you in public — or the best one you've watched happen to somebody else. Where were you, what did the body do, who saw it, and what did you do for the rest of that day?`
        }
    },
    {
        id: 'set-putting-it-on',
        title: `Putting It On`,
        stage: `Explain`,
        icon: 'explain',
        description: `The professional smile, the firm handshake, the dance floor, and the face you make when you open the present.`,
        moments: [
            {
                id: 'moment-face-for-work',
                preview: `The smile that's part of the uniform.`,
                question: `Nurses, waiters, teachers, flight attendants, funeral directors — some jobs require you to hold a face for eight hours. Whose would be hardest for you? And what does your own face have to do at work?`,
                upgrade: {
                    term: `go through the motions`,
                    type: `phrase`,
                    definition: `To do something without real feeling, energy, or belief in it.`,
                    ordinary: `“She said all the right things and smiled at everyone, but there was clearly no real feeling behind any of it.”`,
                    upgraded: `“She said all the right things, but she was clearly just going through the motions.”`,
                    priority: 'key',
                    atlasPrompt: `Where do you catch yourself going through the motions — a meeting, a gym, a class, a Sunday phone call?`
                }
            },
            {
                id: 'moment-firm-handshake',
                preview: `Firm grip. Steady eyes. Straight back.`,
                question: `Grip the hand firmly. Hold the eye contact. Sit up. Stand like a superhero in the toilets beforehand. How much of this actually works — and how much is theatre we've all quietly agreed to take seriously?`,
                upgrade: {
                    term: `overdo it`,
                    type: `phrase`,
                    definition: `To do something far more than is necessary or appropriate.`,
                    ordinary: `“He gripped my hand so hard, and for so much longer than necessary, that it became uncomfortable.”`,
                    upgraded: `“He completely overdid the handshake.”`,
                    priority: 'standard',
                    atlasPrompt: `Who overdoes it — the aftershave, the apologies, the emojis, the confidence?`
                }
            },
            {
                id: 'moment-dance-floor',
                preview: `They cannot be stopped. Or you cannot be moved.`,
                question: `Some people are on the dance floor before the music starts. Others would sooner resign than be pulled onto one. Which are you — and what exactly would it take to get you up?`,
                upgrade: {
                    term: `let your hair down`,
                    type: `idiom`,
                    definition: `To relax completely and enjoy yourself without worrying what people think.`,
                    ordinary: `“She finally stopped worrying about what everybody thought of her and just enjoyed herself.”`,
                    upgraded: `“She finally let her hair down.”`,
                    priority: 'key',
                    atlasPrompt: `Where can you actually let your hair down — and who would you never do it in front of?`
                }
            },
            {
                id: 'moment-opening-the-present',
                preview: `You have half a second to look delighted.`,
                question: `The present is horrible. The food is worse. Somebody is showing you four hundred photographs of a baby. You have half a second to arrange your face. Are you any good at this — and who do you know who absolutely is not?`,
                upgrade: {
                    term: `pull it off`,
                    type: `phrase`,
                    definition: `To succeed at something difficult that you might easily have failed at.`,
                    ordinary: `“I tried very hard to look delighted, but I don't think anybody actually believed me.”`,
                    upgraded: `“I tried to look delighted, but I don't think I pulled it off.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you only just pulled off — a presentation, a recipe, a lie, an outfit?`
                }
            },
            {
                id: 'moment-sit-up-straight',
                preview: `“Sit up straight.” Somebody trained you.`,
                question: `Sit up. Don't slouch. Elbows off the table. Don't point. Somebody trained your body when you were small, and some of it stuck. Who was it, what did they insist on — and do you still do it?`,
                upgrade: {
                    term: `drum something into someone`,
                    type: `phrasal verb`,
                    definition: `To teach someone something by repeating it until they can never forget it.`,
                    ordinary: `“My grandmother repeated it so many times, over so many years, that I still do it without thinking.”`,
                    upgraded: `“My grandmother drummed it into me.”`,
                    priority: 'standard',
                    atlasPrompt: `What was drummed into you as a child that you still do — manners, spelling, road safety, saving money?`
                }
            }
        ],
        makeItReal: {
            title: `The face you had to put on`,
            prompt: `Choose one time you had to physically perform something you didn't feel — confidence, delight, calm, sympathy, interest. What did you actually do with your face, your hands, your voice? And did anybody see through you?`
        }
    },
    {
        id: 'set-what-it-gets-right',
        title: `What It Gets Right`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The feeling you couldn't explain, the person who changes a room, and what twenty years have quietly done to your knees.`,
        moments: [
            {
                id: 'moment-something-was-off',
                preview: `No reason. Just: no.`,
                question: `A house, a job, a person — and something in you said no before you had a single reason. Were you right? Or do we only remember the times we were, and quietly forget the rest?`,
                upgrade: {
                    term: `something doesn't sit right`,
                    type: `phrase`,
                    definition: `To feel that something is wrong about a situation without being able to explain why.`,
                    ordinary: `“I couldn't explain what was wrong with the offer, but something about it made me uneasy.”`,
                    upgraded: `“I couldn't explain it, but something about the offer didn't sit right with me.”`,
                    priority: 'key',
                    atlasPrompt: `When did something not sit right with you — a deal, an explanation, a story that didn't quite add up?`
                }
            },
            {
                id: 'moment-changes-a-room',
                preview: `They walk in. The room adjusts.`,
                question: `Some people walk into a room and everybody quietly reorganises around them, and they haven't said a word. Who is yours? And could you learn to do it, or do you either have it or you don't?`,
                upgrade: {
                    term: `presence`,
                    type: `noun`,
                    definition: `A quality that makes people notice you and take you seriously.`,
                    ordinary: `“He hardly says anything, but people go quiet and pay attention the moment he walks in.”`,
                    upgraded: `“He hardly says anything, but he's got real presence.”`,
                    priority: 'standard',
                    atlasPrompt: `Who has presence where you work — and is it rank, size, calm, or something else entirely?`
                }
            },
            {
                id: 'moment-who-gets-to-touch-you',
                preview: `The hugger. The hand on the arm. The one who leans in.`,
                question: `The colleague who hugs. The relative who holds your face. One friend puts a hand on your arm and it's fine; another does exactly the same thing and you want to leave the country. Who gets allowed closer — in your life, or in a group you know — and how did they earn it?`,
                upgrade: {
                    term: `keep someone at arm's length`,
                    type: `idiom`,
                    definition: `To deliberately avoid becoming close to someone.`,
                    ordinary: `“I'm perfectly polite to him, but I make sure we never actually become close.”`,
                    upgraded: `“I'm polite to him, but I keep him at arm's length.”`,
                    priority: 'key',
                    atlasPrompt: `When might someone keep another person at arm's length — politeness, history, caution, or simple lack of trust?`
                }
            },
            {
                id: 'moment-good-news-arrives',
                preview: `The news is good. Nothing happens.`,
                question: `The call comes and the result is good. Some people scream and run. Others say “oh, right,” go and put the kettle on, and only feel it three hours later in the car. Which one are you, and when did you last find out?`,
                upgrade: {
                    term: `sink in`,
                    type: `phrasal verb`,
                    definition: `(Of news) to become fully understood or believed, often slowly.`,
                    ordinary: `“I heard the news, but it took a long time before I really understood and believed that it had happened.”`,
                    upgraded: `“I heard the news, but it took days to sink in.”`,
                    priority: 'standard',
                    atlasPrompt: `What news took the longest to sink in — and what finally made it real?`
                }
            },
            {
                id: 'moment-what-the-years-did',
                preview: `The knee. The back. The three-day hangover.`,
                question: `Bodies change what they can do, and sometimes how people read them. What change have you noticed in yourself or someone around you — and did it change how much room other people gave them?`,
                upgrade: {
                    term: `take its toll`,
                    type: `phrase`,
                    definition: `To cause gradual damage over a long period.`,
                    ordinary: `“Twenty years of standing on concrete all day has slowly damaged his knees.”`,
                    upgraded: `“Twenty years on his feet has taken its toll on his knees.”`,
                    priority: 'standard',
                    atlasPrompt: `What takes its toll on people where you work — the hours, the standing, the travel, the noise?`
                }
            }
        ],
        makeItReal: {
            title: `The one you'd want in the room`,
            prompt: `Think of somebody you would want physically beside you in a difficult hour — a hospital corridor, a hard meeting, bad news. Not what they'd say. What they'd do with their body. Who is it, and what is it about the way they are in a room?`
        }
    }
];

const clCards = [
    {
        id: 'cl-bulgaria-nod',
        contextLine: `Bulgaria`,
        title: `The Nod That Means No`,
        teaser: `You ask, they nod, and you have just been turned down.`,
        context: `In Bulgaria and parts of the surrounding region, the head does the opposite of what most visitors expect. A nod can mean no. A shake can mean yes. Knowing the rule barely helps: the movement arrives faster than the rule does, and your instinct keeps reading the wrong answer off somebody's head while their words say the other thing.`,
        mainQuestion: `Their words say yes and their head says no. Which one does your gut believe in the moment — and which one would you act on?`,
        followTheThread: [
            `What gesture of yours feels so obvious that you'd assume the whole world does it?`,
            `Where else does your instinct override something you already know to be true?`
        ],
        upgrade: {
            term: `throw someone off`,
            type: `phrasal verb`,
            definition: `To confuse or unsettle someone because something is not what they expected.`,
            ordinary: `“The reversed nod confused me so badly that I couldn't follow the rest of the conversation.”`,
            upgraded: `“The reversed nod completely threw me off.”`,
            priority: 'standard',
            atlasPrompt: `What throws you off in a conversation — an accent, a long silence, a question you weren't expecting?`
        }
    },
    {
        id: 'cl-face-at-rest',
        contextLine: `The face at rest`,
        title: `The Face That Isn't Doing Anything`,
        teaser: `Some faces, doing nothing at all, look absolutely furious.`,
        context: `Some people have a face that, at rest, reads as angry, unimpressed, or about to say something cutting. They are usually thinking about lunch. They spend their lives being asked what's wrong, being told to cheer up, and being handed apologies for things they were never annoyed about in the first place.`,
        mainQuestion: `Whose face gets them into trouble — yours, or somebody you know? And is that their problem to fix, or everyone else's problem to read better?`,
        followTheThread: [
            `Have you ever completely misjudged somebody's mood from their face alone?`,
            `Do you owe the world a pleasant face, or is that a bill nobody should have to pay?`
        ],
        upgrade: {
            term: `get off on the wrong foot`,
            type: `idiom`,
            definition: `To start a relationship badly, often because of a bad first impression.`,
            ordinary: `“The whole relationship started badly because from the first day he thought I disliked him.”`,
            upgraded: `“We got off on the wrong foot because he thought I disliked him.”`,
            priority: 'standard',
            atlasPrompt: `Who did you get off on the wrong foot with — and did you ever recover it?`
        }
    },
    {
        id: 'cl-smile-that-wouldnt-work',
        contextLine: `Paris · 1862`,
        title: `The Smile That Wouldn't Work`,
        teaser: `He made the face smile using electricity. Nobody believed it.`,
        context: `In the 1860s, French neurologist Guillaume Duchenne used electrical stimulation and photography to map the muscles of facial expression. Lifting the mouth could produce a smile-like shape, but activity around the eyes changed how warm and convincing it appeared. That distinction later became associated with the “Duchenne smile” — although it is not a perfect test of what somebody genuinely feels.`,
        mainQuestion: `Would you actually want to be able to tell a real smile from a polite one — or is not knowing quietly doing you a favour?`,
        followTheThread: [
            `Whose polite smiles would you rather not be able to see through?`,
            `Is a polite smile a small lie, or a small kindness?`
        ],
        upgrade: {
            term: `see through someone`,
            type: `phrase`,
            definition: `To realise that someone is not being honest or sincere.`,
            ordinary: `“He said all the right things, but I could tell immediately that he wasn't being sincere.”`,
            upgraded: `“He said all the right things, but I saw straight through him.”`,
            priority: 'key',
            atlasPrompt: `Who can see straight through you — and what is it that gives you away?`
        }
    },
    {
        id: 'cl-lift-rule',
        contextLine: `Lifts everywhere`,
        title: `Face the Doors. Don't Talk.`,
        teaser: `Nobody taught you this. Everybody obeys it.`,
        context: `Step into a lift and something takes over. You turn and face the doors. You stop talking, or drop to half volume. You find the floor numbers suddenly fascinating. And if somebody steps in and stands facing the back, calmly looking at everyone, the discomfort is almost physical.`,
        mainQuestion: `Where else do you follow a rule nobody ever taught you — and what happens to the person who breaks it?`,
        followTheThread: [
            `Could you genuinely stand in a lift facing the wrong way for six floors?`,
            `Which of these rules would you defend, and which are just cowardice?`
        ],
        upgrade: {
            term: `an unwritten rule`,
            type: `noun`,
            definition: `A rule everyone follows although nobody has ever stated it.`,
            ordinary: `“Nobody ever said it out loud, but everybody knew you never sat in the chair at the head of the table.”`,
            upgraded: `“There was an unwritten rule that you never took the chair at the head of the table.”`,
            priority: 'standard',
            atlasPrompt: `What's the unwritten rule where you work — the chair, the kitchen, the group chat, the time you're allowed to leave?`
        }
    },
    {
        id: 'cl-hired-grief',
        contextLine: `Professional mourners`,
        title: `Somebody Paid to Cry`,
        teaser: `The louder the funeral, the more the dead were loved.`,
        context: `Families have hired professional mourners for thousands of years, and in parts of the world still do. They arrive, they weep, they wail, they lead the room, and in some places a band comes with them. A quiet funeral can suggest a life that mattered to nobody — and the hired grief is there to make sure nobody thinks that.`,
        mainQuestion: `At your own funeral, would you want everybody holding themselves together — or would you want the noise?`,
        followTheThread: [
            `Is paid grief fake, or is it a service that gives everyone else permission?`,
            `Where you're from, is somebody who cries openly at a funeral respected, or quietly judged?`
        ],
        upgrade: {
            term: `break down`,
            type: `phrasal verb`,
            definition: `To lose control of your emotions and start crying.`,
            ordinary: `“She got halfway through the speech and then completely lost control and started crying.”`,
            upgraded: `“She got halfway through the speech and broke down.”`,
            priority: 'key',
            atlasPrompt: `Where is it acceptable to break down in public where you live — and where is it definitely not?`
        }
    },
    {
        id: 'cl-laughter-epidemic',
        contextLine: `Tanganyika · 1962`,
        title: `The Village That Couldn't Stop`,
        teaser: `It started with three schoolgirls. It closed the school.`,
        context: `In 1962, episodes of uncontrollable laughter and other distress symptoms affected pupils at a girls' school in Tanganyika, now Tanzania, and later appeared in nearby communities. Schools closed as the outbreak continued. Researchers have generally discussed it as a form of mass psychogenic illness linked to stress, rather than ordinary contagious amusement.`,
        mainQuestion: `Have you ever felt a room's mood enter your own body before you had time to decide — laughter, panic, tension, or relief? What happened?`,
        followTheThread: [
            `Whose mood spreads fastest in a room you know, and do they have any idea they're doing it?`,
            `Is catching other people's feelings a strength or a weakness?`
        ],
        upgrade: {
            term: `set someone off`,
            type: `phrasal verb`,
            definition: `To cause someone to start doing something, especially laughing or crying, often uncontrollably.`,
            ordinary: `“One person started laughing, and within a minute it had caused everybody else to start as well.”`,
            upgraded: `“One person started, and it set everybody else off.”`,
            priority: 'key',
            atlasPrompt: `Who sets you off laughing when you absolutely must not — and how do they do it?`
        }
    },
    {
        id: 'cl-lowered-eyes',
        contextLine: `The interview room`,
        title: `The Eyes That Cost You the Job`,
        teaser: `Taught at home that looking down is respect. Read in the room as evasion.`,
        context: `In many homes, meeting the eye of a teacher, an elder, or a boss is bold to the point of rudeness, and lowering your gaze is exactly how respect is shown. That same young person then sits down in an interview, or a courtroom, opposite somebody raised to treat a steady gaze as proof of honesty — and is read as shifty.`,
        mainQuestion: `Somebody won't meet your eye. What's your first thought — and how much money would you actually bet on it?`,
        followTheThread: [
            `Have you ever felt judged for looking at someone too much, or not enough?`,
            `Is a steady gaze proof of honesty, or only proof of confidence?`
        ],
        upgrade: {
            term: `meet someone's eye`,
            type: `phrase`,
            definition: `To look directly into someone's eyes, often when it is difficult to do so.`,
            ordinary: `“I felt so guilty that I couldn't look directly at her for the whole of the rest of the evening.”`,
            upgraded: `“I felt so guilty that I couldn't meet her eye all evening.”`,
            priority: 'key',
            atlasPrompt: `When might someone find it hard to meet another person's eye — guilt, bad news, attraction, or being told off?`
        }
    },
    {
        id: 'cl-pose-nobody-taught',
        contextLine: `The Paralympic Games`,
        title: `The Pose Nobody Taught Them`,
        teaser: `Arms up, head back, chest out — from athletes who have never seen it done.`,
        context: `Researchers photographed judo athletes at the moment of victory. The competitors who had been blind from birth threw their arms up, tipped their heads back and pushed their chests out — the same shape as everyone else, though not one of them had ever seen a human being win anything.`,
        mainQuestion: `So some of the body comes as standard and some of it is taught. Which of your own reactions do you think you'd still have if you'd been raised on the other side of the world?`,
        followTheThread: [
            `Is there anything you can genuinely stop your body doing once it has started?`,
            `Does it change anything to learn that a reaction was never really yours?`
        ],
        upgrade: {
            term: `instinctive`,
            type: `adjective`,
            definition: `Happening automatically, without any thought or decision.`,
            ordinary: `“I didn't decide to do it — my hands were in the air before I had any time to think at all.”`,
            upgraded: `“It was completely instinctive — my hands were up before I could think.”`,
            priority: 'standard',
            atlasPrompt: `What's your instinctive reaction to bad news — go quiet, get busy, make a joke, call somebody?`
        }
    },
    {
        id: 'cl-frozen-face',
        contextLine: `The frozen face`,
        title: `Switch Your Face Off`,
        teaser: `If your face can't move, can you still read anyone else's?`,
        context: `People who have their facial muscles paralysed for cosmetic reasons report a strange side effect. Some studies suggest they become slightly worse at reading emotion in other faces, and describe feeling a little less themselves. One theory is that we understand other people partly by copying them — a tiny, invisible flicker of their expression running across our own.`,
        mainQuestion: `A switch that stops your face from ever showing anything again. Do you take it — and what exactly would you be giving up?`,
        followTheThread: [
            `Who would you most like to be completely unreadable in front of?`,
            `Would people trust a face that never moved, or run from it?`
        ],
        upgrade: {
            term: `give nothing away`,
            type: `phrase`,
            definition: `To show no sign at all of what you are thinking or feeling.`,
            ordinary: `“Whatever he was feeling, his face showed absolutely no sign of it at any point.”`,
            upgraded: `“Whatever he was feeling, his face gave nothing away.”`,
            priority: 'standard',
            atlasPrompt: `Who do you know who gives nothing away — in a negotiation, a card game, or a family argument?`
        }
    }
];
