/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Using Modal Verbs in Real Situations
  ---------------------------------------------------------------------------
  A practical A2 language-teaching subject for using modal verbs in everyday
  requests, advice, permission, ability, possibility, and rules. Built for
  tutor-led grammar practice, spoken contrasts, role-play, and clearer
  everyday English.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: 'modal-verbs-real-situations',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Using Modal Verbs in Real Situations',
    titleHtml: 'Using Modal Verbs in <em>Real Situations</em>',
    navTitle: 'Modal Verbs',
    bgImage: 'https://w0.peakpx.com/wallpaper/1/806/HD-wallpaper-multi-colored-chalk-chalk-pencils-choice-of-color-concepts-chalk-different-colors-of-chalk.jpg'
};

const subjectCopy = {
    cover: {
        hook: `Small words, different meanings`
    },
    overview: {
        heading: `What Do You Mean?`,
        intro: [
            `The same request can sound friendly, strong, or unsure when you change one small word. You will look at simple situations like asking for help, giving advice, and talking about what people can or must do.`
        ],
        question: `When you need help, how do you usually ask?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore everyday choices about asking, advising, allowing, and saying what people can or must do.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `Explore how everyday rules, relationships, and social expectations can change the meaning and tone of modal verbs.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Connect the ideas from this subject to the way you speak and the choices you make in real situations.`
    },
    culturalLens: {
        heading: `How Strong Does It Sound?`,
        intro: `People in different places and situations may choose different words to ask, advise, allow, or say what is necessary. Compare how modal verbs show politeness, confidence, choice, and strength in everyday communication.`
    },
    discussion: {
        heading: `Words That Change the Message`,
        intro: `Talk about how you ask for help, give advice, and respond to rules in everyday life. Notice how your choice of words can show ability, possibility, permission, advice, or strong obligation.`
    },
    reflection: {
        title: `One Small Word, A New Message`,
        summary: `A small change in a modal verb can make your meaning sound softer, stronger, more polite, or more certain. Reflection helps you notice how your word choice affects other people and your own message.`,
        questions: [
            `After exploring these examples, when might a softer word be better than a stronger one—and when is a clear, strong word more helpful?`,
            `What is one real situation where you would now choose a different modal verb to sound clearer, kinder, or more appropriate?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: 'set-everyday-modal-choices',
        title: `Everyday Modal Choices`,
        stage: 'First Look',
        icon: 'first-look',
        description: `Use simple modal verbs to talk about help, advice, permission, ability, and rules.`,
        moments: [
            {
                id: 'moment-asking-for-help-politely',
                preview: `Asking for help politely`,
                question: `“Can you help me?” is direct, while “Could you help me?” sounds a little more polite. Which would you use, and when?`,
                upgrade: {
                    term: `Could you possibly...`,
                    type: 'phrase',
                    definition: `A very polite way to ask someone to do something.`,
                    ordinary: `Can you send me the file today?`,
                    upgraded: `Could you possibly send me the file today?`,
                    priority: 'key',
                    atlasPrompt: `You need a colleague to check your work. How could you ask politely using “Could you possibly...?”`
                }
            },
            {
                id: 'moment-giving-friendly-advice',
                preview: `Giving friendly advice`,
                question: `“You should rest” gives advice, while “You could rest” sounds softer. What advice might you give to a tired friend?`,
                upgrade: {
                    term: `You might want to...`,
                    type: 'phrase',
                    definition: `A gentle way to give advice or suggest an idea.`,
                    ordinary: `I think you should take a short break.`,
                    upgraded: `You might want to take a short break.`,
                    priority: 'key',
                    atlasPrompt: `Your friend is nervous before a job interview. What might you want to suggest?`
                }
            },
            {
                id: 'moment-talking-about-rules',
                preview: `Talking about rules`,
                question: `“You must wear a seat belt” is a strong rule, while “You should wear a seat belt” sounds like advice. Where do you hear rules like these?`,
                upgrade: {
                    term: `have to`,
                    type: 'phrase',
                    definition: `Use this to say that a rule or situation makes something necessary.`,
                    ordinary: `The school says that students must wear a uniform.`,
                    upgraded: `Students have to wear a uniform at this school.`,
                    priority: 'key',
                    atlasPrompt: `What do you have to do before you start work or school?`
                }
            },
            {
                id: 'moment-possibility-daily-life',
                preview: `Possibility in daily life`,
                question: `“It may rain” and “It might rain” both show possibility. What might happen in your day today?`,
                upgrade: {
                    term: `likely`,
                    type: 'adjective',
                    definition: `Probably going to happen or be true.`,
                    ordinary: `Maybe I’ll be late for work tomorrow.`,
                    upgraded: `I’m likely to be late for work tomorrow.`,
                    priority: 'standard',
                    atlasPrompt: `What is likely to happen at your home this week?`
                }
            },
            {
                id: 'moment-talking-about-ability',
                preview: `Talking about ability`,
                question: `“I can swim” shows ability, while “I can’t swim” shows no ability. What can you do well, and what can’t you do?`,
                upgrade: {
                    term: `be able to`,
                    type: 'phrase',
                    definition: `to have the skill or chance to do something`,
                    ordinary: `I can use a computer well.`,
                    upgraded: `I’m able to use a computer well.`,
                    priority: 'key',
                    atlasPrompt: `What is one thing you are able to do now that was difficult before?`
                }
            }
        ],
        makeItReal: {
            title: `Change the Tone`,
            prompt: `With your tutor, act out three short everyday situations: ask for help, give advice, and talk about a rule. Say each sentence twice, changing the modal to make it more polite, softer, or stronger.`
        }
    },
    {
        id: 'set-choosing-right-modal',
        title: `Choosing the Right Modal`,
        stage: 'Closer Look',
        icon: 'closer-look',
        description: `Compare modal verbs in everyday choices and notice how they change meaning, strength, and politeness.`,
        moments: [
            {
                id: 'moment-request-too-strong',
                preview: `A request that sounds too strong`,
                question: `“Can you send me the file?” is normal, while “You must send me the file” sounds like an order. Which would you use with a colleague, and why?`,
                upgrade: {
                    term: `Would you mind...`,
                    type: 'phrase',
                    definition: `A polite way to ask someone to do something.`,
                    ordinary: `Please send me the file when you can.`,
                    upgraded: `Would you mind sending me the file?`,
                    priority: 'key',
                    atlasPrompt: `You need a friend to close the window. How could you ask politely using this phrase?`
                },
                followUp: {
                    id: 'same-request-close-friend',
                    kind: 'another-angle',
                    prompt: `How would you ask for the same file if you were speaking to a close friend instead of a colleague?`
                }
            },
            {
                id: 'moment-advice-or-warning',
                preview: `Advice or a firm warning`,
                question: `“You should see a doctor” gives advice, while “You must see a doctor” sounds urgent. Which would you say to a friend with a serious problem?`,
                upgrade: {
                    term: `You’d better...`,
                    type: 'phrase',
                    definition: `Use this to give strong advice or a warning. It suggests there may be a problem if the person does not do it.`,
                    ordinary: `I think you should take an umbrella because it may rain.`,
                    upgraded: `You’d better take an umbrella because it may rain.`,
                    priority: 'key',
                    atlasPrompt: `Your friend is about to miss an important train. What would you say using “You’d better...”?`
                }
            },
            {
                id: 'moment-permission-work-home',
                preview: `Permission at work or home`,
                question: `“Can I leave early?” asks for permission, while “May I leave early?” sounds more formal. Which would you use with your manager or teacher?`,
                upgrade: {
                    term: `Would it be okay if...`,
                    type: 'phrase',
                    definition: `A polite way to ask if you have permission to do something.`,
                    ordinary: `Can I use your computer for a few minutes?`,
                    upgraded: `Would it be okay if I used your computer for a few minutes?`,
                    priority: 'key',
                    atlasPrompt: `You want to open a window in someone else’s room. What could you say politely?`
                }
            },
            {
                id: 'moment-rule-or-possible-choice',
                preview: `A rule or a possible choice`,
                question: `“You must book a ticket” means it is necessary, while “You might book a ticket” means it is only possible. In what situation would each sentence make sense?`,
                upgrade: {
                    term: `be allowed to`,
                    type: 'phrase',
                    definition: `to have permission to do something according to a rule or another person`,
                    ordinary: `The rules say visitors can take photos here.`,
                    upgraded: `Visitors are allowed to take photos here.`,
                    priority: 'key',
                    atlasPrompt: `What are people allowed to do during breaks at your workplace or school?`
                }
            },
            {
                id: 'moment-different-chances-rain',
                preview: `Different chances of rain`,
                question: `“It may rain” and “It might rain” both show possibility and are often very close in meaning. Which one would you use to talk about tomorrow’s weather?`,
                upgrade: {
                    term: `could`,
                    type: 'verb',
                    definition: `Use “could” to say that something is possible, without saying that it will happen.`,
                    ordinary: `Maybe the bus will be late.`,
                    upgraded: `The bus could be late because of the traffic.`,
                    priority: 'key',
                    atlasPrompt: `What could happen if you forget something important at home?`
                }
            }
        ],
        makeItReal: {
            title: `Make the Call`,
            prompt: `Your tutor gives you three everyday situations. For each one, decide what is needed—permission, advice, a rule, or a possibility—and say one sentence with the best modal verb.`
        }
    },
    {
        id: 'set-power-of-small-words',
        title: `The Power of Small Words`,
        stage: 'Wider View',
        icon: 'wider-view',
        description: `Explore how modal verbs can show power, politeness, fairness, and different ideas about rules in everyday life.`,
        moments: [
            {
                id: 'moment-polite-words-respect',
                preview: `Polite words and equal respect`,
                question: `“Could you help?” can sound more respectful than “Help me.” Do polite modal verbs matter when people speak to strangers or workers?`,
                upgrade: {
                    term: `May I...?`,
                    type: 'phrase',
                    definition: `A polite way to ask for permission, especially in formal situations.`,
                    ordinary: `Can I leave work a little early today?`,
                    upgraded: `May I leave work a little early today?`,
                    priority: 'standard',
                    atlasPrompt: `You are visiting a friend’s home. What is one thing you might politely ask permission to do?`
                }
            },
            {
                id: 'moment-rules-different-places',
                preview: `Rules in different places`,
                question: `A rule may use “must” in one place and “should” in another. How can these words change the way people understand the rule?`,
                upgrade: {
                    term: `be expected to`,
                    type: 'phrase',
                    definition: `to be asked or supposed to do something, often as a normal rule or responsibility`,
                    ordinary: `Students should arrive on time for the morning class.`,
                    upgraded: `Students are expected to arrive on time for the morning class.`,
                    priority: 'key',
                    atlasPrompt: `What are visitors expected to do when they enter your home?`
                }
            },
            {
                id: 'moment-power-at-work',
                preview: `Power at work`,
                question: `“You must finish this today” sounds stronger than “You should finish this today.” How should a manager speak when a task is truly urgent?`,
                upgrade: {
                    term: `need to`,
                    type: 'phrase',
                    definition: `Use “need to” to say that something is necessary, often in a clear but less forceful way than “must.”`,
                    ordinary: `The manager should explain that the task is urgent.`,
                    upgraded: `The manager needs to make it clear that the task is urgent.`,
                    priority: 'key',
                    atlasPrompt: `What does a student need to do before an important exam?`
                }
            },
            {
                id: 'moment-translation-changes-tone',
                preview: `When translation changes the tone`,
                question: `A sentence with “can,” “could,” or “should” may sound different in another language. Have you ever translated a request or rule and worried about its tone?`,
                upgrade: {
                    term: `soften`,
                    type: 'verb',
                    definition: `To make something less strong, direct, or severe.`,
                    ordinary: `I changed the sentence to make the request sound less direct.`,
                    upgraded: `I softened the request by changing the modal verb.`,
                    priority: 'key',
                    atlasPrompt: `How could you soften a message to a coworker?`
                }
            },
            {
                id: 'moment-clear-rules-real-choices',
                preview: `Clear rules and real choices`,
                question: `“You must wear a helmet” gives a clear obligation, while “You should wear a helmet” leaves more choice. When is it important to make a rule completely clear?`,
                upgrade: {
                    term: `leave it up to someone`,
                    type: 'phrase',
                    definition: `to let someone decide what to do instead of deciding for them`,
                    ordinary: `The school should let students decide how to complete the project.`,
                    upgraded: `The school should leave it up to students to decide how to complete the project.`,
                    priority: 'key',
                    atlasPrompt: `When should a manager leave it up to employees to choose how they do a task?`
                }
            }
        ],
        makeItReal: {
            title: `Build a Better Rule`,
            prompt: `Choose one everyday situation and make one clear rule for it. Say the rule with “must” or “should,” then explain why you chose that word.`
        }
    }
];

const clCards = [
    {
        id: 'cl-rules-on-the-wall',
        contextLine: `Museums and public places`,
        title: `Rules on the Wall`,
        teaser: `A small word can make a rule sound strict, polite, or open.`,
        context: `In many museums and public places, signs use “must” for a strong rule: “Visitors must not touch the art.” They use “may” for permission: “Visitors may take photos.” In everyday conversation, people often use “can” or “could” instead: “Can I take a photo?” or “Could I sit here?”`,
        mainQuestion: `Which sounds more friendly: “Can I take a photo?” or “May I take a photo?” Why?`,
        followTheThread: [
            `Where do you see or hear strong rules in your daily life?`,
            `How would you ask politely if a rule is not clear?`
        ],
        upgrade: {
            term: `be supposed to`,
            type: 'phrase',
            definition: `This describes what a rule or expectation says someone should do or should not do. It often sounds less strong than “must.”`,
            ordinary: `The sign says visitors must not touch the art.`,
            upgraded: `Visitors aren’t supposed to touch the art.`,
            priority: 'key',
            atlasPrompt: `What are you supposed to do when you visit someone’s home?`
        }
    },
    {
        id: 'cl-softer-request',
        contextLine: `English-speaking workplaces and cafés`,
        title: `The Softer Request`,
        teaser: `“Can you help me?” and “Could you help me?” ask for the same thing, but they do not sound exactly the same.`,
        context: `In many English-speaking workplaces and cafés, people often use “could” or “would” to make a request sound softer. “Can you help me?” is normal and friendly, while “Could you help me?” can sound more careful or polite. The situation and your voice also change the meaning.`,
        mainQuestion: `When would you say “Can you help me?” and when would you say “Could you help me?”`,
        followTheThread: [
            `What words can you use to ask a stranger for help politely?`,
            `How does your voice change the feeling of a request?`
        ],
        upgrade: {
            term: `I was wondering if...`,
            type: 'phrase',
            definition: `A polite way to ask for something or ask if something is possible.`,
            ordinary: `Can you change my appointment to Friday?`,
            upgraded: `I was wondering if you could change my appointment to Friday.`,
            priority: 'key',
            atlasPrompt: `You need to ask a neighbour to turn the music down. How could you use this phrase?`
        }
    },
    {
        id: 'cl-tea-help-permission',
        contextLine: `British homes and workplaces`,
        title: `Tea, Help, or Permission?`,
        teaser: `“Would you like…?” can offer kindness, while “Can I…?” asks for something.`,
        context: `In Britain, offering someone tea is a common way to welcome a guest or start a conversation at work. “Would you like some tea?” is an offer, not a question about ability. The guest might answer, “Yes, please,” or “No, thanks.”`,
        mainQuestion: `Which sounds more friendly to you: “Would you like some tea?” or “Do you want some tea?” Why?`,
        followTheThread: [
            `How would you offer a drink to a guest in your home?`,
            `What would you say if you wanted the other person to choose freely?`
        ],
        upgrade: {
            term: `Would you like...?`,
            type: 'phrase',
            definition: `A polite way to offer something or ask what someone wants.`,
            ordinary: `Do you want a drink?`,
            upgraded: `Would you like a drink?`,
            priority: 'key',
            atlasPrompt: `You are offering a visitor something to eat. What would you say?`
        }
    },
    {
        id: 'cl-advice-or-order',
        contextLine: `English-speaking doctors’ offices`,
        title: `Advice or Order?`,
        teaser: `A doctor’s modal verb can make advice sound gentle, serious, or urgent.`,
        context: `In a clinic, “You should rest” sounds like advice. “You need to rest” sounds stronger, while “You must rest” sounds like a very serious rule or order. “You may feel tired” talks about possibility, not permission.`,
        mainQuestion: `When a health professional speaks to you, would you prefer gentle advice or strong instructions? Why?`,
        followTheThread: [
            `How would the meaning change if the doctor said “You could rest” instead of “You should rest”?`,
            `In what other situation can the difference between “should,” “need to,” and “must” be important?`
        ],
        upgrade: {
            term: `come across as`,
            type: 'phrase',
            definition: `to seem or sound a particular way to other people`,
            ordinary: `Using “must” can seem like an order.`,
            upgraded: `Using “must” can come across as an order.`,
            priority: 'key',
            atlasPrompt: `What can make a request come across as rude, even when the words are polite?`
        }
    },
    {
        id: 'cl-no-need-or-not-allowed',
        contextLine: `Signs and instructions in English-speaking places`,
        title: `No Need or Not Allowed?`,
        teaser: `“You don’t have to” and “You mustn’t” sound similar, but they give very different messages.`,
        context: `“You don’t have to pay” means payment is not necessary, but you may still pay. “You mustn’t pay” means paying is not allowed. In places such as libraries, parks, or public events, this small difference can change what people do.`,
        mainQuestion: `Why is it important to understand the difference between “you don’t have to” and “you mustn’t”?`,
        followTheThread: [
            `Can you think of a real situation where someone might misunderstand these two phrases?`,
            `What is a clear and polite way to tell visitors about an important rule?`
        ],
        upgrade: {
            term: `forbidden`,
            type: 'adjective',
            definition: `Not allowed by a rule or law.`,
            ordinary: `You mustn’t leave your bike here.`,
            upgraded: `Leaving your bike here is forbidden.`,
            priority: 'key',
            atlasPrompt: `What is forbidden at your school, workplace, or in a public place?`
        }
    },
    {
        id: 'cl-shall-we',
        contextLine: `British conversations and meetings`,
        title: `“Shall We?”`,
        teaser: `One small modal can turn a plan into a friendly suggestion.`,
        context: `In Britain, people sometimes say “Shall we start?” or “Shall we go?” when they want to suggest an action for everyone. “Shall we?” often sounds friendly and includes the other person. “Should we?” is also common, but it can sound more like asking for advice or checking the best choice.`,
        mainQuestion: `Which sounds more natural for suggesting a plan: “Shall we leave now?” or “Should we leave now?” and why?`,
        followTheThread: [
            `How would you make the same suggestion in your language?`,
            `Would “Shall we?” sound natural in a work meeting, with friends, or both?`
        ],
        upgrade: {
            term: `Why don’t we...?`,
            type: 'phrase',
            definition: `A friendly way to suggest doing something together.`,
            ordinary: `Let’s take a short break before the next activity.`,
            upgraded: `Why don’t we take a short break before the next activity?`,
            priority: 'key',
            atlasPrompt: `You and a friend cannot decide what to eat. What could you suggest using “Why don’t we...?”`
        }
    }
];
