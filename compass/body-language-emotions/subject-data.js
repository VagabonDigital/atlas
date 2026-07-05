/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Body Language & Emotions
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring the body as the visible
  life of emotion — how feeling appears, hides, performs, leaks, protects,
  contradicts, and is read or misread across cultures and situations.
  Built for live lessons, thoughtful discussion, and sharper social awareness
  around presence, expression, posture, gaze, movement, space, and emotion.
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
        hook: `Long before anyone speaks, the body has already started talking — and it doesn't always say what we mean.`
    },
    overview: {
        heading: `What the Body Says Before We Do`,
        intro: [
            `Feelings rarely wait for words. A face changes, shoulders drop, a hand goes still, someone leans in or pulls away — and we sense something before anyone explains it.`,
            `This subject is about the body as the visible life of emotion: how it reveals, hides, performs, protects, and sometimes gives away what someone hoped to keep in. The aim is not to decode people, but to notice more carefully and assume less quickly.`
        ]
    },
    paths: {
        culturalLensDescription: `How different cultures read the same body — the gaze, the grief, the smile, the space between people — and how easily an outsider gets it wrong.`,
        discussionDescription: `Real moments where the body speaks first — the face someone didn't mean to show, the smile that isn't quite genuine, the nerves that leak out, and how you carry yourself when it counts.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Carry something forward — a sharper eye for what the body shows, and a lighter hand with what it might mean.`
    },
    culturalLens: {
        heading: `The Same Body, Read Different Ways`,
        intro: `The way we hold ourselves feels natural — so natural we forget we ever learned it. But how much emotion a body shows, how close it stands, where the eyes rest, how grief or joy appears in public: all of it is shaped by culture, history, and habit. What reads as warm, honest, or respectful in one place can read as cold, rude, or strange somewhere else. These cards look at how differently the world reads a body — and how much an outsider can miss.`
    },
    discussion: {
        heading: `When the Body Speaks First`,
        intro: `Every one of us reads bodies all day — the mood of a room, a face that gives more away than the person means to, the nerves someone can't quite hide. These sets move from the quick reads we make in a second, into the trickier question of what a signal really means, and finally to your own body: your habits, your presence, how you change under pressure. Some moments are fast reactions; others ask for a real story. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `You've looked at the body as the place where feeling becomes visible — the face someone didn't mean to show, the composed one, the grief that's shown or held back, the space people keep, the way a whole room can shift its mood at once. Across cultures, the same body gets read in completely different ways, which is exactly why a single signal is never the whole story. The most useful thing to carry from here isn't a code for decoding people — it's a sharper eye and a lighter touch: noticing what the body might be saying, staying curious about what else could be true, and being a little more aware of what your own body says for you.`,
        questions: [
            `Of everything today, which idea most changed how you'll read a body — a face, a posture, a distance, a stillness — the next time you're in a room full of people?`,
            `Where do you think you sit: do you tend to show what you feel, or keep it off your face — and has that changed over the years?`,
            `If a friend asked you how much you can really tell about someone from their body language, what would you honestly say now?`
        ]
    },
    keyLanguage: {
        intro: `Stronger words and phrases for talking about presence, expression, and the way emotion shows up in the body — with clear definitions and natural examples.`
    }
};

const clCards = [
    {
        id: `cl-ritual-mourning`,
        location: `Mourning traditions across cultures and history`,
        title: `The Loudest Grief in the Room`,
        teaser: `Sometimes the person weeping hardest never met the one who died.`,
        insight: `In many traditions, grief has been something to show, not hide. Historically, families in parts of the Mediterranean, the Middle East, and South Asia hired professional mourners — people whose role at a funeral was to weep, wail, and lament out loud, so the dead were seen to be properly mourned. Elsewhere, the honourable response to loss has been the opposite: a still face, a steady voice, grief held quietly inside. For someone raised in one tradition, the other can look shocking — the loud mourner may seem hysterical or even fake, the quiet one cold or unloving. But neither shows how much a person feels. In some places, showing grief loudly is how you honour the dead; in others, holding it in is.`,
        question: `At a funeral, would you feel more comfortable around open, visible weeping, or around quiet, contained grief — and what does each one seem to say to you?`,
        upgrade: {
            term: `stiff upper lip`,
            type: `idiom`,
            def: `A calm, controlled way of hiding your feelings when you're upset or under pressure.`,
            in_action: `His father never cried at the funeral — he kept a stiff upper lip the whole day.`,
            review_prompt: `In your culture, is staying controlled at a funeral usually read as strength, distance, or something else?`
        },
        deeper: {
            text: `It's easy to assume that visible grief equals deep grief, and that a calm face means someone isn't feeling much — but funerals across the world quietly disprove this. Where mourning is loud and communal, weeping together is a way of carrying the loss as a group, and holding it in can look like you didn't care. Where mourning is contained, composure is the gift you give the family, and falling apart can seem like making someone else's loss about you. Neither is more real; they're different ideas about what respect looks like on the outside. There's a modern echo whenever people disagree about how someone "should" behave after a death — the relative who stays busy and dry-eyed, and the one who sobs openly, may feel exactly the same thing underneath. The mistake is reading the surface as the measurement. How much a body shows and how much a heart feels are simply not the same dial.`,
            questions: [
                `In your culture, how are people expected to behave at a funeral — and what happens if someone behaves differently?`,
                `Have you ever judged how much someone was grieving by how much they showed — and could you have been wrong?`,
                `Why do you think some cultures grieve loudly and together, while others grieve quietly and alone?`
            ]
        }
    },
    {
        id: `cl-strangers-smile`,
        location: `Smiling norms across cultures`,
        title: `The Smile That Doesn't Mean What You Think`,
        teaser: `In some places, smiling at a stranger is warmth. In others, it's a warning sign.`,
        insight: `A smile feels like the most universal friendly signal there is — but it isn't read the same way everywhere. In some cultures, especially where service and friendliness go hand in hand, smiling at strangers is normal, warm, and expected; a person who doesn't smile can seem cold or rude. In others, a smile is saved for people you actually know, or for something genuinely funny, and smiling at a stranger for no clear reason can seem odd, insincere, or even a little suspicious. For a visitor, this cuts both ways: the constant smiler abroad may come across as fake, while the reserved local may seem unfriendly when they simply smile less. The same expression carries very different weight depending on where you are.`,
        question: `When a stranger smiles at you for no particular reason, does it feel warm and friendly — or does part of you wonder what they want?`,
        upgrade: {
            term: `put someone at ease`,
            type: `verb phrase`,
            def: `To help someone feel relaxed and comfortable, especially when they're nervous or unsure.`,
            in_action: `She has a way of putting people at ease the moment they walk in — warm smile, open posture.`,
            review_prompt: `Besides a smile, what puts you at ease when you first meet someone?`
        },
        deeper: {
            text: `A smile is one of the first things we learn to trust, which is exactly why it can mislead us abroad. In places where friendliness is shown openly and often, a smile lubricates ordinary life — the shop, the street, the lift — and its absence stands out. In places where expressions are saved for real feeling, that same easy smile can seem to mean nothing, or to be hiding something. Neither culture is warmer or colder underneath; they've simply learned different rules about when the face should perform friendliness and when it should stay honest. There's a lesson in it about first impressions generally: we tend to judge warmth and trustworthiness from a face in a fraction of a second, then feel very sure about it. But the smile — or the serious face — you're reading may be doing a completely different job than the one you'd assume back home.`,
            questions: [
                `In your culture, do people smile easily at strangers, or is a smile more reserved for people you know?`,
                `Have you ever misjudged someone as unfriendly or fake because of how much they smiled?`,
                `Do you trust a warm, smiling face more than a serious one — and should you?`
            ]
        }
    },
    {
        id: `cl-managed-laughter`,
        location: `Laughter and expressiveness in public`,
        title: `Laughing Out Loud, or Behind Your Hand`,
        teaser: `The same joke, in two rooms, comes out completely differently.`,
        insight: `Laughter is one of the most honest things a body does — but how freely we let it out is shaped by where we are. In some settings, big, open, loud laughter is a sign of warmth and connection, and holding back can seem stiff or unfriendly. In others, laughter is softened — a hand over the mouth, a quieter chuckle, a more controlled face — as a matter of modesty or composure, and roaring with laughter in the wrong room can feel too loud or attention-seeking. For an outsider, the softer laugher can seem shy or unamused, and the louder one can seem over the top. The feeling underneath may be exactly the same joy; only the volume the body is allowed changes.`,
        question: `Are you someone who laughs loudly and openly, or more quietly — and does it change depending on who you're with and where you are?`,
        upgrade: {
            term: `infectious`,
            type: `adjective`,
            def: `Describing a feeling — especially laughter or enthusiasm — that spreads quickly to other people.`,
            in_action: `Her laugh was so infectious that the whole table was soon laughing at nothing.`,
            review_prompt: `Think of someone whose laughter is infectious — what does it do to a room?`
        },
        deeper: {
            text: `There's something almost physical about how laughter travels — one person goes, and suddenly a whole room is helpless, often without anyone quite knowing what's funny anymore. That contagious quality is part of why cultures develop rules around it. Where shared, open laughter is prized, letting go together builds warmth fast, and a person who stays composed can seem to be holding themselves apart. Where restraint is valued, softening your laughter is a way of not dominating the room, and the loud laugher can seem to be demanding attention. Both are ways of managing the same powerful signal. It's worth noticing your own settings: many people laugh very differently with old friends than with a boss, or in their own language versus a second one where they feel less at home. The joy is real either way — but how much of it the body is willing to release is a very social decision.`,
            questions: [
                `Do people in your culture tend to laugh openly and loudly, or more quietly and modestly?`,
                `Have you ever tried to hold back laughter at completely the wrong moment — what happened?`,
                `Do you laugh differently with close friends than you do at work or with people you've just met?`
            ]
        }
    },
    {
        id: `cl-composed-face`,
        location: `Emotional composure across cultures`,
        title: `The Face That Gives Nothing Away`,
        teaser: `Bad news lands — and not a muscle moves. Is that strength or coldness?`,
        insight: `When something big happens — hard news, a shock, a sharp disagreement — cultures differ on what the face is supposed to do. In some settings, keeping a calm, neutral expression is a mark of maturity, dignity, and respect, and letting your feelings spill onto your face can seem like a loss of control. In others, a still face at an emotional moment reads as cold, distant, or as though the person doesn't care at all. So the very same composure can be admired in one room and quietly resented in another. For someone reading across that gap, the danger is obvious: a controlled face can look like indifference when it may actually be someone working very hard to hold themselves together.`,
        question: `When someone hears difficult news and keeps a completely calm face, do you read that as strength, as distance, or as something they're holding in?`,
        upgrade: {
            term: `composure`,
            type: `noun`,
            def: `A calm, controlled state you keep even when you might be expected to show strong emotion.`,
            in_action: `She kept her composure through the whole meeting, even when the news was clearly a blow.`,
            review_prompt: `When have you had to keep your composure while feeling something much stronger inside?`
        },
        deeper: {
            text: `Beneath this lies a genuine difference in what people think self-control is for. In traditions that prize composure, keeping the face steady protects everyone around you — it says "I've got this, you don't need to worry about me," and it can be a deep form of care. In traditions that prize openness, the same steadiness can feel like a wall, as if the person is refusing to share what's real. Neither is wrong, but they collide badly in mixed settings — a workplace, a marriage, a friendship across cultures — where one person is being respectful in the only way they know, and the other is feeling shut out. The useful move is to remember that a calm surface is not a reading of the depths. Some of the most controlled faces in a hard moment belong to the people feeling the most, holding it together precisely because so much is going on underneath.`,
            questions: [
                `In your culture, is staying calm under emotional pressure seen as admirable, or as being closed off?`,
                `Have you ever thought someone was cold or uncaring, then realised they were just holding it together?`,
                `Do you tend to show what you feel in a hard moment, or keep it off your face?`
            ]
        }
    },
    {
        id: `cl-standing-distance`,
        location: `Personal space across cultures`,
        title: `The Conversation That Moves Across the Room`,
        teaser: `One steps in, the other steps back — and neither knows they're dancing.`,
        insight: `Every person carries an invisible sense of how close is comfortable — and that distance is set partly by culture. In some places, standing close in conversation is warm, normal, and engaged; in others, the same closeness feels like pressure or intrusion. When two people with different settings talk, something almost comic can happen: one keeps drifting closer to reach a comfortable distance, the other keeps easing back to restore theirs, and the whole conversation slowly travels across the room. Neither is being rude — their bodies are simply speaking different dialects of distance. But without knowing that, the close-stander can seem pushy, and the back-stepper can seem cold or evasive.`,
        question: `When someone stands closer to you than you're used to while talking, what does your body want to do — and what do you assume about them?`,
        upgrade: {
            term: `crowd someone`,
            type: `verb`,
            def: `To stand or move too close to someone in a way that feels uncomfortable or intrusive.`,
            in_action: `I didn't mean to crowd him — I just stand close when I talk, and I could see him backing away.`,
            review_prompt: `Have you ever felt someone crowding you in a conversation? What did you do?`
        },
        deeper: {
            text: `Distance is one of the quietest ways people negotiate comfort, and one of the easiest to misread, because almost nobody does it on purpose. We drift closer, angle away, lean in, or create a little more room without ever saying a word about it — and the other person feels it instantly, often before they can explain why. The setting changes the rules too: a packed train makes closeness normal that would feel strange in an empty office, and the distance we allow a friend, a colleague, a stranger, or an elder can all be different. What makes cross-cultural distance tricky is that the discomfort arrives as a feeling, not a thought — "something about them was a bit much" — which we then wrongly pin on the person's character rather than on a simple mismatch of comfortable space. Noticing the mismatch, instead of judging the person, is most of the skill.`,
            questions: [
                `Do you tend to stand close when you talk, or do you like a bit more space?`,
                `Have you ever felt uncomfortable with someone and later realised it was just about distance?`,
                `How does comfortable distance change for you between a friend, a stranger, and someone senior to you?`
            ]
        }
    },
    {
        id: `cl-public-warmth`,
        location: `Physical warmth and touch across cultures`,
        title: `When Friends Walk Arm in Arm`,
        teaser: `In one country it's ordinary friendship. In another, outsiders read romance.`,
        insight: `How much people touch in everyday life — a hand on the arm, a kiss on the cheek in greeting, friends walking arm in arm or hand in hand — varies enormously, and it's easily misread from the outside. In some cultures, warm physical contact between friends, including friends of the same gender, is completely ordinary and says nothing about romance. To a visitor from a more physically reserved culture, that same closeness can be startling — they may read affection, or attraction, where the locals see simple friendship. The reverse happens too: in a warm-touch culture, a reserved visitor who keeps their distance can seem cold, stiff, or unfriendly. The body's warmth is telling the truth about the relationship — but only to people who share the code.`,
        question: `In your culture, how much physical warmth is normal between friends — and would some of it be misread as something more by an outsider?`,
        upgrade: {
            term: `tactile`,
            type: `adjective`,
            def: `Describing a person or culture that touches a lot when interacting — hugs, pats, a hand on the arm.`,
            in_action: `He's a very tactile person, so a handshake never feels like enough — you're getting a hug.`,
            review_prompt: `Are you a tactile person, or do you prefer more physical space with people?`
        },
        deeper: {
            text: `Touch is never only physical — it carries messages about closeness, trust, respect, and where the line between people sits. That's why getting it wrong feels like more than a small mistake: a touch that's ordinary in one culture can feel intrusive in another, and a reserve that's polite in one can feel cold somewhere else. The added trap is that outsiders often read physical warmth through their own map of what touch means, and their map may only have a couple of settings — friendly, or romantic — when the local map has many more. So same-gender friends holding hands, or a warm two-cheek greeting, gets slotted into the wrong category entirely. None of this is about one culture being more affectionate underneath; it's about how freely warmth is shown on the body, and how confidently outsiders assume they know what it means. When touch surprises you abroad, it's usually a sign your map is smaller than the place you're in.`,
            questions: [
                `Is your culture generally quite tactile, or more physically reserved?`,
                `Have you ever misread how close two people were because of how much they touched?`,
                `How do you feel when someone is more physically warm — or more distant — than you expected?`
            ]
        }
    },
    {
        id: `cl-lowered-eyes`,
        location: `Eye contact and authority across cultures`,
        title: `Looking Down as a Sign of Respect`,
        teaser: `The lowered eyes that mean respect at home can cost you a job interview abroad.`,
        insight: `How much you're supposed to look someone in the eye depends heavily on who they are to you — and cultures set that dial differently. In some contexts, meeting a person's eyes directly, even an elder, a teacher, or a boss, shows confidence and honesty. In others, holding the direct gaze of someone senior is bold or disrespectful, and lowering your eyes is exactly how you show respect. This collides painfully in places like interviews, classrooms, or courtrooms: a young person taught that looking down is polite may be read by someone from another background as shifty, evasive, or dishonest — when they are, in fact, being respectful in the only way they were taught.`,
        question: `If someone avoided your eyes while talking to you, would you read it as respect, shyness, discomfort, or something to be suspicious of — and would that depend on the situation?`,
        upgrade: {
            term: `hold someone's gaze`,
            type: `verb phrase`,
            def: `To keep looking directly into someone's eyes for a period of time.`,
            in_action: `In that culture, holding a teacher's gaze can seem bold, so students often look down out of respect.`,
            review_prompt: `When does holding someone's gaze feel confident, and when does it start to feel like too much?`
        },
        deeper: {
            text: `Eye contact is one of the most over-trusted signals we have — many people treat steady eyes as proof of honesty and lowered eyes as proof of guilt, when both are far more about upbringing than character. In settings that reward the direct gaze, looking away can quietly damage you in an interview or a negotiation, however sincere you are. In settings that read a strong gaze at an elder as a challenge, that same directness can seem arrogant. The stakes are highest where the two systems meet and one person is judging the other's honesty or confidence by the wrong rulebook — a teacher misreading a respectful student, an interviewer misreading a nervous but honest candidate. Someone looking down may be respectful, shy, thoughtful, or simply uncomfortable, none of which is dishonesty. The safest habit is to hold your read of the eyes loosely, and to remember how much of it you learned rather than discovered.`,
            questions: [
                `In your culture, what does strong, direct eye contact usually suggest — and does it change with age or authority?`,
                `Have you ever felt judged for looking at someone too much, or not enough?`,
                `Do you think people trust "steady eye contact" more than they should?`
            ]
        }
    },
    {
        id: `cl-taking-up-space`,
        location: `Posture, space, and social presence`,
        title: `Taking Up Room, or Folding Yourself Small`,
        teaser: `Some people fill a room without a word. Others are trained to disappear in it.`,
        insight: `Bodies claim space in very different ways, and those ways are partly taught. Some people spread out, stand tall, gesture widely, and take up room comfortably; others keep their arms in, their voice low, their movements small, and quietly try to occupy as little space as possible. Often this isn't personality but training — in many settings, and frequently along lines of gender, age, or rank, making yourself small is taught as modesty, humility, or good manners. To an outsider, though, the person folding themselves in can look nervous, unconfident, or unimportant, and the person spreading out can look confident or arrogant. The posture may be a learned social habit, not a true measure of how the person feels about themselves.`,
        question: `Do you tend to fill a room when you're in it, or make yourself smaller — and where do you think that habit came from?`,
        upgrade: {
            term: `take up space`,
            type: `verb phrase`,
            def: `To occupy room physically and socially through posture, movement, and presence — literally, or in the sense of feeling entitled to be noticed.`,
            in_action: `Some people take up space the second they walk in; others seem to apologise for being there.`,
            review_prompt: `Who's someone you know who takes up space in a room — and how do they do it?`
        },
        deeper: {
            text: `There's a quiet politics in how much room a body claims, and it often has less to do with character than with what someone was taught they were allowed. In many cultures, and across many upbringings, some people are gently trained to shrink — to sit neatly, speak softly, not spread out, not draw the eye — while others grow up assuming a room is theirs to fill. Watch a meeting or a classroom and you can often see it: who leans back and stretches out, who tucks themselves in. The misread is to treat the big presence as natural confidence and the small one as natural timidity, when both may be habits built over years. It also shifts with setting — the same person can take up space among friends and fold in front of authority. Noticing the pattern, in others and in yourself, says more than any single confident stance ever could.`,
            questions: [
                `In your culture, is anyone taught to make themselves smaller — and does it fall along lines of age, gender, or rank?`,
                `Do you take up more or less space depending on who you're with?`,
                `Have you ever mistaken someone's quiet, small presence for a lack of confidence?`
            ]
        }
    },
    {
        id: `cl-body-in-crowd`,
        location: `The body in ritual and crowds`,
        title: `When a Crowd Moves as One Body`,
        teaser: `Thousands of people, one movement — and being carried into it feels like belonging.`,
        insight: `Much of the time we think of body language as one person's signals, but some of the most powerful physical experiences happen in groups — a congregation standing, bowing, or swaying together; a stadium rising as one; dancers or marchers moving in time; mourners or celebrants carried by a shared rhythm. In these moments, individual bodies stop being separate and briefly become a single "we," and the feeling that produces — belonging, uplift, sometimes a loss of self — is real and often deeply moving. To an outsider who doesn't share it, the same synchronised movement can look strange, mechanical, or even unsettling. But from the inside, moving with everyone else can be one of the most powerful emotional experiences a body ever has.`,
        question: `When have you felt yourself carried along by a crowd all moving together — a concert, a match, a service, a celebration — and what did being part of it feel like?`,
        upgrade: {
            term: `get swept up in`,
            type: `idiomatic phrase`,
            def: `To be carried along by a strong shared feeling or excitement, often more than you expected.`,
            in_action: `I don't even follow the team, but I got completely swept up in it when the whole stand stood up.`,
            review_prompt: `When did you last get swept up in a crowd's energy — what did it feel like?`
        },
        deeper: {
            text: `There's a reason so many cultures build collective movement into their most important moments — worship, mourning, celebration, sport. Moving together does something to people that moving alone can't: it dissolves the usual distance between bodies and creates a fast, powerful sense of being one group. Anyone who's felt a whole crowd rise at once, or joined a room all moving to the same rhythm, knows the pull of it — and also, sometimes, how easily individual judgement can soften inside it. That's the double edge. The same carried-along feeling that makes a celebration or a service so moving is also what makes crowds powerful and, at times, unpredictable. An outsider watching may see only strange, synchronised motion; a participant feels belonging, meaning, or joy. Both are true. The body in a crowd is running on something older than words — the deep human comfort of not being separate, of moving, for a moment, as part of something larger.`,
            questions: [
                `In your culture, when do people move together as a group — in worship, celebration, sport, or mourning?`,
                `Have you ever felt part of a crowd in a way that moved you — or in a way that unsettled you?`,
                `Why do you think moving together with others can feel so powerful?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-first-read`,
        title: `Quicker Than Words`,
        desc: `The fast, gut-level reads we make in a second — the mood of a room, a face, a nervous hand — before anyone explains a thing.`,
        icon: `react`,
        moments: [
            {
                id: `moment-room-mood`,
                preview: `You feel it before anyone speaks…`,
                text: `You open a door and step into a room — a meeting, a party, a family kitchen. Before a single word, you can often feel the temperature: warm and easy, or tight and a bit off. What did your body pick up on that told you the mood before anyone said anything?`,
                upgrade: {
                    term: `read the room`,
                    type: `idiom`,
                    def: `To quickly sense the mood or atmosphere of a situation and adjust how you behave.`,
                    in_action: `She read the room in seconds and decided it wasn't the moment for a joke.`,
                    review_prompt: `Walking into a room, what's the first thing that tells you the mood?`
                }
            },
            {
                id: `moment-unguarded-face`,
                preview: `The face they didn't mean to show…`,
                text: `You glance over and catch someone's real expression for a second — tired, annoyed, sad, somewhere far away — before they notice you looking and rearrange it into something else. Have you had a moment like that? What did that split-second expression seem to show?`,
                upgrade: {
                    term: `an unguarded moment`,
                    type: `noun phrase`,
                    def: `A brief moment when someone shows their true feelings because they think no one is watching.`,
                    in_action: `In an unguarded moment, her face fell completely — then the smile was back.`,
                    review_prompt: `What might you notice about someone in an unguarded moment that they'd usually hide?`
                }
            },
            {
                id: `moment-real-smile`,
                preview: `A smile that doesn't reach the eyes…`,
                text: `Most of us can feel the difference between a real smile and a polite one, even if we can't say exactly how. Is it the eyes, the timing, how fast it fades? Think of a time you could tell a smile wasn't quite genuine — what gave it away?`,
                upgrade: {
                    term: `forced smile`,
                    type: `noun phrase`,
                    def: `A smile someone puts on to seem polite or friendly when the feeling isn't really there.`,
                    in_action: `He thanked me with a forced smile that disappeared the second I turned away.`,
                    review_prompt: `What's the difference, for you, between a real smile and a forced one?`
                }
            },
            {
                id: `moment-nerves-leak`,
                preview: `The body that won't keep the secret…`,
                text: `Someone's trying hard to seem calm and in control — but a foot is tapping, a hand won't stay still, they keep touching their face. What are the little physical things that tend to leak out when a person is nervous, no matter how calm they're trying to look?`,
                upgrade: {
                    term: `give yourself away`,
                    type: `idiom`,
                    def: `To accidentally show a feeling you were trying to hide, through your face or body.`,
                    in_action: `He said he wasn't worried, but his shaking hands gave him away.`,
                    review_prompt: `What small physical habit tends to give people away when they're nervous?`
                }
            },
            {
                id: `moment-heavy-shoulders`,
                preview: `You can see the week on them…`,
                text: `Sometimes you can tell someone's had a hard day or a hard week before they say one word — it's in the shoulders, the walk, the way they drop into a chair. Have you ever seen the weight of something on a person's body like that? What did you notice?`,
                upgrade: {
                    term: `weigh someone down`,
                    type: `phrasal verb`,
                    def: `To make someone feel heavy, tired, or low, so that it shows in how they move or hold themselves.`,
                    in_action: `You could see the stress weighing him down — shoulders slumped, moving like everything was an effort.`,
                    review_prompt: `How can you tell when something's weighing someone down before they mention it?`
                }
            }
        ],
        makeItReal: {
            title: `A read you made in a second`,
            prompt: `Think of a real moment when someone's body or face gave you an instant impression — in a shop, a meeting, at home, anywhere. What did you notice first, what did you think it meant, and did it turn out to be right?`
        }
    },
    {
        id: `set-what-it-means`,
        title: `What the Body Isn't Saying`,
        desc: `The trickier middle ground — where the same signal has more than one meaning, and reading it wrong is easy.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-over-reading`,
                preview: `One signal, a whole story invented…`,
                text: `Someone crosses their arms, and a friend leans over and whispers, "They're not happy." Maybe — or maybe the room's cold, or that's just how they stand. When have you seen someone build a whole story out of one small signal that probably didn't mean that much?`,
                upgrade: {
                    term: `read too much into`,
                    type: `idiomatic phrase`,
                    def: `To give something more meaning than it probably has.`,
                    in_action: `I think I read too much into his silence — turns out he was just tired.`,
                    review_prompt: `What body-language signal do people most often read too much into?`
                }
            },
            {
                id: `moment-confidence-arrogance`,
                preview: `Confidence and arrogance can look the same…`,
                text: `Someone walks in with a straight back, calm movements, steady eye contact. One person sees quiet confidence; another sees arrogance — same body, opposite read. What do you think tips confident body language over into looking arrogant?`,
                upgrade: {
                    term: `carry yourself`,
                    type: `verb phrase`,
                    def: `To hold and move your body in a way that shapes the impression people have of you.`,
                    in_action: `She carries herself so calmly that people listen before she's even said much.`,
                    review_prompt: `How might someone carry themselves differently in an interview and among close friends?`
                }
            },
            {
                id: `moment-under-pressure`,
                preview: `Pressure shows before the words do…`,
                text: `Think about someone right before something stressful — a presentation, a hard conversation, a test. What are the physical signs that tend to show they're under pressure, even while they're trying to look relaxed? Why does the body so often show it first?`,
                upgrade: {
                    term: `on edge`,
                    type: `idiom`,
                    def: `Nervous, tense, and unable to fully relax.`,
                    in_action: `He looked on edge all morning — jumpy, restless, checking his phone every minute.`,
                    review_prompt: `What tells you someone's on edge, even before they admit anything's wrong?`
                }
            },
            {
                id: `moment-loosen-up`,
                preview: `The stiff start that slowly thaws…`,
                text: `You've probably watched someone start a conversation stiff and closed — short answers, arms in, a bit formal — and then gradually relax as they get comfortable. What changes in the body as someone settles into a conversation? And what do you think helps that happen?`,
                upgrade: {
                    term: `loosen up`,
                    type: `phrasal verb`,
                    def: `To become more relaxed and less stiff or tense, in body or manner.`,
                    in_action: `After a few minutes he loosened up — sat back, started using his hands, actually laughed.`,
                    review_prompt: `What helps someone loosen up when they've started off stiff and guarded?`
                }
            },
            {
                id: `moment-making-small`,
                preview: `Folding in to take up less room…`,
                text: `Some people, in certain situations, seem to physically fold inward — shoulders in, head down, making themselves as small as possible, especially around louder or more senior people. When have you noticed someone doing that? What do you think makes a person fold in on themselves like that?`,
                upgrade: {
                    term: `shrink back`,
                    type: `phrasal verb`,
                    def: `To physically pull yourself in or move away, often from fear, shyness, or feeling out of place.`,
                    in_action: `When the boss raised his voice, she shrank back and went completely quiet.`,
                    review_prompt: `What kind of situation makes someone shrink back and try to take up less space?`
                }
            }
        ],
        makeItReal: {
            title: `A signal you got wrong`,
            prompt: `Think of a time you misread someone's body language — or someone misread yours. What did the signal seem to say, what was actually going on underneath, and what would you check before assuming next time?`
        }
    },
    {
        id: `set-your-own-body`,
        title: `The Body You Carry`,
        desc: `Turning it on yourself — your presence, your habits, your nerves, and how you've changed in the way you carry what you feel.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-presence`,
                preview: `Someone who fills a room quietly…`,
                text: `Think of someone you've known — a teacher, a relative, a boss, a friend — who had a strong physical presence. Not loud or showy, but memorable in how they stood, moved, paused, or held people's attention. What was it about their physical presence that stayed with you?`,
                upgrade: {
                    term: `gravitas`,
                    type: `noun`,
                    def: `A calm, serious presence that makes people pay attention and take someone seriously.`,
                    in_action: `He never raised his voice — he just had a natural gravitas, and the room would go quiet.`,
                    review_prompt: `Who's someone with real gravitas, and how do they show it without trying hard?`
                }
            },
            {
                id: `moment-own-tell`,
                preview: `The habit your body gives away…`,
                text: `Most of us have a physical habit that shows up when we're nervous, focused, bored, or excited — tapping, fidgeting, a certain way of standing, playing with something. What's yours? How did you become aware of it, and have you ever tried to stop?`,
                upgrade: {
                    term: `mannerism`,
                    type: `noun`,
                    def: `A repeated, often unconscious habit in the way someone moves, gestures, or holds themselves.`,
                    in_action: `One of my mannerisms is clicking my pen when I'm thinking — I don't even notice I'm doing it.`,
                    review_prompt: `What's one mannerism you've noticed in yourself when you're concentrating?`
                }
            },
            {
                id: `moment-other-language`,
                preview: `A different body in a different language…`,
                text: `Does your body change when you speak another language? Some people get more careful, smaller in their gestures, more self-conscious; others feel freer. What happens to your face, hands, posture, or confidence when you switch into a language you're less sure of?`,
                upgrade: {
                    term: `tense up`,
                    type: `phrasal verb`,
                    def: `To become physically tight or stiff because you feel nervous or under pressure.`,
                    in_action: `The moment I have to speak English on the phone, I tense up and forget half my words.`,
                    review_prompt: `What happens in your body when you tense up speaking a less familiar language?`
                }
            },
            {
                id: `moment-harder-to-read`,
                preview: `Easier or harder to read, over the years…`,
                text: `As you've got older, do you think you've become better at keeping your feelings off your face — or more willing to let them show? Is being hard to read something you value, or does it sometimes put distance between you and people?`,
                upgrade: {
                    term: `guarded`,
                    type: `adjective`,
                    def: `Careful not to show your feelings, thoughts, or reactions to others.`,
                    in_action: `She was guarded at first, but once she trusted us, a completely different side came out.`,
                    review_prompt: `In what kind of situation do you become more guarded with what you show?`
                }
            },
            {
                id: `moment-show-or-hide`,
                preview: `The open book and the closed one…`,
                text: `Some people show everything on their face — you always know exactly where you stand with them. Others keep it all in, and you can never quite tell. Which are you closer to — and do you think it's better to be easy to read, or hard to read?`,
                upgrade: {
                    term: `wear your heart on your sleeve`,
                    type: `idiom`,
                    def: `To show your feelings openly so that everyone can see how you feel.`,
                    in_action: `He wears his heart on his sleeve — one look at him and you know exactly how the day's gone.`,
                    review_prompt: `Do you wear your heart on your sleeve, or keep it hidden — and how does that work out for you?`
                }
            }
        ],
        makeItReal: {
            title: `Your body when it counted`,
            prompt: `Think of a real moment when you were very aware of your own body — a presentation, an interview, a first meeting, a hard conversation, a big occasion. What were you feeling, what were you trying to show or hide, and what do you think your body actually communicated?`
        }
    }
];
