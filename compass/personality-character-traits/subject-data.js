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
  Compass v3 rebuild. Rough editorial pass.
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'personality-character-traits',
    schemaVersion: 2,
    contentVersion: '3.0.0',
    title: 'Personality & Character Traits',
    titleHtml: 'Personality & <em>Character Traits</em>',
    navTitle: 'Personality',
    bgImage: 'https://images.unsplash.com/photo-1521220546621-cf34a1165c67?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
};

const subjectCopy = {
    cover: {
        hook: `You've never once met someone and had no opinion about them.`
    },
    overview: {
        heading: `Four Seconds`,
        intro: [
            `The verdict arrives before they've sat down. Something in how they said your name, or what they did with the waiter, and you've decided — without consciously deciding anything at all. Most of us are quietly certain we're excellent judges of character. Most of us have also been spectacularly wrong about at least one person. So which do you actually trust: the four seconds, or the four years?`
        ]
    },
    paths: {
        culturalLensDescription: `Handwriting that decided your career, blood types that decide your marriage, and a file with your friends' names in it.`,
        discussionDescription: `Snap verdicts, private tests, the person everybody loves except you, and the one you had completely wrong.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to bring together ideas from different parts of the subject.`
    },
    culturalLens: {
        heading: `Everyone Has a Method`,
        intro: `People have never been willing to wait and find out what someone is like. Skulls have been measured, handwriting analysed, blood typed, files kept. Some of what follows was taken extremely seriously. Some of it still is.`
    },
    discussion: {
        heading: `People You've Made Your Mind Up About`
    },
    reflection: {
        title: `Second Thoughts`,
        summary: `Look back at the verdicts, tests, and stories that came up. Notice which judgements still feel convincing, which now seem less certain, and what kind of evidence would genuinely change your mind.`,
        questions: [
            `Whose verdict on people do you trust more than your own?`,
            `What would you actually have to see to change your mind about someone?`
        ]
    },
    keyLanguage: {
        intro: `Expressions for judging people, defending your judgement, and admitting you got it wrong.`
    }
};

const discussionSets = [
    {
        id: 'set-youve-already-decided',
        title: `You've Already Decided`,
        stage: `React`,
        icon: 'react',
        description: `The instant disqualifier, the person everybody loves except you, and the one you had completely wrong.`,
        moments: [
            {
                id: 'moment-the-instant-disqualifier',
                preview: `One thing, and they're finished.`,
                question: `Rude to the waiter. Never asks you a single question. Talks all the way through the film. Everybody has one thing that ends it on the spot. What's yours — and is it actually fair?`,
                upgrade: {
                    term: `red flag`,
                    type: `noun`,
                    definition: `A clear warning sign that something is wrong with a person or a situation.`,
                    ordinary: `“The way he spoke to the waiter was a clear warning sign that something was seriously wrong.”`,
                    upgraded: `“The way he spoke to the waiter was a massive red flag.”`,
                    priority: 'key',
                    atlasPrompt: `What's a red flag in a job advert, a flat, or a business deal?`
                }
            },
            {
                id: 'moment-everyone-loves-them',
                preview: `Everybody adores them. You can't stand them.`,
                question: `There's somebody everybody thinks is wonderful and you simply do not see it. Who are they — and have you ever admitted it out loud to anyone?`,
                upgrade: {
                    term: `see the appeal`,
                    type: `phrase`,
                    definition: `To understand why other people like someone or something.`,
                    ordinary: `“Everybody thinks he's marvellous and I have never once understood what they all like about him.”`,
                    upgraded: `“Everyone adores him. I've never seen the appeal.”`,
                    priority: 'standard',
                    atlasPrompt: `What does everyone love that you've never seen the appeal of — a film, a band, a city, a food?`
                }
            },
            {
                id: 'moment-too-nice',
                preview: `Nothing was wrong. Something was wrong.`,
                question: `Warm, helpful, complimentary — and something is off. Have you ever been suspicious of somebody for no reason you could name? Were you right in the end?`,
                upgrade: {
                    term: `too good to be true`,
                    type: `phrase`,
                    definition: `So good that you suspect it cannot be genuine.`,
                    ordinary: `“He was so charming and so helpful that I started to suspect none of it was genuine.”`,
                    upgraded: `“He was so charming it felt too good to be true.”`,
                    priority: 'standard',
                    atlasPrompt: `What offer, job, or deal has sounded too good to be true — and was it?`
                }
            },
            {
                id: 'moment-wrong-about-someone',
                preview: `You had them figured out. You were wrong.`,
                question: `The quiet one who turned out to be the funniest. The confident one who was terrified. Who did you have completely wrong — and what finally showed you?`,
                upgrade: {
                    term: `have someone all wrong`,
                    type: `phrase`,
                    definition: `To have completely misjudged what someone is like.`,
                    ordinary: `“The opinion I had formed of him turned out to be completely and entirely incorrect.”`,
                    upgraded: `“I had him all wrong.”`,
                    priority: 'standard',
                    atlasPrompt: `Who did you have all wrong — a colleague, a neighbour, an in-law?`
                }
            },
            {
                id: 'moment-what-they-get-wrong-about-you',
                preview: `They decided. They were wrong.`,
                question: `People reach a conclusion about you in the first ten minutes and it isn't quite right. What do they decide — and where do you think that impression comes from?`,
                upgrade: {
                    term: `mistake something for something`,
                    type: `verb`,
                    definition: `To wrongly interpret one quality as another.`,
                    ordinary: `“People think I'm arrogant, when the truth is I'm just shy and I go quiet.”`,
                    upgraded: `“People mistake my shyness for arrogance.”`,
                    priority: 'key',
                    atlasPrompt: `What gets mistaken for something else at work — silence for agreement, speed for carelessness?`
                }
            }
        ],
        makeItReal: {
            title: `The case`,
            prompt: `Pick somebody you formed a strong opinion about very quickly. Now build the case: what did you actually see and hear, in what order? Then tell me honestly — would that convince anyone who wasn't there?`
        }
    },
    {
        id: 'set-on-what-evidence',
        title: `On What Evidence?`,
        stage: `Explain`,
        icon: 'explain',
        description: `How you'd hire them, what you'd forgive, and the test you run on people without ever telling them.`,
        moments: [
            {
                id: 'moment-the-test-you-run',
                preview: `The test you never told them you were running.`,
                question: `How they treat the waiter. Whether they put the trolley back. Whether the dog likes them. What's your test — and what do you honestly think it proves?`,
                upgrade: {
                    term: `a good judge of character`,
                    type: `phrase`,
                    definition: `Someone who is usually right about what people are really like.`,
                    ordinary: `“She's usually right about what people are really like, and she's been right about almost everyone I've introduced her to.”`,
                    upgraded: `“She's a very good judge of character.”`,
                    priority: 'key',
                    atlasPrompt: `Who's the best judge of character you know — and have they ever been badly wrong?`
                }
            },
            {
                id: 'moment-which-one-do-you-hire',
                preview: `Perfect on paper. Cold in the room.`,
                question: `Two candidates. One has the perfect record and left you cold. The other you liked immediately and isn't quite qualified. Who gets it — and what are you actually hiring?`,
                upgrade: {
                    term: `go with your gut`,
                    type: `informal phrase`,
                    definition: `To decide on instinct rather than on evidence or analysis.`,
                    ordinary: `“In the end I ignored what the paperwork said and simply decided based on my instinct about him.”`,
                    upgraded: `“In the end I went with my gut.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you go with your gut — and did it work out?`
                }
            },
            {
                id: 'moment-the-reference',
                preview: `You have to write it. You don't rate them.`,
                question: `You're asked to write a reference for someone you don't rate. Do you tell the truth, write something warm and empty, or refuse? And which of those three is the cowardly one?`,
                upgrade: {
                    term: `gloss over something`,
                    type: `phrasal verb`,
                    definition: `To avoid mentioning something bad, or mention it as briefly as possible.`,
                    ordinary: `“I mentioned all of his strengths and very carefully avoided saying anything at all about the problems.”`,
                    upgraded: `“I praised his strengths and glossed over the rest.”`,
                    priority: 'standard',
                    atlasPrompt: `What gets glossed over — in CVs, in interviews, in a first conversation with a client?`
                }
            },
            {
                id: 'moment-what-would-you-forgive',
                preview: `One act. Does it define them?`,
                question: `Someone close to you does something that doesn't fit who you thought they were. Is a person their worst hour, or their pattern? Where exactly is your line?`,
                upgrade: {
                    term: `give someone the benefit of the doubt`,
                    type: `phrase`,
                    definition: `To choose the more generous explanation when you cannot be sure.`,
                    ordinary: `“I decided to believe the kinder explanation of what he'd done, because I couldn't be certain either way.”`,
                    upgraded: `“I gave him the benefit of the doubt.”`,
                    priority: 'key',
                    atlasPrompt: `Who gets the benefit of the doubt from you — and who has used theirs up?`
                }
            },
            {
                id: 'moment-do-you-believe-any-of-it',
                preview: `You know it's nonsense. Go on, admit it.`,
                question: `Star signs. Blood types. "Typical eldest child." The personality test they made you do at work. Some are nonsense; others are simply much less reliable than people claim. Which one do you quietly half-believe anyway?`,
                upgrade: {
                    term: `there's something in it`,
                    type: `spoken phrase`,
                    definition: `Used to admit that an idea you doubt may be partly true after all.`,
                    ordinary: `“I know it isn't scientific at all, but honestly, I do think it might be partly true.”`,
                    upgraded: `“I know it's rubbish, but there's something in it.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you not really believe — and half believe anyway?`
                }
            }
        ],
        makeItReal: {
            title: `One hour with a stranger`,
            prompt: `You have one hour with a stranger and you have to decide whether to go into business with them. You can go anywhere and ask anything. What do you do with the hour — and what exactly are you watching for?`
        }
    },
    {
        id: 'set-how-they-turned-out',
        title: `How They Turned Out`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The one who changed, the one who never did, and the person you'd actually want in a crisis.`,
        moments: [
            {
                id: 'moment-the-one-who-changed',
                preview: `Same name. Different person.`,
                question: `Someone you've known for years genuinely became a different person — softer, harder, braver, colder. Who, and what did it? And were they always capable of it?`,
                upgrade: {
                    term: `mellow`,
                    type: `verb`,
                    definition: `To become calmer, gentler, or less extreme over time.`,
                    ordinary: `“He used to lose his temper constantly, but he's become a great deal calmer and gentler as he's got older.”`,
                    upgraded: `“He's mellowed a lot.”`,
                    priority: 'standard',
                    atlasPrompt: `Who has mellowed with age — and did anybody believe they ever would?`
                }
            },
            {
                id: 'moment-the-one-who-never-did',
                preview: `Sixty years old. Exactly the same.`,
                question: `Somebody you know is precisely who they were at twenty — same opinions, same habits, same temper. Is that integrity, or is it a failure to grow?`,
                upgrade: {
                    term: `set in your ways`,
                    type: `idiom`,
                    definition: `Having fixed habits and opinions that you are unlikely to change.`,
                    ordinary: `“He has fixed opinions and fixed habits and he isn't going to change a single one of them at this stage.”`,
                    upgraded: `“He's far too set in his ways to change now.”`,
                    priority: 'standard',
                    atlasPrompt: `What are you already set in your ways about — and at what age did that happen?`
                }
            },
            {
                id: 'moment-who-do-you-want-in-a-crisis',
                preview: `Not who you like. Who you'd call.`,
                question: `The diagnosis, the accident, the business collapsing. Who do you actually want in the room — and is it the same person you'd choose for dinner?`,
                upgrade: {
                    term: `rise to the occasion`,
                    type: `idiom`,
                    definition: `To perform unexpectedly well when a situation demands it.`,
                    ordinary: `“Nobody expected very much of him at all, and then, when it really mattered, he performed brilliantly.”`,
                    upgraded: `“Nobody expected much of him, and then he completely rose to the occasion.”`,
                    priority: 'standard',
                    atlasPrompt: `Who rose to the occasion when it mattered — and who quietly disappeared?`
                }
            },
            {
                id: 'moment-reputation-vs-truth',
                preview: `They met you at nineteen. The file was closed.`,
                question: `Your family has a version of you from twenty years ago. So, probably, does your first employer. What are you still, to the people who stopped updating — and does it still cost you anything?`,
                upgrade: {
                    term: `pigeonhole`,
                    type: `verb`,
                    definition: `To label someone as one type of person and refuse to see them as anything else.`,
                    ordinary: `“They decided early on that I was the quiet, careful one and they have never once seen me as anything else.”`,
                    upgraded: `“I got pigeonholed as the quiet one and never shook it off.”`,
                    priority: 'key',
                    atlasPrompt: `What have you been pigeonholed as at work — and is it even still true?`
                }
            },
            {
                id: 'moment-the-one-youd-trust-with-anything',
                preview: `You'd hand them the keys and never think about it again.`,
                question: `There's one person you'd trust with anything — money, a secret, your children. Don't tell me what they're like. Tell me what they did.`,
                upgrade: {
                    term: `have someone's back`,
                    type: `informal phrase`,
                    definition: `To be ready to support and defend someone, especially when they are not there.`,
                    ordinary: `“I know that he will always support me and defend me, particularly when I'm not in the room.”`,
                    upgraded: `“I know he's got my back.”`,
                    priority: 'key',
                    atlasPrompt: `Who has your back at work — and does your manager know it?`
                }
            }
        ],
        makeItReal: {
            title: `The moment you knew`,
            prompt: `Everyone has one story that tells you everything about a person. Not a summary — a story. One afternoon, one decision, one thing they did. Tell me the story about someone you love, and let me work out what they're like from it.`
        }
    }
];

const clCards = [
    {
        id: 'cl-criminal-face',
        contextLine: `Italy · 1876`,
        title: `The Face of a Criminal`,
        teaser: `He measured their skulls and said he could spot a criminal on sight.`,
        context: `Cesare Lombroso measured the skulls, jaws and ears of prisoners and announced that criminals were born rather than made — and that you could pick one out by looking. The theory was demolished long ago. But people still reach a verdict on a stranger's trustworthiness in under a second, and studies of mock juries keep finding that a defendant's face moves the verdict.`,
        mainQuestion: `You're on the jury. He looks exactly like a man who did it. Do you trust yourself?`,
        followTheThread: [
            `What would it take for you to overrule your own first impression?`,
            `Who do you know who looks nothing like what they actually are?`
        ],
        upgrade: {
            term: `jump to conclusions`,
            type: `idiom`,
            definition: `To decide what is true before you have enough information.`,
            ordinary: `“I decided he was guilty the moment I saw him, without waiting to hear any of the evidence at all.”`,
            upgraded: `“I jumped to conclusions the moment I saw him.”`,
            priority: 'key',
            atlasPrompt: `When did you last jump to conclusions and get it badly wrong?`
        }
    },
    {
        id: 'cl-four-humours',
        contextLine: `The four humours`,
        title: `Four Fluids and Your Whole Personality`,
        teaser: `The medicine died. The vocabulary refused to go with it.`,
        context: `Blood, phlegm, black bile, yellow bile. For roughly two thousand years, European medicine held that the balance of these four fluids decided your temperament — and doctors bled people to correct it. The theory is long dead. The words survived it: we still call people sanguine, phlegmatic, melancholic, bilious, and in a foul humour.`,
        mainQuestion: `Four types, and supposedly everyone fits one. Why is that so appealing — and which of the four would people put you in?`,
        followTheThread: [
            `Who in your life is unmistakably one of the four?`,
            `Is it useful to have four boxes, even wrong ones — or does it just stop you looking properly?`
        ],
        upgrade: {
            term: `have a short fuse`,
            type: `idiom`,
            definition: `To become angry very quickly and easily.`,
            ordinary: `“He becomes extremely angry extremely quickly, over almost nothing at all.”`,
            upgraded: `“He's got a very short fuse.”`,
            priority: 'standard',
            atlasPrompt: `Who has the shortest fuse at your work — and what sets it off?`
        }
    },
    {
        id: 'cl-blood-type',
        contextLine: `Japan · ketsuekigata`,
        title: `What's Your Blood Type?`,
        teaser: `A first date may ask. So, in reported cases, has an employer.`,
        context: `A widely held theory in Japan holds that blood type shapes personality: A is careful and anxious, B is selfish and creative, O is confident, AB is unpredictable. It has no scientific support whatsoever. It turns up in magazines, in dating profiles, and — in reported cases — in hiring and in workplace bullying, which has acquired its own name: bura-hara.`,
        mainQuestion: `You know it's nonsense. So what do you believe about people that you know has no evidence behind it at all?`,
        followTheThread: [
            `Star signs, birth order, handwriting, whether they like dogs. Who's got the silliest theory in your family?`,
            `It's harmless in a magazine. What happens when it's on a job application?`
        ],
        upgrade: {
            term: `swear by something`,
            type: `phrasal verb`,
            definition: `To believe completely in something and recommend it, often without evidence.`,
            ordinary: `“My aunt believes in it completely and would not change her mind about it for anything.”`,
            upgraded: `“My aunt swears by it.”`,
            priority: 'key',
            atlasPrompt: `What does somebody in your family swear by that you're certain doesn't work?`
        }
    },
    {
        id: 'cl-graphology',
        contextLine: `France · handwriting`,
        title: `You Didn't Get the Job. It Was Your Handwriting.`,
        teaser: `For decades, applicants were asked for a handwritten letter, and the loops decided it.`,
        context: `Graphology — reading character from handwriting — was used in French recruitment on a serious scale for decades, and to a lesser degree elsewhere. Applicants sent a handwritten letter. The slant, the pressure and the loops were analysed, and people were ruled out. Study after study has found it predicts job performance at roughly the rate of chance.`,
        mainQuestion: `Outrageous. Now defend the job interview — because that doesn't predict much either.`,
        followTheThread: [
            `What has somebody judged you on that had nothing whatsoever to do with the job?`,
            `Is there a single question that would tell you what you actually need to know?`
        ],
        upgrade: {
            term: `rule someone out`,
            type: `phrasal verb`,
            definition: `To decide that someone is not suitable, and stop considering them.`,
            ordinary: `“They decided he wasn't suitable for the job before they had even met him or spoken to him.”`,
            upgraded: `“They ruled him out before they'd even met him.”`,
            priority: 'key',
            atlasPrompt: `What would rule you out of a job instantly — and would that be fair?`
        }
    },
    {
        id: 'cl-birth-order',
        contextLine: `Birth order`,
        title: `The Bossy One, the Baby, the Forgotten Middle`,
        teaser: `Everybody knows exactly what the eldest is like.`,
        context: `The eldest is responsible and bossy. The youngest gets away with everything. The middle one is overlooked. Almost everyone believes some version of this and can prove it instantly with their own siblings. Large studies have often found little or no lasting effect on broad personality traits, although newer research has reported some small average differences. Either way, birth order tells you very little about any one person.`,
        mainQuestion: `So describe your siblings — or somebody else's. Then tell me why the numbers can't find what you can see.`,
        followTheThread: [
            `Is it the birth order doing it — or were you all told what you were, and became it?`,
            `Who in your family got a label at five and still has it at fifty?`
        ],
        upgrade: {
            term: `chalk and cheese`,
            type: `idiom`,
            definition: `Completely different from one another.`,
            ordinary: `“My brother and I are completely and utterly different from each other in every possible way.”`,
            upgraded: `“My brother and I are chalk and cheese.”`,
            priority: 'standard',
            atlasPrompt: `Which two people you know well are chalk and cheese — and do they actually get on?`
        }
    },
    {
        id: 'cl-without-a-character',
        contextLine: `Britain · domestic service`,
        title: `Without a Character`,
        teaser: `Your last employer wrote down what you were like. Without it, nobody would hire you.`,
        context: `A servant leaving a household needed a written “character” — a letter from the employer stating whether they were honest, sober and clean. Without one, no respectable house would take you on. There was no appeal and no right of reply. A dismissed servant could be left, in the phrase of the day, without a character at all.`,
        mainQuestion: `Your last boss writes the only document that decides whether you ever work again. Who would you least want holding the pen?`,
        followTheThread: [
            `Have you ever needed somebody to speak for you — and would they have?`,
            `Is a reference from somebody who liked you worth anything at all?`
        ],
        upgrade: {
            term: `vouch for someone`,
            type: `phrasal verb`,
            definition: `To state publicly that you know someone is honest or reliable.`,
            ordinary: `“Nobody was willing to speak up and confirm that he was honest and reliable.”`,
            upgraded: `“Nobody would vouch for him.”`,
            priority: 'standard',
            atlasPrompt: `Who would vouch for you — and who would you vouch for without hesitating?`
        }
    },
    {
        id: 'cl-guest-right',
        contextLine: `Codes of hospitality`,
        title: `Feed Him Before You Ask His Name`,
        teaser: `The stranger at the door is fed and sheltered first. Only then may you ask who he is.`,
        context: `Across a range of traditions — Bedouin custom, Pashtun melmastia, Albanian besa, Greek xenia — the stranger at the door is owed food, shelter and protection, and it is a serious breach to ask his business before he has eaten. In the strictest versions the obligation holds even for an enemy, and even at real cost to the host.`,
        mainQuestion: `He's at your door and you're afraid of him. The code says feed him. Do you?`,
        followTheThread: [
            `Does how somebody treats a person who can do nothing for them tell you more than anything else?`,
            `Who do you know who would open the door — and who absolutely would not?`
        ],
        upgrade: {
            term: `no questions asked`,
            type: `phrase`,
            definition: `Without demanding an explanation or making conditions.`,
            ordinary: `“He gave me the money and he didn't ask me a single thing about why I needed it.”`,
            upgraded: `“He gave me the money, no questions asked.”`,
            priority: 'standard',
            atlasPrompt: `Who would help you, no questions asked — and would you do the same for them?`
        }
    },
    {
        id: 'cl-village-by-names',
        contextLine: `By-names`,
        title: `The Village Decided What You Were`,
        teaser: `Erik the Red. Harald Bluetooth. Ivar the Boneless. Nobody chose their own.`,
        context: `In small communities with too few names to go round, people were told apart by what they were like — or by one thing they once did. The Norse sagas are full of it: Erik the Red, Harald Bluetooth, Ivar the Boneless. English and Welsh villages ran the same system for centuries. The community reached a verdict, attached it to your name, and it followed you for life.`,
        mainQuestion: `Your village gets to name you for one thing you've done or one thing you're like. What do they call you — and would it be fair?`,
        followTheThread: [
            `Now name somebody in your family the same way. Would they thank you for it?`,
            `Whose nickname where you live is unkind — and does the person even know?`
        ],
        upgrade: {
            term: `live something down`,
            type: `phrasal verb`,
            definition: `To make people forget something embarrassing you did — usually used to say you never will.`,
            ordinary: `“He fell into the fountain at the office party in 1998 and people have never once stopped reminding him about it.”`,
            upgraded: `“He fell into the fountain in 1998 and he's never lived it down.”`,
            priority: 'standard',
            atlasPrompt: `What has somebody at your work never been allowed to live down?`
        }
    },
    {
        id: 'cl-stasi-files',
        contextLine: `East Germany · the files`,
        title: `You Can Read the File`,
        teaser: `It lists everybody who informed on you. Some of them ate at your table.`,
        context: `The Stasi kept files on an enormous number of East Germans, built largely from reports by ordinary people: neighbours, colleagues, friends, spouses. After 1989 the archives were opened and citizens could apply to read their own file, with the informants identified. Hundreds of thousands applied. Some of them found a name they loved.`,
        mainQuestion: `The file is on the table. You can read it, or walk away and never know. Which?`,
        followTheThread: [
            `If it were a friend's name in there, would you tell them you knew?`,
            `Would you have held out?`
        ],
        upgrade: {
            term: `see someone in a different light`,
            type: `phrase`,
            definition: `To understand someone in a completely new way after learning something about them.`,
            ordinary: `“After I found out what he'd done, I was never able to think about him in the same way again.”`,
            upgraded: `“After that, I saw him in a completely different light.”`,
            priority: 'key',
            atlasPrompt: `Who have you come to see in a different light — and what did it?`
        }
    }
];
