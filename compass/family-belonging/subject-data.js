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
    contentVersion: '3.1.0',
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
        heading: `Nobody Wrote It Down`,
        intro: [
            `Families are built from more than relatives. They run on private words, invisible jobs, inherited habits, old disagreements, and people who slowly stop being guests.`
        ],
        question: `What is one small sign that tells you somebody truly belongs in a family?`
    },

    paths: {
        culturalLensDescription: `Explore naming rules, inherited roles, chosen relatives, family duty, and different ways of deciding who belongs.`,
        discussionDescription: `Private rules, uneven responsibilities, difficult questions, inherited habits, and the things worth passing on.`,
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
        title: `Nobody Sits There`,
        stage: `React`,
        icon: 'react',
        description: `Private words, house rules, family stories, familiar rooms, and the warning every newcomer needs.`,
        moments: [
            {
                id: 'moment-the-family-word',
                preview: `Only this family knows what the word means.`,
                question: `Does your family use a word or phrase that other people would not understand — a nickname, a name for an object, or an inside joke? What does it mean?`,
                upgrade: {
                    term: `catch on`,
                    type: `phrasal verb`,
                    definition: `To become popular or widely used by a group.`,
                    ordinary: `“My brother invented the word, and soon everyone in the family was using it.”`,
                    upgraded: `“My brother invented the word, and it quickly caught on.”`,
                    priority: 'standard',
                    atlasPrompt: `What expression, nickname, or habit caught on inside a group you belong to?`
                }
            },
            {
                id: 'moment-nobody-sits-there',
                preview: `Nobody explains the rule. Everybody follows it.`,
                question: `Choose one unwritten rule from a family you know — a seat, a topic, a job, or a routine. How would a newcomer discover it, and what happens if they ignore it?`,
                upgrade: {
                    term: `there’ll be hell to pay`,
                    type: `idiom`,
                    definition: `There will be serious trouble because somebody will be extremely angry.`,
                    ordinary: `“If anyone sits in my father’s chair, he becomes furious.”`,
                    upgraded: `“If anyone sits in Dad’s chair, there’ll be hell to pay.”`,
                    priority: 'key',
                    atlasPrompt: `What minor rule could cause serious trouble if somebody ignored it?`
                }
            },
            {
                id: 'moment-the-story-that-grew',
                preview: `The same story returns. One detail gets bigger.`,
                question: `Tell one family story in the style of the person who usually tells it. Which detail becomes larger, funnier, or more dramatic each time?`,
                upgrade: {
                    term: `take on a life of its own`,
                    type: `phrase`,
                    definition: `To develop far beyond its original form and become difficult to control.`,
                    ordinary: `“The original event was small, but the family version has grown far beyond it.”`,
                    upgraded: `“The story has taken on a life of its own.”`,
                    priority: 'standard',
                    atlasPrompt: `What story, joke, rumour, or family tradition has taken on a life of its own?`
                }
            },
            {
                id: 'moment-the-house-gives-it-away',
                preview: `You know whose home it is before anyone speaks.`,
                question: `Picture a family home you know well. What tells you immediately whose home it is — a smell, a sound, an object, a mess, or something else?`,
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
                preview: `One warning. One piece of advice.`,
                question: `A partner or friend will meet the family for the first time. You may give them one warning and one piece of advice. What are they?`,
                upgrade: {
                    term: `be on your best behaviour`,
                    type: `phrase`,
                    definition: `To behave as politely and carefully as possible, especially when you want to make a good impression.`,
                    ordinary: `“I told him to behave as politely as possible around my grandmother.”`,
                    upgraded: `“I told him to be on his best behaviour around my grandmother.”`,
                    priority: 'standard',
                    atlasPrompt: `When do people suddenly become very careful to be on their best behaviour?`
                }
            }
        ],
        makeItReal: {
            title: `The Briefing`,
            prompt: `Someone is meeting a family you know for the first time next week. Brief them properly: where to sit, what not to mention, who to charm first, and who may corner them in the kitchen.`
        }
    },
    {
        id: 'set-keeping-score',
        title: `Somebody’s Keeping Score`,
        stage: `Explain`,
        icon: 'explain',
        description: `Favouritism, invisible work, money, intrusive questions, and the first move after a long silence.`,
        moments: [
            {
                id: 'moment-the-favourite',
                preview: `There is one. Everybody denies it.`,
                question: `Think of a real or fictional family accused of having a favourite. What evidence would convince you? What could look unfair but have another explanation?`,
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
                question: `Name the jobs one person quietly does to keep a family running. Which task should somebody else take over first?`,
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
            prompt: `Choose a family disagreement — real, fictional, or invented — about money, responsibility, a wedding, or favouritism. Argue the side you disagree with as convincingly as possible, then identify one part of that position you understand better.`
        }
    },
    {
        id: 'set-the-bits-you-kept',
        title: `What Stays, What Changes`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
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
                question: `Think of someone who came to stay with a family and gradually became part of it — someone real, fictional, or imagined. What changed when they stopped feeling like a guest?`,
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
                question: `Think of someone who is no longer alive but still influences a family you know — real or fictional. What do people still say or do because of them?`,
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
            prompt: `Choose one real family practice you know well. Explain it precisely enough that somebody fifty years from now could repeat it: where it happens, when it begins, who is there, what each person does, and what usually goes wrong.`
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
