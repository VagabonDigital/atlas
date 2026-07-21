/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Humour & Wit
  --------------------------------------------------------------------------
  A premium interactive speaking subject for exploring what humour does
  between people: who is allowed to make the joke, who it lands on, who is
  watching, and what it costs when it goes wrong. Built for tutor-led
  conversation, shared-screen teaching, real disagreement, and sharper
  spoken English.
  Compass active subject · contentVersion 1.0.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/
const MODULE = {
    id: 'humour-wit',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Humour & Wit',
    titleHtml: 'Humour &amp; <em>Wit</em>',
    navTitle: 'Humour',
    bgImage: 'https://photos.smugmug.com/Atlas/i-J7Nwffw/0/MM58x4vnzmfh8WS9JRjGwbxLms377c2GmFfLtWj7d/O/63cb2ddf-077c-45bc-8e5f-2a3e54ef071a.png'
};

const subjectCopy = {
    cover: {
        hook: `Somebody in the room is not laughing.`
    },
    overview: {
        heading: `Who the Joke Is For`,
        intro: [
            `A joke is never only a joke. There is the person who makes it, the person it lands on, and everybody else deciding whether to laugh. Change any one of those three and the same words become a kindness, a weapon, or a mistake.`
        ],
        question: `Think of the last time you laughed properly. Who were you with — and would it still have been funny with different people in the room?`
    },
    paths: {
        culturalLensDescription: `Where joking has been a paid job, a family duty, a crime, and a tradition with rules.`,
        discussionDescription: `Your own taste, the jokes you would unsay, and the people you laugh at without meaning it.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Two questions that step back from the individual jokes.`
    },
    culturalLens: {
        heading: `Who Was Allowed to Say It`,
        intro: `Every society decides who may joke, about whom, and when. Some have written it into law, some into ritual, and some into rules nobody ever wrote down at all.`
    },
    discussion: {
        heading: `Who Laughed, Who Didn’t`
    },
    reflection: {
        title: `Who You Laugh With`,
        summary: `Before you leave the subject, two questions that are less about jokes than about the people they happen between.`,
        questions: [
            `Whose laugh do you actually work for?`,
            `Whose humour could you never join in with — and is that about the jokes, or about the people?`
        ]
    },
    keyLanguage: {
        intro: `Language for the joke, the target, the audience, and the moment somebody has to explain themselves.`
    }
};

const discussionSets = [
    {
        id: 'set-funny-to-me',
        title: `It Was Funny to Me`,
        stage: `React`,
        icon: 'react',
        description: `The things you laugh at alone, the ones you laugh at to be polite, and the story your friends will not stop telling.`,
        moments: [
            {
                id: 'moment-funny-to-you-alone',
                preview: `The thing only you laugh at.`,
                question: `What makes you laugh that the people closest to you do not find funny at all — a kind of joke, a video you have watched far too many times, a word, somebody’s voice? What happens when you try to show them?`,
                upgrade: {
                    term: `have a soft spot for something`,
                    type: `phrase`,
                    definition: `To like something more than you can fully explain, often something other people think is poor.`,
                    ordinary: `“I like terrible puns more than I should, and I have no defence for it.”`,
                    upgraded: `“I’ve got a soft spot for terrible puns, and I have no defence for it.”`,
                    priority: 'key',
                    atlasPrompt: `What do you have a soft spot for that surprises people — a food, a song, a shop, a place you keep going back to?`
                }
            },
            {
                id: 'moment-worst-time-to-laugh',
                preview: `The worst possible moment.`,
                question: `Where were you the last time you completely lost control of your laughing at exactly the wrong moment — a funeral, a meeting, an exam, a serious conversation? What started it — or have you sat and watched somebody else fail to stop?`,
                upgrade: {
                    term: `have the giggles`,
                    type: `phrase`,
                    definition: `To be unable to stop laughing, usually at a bad moment.`,
                    ordinary: `“Once we started laughing we could not stop, and the more serious it became the worse we got.”`,
                    upgraded: `“Once we had the giggles, the more serious it became the worse we got.”`,
                    priority: 'standard',
                    atlasPrompt: `Who do you get the giggles with most easily, and what is it about that person?`
                }
            },
            {
                id: 'moment-the-story-they-retell',
                preview: `The story that keeps improving.`,
                question: `Most groups have one story they will not stop telling about one person. Which one does your family, your workplace, or your circle of friends keep going back to — who tells it best, and how much better has it got since it actually happened?`,
                upgrade: {
                    term: `dine out on something`,
                    type: `idiom`,
                    definition: `To keep getting attention or social value from telling the same story.`,
                    ordinary: `“He has been telling that story at every party for ten years and people still buy him drinks for it.”`,
                    upgraded: `“He has been dining out on that story for ten years.”`,
                    priority: 'standard',
                    atlasPrompt: `What has somebody you know been dining out on for years — a job they once had, a person they once met, a piece of extraordinary luck?`
                }
            },
            {
                id: 'moment-the-private-phrase',
                preview: `Four words, and nobody outside understands.`,
                question: `What phrase does your family, your team, or your group of friends say that would mean nothing at all to anyone outside it? Where did it come from — and what happens when somebody new hears it for the first time?`,
                upgrade: {
                    term: `you had to be there`,
                    type: `spoken phrase`,
                    definition: `Said when something cannot be made funny to somebody who was not present.`,
                    ordinary: `“I could explain the joke, but it would only be funny to somebody who was there at the time.”`,
                    upgraded: `“I could explain the joke, but you had to be there.”`,
                    priority: 'key',
                    atlasPrompt: `When have you given up describing something — a night out, a place, an argument at work — because you had to be there?`
                }
            },
            {
                id: 'moment-laughing-to-be-polite',
                preview: `The laugh you do not mean.`,
                question: `Whose jokes do you laugh at without ever really finding them funny — a boss, a relative, a customer, a friend who is trying hard? And is anybody doing it for you?`,
                upgrade: {
                    term: `humour someone`,
                    type: `verb`,
                    definition: `To go along with somebody so as not to upset or annoy them.`,
                    ordinary: `“I let him tell the same story again because it was easier than saying anything.”`,
                    upgraded: `“I humoured him and let him tell the same story again.”`,
                    priority: 'standard',
                    atlasPrompt: `When do you humour somebody rather than argue — a relative, a customer, a small child, somebody at work?`
                }
            }
        ],
        makeItReal: {
            title: `The thing that does not travel`,
            prompt: `Take one thing that is funny inside your language, your family, or your workplace — a phrase, a running joke, a way of saying something. Explain it to somebody with none of the context, until they understand why it works. The aim is to be understood, not to get a laugh.`
        }
    },
    {
        id: 'set-what-a-joke-does',
        title: `What a Joke Actually Does`,
        stage: `Explain`,
        icon: 'explain',
        description: `Who is allowed, who it is aimed at, who is watching — and what it costs when it goes wrong.`,
        moments: [
            {
                id: 'moment-who-is-allowed',
                preview: `One person can say anything.`,
                question: `In most groups there is somebody who can say things that would start an argument if anyone else said them. Who is that where you work or in your family — and how did they earn the right, or has nobody ever questioned it?`,
                upgrade: {
                    term: `get away with something`,
                    type: `phrasal verb`,
                    definition: `To do something you should not be able to do without being punished or challenged.`,
                    ordinary: `“If anybody else said that there would be an argument, but somehow nobody ever challenges him.”`,
                    upgraded: `“If anybody else said that there would be an argument, but somehow he gets away with it.”`,
                    priority: 'key',
                    atlasPrompt: `What do you get away with at home or at work that other people would never be allowed?`
                }
            },
            {
                id: 'moment-only-joking',
                preview: `“I’m only joking.”`,
                question: `Somebody says something that stings and then adds “I’m only joking.” When is that a real repair, and when is it a way of saying the thing and keeping it? What would make you believe them?`,
                upgrade: {
                    term: `pass something off as something`,
                    type: `phrasal verb`,
                    definition: `To present something as though it were something else, usually to avoid trouble.`,
                    ordinary: `“He said something cruel and then pretended he had meant it as a joke.”`,
                    upgraded: `“He said something cruel and then passed it off as a joke.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you watched somebody pass off a mistake as something they meant to do?`
                }
            },
            {
                id: 'moment-joke-to-escape',
                preview: `A joke instead of an apology.`,
                question: `Have you ever watched somebody make a joke to get themselves out of trouble? Did it work, or did it make everything considerably worse? What was the situation?`,
                upgrade: {
                    term: `defuse`,
                    type: `verb`,
                    definition: `To make a tense or dangerous situation calmer.`,
                    ordinary: `“He made one joke and the tension in the room disappeared.”`,
                    upgraded: `“He made one joke and defused the whole thing.”`,
                    priority: 'standard',
                    atlasPrompt: `Who do you know who is good at defusing an argument — what do they actually do?`
                }
            },
            {
                id: 'moment-funny-with-or-at',
                preview: `Funny with you, or funny at you.`,
                question: `Some people are funny with you; some are funny at whoever is nearest. Which do you actually enjoy being around — and is the second kind ever worth it?`,
                upgrade: {
                    term: `at someone’s expense`,
                    type: `phrase`,
                    definition: `In a way where one person gains and another is made to look bad or loses something.`,
                    ordinary: `“Most of his jokes work because somebody else is being made to look stupid.”`,
                    upgraded: `“Most of his jokes are at somebody else’s expense.”`,
                    priority: 'standard',
                    atlasPrompt: `Where else does one person gain at somebody else’s expense — at work, in a family, in a company you have dealt with?`
                }
            },
            {
                id: 'moment-joke-in-translation',
                preview: `Hilarious at home. Nothing here.`,
                question: `What is funny in your own language that collapses completely in English, or the other way round? What actually disappears in the move — the sound of the words, the thing everybody already knows, the person being imitated?`,
                upgrade: {
                    term: `get the reference`,
                    type: `phrase`,
                    definition: `To understand what somebody is pointing at when they mention something indirectly.`,
                    ordinary: `“I made the joke and nobody in the room understood what I was pointing at.”`,
                    upgraded: `“I made the joke and nobody got the reference.”`,
                    priority: 'standard',
                    atlasPrompt: `When has somebody made a reference — to a film, a song, a piece of news — that you completely missed?`
                }
            }
        ],
        makeItReal: {
            title: `Change one thing`,
            prompt: `Think of a joke you have watched go badly wrong — yours or somebody else’s. Now change one single thing about the situation: who said it, who it was about, or who else was in the room. Would it have worked? Then say which of those three was doing the real damage.`
        }
    },
    {
        id: 'set-cost-and-saved',
        title: `What It Cost, What It Saved`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The joke that helped, the one you would unsay, and the humour you picked up from somebody else without noticing.`,
        moments: [
            {
                id: 'moment-humour-that-helped',
                preview: `The right joke at the worst time.`,
                question: `Who has made you laugh when things were genuinely bad — for you, or for somebody you were standing next to? A long delay, a disaster at work, a room where nobody knew what to say. What did they say, and why did it help instead of offend?`,
                upgrade: {
                    term: `see the funny side`,
                    type: `phrase`,
                    definition: `To find something amusing in a situation that is difficult or annoying.`,
                    ordinary: `“Even while everything was going wrong, she could still find something amusing in it.”`,
                    upgraded: `“Even while everything was going wrong, she could still see the funny side.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you managed to see the funny side at the time rather than years later — a journey, a job, a piece of bad luck?`
                }
            },
            {
                id: 'moment-the-joke-you-regret',
                preview: `The one you would unsay.`,
                question: `Is there a joke you wish you had never made — or one you watched somebody else make and instantly regret? What made it the wrong one: the person, the room, or the moment it was said?`,
                upgrade: {
                    term: `kick yourself`,
                    type: `idiom`,
                    definition: `To be annoyed with yourself about something you did or said.`,
                    ordinary: `“I still feel annoyed with myself about what I said that evening.”`,
                    upgraded: `“I still kick myself about what I said that evening.”`,
                    priority: 'key',
                    atlasPrompt: `What decision do you still kick yourself about — a job, a purchase, something you did not say at the time?`
                }
            },
            {
                id: 'moment-stopped-being-funny',
                preview: `It was funny then.`,
                question: `What did people around you laugh at years ago that would land very differently now — at home, at work, on television? Did the joke change, or did the people?`,
                upgrade: {
                    term: `not age well`,
                    type: `phrase`,
                    definition: `To seem much worse now than it did at the time.`,
                    ordinary: `“Those jokes were completely normal at the time, but watching them now is uncomfortable.”`,
                    upgraded: `“Those jokes have not aged well.”`,
                    priority: 'key',
                    atlasPrompt: `What else from twenty years ago has not aged well — an advert, a film, a piece of technology, a rule at work?`
                }
            },
            {
                id: 'moment-whose-humour-you-use',
                preview: `Whose jokes are you making?`,
                question: `Whose sense of humour did you inherit — a parent, an older sibling, a teacher, an old colleague — or whose can you hear coming out of somebody else you know? What of theirs is still being said?`,
                upgrade: {
                    term: `take after someone`,
                    type: `phrasal verb`,
                    definition: `To be similar to an older relative or somebody you grew up around.`,
                    ordinary: `“My sense of humour is very like my father’s, which I did not notice until recently.”`,
                    upgraded: `“I take after my father more than I realised.”`,
                    priority: 'key',
                    atlasPrompt: `Who do you take after in something that has nothing to do with jokes — the way you work, cook, argue, or spend money?`
                }
            },
            {
                id: 'moment-worse-to-be-around',
                preview: `Pick the one you can bear.`,
                question: `Which is worse to be around: the person who goes cold the second anybody teases them, or the person who will not stop making jokes? Make the case — and does your answer change depending on whether it is a friend, a colleague, or a relative?`,
                upgrade: {
                    term: `take a joke`,
                    type: `phrase`,
                    definition: `To accept being laughed at without becoming upset.`,
                    ordinary: `“He gets offended the moment anybody teases him, even gently.”`,
                    upgraded: `“He can’t take a joke, even a gentle one.”`,
                    priority: 'standard',
                    atlasPrompt: `Where is it hardest to take a joke — at work, in front of your family, from somebody you have only just met?`
                }
            }
        ],
        makeItReal: {
            title: `From the other side`,
            prompt: `Choose a joke that was aimed at you, or at somebody you know well. Tell it again as the person who made it — what they thought they were doing, and what they expected to happen. You are not defending them. You are speaking as them.`
        }
    }
];

const clCards = [
    {
        id: 'cl-the-only-one-allowed',
        contextLine: `Royal and noble households · Many eras`,
        title: `The Only Person Allowed`,
        teaser: `One man in the hall could mock the king and keep his job.`,
        context: `Fools and jesters were kept in royal and noble households across Europe and beyond. A common feature of the role, in many accounts, was licence: the fool could say things to powerful people that would have been dangerous coming from anybody else. How far that protection really went is unclear and almost certainly varied — some were dismissed, and some were punished. But the figure keeps returning: one person in the room permitted to say the unsayable.`,
        mainQuestion: `Would you take the job? Paid to say what everybody else is thinking, to somebody who can dismiss you at any moment.`,
        followTheThread: [
            `Does saying something as a joke make it safer to say, or just easier to ignore?`,
            `Who is the closest thing to that role now — and are they protected, or only tolerated?`
        ],
        upgrade: {
            term: `soften the blow`,
            type: `phrase`,
            definition: `To make bad or unwelcome news easier for somebody to receive.`,
            ordinary: `“He told them the decision, but he made a joke first so that it was easier to hear.”`,
            upgraded: `“He made a joke first to soften the blow.”`,
            priority: 'key',
            atlasPrompt: `How do you soften the blow when you have to give somebody news they will not want?`
        }
    },
    {
        id: 'cl-obliged-to-mock',
        contextLine: `Many societies`,
        title: `Required to Insult Him`,
        teaser: `With certain relatives, teasing is not a choice. It is the relationship.`,
        context: `Anthropologists have described a pattern reported in many societies across Africa, South Asia, the Pacific and elsewhere: some family relationships carry an obligation to joke, tease or insult, while others require strict politeness. A person might be expected to mock one particular cousin or in-law freely, and to speak to another relative with great care. The forms differ widely, and in some traditions the joking is expected precisely at the hardest moments — weddings, and funerals.`,
        mainQuestion: `If teasing somebody were a duty rather than a choice, would that make it easier to take — or would you still hear an insult?`,
        followTheThread: [
            `Which relationships in your own life already work like this, with no rule written anywhere?`,
            `Is there anybody you are careful with — somebody you would never joke with, and could not fully explain why?`
        ],
        upgrade: {
            term: `fair game`,
            type: `phrase`,
            definition: `Somebody or something that everyone accepts can be criticised or joked about.`,
            ordinary: `“In that family, everybody accepts that the new husband can be joked about as much as anyone likes.”`,
            upgraded: `“In that family, the new husband is fair game.”`,
            priority: 'standard',
            atlasPrompt: `What is fair game for criticism where you work, and who or what is never touched?`
        }
    },
    {
        id: 'cl-read-before-it-was-said',
        contextLine: `Britain · Until the late 1960s`,
        title: `Somebody Read It First`,
        teaser: `Every line of every play was approved by a government office before an audience heard it.`,
        context: `For centuries in Britain, plays had to be sent to a government office before they could be performed. The office could cut lines, demand changes, or refuse a play altogether. Writers learned to guess what would be cut, and to bury meanings the office might miss. The power was finally removed in the late 1960s. Arrangements of this kind have existed in many countries, and in some places still do.`,
        mainQuestion: `If you had to send one of your own jokes to that office, what would you cut before it ever left your hands?`,
        followTheThread: [
            `Where do you already edit yourself before you speak — at work, online, in front of certain relatives?`,
            `Does knowing something is forbidden make a joke funnier, or only more expensive?`
        ],
        upgrade: {
            term: `tone something down`,
            type: `phrasal verb`,
            definition: `To make something less strong, less extreme, or less likely to offend.`,
            ordinary: `“He rewrote the message and made it much less forceful before he sent it.”`,
            upgraded: `“He toned the message down before he sent it.”`,
            priority: 'key',
            atlasPrompt: `When did you last tone something down before sending it — an email, a message, a piece of feedback?`
        }
    },
    {
        id: 'cl-insults-with-rules',
        contextLine: `Old Norse and Scots verse`,
        title: `Insults With Rules`,
        teaser: `Two people trading elaborate abuse in verse, with an audience keeping score.`,
        context: `Old Norse and older Scots literature record contests of formal insult, sometimes in verse, in which two people traded elaborate abuse in front of an audience. The exchanges could be extremely rude and very personal, and they were also performances with rules — the admiration was for how the insult was built, not only for the offence in it. Formal insult contests have been recorded in a number of other cultures too.`,
        mainQuestion: `Is there anywhere near you where insults work like this — a sport, a workplace, a family, a group of friends? Who would win, and what makes them good at it?`,
        followTheThread: [
            `Does an audience make an insult safer, or does it just stop anybody backing down?`,
            `Would you rather be beaten by somebody genuinely sharper than you, or spared by somebody being kind?`
        ],
        upgrade: {
            term: `give as good as you get`,
            type: `idiom`,
            definition: `To answer attacks or criticism with equal force rather than accepting them.`,
            ordinary: `“They criticised her constantly, but she always answered with something just as sharp.”`,
            upgraded: `“They criticised her constantly, but she always gave as good as she got.”`,
            priority: 'standard',
            atlasPrompt: `Who do you know who gives as good as they get — in an argument, a negotiation, or a family disagreement?`
        }
    },
    {
        id: 'cl-a-tool-that-does-not-exist',
        contextLine: `Workshops and kitchens · Many countries`,
        title: `The Tool That Does Not Exist`,
        teaser: `The new arrival is sent to fetch something nobody has ever owned.`,
        context: `In workshops, kitchens, building sites and army units, a new arrival is sent to fetch something that does not exist: striped paint, a left-handed screwdriver, a bucket of steam, a long weight. Versions are reported in many countries and many trades. Everybody else already knows, and the newcomer is sent from one department to the next while the story travels ahead of them.`,
        mainQuestion: `Everybody in the building knows except one person. Is the joke on the newcomer — or is the newcomer just the excuse for everybody else to enjoy themselves?`,
        followTheThread: [
            `How long should it run before somebody tells them?`,
            `Afterwards, is the group easier to join — or have you simply been shown where you stand?`
        ],
        upgrade: {
            term: `be in on something`,
            type: `phrase`,
            definition: `To be one of the people who know about a secret or a plan.`,
            ordinary: `“Everybody in the office knew what was going to happen except me.”`,
            upgraded: `“Everybody in the office was in on it except me.”`,
            priority: 'key',
            atlasPrompt: `When were you the last to be let in on something at work or in your family — and how did you find out?`
        }
    },
    {
        id: 'cl-a-day-for-lying',
        contextLine: `Many countries · One day a year`,
        title: `A Day When Lying Is Allowed`,
        teaser: `For a few hours the rules are suspended. Then they come back.`,
        context: `In many countries one day a year is set aside for tricks. In much of Europe and the English-speaking world it falls on 1 April; in Spain and much of Latin America a comparable tradition falls on 28 December. Newspapers and broadcasters have often joined in with invented stories. The origins are disputed and the customs differ, but a common feature is a limit: in some traditions the joking is supposed to stop by midday, and the trickster is expected to reveal themselves.`,
        mainQuestion: `Somebody tricks you at eleven in the morning and confesses at noon. Are you more forgiving — or more annoyed that it was planned?`,
        followTheThread: [
            `Is there anybody you would never play a trick on, and what makes them different?`,
            `Does it change anything if the trick is played on a whole country rather than on one person?`
        ],
        upgrade: {
            term: `fall for something`,
            type: `phrasal verb`,
            definition: `To believe something that is not true, especially a trick or a lie.`,
            ordinary: `“I believed the whole story completely until my sister started laughing.”`,
            upgraded: `“I fell for the whole story until my sister started laughing.”`,
            priority: 'key',
            atlasPrompt: `What have you fallen for that you now think you should have questioned — an advert, an excuse, a price that was far too low?`
        }
    },
    {
        id: 'cl-not-meant-to-be-heard',
        contextLine: `Hospitals, emergency services and armed forces`,
        title: `The Joke You Were Not Meant to Hear`,
        teaser: `People who deal with the worst things often talk about them in the least respectful way.`,
        context: `People whose work brings them into daily contact with injury, death or danger — medical staff, emergency crews, soldiers, undertakers — are widely reported to use a very dark humour among themselves. It is usually kept strictly inside the group. Overheard by anybody else it can sound shocking, and the people who use it will often say they would rather not have to explain it.`,
        mainQuestion: `You overhear it in a corridor. Do you judge them — and does your answer change depending on whether you are a stranger, a patient, or the relative waiting outside?`,
        followTheThread: [
            `Is there humour in your own work that you would never use in front of a customer or a client?`,
            `Does it become a different thing the moment somebody outside hears it?`
        ],
        upgrade: {
            term: `gallows humour`,
            type: `noun`,
            definition: `Humour about very serious or frightening things, used by the people who are inside the situation.`,
            ordinary: `“The jokes they made about the accident were extremely dark, but it was how they got through the shift.”`,
            upgraded: `“It was gallows humour, but it was how they got through the shift.”`,
            priority: 'standard',
            atlasPrompt: `Where else have you heard gallows humour — a delayed flight, an exam corridor, a difficult week at work?`
        }
    },
    {
        id: 'cl-a-joke-meant-to-be-bad',
        contextLine: `Britain · Christmas`,
        title: `The Joke Is Supposed to Be Terrible`,
        teaser: `A paper hat, a plastic toy, and a joke everybody groans at on purpose.`,
        context: `At Christmas in Britain and some other countries, people pull paper crackers at the table. Inside each one there is a paper hat, a small plastic toy, and a printed joke. The jokes are famously bad — old, obvious, groaned at rather than laughed at — and reading them aloud around the table is part of the ritual. Nobody expects to laugh. Everybody would notice if they were not there.`,
        mainQuestion: `Every group has something like this — a joke, a song, a routine everybody says is terrible. If you were the one who could quietly drop it this year, would you?`,
        followTheThread: [
            `Why is a bad joke easier to share than a good one?`,
            `What else survives only because stopping it would feel worse than keeping it?`
        ],
        upgrade: {
            term: `corny`,
            type: `adjective`,
            definition: `Too obvious, too sentimental, or too old to be clever — and often enjoyed anyway.`,
            ordinary: `“He tells the same old obvious jokes at every family dinner and everybody groans.”`,
            upgraded: `“He tells the same corny jokes at every family dinner and everybody groans.”`,
            priority: 'key',
            atlasPrompt: `What do you find corny that other people love — a film ending, a song, a wedding speech, a greetings card?`
        }
    }
];
