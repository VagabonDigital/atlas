/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Communication & Expression
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring how words, tone,
  timing, silence, culture, and context shape what people really mean.
  Built for live lessons, thoughtful discussion, and sharper social awareness
  around expression, meaning, listening, and human communication.
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
    bgImage: 'https://photos.smugmug.com/Atlas/i-HRxxfKm/0/LxfwrSftsBGtshL2rMnbjKdDnxpzS6kRwnZFvCXF5/O/2d9b20d4-fb4f-4a9d-b2de-80dd6a13a04a.pnghttps://photos.smugmug.com/Atlas/i-zTV8wZp/0/KDfWGJp6zXrHCfjpJmrM6Ssxmr26wk6RtBbf7hvpF/O/2d9b20d4-fb4f-4a9d-b2de-80dd6a13a04a.png'
};

const subjectCopy = {
cover: {
    hook: `A sentence can stay with someone for years — whether you meant it to or not.`
}   ,
    overview: {
        heading: `The Weight of Words`,
        intro: [
            `We do it all day long, and still it trips us up: the message rewritten five times, the "fine" that clearly wasn't, the joke that landed wrong, the thing everyone in the room understood but nobody said.`,
            `Words are never just information. They soothe, sting, hide, and reveal — and every so often they change something the moment they're spoken. This is a subject about all the things we're really doing when we talk.`
        ]
    },
    paths: {
        culturalLensDescription: `How cultures give weight to words, silence, names, refusal, taboo, and listening — from a pause that means trust to a "no" that really means "ask me again."`,
        discussionDescription: `The line you never forgot, the message you agonised over, the apology that actually worked, and the words that changed something the moment they were said.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Carry something forward — a thought about how you speak, listen, or want to be understood.`
    },
    culturalLens: {
        heading: `The Unwritten Rules of Talk`,
        intro: `Talking has never meant the same thing everywhere. A silence that feels warm in one place feels like failure in another; bluntness that reads as rude to some is a mark of respect to others; a polite "no" can be the first step of saying yes. These cards look at how different cultures and eras handle the unwritten rules of expression — when to speak plainly, when to soften, when to stay quiet, which words are off-limits, and how listening or even "you" can carry social meaning.`
    },
    discussion: {
        heading: `Everything the Words Are Doing`,
        intro: `Every one of us has the line we can't forget, the "fine" we saw straight through, the message we rewrote too many times. These sets move from the small moments where words hit hard, through the choices we make in how we say things, to what our words carry underneath — the ones that change something, and the feeling of being truly heard. Some moments are quick reactions; others ask for a proper story. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `Words do far more than carry information. They land softly or sharply depending on how and when they're said; they hide meaning as often as they reveal it; and now and then they change something the instant they leave your mouth. Across cultures, the same silence, the same bluntness, the same polite refusal can mean opposite things — and the same feeling can have a perfect word in one language and none at all in another. Somewhere between the message you agonised over and the moment you felt completely understood is the real work of talking: not just being heard, but being understood the way you meant.`,
        questions: [
            `What is one moment from this subject that changed how you think about words — a silence, a name, an apology, a refusal, a translation, or a line that stayed with you?`,
            `Do you think you're understood the way you mean to be most of the time — or does something often get lost between what you feel and what comes out?`,
            `Which Upgrade word or phrase from today gives you a sharper way to describe how expression lands — and where could you actually use it?`
        ]
    },
    keyLanguage: {
        intro: `Useful words and phrases for talking about how we express ourselves, listen, and understand each other.`
    }
};

const clCards = [
    {
        id: `cl-untranslatable`,
        location: `Across many languages`,
        title: `The Word You Don't Have`,
        teaser: `Some feelings have a name in one language and a paragraph in another.`,
        insight: `Every language hands its speakers a slightly different set of ready-made words — and leaves gaps where another language has a single, perfect term. Portuguese is often pointed to for saudade, a warm ache for something loved and absent; other languages have compact words for the specific comfort of being cosy indoors, or for a joke that's funny only to you. When your language has the word, the feeling is easy to name and share; when it doesn't, you may notice the thing less, or reach for a whole sentence to explain it. The human meaning underneath: the words you're given quietly shape what you find easy to say — and sometimes what you even stop to notice at all.`,
        question: `Is there a word in a language you know that says something English can't manage in one go? What does it mean — and when do you most wish English had it?`,
        upgrade: {
            term: `lost in translation`,
            type: `idiom`,
            def: `When the full meaning of something is missing after it's moved from one language to another.`,
            in_action: `I tried to explain the word to my English friends, but it just got lost in translation.`,
            review_prompt: `What's something that always gets lost in translation when you explain it in English?`
        },
        deeper: {
            text: `It's tempting to think words are just labels we stick onto feelings everyone has anyway — but the relationship may run deeper. When a language gives a feeling its own compact name, that feeling becomes easier to point at, talk about, and share; it turns into something you can name in a single breath rather than sketch out slowly. A speaker of another language feels the same thing, most likely, but has to build it from scratch each time, and so may mention it less. This is why translating poetry, jokes, and terms of affection is so hard: the dictionary meaning crosses over easily, but the warmth, the specific shade, the cultural weight often don't. For someone learning a new language, this is one of the quiet pleasures and frustrations — discovering a word that finally names something you'd always felt, or losing a word from your own language that no one around you understands anymore.`,
            questions: [
                `Do you think having a word for a feeling makes it easier to notice, or would you feel it just the same either way?`,
                `Is there a word from your first language you wish everyone around you understood?`,
                `When you can't translate something exactly, do you explain it, replace it, or just skip it?`
            ]
        }
    },
    {
        id: `cl-formal-you`,
        location: `Formal / informal "you"`,
        title: `When "You" Gets Closer`,
        teaser: `In many languages, growing closer to someone is a moment you can hear.`,
        insight: `English has just one "you" for everyone — a stranger, a boss, a child, a lover. Many other languages have two: a formal one for distance and respect, and an informal one for closeness. That makes the shift from formal to familiar an actual event — often marked, sometimes even invited out loud ("we can use the informal now"). Choosing the wrong one can feel cold, or too familiar too fast. For English speakers this hidden layer is easy to miss, because their language quietly flattens all of it. The human meaning underneath: in these languages, how close you are to someone isn't only felt — it's built into the grammar, and you choose it every time you speak.`,
        question: `If you could mark the exact moment a relationship became less formal — a real switch from "distant" to "close" — would you welcome that, or is it easier when it just happens quietly?`,
        upgrade: {
            term: `on first-name terms`,
            type: `idiomatic phrase`,
            def: `Close or informal enough with someone to use their first name rather than a title.`,
            in_action: `We were on first-name terms within a week — it felt friendly rather than stiff.`,
            review_prompt: `Who did you recently get on first-name terms with, and did the shift feel natural?`
        },
        deeper: {
            text: `The interesting part isn't the grammar itself but what it forces speakers to keep noticing. In languages with two forms of "you," every conversation quietly asks: how close are we, really? Who ranks above whom here? Has something changed between us? English speakers rarely think about this, because their language lets them address a president and a toddler with the same word — closeness gets carried by tone, name, and warmth instead. Neither system is better, but they train different habits. A speaker of a two-form language moving into English can feel oddly unanchored, missing the built-in signal for respect and distance. An English speaker learning one of these languages often panics at the choice, terrified of being accidentally rude or overly familiar. And in both systems, the moment someone offers the closer form — or drops the title and uses your name — can be a small, genuine milestone in a relationship.`,
            questions: [
                `In your language, is there a clear way of showing you've become closer to someone — in words, names, or how you address them?`,
                `Have you ever felt someone was too formal, or too familiar too quickly? What did it change?`,
                `Do you think English loses something by having only one "you," or is it freeing?`
            ]
        }
    },
    {
        id: `cl-taarof`,
        location: `Iran · ta'arof`,
        title: `The "No" Before Yes`,
        teaser: `Sometimes refusing politely is the first step of accepting.`,
        insight: `In many Iranian social settings, a custom often called ta'arof shapes offers and refusals. A host offers food again and again; the guest declines — once, twice — and only accepts after being urged again. A taxi driver may wave away payment, expecting the passenger to insist on paying. The first "no" isn't always a real no; it can be politeness doing its work, a graceful dance both sides know the steps to. For an outsider who takes the refusal at face value, the results can be awkward — a guest left unfed, a driver left unpaid. The human meaning underneath: in some cultures, the polite surface of a conversation isn't a barrier to the real meaning — it's a shared performance everyone present knows how to read.`,
        question: `When someone offers you something and you'd actually love it, do you accept straight away — or do you politely say "no, no, I couldn't" first? Where did that habit come from?`,
        upgrade: {
            term: `press`,
            type: `verb`,
            def: `To strongly but politely encourage someone to accept, agree, or continue, especially after they first refuse.`,
            in_action: `She pressed me to take more food even after I said I was fine.`,
            review_prompt: `When is it polite to press someone after they refuse once, and when does it become pushy?`
        },
        deeper: {
            text: `Rituals like this can look inefficient — why not just say what you mean? — but they're doing real social work. The back-and-forth gives everyone a graceful way to be generous and humble at once: the host insists, the guest resists, and both come away having shown respect. It also protects people from awkward corners. A guest who's genuinely not hungry can decline without insulting the food; a host short on money can offer without losing face if the offer is politely refused. The danger comes when two systems meet. Someone from a more literal culture hears "no thank you" and stops offering, unaware a second push was expected. Someone raised inside the ritual can find blunt cultures oddly cold — where's the warmth, the insistence, the care? Neither is rude; they're simply reading the same words through completely different rules about what politeness requires.`,
            questions: [
                `In your culture, is there a "polite refusal" that isn't really a refusal? How do people know the difference?`,
                `Have you ever misread someone by taking their politeness too literally, or not literally enough?`,
                `Do you find these small rituals warm and respectful, or would you rather people just said what they meant?`
            ]
        }
    },
    {
        id: `cl-taboo-words`,
        location: `Across languages`,
        title: `The Worst Thing You Can Say`,
        teaser: `What a language forbids reveals what it holds sacred.`,
        insight: `Every language has words you don't say — but which words carry the real shock changes dramatically from place to place. In some cultures the strongest taboos are religious, and blasphemy is the worst offence; in others they're bodily; in some the deepest insults reach for your family or your mother; and in a few, remarkably, the harshest swear words are drawn from serious illnesses. A word that would end a friendship in one language can be almost harmless in another. The human meaning underneath: what a culture makes unspeakable is a kind of map of what it holds most sacred or most fragile — and stepping on the wrong taboo, even innocently, can cause real damage a dictionary would never warn you about.`,
        question: `In the languages or communities you know, what kind of word carries the real shock — religion, the body, family, something else? Has a word that's mild to you ever landed much harder for someone else?`,
        upgrade: {
            term: `off-limits`,
            type: `adjective`,
            def: `Not allowed to be talked about, touched, or done.`,
            in_action: `Politics is completely off-limits at our family dinners — everyone learned that the hard way.`,
            review_prompt: `What topics or words are off-limits in a setting you know well, and why those ones?`
        },
        deeper: {
            text: `The fascinating thing about taboo language is how badly it survives translation. Learners often reach a stage where they know a language's forbidden words but not their real weight — so they either drop a serious insult thinking it's mild, or flinch at something locals treat as everyday. The strength of a taboo word rarely matches its literal meaning; it comes from history, religion, and social fear layered onto the sound over centuries. This is also why swearing in a second language can feel strangely weightless: the words don't carry the childhood charge they do for native speakers, so they slip out more easily and land less heavily on the person saying them. It cuts the other way too — a phrase loaded with a lifetime of meaning for you might come out of a foreigner's mouth with no idea of the wound it opens. Knowing which words are truly dangerous is one of the last things a language teaches you.`,
            questions: [
                `Why do you think illness, religion, or family end up as the source of the strongest words in different places?`,
                `Does swearing in a second language feel lighter to you than in your first — and why might that be?`,
                `Have you ever seen someone cause real offence with a word they didn't realise was serious?`
            ]
        }
    },
    {
        id: `cl-finland`,
        location: `Finland`,
        title: `When Silence Isn't Awkward`,
        teaser: `A quiet pause can mean thought, trust, or comfort — not that the conversation has failed.`,
        insight: `In many Finnish social settings, a silence in conversation is read very differently than in cultures where every gap must be filled. Speaking only when you have something worth saying can feel more honest than keeping the words flowing, and a pause is often taken as thinking, comfort, or ease rather than a sign something's gone wrong. For someone from a talk-to-connect culture, that quiet can feel like disapproval or a conversation dying — when to the other person it may be one of the most relaxed parts of the exchange. The human meaning underneath: silence isn't the opposite of communication; in some places it's one of its warmest forms, a sign you're comfortable enough not to perform.`,
        question: `When a conversation suddenly goes quiet, do you rush to fill the gap or let it sit? And does it depend on who you're with?`,
        upgrade: {
            term: `lull`,
            type: `noun`,
            def: `A quiet pause in activity or conversation.`,
            in_action: `There was a lull, but nobody felt the need to fill it — it was actually nice.`,
            review_prompt: `With which people does a lull in conversation feel easy rather than uncomfortable?`
        },
        deeper: {
            text: `In many communication cultures, a silence feels like a problem to be solved — a signal that someone's bored, upset, or that the exchange has failed. That instinct is much weaker in some cultures, where pausing before answering reads as taking the question seriously rather than struggling with it. The gap between these habits causes real friction. A person who pauses to think may be giving you their full consideration, but a talk-to-fill listener can read the quiet as coldness and rush in to rescue it — accidentally talking over the very thought they were waiting for. Meanwhile someone who chatters through every silence can come across, to a quieter culture, as nervous or not really listening. What's striking is how physical the discomfort is: for people raised to fill silence, a long pause can feel almost unbearable, a pressure to say anything at all. Learning to sit inside a silence comfortably is, for many, a genuinely new skill.`,
            questions: [
                `Do you think people who speak less are usually seen as thoughtful, shy, or cold — and is that fair?`,
                `Have you ever felt real pressure to talk just to end a silence, with nothing actually to say?`,
                `Is there someone you can be quiet with for a long time and still feel completely at ease?`
            ]
        }
    },
    {
        id: `cl-germany`,
        location: `Germany`,
        title: `When Bluntness Is Kindness`,
        teaser: `Softening a message too much can read as respecting someone less, not more.`,
        insight: `In many German settings, direct feedback is often seen as a form of respect. Saying plainly what isn't working avoids mixed signals and hidden meanings, and carries a quiet assumption: that the other person is capable enough to hear the truth without it being wrapped in cushioning. To someone from a culture that softens hard messages, this can sound harsh or even rude. But the intention is frequently the opposite — clarity offered as a courtesy, on the belief that leaving someone guessing does them no favours. The human meaning underneath: what counts as "kind" in communication isn't universal; in some places kindness means protecting feelings, and in others it means respecting someone enough to be straight with them.`,
        question: `If your idea had a real flaw everyone could see, would you rather someone told you plainly on the spot, mentioned it gently later, or said nothing unless you asked?`,
        upgrade: {
            term: `home truth`,
            type: `noun phrase`,
            def: `An honest and often uncomfortable fact about yourself that someone tells you directly.`,
            in_action: `Nobody enjoys a home truth, but she told me one that day that I really needed to hear.`,
            review_prompt: `When has a home truth actually helped you, even if it stung at the time?`
        },
        deeper: {
            text: `One reason directness is valued in some cultures is a belief that vagueness quietly damages trust. If your work has real problems and a colleague only hints at them, you're left without what you need to fix things — and you may feel misled later when the consequences land. Seen that way, plain speaking is a gift, not an attack. But directness has a failure mode too: without any warmth or context, the same honest message can wound, especially across styles where the tone of a relationship matters as much as the content. The useful distinction is between being direct — willing to say the thing clearly — and being blunt, which is about how coldly it's delivered. Plenty of skilled communicators manage both at once: honest about the problem, warm about the person. The trouble usually starts when someone assumes their own culture's setting is simply "normal," and reads a gentler or a plainer style as a character flaw rather than a different rule.`,
            questions: [
                `Think of feedback that genuinely helped you — was it delivered gently, plainly, or somewhere in between?`,
                `Is it harder for you to give an honest hard message, or to receive one without getting defensive?`,
                `Where's the line, for you, between someone being refreshingly direct and just being rude?`
            ]
        }
    },
    {
        id: `cl-imperial-china`,
        location: `Imperial China`,
        title: `Saying It Without Saying It`,
        teaser: `When speaking plainly was dangerous, meaning learned to travel in disguise.`,
        insight: `In imperial China, officials who couldn't safely criticise a ruler directly sometimes did it sideways — through a poem, a historical example, a story about a long-dead emperor that everyone understood was really about the present one. The surface stayed innocent; the real message reached those who knew how to listen. This wasn't only caution — it was a refined skill, letting dangerous ideas circulate while giving the speaker a layer of deniability if challenged. The human meaning underneath: when it's costly to say something outright, people don't go silent — expression gets cleverer, folding the real meaning inside something safer and trusting the listener to unwrap it.`,
        question: `Have you ever needed to get a real message across without stating it outright — wrapping it in a joke, a story, or a "hypothetical"? Did the other person catch what you meant?`,
        upgrade: {
            term: `dress up`,
            type: `phrasal verb`,
            def: `To present something in a way that makes it look different, nicer, or more acceptable than it is.`,
            in_action: `He dressed the complaint up as friendly advice, but we all knew what he meant.`,
            review_prompt: `When might someone dress up a criticism as something softer — and does it usually work?`
        },
        deeper: {
            text: `Hiding a serious message inside a safe form is far from a purely historical trick — it's alive wherever speaking plainly carries a cost. Political satire, fables, and sharp comedy all run on the same engine: the innocent surface protects the speaker while the real point reaches anyone paying attention. Part of the power is that the audience completes the meaning themselves, which can make it land harder than a blunt statement would. The same move fills ordinary life — the pointed "asking for a friend," the story that's obviously not about anyone in particular, the example chosen a little too perfectly to match a recent situation. Reading this kind of communication takes a different sort of attention: listening not just to what was said, but to what was chosen, and what was carefully left out. And it carries a built-in escape hatch — if challenged, the speaker can always retreat to the innocent surface: "I was only telling a story." That deniability is exactly what makes indirect speech so useful, and sometimes so slippery.`,
            questions: [
                `Can you think of a film, book, or comedian that carries a serious message under a light surface?`,
                `Is indirect criticism usually kinder than direct criticism, or just harder to challenge?`,
                `Have you received a "general observation" you were sure was really aimed at you? How did you respond?`
            ]
        }
    },
    {
        id: `cl-france`,
        location: `France`,
        title: `Arguing for the Pleasure of It`,
        teaser: `A heated debate over dinner can be the evening's entertainment, not its ruin.`,
        insight: `In many French social settings, lively disagreement is treated as a pleasure rather than a warning sign. People may challenge each other hard over dinner — really pushing on an idea — and then carry on the evening as though nothing happened, because nothing has: for them, the clash was the fun. Taking someone's argument seriously enough to challenge it can be a form of respect, resting on the assumption that a strong disagreement won't damage the relationship. To someone from a harmony-first culture, the same exchange can feel like a genuine fight breaking out. The human meaning underneath: in some places, disagreement isn't a threat to connection — it's one of the ways people enjoy each other's company.`,
        question: `If a dinner turned into a proper debate, with people strongly challenging each other's views, would you dive in and enjoy it, go quiet, or try to steer everyone to calmer ground?`,
        upgrade: {
            term: `push back`,
            type: `phrasal verb`,
            def: `To express disagreement or resistance to an idea rather than simply accepting it.`,
            in_action: `She pushed back hard on my point, and honestly the conversation was better for it.`,
            review_prompt: `In what kind of conversation do you feel free to push back, and when do you hold it in?`
        },
        deeper: {
            text: `One reason this pattern may exist is a long tradition of treating the exchange of ideas as valuable in itself, apart from whether anyone "wins." In that frame, challenging your position isn't hostility — it's a compliment, a sign you're being taken seriously. The whole thing rests on a shared confidence that the relationship can absorb the disagreement without cracking. That assumption is exactly what clashes with cultures where open disagreement reads as a threat to harmony or a sign something has gone wrong. What one person experiences as a stimulating debate, another can feel as an uncomfortable confrontation — even when the topic is completely impersonal, like a film or a policy neither of them will ever be affected by. The friction is rarely about the subject; it's about two different beliefs over what disagreement means. Is pushing back an act of engagement, or an act of aggression? Whole conversations can go wrong on that single hidden question.`,
            questions: [
                `Think of the last time you disagreed with someone out loud — did you say it plainly, soften it, or hold back?`,
                `Is there a topic or setting where you genuinely enjoy debating, and one where you'd rather keep the peace?`,
                `Have you had a heated conversation that ended completely fine — where both of you just moved on?`
            ]
        }
    },
    {
        id: `cl-backchannel`,
        location: `Japan · listening signals`,
        title: `The Sounds That Mean "I'm Listening"`,
        teaser: `In some places, silence while you listen is the rude part.`,
        insight: `While someone is speaking, listeners in many Japanese conversations produce a steady stream of small sounds and words — a soft "hai," "ee," "sou desu ne" — a practice sometimes called aizuchi. These aren't interruptions or attempts to take the floor; they're signals meaning "I'm with you, keep going." A listener who stays completely silent can seem cold or even disengaged. Yet in other cultures the same frequent sounds read as impatience, as if the listener is rushing the speaker along. The human meaning underneath: even listening — the quiet half of a conversation — follows unwritten rules, and what counts as good listening in one culture can read as rude in another, with neither person aware they're playing by different scripts.`,
        question: `When you're really listening to someone, do you stay quiet and still, or do you nod and make little sounds along the way? Does a silent listener make you wonder if they're even interested?`,
        upgrade: {
            term: `attentive`,
            type: `adjective`,
            def: `Paying close attention and showing that you're really listening or watching.`,
            in_action: `He's such an attentive listener — you can tell he's actually taking in every word.`,
            review_prompt: `What does an attentive listener do, in your experience, that a distracted one doesn't?`
        },
        deeper: {
            text: `We tend to think of listening as simply not talking, but it turns out to be an active performance with its own regional accents. In some cultures, showing you're listening means staying quiet and letting the speaker have the floor completely; in others, it means constantly feeding back small signals of attention. When these habits meet, both people can walk away misjudging each other. A quiet listener can seem, to a signal-heavy speaker, strangely blank — bored, offended, not following? A listener who makes frequent encouraging sounds can strike a quieter speaker as impatient, or as hurrying them to the point. There's a modern version of this online, where a video call strips out many of these cues and leaves everyone slightly unsure whether they're being heard at all — hence the exaggerated nodding and the "mm-hmm"s people add to fill the gap. Underneath it all is a simple truth: being a good listener isn't just about attention, but about showing attention in the way the other person expects to see it.`,
            questions: [
                `How do you show someone you're listening — and have you ever felt unsure whether someone was listening to you?`,
                `Does a listener who makes lots of little sounds seem warm to you, or a bit impatient?`,
                `Why do you think being properly listened to feels so good — and so rare?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-how-words-land`,
        title: `How Words Land`,
        desc: `The line you can't forget, the "fine" that meant the opposite, the reply you thought of too late — the small moments where a few words hit hard.`,
        icon: `react`,
        moments: [
            {
                id: `moment-overthought-text`,
                preview: `Type, delete, retype, delete again.`,
                text: `You start a simple message, then delete it. Rewrite it. Soften it, sharpen it, add a word, cut the word. Ten minutes later you finally send three lines that took the effort of an essay. What kind of message turns you into this — and who is it usually going to?`,
                upgrade: {
                    term: `agonise over`,
                    type: `verb phrase`,
                    def: `To spend a lot of worried effort on something small, especially getting the wording exactly right.`,
                    in_action: `I agonised over that text for half an hour — it was two sentences.`,
                    review_prompt: `What's the last message you agonised over? What made it so hard to word?`
                }
            },
            {
                id: `moment-fine-not-fine`,
                preview: `One word, the exact opposite of what it says.`,
                text: `Someone answers "fine" — but the tone, the pause, or the look tells you it's the last thing they are. When you catch that gap between the word and what's behind it, do you go with the word, gently push, or back off?`,
                upgrade: {
                    term: `take something at face value`,
                    type: `idiom`,
                    def: `To accept what someone says exactly as it sounds, without looking for a hidden meaning.`,
                    in_action: `I took his "no problem" at face value, but he'd clearly minded a lot.`,
                    review_prompt: `When is it safer to take words at face value, and when do you look past them?`
                }
            },
            {
                id: `moment-line-you-remember`,
                preview: `Years later, you can still hear it.`,
                text: `Most of what people say to us fades within a day. But one sentence — a kind one or a cruel one — can stay word-for-word for years. Think of a line someone once said to you that never quite left. What was it, and why has that one lasted?`,
                upgrade: {
                    term: `hit home`,
                    type: `idiom`,
                    def: `(Of words) to affect you strongly because they feel true or personal.`,
                    in_action: `I laughed it off, but that comment about me always running late really hit home.`,
                    review_prompt: `What's something someone said that hit home — and did they mean it to?`
                }
            },
            {
                id: `moment-compliment-that-stung`,
                preview: `It sounded nice. It didn't feel nice.`,
                text: `"You look so much better than usual." "That's brave of you to wear." Some compliments arrive with a sting hidden inside them — praise on the surface, something sharper underneath. Have you been handed one of these? Did you smile and take it, or catch what was really going on?`,
                upgrade: {
                    term: `backhanded compliment`,
                    type: `noun phrase`,
                    def: `A remark that sounds like praise but carries a hidden insult.`,
                    in_action: `"You're smart for someone who left school at sixteen" — classic backhanded compliment.`,
                    review_prompt: `What's the most memorable backhanded compliment you've heard — and did the person know they'd done it?`
                }
            },
            {
                id: `moment-the-late-comeback`,
                preview: `The perfect reply — arriving an hour late.`,
                text: `Someone says something that catches you off guard, and you freeze or mumble. Then, on the walk home or lying in bed, the perfect reply arrives — sharp, funny, exactly right, and completely useless now. Does this happen to you, or are you someone who can fire back in the moment?`,
                upgrade: {
                    term: `quick-witted`,
                    type: `adjective`,
                    def: `Able to think and respond fast, often in a clever or funny way.`,
                    in_action: `I'm hopeless in arguments — my sister's the quick-witted one who always has a comeback ready.`,
                    review_prompt: `Who's the most quick-witted person you know? What do they do that you can't?`
                }
            }
        ],
        makeItReal: {
            title: `The words that landed harder than you meant`,
            prompt: `Think of something you once said to someone that landed much harder than you expected — a throwaway line that delighted them, or one you'd give anything to take back. What happened afterwards, and what did it teach you about the weight a few words can carry?`
        }
    },
    {
        id: `set-the-way-you-say-it`,
        title: `The Way You Say It`,
        desc: `Softening or saying it straight, the apology that works, reading what's unsaid, and who you become in another language.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-straight-or-softened`,
                preview: `Straight to the point, or gently wrapped?`,
                text: `You've got something awkward to tell someone — a no, a criticism, a hard truth. Some people just say it plainly; others cushion it in so much padding the point almost disappears. When it's your turn, which way do you lean — and does it change depending on who's in front of you?`,
                upgrade: {
                    term: `sugar-coat`,
                    type: `verb`,
                    def: `To make bad or unwelcome news sound nicer or gentler than it really is.`,
                    in_action: `Don't sugar-coat it — just tell me if the plan didn't work.`,
                    review_prompt: `When does sugar-coating actually help, and when does it just get in the way?`
                }
            },
            {
                id: `moment-too-much-too-little`,
                preview: `Three paragraphs, or three words?`,
                text: `Some people send you an essay when a single line would do; others reply with one word when you were hoping for a proper answer. Both can leave the other person a bit lost. Which mistake do you catch yourself making more often — saying far too much, or far too little?`,
                upgrade: {
                    term: `ramble on`,
                    type: `phrasal verb`,
                    def: `To keep talking for a long time in a way that loses the point or the listener.`,
                    in_action: `Sorry, I'm rambling on — the short version is I can't make it Friday.`,
                    review_prompt: `When do you tend to ramble on — nerves, excitement, or dodging a straight answer?`
                }
            },
            {
                id: `moment-apology-that-works`,
                preview: `Some sorries fix things. Some make them worse.`,
                text: `We've all been on the end of an apology that made everything worse — "I'm sorry you feel that way," or a "sorry" so quick it clearly meant nothing. And we've had the rare one that sounded honest enough to shift the conversation. What do you think separates an apology that truly lands from one that just checks a box?`,
                upgrade: {
                    term: `empty words`,
                    type: `noun phrase`,
                    def: `Words that sound right but feel meaningless because they are not sincere or not backed up.`,
                    in_action: `His apology felt like empty words — he said sorry, but it seemed like he just wanted the issue gone.`,
                    review_prompt: `What makes an apology feel like empty words instead of something real?`
                }
            },
            {
                id: `moment-the-unsaid`,
                preview: `Nobody said it. Everybody knew it.`,
                text: `When you walk into a room and can feel something's off before anyone's said a word — the tension, the real reason, the thing everyone understands but no one states out loud — how do you usually work out what's really going on?`,
                upgrade: {
                    term: `pick up on`,
                    type: `phrasal verb`,
                    def: `To notice something that isn't said directly, like a mood, a hint, or a change.`,
                    in_action: `She never complained, but I picked up on the fact that she was upset.`,
                    review_prompt: `Are you quick to pick up on what's unsaid, or do you need people to say things outright?`
                }
            },
            {
                id: `moment-you-in-another-language`,
                preview: `A slightly different you, in another tongue.`,
                text: `People often say they feel like a slightly different person in another language — funnier in one, blunter in another, shyer or more polite. If you speak more than one, or even just switch between formal and casual, what changes about the version of you that shows up when the language changes?`,
                upgrade: {
                    term: `come across`,
                    type: `phrasal verb`,
                    def: `To give a particular impression to others through how you speak or act.`,
                    in_action: `In English I come across as quite direct, but in my own language I'm much gentler.`,
                    review_prompt: `How do you come across differently in another language or a more formal setting?`
                }
            }
        ],
        makeItReal: {
            title: `The message you got exactly right`,
            prompt: `Think of a time when how you said something mattered as much as what you said — a message, a conversation, or a piece of news you handled just right, or one you'd word completely differently if you had the chance again. What were you trying to do with your words, and did they do it?`
        }
    },
    {
        id: `set-what-words-carry`,
        title: `What Words Carry`,
        desc: `Words that change things the moment they're said, being truly listened to, the language you wish you had, and finding the words for what matters.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-words-that-do-things`,
                preview: `Some sentences don't describe — they do.`,
                text: `A few words can change the world the instant they're spoken. "You're hired." "It's over." "I forgive you." "I do." "Not guilty." Nothing physical happens, yet everything is different the moment they land. What's a sentence you've either said or heard that changed something the second it was spoken?`,
                upgrade: {
                    term: `make it official`,
                    type: `verb phrase`,
                    def: `To make a decision, agreement, relationship, or change recognised as real or settled.`,
                    in_action: `They'd been together for years, but saying "I do" made it official.`,
                    review_prompt: `What words can make something official — "I do," "you're hired," "it's over," or something else?`
                }
            },
            {
                id: `moment-no-word-for-it`,
                preview: `The word your language has, and English doesn't.`,
                text: `Every language has a word or two that says something no other language can quite manage in one go — a very specific feeling, a kind of person, a passing moment. Is there a word like that in a language you know? What does it mean, and what does it tell you that English needs a whole sentence to explain?`,
                upgrade: {
                    term: `capture`,
                    type: `verb`,
                    def: `To express a feeling or idea exactly and completely in words.`,
                    in_action: `There's no English word that quite captures it — the closest is "cosy," but it's more than that.`,
                    review_prompt: `What feeling do you wish English had a single word to capture?`
                }
            },
            {
                id: `moment-actually-listened-to`,
                preview: `Being actually listened to. You notice.`,
                text: `There's a real difference between someone who's listening to you and someone who's just waiting for their turn to talk. When you're with the first kind — someone who genuinely takes in what you say — you can feel it. What does a person like that do differently, and how does it change what you're willing to say?`,
                upgrade: {
                    term: `hear someone out`,
                    type: `phrasal verb`,
                    def: `To listen to everything someone has to say before responding or judging.`,
                    in_action: `I know you disagree, but just hear me out before you say no.`,
                    review_prompt: `Who in your life really hears you out? What do they do that most people don't?`
                }
            },
            {
                id: `moment-what-they-call-you`,
                preview: `What they call you says a lot.`,
                text: `The name someone uses for you carries more than it seems — your full name when you're in trouble, a nickname only old friends use, a title that keeps its distance, the pet name that means you're close. Has what someone called you ever quietly changed how the whole relationship felt?`,
                upgrade: {
                    term: `go by`,
                    type: `phrasal verb`,
                    def: `To use a particular name, often not your official or full one.`,
                    in_action: `His name's Robert, but he's gone by Bertie since he was a kid.`,
                    review_prompt: `What name do you go by with different people — and does it shift who you are with them?`
                }
            },
            {
                id: `moment-finally-said-it`,
                preview: `The thing you carried, finally spoken.`,
                text: `Sometimes you hold something in for a long time — a thank you, an apology, a truth, an "I've had enough" — and then one day it finally comes out. Whatever the reaction, saying it changes something. Is there a moment like that you can think of, when you finally put into words the thing you'd been carrying?`,
                upgrade: {
                    term: `get something off your chest`,
                    type: `idiom`,
                    def: `To finally say something that's been worrying you, so you feel lighter afterwards.`,
                    in_action: `I'd been meaning to tell her for months — it was such a relief to finally get it off my chest.`,
                    review_prompt: `What's something people often need to get off their chest — and why is it so hard to start?`
                }
            }
        ],
        makeItReal: {
            title: `The time you felt truly heard`,
            prompt: `Think of a moment when you felt genuinely understood — someone who really got what you meant, not just the words you used — or a time you finally found the right language for something that mattered. Tell the story of what it was like to be properly heard.`
        }
    }
];
