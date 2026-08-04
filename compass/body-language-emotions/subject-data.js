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
  Compass active subject · contentVersion 3.2.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'body-language-emotions',
    schemaVersion: 2,
    contentVersion: '3.2.0',
    title: 'Body Language & Emotions',
    titleHtml: 'Body Language <br>& <em>Emotions</em>',
    navTitle: 'Body Language',
    bgImage: 'https://denglischdocs.com/storage/media/334/01JTTQF6Y64WY47M7AJRJ1XZ5M.webp'
};

const subjectCopy = {
    cover: {
        hook: `Your face has been telling people things all day. You weren’t consulted.`
    },

    overview: {
        heading: `Before You Say Anything`,
        intro: [
            `Bodies reveal and perform emotion before words arrive, while people sometimes misread what they see. A face, posture, laugh, or silence can expose something real, create an impression, or mean something completely different to another person.`
        ],
        question: `What do you notice first in someone’s body language — and how much do you trust that first reading?`
    },

    paths: {
        culturalLensDescription: `Explore gestures, expressions, and physical reactions whose meanings change across cultures, situations, and bodies.`,
        discussionDescription: `The reactions you cannot hide, the expressions you perform, and the moments when the body seems to know first.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to reconsider what bodies reveal, what people perform, and what may be misread.`
    },

    culturalLens: {
        heading: `What Bodies Have Meant`,
        intro: `The same nod, gaze, smile, or silence can be understood very differently. Step into situations where bodies follow unfamiliar rules, spread emotion through a room, or react in ways nobody appears to have taught them.`
    },

    discussion: {
        heading: `The One You’re In`
    },

    reflection: {
        title: `What Will You Notice Now?`,
        summary: `Look back at the reactions, performances, and physical signals that became more visible during the conversation.`,
        questions: [
            `Which habit or reaction from the conversation would you now notice differently in yourself or someone else?`,
            `When should you trust what a body seems to say — and when should you ask before deciding?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing involuntary reactions, performed emotions, social signals, and what people cannot quite hide.`
    }
};

const discussionSets = [
    {
        id: 'set-body-has-its-own-ideas',
        title: `The Body Has Its Own Ideas`,
        stage: `First Look`,
        icon: 'first-look',
        description: `The reactions that arrive first, the moments you cannot hide, and the sudden awareness of being watched.`,

        moments: [
            {
                id: 'moment-what-gives-you-away',
                preview: `Your body knew before you were ready.`,

                question: `When you try to hide embarrassment, excitement, or a secret, what gives you away first — your face, voice, hands, or something else? Think of one time somebody noticed before you admitted anything.`,

                upgrade: {
                    term: `give the game away`,
                    type: `idiom`,
                    definition: `To accidentally reveal something you were trying to keep hidden.`,
                    ordinary: `“I was trying to act normal, but my face made it obvious that I knew about the surprise.”`,
                    upgraded: `“I was trying to act normal, but my face gave the game away.”`,
                    priority: 'key',
                    atlasPrompt: `What has given the game away — a laugh, a receipt, a message, or something left open on a screen?`
                }
            },
            {
                id: 'moment-worst-possible-laugh',
                preview: `The one place you absolutely cannot laugh.`,

                question: `Where have you had to stop yourself laughing because the moment was completely wrong — a funeral, an exam hall, a meeting, or somebody being told off? What happened when you tried to hide it?`,

                upgrade: {
                    term: `keep a straight face`,
                    type: `phrase`,
                    definition: `To keep your expression serious when you want to laugh.`,
                    ordinary: `“I tried to keep my expression serious, but one look at my friend finished me.”`,
                    upgraded: `“I tried to keep a straight face, but one look at my friend finished me.”`,
                    priority: 'key',
                    atlasPrompt: `Who can never keep a straight face when they are supposed to be serious?`
                }
            },
            {
                id: 'moment-crying-at-nothing',
                preview: `An advert. A dog. A stranger’s wedding.`,

                question: `What unexpectedly makes you emotional — an advert, a song, an animal, or somebody else’s good news? Which reaction has surprised you most?`,

                upgrade: {
                    term: `well up`,
                    type: `phrasal verb`,
                    definition: `To begin to have tears in your eyes.`,
                    ordinary: `“My eyes started filling with tears during an advert about a supermarket.”`,
                    upgraded: `“I welled up during an advert about a supermarket.”`,
                    priority: 'standard',
                    atlasPrompt: `What reliably makes people well up — a reunion, a speech, a song, or an animal?`
                }
            },
            {
                id: 'moment-greeting-collision',
                preview: `Hand, hug, or two cheeks? Decide now.`,

                question: `What is your worst greeting collision — a handshake, a hug, the wrong number of cheek kisses, or a high five nobody saw coming? What did each person think was about to happen?`,

                upgrade: {
                    term: `leave someone hanging`,
                    type: `phrase`,
                    definition: `To fail to respond to somebody’s gesture or request, leaving them exposed.`,
                    ordinary: `“I raised my hand for a high five, but nobody responded.”`,
                    upgraded: `“I raised my hand for a high five, but he left me hanging.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you been left hanging — by an unanswered message, an ignored offer, or a gesture nobody returned?`
                }
            },
            {
                id: 'moment-forgetting-how-to-walk',
                preview: `They are watching you. How do arms work?`,

                question: `When have you suddenly become painfully aware of your own body because somebody was watching — while walking, dancing, posing for a photograph, or speaking in front of people? What changed the moment you noticed them?`,

                upgrade: {
                    term: `self-conscious`,
                    type: `adjective`,
                    definition: `Uncomfortably aware of yourself and worried about how you appear to others.`,
                    ordinary: `“As soon as I noticed everybody watching, I became uncomfortable and started thinking about every movement.”`,
                    upgraded: `“As soon as I noticed everybody watching, I became incredibly self-conscious.”`,
                    priority: 'standard',
                    atlasPrompt: `What makes you self-conscious — photographs, dancing, your own voice, or speaking English?`
                }
            }
        ],

        makeItReal: {
            title: `The Five Seconds You’d Delete`,
            prompt: `Reconstruct one public moment when a body betrayed its owner — yours or somebody else’s. Tell it in slow motion: what happened first, what the body did next, who noticed, and how the person tried to recover.`
        }
    },

    {
        id: 'set-putting-it-on',
        title: `Putting It On`,
        stage: `Closer Look`,
        icon: 'closer-look',
        description: `The expressions people perform, the impressions bodies create, and the rules learned through repetition.`,

        moments: [
            {
                id: 'moment-face-for-work',
                preview: `The smile that is part of the uniform.`,

                question: `Which job would require the hardest expression to hold for eight hours — nurse, waiter, teacher, flight attendant, or another one? What would that person have to hide?`,

                followUp: {
                    id: 'say-it-two-ways',
                    kind: 'go-deeper',
                    prompt: `A waiter is exhausted near the end of a long shift. Say “I’m good, thanks” once professionally, then again so we can hear how tired they really are.`
                },

                upgrade: {
                    term: `put on a front`,
                    type: `phrase`,
                    definition: `To hide how you really feel by behaving as if you are calm, confident, or unaffected.`,
                    ordinary: `“She looked calm and cheerful with the customers, even though she was exhausted.”`,
                    upgraded: `“She put on a calm front with the customers, even though she was exhausted.”`,
                    priority: 'key',
                    atlasPrompt: `When do people put on a front — at work, during an argument, with family, or when meeting somebody new?`
                }
            },
            {
                id: 'moment-read-the-screen',
                preview: `You are both already giving an impression.`,

                question: `Look at your tutor’s posture and expression. What impression do they give right now? Check whether you read them correctly, then let them read you.`,

                upgrade: {
                    term: `come across as`,
                    type: `phrasal verb`,
                    definition: `To give other people a particular impression of your character or mood.`,
                    ordinary: `“Her posture made her seem confident, although she was actually nervous.”`,
                    upgraded: `“She came across as confident, although she was actually nervous.”`,
                    priority: 'key',
                    atlasPrompt: `How do you want to come across when meeting somebody for the first time?`
                }
            },
            {
                id: 'moment-dance-floor',
                preview: `Build the exact conditions.`,

                question: `What exact combination could get you onto a dance floor — the right song, the right people, enough space, or nobody watching? Build the conditions, or explain why nothing would work.`,

                upgrade: {
                    term: `let your hair down`,
                    type: `idiom`,
                    definition: `To relax completely and enjoy yourself without worrying what people think.`,
                    ordinary: `“She stopped worrying about how she looked and finally began enjoying herself.”`,
                    upgraded: `“She finally let her hair down.”`,
                    priority: 'key',
                    atlasPrompt: `Where can you genuinely let your hair down — and who helps you do it?`
                }
            },
            {
                id: 'moment-opening-the-present',
                preview: `You have five seconds to look delighted.`,

                question: `The present is horrible and the person who gave it to you is watching your face. What do you do in the first five seconds? Try the expression you would use — would your tutor believe it?`,

                upgrade: {
                    term: `pull it off`,
                    type: `phrasal verb`,
                    definition: `To succeed at something difficult that could easily have failed.`,
                    ordinary: `“I tried to look delighted, but I do not think anybody believed me.”`,
                    upgraded: `“I tried to look delighted, but I do not think I pulled it off.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you only just pulled off — a presentation, a meal, an excuse, or a difficult piece of clothing?`
                }
            },
            {
                id: 'moment-sit-up-straight',
                preview: `Somebody trained your body.`,

                question: `What body rule was repeated to you as a child — sit up straight, do not point, keep your elbows off the table, or look at people when they speak? Show or describe the habit that survived.`,

                upgrade: {
                    term: `drum something into someone`,
                    type: `phrasal verb`,
                    definition: `To teach something through frequent and forceful repetition.`,
                    ordinary: `“My grandmother repeated that rule so often that I still follow it without thinking.”`,
                    upgraded: `“My grandmother drummed that rule into me.”`,
                    priority: 'standard',
                    atlasPrompt: `What was drummed into you as a child — manners, spelling, saving money, or road safety?`
                }
            }
        ],

        makeItReal: {
            title: `The Face You Had to Put On`,
            prompt: `Choose a moment when you had to perform confidence, calm, delight, sympathy, or interest. Show or describe the face, posture, hands, and voice you used, then decide which part was least convincing.`
        }
    },

    {
        id: 'set-what-it-knows-first',
        title: `What It Knows First`,
        stage: `Wider View`,
        icon: 'wider-view',
        description: `Warnings without reasons, people who alter a room, delayed feelings, physical boundaries, and the marks that life leaves.`,

        moments: [
            {
                id: 'moment-something-was-off',
                preview: `No clear reason. Just: no.`,

                question: `When has your body warned you before you had a clear reason — about a person, place, offer, or situation? What happened next, and were you right to trust the feeling?`,

                upgrade: {
                    term: `something doesn’t sit right`,
                    type: `phrase`,
                    definition: `Used when something feels wrong although you cannot clearly explain why.`,
                    ordinary: `“I could not explain what was wrong with the offer, but it made me uneasy.”`,
                    upgraded: `“I could not explain it, but something about the offer did not sit right with me.”`,
                    priority: 'key',
                    atlasPrompt: `When has something not sat right with you — an explanation, a deal, a story, or somebody’s behaviour?`
                }
            },
            {
                id: 'moment-changes-a-room',
                preview: `They enter. The room adjusts.`,

                question: `Think of somebody whose presence changes a room before they speak. What do they do with their body — where they stand, how they move, or where they look? Which of those behaviours could another person learn?`,

                upgrade: {
                    term: `presence`,
                    type: `noun`,
                    definition: `A quality that makes people notice somebody and take them seriously.`,
                    ordinary: `“He hardly speaks, but people notice him and pay attention as soon as he enters.”`,
                    upgraded: `“He hardly speaks, but he has real presence.”`,
                    priority: 'standard',
                    atlasPrompt: `Who has real presence in a group you know, and what creates it?`
                }
            },
            {
                id: 'moment-who-gets-to-touch-you',
                preview: `The same gesture. A completely different feeling.`,

                question: `Why can the same touch feel comfortable from one person and wrong from another — a hug, a hand on the arm, or somebody standing very close? What changes the meaning?`,

                upgrade: {
                    term: `cross a line`,
                    type: `idiom`,
                    definition: `To behave in a way that goes beyond what is acceptable or comfortable.`,
                    ordinary: `“A hand on the arm felt friendly from one person, but uncomfortable and inappropriate from another.”`,
                    upgraded: `“A hand on the arm felt friendly from one person, but from another it crossed a line.”`,
                    priority: 'key',
                    atlasPrompt: `When can a friendly gesture cross a line — because of the person, the place, the timing, or the relationship?`
                }
            },
            {
                id: 'moment-good-news-arrives',
                preview: `The news is good. Nothing happens yet.`,

                question: `When good news arrives, do you react immediately or only feel it later? Think of one moment when your body stayed surprisingly calm — or reacted before you understood what had happened.`,

                upgrade: {
                    term: `sink in`,
                    type: `phrasal verb`,
                    definition: `To become fully understood or believed, often gradually.`,
                    ordinary: `“I heard the news immediately, but it took several days before it felt real.”`,
                    upgraded: `“I heard the news immediately, but it took several days to sink in.”`,
                    priority: 'standard',
                    atlasPrompt: `What news took a long time to sink in — and what finally made it feel real?`
                }
            },
            {
                id: 'moment-work-left-a-mark',
                preview: `The job is visible before they tell you.`,

                question: `What kind of work or daily routine leaves a visible mark on the body — in somebody’s hands, posture, voice, sleep, or movement? What clues might you notice before they told you about their work or routine?`,

                upgrade: {
                    term: `take its toll`,
                    type: `phrase`,
                    definition: `To cause gradual harm or exhaustion over time.`,
                    ordinary: `“Years of standing on concrete all day gradually damaged his knees.”`,
                    upgraded: `“Years of standing on concrete all day took their toll on his knees.”`,
                    priority: 'standard',
                    atlasPrompt: `What can take its toll over time — long hours, travel, stress, noise, or caring for somebody?`
                }
            }
        ],

        makeItReal: {
            title: `The One You’d Want in the Room`,
            prompt: `Choose somebody you would want beside you during a difficult hour. Describe only what they would do with their body — where they would sit, how close they would be, and what their face and hands would do.`
        }
    }
];

const clCards = [
    {
        id: 'cl-bulgaria-nod',
        contextLine: `Bulgaria`,
        title: `The Nod That Means No`,
        teaser: `You ask, they nod, and you have just been turned down.`,

        context: `In Bulgaria, traditional head gestures can reverse what many visitors expect: a nod may mean no, while a side-to-side movement may mean yes. You ask a question, hear one answer, and see what looks like the opposite. Even when you know the rule, your first instinct may still misread the movement.`,

        mainQuestion: `Their words say yes, but the head movement looks like no to you. Which signal would you trust first — and how would you check?`,

        followTheThread: [
            `What gesture feels so obvious to you that you would expect the whole world to understand it?`,
            `When else does your first instinct override something you already know?`
        ],

        upgrade: {
            term: `throw someone off`,
            type: `phrasal verb`,
            definition: `To confuse or unsettle someone because something is not what they expected.`,
            ordinary: `“The reversed nod confused me so badly that I could not follow the rest of the conversation.”`,
            upgraded: `“The reversed nod completely threw me off.”`,
            priority: 'standard',
            atlasPrompt: `What throws you off in a conversation — an accent, a long silence, or an unexpected question?`
        }
    },

    {
        id: 'cl-face-at-rest',
        contextLine: `The face at rest`,
        title: `The Face That Isn’t Doing Anything`,
        teaser: `Some faces, doing nothing at all, look absolutely furious.`,

        context: `Some people naturally look angry, bored, or unimpressed when their face is relaxed. They may simply be thinking about lunch, yet people keep asking what is wrong, telling them to cheer up, or apologising for offences that never happened.`,

        mainQuestion: `Whose resting face gets them into trouble — yours or someone you know? Should they change it, or should other people learn to read it better?`,

        followTheThread: [
            `Have you ever completely misjudged somebody’s mood from their face alone?`,
            `Do you owe the world a pleasant face, or should people stop expecting one?`
        ],

        upgrade: {
            term: `get off on the wrong foot`,
            type: `idiom`,
            definition: `To start a relationship badly, often because of a poor first impression.`,
            ordinary: `“The relationship started badly because he thought from the first day that I disliked him.”`,
            upgraded: `“We got off on the wrong foot because he thought I disliked him.”`,
            priority: 'standard',
            atlasPrompt: `Who did you get off on the wrong foot with — and did the relationship ever recover?`
        }
    },

    {
        id: 'cl-smile-that-wouldnt-work',
        contextLine: `Paris · 1862`,
        title: `The Smile That Wouldn’t Work`,
        teaser: `He made the face smile using electricity. Nobody believed it.`,

        context: `In the 1860s, French neurologist Guillaume Duchenne used small electrical currents to move facial muscles while photographs were taken. Raising the mouth produced a smile-like shape. When the muscles around the eyes moved too, it looked warmer and more convincing. This became known as the “Duchenne smile”, although it cannot prove what someone feels.`,

        mainQuestion: `Would you actually want to recognise the difference between a genuine smile and a polite one — or is not knowing quietly doing you a favour?`,

        followTheThread: [
            `Whose polite smiles would you rather not be able to see through?`,
            `Is a polite smile a small lie, or a small kindness?`
        ],

        upgrade: {
            term: `see through someone`,
            type: `phrasal verb`,
            definition: `To recognise that someone is hiding the truth or not being sincere.`,
            ordinary: `“He said all the right things, but I could tell immediately that he was not being sincere.”`,
            upgraded: `“He said all the right things, but I saw straight through him.”`,
            priority: 'key',
            atlasPrompt: `Who can see straight through you — and what usually gives you away?`
        }
    },

    {
        id: 'cl-lift-rule',
        contextLine: `Lifts everywhere`,
        title: `Face the Doors. Don’t Talk.`,
        teaser: `Nobody taught you this. Everybody obeys it.`,

        context: `Step into a lift and something takes over. You turn and face the doors. You stop talking, or drop to half volume. You find the floor numbers suddenly fascinating. If somebody enters, faces the back, and calmly looks at everyone, the discomfort is almost physical.`,

        mainQuestion: `Where else do you follow a rule nobody ever taught you — and what happens to the person who breaks it?`,

        followTheThread: [
            `Could you genuinely stand in a lift facing the wrong way for six floors?`,
            `Which social rules protect other people’s comfort, and which exist only because nobody wants to stand out?`
        ],

        upgrade: {
            term: `an unwritten rule`,
            type: `phrase`,
            definition: `A rule everyone follows although nobody has officially stated it.`,
            ordinary: `“Nobody ever said it aloud, but everybody knew that you never sat in the chair at the head of the table.”`,
            upgraded: `“There was an unwritten rule that you never took the chair at the head of the table.”`,
            priority: 'standard',
            atlasPrompt: `What is the unwritten rule where you work — about the kitchen, the group chat, a particular chair, or the time people leave?`
        }
    },

    {
        id: 'cl-hired-grief',
        contextLine: `Professional mourners`,
        title: `Somebody Paid to Cry`,
        teaser: `The louder the funeral, the more the dead were loved.`,

        context: `At some funerals, professional mourners arrive to weep, wail, or lead the room. Families have paid for this work for thousands of years, and the practice still exists in parts of the world. In some places, a quiet funeral may suggest that the dead person was not deeply loved.`,

        mainQuestion: `At your own funeral, would you want everybody holding themselves together — or would you want the noise?`,

        followTheThread: [
            `Is paid grief fake, or can it give everyone else permission to show what they feel?`,
            `Where you are from, is somebody who cries openly at a funeral respected or quietly judged?`
        ],

        upgrade: {
            term: `break down`,
            type: `phrasal verb`,
            definition: `To lose control of your emotions and begin crying.`,
            ordinary: `“She reached the middle of the speech and then lost control and started crying.”`,
            upgraded: `“She reached the middle of the speech and broke down.”`,
            priority: 'key',
            atlasPrompt: `Where is it acceptable to break down in public where you live — and where is it definitely not?`
        }
    },

    {
        id: 'cl-laughter-epidemic',
        contextLine: `Tanganyika · 1962`,
        title: `The Village That Couldn’t Stop`,
        teaser: `It started with three schoolgirls. It closed the school.`,

        context: `In 1962, episodes of uncontrollable laughter and other distress symptoms began among pupils at a girls’ school in Tanganyika, now Tanzania, and later appeared in nearby communities. Some schools closed. Researchers usually describe it as a stress-related illness that spread through groups. It was not simply a case of people finding one another funny.`,

        mainQuestion: `Have you ever felt a room’s mood enter your own body before you had time to decide — laughter, panic, tension, or relief? What happened?`,

        followTheThread: [
            `Whose mood spreads fastest in a room you know, and do they realise they are doing it?`,
            `Is catching other people’s feelings a strength, a weakness, or sometimes both?`
        ],

        upgrade: {
            term: `set someone off`,
            type: `phrasal verb`,
            definition: `To cause someone to start laughing, crying, or reacting strongly, often uncontrollably.`,
            ordinary: `“One person started laughing, and within a minute everybody else had started too.”`,
            upgraded: `“One person started laughing, and it set everybody else off.”`,
            priority: 'key',
            atlasPrompt: `Who sets you off laughing when you absolutely must not — and how do they do it?`
        }
    },

    {
        id: 'cl-lowered-eyes',
        contextLine: `The interview room`,
        title: `The Eyes That Cost You the Job`,
        teaser: `Taught at home that looking down is respect. Read in the room as evasion.`,

        context: `In many homes, looking directly at a teacher, elder, or boss can seem rude, while lowering the eyes shows respect. Later, the same young person may enter an interview or courtroom where steady eye contact is treated as evidence of honesty. Their respectful behaviour may now be read as evasive.`,

        mainQuestion: `Someone keeps looking down while you speak. What is your first thought — and how much money would you bet on it?`,

        followTheThread: [
            `Have you ever felt judged for looking at someone too much, or not enough?`,
            `Is a steady gaze proof of honesty, or only proof of confidence?`
        ],

        upgrade: {
            term: `meet someone’s eye`,
            type: `phrase`,
            definition: `To look directly into someone’s eyes, often when it is difficult to do so.`,
            ordinary: `“I felt so guilty that I could not look directly at her for the rest of the evening.”`,
            upgraded: `“I felt so guilty that I could not meet her eye all evening.”`,
            priority: 'key',
            atlasPrompt: `When might someone find it difficult to meet another person’s eye — guilt, bad news, attraction, or being told off?`
        }
    },

    {
        id: 'cl-pose-nobody-taught',
        contextLine: `The Paralympic Games`,
        title: `The Pose Nobody Taught Them`,
        teaser: `Arms up, head back, chest out — from athletes who had never seen it done.`,

        context: `Researchers photographed judo athletes at the moment of victory. Competitors who had been blind from birth raised their arms, tipped back their heads, and pushed out their chests — much like the sighted athletes, although they had never watched anyone celebrate a win.`,

        mainQuestion: `When something goes very well, what does your body do before you have time to think — raise your arms, cover your face, go still, or something else? Do you think anyone taught you that reaction?`,

        followTheThread: [
            `What other reaction seems to arrive before thought?`,
            `If the same reaction appears in very different cultures, does that make it more trustworthy?`
        ],

        upgrade: {
            term: `instinctive`,
            type: `adjective`,
            definition: `Happening automatically, without thought or a deliberate decision.`,
            ordinary: `“I did not decide to raise my hands; they were already in the air before I had time to think.”`,
            upgraded: `“It was completely instinctive — my hands were up before I could think.”`,
            priority: 'standard',
            atlasPrompt: `What is your instinctive response to bad news — going quiet, getting busy, making a joke, or calling somebody?`
        }
    },

    {
        id: 'cl-frozen-face',
        contextLine: `The frozen face`,
        title: `Switch Your Face Off`,
        teaser: `If your face cannot move, can you still read anyone else’s?`,

        context: `Some cosmetic treatments reduce movement in the facial muscles. In some studies, people with less facial movement became slightly less accurate at reading emotion in other faces. One explanation is that we partly understand another person’s expression by copying a small part of it on our own face without noticing.`,

        mainQuestion: `A switch could stop your face from ever showing anything again. Would you use it — and what exactly would you be giving up?`,

        followTheThread: [
            `Who would you most like to be completely unreadable in front of?`,
            `Would people trust a face that never moved, or feel uncomfortable around it?`
        ],

        upgrade: {
            term: `give nothing away`,
            type: `phrase`,
            definition: `To show no sign of what you are thinking or feeling.`,
            ordinary: `“Whatever he was feeling, his face showed absolutely no sign of it.”`,
            upgraded: `“Whatever he was feeling, his face gave nothing away.”`,
            priority: 'standard',
            atlasPrompt: `Who do you know who gives nothing away — during a negotiation, a card game, or a family argument?`
        }
    }
];
