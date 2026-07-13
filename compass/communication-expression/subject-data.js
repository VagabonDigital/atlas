/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Communication & Expression
  --------------------------------------------------------------------------
  A premium interactive speaking subject about the way people actually talk:
  the habits we notice in everyone else, the ones we defend in ourselves, and
  the handful of sentences that turn out to have done something.
  Built for tutor-led conversation, shared-screen teaching, recognition,
  confession, playful disagreement, and sharper spoken English.
  Compass v3 rebuild. Rough editorial pass.
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'communication-expression',
    schemaVersion: 2,
    contentVersion: '3.0.0',
    title: 'Communication & Expression',
    titleHtml: 'Communication & <em>Expression</em>',
    navTitle: 'Communication',
    bgImage: 'https://photos.smugmug.com/Atlas/i-HRxxfKm/0/LxfwrSftsBGtshL2rMnbjKdDnxpzS6kRwnZFvCXF5/O/2d9b20d4-fb4f-4a9d-b2de-80dd6a13a04a.png'
};

const subjectCopy = {
    cover: {
        hook: `Everyone knows a bad communicator. Nobody thinks it's them.`
    },
    overview: {
        heading: `Everyone's an Expert`,
        intro: [
            `You have been studying this your whole life. You know exactly who sends the four-minute voice note, who never replies, and who tells the same story at every dinner. What's harder to see is your own version — the you who appears in another language, who goes quiet when angry, who says yes and means no. So: are you a good communicator, and would the people who know you best agree?`
        ]
    },
    paths: {
        culturalLensDescription: `Whistled conversations, invented languages, ritual insults, and social codes that catch outsiders out.`,
        discussionDescription: `Habits, verdicts, confessions, and stories — from the voice note you ignored to the sentence that changed something.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to bring together ideas from different parts of the subject.`
    },
    culturalLens: {
        heading: `Stranger Ways to Say It`,
        intro: `People have found strange ways to make themselves understood, and strict rules about how. Some of what follows will look absurd from the outside — and some of it, you already do.`
    },
    discussion: {
        heading: `The Way We Really Talk`
    },
    reflection: {
        title: `The Last Word`,
        summary: `Look back at what came up — the habits you defended, the people you recognised, and the moments that changed direction. Notice which ideas you argued with, and which ones you would repeat to someone else.`,
        questions: [
            `Whose communication habits did you recognise most — someone else's, or your own?`,
            `Do people usually take you the way you meant, and does that change in English?`
        ]
    },
    keyLanguage: {
        intro: `Expressions for describing people, admitting things, and saying how something landed.`
    }
};

const discussionSets = [
    {
        id: 'set-you-know-someone-like-this',
        title: `You Know Someone Like This`,
        stage: `React`,
        icon: 'react',
        description: `The four-minute voice note, the message that just says “can we talk,” and the friend who tells the story better than it happened.`,
        moments: [
            {
                id: 'moment-four-minute-voice-note',
                preview: `Four minutes of audio. Two lines of content.`,
                question: `Someone sends a four-minute voice note to say they'll be ten minutes late. Do you listen at double speed, put it off for three days, or are you secretly one of these people? Who's the worst offender you know?`,
                upgrade: {
                    term: `long-winded`,
                    type: `adjective`,
                    definition: `Taking far more words than necessary to say something.`,
                    ordinary: `“He takes about ten minutes to tell you something that would fit in one sentence.”`,
                    upgraded: `“He's incredibly long-winded.”`,
                    priority: 'key',
                    atlasPrompt: `Who is the most long-winded person in your workplace, and what happens when they get the floor?`
                }
            },
            {
                id: 'moment-can-we-talk-later',
                preview: `“Can we talk later?” Nothing else. No context.`,
                question: `“Can we talk later?” “Call me when you get this.” No context, no clue, no follow-up message. What goes through your head in the next ten minutes — and who does this to you?`,
                upgrade: {
                    term: `fear the worst`,
                    type: `phrase`,
                    definition: `To immediately assume the worst possible outcome.`,
                    ordinary: `“The moment I read it, I assumed something absolutely terrible had happened.”`,
                    upgraded: `“The moment I read it, I feared the worst.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you last fear the worst and then find out it was nothing at all?`
                }
            },
            {
                id: 'moment-wrong-recipient',
                preview: `The message that went to exactly the wrong person.`,
                question: `The complaint about your boss, sent to your boss. The screenshot forwarded to the person in it. The reply-all nobody survives. What's the worst one you've sent — or the best one you've watched land on somebody else?`,
                upgrade: {
                    term: `cringe`,
                    type: `verb`,
                    definition: `To feel a sharp, physical embarrassment, usually about something you did.`,
                    ordinary: `“I still feel horribly embarrassed and want to disappear whenever I remember it.”`,
                    upgraded: `“I still cringe every time I think about it.”`,
                    priority: 'key',
                    atlasPrompt: `What do you cringe at now that you thought was completely fine ten years ago?`
                }
            },
            {
                id: 'moment-small-talk-trap',
                preview: `Twenty floors. One stranger. Nothing to say.`,
                question: `You're stuck — in a lift, at a wedding, beside someone at a work dinner — and there is nothing to say. Is this a small pleasure or your personal hell? And what's your emergency topic?`,
                upgrade: {
                    term: `strike up a conversation`,
                    type: `phrase`,
                    definition: `To start talking to someone, often a stranger.`,
                    ordinary: `“I started talking to the man next to me and we ended up chatting for an hour.”`,
                    upgraded: `“I struck up a conversation with the man next to me and we ended up chatting for an hour.”`,
                    priority: 'standard',
                    atlasPrompt: `Where is it normal to strike up a conversation with a stranger where you live — and where would it be deeply strange?`
                }
            },
            {
                id: 'moment-the-exaggerator',
                preview: `Great story. Definitely not what happened.`,
                question: `Everyone knows someone whose stories are excellent and about thirty per cent true — the queue got longer, the fish got bigger, the boss said something even better than he actually said. Who is yours, and does it really matter?`,
                upgrade: {
                    term: `stretch the truth`,
                    type: `idiom`,
                    definition: `To exaggerate, without quite lying.`,
                    ordinary: `“He wasn't exactly lying, but he was definitely making it sound better than it really was.”`,
                    upgraded: `“He wasn't lying exactly — he was just stretching the truth.”`,
                    priority: 'standard',
                    atlasPrompt: `Where is stretching the truth completely acceptable — a story, a CV, a first date, a job interview?`
                }
            }
        ],
        makeItReal: {
            title: `The one nobody let you forget`,
            prompt: `Tell a communication disaster you can laugh about now — something said, sent, or overheard — or one you watched happen to somebody else. Where were you, what went wrong, and how did the room react?`
        }
    },
    {
        id: 'set-and-what-are-you-like',
        title: `And What Are You Like?`,
        stage: `Explain`,
        icon: 'explain',
        description: `The habits you'd defend, the person who turns up when you're angry, and the version of you that only exists in English.`,
        moments: [
            {
                id: 'moment-how-you-say-no',
                preview: `A clean no, or a beautiful excuse?`,
                question: `An invitation you don't want, a favour you can't face, extra work you never asked for. Do you say no cleanly, invent something, or go quiet and hope it disappears? And is a good excuse actually kinder than the truth?`,
                upgrade: {
                    term: `wriggle out of something`,
                    type: `phrasal verb`,
                    definition: `To avoid something you agreed to or are expected to do, usually by finding an excuse.`,
                    ordinary: `“I found a way to avoid the dinner without ever actually saying I didn't want to go.”`,
                    upgraded: `“I wriggled out of the dinner.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you most often try to wriggle out of — meetings, family events, exercise, your turn to pay?`
                }
            },
            {
                id: 'moment-when-youre-angry',
                preview: `Loud, silent, or terrifyingly polite.`,
                question: `Some people get loud. Some go completely silent. Some become so calm and formal that everyone in the room starts to worry. What happens to your voice and your words when you're properly annoyed — and does anybody ever notice?`,
                upgrade: {
                    term: `snap at someone`,
                    type: `phrasal verb`,
                    definition: `To speak to someone sharply and angrily, usually briefly.`,
                    ordinary: `“I spoke to her far more sharply than I meant to, because I was tired.”`,
                    upgraded: `“I snapped at her because I was tired.”`,
                    priority: 'key',
                    atlasPrompt: `Who do you snap at most — and who would you never dare snap at?`
                }
            },
            {
                id: 'moment-you-in-another-language',
                preview: `A slightly different person, in another language.`,
                question: `People often say they become someone slightly different in another language — blunter in one, funnier in another, oddly shy in a third. Who turns up when you speak English — and do you like them?`,
                upgrade: {
                    term: `get something across`,
                    type: `phrasal verb`,
                    definition: `To succeed in making other people understand what you mean.`,
                    ordinary: `“In English, people don't really get a sense of what I'm like as a person.”`,
                    upgraded: `“In English, it's hard to get my personality across.”`,
                    priority: 'key',
                    atlasPrompt: `What idea do you find hardest to get across at work — and what usually goes wrong?`
                }
            },
            {
                id: 'moment-what-you-cant-say-yet',
                preview: `Three sentences to say one small thing.`,
                question: `There's always something you can't say in English yet, so you go the long way round — three sentences to land something that takes four words at home. What do you keep having to talk around?`,
                upgrade: {
                    term: `put something into words`,
                    type: `phrase`,
                    definition: `To express something clearly in language, especially when it is difficult.`,
                    ordinary: `“I know exactly what I mean, but I can't find the right English to actually say it.”`,
                    upgraded: `“I know exactly what I mean — I just can't put it into words.”`,
                    priority: 'standard',
                    atlasPrompt: `What feeling is hard to put into words in any language you speak?`
                }
            },
            {
                id: 'moment-doing-the-impression',
                preview: `You can do them. You know you can.`,
                question: `Some people can do a devastating impression of a colleague, a relative, a politician — the voice, the pauses, the little cough before bad news. Can you? And when does imitating someone stop being affectionate?`,
                upgrade: {
                    term: `spot on`,
                    type: `informal phrase`,
                    definition: `Exactly right; completely accurate.`,
                    ordinary: `“Her imitation of the manager was exactly right, all the way down to the throat-clearing.”`,
                    upgraded: `“Her impression of the manager was spot on, right down to the throat-clearing.”`,
                    priority: 'standard',
                    atlasPrompt: `Whose impression of somebody you know is spot on — and does the victim know about it?`
                }
            }
        ],
        makeItReal: {
            title: `Your operating manual`,
            prompt: `Give someone the three-line guide to communicating with you: how to give you bad news, how to get you to say yes, and the one thing that will make you go completely quiet. Which of the three do the people close to you already know?`
        }
    },
    {
        id: 'set-words-that-did-something',
        title: `Words That Did Something`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The sentence that changed everything, the line somebody never forgot, and the speech you'd rather not remember.`,
        moments: [
            {
                id: 'moment-words-that-do-things',
                preview: `Some sentences don't describe. They do.`,
                question: `“You're hired.” “It's over.” “Not guilty.” “I do.” Nothing physical happens, and yet nothing is the same afterwards. Which sentence like that have you said, heard, or watched land on somebody else?`,
                upgrade: {
                    term: `take something back`,
                    type: `phrase`,
                    definition: `To withdraw something you have said, or wish you could.`,
                    ordinary: `“I said it, and immediately wished I could undo it — but of course you can't.”`,
                    upgraded: `“I said it, and immediately wanted to take it back — but you can't.”`,
                    priority: 'key',
                    atlasPrompt: `What's one thing you'd take back if you could — a message, a comment, an agreement, a yes?`
                }
            },
            {
                id: 'moment-line-you-remember',
                preview: `Fifteen years later, word for word.`,
                question: `Most of what people say to us is gone by the evening. But one line — a kind one, a cruel one, a teacher's throwaway remark — can survive for decades. Which one is still with you, or which one does somebody in your family still quote?`,
                upgrade: {
                    term: `stick with someone`,
                    type: `phrase`,
                    definition: `(Of words or an experience) to stay in someone's memory for a long time.`,
                    ordinary: `“Someone said it to me fifteen years ago and I have never once forgotten it.”`,
                    upgraded: `“Someone said it to me fifteen years ago and it has stuck with me ever since.”`,
                    priority: 'standard',
                    atlasPrompt: `What line from a film, a book, or a song has stuck with you — and why that one?`
                }
            },
            {
                id: 'moment-apology-that-works',
                preview: `“Sorry you feel that way.”`,
                question: `Some apologies make it worse: the one that blames you for being upset, the one delivered so fast it's clearly just admin. And then there's the rare one that actually fixes something. What does the good one do that the others don't?`,
                upgrade: {
                    term: `own up to something`,
                    type: `phrasal verb`,
                    definition: `To admit that you did something wrong.`,
                    ordinary: `“He admitted straight away that it was his fault, instead of trying to explain it away.”`,
                    upgraded: `“He owned up to it straight away, instead of trying to explain it away.”`,
                    priority: 'key',
                    atlasPrompt: `Is it easier to own up at work or at home — and who taught you which?`
                }
            },
            {
                id: 'moment-thirty-seconds-at-the-microphone',
                preview: `The toast, the speech, the awful silence.`,
                question: `The wedding speech that ran for twenty minutes. The leaving toast that made everyone cry. The best man who should have sat down much earlier. What's the best — or the most excruciating — speech you have ever sat through?`,
                upgrade: {
                    term: `dry up`,
                    type: `phrasal verb`,
                    definition: `To suddenly stop speaking because you cannot think of anything to say.`,
                    ordinary: `“I stood up to speak and suddenly I couldn't remember a single word of it.”`,
                    upgraded: `“I stood up to speak and completely dried up.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you dried up — an interview, a presentation, an argument, a first date?`
                }
            },
            {
                id: 'moment-who-you-tell-first',
                preview: `Something happens. Who gets the call?`,
                question: `Something big happens — good or bad. Who is the first person you tell, and why them rather than somebody else? And is there anyone you would deliberately not tell?`,
                upgrade: {
                    term: `confide in someone`,
                    type: `verb`,
                    definition: `To tell someone private things because you trust them.`,
                    ordinary: `“She's the one person I tell things to when something is really wrong.”`,
                    upgraded: `“She's the one person I confide in.”`,
                    priority: 'standard',
                    atlasPrompt: `Is it easier to confide in an old friend or in a complete stranger — and why?`
                }
            }
        ],
        makeItReal: {
            title: `Thirty seconds and a microphone`,
            prompt: `Someone hands you a microphone at a leaving party — for a colleague, a friend, or a relative — and you have thirty seconds. What do you actually say about them, and what would you very carefully leave out?`
        }
    }
];

const clCards = [
    {
        id: 'cl-whistled-language',
        contextLine: `La Gomera · Canary Islands`,
        title: `The Language You Whistle`,
        teaser: `A full conversation, whistled across a valley — and everyone can hear it.`,
        context: `On the island of La Gomera, people whistle Spanish. Silbo is a whistled form of the language, developed to cross deep ravines where a shout would die halfway. It travels far further than a voice, it is taught in the island's schools — and every single person within range hears exactly what you said.`,
        mainQuestion: `Everything you whistle is public. What would you happily send across a valley — and what could you never say that way?`,
        followTheThread: [
            `Would a place where nothing can be said quietly be friendlier, or unbearable?`,
            `Which conversations in your life only work because they happen at low volume?`
        ],
        upgrade: {
            term: `within earshot`,
            type: `phrase`,
            definition: `Close enough to hear what is being said.`,
            ordinary: `“I said it quietly, but I hadn't realised she was close enough to hear every word.”`,
            upgraded: `“I said it quietly, but I hadn't realised she was within earshot.”`,
            priority: 'standard',
            atlasPrompt: `Where do people forget who's within earshot — an office, a lift, a train, a family kitchen?`
        }
    },
    {
        id: 'cl-how-are-you',
        contextLine: `English small talk`,
        title: `The Question That Might Not Be a Question`,
        teaser: `Sometimes “How are you?” means “hello.” An honest answer changes the plan.`,
        context: `In much of the English-speaking world, “How are you?” works as a greeting rather than an enquiry. The expected reply is “Fine, you?” — even from somebody having a catastrophic week. Newcomers who answer honestly, with detail, often watch the other person's face do something complicated.`,
        mainQuestion: `Have you ever been caught out by one of these — answering honestly, or getting an honest answer when you weren't expecting one? What happened?`,
        followTheThread: [
            `Is a question nobody wants answered friendly, or hollow?`,
            `What's the equivalent where you live — the phrase everyone says and nobody means literally?`
        ],
        upgrade: {
            term: `pleasantries`,
            type: `noun`,
            definition: `Polite, unimportant things people say to each other before the real conversation starts.`,
            ordinary: `“We spent five minutes saying polite, meaningless things to each other before anyone mentioned the money.”`,
            upgraded: `“We spent five minutes on pleasantries before anyone mentioned the money.”`,
            priority: 'standard',
            atlasPrompt: `How long do pleasantries last before business where you're from — thirty seconds, or half an hour?`
        }
    },
    {
        id: 'cl-taarof',
        contextLine: `Iran · ta'arof`,
        title: `The “No” Before Yes`,
        teaser: `Refusing politely can be the first step of accepting.`,
        context: `In many Iranian settings, a custom often called ta'arof shapes offers and refusals. A host offers food again and again; the guest declines once, twice, and accepts only after being urged. A taxi driver may wave away the fare, expecting the passenger to insist. The first no is often not a no.`,
        mainQuestion: `Someone offers you something you would genuinely love. Do you take it immediately, or say “no, no, I couldn't” first — and where did that habit come from?`,
        followTheThread: [
            `How many times should you offer before you believe the refusal?`,
            `Have you ever lost out because somebody took your polite no seriously?`
        ],
        upgrade: {
            term: `take no for an answer`,
            type: `idiom`,
            definition: `To accept someone's refusal instead of continuing to push.`,
            ordinary: `“I said no three times and she still kept offering — she simply would not accept my refusal.”`,
            upgraded: `“I said no three times and she still would not take no for an answer.”`,
            priority: 'key',
            atlasPrompt: `Who in your life won't take no for an answer — and is that admirable or exhausting?`
        }
    },
    {
        id: 'cl-digital-tone',
        contextLine: `Digital tone`,
        title: `The Full Stop That Sounds Angry`,
        teaser: `“OK.” and “OK” are not the same message.`,
        context: `Researchers have found that a text message ending in a full stop can read as less sincere than the same message without one, particularly to younger readers, who treat the punctuation as tone. Elsewhere the drift is sharper: among many younger users in China, the standard smiling emoji has come to read as dismissal.`,
        mainQuestion: `Does a full stop change the tone of a message for you — and has anyone ever read something into your punctuation that simply was not there?`,
        followTheThread: [
            `Which is easiest to misread: a message, a voice note, or a face?`,
            `Who do you write to differently — and what changes, exactly?`
        ],
        upgrade: {
            term: `passive-aggressive`,
            type: `adjective`,
            definition: `Showing annoyance or hostility indirectly rather than saying it openly.`,
            ordinary: `“She never said she was annoyed, but the way she wrote it was clearly designed to let me know.”`,
            upgraded: `“She never said she was annoyed, but the reply was completely passive-aggressive.”`,
            priority: 'key',
            atlasPrompt: `What's the most passive-aggressive thing you've seen written down — a note, an email, a sign in a shared kitchen?`
        }
    },
    {
        id: 'cl-invented-sign-language',
        contextLine: `Nicaragua · 1980s`,
        title: `The Language the Children Built`,
        teaser: `The adults taught one thing. The children invented another in the playground.`,
        context: `When deaf children in Nicaragua were brought together in schools for the first time, they were taught to lip-read Spanish, with limited success. In the playground and on the buses they built something else together: a shared sign language that became richer as new groups of children joined. Each new intake of younger children made it richer than the group before.`,
        mainQuestion: `What language exists between you and one other person that nobody else can follow — a nickname, a look, half a phrase? Who would be completely lost listening to the two of you?`,
        followTheThread: [
            `Does a private language bring two people closer, or quietly shut everyone else out?`,
            `Have you been the outsider, watching two people share something you couldn't follow?`
        ],
        upgrade: {
            term: `lost on someone`,
            type: `phrase`,
            definition: `Not understood or appreciated by the person it was meant for.`,
            ordinary: `“I made the joke, but he had no idea what I was talking about and it didn't work at all.”`,
            upgraded: `“I made the joke, but it was completely lost on him.”`,
            priority: 'standard',
            atlasPrompt: `What kind of humour is completely lost on people from outside your country?`
        }
    },
    {
        id: 'cl-flyting',
        contextLine: `Scotland · Flyting`,
        title: `Insults as a Spectator Sport`,
        teaser: `Two poets, a crowd, and a competition to insult each other beautifully.`,
        context: `Flyting was a contest of insults in verse, performed in front of an audience. In the Scottish court around 1500, poets traded elaborate, filthy, inventive abuse — and the abuse was the entertainment. Losing badly was humiliating. Winning meant you had insulted your opponent more beautifully than he had insulted you.`,
        mainQuestion: `Where you live, is insulting your friends a sign of affection or a sign of a problem? And where exactly is the line?`,
        followTheThread: [
            `Who is allowed to insult you, and who absolutely is not?`,
            `Is “I was only joking” a real defence, or the last move of somebody who has gone too far?`
        ],
        upgrade: {
            term: `wind someone up`,
            type: `phrasal verb`,
            definition: `To tease or provoke someone, often for your own amusement.`,
            ordinary: `“Don't take him seriously — he says things like that just to get a reaction out of you.”`,
            upgraded: `“Don't take him seriously — he's just winding you up.”`,
            priority: 'key',
            atlasPrompt: `Who is easiest to wind up in your family, and what always works?`
        }
    },
    {
        id: 'cl-formal-you',
        contextLine: `Formal and informal “you”`,
        title: `When “You” Gets Closer`,
        teaser: `In many languages, becoming close to someone is a moment you can hear.`,
        context: `English has one “you” for a stranger, a boss, a child, and a lover. Many languages have two — one for distance, one for closeness. Moving from one to the other is an actual event, and in some places it is offered out loud, traditionally by the older or more senior person.`,
        mainQuestion: `If closeness had to be formally offered out loud, who should get to offer it — and could you say no?`,
        followTheThread: [
            `Has anyone ever been far too familiar with you, far too quickly? What did they get wrong?`,
            `Would you rather closeness were announced, or allowed to happen quietly?`
        ],
        upgrade: {
            term: `on first-name terms`,
            type: `phrase`,
            definition: `Informal enough with someone to use their first name rather than a title.`,
            ordinary: `“Within a week we had stopped using titles and were just using each other's first names.”`,
            upgraded: `“Within a week we were on first-name terms.”`,
            priority: 'standard',
            atlasPrompt: `Who are you on first-name terms with at work, and who still gets a title? What decides it?`
        }
    },
    {
        id: 'cl-taboo-words',
        contextLine: `Swearing across languages`,
        title: `The Word That Stops a Room`,
        teaser: `The worst word in one language is almost nothing in another.`,
        context: `Every language keeps a few words in reserve, but they are not the same words. Some cultures save the real shock for religion, some for the body, some for your mother. Dutch swearing famously reaches for serious illness. And most learners notice something odd: swearing in a second language comes out far more easily.`,
        mainQuestion: `Does swearing in English feel lighter to you than swearing in your own language? And what kind of word would genuinely stop a room where you're from?`,
        followTheThread: [
            `Have you watched somebody cause real offence with a word they had no idea was serious?`,
            `Is a word offensive because of what it means, or only because everyone agrees it is?`
        ],
        upgrade: {
            term: `have no filter`,
            type: `phrase`,
            definition: `To say whatever you are thinking without stopping to consider whether you should.`,
            ordinary: `“He just says whatever comes into his head, with no thought at all about who's listening.”`,
            upgraded: `“He's got absolutely no filter.”`,
            priority: 'standard',
            atlasPrompt: `Who in your life has no filter — and is it refreshing, or a permanent problem?`
        }
    },
    {
        id: 'cl-imperial-china',
        contextLine: `Imperial China`,
        title: `Saying It Without Saying It`,
        teaser: `A poem about a dead emperor that everyone knew was about the living one.`,
        context: `Officials who could not safely criticise a ruler sometimes did it sideways — a poem, a historical parallel, a story about an emperor four hundred years dead that everyone in the room understood perfectly. The surface stayed innocent. If challenged, the speaker had somewhere to retreat to: I was only telling a story.`,
        mainQuestion: `Is saying it sideways a skill or a cowardice? And have you ever done it — the joke, the story, the “hypothetically speaking”?`,
        followTheThread: [
            `Is indirect criticism kinder than direct criticism, or just much harder to argue with?`,
            `Have you ever received a “general observation” you were certain was aimed at you? What did you do about it?`
        ],
        upgrade: {
            term: `have a dig at someone`,
            type: `phrase`,
            definition: `To make an indirect critical or mocking remark about someone.`,
            ordinary: `“That comment about people who always arrive late was aimed at me, wasn't it?”`,
            upgraded: `“That was a dig at me, wasn't it?”`,
            priority: 'key',
            atlasPrompt: `When did somebody last have a dig at you and pretend they hadn't? How did you handle it?`
        }
    }
];
