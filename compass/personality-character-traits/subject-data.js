/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Personality & Character Traits
  --------------------------------------------------------------------------
  A premium interactive speaking subject about the constant, confident,
  largely unjustified business of judging people: the verdicts we reach in
  seconds, the private tests we run without telling anyone, and the person
  we all turned out to have completely wrong.
  The Compass subject where the learner states a judgement, produces the
  evidence, and has to defend it.
  Compass active subject · contentVersion 3.1.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'personality-character-traits',
    schemaVersion: 2,
    contentVersion: '3.1.0',
    title: 'Personality & Character Traits',
    titleHtml: 'Personality & <em>Character Traits</em>',
    navTitle: 'Personality',
    bgImage: 'https://images.unsplash.com/photo-1521220546621-cf34a1165c67?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

const subjectCopy = {
    cover: {
        hook: `You’ve never met someone and had no opinion about them.`
    },

    overview: {
        heading: `How Did You Decide?`,
        intro: [
            `We form opinions from small details: a voice, a habit, a first conversation, or one thing somebody does under pressure. Sometimes those details reveal character, and sometimes they lead us completely in the wrong direction.`
        ],
        question: `What is the first thing you notice when deciding what someone is like?`
    },

    paths: {
        culturalLensDescription: `Explore the faces, handwriting, family positions, references, and private files people have used to judge character.`,
        discussionDescription: `First impressions, private tests, changing reputations, qualities you admire, and trust proved through action.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to reconsider which judgements deserve your trust and what evidence can change them.`
    },

    culturalLens: {
        heading: `How People Have Been Judged`,
        intro: `A face could suggest guilt. Handwriting could cost someone a job. A former employer could control a person’s reputation. Explore the methods people have trusted to decide what someone was like — sometimes before meeting them at all.`
    },

    discussion: {
        heading: `What Counts as Evidence?`
    },

    reflection: {
        title: `Second Thoughts`,
        summary: `Look back at the first impressions, private tests, changing personalities, and actions that shaped your judgements.`,
        questions: [
            `What kind of first impression do you trust least?`,
            `What evidence could make you change your mind about someone?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing first impressions, judging evidence, recognising change, and admitting that someone surprised you.`
    }
};

const discussionSets = [
    {
        id: 'set-before-you-know-them',
        title: `Before You Know Them`,
        stage: `First Look`,
        icon: 'first-look',
        description: `First impressions, missed signals, people who improve with time, and the version of you strangers think they see.`,
        moments: [
            {
                id: 'moment-the-instant-disqualifier',
                preview: `One behaviour changes the whole impression.`,
                question: `A person is rude to a waiter, interrupts constantly, or never asks you a question. Which behaviour would change your opinion fastest? You can choose another.`,
                upgrade: {
                    term: `red flag`,
                    type: `noun`,
                    definition: `A warning sign that something may be wrong with a person or situation.`,
                    ordinary: `“The way he spoke to the waiter immediately made me suspicious of his character.”`,
                    upgraded: `“The way he spoke to the waiter was an immediate red flag.”`,
                    priority: 'key',
                    atlasPrompt: `What is a red flag in a workplace, friendship, flat, or business deal?`
                }
            },
            {
                id: 'moment-two-clues',
                preview: `Late, charming, interrupting, and already clearing the plates.`,
                question: `Someone arrives late, remembers everyone’s name, interrupts twice, and helps clear the table. Which detail shapes your impression most?`,
                upgrade: {
                    term: `send mixed signals`,
                    type: `phrase`,
                    definition: `To behave in ways that suggest different or conflicting things.`,
                    ordinary: `“Some of her behaviour made her seem thoughtful, while other behaviour suggested the opposite.”`,
                    upgraded: `“She sent mixed signals: some behaviour seemed thoughtful, while other behaviour suggested the opposite.”`,
                    priority: 'standard',
                    atlasPrompt: `When has someone sent mixed signals about their attitude, intentions, or character?`
                }
            },
            {
                id: 'moment-wrong-about-someone',
                preview: `You had them figured out. You were wrong.`,
                question: `Think of someone you completely misjudged at first. What did you initially believe, and what later changed your mind?`,
                upgrade: {
                    term: `have someone all wrong`,
                    type: `phrase`,
                    definition: `To have completely misunderstood what someone is like.`,
                    ordinary: `“My first opinion of her turned out to be completely incorrect.”`,
                    upgraded: `“I had her all wrong.”`,
                    priority: 'standard',
                    atlasPrompt: `Who or what did you once have completely wrong?`
                }
            },
            {
                id: 'moment-the-person-who-grew-on-you',
                preview: `The first impression was not the final one.`,
                question: `Think of someone, real or fictional, who became more likeable over time. What changed — the person, the situation, or your understanding of them?`,
                upgrade: {
                    term: `grow on someone`,
                    type: `phrasal verb`,
                    definition: `To become more likeable or appealing to someone gradually.`,
                    ordinary: `“I did not like him at first, but gradually I began to enjoy being around him.”`,
                    upgraded: `“I did not like him at first, but he gradually grew on me.”`,
                    priority: 'standard',
                    atlasPrompt: `What person, place, habit, or type of work took time to grow on you?`
                }
            },
            {
                id: 'moment-what-they-get-wrong-about-you',
                preview: `They noticed something real and understood it incorrectly.`,
                question: `What do people often assume about you too quickly? Which behaviour of yours creates that impression?`,
                upgrade: {
                    term: `come across as`,
                    type: `phrasal verb`,
                    definition: `To give other people a particular impression, especially unintentionally.`,
                    ordinary: `“I sometimes seem unfriendly when I am actually only quiet.”`,
                    upgraded: `“I sometimes come across as unfriendly when I am actually only quiet.”`,
                    priority: 'key',
                    atlasPrompt: `How do you come across when you are tired, nervous, rushed, or speaking another language?`
                }
            }
        ],
        makeItReal: {
            title: `The Case`,
            prompt: `Choose someone you formed a strong first impression of. Tell your tutor exactly what you saw and heard, in order. Then state the opinion you formed. Did the evidence really support it?`
        }
    },
    {
        id: 'set-what-counts-as-evidence',
        title: `What Counts as Evidence?`,
        stage: `Closer Look`,
        icon: 'closer-look',
        description: `Private tests, interview questions, references, second chances, and personality theories built from almost nothing.`,
        moments: [
            {
                id: 'moment-the-test-you-run',
                preview: `A test they do not know they are taking.`,
                question: `What small behaviour do you quietly use as a test of character — returning a trolley, remembering a name, admitting a mistake, or something else?`,
                upgrade: {
                    term: `a good judge of character`,
                    type: `phrase`,
                    definition: `Someone who is usually accurate about what other people are really like.`,
                    ordinary: `“She is normally very accurate when she forms an opinion about somebody.”`,
                    upgraded: `“She is a very good judge of character.”`,
                    priority: 'key',
                    atlasPrompt: `Who is the best judge of character you know, and when have they been wrong?`
                }
            },
            {
                id: 'moment-the-answer-that-worries-you',
                preview: `Confident answer. Slightly worrying reason.`,
                question: `Read the candidate’s answer once with confidence and once with tired frustration: “I work best alone because other people usually slow me down.” How does the delivery change what you think about them?`,
                upgrade: {
                    term: `revealing`,
                    type: `adjective`,
                    definition: `Showing something important that was not previously obvious.`,
                    ordinary: `“Her answer showed us much more about her than the formal interview did.”`,
                    upgraded: `“Her answer was far more revealing than the formal interview.”`,
                    priority: 'standard',
                    atlasPrompt: `What answer, comment, or reaction can be surprisingly revealing?`
                }
            },
            {
                id: 'moment-the-reference',
                preview: `Competent, difficult, and applying somewhere else.`,
                question: `Someone is competent but difficult to work with. Give one honest sentence that helps their application and one honest sentence that warns the employer.`,
                upgrade: {
                    term: `be upfront about something`,
                    type: `phrase`,
                    definition: `To speak honestly and directly about something that may be difficult or uncomfortable.`,
                    ordinary: `“The reference praised his work and spoke honestly about the difficulty of working with him.”`,
                    upgraded: `“The reference praised his work and was upfront about the difficulty of working with him.”`,
                    priority: 'standard',
                    atlasPrompt: `When is it important to be upfront about a weakness, risk, or difficult truth?`
                }
            },
            {
                id: 'moment-one-bad-decision',
                preview: `One broken promise. A character flaw, or one bad day?`,
                question: `A reliable friend breaks an important promise once and gives a weak excuse. What would you need to see before calling it a pattern rather than one bad decision?`,
                upgrade: {
                    term: `give someone the benefit of the doubt`,
                    type: `phrase`,
                    definition: `To accept the kinder explanation when the truth is uncertain.`,
                    ordinary: `“I was not certain why she did it, so I chose the more generous explanation.”`,
                    upgraded: `“I was not certain why she did it, so I gave her the benefit of the doubt.”`,
                    priority: 'key',
                    atlasPrompt: `When should someone receive the benefit of the doubt, and when have they used it up?`
                }
            },
            {
                id: 'moment-build-a-personality-test',
                preview: `One tiny habit. An entire personality theory.`,
                question: `Choose a harmless habit — how someone loads a dishwasher, chooses a seat, or arranges a desk. Invent a personality theory from it and make it sound convincing.`,
                upgrade: {
                    term: `read too much into something`,
                    type: `phrase`,
                    definition: `To find more meaning in something than the evidence reasonably supports.`,
                    ordinary: `“You are giving that tiny habit far more meaning than it deserves.”`,
                    upgraded: `“You are reading far too much into that tiny habit.”`,
                    priority: 'standard',
                    atlasPrompt: `What small detail do people regularly read too much into?`
                }
            }
        ],
        makeItReal: {
            title: `One Hour with a Stranger`,
            prompt: `You have one hour with a stranger before deciding whether to enter a business partnership. Plan the meeting: where will you go, what will you ask, and which behaviour will matter most?`
        }
    },
    {
        id: 'set-what-time-reveals',
        title: `What Time Reveals`,
        stage: `Wider View`,
        icon: 'wider-view',
        description: `People who change, qualities worth borrowing, old labels, crisis teams, and trust proved through action.`,
        moments: [
            {
                id: 'moment-the-one-who-changed',
                preview: `Same person. A noticeably different character.`,
                question: `Think of someone who became calmer, braver, harder, or kinder over time. What caused the change?`,
                upgrade: {
                    term: `be a changed person`,
                    type: `phrase`,
                    definition: `To be noticeably different in behaviour or character from before.`,
                    ordinary: `“He is much calmer and less argumentative than he was a few years ago.”`,
                    upgraded: `“He is a changed person now — much calmer and less argumentative than before.”`,
                    priority: 'standard',
                    atlasPrompt: `What kind of experience can leave someone a changed person — responsibility, success, failure, grief, or something else?`
                }
            },
            {
                id: 'moment-the-trait-youd-borrow',
                preview: `One quality you would happily steal.`,
                question: `What quality in someone you know would you like to develop in yourself? Tell one moment when they used it particularly well.`,
                upgrade: {
                    term: `look up to someone`,
                    type: `phrasal verb`,
                    definition: `To admire and respect someone.`,
                    ordinary: `“I admire her because she remains calm when everybody else panics.”`,
                    upgraded: `“I look up to her because she remains calm when everybody else panics.”`,
                    priority: 'standard',
                    atlasPrompt: `Who do you look up to for one particular quality rather than for everything they do?`
                }
            },
            {
                id: 'moment-build-a-crisis-team',
                preview: `Calm. Practical. Honest. Choose your three.`,
                question: `You and your tutor must build a three-person crisis team using real or fictional people: one calm person, one practical person, and one person who will tell the truth. Take turns proposing candidates until you agree on all three.`,
                upgrade: {
                    term: `level-headed`,
                    type: `adjective`,
                    definition: `Calm and able to make sensible decisions under pressure.`,
                    ordinary: `“She stays calm and makes sensible decisions when everyone else is panicking.”`,
                    upgraded: `“She is extremely level-headed in a crisis.”`,
                    priority: 'key',
                    atlasPrompt: `Who remains level-headed when a plan, meeting, journey, or project begins to collapse?`
                }
            },
            {
                id: 'moment-reputation-vs-truth',
                preview: `They remember who you were. Give them the update.`,
                question: `Someone who knew you at nineteen still thinks you are the same person. What would surprise them most about you now?`,
                upgrade: {
                    term: `pigeonhole`,
                    type: `verb`,
                    definition: `To place someone into a fixed category and ignore evidence that they have changed.`,
                    ordinary: `“They decided I was the irresponsible one and never allowed that opinion to change.”`,
                    upgraded: `“They pigeonholed me as the irresponsible one.”`,
                    priority: 'key',
                    atlasPrompt: `What have you been pigeonholed as, and is the label still accurate?`
                }
            },
            {
                id: 'moment-the-one-youd-trust-with-anything',
                preview: `Do not list their qualities. Tell the story.`,
                question: `Think of someone you trust deeply. Do not describe them with adjectives. Tell the story of one thing they did that earned that trust.`,
                upgrade: {
                    term: `have someone’s back`,
                    type: `phrase`,
                    definition: `To support and protect someone, especially when they are under pressure or absent.`,
                    ordinary: `“I know she will support and defend me when I need her.”`,
                    upgraded: `“I know she has my back.”`,
                    priority: 'key',
                    atlasPrompt: `When should a colleague have your back publicly, even if they disagree with you privately?`
                }
            }
        ],
        makeItReal: {
            title: `The Moment You Knew`,
            prompt: `Tell one story that reveals what a person is really like: one afternoon, one decision, or one thing they did. Do not name the trait. Let the listener work it out from the evidence.`
        }
    }
];

const clCards = [
    {
        id: 'cl-criminal-face',
        contextLine: `Italy · 1876`,
        title: `The Face of a Criminal`,
        teaser: `A doctor claimed that crime could be seen in a person’s face.`,

        context: `In 1876, Italian doctor Cesare Lombroso argued that criminals were born different. He measured prisoners’ skulls, jaws, and ears and claimed that certain features revealed criminal character. His theory was rejected, but facial appearance can still influence how dangerous, honest, or trustworthy a stranger seems.`,

        mainQuestion: `You are on a jury, and the defendant’s face immediately makes you distrust him. What should you do with that first reaction?`,

        followTheThread: [
            `Which parts of a first impression should never be treated as evidence?`,
            `Who have you met whose appearance gave you completely the wrong idea?`
        ],

        upgrade: {
            term: `biased`,
            type: `adjective`,
            definition: `Unfairly influenced by a personal preference, assumption, or first impression.`,
            ordinary: `“His appearance influenced my judgement before I heard the evidence.”`,
            upgraded: `“I was biased against him before I heard the evidence.”`,
            priority: 'key',
            atlasPrompt: `Which decisions can become unfair because of a quick first impression?`
        }
    },

    {
        id: 'cl-four-humours',
        contextLine: `Europe · Ancient medicine`,
        title: `Four Fluids and Your Whole Personality`,
        teaser: `Your mood, health, and character were blamed on four fluids.`,

        context: `For centuries, European doctors believed that four fluids inside the body shaped both health and personality. They connected each fluid with a different character. Blood meant cheerful. Phlegm meant calm. Black bile meant gloomy. Yellow bile meant angry. Doctors even removed blood in an attempt to restore the correct balance.`,

        mainQuestion: `After watching you through one difficult morning, would an old doctor call you cheerful, calm, gloomy, or quick-tempered?`,

        followTheThread: [
            `Why are a few simple personality types so satisfying, even when people are more complicated?`,
            `Who do you know who changes too much to fit comfortably into one type?`
        ],

        upgrade: {
            term: `fit the description`,
            type: `phrase`,
            definition: `To match the qualities or details that have been described.`,
            ordinary: `“The doctor’s description of a calm person matches me surprisingly well.”`,
            upgraded: `“I fit the doctor’s description of a calm person surprisingly well.”`,
            priority: 'standard',
            atlasPrompt: `Who have you met who fitted a description perfectly — or turned out to be nothing like it?`
        }
    },

    {
        id: 'cl-blood-type',
        contextLine: `Japan · Ketsuekigata`,
        title: `What’s Your Blood Type?`,
        teaser: `A letter on a medical form becomes a personality description.`,

        context: `In Japan, a popular belief connects blood type with personality. Type A may be described as careful, B as independent, O as confident, and AB as unpredictable. The idea has no reliable scientific support, but it has appeared in magazines, dating profiles, workplaces, and reported hiring decisions.`,

        mainQuestion: `An employer asks for your blood type because they believe it reveals personality. Would you answer, refuse, or challenge the question?`,

        followTheThread: [
            `Which harmless personality theory do people around you still half-believe?`,
            `When does a playful label become discrimination?`
        ],

        upgrade: {
            term: `buy into something`,
            type: `phrasal verb`,
            definition: `To accept or believe an idea, especially one that other people promote strongly.`,
            ordinary: `“My aunt completely believes the idea that blood type determines personality.”`,
            upgraded: `“My aunt completely buys into the blood-type theory.”`,
            priority: 'key',
            atlasPrompt: `What popular idea have you never fully bought into?`
        }
    },

    {
        id: 'cl-graphology',
        contextLine: `France · Recruitment`,
        title: `You Didn’t Get the Job. It Was Your Handwriting.`,
        teaser: `The loops, pressure, and slant helped decide who was hired.`,

        context: `For decades, some French employers asked applicants to submit handwritten letters. A graphologist examined the size, pressure, spacing, and slant of the writing and used them to describe the applicant’s character. Research has repeatedly found that handwriting analysis does not reliably predict job performance.`,

        mainQuestion: `A graphologist calls your handwriting careless and rejects your application. What evidence from your real work would you use to challenge that judgement?`,

        followTheThread: [
            `Is a conventional job interview much fairer, or does it simply use different weak evidence?`,
            `What information should genuinely be enough to reject an applicant?`
        ],

        upgrade: {
            term: `rule someone out`,
            type: `phrasal verb`,
            definition: `To decide that someone is unsuitable and stop considering them.`,
            ordinary: `“They rejected her before they had even spoken to her.”`,
            upgraded: `“They ruled her out before they had even spoken to her.”`,
            priority: 'key',
            atlasPrompt: `What should never be enough on its own to rule someone out?`
        }
    },

    {
        id: 'cl-birth-order',
        contextLine: `Birth order`,
        title: `The Bossy One, the Baby, the Forgotten Middle`,
        teaser: `The family position becomes a ready-made personality.`,

        context: `The eldest is often described as responsible and controlling. The youngest supposedly receives more freedom, while the middle child is overlooked. These ideas are easy to recognise in individual families, but large studies have generally found little effect on broad personality traits.`,

        mainQuestion: `Think of two siblings you know. Do they fit the usual birth-order story, or do they completely break it?`,

        followTheThread: [
            `Can repeatedly calling a child “the responsible one” or “the difficult one” help create that behaviour?`,
            `Why do we remember the families that fit the birth-order theory and ignore the ones that do not?`
        ],

        upgrade: {
            term: `stereotype`,
            type: `noun`,
            definition: `A fixed and simplified idea about what a particular type of person is like.`,
            ordinary: `“The idea that every eldest child is responsible is an oversimplified belief.”`,
            upgraded: `“The responsible eldest child is a familiar stereotype.”`,
            priority: 'standard',
            atlasPrompt: `Which stereotype sounds convincing until you examine real individuals?`
        }
    },

    {
        id: 'cl-without-a-character',
        contextLine: `Britain · Domestic service`,
        title: `Without a Character`,
        teaser: `Your previous employer controlled the document needed for your next job.`,

        context: `A servant leaving a household often needed a written employment reference from the previous employer. At the time, this document was called a “character”. It described whether the servant was honest, sober, clean, and reliable. Without a positive reference, another respectable household might refuse to employ them, and the servant had little opportunity to challenge it.`,

        mainQuestion: `Your previous employer writes the only document that may decide whether you work again. What should they be allowed to include?`,

        followTheThread: [
            `Should the worker have the right to read the reference and answer any accusation?`,
            `Whose written judgement about you would you trust enough to show a stranger?`
        ],

        upgrade: {
            term: `vouch for someone`,
            type: `phrasal verb`,
            definition: `To state that you know someone is honest, reliable, or suitable.`,
            ordinary: `“She told the employer that she knew I was reliable.”`,
            upgraded: `“She vouched for me.”`,
            priority: 'standard',
            atlasPrompt: `Who could vouch for you in a situation where trust mattered?`
        }
    },

    {
        id: 'cl-guest-right',
        contextLine: `Codes of hospitality`,
        title: `Feed Him Before You Ask His Name`,
        teaser: `The stranger receives food and shelter before explaining why he came.`,

        context: `In several old hospitality traditions, a stranger arriving at the door had to be given food, shelter, and temporary protection before being questioned. In stricter versions, the duty applied even if the visitor was an enemy or if offering protection placed the host at real risk.`,

        mainQuestion: `A stranger arrives at night, and you are afraid of him. Tradition says you must feed him before asking questions. What would you do?`,

        followTheThread: [
            `What reasonable limit should exist on the duty to welcome and protect a stranger?`,
            `Does the way someone treats a person who cannot repay them reveal much about their character?`
        ],

        upgrade: {
            term: `no questions asked`,
            type: `phrase`,
            definition: `Without demanding an explanation or placing conditions on the help offered.`,
            ordinary: `“She gave me somewhere to stay without demanding an explanation.”`,
            upgraded: `“She gave me somewhere to stay, no questions asked.”`,
            priority: 'standard',
            atlasPrompt: `Who would help you, no questions asked, and when would that be unreasonable?`
        }
    },

    {
        id: 'cl-village-by-names',
        contextLine: `Europe · By-names`,
        title: `The Village Decided What You Were`,
        teaser: `One habit or embarrassing event could become part of your name.`,

        context: `When many people in a small community shared the same first name, an extra name helped identify them. It might describe appearance, character, work, or one memorable event. Names such as Erik the Red and Harald Bluetooth could remain attached to a person long after the original reason had faded.`,

        mainQuestion: `Your community must give you a name based on one habit or event. Which name would you hope for — and which one would you fear?`,

        followTheThread: [
            `Give a fair by-name to someone fictional or famous. What evidence supports it?`,
            `When does a useful nickname become a label that prevents someone from changing?`
        ],

        upgrade: {
            term: `live something down`,
            type: `phrasal verb`,
            definition: `To make people forget an embarrassing event or mistake.`,
            ordinary: `“He fell into the fountain years ago, and people still remind him.”`,
            upgraded: `“He fell into the fountain years ago and has never lived it down.”`,
            priority: 'standard',
            atlasPrompt: `What harmless mistake might someone never be allowed to live down?`
        }
    },

    {
        id: 'cl-stasi-files',
        contextLine: `East Germany · Stasi archives`,
        title: `You Can Read the File`,
        teaser: `The report contains names. Some belong to people you trusted.`,

        context: `The East German secret police collected reports from neighbours, colleagues, friends, and sometimes relatives or partners. After the regime ended, people could request their own surveillance files and learn who had secretly reported their conversations or behaviour to the authorities. A trusted name might appear inside.`,

        mainQuestion: `Your file is ready. Would you read the names inside, or leave it closed and never know?`,

        followTheThread: [
            `You discover that a close friend reported on you. Would you confront them, ask for an explanation, or end the relationship?`,
            `What kind of pressure might make an ordinary person agree to report on a friend or relative?`
        ],

        upgrade: {
            term: `see someone in a different light`,
            type: `phrase`,
            definition: `To understand or judge someone differently after learning new information.`,
            ordinary: `“After I learned what he had done, I could no longer think about him in the same way.”`,
            upgraded: `“After that, I saw him in a completely different light.”`,
            priority: 'key',
            atlasPrompt: `What discovery could make you see a person, organisation, or decision in a different light?`
        }
    }
];
