/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Body Language & Emotions
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring how posture, expression,
  eye contact, distance, and small physical signals shape what people notice,
  assume, and check with care.
  Built for live lessons, thoughtful discussion, and sharper social awareness
  around body language, emotion, and human communication.
  Subject content may change.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'body-language-emotions',
    schemaVersion: 1,
    contentVersion: '1.0.0',
    title: 'Body Language & Emotions',
    titleHtml: 'Body Language<br>&amp; <em>Emotions</em>',
    navTitle: 'Body Language',
    bgImage: 'https://img.magnific.com/premium-vector/abstract-background-with-colorful-swirls-vector-illustration-eps-10_707339-1785.jpg'
};

/* TEMP BODY LANGUAGE COVER VISUAL OVERRIDE
   Original subject crop override.
   Delete when Compass supports proper per-subject visual config. */
(function () {
    const style = document.createElement('style');

    style.id = 'body-language-cover-visual-override';

    style.textContent = `
        /* Body Language & Emotions — subject visual override only */
        .cover-bg {
            inset: -8%;
            transform: scale(1.08);
            transform-origin: center center;
        }

        @media (max-width: 680px) {
            .cover-bg {
                inset: -14% -8%;
                transform: translateY(2.8%) scale(1.08);
                transform-origin: center center;
            }

            html[data-theme="night"] .cover-bg {
                transform: translateY(-2.8%) scale(1.08);
            }
        }
    `;

    document.head.appendChild(style);
})();

const subjectCopy = {
    cover: {
        hook: `How posture, expression, eye contact, distance, and small physical signals shape what people notice, assume, and check with care.`
    },
    overview: {
        heading: `What the body may suggest before words arrive`,
        intro: [
            `Communication does not only happen through words. Posture, facial expression, eye contact, gestures, tone, movement, and physical distance can all shape how a message feels before anyone explains it directly.`,
            `In this subject, you’ll explore real-life moments where body language shapes first impressions, emotional understanding, careful interpretation, and the way people carry themselves in social, personal, and professional situations.`
        ]
    },
    paths: {
        culturalLensDescription: `Explore how body-language expectations can change across cultures — and how the same gesture, stillness, gaze, posture, or physical habit can feel respectful in one setting and completely misleading in another.`,
        discussionDescription: `Work through real-life moments where emotions may appear through posture, expression, silence, tension, movement, and tiny signals people often send before they fully explain themselves.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Closing reflection — revisit what body language suggested and carry sharper social awareness forward`
    },
    culturalLens: {
        heading: `Body-language signals that can easily mislead us`,
        intro: `Body language may feel instinctive, but culture, history, etiquette, and social expectation shape it in very different ways. A gesture that seems friendly, confident, harmless, or honest in one place can suggest confusion, disrespect, nervousness, warmth, aggression, or humility somewhere else. These examples explore how easily people can misread the body when they assume everyone is using the same silent rules.`
    },
    discussion: {
        heading: `Signals before words`,
        intro: `These moments explore how posture, expression, eye contact, movement, stillness, and physical presence shape first impressions, emotional understanding, and the way people carry themselves. As the discussion develops, you’ll move from quick social reads into careful interpretation, then into personal questions about presence, habits, confidence, language, and self-awareness. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `You’ve explored how posture, expression, eye contact, stillness, gesture, distance, and physical presence can shape first impressions, emotional understanding, and the way people carry themselves. This lesson is not about decoding people perfectly or treating body language as proof. It is about noticing signals with care, checking assumptions with humility, and becoming more aware of how your own body language can affect connection, confidence, and communication.`,
        questions: [
            `Looking back at the cultural examples today, which body-language expectation surprised you most — and what assumption might you have made if you saw that behaviour in real life without knowing the cultural context?`,
            `Which Upgrade word or phrase from today helps you describe body language, presence, or emotional signals more clearly without pretending you know exactly what someone is thinking?`,
            `Think of a real moment when someone’s body language shaped your impression of them — or when your body language may have shaped someone’s impression of you. What did you notice, what did you assume, and how could that interpretation be checked carefully?`
        ]
    },
    keyLanguage: {
        intro: `Higher-level expressions for discussing body language, emotion, and social signals — with definitions and natural in-action examples.`
    }
};

const clCards = [
    {
        id: `cl-bulgaria-nod`,
        location: `Bulgaria`,
        title: `When nodding means “no”`,
        teaser: `The movement that feels like agreement may send the opposite message.`,
        insight: `In Bulgaria, head movements can sometimes work differently from what many visitors expect. A nod may signal disagreement, while a shake of the head may signal agreement. For someone from a different background, this can make even a simple conversation feel uncertain. The words may sound clear, but the body seems to be giving a different signal.`,
        question: `If someone’s words said one thing but their head movement seemed to say the opposite, would you trust the words, the gesture, or ask again to be sure?`,
        upgrade: {
            term: `gesture mismatch`,
            type: `noun phrase`,
            def: `A moment when a physical signal seems to contradict the spoken message, creating confusion about what someone means.`,
            in_action: `I think the whole misunderstanding came from a gesture mismatch — his words sounded positive, but his head movement seemed to suggest the opposite.`,
            review_prompt: `If someone's words and head movement seem to disagree, what could you do to check what they mean?`
        },
        deeper: {
            text: `Body language often feels natural because we learn it so early that we forget it is learned at all. A gesture like nodding can feel almost universal until we meet a context where it may mean something different. This creates a special kind of confusion because the body often feels faster and more instinctive than words. Even when someone explains the rule, it can still take time to adjust your automatic reactions. The deeper lesson is that non-verbal communication is not a simple shared human code. It is partly instinctive, partly cultural, and partly social training. That is why careful communication sometimes means slowing down, checking again, and accepting that your first interpretation may not be the safest one.`,
            questions: [
                `Have you ever misunderstood someone because their body language seemed to say something different from their words?`,
                `Would you find it harder to change a spoken habit or a body-language habit?`,
                `In your own culture, what gesture feels so natural that you rarely think about it?`
            ]
        }
    },
    {
        id: `cl-japan-mouth-covering`,
        location: `Japan`,
        title: `Hiding laughter behind the hand`,
        teaser: `A small gesture can show modesty, politeness, or social awareness.`,
        insight: `In some Japanese social contexts, covering the mouth while laughing has traditionally been connected with modesty, especially in feminine etiquette. The gesture can soften the expression and make laughter feel more controlled or polite. To an outsider, it may look shy or self-conscious, but in context it can be a learned way of managing public expression.`,
        question: `If everyone around you covered their mouth while laughing, do you think you would copy the gesture naturally, or forget it as soon as something was genuinely funny?`,
        upgrade: {
            term: `social modesty`,
            type: `noun phrase`,
            def: `A way of managing your behaviour or expression so that you do not seem too loud, bold, or attention-seeking in a social setting.`,
            in_action: `Covering her mouth when she laughed seemed like social modesty — she was enjoying the moment, but still controlling how much she showed.`,
            review_prompt: `When might someone show enjoyment quietly because of social modesty?`
        },
        deeper: {
            text: `Laughter is emotional, but the way people show laughter is shaped by social rules. In some contexts, open laughter can feel warm and natural; in others, it may feel too exposed, loud, uncontrolled, or attention-seeking. Gestures like covering the mouth show how the body can balance feeling and etiquette at the same time. This does not mean the emotion is fake, or that every person follows the same habit. It means people often learn socially acceptable ways to let emotion appear in public. The body becomes a kind of filter: the feeling is real, but the display is shaped by ideas about modesty, gender, politeness, and social awareness. Across cultures, many emotions are not simply released — they are softened, framed, managed, or made appropriate before others see them.`,
            questions: [
                `Do you think people in your culture usually laugh freely, quietly, or differently depending on the setting?`,
                `Have you ever controlled your face or body because you did not want to show too much emotion?`,
                `When does emotional restraint feel polite, and when does it feel unnatural?`
            ]
        }
    },
    {
        id: `cl-finland-composure`,
        location: `Finland`,
        title: `Stillness can show calm attention`,
        teaser: `A quiet body does not always mean boredom, distance, or discomfort.`,
        insight: `In Finland, communication can sometimes include more physical stillness and restrained body language than visitors from more expressive settings expect. A person may listen calmly, pause before responding, and avoid dramatic facial reactions without being cold or uninterested. What looks emotionally muted to one person may simply be quiet attention or social composure in another context.`,
        question: `If someone listened with very little facial expression or movement, would you read them as calm, bored, thoughtful, or hard to understand?`,
        upgrade: {
            term: `quiet composure`,
            type: `noun phrase`,
            def: `A calm, controlled physical presence that shows little visible emotion but may still suggest attention or self-control.`,
            in_action: `At first I thought he was uninterested, but it was more like quiet composure — he was listening carefully without showing much on his face.`,
            review_prompt: `A calm face could mean several things. What might quiet composure suggest, and what might it not?`
        },
        deeper: {
            text: `Some communication styles use the body expressively: nodding often, reacting visibly, leaning forward, smiling quickly, and showing emotion through the face. Other styles may value restraint, stillness, and careful control. This can create misunderstanding because many people judge interest through visible reaction. A still listener may seem distant to someone who expects constant feedback, while an expressive listener may seem overly intense to someone who values calmness. The important point is that a quiet body is not automatically an empty signal. It may suggest boredom, but it may also suggest attention, respect, thoughtfulness, or simple self-control. The best response is often to stay curious rather than assume too quickly.`,
            questions: [
                `Do you usually need visible reactions from someone to feel that they are listening?`,
                `Have you ever misread a calm person as cold, bored, or uninterested?`,
                `In your culture, is emotional control usually admired, mistrusted, or something in between?`
            ]
        }
    },
    {
        id: `cl-greece-open-palm`,
        location: `Greece`,
        title: `The open palm that can insult`,
        teaser: `A harmless-looking gesture can carry a much heavier history.`,
        insight: `In Greece, showing an open palm outward towards someone can be interpreted as insulting in some contexts. To outsiders, the gesture may look like a normal wave, stop signal, or casual movement. But because gestures can carry historical and cultural meaning, the same hand position can feel far more aggressive or disrespectful than intended.`,
        question: `If you discovered that one of your normal hand gestures could offend people in another country, how quickly do you think you could stop using it?`,
        upgrade: {
            term: `gesture taboo`,
            type: `noun phrase`,
            def: `A physical gesture that is considered rude, offensive, or inappropriate within a particular culture or social setting.`,
            in_action: `I had no idea it was a gesture taboo there — I thought I was just using my hand normally.`,
            review_prompt: `How could a traveller find out whether a normal gesture is a taboo somewhere else?`
        },
        deeper: {
            text: `Gestures are especially risky because people often use them without thinking. Words can be chosen slowly, but hands move quickly, automatically, and sometimes before we notice them. A gesture may also feel harmless because it has no strong meaning in your own culture. This makes cross-cultural body language difficult: the speaker may have no bad intention, while the listener still receives a strong negative signal. The Greek example is not just about one hand position; it shows how gestures can carry memory, history, insult, and social force. A movement that looks like a casual wave to one person may feel like a deliberate offence to another. The important point is not to become afraid of every movement, but to stay curious and humble. When a small gesture creates a big reaction, it usually means there is a cultural story behind it.`,
            questions: [
                `Have you ever accidentally used a gesture, expression, or tone that was taken the wrong way?`,
                `Is it fair to judge someone harshly if they offend people with a gesture they did not understand?`,
                `Which is easier to forgive: rude words, rude tone, or rude body language?`
            ]
        }
    },
    {
        id: `cl-thailand-head-touching`,
        location: `Thailand`,
        title: `Why touching the head can feel disrespectful`,
        teaser: `Affection in one place can cross a serious boundary in another.`,
        insight: `In Thailand, the head is often treated as the most important or sacred part of the body. Because of this, touching someone’s head — even playfully or affectionately — can feel disrespectful, especially outside close family contexts. A gesture that might seem warm in one place can feel intrusive or inappropriate in another.`,
        question: `Have you ever been surprised to learn that something innocent in one culture could feel rude or disrespectful in another?`,
        upgrade: {
            term: `personal boundary`,
            type: `noun phrase`,
            def: `A physical, emotional, or social limit that shows what kind of behaviour feels acceptable around a person.`,
            in_action: `I thought I was being friendly, but I crossed a personal boundary by touching his head without realising how serious that gesture could feel.`,
            review_prompt: `What kind of friendly action in one place might cross a personal boundary somewhere else?`
        },
        deeper: {
            text: `Physical contact is never just physical. It carries ideas about respect, closeness, hierarchy, age, gender, religion, and relationship. A friendly touch on the arm, shoulder, back, or head can mean warmth in one situation and disrespect in another. These rules are often invisible until someone breaks them. What makes this especially sensitive is that touch involves the body directly, so people may react emotionally before they explain why. Learning these boundaries is not about memorising a list of rules. It is about noticing how different cultures protect personal dignity through the body. It also means accepting that good intentions do not always cancel out physical discomfort. Sometimes the respectful move is not to explain what you meant, but to notice the boundary and step back.`,
            questions: [
                `Are people in your culture generally comfortable with casual touch, or more physically reserved?`,
                `Is there a part of the body that people should be especially careful about touching?`,
                `How would you respond if someone crossed a physical boundary but clearly meant no harm?`
            ]
        }
    },
    {
        id: `cl-eye-contact-expectations`,
        location: `Eye contact expectations across cultures`,
        title: `Respect does not always look like eye contact`,
        teaser: `Looking directly at someone can suggest confidence in one setting and disrespect in another.`,
        insight: `Eye contact expectations vary widely across cultures, families, education systems, communities, age groups, authority relationships, and social settings. In some contexts, direct eye contact may suggest confidence, honesty, or attention. In others, it can feel challenging, disrespectful, too bold, or inappropriate — especially when speaking with elders, teachers, authority figures, or people you do not know well.`,
        question: `If eye contact made you seem rude instead of respectful, do you think you would adjust quickly, or keep doing it automatically?`,
        upgrade: {
            term: `gaze norms`,
            type: `noun phrase`,
            def: `The social expectations that shape when, how much, and with whom eye contact feels appropriate.`,
            in_action: `Their gaze norms were different — what I saw as confident eye contact may have felt too direct in that setting.`,
            review_prompt: `How might gaze norms differ between a job interview and a relaxed chat with friends?`
        },
        deeper: {
            text: `Eye contact is often treated as a universal sign of honesty, but that assumption can be misleading. In some settings, looking directly at someone suggests sincerity and confidence. In others, it may feel aggressive, challenging, flirtatious, disrespectful, or simply too intense. This matters in schools, interviews, workplaces, and cross-cultural relationships, where people may judge confidence or character from the wrong signal. A person who looks down may be respectful, thoughtful, nervous, or uncomfortable — not automatically dishonest or disengaged. Understanding gaze norms helps us separate our own expectations from the meaning another person may be working with. It also reminds us that “good communication” is not one fixed behaviour. Sometimes respect means meeting someone’s eyes; sometimes it means knowing when not to.`,
            questions: [
                `In your culture, what does strong eye contact usually suggest?`,
                `Have you ever felt uncomfortable because someone looked at you too directly or not directly enough?`,
                `Do you think people judge confidence too quickly from eye contact?`
            ]
        }
    },
    {
        id: `cl-emotional-display-rules`,
        location: `Emotional display across cultures`,
        title: `When emotion is public — and when it is private`,
        teaser: `Feeling strongly does not always mean showing it strongly.`,
        insight: `Across cultures, people learn different expectations about when emotion should be shown openly and when it should be controlled. In some settings, visible emotion may suggest honesty, warmth, and sincerity. In others, the same display may feel too intense, immature, or inappropriate. A calm face does not always mean a person feels nothing; it may mean they have learned to manage emotion in public.`,
        question: `If someone stayed physically calm while discussing something emotional, would you read that as strength, distance, control, discomfort, or something else?`,
        upgrade: {
            term: `display rules`,
            type: `noun phrase`,
            def: `Social expectations that shape how, when, and how much emotion people show through their face, voice, and body.`,
            in_action: `Their display rules were different — she expected grief to be visible, while he had learned to show emotion quietly and privately.`,
            review_prompt: `How might display rules differ between a quiet office and a lively family gathering?`
        },
        deeper: {
            text: `Emotions are human, but emotional display is shaped by family, culture, gender expectations, social class, age, religion, profession, and setting. Two people can feel the same thing and show it very differently. One person may cry, gesture, speak loudly, or move closer; another may become still, quiet, or physically controlled. This can create painful misunderstandings. A restrained person may be judged as cold or uncaring, while an expressive person may be judged as dramatic or uncontrolled. Display rules matter because they remind us that the body does not simply reveal emotion in a direct, universal way. It also manages emotion according to what feels safe, appropriate, dignified, or expected. Reading emotion carefully means noticing the signal without pretending it proves the whole story.`,
            questions: [
                `In your family or culture, are strong emotions usually shown openly or managed quietly?`,
                `Have you ever been misread because you showed too much emotion — or not enough?`,
                `Do you think emotional control is usually a sign of strength, distance, maturity, or something else?`
            ]
        }
    },
    {
        id: `cl-personal-space`,
        location: `Personal space across cultures`,
        title: `Distance can mean warmth or discomfort`,
        teaser: `How close people stand can completely change the feeling of a conversation.`,
        insight: `Personal space varies widely across cultures, relationships, and situations. In some contexts, standing close can feel warm, friendly, and engaged. In others, it can feel intrusive or uncomfortable. The same distance between two people may suggest connection in one place and pressure in another. This makes physical space one of the easiest non-verbal signals to misread.`,
        question: `If someone stood closer to you than you expected while speaking, would you read it as warmth, confidence, pressure, or lack of awareness?`,
        upgrade: {
            term: `proxemics`,
            type: `noun`,
            def: `The way people use physical distance and space to communicate social meaning.`,
            in_action: `Their proxemics were completely different — he thought standing close showed warmth, but she felt her personal space was being invaded.`,
            review_prompt: `When might standing close feel warm to one person but like pressure to another?`
        },
        deeper: {
            text: `Physical distance can suggest how people understand privacy, confidence, intimacy, authority, and friendliness. In a crowded city, close distance may feel normal. In a more reserved setting, the same closeness may feel intense. Relationships also change the meaning: a friend, colleague, stranger, teacher, or romantic partner may all be allowed different levels of closeness. The difficulty is that people often adjust distance automatically. They step closer, step back, lean in, turn away, or angle their body without saying anything. These small movements can create comfort or discomfort long before the conversation itself becomes clear. Proxemics matters because it shows that space is not empty. It is one of the quiet ways people negotiate trust, pressure, warmth, and respect.`,
            questions: [
                `Do you usually notice when someone is standing too close or too far away?`,
                `Does comfortable distance change for you depending on age, gender, relationship, or setting?`,
                `Have you ever stepped back from someone and then realised they might have noticed?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-first-signals`,
        title: `First Signals`,
        desc: `Start with immediate, recognisable moments where the body seems to say something before anyone explains it in words.`,
        icon: `react`,
        moments: [
            {
                id: `moment-read-room`,
                preview: `The first sweep of a room…`,
                text: `When you walk into a room full of people — a party, a meeting, a class, or a family gathering — what do you notice first? Do you look at people’s faces, posture, energy, distance, or how they are grouped together? What does that first sweep of the room usually tell you?`,
                upgrade: {
                    term: `read the room`,
                    type: `idiom`,
                    def: `To quickly notice the mood, atmosphere, or social dynamic of a situation and adjust your behaviour carefully.`,
                    in_action: `She walked in, read the room quickly, and realised it was better to listen before speaking.`,
                    review_prompt: `When you walk into a room full of people, what tells you the mood?`
                }
            },
            {
                id: `moment-tell-tale-face`,
                preview: `Someone’s face says more than their words…`,
                text: `Think of a time you could tell how someone was feeling even though they said very little — or said the opposite. What did their face, posture, voice, or movement do that gave the feeling away?`,
                upgrade: {
                    term: `tell-tale sign`,
                    type: `noun phrase`,
                    def: `A small detail that reveals something important, often before the person says it directly.`,
                    in_action: `He said he was relaxed, but the tell-tale sign was the way he kept rubbing his hands together.`,
                    review_prompt: `What could be a tell-tale sign that someone feels nervous, without treating it as proof?`
                }
            },
            {
                id: `moment-unclench`,
                preview: `Comfort changes the body…`,
                text: `What does someone look like when they are genuinely comfortable in a conversation? What changes when someone feels uncomfortable, nervous, or unsure? Which signs do you usually notice first?`,
                upgrade: {
                    term: `unclench`,
                    type: `verb`,
                    def: `To relax physically or emotionally after being tense, guarded, or uncomfortable.`,
                    in_action: `As the conversation became warmer, he visibly unclenched — his shoulders dropped, his breathing slowed, and he started speaking more freely.`,
                    review_prompt: `What might you see when someone starts to unclench as a conversation gets warmer?`
                }
            },
            {
                id: `moment-forced-smile`,
                preview: `A smile that does not quite feel genuine…`,
                text: `How do you tell the difference between a genuine smile and a polite or forced one? Is it the eyes, the timing, the way it fades, or something else? How reliable do you think that instinct is?`,
                upgrade: {
                    term: `forced smile`,
                    type: `noun phrase`,
                    def: `A smile that someone uses to look polite, calm, or friendly, even when the feeling may not be natural.`,
                    in_action: `His forced smile made the apology feel less convincing, even though the words sounded polite.`,
                    review_prompt: `When might someone use a forced smile, even if they do not feel relaxed?`
                }
            },
            {
                id: `moment-brave-face`,
                preview: `“I’m fine,” but the body suggests otherwise…`,
                text: `A friend says, “I’m fine,” but their voice is flat, their posture looks heavy, and they avoid eye contact. Do you ask again, give them space, or wait for them to open up? What would feel caring without being too pushy?`,
                upgrade: {
                    term: `put on a brave face`,
                    type: `idiom`,
                    def: `To try to look calm, strong, or happy when you are actually upset, worried, or under pressure.`,
                    in_action: `She was putting on a brave face, but her tired eyes made me think something was wrong.`,
                    review_prompt: `What kind of situation might make someone put on a brave face at work?`
                }
            }
        ],
        makeItReal: {
            title: `A signal you noticed`,
            prompt: `Think of a real moment when someone’s body language gave you an immediate impression. What did you notice first, what did you think it meant, and did your interpretation turn out to be right?`
        }
    },
    {
        id: `set-behind-gesture`,
        title: `Behind the Gesture`,
        desc: `Look more carefully at what body language might mean, why the same signal can be read in different ways, and how context changes interpretation.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-context-dependent`,
                preview: `One gesture, more than one meaning…`,
                text: `Think of a gesture, expression, or habit that could mean something positive in one situation and something very different in another — for example, a long pause, intense eye contact, crossed arms, a quiet voice, or a touch on the arm. How does context change what the body seems to say?`,
                upgrade: {
                    term: `context-dependent`,
                    type: `adjective`,
                    def: `Changing meaning depending on the situation, relationship, culture, or environment.`,
                    in_action: `A long pause is context-dependent — in one conversation it may suggest thoughtfulness, while in another it may feel uncomfortable or tense.`,
                    review_prompt: `How could the same pause feel thoughtful in one setting and tense in another?`
                }
            },
            {
                id: `moment-crossed-arms`,
                preview: `Cold, comfortable, or closed off?`,
                text: `Some people say crossed arms mean a person is defensive or closed off. Others say it may simply mean they are cold, comfortable, tired, or listening carefully. What makes the difference? How can we avoid assuming too much from one signal?`,
                upgrade: {
                    term: `read into`,
                    type: `phrasal verb`,
                    def: `To give something more meaning than it may actually have.`,
                    in_action: `I may have read too much into his crossed arms — the room was freezing, and he was probably just trying to stay warm.`,
                    review_prompt: `Besides feeling defensive, what else could crossed arms mean before you read into it?`
                }
            },
            {
                id: `moment-carry-yourself`,
                preview: `Confidence and arrogance can look similar…`,
                text: `Two people watch someone walk into a room with a straight back, calm movement, and strong eye contact. One person reads it as confidence; another reads it as arrogance. What makes confident body language feel positive in one person and uncomfortable in another?`,
                upgrade: {
                    term: `carry yourself`,
                    type: `verb phrase`,
                    def: `To hold and move your body in a way that gives people a particular impression of you.`,
                    in_action: `She carries herself with quiet confidence, so people tend to listen before she even says much.`,
                    review_prompt: `How might someone carry themselves differently in a job interview versus among close friends?`
                }
            },
            {
                id: `moment-on-edge`,
                preview: `Nervousness that leaks through…`,
                text: `What physical signs of nervousness are hardest to hide? Think about voice changes, small hand movements, breathing, eye contact, posture, or speed of speech. Why does the body often show pressure before the person explains it?`,
                upgrade: {
                    term: `on edge`,
                    type: `idiom`,
                    def: `Nervous, tense, or unable to fully relax.`,
                    in_action: `He tried to sound calm, but his quick breathing and restless hands made him look on edge.`,
                    review_prompt: `What might make someone seem on edge before a big presentation?`
                }
            },
            {
                id: `moment-body-mirroring`,
                preview: `People copying each other without noticing…`,
                text: `Have you ever noticed two friends, colleagues, or a couple sitting in a similar position, using similar gestures, or matching each other’s rhythm without realising it? Why do you think people sometimes mirror each other physically, and what effect can it have on the conversation?`,
                upgrade: {
                    term: `body mirroring`,
                    type: `noun phrase`,
                    def: `The act of unconsciously matching another person’s posture, gestures, expression, or physical rhythm during an interaction.`,
                    in_action: `Their body mirroring was obvious — they leaned forward at the same time, copied each other’s gestures, and seemed completely in sync.`,
                    review_prompt: `Where might you notice body mirroring, and what could it suggest about the conversation?`
                }
            }
        ],
        makeItReal: {
            title: `A signal with more than one meaning`,
            prompt: `Think of a time when you misread someone’s body language, or someone misread yours. What did the signal seem to suggest, what else was actually going on, and what would you check next time?`
        }
    },
    {
        id: `set-body-story`,
        title: `Your Body, Your Story`,
        desc: `Connect body language to your own habits, relationships, culture, language, confidence, and the way people learn to present themselves.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-gravitas`,
                preview: `Someone whose presence you remember…`,
                text: `Think of someone from your life — a teacher, parent, boss, friend, colleague, or public figure — who has a strong physical presence. Not necessarily loud or dramatic, but memorable in the way they stand, move, pause, or hold attention. What makes their presence powerful?`,
                upgrade: {
                    term: `gravitas`,
                    type: `noun`,
                    def: `A serious, calm, and impressive presence that makes people pay attention and take someone seriously.`,
                    in_action: `She did not need to raise her voice; she had a natural gravitas that made the room listen.`,
                    review_prompt: `How could someone show gravitas in a meeting without raising their voice?`
                }
            },
            {
                id: `moment-mannerism`,
                preview: `A habit your body gives away…`,
                text: `What is one body-language habit people might notice in you when you are nervous, excited, bored, focused, or uncomfortable? How did you become aware of it, and have you ever tried to change it?`,
                upgrade: {
                    term: `mannerism`,
                    type: `noun`,
                    def: `A repeated habit in the way someone moves, speaks, gestures, or holds themselves.`,
                    in_action: `One of my mannerisms is tapping my fingers when I am thinking hard, even when I do not realise I am doing it.`,
                    review_prompt: `What's one mannerism you've noticed in a friend or colleague when they're concentrating?`
                }
            },
            {
                id: `moment-second-language-body`,
                preview: `A different body in a different language…`,
                text: `Does your body language change when you speak another language? Do you become more cautious, more expressive, more formal, more relaxed, or more self-conscious? What changes in your face, hands, posture, or confidence?`,
                upgrade: {
                    term: `physically inhibited`,
                    type: `adjective phrase`,
                    def: `Physically restrained, awkward, or less expressive because you feel self-conscious, uncertain, or not fully comfortable in a situation.`,
                    in_action: `When he spoke in his second language, he seemed physically inhibited — his gestures became smaller, his posture tightened, and he looked less like himself.`,
                    review_prompt: `Why might someone seem physically inhibited when speaking a language they're less sure of?`
                }
            },
            {
                id: `moment-guarded`,
                preview: `Becoming easier or harder to read…`,
                text: `As you have got older, do you think you have become better at hiding what you feel, or more willing to let your feelings show? Is being hard to read useful, or can it create distance between people?`,
                upgrade: {
                    term: `guarded`,
                    type: `adjective`,
                    def: `Careful about showing your feelings, thoughts, or reactions.`,
                    in_action: `He seemed guarded at first, but after a few minutes he relaxed and started speaking more honestly.`,
                    review_prompt: `What kind of situation might make someone act guarded when they first meet people?`
                }
            },
            {
                id: `moment-project-confidence`,
                preview: `One thing you would change…`,
                text: `If you could change one thing about your own body language or social presence, what would it be? Would you like to seem calmer, warmer, more confident, more open, more professional, or more relaxed? Why would that change matter to you?`,
                upgrade: {
                    term: `project confidence`,
                    type: `phrase`,
                    def: `To show confidence through posture, voice, movement, expression, or general presence.`,
                    in_action: `She wanted to project confidence in meetings, so she worked on sitting upright, slowing her speech, and holding eye contact more naturally.`,
                    review_prompt: `What small changes in posture or voice could help someone project confidence in a meeting?`
                }
            }
        ],
        makeItReal: {
            title: `Your body in a moment that mattered`,
            prompt: `Think of a real moment when you were very aware of your own body language — perhaps during a presentation, interview, argument, date, lesson, meeting, or new social situation. What were you feeling, what were you trying to show or hide, and what did your body actually communicate?`
        }
    }
];
