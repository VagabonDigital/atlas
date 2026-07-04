/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Communication & Expression
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring how tone, timing,
  silence, culture, and context shape what people really mean.
  Built for live lessons, thoughtful discussion, and sharper social awareness
  around expression, meaning, and human communication.
  Subject content may change.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'communication-expression',
    schemaVersion: 1,
    contentVersion: '1.0.0',
    title: 'Communication & Expression',
    titleHtml: 'Communication<br>&amp; <em>Expression</em>',
    navTitle: 'Communication',
    bgImage: 'https://as1.ftcdn.net/jpg/03/71/98/22/1000_F_371982277_7nj9Ex7pVFD3tYDewVz9ViBLc54Kb0rZ.jpg'
};

const subjectCopy = {
    cover: {
        hook: `How tone, timing, silence, and small social signals change what people really mean — across cultures and everyday life.`
    },
    overview: {
        heading: `How we speak shapes what people hear`,
        intro: [
            `Communication is never only about choosing the right words. Tone, timing, silence, expression, and cultural expectations can all change how a message feels.`,
            `In this subject, you'll explore how meaning is created through voice, language, and social context — from everyday misunderstandings to deeper questions about honesty, subtlety, emotion, and connection.`
        ]
    },
    paths: {
        culturalLensDescription: `Explore how different cultures approach silence, directness, emotional expression, and the meaning behind words — and discover what makes each approach make sense in context.`,
        discussionDescription: `Work through real-life communication moments — from awkward everyday slips to subtle signals and deeper meaning — using language that helps your ideas land more clearly.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Closing reflection — revisit what you've explored and carry something forward`
    },
    culturalLens: {
        heading: `Communication expectations across cultures`,
        intro: `Communication is not just about exchanging information — it also reflects deep ideas about respect, hierarchy, and social harmony. Across cultures and history, people have developed very different expectations about when to speak clearly, when to stay vague, and when silence or emotion carries more weight than words.`
    },
    discussion: {
        heading: `Between the Lines`,
        intro: `Every conversation carries more than words. A pause before a reply, a tone that does not match the message, or a moment when someone chooses not to speak can change everything. These conversations move from quick first reactions into deeper questions about what people really mean, what goes unspoken, and how you express yourself when it matters most. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `You've explored how tone, timing, silence, directness, and emotion change what people really mean — across cultures, real-life moments, and your own experience. These conversations help you express ideas more clearly, interpret others with more care, and navigate everyday interactions with greater confidence.`,
        questions: [
            `Looking back at the cultural examples today, which communication style felt most familiar to you — and which felt most different from how you naturally communicate?`,
            `Think of a recent real-life moment when a message was misunderstood. What would you try differently next time — one specific word choice, pause, tone, or follow-up question?`,
            `Which word or phrase from today's conversation gave you a more precise way to describe something you've experienced — and can you think of a real situation where you'd actually use it?`
        ]
    },
    keyLanguage: {
        intro: `Higher-level expressions from this subject — with definitions and natural in-action examples.`
    }
};

const clCards = [
    {
        id: `cl-japan`,
        location: `Japan`,
        title: `Saying "yes" doesn't always mean agreement`,
        teaser: `Politeness can carry more meaning than the words themselves.`,
        insight: `In many situations in Japan, people may say "yes" simply to show they are listening or following what you mean, not that they fully agree. Direct refusal is often softened or avoided so the conversation can stay polite and harmonious. What sounds like agreement on the surface may actually be acknowledgement, hesitation, or a quietly held reservation.`,
        question: `If someone kept saying "yes" politely but you were not sure they truly agreed, what would you do — ask directly, watch for indirect signals, or leave it for now?`,
        upgrade: {
            term: `save face`,
            type: `verb phrase`,
            def: `To protect your own dignity or avoid embarrassment, often by not refusing or admitting something directly.`,
            in_action: `Sometimes people say "yes" just to save face — refusing outright would feel awkward, so they agree on the surface.`,
            review_prompt: `When have you said yes mainly to save face, rather than because you really agreed?`
        },
        deeper: {
            text: `One reason this pattern exists is that in many Japanese social contexts, maintaining a harmonious atmosphere is treated as more important than making a position absolutely clear in the moment. Direct refusal can feel abrupt or even unkind — it places the other person in an awkward position and disrupts the flow of the conversation. So instead, a range of softer signals develop: a slow breath, a long pause, phrases like "that may be difficult," or a "yes" that means "I hear you" rather than "I agree." For someone unfamiliar with these signals, the gap between what is said and what is meant can be significant. Misunderstandings in these situations are not usually caused by dishonesty — they happen because both people are interpreting the same words through different conversational frameworks.`,
            questions: [
                `Can you think of a time when you said "yes" or "of course" to avoid awkwardness, even though you weren't really sure?`,
                `If a colleague in a meeting seemed to agree with your idea but then didn't follow through, how would you handle that conversation?`,
                `In your own culture, what signals — other than a direct "no" — would tell you that someone actually disagrees?`
            ]
        }
    },
    {
        id: `cl-finland`,
        location: `Finland`,
        title: `Silence can be sincere`,
        teaser: `Comfortable quiet is not emptiness — it can be its own kind of honesty.`,
        insight: `In Finland, silence in conversation is often more comfortable than in many other cultures. Speaking only when you have something real to say can feel more honest than filling every pause with conversation. Silence is not considered awkward by default — it can signal thought, trust, or simply a shared comfort in not performing conversation.`,
        question: `If a conversation with someone you did not know very well suddenly went quiet, would you feel peaceful, awkward, or pressured to fill the gap?`,
        upgrade: {
            term: `comfortable silence`,
            type: `noun phrase`,
            def: `A quiet moment between people that feels natural and easy rather than tense or embarrassing.`,
            in_action: `I think we've reached the point where we can sit in comfortable silence — it actually shows how relaxed we are around each other.`,
            review_prompt: `With which people in your life does a long pause feel easy rather than awkward?`
        },
        deeper: {
            text: `In many communication cultures, silence in a conversation feels like a gap that needs filling — a signal that something has gone wrong or that the other person is bored. This instinct is much weaker in Finland, where pausing before speaking is often read as a sign that someone is thinking carefully rather than struggling or being unfriendly. This difference can cause real friction when people from different backgrounds interact. A colleague who pauses before answering may be giving the question genuine thought — but an outsider might interpret the quiet as disapproval or confusion, and rush to fill it. Equally, someone who talks constantly to avoid silence may come across as insincere or not really listening. The deeper idea is that silence is not the opposite of communication — it is part of it.`,
            questions: [
                `Is there someone in your life — a friend, family member, or colleague — with whom silence feels comfortable rather than awkward?`,
                `Have you ever felt pressure to speak just to fill a quiet moment, even when you didn't really have anything to add?`,
                `Do you think people who speak less are usually seen as shy, thoughtful, or something else — and does that feel fair to you?`
            ]
        }
    },
    {
        id: `cl-renaissance-italy`,
        location: `Renaissance Italy`,
        title: `Speaking carefully to stay safe`,
        teaser: `When words could be used against you, vagueness became a survival skill.`,
        insight: `In the political world of Renaissance Italy, diplomats often spoke in vague or flexible ways so their words could still work if alliances changed. Communication was not always about being clear — sometimes it was about leaving yourself room to survive. A statement had to be true enough to repeat publicly, but open enough to reinterpret if circumstances shifted.`,
        question: `If you were in a situation where your words could be used against you later, would you speak clearly, stay vague, or say as little as possible?`,
        upgrade: {
            term: `hedge`,
            type: `verb`,
            def: `To avoid giving a clear or direct answer, keeping your words vague so you don't fully commit.`,
            in_action: `I hedged in that email — I didn't say no, but I didn't commit to anything either, which gave me time to think.`,
            review_prompt: `When was the last time you hedged instead of giving a straight answer?`
        },
        deeper: {
            text: `Renaissance diplomatic language was a highly developed skill, not simply a form of dishonesty. Ambassadors were trained to say things that were technically accurate but flexible enough to survive if political circumstances changed. This kind of careful vagueness still appears in modern professional life — in politics, in legal language, even in ordinary workplace conversations where someone needs to stay on good terms with opposing sides. The interesting question is where the line sits between thoughtful precision and deliberate evasion. Saying "I'll consider it" is technically honest. But if you have already decided no, is it more respectful to say so clearly, or less hurtful to leave the door open? Different cultures, relationships, and situations can give very different answers to that question.`,
            questions: [
                `Can you think of a message or reply — from work, school, or personal life — where you deliberately chose words that left things open rather than being definite?`,
                `Do you think being vague is sometimes the kinder option, or does it usually just delay a difficult conversation?`,
                `If someone gave you a carefully worded non-answer, would you usually push for clarity or accept the ambiguity?`
            ]
        }
    },
    {
        id: `cl-imperial-china`,
        location: `Imperial China`,
        title: `Criticism hidden inside art`,
        teaser: `A poem could carry a political message that a direct report never could.`,
        insight: `In imperial China, officials sometimes criticised rulers indirectly through poetry, symbolism, or historical references instead of open attack. A message could be serious and political without sounding openly rebellious on the surface. This allowed ideas to circulate that could not survive as direct speech, and protected the writer with a layer of plausible deniability.`,
        question: `If someone criticised you using a story, a joke, or a carefully chosen example rather than saying it directly, would you notice — and would you prefer they had just been honest?`,
        upgrade: {
            term: `veiled criticism`,
            type: `noun phrase`,
            def: `A negative message or complaint that is expressed indirectly, hidden inside a story, joke, or neutral-seeming remark.`,
            in_action: `I think his comment about "how some people handle feedback" was veiled criticism directed at me — he was just too polite to say it directly.`,
            review_prompt: `How might someone hint at a complaint through a joke or a story instead of saying it plainly?`
        },
        deeper: {
            text: `This way of hiding a serious message inside a cultural or artistic form is far from unique to imperial China. Political satire, fables, allegory, and sharp comedy all work on the same principle — the surface content gives the speaker protection, while the real message reaches people who know how to listen for it. The audience is invited to complete the meaning themselves, which can make the message land more powerfully than a direct statement would. In everyday life, the same pattern shows up in the pointed joke, the story that is "obviously not about anyone in particular," or the example chosen a little too perfectly to illustrate a recent situation. Noticing this kind of indirect communication requires a different kind of listening — one that pays attention to what was chosen, and what was deliberately left unsaid.`,
            questions: [
                `Have you ever used a joke, a story, or an example to hint at something you didn't want to say directly — and did the other person understand?`,
                `Think of a time when you received feedback wrapped inside a compliment or a general observation. Was it easier or harder to hear than direct criticism?`,
                `Can you think of a film, book, or piece of comedy that carries a serious social or political message beneath the surface?`
            ]
        }
    },
    {
        id: `cl-new-york`,
        location: `New York City`,
        title: `Interrupting can mean interest`,
        teaser: `What reads as rudeness in one setting can feel like energy and engagement in another.`,
        insight: `In New York City and some other fast-paced urban environments, cutting into someone's speech can sometimes signal energy, enthusiasm, or strong engagement rather than disrespect. For someone from a different communication background, it can sound like an interruption — but for participants it may feel like lively, connected involvement in the conversation.`,
        question: `If someone jumps into your story because they are excited about what you are saying, do you usually see that as energy and interest — or as them taking over?`,
        upgrade: {
            term: `talk over each other`,
            type: `phrasal verb`,
            def: `To speak at the same time as someone else, which in some styles signals excitement and engagement rather than rudeness.`,
            in_action: `In my family everyone talks over each other constantly — it's not rude, it just means everyone's interested at once.`,
            review_prompt: `In which settings does talking over each other feel like energy rather than rudeness?`
        },
        deeper: {
            text: `What feels like an interruption from the outside can feel like genuine engagement from the inside. In some conversational styles, jumping in mid-sentence signals that the listener is so interested they can't hold back — it's a form of energy and presence, not dismissal. In other styles, waiting for a clear pause before speaking is the standard way of showing respect. When these two approaches meet, both people can end up misreading each other. The person who interrupts may feel they're being warm and enthusiastic. The person who waits their turn may feel overlooked or talked over. Neither is being rude on purpose — they're just following different unspoken rules about how conversation should flow.`,
            questions: [
                `When someone cuts into what you're saying, does your reaction depend more on what they say, or on how they do it?`,
                `Have you ever been in a group conversation where some people kept talking over others — how did that feel to be on different sides of it?`,
                `Do you think there's a difference between an interruption that adds to your point and one that replaces it?`
            ]
        }
    },
    {
        id: `cl-france`,
        location: `France`,
        title: `Debate as pleasure`,
        teaser: `A lively argument at dinner is not a crisis — it can be the whole point.`,
        insight: `In France, lively disagreement can sometimes be part of social pleasure rather than a sign that something is wrong. People may challenge each other strongly during a discussion, then continue the evening completely normally afterwards. The exchange of ideas — including opposing ones — is treated as a sign of intellectual engagement rather than personal conflict.`,
        question: `If a dinner conversation turned into a lively debate where people strongly challenged each other's views, would you enjoy the energy, stay quiet, or try to find a calmer topic?`,
        upgrade: {
            term: `intellectual sparring`,
            type: `noun phrase`,
            def: `A lively exchange of opposing ideas in a spirit of enjoyment and curiosity rather than genuine conflict.`,
            in_action: `I actually enjoy a bit of intellectual sparring — I find that debating something properly helps me understand my own view better.`,
            review_prompt: `What's the difference between a real argument and two people enjoying a debate?`
        },
        deeper: {
            text: `One reason this pattern may exist is a long cultural tradition of treating the exchange of ideas as something valuable in itself — separate from whether anyone "wins" the argument. In this frame, challenging someone's position can be a sign of respect: it means you're taking them seriously enough to push back. The assumption is that both people can handle disagreement without it damaging the relationship. This can clash quite directly with communication cultures where public disagreement is seen as a threat to harmony or a sign that something has gone wrong. What one person experiences as a stimulating debate, another can feel as an uncomfortable confrontation, even when the topic is completely impersonal.`,
            questions: [
                `Think of the last time you disagreed with someone in conversation — did you say so openly, soften it, or hold back entirely?`,
                `Is there a topic or setting where you feel genuinely comfortable debating, and one where you'd rather keep the peace?`,
                `Have you ever had a heated conversation that ended fine — where both people moved on without it affecting the relationship?`
            ]
        }
    },
    {
        id: `cl-germany`,
        location: `Germany`,
        title: `Direct honesty as respect`,
        teaser: `Softening a message too much can sometimes feel less respectful, not more.`,
        insight: `In Germany, direct feedback is often seen as respectful because it avoids confusion, mixed signals, or hidden criticism. Being clear can feel more honest than trying too hard to protect someone's feelings. One assumption behind this approach is that the other person is capable of receiving honest information without needing it wrapped in reassurance.`,
        question: `If your work, your outfit, or your idea had a real problem, would you want someone to tell you directly — or would you prefer they soften the message first?`,
        upgrade: {
            term: `straight-talking`,
            type: `adjective`,
            def: `Describing someone who says exactly what they think, without softening or hinting — often used approvingly when the honesty feels useful rather than blunt.`,
            in_action: `I appreciated her straight-talking style — she told me what wasn't working, and I left the meeting knowing exactly what to fix.`,
            review_prompt: `When is very direct feedback actually more helpful than a softened version?`
        },
        deeper: {
            text: `One reason directness is valued in some communication cultures is the belief that ambiguity can actually damage trust over time. If a colleague's work has real problems and you only hint at them vaguely, you're leaving them without the information they need to improve — and they may feel misled later when the consequences arrive. At the same time, directness without warmth or context can land badly, particularly across communication styles where the relationship tone matters as much as the content. The practical distinction worth making is between being direct — willing to say something clearly — and being blunt, which is about how it's said. Many skilled communicators manage to be honest and considerate at the same time.`,
            questions: [
                `Think of a piece of feedback you received that actually helped you — was it delivered gently, directly, or somewhere in between?`,
                `Is it harder for you to give honest feedback to someone, or to receive it without getting defensive?`,
                `Have you ever wished someone had just told you something clearly rather than dancing around it — what was the situation?`
            ]
        }
    },
    {
        id: `cl-arabic`,
        location: `Arabic-speaking world`,
        title: `Expressiveness as sincerity`,
        teaser: `A more reserved delivery can sometimes sound unconvincing rather than restrained.`,
        insight: `In some Arabic-speaking communication contexts, especially when the topic carries emotional weight, tone, repetition, emphasis, and expressive phrasing can add warmth, sincerity, and human connection to speech. A more expressive style may feel natural or heartfelt rather than exaggerated. What sounds intense in one communication context can be exactly what genuine feeling looks like in another.`,
        question: `When someone speaks with strong emotion, repetition, and a lot of emphasis, do you find yourself reading it as sincerity, drama, confidence — or something else entirely?`,
        upgrade: {
            term: `wear your heart on your sleeve`,
            type: `idiom`,
            def: `To show your feelings openly and visibly, without trying to hide or contain them.`,
            in_action: `In some cultures it's normal to wear your heart on your sleeve when you speak — strong feeling in your voice is a sign you mean it, not that you're overdoing it.`,
            review_prompt: `Is wearing your heart on your sleeve something you do naturally, or something you tend to hold back?`
        },
        deeper: {
            text: `In contexts where expressive speech is valued, a reserved or minimal delivery can sometimes make trust harder rather than easier. If you care deeply about something, people may expect that feeling to be visible in how you speak — in the energy of your voice, the warmth of your phrasing, or the rhythm of your sentences. A flat or very restrained delivery can be misread as indifference, even when none was intended. This creates a practical challenge when expressive and reserved communication styles meet: the more reserved speaker may feel their sincerity is being doubted, while the more expressive speaker may feel the other person is holding something back.`,
            questions: [
                `When you feel strongly about something in a conversation, does your communication style change noticeably — and in what way?`,
                `Have you ever felt that someone was being cold or disengaged, and later realised they were just being reserved rather than distant?`,
                `Do you think we sometimes judge whether someone is sincere based on how similar their communication style is to our own?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-first-read`,
        title: `First Read`,
        desc: `Quick reactions to familiar communication moments — the kind you recognise instantly, even if you have never put them into words.`,
        icon: `react`,
        moments: [
            {
                id: `moment-tone-off`,
                preview: `The words were fine. Something else was not.`,
                text: `Someone sends you a message that says “Sure, no problem” — but something about it does not feel right. What do you usually pick up on first: the words themselves, the way they are written, or something harder to name?`,
                upgrade: {
                    term: `read between the lines`,
                    type: `idiom`,
                    def: `To understand what someone really means, even when they have not said it directly.`,
                    in_action: `She said she was fine with it, but I could read between the lines — she was not happy at all.`,
                    review_prompt: `How can you tell someone isn't happy even when their words say they're fine?`
                }
            },
            {
                id: `moment-wrong-moment`,
                preview: `The right thing at the wrong time.`,
                text: `Think of a moment when someone said something completely reasonable, but it landed badly because the timing was off. What made the timing wrong — and does timing matter as much as the words themselves?`,
                upgrade: {
                    term: `land badly`,
                    type: `phrasal verb`,
                    def: `When something said or done has a negative effect, even if that was not the intention.`,
                    in_action: `His joke landed badly — everyone went quiet, and he clearly had not expected that reaction.`,
                    review_prompt: `What kind of comment could be reasonable but still land badly because of the timing?`
                }
            },
            {
                id: `moment-silence-speaks`,
                preview: `When not saying anything says everything.`,
                text: `When someone goes silent in the middle of a conversation — no reply, no explanation — what do you assume? Is silence usually comfortable, awkward, or something else entirely for you?`,
                upgrade: {
                    term: `loaded silence`,
                    type: `noun phrase`,
                    def: `A silence that carries strong emotion, tension, or meaning without anyone speaking.`,
                    in_action: `After she told him the news, there was a loaded silence — nobody spoke, but everyone could feel the tension.`,
                    review_prompt: `What kind of situation might create a loaded silence in a room?`
                }
            },
            {
                id: `moment-blunt-or-kind`,
                preview: `Honest, or just harsh?`,
                text: `Some people say exactly what they think, and some soften everything they say. Which style do you find easier to trust — and which do you find harder to deal with?`,
                upgrade: {
                    term: `pull your punches`,
                    type: `idiom`,
                    def: `To make your words or criticism less direct than you could be, to avoid upsetting someone.`,
                    in_action: `She did not pull any punches — she told him exactly what she thought of the plan, and he was not prepared for it.`,
                    review_prompt: `When giving feedback, would you pull your punches or say it straight? Why?`
                }
            },
            {
                id: `moment-misread`,
                preview: `The message you sent was not the one they received.`,
                text: `Have you ever said something that was completely misunderstood — not because you were unclear, but because the other person heard it differently? What happened, and how did you realise the gap?`,
                upgrade: {
                    term: `come across`,
                    type: `phrasal verb`,
                    def: `To give a particular impression through your words, tone, or behaviour, even if that impression was not what you intended.`,
                    in_action: `I was trying to be helpful, but apparently I came across as quite rude — she thought I was criticising her.`,
                    review_prompt: `Have you ever come across differently from how you intended? What happened?`
                }
            }
        ],
        makeItReal: {
            title: `A moment that stayed with you`,
            prompt: `Think of a recent conversation — at work, at home, or with a friend — where something was communicated but not quite said. What was the moment, and how did you know what was really meant?`
        }
    },
    {
        id: `set-under-the-surface`,
        title: `Under the Surface`,
        desc: `Go deeper into how communication actually works — why the same words mean different things, what shapes how we listen, and what we are really doing when we speak.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-same-words`,
                preview: `Same sentence, completely different meaning.`,
                text: `“I’m fine.” “That’s interesting.” “We’ll see.” These phrases can mean very different things depending on who says them and how. How do you decide what someone really means when the words alone do not tell you?`,
                upgrade: {
                    term: `subtext`,
                    type: `noun`,
                    def: `The real meaning or feeling beneath what someone is saying — the message behind the message.`,
                    in_action: `On the surface it sounded polite, but the subtext was clear — he was not going to agree to it.`,
                    review_prompt: `How could a polite sentence carry a subtext that means the opposite?`
                }
            },
            {
                id: `moment-overthink-reply`,
                preview: `Before you send, you rewrite it three times.`,
                text: `Do you ever spend much longer crafting a message than the conversation actually needs? What are you usually trying to get right — and does it usually work?`,
                upgrade: {
                    term: `second-guess yourself`,
                    type: `phrasal verb`,
                    def: `To doubt your own judgement and keep changing your mind about what to say or do.`,
                    in_action: `I second-guessed myself so many times writing that email that it took twenty minutes to write three sentences.`,
                    review_prompt: `What kind of message makes you second-guess yourself and rewrite it again and again?`
                }
            },
            {
                id: `moment-direct-culture`,
                preview: `Where you are from changes what “polite” means.`,
                text: `You explain your view clearly, but the other person seems uncomfortable — or you soften your message to be polite, and they miss your point. What do you think happened in that moment: different expectations about honesty, politeness, or how much should be left unsaid?`,
                upgrade: {
                    term: `high-context communication`,
                    type: `concept term`,
                    def: `A communication style where much of the meaning is implied, rather than stated directly.`,
                    in_action: `In a high-context communication style, people may expect you to understand the meaning from tone, timing, silence, or the situation — not only from the words.`,
                    review_prompt: `Besides the words, what signals tell you the real meaning in a high-context exchange?`
                }
            },
            {
                id: `moment-half-listening`,
                preview: `Physically present. Not really there.`,
                text: `What is the difference between actually listening and just waiting for your turn to speak? How can you usually tell which one someone is doing — and which one do you catch yourself doing more often than you would like to admit?`,
                upgrade: {
                    term: `tune out`,
                    type: `phrasal verb`,
                    def: `To stop paying attention to what someone is saying, even while appearing to listen.`,
                    in_action: `I could tell he'd tuned out about halfway through — he was nodding, but his eyes had gone somewhere else.`,
                    review_prompt: `How can you tell when someone has tuned out even though they're still nodding?`
                }
            },
            {
                id: `moment-word-choice-weight`,
                preview: `One word changes everything.`,
                text: `Imagine saying “I need help with this” versus “I’m struggling with this” versus “I can’t manage this on my own.” They describe the same situation, but each one creates a different impression. How much do you think about your word choices in conversations that matter?`,
                upgrade: {
                    term: `connotation`,
                    type: `noun`,
                    def: `The emotional or social feeling that a word carries, beyond its basic dictionary meaning.`,
                    in_action: `Both words mean roughly the same thing, but the connotations are very different — one sounds confident, the other sounds defeated.`,
                    review_prompt: `Which sounds more suitable in a work message: 'cheap' or 'affordable', and why?`
                }
            }
        ],
        makeItReal: {
            title: `A message that took effort`,
            prompt: `Think of a time you had to communicate something carefully — a difficult message, a sensitive topic, or something where the words really mattered. How did you approach it, and do you think it worked?`
        }
    },
    {
        id: `set-your-voice`,
        title: `Your Voice`,
        desc: `The conversation turns personal — how you express yourself, where your communication style comes from, and what you are still learning about being understood.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-hard-to-say`,
                preview: `You knew what you wanted to say. Getting it out was another thing.`,
                text: `Is there a type of conversation that you find genuinely difficult to start — not because you do not know what to say, but because saying it out loud feels hard? What makes that kind of conversation so uncomfortable?`,
                upgrade: {
                    term: `brace yourself`,
                    type: `phrasal verb`,
                    def: `To mentally prepare yourself for something difficult, uncomfortable, or emotionally challenging.`,
                    in_action: `Every time she had to give critical feedback, she would brace herself before starting the conversation — she hated how it might land.`,
                    review_prompt: `What kind of conversation makes you brace yourself before starting it?`
                }
            },
            {
                id: `moment-feel-understood`,
                preview: `The relief of someone actually getting it.`,
                text: `Think of a person in your life who almost always understands what you mean — not just your words, but what you are actually trying to say. What do they do differently from other listeners?`,
                upgrade: {
                    term: `feel heard`,
                    type: `spoken phrase`,
                    def: `The feeling that someone has truly understood and acknowledged what you have said, not just listened to the surface words.`,
                    in_action: `She did not offer advice or solutions — she just listened, and somehow that was enough to make him feel heard.`,
                    review_prompt: `What does someone do in a conversation that makes you feel heard?`
                }
            },
            {
                id: `moment-language-self`,
                preview: `Who are you in a different language?`,
                text: `If you speak more than one language, does your personality or communication style feel different depending on which language you are using? What shifts — your sense of humour, your confidence, your directness?`,
                upgrade: {
                    term: `come out of your shell`,
                    type: `idiom`,
                    def: `To become more relaxed, confident, or open in social situations, often after a period of being reserved or quiet.`,
                    in_action: `In his own language he was funny and talkative, but in English he had not quite come out of his shell yet.`,
                    review_prompt: `What helps a quiet person come out of their shell in a group?`
                }
            },
            {
                id: `moment-silence-habit`,
                preview: `The things you chose not to say.`,
                text: `Are you someone who tends to say less or more than you mean? Looking back, are there things you wish you had said — or things you are glad you kept to yourself?`,
                upgrade: {
                    term: `hold your tongue`,
                    type: `idiom`,
                    def: `To stop yourself from saying something, especially when you are tempted or when speaking would cause problems.`,
                    in_action: `She had a strong opinion but decided to hold her tongue — it was not the right moment, and she knew it.`,
                    review_prompt: `When was a moment it was wiser to hold your tongue than to speak?`
                }
            },
            {
                id: `moment-growing-communicator`,
                preview: `You communicate differently now than you used to.`,
                text: `How has the way you communicate changed over time — at work, in relationships, or just in everyday conversation? What made you change, and is there anything you are still trying to improve?`,
                upgrade: {
                    term: `find your voice`,
                    type: `idiomatic phrase`,
                    def: `To develop the confidence and ability to express yourself clearly and authentically, especially in situations where you previously felt hesitant.`,
                    in_action: `It took her a few years in the job before she really found her voice in meetings — now she speaks up without thinking twice.`,
                    review_prompt: `In what kind of setting are you still working to find your voice?`
                }
            }
        ],
        makeItReal: {
            title: `The conversation that changed something`,
            prompt: `Think of a conversation that genuinely changed the way you communicate — maybe a difficult one, a surprisingly honest one, or one where you finally understood something about yourself. What happened, and what did it teach you?`
        }
    }
];
