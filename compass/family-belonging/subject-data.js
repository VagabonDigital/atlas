/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Family & Belonging
  --------------------------------------------------------------------------
  A premium interactive speaking subject about the small strange country
  you were born into: its private language, its unwritten laws, its running
  accounts, and the version of its history that everybody disputes.
  The Compass subject where the learner is both the unreliable narrator
  and the defence lawyer.
  Compass active subject · contentVersion 3.1.1
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'family-belonging',
    schemaVersion: 2,
    contentVersion: '3.1.1',
    title: 'Family & Belonging',
    titleHtml: 'Family & <em>Belonging</em>',
    navTitle: 'Family',
    bgImage: 'https://revistavelvet.cl/wp-content/uploads/2022/08/Modern-Family.jpg'
};

const subjectCopy = {
    cover: {
        hook: `Every family thinks it’s the normal one.`
    },

    overview: {
        heading: `What Makes It Feel Like Family?`,
        intro: [
            `Families do not all look or work the same. People can become family through birth, marriage, care, or simply sharing life for a long time. Every family develops its own habits, roles, jokes, and rules.`
        ],
        question: `What is one everyday thing that can make people feel like a family — sharing meals, helping each other, laughing together, or something else?`
    },

    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Private rules, uneven responsibilities, difficult questions, inherited habits, and the things worth passing on.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `Explore naming rules, inherited roles, chosen relatives, family duty, and different ways of deciding who belongs.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to reconsider what makes a family, what it asks of people, and what continues through them.`
    },

    culturalLens: {
        heading: `Who Counts as Family?`,
        intro: `A stranger can become a legal son. Children raised apart can still become siblings. A dead relative may continue receiving family news. Explore arrangements that change who is recognised as family, who inherits, and who is expected to help.`
    },

    discussion: {
        heading: `The House You Come From`
    },

    reflection: {
        title: `What Will Continue?`,
        summary: `Look back at the rules, responsibilities, relationships, and practices that people inherit, reject, or create for themselves.`,
        questions: [
            `Which family practice would you deliberately pass on — and which pattern would you stop?`,
            `Who, real or fictional, feels like family because of what they did rather than how they were related?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing family roles, setting boundaries, sharing responsibility, and explaining what continues across generations.`
    }
};

const discussionSets = [
    {
        id: 'set-nobody-sits-there',
        title: `How a Family Works`,
        stage: `First Look`,
        icon: 'first-look',
        description: `The people, habits, places, and small rules that make each family different. Use your own family, another family, or a fictional one.`,
        moments: [
            {
                id: 'moment-the-family-word',
                preview: `Everyone arrives. The usual roles appear.`,
                question: `When your family gets together, who usually takes charge, who talks most, and who stays out of the way?`,
                upgrade: {
                    term: `fall into a role`,
                    type: `phrase`,
                    definition: `To begin behaving in the familiar way people expect within a group.`,
                    ordinary: `“As soon as everyone arrives, my aunt starts organising and my brother starts making jokes.”`,
                    upgraded: `“As soon as everyone arrives, we all fall into our usual roles.”`,
                    priority: 'key',
                    atlasPrompt: `What role do you naturally fall into in a team, class, or group of friends?`
                }
            },
            {
                id: 'moment-nobody-sits-there',
                preview: `Nobody explains it. Everyone seems to know.`,
                question: `What is one unspoken rule in your family — about food, seats, time, certain topics, or who does what? How would a newcomer discover it?`,
                upgrade: {
                    term: `an unspoken rule`,
                    type: `phrase`,
                    definition: `A rule that people understand and follow even though nobody states it directly.`,
                    ordinary: `“Nobody told me, but everyone expected me not to sit in that chair.”`,
                    upgraded: `“There was an unspoken rule that I should not sit in that chair.”`,
                    priority: 'key',
                    atlasPrompt: `What unspoken rule exists in a workplace, classroom, or group you know?`
                }
            },
            {
                id: 'moment-the-story-that-grew',
                preview: `The same story comes back again.`,
                question: `What story does your family tell again and again? What part does everyone remember or laugh about?`,
                upgrade: {
                    term: `bring something up`,
                    type: `phrasal verb`,
                    definition: `To mention a subject, event, or memory in a conversation.`,
                    ordinary: `“My family still mentions the time I missed the flight at every birthday.”`,
                    upgraded: `“My family still brings up the time I missed the flight at every birthday.”`,
                    priority: 'standard',
                    atlasPrompt: `What old story or mistake does a group you know keep bringing up?`
                }
            },
            {
                id: 'moment-the-house-gives-it-away',
                preview: `One detail tells you exactly where you are.`,
                question: `Which family home feels instantly recognisable to you — because of a smell, sound, object, or routine?`,
                upgrade: {
                    term: `have someone’s stamp all over it`,
                    type: `phrase`,
                    definition: `To clearly show a particular person’s style, influence, or personality.`,
                    ordinary: `“You can tell immediately that it is her home from the colours, objects, and atmosphere.”`,
                    upgraded: `“The whole house has her stamp all over it.”`,
                    priority: 'standard',
                    atlasPrompt: `What place, project, or piece of work has someone’s stamp all over it?`
                }
            },
            {
                id: 'moment-meeting-them-for-the-first-time',
                preview: `They want to feel welcome.`,
                question: `A friend is meeting your family for the first time. What should they know, and who will probably make them feel welcome?`,
                upgrade: {
                    term: `feel at home`,
                    type: `phrase`,
                    definition: `To feel relaxed, comfortable, and accepted in a place or group.`,
                    ordinary: `“She included him in the conversation and quickly made him feel comfortable.”`,
                    upgraded: `“She included him in the conversation and quickly made him feel at home.”`,
                    priority: 'key',
                    atlasPrompt: `What helps you feel at home in a new workplace, class, place, or group?`
                }
            }
        ],
        makeItReal: {
            title: `Before You Go In`,
            prompt: `Your tutor is joining the family for a meal or gathering for the first time. Give them three useful pieces of advice. Your tutor then chooses one thing to say or do, and you explain how the family would react.`
        }
    },
    {
        id: 'set-keeping-score',
        title: `Somebody’s Keeping Score`,
        stage: `Closer Look`,
        icon: 'closer-look',
        description: `Favouritism, invisible work, money, intrusive questions, and the first move after a long silence.`,
        moments: [
            {
                id: 'moment-the-favourite',
                preview: `There is one. Everybody denies it.`,
                question: `A family is accused of having a favourite. What evidence would convince you? What could look unfair but have another explanation?`,
                upgrade: {
                    term: `favouritism`,
                    type: `noun`,
                    definition: `Unfairly treating one person better than others.`,
                    ordinary: `“The parents clearly treat their youngest child better than the others.”`,
                    upgraded: `“The parents show obvious favouritism towards their youngest child.”`,
                    priority: 'key',
                    atlasPrompt: `Where is favouritism most damaging — in a family, workplace, classroom, or team?`
                }
            },
            {
                id: 'moment-the-one-who-does-everything',
                preview: `The birthdays, the hospital, the food, the bookings.`,
                question: `Who in your family remembers the birthdays, makes the plans, and checks that everyone is okay? What do the others rely on them to do without even noticing?`,
                upgrade: {
                    term: `take someone for granted`,
                    type: `phrase`,
                    definition: `To fail to appreciate someone because you assume they will always help.`,
                    ordinary: `“Everyone expects her to organise everything and rarely thanks her.”`,
                    upgraded: `“Everyone takes her for granted.”`,
                    priority: 'key',
                    atlasPrompt: `Who is most likely to be taken for granted inside a team, household, or community?`
                }
            },
            {
                id: 'moment-lending-money',
                preview: `A relative asks for the equivalent of one month’s rent.`,
                question: `Would you lend the full amount, give a smaller amount, or refuse? What agreement would protect the relationship afterwards?`,
                upgrade: {
                    term: `repayment`,
                    type: `noun`,
                    definition: `Money returned to someone after it was borrowed.`,
                    ordinary: `“We agreed how much he would pay back each month.”`,
                    upgraded: `“We agreed on a monthly repayment plan.”`,
                    priority: 'standard',
                    atlasPrompt: `When should repayment terms be agreed clearly rather than left to trust?`
                }
            },
            {
                id: 'moment-the-question-nobody-asked-for',
                preview: `“And when are you going to settle down?”`,
                question: `A relative asks, “When are you going to settle down?” Give the answer you would actually use. What would make the same question feel caring rather than intrusive?`,
                upgrade: {
                    term: `overstep`,
                    type: `verb`,
                    definition: `To go beyond an acceptable social or personal boundary.`,
                    ordinary: `“She meant to help, but the question was too personal.”`,
                    upgraded: `“She meant to help, but she overstepped.”`,
                    priority: 'key',
                    atlasPrompt: `When can someone overstep by offering advice, asking questions, making jokes, or showing concern?`
                }
            },
            {
                id: 'moment-the-first-message',
                preview: `They have not spoken in years. A wedding is coming.`,
                question: `Two relatives who have not spoken for years will attend the same wedding. Write the first sentence of a message that might make the day easier. What must it avoid saying?`,
                upgrade: {
                    term: `reach out`,
                    type: `phrasal verb`,
                    definition: `To contact someone, especially after distance, silence, or difficulty.`,
                    ordinary: `“After several years of silence, she contacted her brother.”`,
                    upgraded: `“After several years of silence, she reached out to her brother.”`,
                    priority: 'standard',
                    atlasPrompt: `When is it worth reaching out first, even when you believe the other person should do it?`
                }
            }
        ],
        makeItReal: {
            title: `Argue the Other Side`,
            prompt: `Choose a family disagreement about money, responsibility, a wedding, or favouritism. Argue the side you disagree with as convincingly as possible, then identify one part of that position you understand better.`
        }
    },
    {
        id: 'set-the-bits-you-kept',
        title: `What Stays, What Changes`,
        stage: `Wider View`,
        icon: 'wider-view',
        description: `Habits that reappear, people who become family, patterns that end, traditions that continue, and influence that remains.`,
        moments: [
            {
                id: 'moment-you-have-become-them',
                preview: `That is your mother’s exact sigh.`,
                question: `Show or describe one small habit you recognise from an older relative — a phrase, sigh, routine, or gesture. When did you first notice it in yourself or somebody else?`,
                upgrade: {
                    term: `catch yourself doing something`,
                    type: `phrase`,
                    definition: `To suddenly notice that you are doing something without consciously deciding to.`,
                    ordinary: `“I suddenly noticed that I was using exactly the same phrase as my mother.”`,
                    upgraded: `“I caught myself using exactly the same phrase as my mother.”`,
                    priority: 'key',
                    atlasPrompt: `What habit have you caught yourself developing without intending to?`
                }
            },
            {
                id: 'moment-who-you-took-in',
                preview: `They arrived as a guest. Then nobody asked when they were leaving.`,
                question: `Think of someone who arrived as a guest and gradually became part of the family. What changed when they stopped feeling like a guest?`,
                upgrade: {
                    term: `become one of the family`,
                    type: `phrase`,
                    definition: `To become accepted and treated as a full member of a family or close group.`,
                    ordinary: `“After a few months, nobody treated him like a guest anymore.”`,
                    upgraded: `“After a few months, he had become one of the family.”`,
                    priority: 'standard',
                    atlasPrompt: `Who became one of the family even though they were not originally related?`
                }
            },
            {
                id: 'moment-the-thing-you-refused',
                preview: `That pattern ends here.`,
                question: `Choose one family rule, routine, or way of arguing that you would not continue. What would you replace it with?`,
                upgrade: {
                    term: `draw the line at something`,
                    type: `idiom`,
                    definition: `To refuse to accept or continue something beyond a firm limit.`,
                    ordinary: `“I will keep many family traditions, but I refuse to continue the shouting.”`,
                    upgraded: `“I will keep many family traditions, but I draw the line at the shouting.”`,
                    priority: 'key',
                    atlasPrompt: `What behaviour or demand do you draw the line at in an important relationship?`
                }
            },
            {
                id: 'moment-what-you-would-keep',
                preview: `One practice reaches the next generation.`,
                question: `Choose one family practice worth passing on — a dish, greeting, celebration, or way of helping. How would you persuade a younger person that it is worth keeping?`,
                upgrade: {
                    term: `pass something down`,
                    type: `phrasal verb`,
                    definition: `To give knowledge, property, or a tradition to a younger generation.`,
                    ordinary: `“The recipe has moved from one generation of the family to the next.”`,
                    upgraded: `“The recipe has been passed down through the family.”`,
                    priority: 'standard',
                    atlasPrompt: `What skill, story, object, or principle is worth passing down?`
                }
            },
            {
                id: 'moment-still-winning-arguments',
                preview: `They are gone. Their influence is not.`,
                question: `Think of someone who is no longer alive but still influences a family. What do people still say or do because of them?`,
                upgrade: {
                    term: `live on`,
                    type: `phrasal verb`,
                    definition: `To continue existing or influencing people after someone has died or something has ended.`,
                    ordinary: `“Her habits and traditions still continue throughout the family.”`,
                    upgraded: `“Her habits and traditions live on throughout the family.”`,
                    priority: 'standard',
                    atlasPrompt: `Whose ideas, habits, standards, or creations continue to live on?`
                }
            }
        ],
        makeItReal: {
            title: `In Fifty Years`,
            prompt: `Choose one family practice. Explain it precisely enough that somebody fifty years from now could repeat it: where it happens, when it begins, who is there, what each person does, and what usually goes wrong.`
        }
    }
];

const clCards = [
    {
        id: 'cl-iceland-names',
        contextLine: `Iceland`,
        title: `The Committee That Vetoes Your Baby’s Name`,
        teaser: `You chose the name. The state may still refuse it.`,

        context: `In Iceland, parents cannot always register any first name they choose. A new name may be checked against national naming rules before it is accepted. Family names also work differently: many children receive a surname based on a parent’s first name, so parents and children may not share one surname.`,

        mainQuestion: `A naming authority refuses the name you chose for your baby. Would you change it, appeal, or continue using it unofficially?`,

        followTheThread: [
            `Should a country be allowed to protect its language through naming rules?`,
            `Who should have the final decision about a baby’s name when relatives strongly disagree?`
        ],

        upgrade: {
            term: `have the final say`,
            type: `phrase`,
            definition: `To make the final decision after other people have given their opinions.`,
            ordinary: `“Everyone suggested names, but the parents made the final decision.”`,
            upgraded: `“Everyone suggested names, but the parents had the final say.”`,
            priority: 'standard',
            atlasPrompt: `Who has the final say in an important decision at your work or in a group you belong to?`
        }
    },

    {
        id: 'cl-milk-kinship',
        contextLine: `Islamic law · Milk kinship`,
        title: `The Sibling You Never Grew Up With`,
        teaser: `You lived in different homes, but the same woman breastfed you both.`,

        context: `Two children may grow up in different homes but still become family under Islamic law if the same woman breastfed them. Under specific conditions, they are treated as milk-siblings and cannot marry. The exact rules differ, but the bond can remain important long after childhood.`,

        mainQuestion: `You learn that someone you have never met is your milk-sibling. Would you want a relationship with them, or would the connection feel only official?`,

        followTheThread: [
            `What makes a sibling relationship feel real when two people did not grow up together?`,
            `Who feels like family to you despite having no biological or legal connection?`
        ],

        upgrade: {
            term: `in name only`,
            type: `phrase`,
            definition: `Officially described as something, but without the relationship or qualities usually expected.`,
            ordinary: `“He is officially my brother-in-law, but we have no real relationship.”`,
            upgraded: `“He is my brother-in-law in name only.”`,
            priority: 'standard',
            atlasPrompt: `What title, role, membership, or responsibility exists in name only?`
        }
    },

    {
        id: 'cl-primogeniture',
        contextLine: `Europe · Primogeniture`,
        title: `One Farm, Four Children`,
        teaser: `Divide the farm four ways and none of the pieces may support a family.`,

        context: `A family owns one working farm. If it is divided among four children, each piece may become too small to support a household. Under primogeniture, most or all of the land passed to one heir, often the eldest son. The other children had to build a future elsewhere.`,

        mainQuestion: `It is your farm and you have four children. Dividing it equally could destroy the business. What do you do?`,

        followTheThread: [
            `Should the child who stayed and worked on the farm receive more than the child who left?`,
            `What would the other children deserve if one person inherited almost everything?`
        ],

        upgrade: {
            term: `cut someone out`,
            type: `phrasal verb`,
            definition: `To deliberately exclude someone from a decision, arrangement, or inheritance.`,
            ordinary: `“He excluded his eldest daughter from the will and left everything to his son.”`,
            upgraded: `“He cut his eldest daughter out of the will and left everything to his son.”`,
            priority: 'key',
            atlasPrompt: `Who might be quietly cut out of a decision, project, conversation, or opportunity?`
        }
    },

    {
        id: 'cl-mukoyoshi',
        contextLine: `Japan`,
        title: `Adopting a Grown Man`,
        teaser: `The family needs a successor, so it adopts one.`,

        context: `In some Japanese family businesses, a family without a suitable successor has adopted an adult man, often a daughter’s husband or a trusted employee. He takes the family name, becomes a legal son, and may inherit the company. The business continues, but his position inside the family changes too.`,

        mainQuestion: `A family offers to adopt you as an adult, give you its name, and place you in charge of its company. Would you accept?`,

        followTheThread: [
            `Which would be hardest to change: your name, your family position, or your future career?`,
            `Should a family business pass to a relative, or to whoever is most capable of running it?`
        ],

        upgrade: {
            term: `take over`,
            type: `phrasal verb`,
            definition: `To become responsible for or gain control of something, especially a business or role.`,
            ordinary: `“He became responsible for the family company after the owner retired.”`,
            upgraded: `“He took over the family company after the owner retired.”`,
            priority: 'standard',
            atlasPrompt: `What would make you willing to take over a family business — and what would make you refuse?`
        }
    },

    {
        id: 'cl-rent-a-partner',
        contextLine: `China · Lunar New Year`,
        title: `Rent a Boyfriend, Save Your New Year`,
        teaser: `The family questions are coming, so you arrive with a hired answer.`,

        context: `Before Lunar New Year, some unmarried adults in China return home expecting repeated questions about marriage. Commercial services have offered hired partners for family visits. Before arriving together, the pair agrees on a name, personal history, behaviour, price, and the story they will tell the relatives.`,

        mainQuestion: `Would you hire someone to pretend to be your partner for one family visit, or would maintaining the lie be worse than answering the questions?`,

        followTheThread: [
            `What do relatives ask that a colleague or casual friend would never dare to ask?`,
            `Would the hired partner make the visit easier, or simply create a much larger problem later?`
        ],

        upgrade: {
            term: `keep someone off your back`,
            type: `phrase`,
            definition: `To stop someone from repeatedly questioning, criticising, or pressuring you.`,
            ordinary: `“I said I was seeing someone so that my relatives would stop asking about marriage.”`,
            upgraded: `“I said I was seeing someone to keep my relatives off my back.”`,
            priority: 'key',
            atlasPrompt: `What do people sometimes do purely to keep a boss, neighbour, landlord, or relative off their back?`
        }
    },

    {
        id: 'cl-akan-matrilineal',
        contextLine: `Ghana · Akan`,
        title: `Your Uncle, Not Your Father`,
        teaser: `A man dies. His sister’s children may inherit before his own children.`,

        context: `Kojo and Ama are brother and sister. Ama has two children, and Kojo has children of his own. In some Akan traditions in Ghana, family descent follows the mother’s side. This can give Ama’s children a stronger traditional right to Kojo’s family property than Kojo’s own children. A mother’s brother may also have important duties towards her children.`,

        mainQuestion: `Kojo’s property goes to Ama’s children rather than to his own children. What would feel fair to you?`,

        followTheThread: [
            `Should inheritance follow the family line, the parent-child relationship, or the person who did the most caring?`,
            `Who can hold major family responsibility without being somebody’s parent?`
        ],

        upgrade: {
            term: `have a claim to something`,
            type: `phrase`,
            definition: `To have a recognised reason or right to receive, own, or use something.`,
            ordinary: `“Ama’s children may have a stronger traditional right to the property.”`,
            upgraded: `“Ama’s children may have a stronger traditional claim to the property.”`,
            priority: 'standard',
            atlasPrompt: `Who should have the strongest claim to family property — the legal heir, the person who cared for it, or the person who needs it most?`
        }
    },

    {
        id: 'cl-sworn-virgins',
        contextLine: `Northern Albania`,
        title: `The Family Needed a Man`,
        teaser: `She promised never to marry and took the household’s male role.`,

        context: `Under customary law in parts of northern Albania, some women took a lifelong vow not to marry and lived publicly in a male social role. They could lead the household, inherit property, carry weapons, and sit with men. The vow changed their place in the community and lasted for life.`,

        mainQuestion: `She can inherit property and speak for the household, but she can never marry. Which part of that life would be hardest to accept?`,

        followTheThread: [
            `Has she gained freedom, or simply exchanged one restriction for another?`,
            `What responsibility has fallen to someone in your family because nobody else could or would take it?`
        ],

        upgrade: {
            term: `fall to someone`,
            type: `phrasal verb`,
            definition: `To become someone’s responsibility, often because nobody else is available to do it.`,
            ordinary: `“Nobody else was willing to do it, so caring for my grandmother became my aunt’s responsibility.”`,
            upgraded: `“Nobody else was willing, so it fell to my aunt to care for my grandmother.”`,
            priority: 'key',
            atlasPrompt: `What responsibility has fallen to you at work, at home, or inside a group because nobody else took it?`
        }
    },

    {
        id: 'cl-ancestor-altar',
        contextLine: `China and Vietnam`,
        title: `Telling the Dead Your News`,
        teaser: `The promotion arrives. Somebody still has to tell your grandmother.`,

        context: `In many Chinese and Vietnamese homes, photographs, incense, and small food offerings are placed on an ancestor altar. When a marriage, birth, promotion, or exam result arrives, a family member may stand in front of the altar and tell the dead person the news aloud.`,

        mainQuestion: `You receive important good news. Would you tell a relative who had died — and would speaking aloud change the moment for you?`,

        followTheThread: [
            `Which news would you still want an absent family member to hear?`,
            `Where do people go when they want to speak to someone who is no longer there?`
        ],

        upgrade: {
            term: `keep someone’s memory alive`,
            type: `phrase`,
            definition: `To continue remembering and honouring someone after they have died.`,
            ordinary: `“The family continues to remember her by telling her about every important event.”`,
            upgraded: `“The family keeps her memory alive by telling her about every important event.”`,
            priority: 'standard',
            atlasPrompt: `What keeps someone’s memory alive — stories, traditions, photographs, a place, or something they taught you?`
        }
    },

    {
        id: 'cl-grandmother-effect',
        contextLine: `Finland and Canada · Historical records`,
        title: `Why Grandmothers Matter`,
        teaser: `Children were more likely to survive when a grandmother lived nearby.`,

        context: `Researchers examined old family records in Finland and Canada. They found that children were more likely to survive when their mother’s mother was alive and lived nearby. The records show the pattern, but not the exact daily actions inside each household that made the difference.`,

        mainQuestion: `What do you imagine the grandmother changed in the family’s daily life?`,

        followTheThread: [
            `Which kind of help matters most when parents are exhausted or resources are limited?`,
            `Can a relative who lives far away provide the same kind of support?`
        ],

        upgrade: {
            term: `do the heavy lifting`,
            type: `phrase`,
            definition: `To do the hardest or most demanding part of the work.`,
            ordinary: `“My aunt handles the most difficult work in the family, but nobody notices.”`,
            upgraded: `“My aunt does the heavy lifting in the family, but nobody notices.”`,
            priority: 'key',
            atlasPrompt: `Who does the heavy lifting in a team, household, or community without receiving enough credit?`
        }
    }
];
