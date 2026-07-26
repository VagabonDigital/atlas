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
  Compass active subject · contentVersion 3.1.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'communication-expression',
    schemaVersion: 2,
    contentVersion: '3.1.0',
    title: 'Communication & Expression',
    titleHtml: 'Communication & <em>Expression</em>',
    navTitle: 'Communication',
    bgImage: 'https://photos.smugmug.com/Atlas/i-wbzDCxG/0/KzjqbP37tfjbrH7Nt9rmW6C8j9CFVzZWCmVtjCKfw/O/1ec6f2b7-d3ef-45b5-83ff-67eaa5c9d36c.png'
};

const subjectCopy = {
    cover: {
        hook: `You know what you meant. Other people heard something else.`
    },

    overview: {
        heading: `What People Hear`,
        intro: [
            `Communication is more than choosing the right words. Tone, timing, silence, habit, culture, and the person listening can all change what a message means.`
        ],
        question: `What do people usually understand correctly about the way you communicate — and what do they often get wrong?`
    },

    paths: {
        culturalLensDescription: `Explore languages, customs, and social codes that change how a message is expressed or understood.`,
        discussionDescription: `Messages that go wrong, habits that reveal you, and words that change what happens next.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to reconsider what you express, what other people receive, and what can be repaired.`
    },

    culturalLens: {
        heading: `Different Rules for Saying It`,
        intro: `Words, gestures, punctuation, and politeness do not carry the same meaning everywhere. Step into situations where a message is clear to insiders and completely different to everyone else.`
    },

    discussion: {
        heading: `How We Actually Communicate`
    },

    reflection: {
        title: `What Reached the Other Person?`,
        summary: `Look back at the habits, misunderstandings, performances, and important sentences that shaped the conversation.`,
        questions: [
            `Which of your own communication habits would another person describe differently from you?`,
            `What would you now change when a message really needs to be understood as you intended?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing communication habits, making meaning clear, repairing misunderstandings, and responding when words have consequences.`
    }
};

const discussionSets = [
    {
        id: 'set-you-know-someone-like-this',
        title: `You Know Someone Like This`,
        stage: `React`,
        icon: 'react',
        description: `Messages that create panic, embarrassment, irritation, and stories people keep retelling.`,
        moments: [
            {
                id: 'moment-four-minute-voice-note',
                preview: `Four minutes of audio. One useful sentence.`,
                question: `A friend sends a four-minute voice note just to say they will be ten minutes late. What do you do with it, and what reply would you actually send?`,
                upgrade: {
                    term: `long-winded`,
                    type: `adjective`,
                    definition: `Using far more words than necessary to say something.`,
                    ordinary: `“He takes ten minutes to explain something that could fit into one sentence.”`,
                    upgraded: `“He is incredibly long-winded.”`,
                    priority: 'key',
                    atlasPrompt: `Who becomes long-winded when they get the chance to speak — at work, at home, or in a group chat?`
                }
            },
            {
                id: 'moment-can-we-talk-later',
                preview: `“Can we talk later?” Nothing else.`,
                question: `You receive “Can we talk later?” with no context. What is the first explanation your mind invents?`,
                upgrade: {
                    term: `fear the worst`,
                    type: `phrase`,
                    definition: `To immediately assume that something very bad has happened or will happen.`,
                    ordinary: `“As soon as I read the message, I assumed that something terrible had happened.”`,
                    upgraded: `“As soon as I read the message, I feared the worst.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you last fear the worst and then discover that nothing serious had happened?`
                }
            },
            {
                id: 'moment-wrong-recipient',
                preview: `The message reached exactly the wrong person.`,
                question: `Think of a message that reached the wrong person — yours, someone else’s, or an imagined example. What did the sender mean, and how did the receiver understand it?`,
                upgrade: {
                    term: `cringe`,
                    type: `verb`,
                    definition: `To feel sharp embarrassment about something you or another person did.`,
                    ordinary: `“I still feel horribly embarrassed whenever I remember sending it.”`,
                    upgraded: `“I still cringe whenever I remember sending it.”`,
                    priority: 'key',
                    atlasPrompt: `What do you cringe at now that seemed completely normal to you ten years ago?`
                }
            },
            {
                id: 'moment-small-talk-trap',
                preview: `Twenty floors. One stranger. Your opening line.`,
                question: `Imagine you and your tutor are strangers sharing a lift for twenty floors. Start with one line you would genuinely use. What reply would make you regret starting the conversation?`,
                upgrade: {
                    term: `strike up a conversation`,
                    type: `phrase`,
                    definition: `To begin talking with someone, often a stranger.`,
                    ordinary: `“I started talking to the woman beside me, and we continued chatting for an hour.”`,
                    upgraded: `“I struck up a conversation with the woman beside me, and we continued chatting for an hour.”`,
                    priority: 'standard',
                    atlasPrompt: `Where is it normal to strike up a conversation with a stranger where you live — and where would it feel strange?`
                }
            },
            {
                id: 'moment-the-exaggerator',
                preview: `Same event. A much better story.`,
                question: `Tell one ordinary thing that happened this week. Now make the story slightly more entertaining without changing its basic truth. At what point did it stop being completely accurate?`,
                upgrade: {
                    term: `stretch the truth`,
                    type: `idiom`,
                    definition: `To exaggerate something without inventing it completely.`,
                    ordinary: `“He did not exactly lie, but he made the story sound much more dramatic than it was.”`,
                    upgraded: `“He did not exactly lie, but he stretched the truth.”`,
                    priority: 'standard',
                    atlasPrompt: `Where do people commonly stretch the truth — in stories, job applications, first dates, or sales conversations?`
                }
            }
        ],
        makeItReal: {
            title: `The One Nobody Let You Forget`,
            prompt: `Reconstruct a communication disaster that is funny now — something said, sent, or overheard. Give the exact words if you remember them, then explain the intention, the interpretation, and the moment the mistake became clear.`
        }
    },
    {
        id: 'set-and-what-are-you-like',
        title: `And What Are You Like?`,
        stage: `Explain`,
        icon: 'explain',
        description: `How you refuse, sound when annoyed, express yourself in English, and become recognisably you.`,
        moments: [
            {
                id: 'moment-how-you-say-no',
                preview: `The invitation is real. So is your lack of interest.`,
                question: `A colleague invites you to a birthday dinner on Friday night, and you genuinely do not want to go. Give the answer you would really send. Does your message refuse clearly, or does it leave the answer uncertain?`,
                upgrade: {
                    term: `turn something down`,
                    type: `phrasal verb`,
                    definition: `To refuse an offer, invitation, or opportunity.`,
                    ordinary: `“I refused the invitation politely because I did not want to go.”`,
                    upgraded: `“I turned the invitation down politely because I did not want to go.”`,
                    priority: 'standard',
                    atlasPrompt: `What is hardest to turn down — an invitation, an opportunity, a favour, or food somebody made for you?`
                }
            },
            {
                id: 'moment-when-youre-angry',
                preview: `The words are polite. The voice is not.`,
                question: `Say “That’s fine” as if you are actually annoyed. What changes in your voice — the speed, volume, stress, or something else?`,
                upgrade: {
                    term: `an edge to someone’s voice`,
                    type: `phrase`,
                    definition: `A slight sharpness or tension in the way someone speaks.`,
                    ordinary: `“Her words were polite, but her voice sounded slightly sharp.”`,
                    upgraded: `“Her words were polite, but there was an edge to her voice.”`,
                    priority: 'key',
                    atlasPrompt: `When does an edge enter someone’s voice — tiredness, pressure, irritation, or trying not to argue?`
                }
            },
            {
                id: 'moment-you-in-another-language',
                preview: `The meaning stays the same. The person sounds different.`,
                question: `Choose one short phrase you can say in another language and in English — for example, “Really?”, “No way”, or “I missed you”. Say it both ways. How does your voice or personality change?`,
                upgrade: {
                    term: `get something across`,
                    type: `phrasal verb`,
                    definition: `To succeed in making another person understand an idea, feeling, or impression.`,
                    ordinary: `“In English, I find it difficult to show people what my personality is really like.”`,
                    upgraded: `“In English, I find it difficult to get my personality across.”`,
                    priority: 'key',
                    atlasPrompt: `What idea do you find hardest to get across at work or in an important conversation?`
                }
            },
            {
                id: 'moment-doing-the-impression',
                preview: `The pause. The phrase. The little cough.`,
                question: `Imitate one harmless communication habit of someone you know — a repeated phrase, a pause, a laugh, or the way they begin bad news. What impression does it create, and is that impression fair?`,
                upgrade: {
                    term: `spot on`,
                    type: `phrase`,
                    definition: `Completely accurate or exactly right.`,
                    ordinary: `“Her impression of the manager was completely accurate, including the throat-clearing.”`,
                    upgraded: `“Her impression of the manager was spot on, including the throat-clearing.”`,
                    priority: 'standard',
                    atlasPrompt: `Who does a spot-on impression of someone you know — and does the person being imitated know about it?`
                }
            },
            {
                id: 'moment-what-you-cant-say-yet',
                preview: `You know the meaning. You do not yet have the English.`,
                question: `Think of one idea or feeling that is easy to express in another language but difficult in English. Describe it without using the original word. What English expression comes closest?`,
                upgrade: {
                    term: `put something into words`,
                    type: `phrase`,
                    definition: `To express an idea or feeling clearly through language.`,
                    ordinary: `“I know exactly what I mean, but I cannot explain the feeling clearly.”`,
                    upgraded: `“I know exactly what I mean, but I cannot put the feeling into words.”`,
                    priority: 'standard',
                    atlasPrompt: `What experience or feeling is difficult to put into words in any language?`
                }
            }
        ],
        makeItReal: {
            title: `Your Operating Manual`,
            prompt: `Give your tutor a short operating manual for communicating with you: how to give you bad news, how to disagree with you, and how to recognise when you need time. Then decide together which instruction would be hardest to follow in real life.`
        }
    },
    {
        id: 'set-words-that-did-something',
        title: `Words That Did Something`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The sentences that changed a situation, stayed in memory, repaired damage, or reached the right person.`,
        moments: [
            {
                id: 'moment-words-that-do-things',
                preview: `Before the sentence. After the sentence.`,
                question: `Choose a sentence that changed a situation immediately — “You’re hired”, “It’s over”, “Not guilty”, “I do”, or one from your own life. What was true before it was said, and what became true afterwards?`,
                upgrade: {
                    term: `turning point`,
                    type: `noun`,
                    definition: `A moment when an important situation begins to change in a new direction.`,
                    ordinary: `“That conversation was the moment when everything began to change.”`,
                    upgraded: `“That conversation was a turning point.”`,
                    priority: 'key',
                    atlasPrompt: `What marked a turning point in a project, relationship, career, or period of your life?`
                }
            },
            {
                id: 'moment-line-you-remember',
                preview: `Years later, the exact words remain.`,
                question: `What line can you still remember years later — something kind, cruel, funny, or completely ordinary? Say it if you can, then explain why those words survived when so many others disappeared.`,
                upgrade: {
                    term: `stick with someone`,
                    type: `phrase`,
                    definition: `To remain in someone’s memory or continue affecting them for a long time.`,
                    ordinary: `“Someone said it to me fifteen years ago, and I have never forgotten it.”`,
                    upgraded: `“Someone said it to me fifteen years ago, and it has stuck with me ever since.”`,
                    priority: 'standard',
                    atlasPrompt: `What line from a film, book, song, or conversation has stuck with you?`
                }
            },
            {
                id: 'moment-apology-that-works',
                preview: `“I’m sorry you feel that way.” Repair it.`,
                question: `Take the apology “I’m sorry you feel that way.” Change it into something that might genuinely repair the situation. What must the speaker admit before the apology can work?`,
                upgrade: {
                    term: `own up to something`,
                    type: `phrasal verb`,
                    definition: `To admit that you did something wrong or were responsible for a problem.`,
                    ordinary: `“He admitted immediately that the mistake was his fault.”`,
                    upgraded: `“He owned up to the mistake immediately.”`,
                    priority: 'key',
                    atlasPrompt: `Is it easier to own up to a mistake at work or at home? What makes the difference?`
                }
            },
            {
                id: 'moment-one-sentence-calms-it-down',
                preview: `The disagreement is getting worse. Choose one sentence.`,
                question: `A colleague has changed part of a shared project without asking, and the discussion is getting heated. What one sentence could reduce the tension without pretending that you agree?`,
                upgrade: {
                    term: `defuse`,
                    type: `verb`,
                    definition: `To make a tense or dangerous situation calmer before it becomes worse.`,
                    ordinary: `“Her calm question stopped the disagreement from becoming more serious.”`,
                    upgraded: `“Her calm question defused the disagreement.”`,
                    priority: 'key',
                    atlasPrompt: `What can defuse a tense situation quickly — a question, an apology, humour, or giving people time?`
                }
            },
            {
                id: 'moment-who-you-tell-first',
                preview: `Something happens. One person gets the first call.`,
                question: `You receive news that changes your day — good or bad. Who would you contact first, and why that person? What could you tell them that you would not tell everyone else?`,
                upgrade: {
                    term: `confide in someone`,
                    type: `phrase`,
                    definition: `To tell someone private thoughts or information because you trust them.`,
                    ordinary: `“She is the person I trust enough to tell when something is seriously wrong.”`,
                    upgraded: `“She is the person I confide in when something is seriously wrong.”`,
                    priority: 'standard',
                    atlasPrompt: `Is it easier to confide in an old friend, a family member, or someone who is outside the situation?`
                }
            }
        ],
        makeItReal: {
            title: `Thirty Seconds and a Microphone`,
            prompt: `Your tutor hands you a microphone at a leaving party. Give the thirty-second speech you would actually make for a colleague, friend, or relative. Make it sound like you rather than a formal template, and decide what should remain private.`
        }
    }
];

const clCards = [
    {
        id: 'cl-whistled-language',
        contextLine: `La Gomera · Canary Islands`,
        title: `The Language You Whistle`,
        teaser: `A full conversation, whistled across a valley — and everyone can hear it.`,

        context: `On the island of La Gomera, people use Silbo, a whistled form of Spanish, to communicate across deep ravines where an ordinary voice may not carry. The whistles can travel for several kilometres, and children learn the system at school. Anyone close enough may also hear the message.`,

        mainQuestion: `Everything you whistle can be heard by other people. What would you happily send across a valley — and what would you only ever say in private?`,

        followTheThread: [
            `Would communication become friendlier if people could not whisper behind closed doors, or would life become unbearable?`,
            `Which conversations in your life only work because nobody else can hear them?`
        ],

        upgrade: {
            term: `within earshot`,
            type: `phrase`,
            definition: `Close enough to hear what is being said.`,
            ordinary: `“I said it quietly, but I had not realised she was close enough to hear every word.”`,
            upgraded: `“I said it quietly, but I had not realised she was within earshot.”`,
            priority: 'standard',
            atlasPrompt: `Where do people forget who is within earshot — an office, a lift, a train, or a family kitchen?`
        }
    },

    {
        id: 'cl-how-are-you',
        contextLine: `English small talk`,
        title: `The Question That Might Not Be a Question`,
        teaser: `Sometimes “How are you?” means “hello.” An honest answer changes the plan.`,

        context: `In many English-speaking situations, “How are you?” works more like a greeting than a request for information. The expected answer is often brief, even when the person is having a terrible week. A newcomer who answers fully may discover that the other person was not prepared for the real story.`,

        mainQuestion: `Have you ever answered “How are you?” honestly when the other person expected only “Fine” — or asked it and unexpectedly received the whole story? What happened?`,

        followTheThread: [
            `Is a question friendly when nobody really wants an honest answer?`,
            `What phrase where you live sounds like a real question but usually follows a social script?`
        ],

        upgrade: {
            term: `pleasantries`,
            type: `noun`,
            definition: `Polite, unimportant things people say before the main conversation begins.`,
            ordinary: `“We spent five minutes exchanging polite comments before anyone mentioned the money.”`,
            upgraded: `“We spent five minutes on pleasantries before anyone mentioned the money.”`,
            priority: 'standard',
            atlasPrompt: `Where you are from, how long do pleasantries usually last before business begins — thirty seconds or half an hour?`
        }
    },

    {
        id: 'cl-taarof',
        contextLine: `Iran · ta’arof`,
        title: `The “No” Before Yes`,
        teaser: `Refusing politely can be the first step towards accepting.`,

        context: `In some Iranian social situations, a custom often called ta’arof shapes offers and refusals. A host may offer food several times while the guest refuses before accepting. A taxi driver may initially wave away the fare while expecting the passenger to insist on paying. The first no may not be final.`,

        mainQuestion: `Someone offers you something you genuinely want. Would you accept immediately or refuse politely first? Where did you learn that habit?`,

        followTheThread: [
            `How many times should someone offer before accepting that the answer is really no?`,
            `Have you ever missed an opportunity because somebody believed your polite refusal?`
        ],

        upgrade: {
            term: `take no for an answer`,
            type: `idiom`,
            definition: `To accept someone’s refusal instead of continuing to push.`,
            ordinary: `“I refused three times, but she continued offering and would not accept my answer.”`,
            upgraded: `“I refused three times, but she would not take no for an answer.”`,
            priority: 'key',
            atlasPrompt: `Who in your life will not take no for an answer — and is that admirable or exhausting?`
        }
    },

    {
        id: 'cl-digital-tone',
        contextLine: `Digital tone`,
        title: `The Full Stop That Sounds Angry`,
        teaser: `“OK.” and “OK” may not feel like the same message.`,

        context: `In studies with younger English-speaking readers, a full stop at the end of a short text has sometimes made the message seem less sincere. Digital symbols can change meaning elsewhere too. Among some younger users in China, the standard smiling emoji may suggest distance or irritation rather than warmth.`,

        mainQuestion: `Compare these two replies on screen: “Fine” / “Fine.” Which one feels colder to you, if either? What feeling might you add that the sender never intended?`,

        followTheThread: [
            `Which is easiest to misread: a written message, a voice note, or someone’s face?`,
            `Whose messages do you write most carefully, and what do you change?`
        ],

        upgrade: {
            term: `read too much into something`,
            type: `phrase`,
            definition: `To find a meaning or feeling in something that may not have been intended.`,
            ordinary: `“I thought the full stop sounded annoyed, although she may not have meant it that way.”`,
            upgraded: `“I thought the full stop sounded annoyed, but I may have read too much into it.”`,
            priority: 'key',
            atlasPrompt: `When have you read too much into a short message, delayed reply, emoji, or punctuation mark?`
        }
    },

    {
        id: 'cl-invented-sign-language',
        contextLine: `Nicaragua · 1980s`,
        title: `The Language the Children Built`,
        teaser: `The adults taught one system. The children created another together.`,

        context: `In Nicaragua, deaf children were brought together in schools and taught to lip-read Spanish, with limited success. Outside class, they began sharing gestures and signs with one another. As new groups of younger children joined, they developed the system further until a rich shared sign language had formed.`,

        mainQuestion: `You join the school and understand none of the signs. One child invites you into a game. How could the two of you begin understanding each other without anyone translating?`,

        followTheThread: [
            `Which parts of a language can people learn simply by watching others use it?`,
            `What helps a new person feel included when a group already shares its own way of communicating?`
        ],

        upgrade: {
            term: `pick something up`,
            type: `phrasal verb`,
            definition: `To learn something informally through observation, practice, or experience.`,
            ordinary: `“She learned the signs quickly by watching the other children and using them every day.”`,
            upgraded: `“She picked up the signs quickly by watching the other children and using them every day.”`,
            priority: 'key',
            atlasPrompt: `What skill, expression, or habit did you pick up simply by watching other people?`
        }
    },

    {
        id: 'cl-flyting',
        contextLine: `Scotland · Flyting`,
        title: `Insults as a Spectator Sport`,
        teaser: `Two poets, a crowd, and a competition to insult each other beautifully.`,

        context: `Flyting was a public contest in which poets exchanged insults in verse. At the Scottish court around 1500, performers used elaborate, inventive and often filthy language while an audience watched. The insults were the entertainment, and victory went to the poet who attacked their opponent most skilfully.`,

        mainQuestion: `Two friends compete to insult each other in front of a crowd. What would make one line feel clever and entertaining rather than cruel — the words, the relationship, the audience, or something else?`,

        followTheThread: [
            `Who is allowed to insult you playfully, and who absolutely is not?`,
            `Is “I was only joking” a fair defence, or usually what people say after going too far?`
        ],

        upgrade: {
            term: `wind someone up`,
            type: `phrasal verb`,
            definition: `To tease or provoke someone, often for amusement.`,
            ordinary: `“Do not take him seriously. He says things like that only because he wants a reaction.”`,
            upgraded: `“Do not take him seriously. He is only winding you up.”`,
            priority: 'key',
            atlasPrompt: `Who is easiest to wind up in your family or workplace, and what always gets a reaction?`
        }
    },

    {
        id: 'cl-formal-you',
        contextLine: `Formal and informal “you”`,
        title: `When “You” Gets Closer`,
        teaser: `In many languages, becoming closer is a change you can hear.`,

        context: `Many languages use one form of “you” with strangers, older people, or senior colleagues and another with close friends. Changing to the informal form can mark a new stage in the relationship. In some places, the older or more senior person traditionally suggests making that change.`,

        mainQuestion: `A senior colleague invites you to use the informal form of “you”. Would that make you feel closer, relieved, or uncomfortable? Who should be allowed to suggest the change?`,

        followTheThread: [
            `Has anyone ever spoken to you too familiarly for how well you knew each other?`,
            `Would you rather know the exact moment a relationship becomes informal, or let it happen gradually?`
        ],

        upgrade: {
            term: `drop the formalities`,
            type: `phrase`,
            definition: `To stop using formal ways of speaking or behaving with someone.`,
            ordinary: `“After a few meetings, she suggested that we stop speaking so formally.”`,
            upgraded: `“After a few meetings, she suggested that we drop the formalities.”`,
            priority: 'standard',
            atlasPrompt: `Who normally decides when people can drop the formalities where you live?`
        }
    },

    {
        id: 'cl-taboo-words',
        contextLine: `Swearing across languages`,
        title: `The Word That Stops a Room`,
        teaser: `The worst word in one language may sound almost harmless in another.`,

        context: `Languages do not agree about which words are most offensive. Some taboos centre on religion, others on sex, the body, or someone’s family. Dutch insults have also used the names of serious illnesses. Many learners find that swearing in a second language feels less emotionally powerful than swearing in their first.`,

        mainQuestion: `Does swearing in English feel lighter than swearing in your first language? What kind of word could make everyone in a room suddenly go quiet where you are from?`,

        followTheThread: [
            `Have you seen someone cause real offence with a word they did not realise was serious?`,
            `Is a word offensive because of its literal meaning, or because a community has decided that it is?`
        ],

        upgrade: {
            term: `lose its shock value`,
            type: `phrase`,
            definition: `To become less surprising or offensive because something is heard or seen often.`,
            ordinary: `“Swearing in English felt less powerful after I heard people use it casually every day.”`,
            upgraded: `“Swearing in English lost some of its shock value after I heard people use it casually every day.”`,
            priority: 'standard',
            atlasPrompt: `Which words have lost their shock value where you live — and which could still stop a room?`
        }
    },

    {
        id: 'cl-imperial-china',
        contextLine: `Imperial China`,
        title: `Saying It Without Saying It`,
        teaser: `A story about a dead emperor could criticise the living one.`,

        context: `Direct criticism of a ruler could be dangerous. An official might instead recite a poem about an earlier emperor or tell a historical story whose message was clear to everyone at court. If accused of attacking the current ruler, the speaker could claim that they were only discussing the past.`,

        mainQuestion: `When direct criticism could cost you something, would you use a story or joke to make the point without naming the person? What would that protect you from?`,

        followTheThread: [
            `Is indirect criticism kinder than direct criticism, or simply harder to challenge?`,
            `Have you ever received a “general observation” that was clearly aimed at you? How did you respond?`
        ],

        upgrade: {
            term: `have a dig at someone`,
            type: `phrase`,
            definition: `To make an indirect critical or mocking remark about someone.`,
            ordinary: `“He made that comment about people who are always late because he wanted to criticise me indirectly.”`,
            upgraded: `“He had a dig at me with that comment about people who are always late.”`,
            priority: 'key',
            atlasPrompt: `When did somebody last have a dig at you and pretend that they had not? How did you handle it?`
        }
    }
];
