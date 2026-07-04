/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Personality & Character Traits
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring how character is
  shaped, shown, and judged — first impressions, hidden sides, the self
  we perform, and the gap between who someone shows you and who they are.
  Built for live lessons, thoughtful discussion, and sharper social awareness
  around personality, identity, and how we read each other.
  Subject content may change.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'personality-character-traits',
    schemaVersion: 1,
    contentVersion: '1.0.0',
    title: 'Personality & Character Traits',
    titleHtml: 'Personality &amp; <em>Character Traits</em>',
    navTitle: 'Personality',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW2XX5CGq4BH5i6_Tmvm-5FmWqFm4173_F937ppNn05Kf99B2ftqP1Uw1s&s=10'
};

const subjectCopy = {
    cover: {
        hook: `How traits are read, performed, and shaped by context — and the gap between who someone shows you and what may be underneath.`
    },
    overview: {
        heading: `Who someone is, and who they show you`,
        intro: [
            `We treat personality as the most solid thing about a person — their real, fixed self, the truth underneath everything they do. Yet so much of what we call character is shaped by the situation someone is in, the culture they grew up in, and the version of themselves they have learned to show.`,
            `In this subject, you will explore the gap between the traits people display and the character beneath them — how first impressions form and mislead, where our qualities really come from, and how easily one moment can be mistaken for the whole person. It is less about labelling personalities than about reading them, and being read, with more care.`
        ]
    },
    paths: {
        culturalLensDescription: `Explore how different cultures and eras have shaped character — training toughness, hiding emotion, performing a public self — and how the same trait can read as a strength in one world and a flaw in another.`,
        discussionDescription: `Work through real moments of reading people and being read — first impressions, hidden sides, traits that shift with the room — using language that helps you describe character with more precision.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Closing reflection — revisit what you have explored and carry something forward`
    },
    culturalLens: {
        heading: `How character is shaped, shown, and judged`,
        intro: `What we call personality can feel like the most personal thing about us — simply who we are. Yet across cultures and history, societies have actively shaped character: training people to hide or show emotion, rewarding some traits and punishing others, and deciding which version of a person is acceptable in public. The same quality can read as strength in one place and weakness in another. These cards explore how character is moulded by the world around it — and how easily an outsider can misread it.`
    },
    discussion: {
        heading: `First Impressions and Hidden Sides`,
        intro: `Personality feels like the most fixed thing about a person — yet the way we read each other shifts constantly with context, timing, and what people choose to show. These conversations move from quick first reactions to deeper questions about where character comes from, how it gets performed, and what you are still learning about yourself and the people around you. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `You have explored how character is shaped, shown, and judged — across cultures that trained particular traits, real moments where first impressions proved wrong, and your own sense of who you are and who you are becoming. These conversations help you read people with more care, describe character with more precision, and hold lightly the gap between the self someone shows and the parts they may not show.`,
        questions: [
            `Looking back at the cultural examples today, which way of shaping character felt closest to your own upbringing — and which felt most unfamiliar?`,
            `Think of someone you have recently judged quickly. What might you have misread, and what would you want to notice before settling on that impression?`,
            `Which word or phrase from today gave you a more precise way to describe something about character you have noticed but struggled to name — and where would you actually use it?`
        ]
    },
    keyLanguage: {
        intro: `Higher-level expressions from this subject — with definitions and natural in-action examples.`
    }
};

const clCards = [
    {
        id: `cl-sparta`,
        location: `Ancient Sparta`,
        title: `Toughness you could be trained into`,
        teaser: `A whole society built to manufacture one trait.`,
        insight: `In ancient Sparta, boys were deliberately raised through hardship — exposed to cold, hunger, and pain — so that toughness and emotional control became the defining marks of character. Showing fear or distress could bring punishment, because composure under pressure was treated as the highest sign of worth. What looks like a natural trait was, in significant part, a social product: a quality shaped into people by design rather than simply born in them.`,
        question: `Is there a quality you have built in yourself that did not come naturally at first — and what made you develop it?`,
        upgrade: {
            term: `thick-skinned`,
            type: `adjective`,
            def: `Able to handle criticism, difficulty, or pressure without being easily upset.`,
            in_action: `You need to be fairly thick-skinned in that industry — the feedback is constant and nobody softens it.`,
            review_prompt: `In what part of your life have you had to become more thick-skinned over time?`
        },
        deeper: {
            text: `The Spartan example raises a question that still sits underneath modern life: how much of someone's character is chosen, and how much is manufactured by the environment they were placed in? A child raised to suppress fear may genuinely become someone who stays calm in a crisis — but they may also lose easy access to softer feelings they were never allowed to show. This is the hidden cost of training a trait so hard: strengths and limitations often grow from the same root. We see milder versions everywhere — the family that prizes resilience and quietly discourages complaint, the workplace that rewards people who never appear rattled. For an outsider, the danger is reading the calm surface as the whole person, and missing how much effort, or suppression, is holding it in place.`,
            questions: [
                `Were you raised to show certain feelings and hide others? Which ones, and has that stayed with you?`,
                `Do you think a workplace or family can shape someone's personality as strongly as their nature does?`,
                `Is there a trait your environment rewarded so much that it became hard to be any other way?`
            ]
        }
    },
    {
        id: `cl-victorian-england`,
        location: `Victorian England`,
        title: `The composed surface`,
        teaser: `Strong feeling was real — it just was not for public view.`,
        insight: `In Victorian England, open displays of anger, excitement, or affection in public were widely discouraged, especially among the respectable classes. Staying composed regardless of what you felt inside was treated as a mark of good character. This did not mean people felt less — it meant the visible self and the inner self were deliberately kept apart, and emotional restraint became a social signal of maturity and self-control.`,
        question: `Have you ever completely misjudged what someone was feeling because they showed so little on the surface — assuming they were fine, or cold, when they were not?`,
        upgrade: {
            term: `keep up appearances`,
            type: `idiom`,
            def: `To maintain a respectable or composed outward image, regardless of difficulties or feelings underneath.`,
            in_action: `They were going through a hard time financially, but they kept up appearances so well that none of their friends suspected a thing.`,
            review_prompt: `When have you kept up appearances while feeling quite different underneath?`
        },
        deeper: {
            text: `A culture of emotional restraint creates a particular kind of reading problem: the calmer the surface, the harder it is to know what is beneath it. Where composure is expected, a person in real distress may look completely fine, and others may genuinely fail to notice. This is very different from cultures where strong feeling is shown openly and read as sincerity. When the two styles meet, misjudgement runs both ways — the restrained person can seem cold or unfeeling, while the expressive person can seem dramatic or out of control. Neither is the truth of who they are; each is simply following a different rule about how much of the inner self belongs in public. The skill, when reading across these styles, is to remember that a flat surface is not always a flat feeling.`,
            questions: [
                `Do you think hiding strong emotion in public is a sign of strength, politeness, or something lost?`,
                `Are there situations where you deliberately show less than you feel — and does it cost you anything?`,
                `In your own family, were some feelings fine to show openly and others kept firmly private?`
            ]
        }
    },
    {
        id: `cl-japan-samurai`,
        location: `Feudal Japan`,
        title: `Composure as the highest honour`,
        teaser: `Where staying calm mattered even in the face of death.`,
        insight: `Among the samurai of feudal Japan, emotional composure was held as a central virtue — warriors were expected to remain calm and dignified even when facing death. Losing control of one's emotions in a critical moment could be seen as a loss of honour, not merely a personal weakness. Character here was measured less by what a person felt and more by their ability to master the outward expression of it when it mattered most.`,
        question: `Do you admire people who stay calm and controlled in extreme moments — or do you sometimes trust open emotion more than a composed surface?`,
        upgrade: {
            term: `steadiness`,
            type: `noun`,
            def: `A calm, controlled quality that stays present under pressure.`,
            in_action: `What impressed people was her steadiness — everyone else panicked, but she kept thinking clearly.`,
            review_prompt: `Where does steadiness matter more than showing strong emotion?`
        },
        deeper: {
            text: `The samurai ideal points to something many cultures share in some form: the belief that the measure of character is not the absence of strong feeling, but the ability to govern it under pressure. The reasoning is that anyone can stay calm when nothing is at stake — true self-mastery only shows when the stakes are highest. Yet this ideal carries a familiar tension. Prized too far, composure can shade into emotional distance, or into an inability to ask for help when it is genuinely needed. Modern versions appear in any high-pressure world — surgery, aviation, leadership — where steadiness is essential, but where the same trait, pushed too hard, can leave a person unreachable. As ever, the calm exterior tells you how someone is behaving, not necessarily what they are carrying.`,
            questions: [
                `Is there a situation in your life where staying composed is expected of you, even when you do not feel it?`,
                `Do you think it is possible to be too controlled — to the point that it becomes a problem?`,
                `Who do you know who stays calm under pressure, and do you read it as strength, distance, or both?`
            ]
        }
    },
    {
        id: `cl-medieval-court`,
        location: `Medieval royal courts`,
        title: `The self you performed to survive`,
        teaser: `One careless laugh could cost you your standing.`,
        insight: `In the strict royal courts of medieval Europe, how you behaved could matter as much as who you were. Laughing too loudly, speaking too casually, or letting the wrong expression cross your face could damage your standing in an instant. Personality at court was something to be carefully managed and performed — a polished public self, maintained at all times, often quite separate from whatever the person actually felt.`,
        question: `Are there places in your life — work, certain social settings — where you feel you have to perform a careful version of yourself rather than simply be relaxed?`,
        upgrade: {
            term: `public persona`,
            type: `noun phrase`,
            def: `The version of yourself you show in public, especially when it is more controlled than your private self.`,
            in_action: `At work he has a polished public persona, but with close friends he is much warmer and sillier.`,
            review_prompt: `Where do people usually show a more controlled public persona?`
        },
        deeper: {
            text: `The medieval court is an extreme case of something almost everyone does to some degree: adjusting our character to fit the rules of the room. Where the cost of a slip is high — to status, safety, or reputation — people naturally develop a more controlled, performed self. The interesting question is what this performance does over time. A carefully maintained public self can become so habitual that the line between performing and being blurs, and a person may struggle to locate where the "real" them ends and the role begins. We see gentler versions in corporate culture, in politics, in any environment where image is currency. The point is not that performance is dishonest — almost all social life involves some — but that the more tightly a self is policed, the harder it can be for anyone, including the person themselves, to see clearly underneath.`,
            questions: [
                `Where do you feel the gap between your performed self and your relaxed self is widest?`,
                `Do you think a strongly performed public role can slowly change who a person actually becomes?`,
                `Have you ever watched someone drop the performance, and seen a noticeably different person underneath?`
            ]
        }
    },
    {
        id: `cl-court-jester`,
        location: `The medieval court jester`,
        title: `The one allowed to be honest`,
        teaser: `A single role with permission everyone else was denied.`,
        insight: `In many royal courts, the jester occupied a strange and privileged position: through humour, they could mock powerful rulers and voice uncomfortable truths that would have been dangerous from anyone else. Their character — playful, sharp, seemingly foolish — earned them a freedom others did not have. It is a striking example of how a social role can give a personality permission: the same words were permitted from the fool and forbidden from the courtier.`,
        question: `Is there someone in your life or workplace who is "allowed" to say things others cannot — and what is it about them that gives them that freedom?`,
        upgrade: {
            term: `get away with`,
            type: `phrasal verb`,
            def: `To do or say something risky or rule-breaking without facing the consequences others would.`,
            in_action: `He gets away with saying things in meetings that would get anyone else in trouble — somehow it always comes across as charm.`,
            review_prompt: `Who do you know who gets away with saying what others cannot? Why do you think they can?`
        },
        deeper: {
            text: `The jester reveals something that still operates in modern groups: certain roles come with a hidden permission slip. The person seen as the funny one, the harmless one, or the outsider can sometimes voice criticism that would be unacceptable from a rival or a subordinate — humour and a non-threatening character disarm what would otherwise feel like an attack. This is why comedy has so often carried serious political weight: the laugh provides cover for the truth. In offices, families, and friend groups, the same dynamic appears — the one who can "get away with" honesty is usually the one whose character makes the honesty feel safe. It is worth noticing, because it reveals how much of what we are "allowed" to say depends not on the words themselves, but on the role we are read as occupying.`,
            questions: [
                `Are you ever the person who says the thing nobody else will — and how is it usually received?`,
                `Why do you think humour makes a difficult truth easier to accept than a direct statement?`,
                `Have you noticed that the same comment can be fine from one person and offensive from another?`
            ]
        }
    },
    {
        id: `cl-honour-shame-cultures`,
        location: `Communal and individualist societies`,
        title: `Is character yours, or your family's?`,
        teaser: `In some places, your behaviour is never only your own.`,
        insight: `In many communal cultures, a person's behaviour is understood to reflect on their whole family or group, not only on themselves — so character is partly a shared responsibility rather than a purely private matter. In more individualist cultures, behaviour is read mainly as an expression of the individual alone. This shapes how people act: where reputation is collective, there can be far stronger pressure to display the traits the group values and to avoid bringing shame on others.`,
        question: `Can you think of a time you acted differently — more carefully, or held something back — because of how it might reflect on your family or group rather than just on you?`,
        upgrade: {
            term: `a reflection on`,
            type: `noun phrase`,
            def: `Something that reveals or affects how a related person or group is judged, beyond the individual involved.`,
            in_action: `In my parents' eyes, how I behave in public is a reflection on the whole family, not just on me.`,
            review_prompt: `In what situations do your actions feel like a reflection on more than just yourself?`
        },
        deeper: {
            text: `Whether character is read as individual or collective changes the very meaning of a person's behaviour. In more individualist settings, a young person acting unwisely is usually seen as their own concern; in more communal settings, the same act may be felt as affecting parents, siblings, and the family name. Neither framing is simply right — each carries something. A strong sense of collective reputation can foster real responsibility, belonging, and care for how one's actions affect others; it can also create heavy pressure to conform and to hide anything that might reflect badly on the group. For someone moving between these worlds, the misreadings can be sharp: what looks like excessive caution from one side can look like basic respect from the other. Understanding which frame a person is operating in often explains behaviour that would otherwise seem puzzling.`,
            questions: [
                `Growing up, were you taught that your behaviour affected your family's reputation — and how did that feel?`,
                `Do you think a strong sense of collective reputation builds responsibility, creates pressure, or both?`,
                `Have you ever misread someone's caution or boldness because they were operating by a different rule about whose reputation was at stake?`
            ]
        }
    },
    {
        id: `cl-online-performance`,
        location: `Today's online life`,
        title: `The edited self`,
        teaser: `Funnier, kinder, more confident — and not quite real.`,
        insight: `Online, people often present a sharpened version of themselves — funnier, more confident, more attractive, or more certain than they feel offline. This is not always dishonesty; it can be a natural response to a setting that rewards a polished, performable self. But it widens the familiar gap between the displayed character and the lived one, and it can quietly distort how people judge both others and themselves, comparing their messy inner life to everyone else's edited surface.`,
        question: `Do you think the version of yourself you present online is close to who you really are — or a noticeably edited one? What gets left out?`,
        upgrade: {
            term: `curate`,
            type: `verb`,
            def: `To carefully select and present only certain parts of something — here, the version of yourself you show others.`,
            in_action: `Her feed is beautifully curated, but she is the first to admit it shows almost nothing of an ordinary, difficult day.`,
            review_prompt: `What do you tend to curate out of the version of yourself you show online?`
        },
        deeper: {
            text: `The edited online self is the latest chapter in a very old story — people have always managed how they appear, from court manners to the composed public face. What has changed is the scale and the constancy: the performance is now continuous, visible to many, and measured in reactions. This intensifies an effect worth naming: when we compare our unedited inner experience to everyone else's curated outer one, almost everyone can end up feeling they fall short. It also blurs self-perception, as the performed self starts to shape how people see themselves, not only how others see them. The deeper thread connecting this card to the rest is constant — across Sparta, the Victorian drawing room, the court, and the feed, the same question keeps returning: how far is the self we show the self we are?`,
            questions: [
                `When you compare your real life to other people's online versions, how does it affect how you feel about yourself?`,
                `Do you think performing a more confident self online can, over time, actually change who you are offline?`,
                `Where is the line, for you, between presenting yourself well and presenting someone who is not quite you?`
            ]
        }
    },
    {
        id: `cl-age-and-character`,
        location: `Life stages across cultures`,
        title: `The traits your age allows you`,
        teaser: `The same behaviour, forgiven at twenty, frowned on at fifty.`,
        insight: `In most cultures, the same person is permitted very different traits at different stages of life. Boldness, recklessness, or strong opinions are often tolerated, even expected, in the young — "they will grow out of it" — while the same qualities in an older person can read as undignified or stubborn. Calm, restraint, and settledness are quietly demanded with age. What we read as someone's fixed character is partly the version their current life stage is allowed to show.`,
        question: `Are there things you did comfortably when you were younger that would feel strange to do now — or traits you have only felt allowed to show as you have got older?`,
        upgrade: {
            term: `act your age`,
            type: `idiom`,
            def: `To behave in a way considered appropriate for how old you are, rather than younger.`,
            in_action: `He was told more than once to act his age, but honestly his sense of fun is the best thing about him.`,
            review_prompt: `Is there something you do that others think you are "too old" or "too young" for? How do you feel about that?`
        },
        deeper: {
            text: `The traits a person is allowed to display shift with age, and the rules vary sharply across cultures. In some societies, age brings rising authority and the right to speak plainly, so older people grow more outspoken, not less; in others, the expectation tips toward gentleness and stepping back. The young face the mirror image — granted licence to experiment in some cultures, held to strict respect and restraint in others. This matters for how we read people: a quality we treat as someone's permanent character may really be the trait their stage of life currently permits, and it may change as their social position does. The bold young person and the mellow older one may not have different essences at all — they may be the same disposition, shown through whatever the moment allows. It is another version of the question running through this whole subject: how much of "who someone is" is simply what they are, at this point, allowed to be.`,
            questions: [
                `In your culture, do people generally become more outspoken with age, or more reserved? Has that been true for you?`,
                `Is there a part of your personality you feel freer to show now than you did when you were younger?`,
                `Have you ever judged someone for not "acting their age" — and was that judgement really fair?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-first-impressions`,
        title: `First Impressions`,
        desc: `Quick reactions to the way we read people — the snap judgements, the surprises, and the gap between what someone shows and who they turn out to be.`,
        icon: `react`,
        moments: [
            {
                id: `moment-first-thirty-seconds`,
                preview: `You decided before they finished their sentence.`,
                text: `We often form an impression of someone within the first minute of meeting them — sometimes before they have really said anything. When you meet someone new, what do you notice first: the way they speak, how they hold themselves, their energy, or something you could not quite name?`,
                upgrade: {
                    term: `rub someone up the wrong way`,
                    type: `idiom`,
                    def: `To irritate or annoy someone, often without meaning to, usually from the very first interaction.`,
                    in_action: `I do not know what it was, but he rubbed me up the wrong way the moment he walked in — something about his manner.`,
                    review_prompt: `Has someone ever rubbed you up the wrong way for no clear reason? What was it?`
                }
            },
            {
                id: `moment-different-with-everyone`,
                preview: `Loud here, silent there — same person.`,
                text: `Most of us behave quite differently depending on who we are with — bolder with close friends, quieter at work, more patient with strangers than family. Where do you feel most like yourself, and where do you feel you are holding part of yourself back?`,
                upgrade: {
                    term: `in your element`,
                    type: `idiom`,
                    def: `Completely comfortable and at your best, doing something that suits you naturally.`,
                    in_action: `Put her in a room full of strangers and she is in her element — she comes alive, while I just want to leave.`,
                    review_prompt: `Where or with whom are you most in your element — and what brings it out?`
                }
            },
            {
                id: `moment-wrong-about-someone`,
                preview: `You had them completely figured out. You were wrong.`,
                text: `Think of a time your first impression of someone turned out to be completely wrong — the quiet one who was actually the funniest, or the confident one who turned out to be insecure. What had you misread, and what changed your mind?`,
                upgrade: {
                    term: `grow on you`,
                    type: `phrasal verb`,
                    def: `When someone or something you did not like at first gradually becomes likeable the more you experience it.`,
                    in_action: `I could not stand him at first, but he really grew on me — once you get past the bluntness he is actually very kind.`,
                    review_prompt: `Think of someone who grew on you over time. What changed how you saw them?`
                }
            },
            {
                id: `moment-hidden-side`,
                preview: `The version of them nobody at work would believe.`,
                text: `Some people have a side that only certain people get to see — a serious person who is silly with their kids, or a cheerful colleague who is quite private underneath. Have you ever seen a completely different side of someone you thought you knew well?`,
                upgrade: {
                    term: `a different side to someone`,
                    type: `spoken phrase`,
                    def: `A part of a person's character that is not usually visible and surprises you when it appears.`,
                    in_action: `At the funeral I saw a completely different side to my boss — gentle and emotional, nothing like the office version of him.`,
                    review_prompt: `When have you seen a different side to someone you thought you knew? What surprised you?`
                }
            },
            {
                id: `moment-trait-you-notice`,
                preview: `The one thing you clock in everyone.`,
                text: `Some people instantly notice whether someone is kind; others pick up on confidence, humour, or whether a person seems genuine. When you meet someone, which quality do you tend to register first — and why do you think that one matters most to you?`,
                upgrade: {
                    term: `size someone up`,
                    type: `phrasal verb`,
                    def: `To quickly form a judgement about what a person is like, often within the first moments of meeting them.`,
                    in_action: `She sizes people up fast — within five minutes she could tell he was nervous rather than arrogant.`,
                    review_prompt: `What quality do you size up fastest in new people — and how?`
                }
            }
        ],
        makeItReal: {
            title: `The person who surprised you`,
            prompt: `Think of someone in your life who turned out to be very different from your first impression of them. What did you assume at the start, how did you start to see a fuller picture, and what did that teach you about reading people?`
        }
    },
    {
        id: `set-where-it-comes-from`,
        title: `Where It Comes From`,
        desc: `Go deeper into why people are the way they are — what shapes a character, which parts are chosen, and how the same trait can be a strength in one setting and a problem in another.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-born-or-made`,
                preview: `Were you always like this, or did life do it?`,
                text: `Some of our traits seem to have been there since childhood, while others clearly came from experiences, work, or the people around us. Think of one strong part of your character — do you think you were born with it, or did something shape it into you?`,
                upgrade: {
                    term: `second nature`,
                    type: `idiom`,
                    def: `Something you do so easily and automatically that it feels natural, usually because of long habit or practice.`,
                    in_action: `Staying calm under pressure is second nature to her now, but she taught herself to do it after years in that job.`,
                    review_prompt: `What is something that is second nature to you now but had to be learned?`
                }
            },
            {
                id: `moment-strength-and-flaw`,
                preview: `The thing people love about you is the thing they complain about.`,
                text: `A lot of traits are a strength and a weakness at the same time — being very driven can tip into being difficult to relax with; being kind can tip into being unable to say no. Take one of your own qualities: when is it an asset, and when does it work against you?`,
                upgrade: {
                    term: `double-edged sword`,
                    type: `idiom`,
                    def: `Something that has both a clear advantage and a real disadvantage built into it.`,
                    in_action: `His honesty is a double-edged sword — people trust him completely, but he has hurt a few feelings along the way.`,
                    review_prompt: `Which of your strengths is a double-edged sword? Describe both sides.`
                }
            },
            {
                id: `moment-shaped-by-others`,
                preview: `You picked it up from someone without noticing.`,
                text: `We often absorb traits from the people we grow up around or spend years with — a parent's sense of humour, a mentor's calm, a friend's way of handling conflict. Is there a part of your character you can trace directly back to someone else? How did it pass to you?`,
                upgrade: {
                    term: `take after someone`,
                    type: `phrasal verb`,
                    def: `To resemble an older relative or influential person in character, behaviour, or appearance.`,
                    in_action: `I take after my mother far more than I would like to admit — same stubbornness, same need to fix everyone's problems.`,
                    review_prompt: `Who do you take after most, and in which specific trait?`
                }
            },
            {
                id: `moment-acting-the-part`,
                preview: `Confident on the outside, working hard underneath.`,
                text: `Sometimes we perform a trait we do not fully feel — acting confident in an interview, staying patient when we are frustrated, seeming relaxed when we are nervous. When was a time you played a version of yourself that was not quite how you felt inside, and why did you do it?`,
                upgrade: {
                    term: `fake it till you make it`,
                    type: `spoken phrase`,
                    def: `To act more confident or capable than you feel, on the idea that the real feeling will eventually follow.`,
                    in_action: `She faked it till she made it during the presentation — her hands were shaking, but no one watching could tell.`,
                    review_prompt: `When did you have to fake it till you made it? What were you hiding underneath?`
                }
            },
            {
                id: `moment-changes-with-power`,
                preview: `Same person, new title. Watch what happens.`,
                text: `People sometimes seem to change when their situation changes — when they gain authority, money, stress, or status. Have you ever watched someone's character shift because of a new role or pressure? Did it bring out a side that was already there, or turn them into someone different?`,
                upgrade: {
                    term: `go to someone's head`,
                    type: `idiom`,
                    def: `When success, power, or praise makes a person arrogant or changes their behaviour for the worse.`,
                    in_action: `The promotion completely went to his head — six months in and he barely speaks to the people he used to have lunch with.`,
                    review_prompt: `Have you seen success go to someone's head? What changed in them?`
                }
            }
        ],
        makeItReal: {
            title: `The making of a trait`,
            prompt: `Pick one quality that you think defines you — good or difficult — and trace where it came from. Was it always there, did someone pass it to you, or did a particular experience build it? Tell the story of how that part of you came to be.`
        }
    },
    {
        id: `set-the-real-you`,
        title: `The Real You`,
        desc: `The conversation turns inward — how you see your own character, how others read you, the parts you show and hide, and who you are still becoming.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-how-others-describe-you`,
                preview: `Three words. Would they match yours?`,
                text: `If three people who know you well were asked to describe your character in a few words, what do you think they would say — and would it match how you see yourself? Where do you think the picture others have of you and the one you have of yourself drift apart?`,
                upgrade: {
                    term: `give off`,
                    type: `phrasal verb`,
                    def: `To project a particular impression or quality to other people, sometimes without intending to.`,
                    in_action: `I give off a confident impression apparently, but inside I am usually second-guessing everything I say.`,
                    review_prompt: `What do you give off to others that does not match how you feel inside?`
                }
            },
            {
                id: `moment-trait-you-would-change`,
                preview: `The part of you that you keep meaning to fix.`,
                text: `Most of us have one part of our character we wish were different — too quick to anger, too eager to please, too guarded. Is there a trait of yours you have tried to change? How easy or hard has it actually been to shift something so deep in you?`,
                upgrade: {
                    term: `set in your ways`,
                    type: `idiom`,
                    def: `Having fixed habits, opinions, or character that are difficult or unlikely to change.`,
                    in_action: `I keep telling myself I will be more patient, but at this point I am fairly set in my ways.`,
                    review_prompt: `Which of your ways are you most set in — and have you made peace with it or not?`
                }
            },
            {
                id: `moment-real-self-private`,
                preview: `The you that nobody is watching.`,
                text: `Some people feel they are most themselves with others; some feel most themselves completely alone. When you are on your own, with no one to react to, does a different version of you appear — and is that one more "real," or just another side?`,
                upgrade: {
                    term: `open up`,
                    type: `phrasal verb`,
                    def: `To become more honest, relaxed, or emotionally open with someone.`,
                    in_action: `It takes me a long time to open up, but once I trust someone they see a much softer side of me.`,
                    review_prompt: `Who do people usually open up with, and what makes that feel safe?`
                }
            },
            {
                id: `moment-reputation-vs-truth`,
                preview: `People think they know exactly who you are.`,
                text: `Sometimes people decide what kind of person you are — "the reliable one," "the funny one," "the difficult one" — and that label sticks, whether or not it is still true. Have you ever felt boxed in by a reputation or a role that did not match who you actually are now?`,
                upgrade: {
                    term: `shake off`,
                    type: `phrasal verb`,
                    def: `To get rid of an unwanted image, habit, feeling, or reputation over time.`,
                    in_action: `It took years to shake off the quiet-one reputation, even after I had become much more confident.`,
                    review_prompt: `What kind of reputation is hardest to shake off?`
                }
            },
            {
                id: `moment-who-you-are-becoming`,
                preview: `You are not finished yet.`,
                text: `Character is not fixed — most of us are still becoming someone, shaped by what we go through. Looking at how you have changed over the past few years, who are you becoming? Is there a version of yourself you are deliberately growing into?`,
                upgrade: {
                    term: `grow into yourself`,
                    type: `spoken phrase`,
                    def: `To gradually become more comfortable and settled in your own character and identity over time.`,
                    in_action: `She spent her twenties unsure of who she was, but lately she has really grown into herself — calmer, surer, more herself.`,
                    review_prompt: `In what way are you growing into yourself right now — what is settling?`
                }
            }
        ],
        makeItReal: {
            title: `The character you are still writing`,
            prompt: `Think about who you are now compared to who you were five or ten years ago. What part of your character has genuinely changed, what has stayed constant no matter what, and is there a version of yourself you are still working towards? Tell the story of how you became who you are — and where you are still heading.`
        }
    }
];
