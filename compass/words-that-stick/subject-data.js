/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Words That Stick: Advanced Vocabulary Through Roots & Stories
  ---------------------------------------------------------------------------
  A C1+ vocabulary subject built around precise meaning, etymology, word
  families, memorable associations, retrieval and natural productive use.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `words-that-stick`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `Words That Stick: Advanced Vocabulary Through Roots & Stories`,
    titleHtml: `Words That Stick: <em>Advanced Vocabulary Through Roots & Stories</em>`,
    navTitle: `Words That Stick`,
    bgImage: `https://www.piqosity.com/wp-content/uploads/2022/02/Depositphotos_169103504_L-1024x612.jpg`
};

const subjectCopy = {
    cover: {
        hook: `Make difficult words memorable—and make them yours.`
    },
    overview: {
        heading: `A Better Word for That`,
        intro: [
            `Designed for C1+ learners, this subject builds advanced vocabulary through precise contrasts, word roots, memorable stories and deliberate retrieval. Instead of memorising definitions in isolation, you will connect new words to images, origins and related forms, then use them naturally in real conversations.`
        ],
        question: `When you want to express an idea clearly, do you usually choose a familiar word or try to find a more precise one?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore how precise vocabulary shapes meaning, tone and confidence in real conversations.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `See how language history and cultural context can change the meaning, feeling and usefulness of powerful English words.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Carry the subject into real life by reflecting on how more precise words could change the way you communicate and understand the world.`
    },
    culturalLens: {
        heading: `How Meaning Travels`,
        intro: `Explore how ambitious English words carry traces of other languages, periods and communities. Compare how meanings, connotations and levels of formality can change as words move between places and social settings.`
    },
    discussion: {
        heading: `From Almost Right to Exactly Right`,
        intro: `Explore how word choice can change the meaning, tone and effect of what you say. A simple memory routine runs through the lesson: notice the precise meaning, attach a root, story or vivid image, retrieve the word without looking, then use it in context. The goal is not to sound impressive—it is to make difficult vocabulary easier to remember and more precise when you actually need it.`
    },
    reflection: {
        title: `Make the Words Yours`,
        summary: `Advanced vocabulary becomes useful when you can retrieve it at the right moment, understand its connotations and choose it precisely. Reflect on which roots, stories, contrasts or mnemonic images made words stick, and how you could reuse those techniques when learning vocabulary independently.`,
        questions: [
            `Which word from this subject became easier to remember because of a root, story, contrast or mnemonic image, and what exactly made the connection work?`,
            `When you meet a difficult new word in the future, which memory technique from this lesson would you try first, and how would you make sure you can actually retrieve and use the word later?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-words-that-fit`,
        title: `Words That Fit`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Try memorable words for familiar situations and notice how small differences in meaning can change what you communicate.`,
        moments: [
            {
                id: `moment-bouncing-back-after-setbacks`,
                preview: `Bouncing back after setbacks`,
                question: `Resilient comes from Latin resilire, meaning “to spring back.” Build a quick mnemonic by picturing a rubber ball snapping back into shape after being crushed. Now think of a person, team or project that recovered after a problem: what made it resilient, and when have you shown resilience?`,
                upgrade: {
                    term: `weather the storm`,
                    type: `idiom`,
                    definition: `To survive and manage a very difficult period until conditions improve.`,
                    ordinary: `The small business survived several months of falling sales and rising costs.`,
                    upgraded: `The small business weathered the storm and eventually returned to profit.`,
                    priority: `key`,
                    atlasPrompt: `What personal or professional challenge could someone weather the storm through, and what would help them do it?`
                }
            },
            {
                id: `moment-two-feelings-at-once`,
                preview: `Two feelings at once`,
                question: `Ambivalent means having two opposing feelings at the same time. Use the root ambi-, meaning “both,” as a memory hook—just as ambidextrous means able to use both hands. When have you felt ambivalent about a decision, opportunity or change, and what were the two feelings?`,
                upgrade: {
                    term: `be of two minds`,
                    type: `idiom`,
                    definition: `To have two conflicting opinions or feelings about something.`,
                    ordinary: `I wanted to accept the offer, but I also wanted to stay where I was, so I couldn’t decide.`,
                    upgraded: `I was of two minds about accepting the offer: excited by the opportunity but worried about the changes it would bring.`,
                    priority: `key`,
                    atlasPrompt: `When might you be of two minds about buying something expensive?`
                },
                followUp: {
                    id: `ambivalent-or-ambiguous`,
                    kind: `another-angle`,
                    prompt: `Now separate ambivalent from ambiguous. Describe one situation that is ambivalent because you have mixed feelings, and another that is ambiguous because its meaning is unclear.`
                }
            },
            {
                id: `moment-careful-with-every-detail`,
                preview: `Careful with every detail`,
                question: `Meticulous means extremely careful and precise, while fussy often suggests unnecessary attention to small details. When is meticulous work valuable, and when can it become fussy?`,
                upgrade: {
                    term: `strike a balance`,
                    type: `collocation`,
                    definition: `To find a sensible middle point between two different needs or qualities.`,
                    ordinary: `Good design requires being careful while still keeping things simple.`,
                    upgraded: `Good design requires striking a balance between careful detail and simplicity.`,
                    priority: `key`,
                    atlasPrompt: `How might you strike a balance between work and personal life during a busy week?`
                }
            },
            {
                id: `moment-a-lucky-discovery`,
                preview: `A lucky discovery`,
                question: `Serendipity means finding something useful or pleasant by chance; the word was inspired by a story about unexpected discoveries. Treat the story itself as a mnemonic: a surprising discovery becomes the cue for the word. What fortunate discovery have you made unexpectedly, and what happened?`,
                upgrade: {
                    term: `stumble upon`,
                    type: `phrasal verb`,
                    definition: `to find or discover something unexpectedly, often by chance`,
                    ordinary: `I found an interesting article while looking for something else.`,
                    upgraded: `I stumbled upon an interesting article while looking for something else.`,
                    priority: `key`,
                    atlasPrompt: `Have you ever stumbled upon a useful solution while trying to solve a different problem?`
                }
            },
            {
                id: `moment-more-than-simply-honest`,
                preview: `More than simply honest`,
                question: `Candid means open and direct, especially when expressing an honest opinion. When is candid communication helpful, and when might you choose a gentler way to say the same thing?`,
                upgrade: {
                    term: `soften the blow`,
                    type: `idiom`,
                    definition: `To make unpleasant news or criticism feel less shocking or upsetting.`,
                    ordinary: `I tried to make the criticism easier for her to accept.`,
                    upgraded: `I tried to soften the blow by starting with something positive.`,
                    priority: `key`,
                    atlasPrompt: `How might you soften the blow when telling a friend that their plans will not work?`
                }
            }
        ],
        makeItReal: {
            title: `Make One Word Stick`,
            prompt: `Choose one word from this set and build a mnemonic for it: connect the meaning to a root, sound, story or vivid image; make the connection exaggerated enough to remember; then hide the word and retrieve it without looking. Finally, use it naturally in a real sentence.`
        }
    },
    {
        id: `set-choice-behind-word`,
        title: `The Choice Behind the Word`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Examine how precise vocabulary reveals motives, patterns and tensions in everyday choices and conversations.`,
        moments: [
            {
                id: `moment-a-reason-hidden-underneath`,
                preview: `A reason hidden underneath`,
                question: `The word rationale comes from a root connected with reason, while pretext means a stated reason that hides the real one. When have you suspected that someone’s explanation was only a pretext, and what seemed to be the real rationale?`,
                upgrade: {
                    term: `underlying motive`,
                    type: `collocation`,
                    definition: `The real reason or intention behind someone’s words or actions, especially one they do not openly state.`,
                    ordinary: `I wondered what was really driving her decision to offer help.`,
                    upgraded: `I wondered whether her underlying motive was to gain influence rather than simply to help.`,
                    priority: `key`,
                    atlasPrompt: `When might you question someone’s underlying motive in a workplace, friendship, or business situation?`
                }
            },
            {
                id: `moment-a-change-that-happens-gradually`,
                preview: `A change that happens gradually`,
                question: `To evolve suggests gradual development, while to transform suggests a more dramatic change. Think of a habit, relationship or workplace that has changed: has it evolved or transformed, and what makes you choose that word?`,
                upgrade: {
                    term: `gain momentum`,
                    type: `collocation`,
                    definition: `To develop more quickly and strongly as time passes, often because it receives more energy or support.`,
                    ordinary: `The project started slowly, but it became more successful over time.`,
                    upgraded: `The project started slowly, but it gradually gained momentum once more people supported it.`,
                    priority: `key`,
                    atlasPrompt: `Can you describe a personal goal or plan that gained momentum after a slow start?`
                }
            },
            {
                id: `moment-confidence-or-empty-show`,
                preview: `Confidence or empty show`,
                question: `The word ostentatious describes something designed to attract admiration, while understated suggests quiet confidence without display. When can showing success seem ostentatious, and when does a more understated style work better?`,
                upgrade: {
                    term: `come across as`,
                    type: `phrasal verb`,
                    definition: `To seem to other people in a particular way, whether or not you intend to.`,
                    ordinary: `Although she wants to look successful, her designer clothes can seem arrogant.`,
                    upgraded: `Although she wants to look successful, her designer clothes can come across as ostentatious.`,
                    priority: `key`,
                    atlasPrompt: `How can someone’s tone of voice come across as unfriendly even when they do not mean it that way?`
                }
            },
            {
                id: `moment-a-pattern-worth-noticing`,
                preview: `A pattern worth noticing`,
                question: `Ubiquitous means present almost everywhere; it comes from Latin ubique, meaning “everywhere.” To make it stick, picture the same object appearing absurdly in every place you look. What trend or product is prevalent or nearly ubiquitous in your life, and how has it affected your choices?`,
                upgrade: {
                    term: `pervasive`,
                    type: `adjective`,
                    definition: `Present and influential in many parts of life, often in a way that is difficult to avoid or notice fully.`,
                    ordinary: `Online advertising has a strong influence on the products I consider buying.`,
                    upgraded: `Online advertising has a pervasive influence on the products I consider buying, even when I am not consciously paying attention to it.`,
                    priority: `key`,
                    atlasPrompt: `What influence is pervasive in your workplace or community, and how does it shape people’s behaviour?`
                },
                followUp: {
                    id: `prevalent-pervasive-ubiquitous`,
                    kind: `go-deeper`,
                    prompt: `Rank prevalent, pervasive and ubiquitous from the weakest to the strongest sense of spread, then use each one to describe something in modern life.`
                }
            },
            {
                id: `moment-a-disagreement-that-reveals-priorities`,
                preview: `A disagreement that reveals priorities`,
                question: `A compromise means that each side gives up something, while a concession is something one side gives up, often to reach agreement. Describe a disagreement where someone made a concession or both sides compromised: what did the final choice reveal about their priorities?`,
                upgrade: {
                    term: `draw the line`,
                    type: `idiom`,
                    definition: `To set a limit on what you are willing to accept or agree to.`,
                    ordinary: `The team agreed to make some changes, but they refused to accept the proposal’s most expensive demand.`,
                    upgraded: `The team was willing to compromise, but they drew the line at accepting the proposal’s most expensive demand.`,
                    priority: `key`,
                    atlasPrompt: `When have you drawn the line in a workplace, family, or financial decision, and what did that limit reveal about your priorities?`
                }
            }
        ],
        makeItReal: {
            label: `Make It Real`,
            title: `The Precise Version of Your Choice`,
            prompt: `Choose a real decision you made recently and retell it in a short, precise account. Use at least two words from today’s set—such as rationale, pretext, evolved, transformed, ostentatious, understated, prevalent, concession or compromise—and explain why each word fits.`
        }
    },
    {
        id: `set-words-that-shape-worlds`,
        title: `Words That Shape Worlds`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Explore how powerful word choices influence public debates, shared values and the way people understand change.`,
        moments: [
            {
                id: `moment-a-promise-for-the-future`,
                preview: `A promise for the future`,
                question: `Utopia describes an imagined perfect society, from Greek roots meaning “no place,” while dystopia describes an imagined deeply troubled society. When do visions of a better future inspire useful action, and when might they become unrealistic or dangerous?`,
                upgrade: {
                    term: `wishful thinking`,
                    type: `phrase`,
                    definition: `Believing that something will happen or work simply because you want it to, without enough evidence or planning.`,
                    ordinary: `A plan can sound inspiring but still fail if it is based only on hope.`,
                    upgraded: `A vision can inspire people, but without practical steps it may turn into wishful thinking.`,
                    priority: `key`,
                    atlasPrompt: `When might wishful thinking affect someone’s career, financial, or personal decisions?`
                }
            },
            {
                id: `moment-a-familiar-idea-challenged`,
                preview: `A familiar idea challenged`,
                question: `Paradigm means a widely accepted model or way of thinking; a paradigm shift is a major change in that model. What belief or approach in work, education or society has experienced a paradigm shift, and what caused people to rethink it?`,
                upgrade: {
                    term: `challenge the status quo`,
                    type: `collocation`,
                    definition: `To question and try to change the way things are usually done.`,
                    ordinary: `The new manager questioned the usual way of organising the team.`,
                    upgraded: `The new manager challenged the status quo by introducing flexible working hours.`,
                    priority: `key`,
                    atlasPrompt: `What change in your daily life or workplace could challenge the status quo in a positive way?`
                }
            },
            {
                id: `moment-the-price-of-convenience`,
                preview: `The price of convenience`,
                question: `The word paradox describes a situation that seems contradictory but may contain an important truth. What modern convenience creates a paradox by solving one problem while creating another?`,
                upgrade: {
                    term: `trade-off`,
                    type: `noun`,
                    definition: `A situation where you gain one benefit but have to accept a disadvantage in return.`,
                    ordinary: `Online shopping saves time, but it can lead to more packaging waste.`,
                    upgraded: `Online shopping involves a trade-off: it saves time, but it can lead to more packaging waste.`,
                    priority: `key`,
                    atlasPrompt: `What trade-off do people face when they choose to work from home?`
                }
            },
            {
                id: `moment-a-story-that-controls-attention`,
                preview: `A story that controls attention`,
                question: `A narrative is more than a story: it is a way of organising events and giving them meaning. Compare two different narratives about the same social or political issue: how do they influence what people notice and believe?`,
                upgrade: {
                    term: `frame the debate`,
                    type: `collocation`,
                    definition: `To present an issue in a particular way so that people focus on some aspects and not others.`,
                    ordinary: `The newspaper presented the housing problem as mainly a question of personal responsibility.`,
                    upgraded: `The newspaper framed the housing debate as mainly a question of personal responsibility.`,
                    priority: `key`,
                    atlasPrompt: `How might a company frame a discussion about introducing artificial intelligence at work?`
                }
            },
            {
                id: `moment-language-that-quietly-excludes`,
                preview: `Language that quietly excludes`,
                question: `The adjective insidious describes something harmful that develops gradually and is difficult to notice; its Latin root suggests something that creeps in. What idea, habit or form of communication can be insidious in a community, workplace or online space, and how can people recognise it?`,
                upgrade: {
                    term: `normalise`,
                    type: `verb`,
                    definition: `to make something harmful or unacceptable seem ordinary or acceptable, often gradually`,
                    ordinary: `When people repeatedly use insulting jokes, others may start to see them as acceptable.`,
                    upgraded: `Repeated insulting jokes can gradually normalise prejudice in a workplace.`,
                    priority: `key`,
                    atlasPrompt: `What harmful behaviour can become normalised in a family, friendship group or organisation, and how might people challenge it?`
                },
                followUp: {
                    id: `insidious-connotation-test`,
                    kind: `add-a-twist`,
                    prompt: `Take the same slow change and describe it once as gradual and once as insidious. What extra judgement does insidious add?`
                }
            }
        ],
        makeItReal: {
            label: `Make It Real`,
            title: `Frame the Future`,
            prompt: `Choose a real change in work, education or everyday life and give your tutor a 60-second recommendation about it. Present it first as a hopeful vision and then as a warning, using at least three words from the set, such as paradigm shift, paradox, narrative, insidious, utopia or dystopia.`
        }
    }
];

const clCards = [
    {
        id: `cl-the-white-clothes-behind-candidate`,
        title: `The White Clothes Behind “Candidate”`,
        contextLine: `Ancient Rome and modern public life`,
        teaser: `A word for someone seeking office began with the striking image of a person dressed in white.`,
        context: `In ancient Rome, people seeking public office were known as candidati, from the Latin candidus, meaning “bright” or “white.” They were associated with wearing a white toga, a public signal of respectability and trustworthiness. Today, candidate is more neutral, while candid still suggests openness and honesty; candidacy, candidature and incumbent belong to the same political vocabulary but describe different roles or stages. This story shows how a word can keep an old association even after its original social custom disappears.`,
        followTheThread: [
            `Can you think of a modern public situation where clothing or appearance still signals trustworthiness, authority or belonging?`,
            `How would you distinguish between a promising candidate, a credible candidate and a popular candidate in a real conversation?`
        ],
        upgrade: {
            term: `lend credibility to`,
            type: `collocation`,
            definition: `to make a person, idea or claim seem more believable or trustworthy`,
            ordinary: `A polished appearance can make a candidate seem more trustworthy, even when it tells us little about their character.`,
            upgraded: `A polished appearance can lend credibility to a candidate, even when it tells us little about their character.`,
            priority: `key`,
            atlasPrompt: `How can a speaker’s preparation or presentation style lend credibility to an idea in a work or social situation?`
        },
        mainQuestion: `When you hear the word candidate, what qualities do you expect a strong candidate to demonstrate, and does the word still carry any association with respectability or trust?`
    },
    {
        id: `cl-the-forty-days-behind-quarantine`,
        title: `The Forty Days Behind “Quarantine”`,
        contextLine: `Venice and the language of public health`,
        teaser: `A familiar word for isolation preserves a cautious decision made in the age of sailing ships and epidemics.`,
        context: `Quarantine comes from the Italian quarantina, meaning a period of forty days. In medieval Venice, ships arriving from places affected by plague could be kept offshore before passengers and goods were allowed into the city. Today, quarantine usually refers to separating people who may have been exposed to an illness, while isolation separates people who are already sick; the word has also developed a broader, sometimes metaphorical use for enforced separation.`,
        followTheThread: [
            `Can you think of a situation where the distinction between precaution, isolation and exclusion matters?`,
            `What other everyday words have developed a broader or more metaphorical meaning than their original use?`
        ],
        upgrade: {
            term: `err on the side of caution`,
            type: `idiom`,
            definition: `To choose the safer option when you are not completely sure what will happen.`,
            ordinary: `When there is a serious risk, it may be better to take extra precautions, even if they cause some inconvenience.`,
            upgraded: `When the consequences could be serious, it is reasonable to err on the side of caution and keep people apart temporarily.`,
            priority: `key`,
            atlasPrompt: `If you were unsure whether to share sensitive information online, would you err on the side of caution? Why or why not?`
        },
        mainQuestion: `When is a period of quarantine or separation a responsible precaution, and when might it become excessive or unfair?`
    },
    {
        id: `cl-rivals-at-the-same-stream`,
        title: `Rivals at the Same Stream`,
        contextLine: `Ancient Rome and modern competition`,
        teaser: `A word for fierce competitors began with people who depended on the same stretch of water.`,
        context: `Rival comes from the Latin word rivalis, meaning someone who shared a stream or river. When water was limited, neighbours using the same source could become rivals, so the word gradually developed its modern sense of people competing for the same goal. Today, rival often suggests a direct and meaningful competitor, as in rival companies, political rivals, or a long-standing rivalry.`,
        followTheThread: [
            `What is the difference between a rival, an opponent, and an enemy in everyday English?`,
            `Can you describe a situation in which two people or groups were rivals but still had to cooperate?`
        ],
        upgrade: {
            term: `go head-to-head`,
            type: `phrasal verb`,
            definition: `To compete directly with someone or something in a serious contest or disagreement.`,
            ordinary: `The two companies are competing directly for the same customers.`,
            upgraded: `The two companies are going head-to-head for the same customers.`,
            priority: `key`,
            atlasPrompt: `When might two people or teams go head-to-head in your work, studies, or daily life?`
        },
        mainQuestion: `Can competition make people stronger, or does it usually damage relationships when the people involved depend on the same resources?`
    },
    {
        id: `cl-the-line-you-must-not-cross`,
        title: `The Line You Must Not Cross`,
        contextLine: `American Civil War prisons and modern workplaces`,
        teaser: `A word that once meant a deadly boundary now measures pressure, planning and responsibility at work.`,
        context: `During the American Civil War, deadline referred to a boundary around some prison camps; prisoners who crossed it could be shot. Today, a deadline is usually a time limit, but the word still carries a faint sense of danger and finality. This helps explain why “meet a deadline,” “miss a deadline” and “a tight deadline” feel stronger than simply “finish by Friday.”`,
        followTheThread: [
            `What is the difference in tone between “deadline,” “due date,” “target date” and “time frame”?`,
            `Do you think modern workplaces use urgent language too often, making words such as “critical” or “ASAP” less meaningful?`
        ],
        upgrade: {
            term: `looming deadline`,
            type: `collocation`,
            definition: `A deadline that is approaching and may soon cause pressure or concern.`,
            ordinary: `The deadline is getting closer, and we still have a lot to do.`,
            upgraded: `The looming deadline is making the whole team rethink its priorities.`,
            priority: `key`,
            atlasPrompt: `What is a looming deadline you have faced recently, and how did you respond to it?`
        },
        mainQuestion: `When does a deadline motivate people, and when does it create unnecessary stress? Can you describe a real situation using the word precisely?`
    },
    {
        id: `cl-the-unexpected-gifts-of-serendipity`,
        title: `The Unexpected Gifts of Serendipity`,
        contextLine: `Persian storytelling and modern discovery`,
        teaser: `A word born from a fairy tale now describes valuable discoveries made while looking for something else.`,
        context: `The word serendipity was coined in the eighteenth century by the English writer Horace Walpole, who took it from The Three Princes of Serendip, an old Persian tale. In the story, the princes repeatedly make discoveries through observation and good judgement rather than by following a direct plan. Today, serendipity suggests a fortunate accident, while “luck” is broader and does not necessarily involve noticing or using an unexpected opportunity.`,
        followTheThread: [
            `Do you think serendipitous discoveries happen more often when people explore freely, or when they have a clear goal?`,
            `What habits help someone recognise and make use of a fortunate accident?`
        ],
        upgrade: {
            term: `make the most of`,
            type: `phrase`,
            definition: `To use a situation or opportunity as effectively as possible.`,
            ordinary: `When the unexpected opportunity appeared, I tried to use it well.`,
            upgraded: `When the unexpected opportunity appeared, I tried to make the most of it.`,
            priority: `key`,
            atlasPrompt: `How could someone make the most of a sudden free afternoon?`
        },
        mainQuestion: `Can you describe a time when an unexpected event led to a valuable discovery or opportunity, and would you call it serendipity?`
    },
    {
        id: `cl-when-propaganda-wasnt-an-insult`,
        title: `When “Propaganda” Wasn’t an Insult`,
        contextLine: `Seventeenth-century Rome and modern media`,
        teaser: `A word that once meant organised efforts to spread a belief gradually acquired a strongly negative tone.`,
        context: `The word propaganda comes from a Catholic institution founded in Rome in 1622 to spread and organise the faith. Its original meaning was relatively neutral: information or ideas being promoted to influence people. Today, propaganda usually suggests biased or misleading communication, while terms such as public information or campaigning can sound more neutral. The shift shows how a word’s connotation can change when its use becomes associated with political conflict and manipulation.`,
        followTheThread: [
            `Can you think of a message that was factually accurate but still felt manipulative because of what it left out?`,
            `Which words would you choose instead of propaganda when describing political communication in a neutral or professional setting?`
        ],
        upgrade: {
            term: `loaded language`,
            type: `collocation`,
            definition: `Words chosen to create a strong emotional reaction instead of presenting an idea neutrally.`,
            ordinary: `The report used emotional words to influence its readers.`,
            upgraded: `The report relied on loaded language to influence its readers.`,
            priority: `key`,
            atlasPrompt: `Where might you hear loaded language outside politics, and what effect can it have?`
        },
        mainQuestion: `When does persuasive communication become propaganda, in your view?`
    },
    {
        id: `cl-reading-the-birds-before-a-new-beginning`,
        title: `Reading the Birds Before a New Beginning`,
        contextLine: `Ancient Rome and modern ceremonies`,
        teaser: `To inaugurate something once involved seeking signs from the sky before declaring it officially begun.`,
        context: `In ancient Rome, augurs interpreted signs, including the flight of birds, before important public decisions. The word inaugurate comes from this tradition, but today it usually means to begin something formally, such as a building, institution, or period of leadership. It often sounds more ceremonial than simply start or open.`,
        followTheThread: [
            `How does the word inaugurate change the tone of a sentence compared with begin, launch, or open?`,
            `Do modern societies still look for symbolic signs before making major decisions, even if they no longer consult birds?`
        ],
        upgrade: {
            term: `usher in`,
            type: `phrasal verb`,
            definition: `to mark or introduce the beginning of something important or new`,
            ordinary: `The ceremony marked the beginning of a new period of leadership.`,
            upgraded: `The ceremony ushered in a new period of leadership.`,
            priority: `key`,
            atlasPrompt: `What change in your community or workplace could usher in a better period for people?`
        },
        mainQuestion: `What kind of event or change in your life would be important enough to inaugurate rather than simply start?`
    },
    {
        id: `cl-the-unbranded-cattle-behind-maverick`,
        title: `The Unbranded Cattle Behind “Maverick”`,
        contextLine: `Nineteenth-century Texas and modern workplaces`,
        teaser: `A word for an independent thinker began with cattle that had no clear owner or brand.`,
        context: `In nineteenth-century Texas, an unbranded calf that was separated from its herd could be called a maverick, linked to the rancher Samuel Maverick. The word later came to describe a person who refuses to follow the usual methods or group opinion. “Maverick” can sound admiring when it suggests creativity and courage, but it can also imply that someone is difficult to manage or cooperate with.`,
        followTheThread: [
            `Can you think of a situation where breaking the usual rules led to a better result?`,
            `What is the difference between being a maverick and being merely difficult?`
        ],
        upgrade: {
            term: `go against the grain`,
            type: `idiom`,
            definition: `To behave or think differently from what is usual or expected.`,
            ordinary: `She often disagrees with the usual way of doing things.`,
            upgraded: `She often goes against the grain and questions the usual way of doing things.`,
            priority: `key`,
            atlasPrompt: `When might you go against the grain in your personal life, studies, or work?`
        },
        mainQuestion: `Would you rather work with a creative maverick or a reliable team player, and when might your choice change?`
    },
    {
        id: `cl-the-one-in-ten-punishment-behind-decimate`,
        title: `The One-in-Ten Punishment Behind “Decimate”`,
        contextLine: `Ancient Rome and modern journalism`,
        teaser: `A word now used for devastating damage began as a remarkably precise military punishment.`,
        context: `In ancient Rome, decimation was a punishment in which one soldier in ten was selected for execution, usually after a unit had seriously failed. Today, “decimate” often means to destroy or severely reduce a large part of something, as in “the storm decimated the crops.” The older precise meaning still matters to some speakers, while the broader modern meaning is common in news and everyday speech.`,
        followTheThread: [
            `Can you think of another English word whose meaning has changed or become less precise over time?`,
            `In a serious situation such as a news report or workplace presentation, would you choose “decimate” or a clearer phrase such as “destroy most of”? Why?`
        ],
        upgrade: {
            term: `in the strict sense`,
            type: `phrase`,
            definition: `Using the exact, narrow meaning of a word or idea, rather than a broader everyday meaning.`,
            ordinary: `The word has a precise older meaning, although people often use it more broadly today.`,
            upgraded: `In the strict sense, “decimate” means to reduce something by one tenth, but many people now use it to mean destroy most of it.`,
            priority: `key`,
            atlasPrompt: `Can you think of a rule, promise or description that people sometimes understand more broadly than they would in the strict sense?`
        },
        mainQuestion: `When you use a word with both an older precise meaning and a broader modern meaning, do you think accuracy or common usage should come first? Why?`
    }
];
