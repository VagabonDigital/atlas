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
  Compass active subject · contentVersion 3.0.1
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'family-belonging',
    schemaVersion: 2,
    contentVersion: '3.0.1',
    title: 'Family & Belonging',
    titleHtml: 'Family & <em>Belonging</em>',
    navTitle: 'Family',
    bgImage: 'https://revistavelvet.cl/wp-content/uploads/2022/08/Modern-Family.jpg'
};

const subjectCopy = {
    cover: {
        hook: `Every family thinks it's the normal one.`
    },
    overview: {
        heading: `Nobody Wrote It Down`,
        intro: [
            `Every family runs on rules nobody wrote down. There is a chair you don't sit in, a subject you don't raise, a story that gets slightly better every year, and a word for something that isn't a real word. You can see all of this instantly in somebody else's family and almost none of it in your own.`
        ],
        question: `So which of your family's rules would a stranger find genuinely strange — and which ones would you defend anyway?`
    },
    paths: {
        culturalLensDescription: `Baby names vetoed by a committee, sons adopted at thirty, and one farm with four children.`,
        discussionDescription: `The favourite, the loan that was never repaid, the family argument nobody can end, and the aunt who means well.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to bring together ideas from different parts of the subject.`
    },
    culturalLens: {
        heading: `Other People's Families`,
        intro: `Everybody assumes their own family is the normal one and everybody else's is slightly odd. Here are some arrangements that will make yours look extremely conventional — and one or two that might not.`
    },
    discussion: {
        heading: `The House You Come From`
    },
    reflection: {
        title: `Your Version`,
        summary: `Look back at what came up — the rules, responsibilities, stories, and arrangements people inherit or create. Notice which ideas felt familiar, which felt strange, and which changed how you would describe belonging.`,
        questions: [
            `Which of the arrangements you heard about would you actually want in your family?`,
            `Whose version of your family would you most like to hear — and what would they get wrong about you?`
        ]
    },
    keyLanguage: {
        intro: `Expressions for describing relatives, arguing about fairness, and admitting what you've inherited.`
    }
};

const discussionSets = [
    {
        id: 'set-nobody-sits-there',
        title: `Nobody Sits There`,
        stage: `React`,
        icon: 'react',
        description: `The word only your family uses, the newcomer who needs a warning, and the story that gets bigger every year.`,
        moments: [
            {
                id: 'moment-the-family-word',
                preview: `A word that isn't a real word.`,
                question: `Most families have a word that no dictionary contains — a name for the remote control, a dish nobody else calls that, a toddler's mispronunciation that stuck for thirty years. What's yours, and who invented it?`,
                upgrade: {
                    term: `catch on`,
                    type: `phrasal verb`,
                    definition: `To become popular or widely used by a group.`,
                    ordinary: `“My little brother couldn't pronounce it properly, and somehow the whole family started using his version and never stopped.”`,
                    upgraded: `“My brother couldn't pronounce it, and his version caught on.”`,
                    priority: 'standard',
                    atlasPrompt: `What word, nickname, or habit caught on at your work — and does anyone remember who started it?`
                }
            },
            {
                id: 'moment-nobody-sits-there',
                preview: `Nobody wrote it down. Everybody obeys it.`,
                question: `The chair. Who carves. Who is never trusted with the music. What you do not mention in front of your grandmother. What is the rule in your family that nobody ever wrote down — and what happens to the person who breaks it?`,
                upgrade: {
                    term: `there'll be hell to pay`,
                    type: `idiom`,
                    definition: `There will be serious trouble and somebody will be very angry.`,
                    ordinary: `“If anyone sat in my father's chair, he would be extremely angry and the whole house would hear about it.”`,
                    upgraded: `“If anyone sat in Dad's chair, there'd be hell to pay.”`,
                    priority: 'key',
                    atlasPrompt: `What would there be hell to pay for at your work — being late, going over someone's head, touching the wrong mug?`
                }
            },
            {
                id: 'moment-the-story-that-grew',
                preview: `Every year, the fish gets bigger.`,
                question: `Every family has the story that comes out at every gathering, and it has grown. Which one is yours, who tells it, and how much of it is still true? Tell it the way they tell it.`,
                upgrade: {
                    term: `trot something out`,
                    type: `phrasal verb`,
                    definition: `To repeat the same story, excuse, or argument you have used many times before.`,
                    ordinary: `“He tells exactly the same story at every single dinner, and everybody has heard it a hundred times.”`,
                    upgraded: `“He trots out the same story at every dinner.”`,
                    priority: 'standard',
                    atlasPrompt: `Who trots out the same excuse, the same argument, or the same anecdote every time — and does anyone stop them?`
                }
            },
            {
                id: 'moment-the-permanent-record',
                preview: `You were fourteen. They have not forgotten.`,
                question: `The haircut. The boyfriend. The thing someone said at the wedding. What do families keep bringing up years later — and at what point does affectionate teasing quietly become a grudge?`,
                upgrade: {
                    term: `hold something against someone`,
                    type: `phrase`,
                    definition: `To continue to blame someone for something they did in the past.`,
                    ordinary: `“I forgot her birthday once, six years ago, and she still blames me for it every time we argue.”`,
                    upgraded: `“I forgot her birthday once and she still holds it against me.”`,
                    priority: 'key',
                    atlasPrompt: `What do people find hardest to let go of — being forgotten, being embarrassed, being left out, or being proved wrong?`
                }
            },
            {
                id: 'moment-meeting-them-for-the-first-time',
                preview: `Their first Christmas with your lot.`,
                question: `Somebody new arrives — a partner, a friend, an in-law. What do they get wrong first, and who is the relative they will not survive?`,
                upgrade: {
                    term: `a baptism of fire`,
                    type: `noun`,
                    definition: `An extremely difficult first experience of a new situation.`,
                    ordinary: `“Her first Christmas with my family was an extremely difficult introduction — all forty of us, plus the arguing.”`,
                    upgraded: `“Her first Christmas with my family was a real baptism of fire.”`,
                    priority: 'standard',
                    atlasPrompt: `When has a first day, a first week, or a first meeting been a real baptism of fire?`
                }
            }
        ],
        makeItReal: {
            title: `The briefing`,
            prompt: `Someone is meeting your family for the first time next week. Brief them properly: where to sit, what not to mention, who to charm first, and who will corner them by the sink.`
        }
    },
    {
        id: 'set-keeping-score',
        title: `Somebody's Keeping Score`,
        stage: `Explain`,
        icon: 'explain',
        description: `The favourite, the one who does everything, the money that was never repaid, and the aunt who means well.`,
        moments: [
            {
                id: 'moment-the-favourite',
                preview: `There is one. Everybody denies it.`,
                question: `People often suspect there is a favourite, even when nobody admits it. In a family you know — real or fictional — how can people tell, and what does the favourite get away with?`,
                upgrade: {
                    term: `get away with murder`,
                    type: `idiom`,
                    definition: `To be allowed to do things that other people would be punished for.`,
                    ordinary: `“My younger brother was allowed to do absolutely anything and was never once punished for any of it.”`,
                    upgraded: `“My younger brother got away with murder.”`,
                    priority: 'key',
                    atlasPrompt: `Who gets away with murder at your work — and why does nobody say anything?`
                }
            },
            {
                id: 'moment-the-one-who-does-everything',
                preview: `One person books the flights. Every time.`,
                question: `Somebody remembers the birthdays, drives to the hospital, hosts the whole thing. It is almost never shared out evenly. In your family, or a family you know well, who carries it — and did they take the job, or did everyone else quietly hand it to them?`,
                upgrade: {
                    term: `a thankless task`,
                    type: `noun`,
                    definition: `A necessary job that nobody ever thanks you for doing.`,
                    ordinary: `“Organising every single birthday is a job that has to be done, and nobody has ever once said thank you for it.”`,
                    upgraded: `“Organising every birthday is a thankless task.”`,
                    priority: 'standard',
                    atlasPrompt: `What is the most thankless task in your workplace — and who ended up with it?`
                }
            },
            {
                id: 'moment-lending-money',
                preview: `A relative asks. It is not a small amount.`,
                question: `Do you lend it, give it, or say no? And if you lend it and it never comes back, what have you actually lost — the money, or something more expensive?`,
                upgrade: {
                    term: `write something off`,
                    type: `phrasal verb`,
                    definition: `To accept that money, time, or effort is lost and stop expecting it back.`,
                    ordinary: `“I lent it to him, but honestly I accepted I would never see it again on the day I handed it over.”`,
                    upgraded: `“I lent it to him, but honestly I wrote it off the day I handed it over.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you written off — money, time, an apology you are never going to get?`
                }
            },
            {
                id: 'moment-not-speaking',
                preview: `Two of them haven't spoken in nine years.`,
                question: `Some families contain a disagreement that has lasted so long nobody clearly remembers the beginning. Why do these arguments survive — and what would make either side finally move?`,
                upgrade: {
                    term: `fall out over something`,
                    type: `phrasal verb`,
                    definition: `To have a serious argument and stop being friendly with someone.`,
                    ordinary: `“They had a serious argument about their mother's house and they have not spoken to each other since.”`,
                    upgraded: `“They fell out over the house and haven't spoken since.”`,
                    priority: 'standard',
                    atlasPrompt: `What do neighbours, friends, or colleagues most often fall out over?`
                }
            },
            {
                id: 'moment-the-question-nobody-asked-for',
                preview: `“And when are you going to settle down?”`,
                question: `Families sometimes ask questions that no colleague or casual friend would dare to ask. Which questions cross the line — and when does concern become interference?`,
                upgrade: {
                    term: `mean well`,
                    type: `phrase`,
                    definition: `To have good intentions, even when the effect is unwelcome or exhausting.`,
                    ordinary: `“She has good intentions, I know she does, but she is completely exhausting to be around.”`,
                    upgraded: `“She means well, but she's exhausting.”`,
                    priority: 'key',
                    atlasPrompt: `Who means well and is still exhausting — a colleague, a neighbour, a friend?`
                }
            }
        ],
        makeItReal: {
            title: `Argue the other side`,
            prompt: `Pick a disagreement in a family you know well — money, a wedding, who does more, who was favoured. Now argue the side you don't agree with, as well as you possibly can. Then tell me which parts of it are actually true.`
        }
    },
    {
        id: 'set-the-bits-you-kept',
        title: `The Bits You Kept`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The habit you swore you'd never have, the rule you refused, and the grandmother who is still winning arguments.`,
        moments: [
            {
                id: 'moment-you-have-become-them',
                preview: `That is your mother's exact sigh.`,
                question: `The phrase. The sigh. The way someone checks the locks or folds a towel. Which family habit have you found in yourself — or watched somebody else inherit — and did they fight it?`,
                upgrade: {
                    term: `catch yourself doing something`,
                    type: `phrase`,
                    definition: `To suddenly notice you are doing something without having decided to.`,
                    ordinary: `“I suddenly noticed I was saying exactly the same thing my mother always used to say.”`,
                    upgraded: `“I caught myself saying exactly what my mother says.”`,
                    priority: 'key',
                    atlasPrompt: `What do you catch yourself doing at work that you swore you would never do?`
                }
            },
            {
                id: 'moment-the-thing-you-refused',
                preview: `That one stops with you.`,
                question: `Every generation quietly drops something — a rule, a routine, a way of arguing, a job everyone was supposed to take. What did you decide not to carry, and did anyone notice you had put it down?`,
                upgrade: {
                    term: `draw the line at something`,
                    type: `idiom`,
                    definition: `To refuse to do or accept something, setting a firm limit.`,
                    ordinary: `“I am happy to keep most of the traditions, but I absolutely refuse to do the shouting.”`,
                    upgraded: `“I'll keep most of it, but I draw the line at the shouting.”`,
                    priority: 'key',
                    atlasPrompt: `Where do you draw the line at work — the thing you simply will not do?`
                }
            },
            {
                id: 'moment-still-winning-arguments',
                preview: `She's been dead nine years and she is still right.`,
                question: `The recipe that is still the standard. The holiday ritual nobody is allowed to change. The opinion everybody still quotes to end an argument. In your family, or one you know well, who is gone and still running the place?`,
                upgrade: {
                    term: `turn in your grave`,
                    type: `idiom`,
                    definition: `Used to say that a dead person would be horrified by something happening now.`,
                    ordinary: `“My grandmother would be absolutely horrified if she could see what they have done to that kitchen.”`,
                    upgraded: `“My grandmother would turn in her grave.”`,
                    priority: 'standard',
                    atlasPrompt: `Who would turn in their grave if they saw how things are done now?`
                }
            },
            {
                id: 'moment-what-you-would-keep',
                preview: `One thing survives you. Choose.`,
                question: `You get to make exactly one thing in your family survive you — a habit, a dish, a rule, a way of welcoming people. What is it? And what would you be quietly relieved to see them drop?`,
                upgrade: {
                    term: `keep something going`,
                    type: `phrasal verb`,
                    definition: `To make sure something continues, especially when it depends on you.`,
                    ordinary: `“Somebody in the family has to continue doing it, otherwise it will simply stop when she is gone.”`,
                    upgraded: `“Somebody has to keep it going, or it dies with her.”`,
                    priority: 'standard',
                    atlasPrompt: `What tradition, group, or friendship are you the one keeping going — and what happens if you stop?`
                }
            },
            {
                id: 'moment-who-you-took-in',
                preview: `He came for a fortnight. He stayed three years.`,
                question: `Families absorb people — the friend who never left, the neighbour who became an aunt, the one who turned up with a bag. Who did yours take in, and at what point did they simply stop being a guest?`,
                upgrade: {
                    term: `take someone in`,
                    type: `phrasal verb`,
                    definition: `To let someone live in your home, especially when they have nowhere else to go.`,
                    ordinary: `“When he had nowhere at all to live, my parents let him come and stay with us for two years.”`,
                    upgraded: `“When he had nowhere to go, my parents took him in.”`,
                    priority: 'standard',
                    atlasPrompt: `Who would you take in if they turned up with a bag — and who would you absolutely not?`
                }
            }
        ],
        makeItReal: {
            title: `In fifty years`,
            prompt: `Choose one thing your family actually does — not a value, a thing people do. Describe it precisely enough that someone in fifty years could still do it: where, when, who's there, who complains, and what happens if it rains.`
        }
    }
];

const clCards = [
    {
        id: 'cl-iceland-names',
        contextLine: `Iceland`,
        title: `The Committee That Vetoes Your Baby's Name`,
        teaser: `You have chosen the name. Now the state has to approve it.`,
        context: `Iceland keeps an official list of approved first names, and new names may be checked under the country's naming rules. Most people use a last name based on a parent's first name rather than one shared family surname, so parents and children may have different last names.`,
        mainQuestion: `Your child's name has just been refused by a committee. Do you fight it, or pick another one?`,
        followTheThread: [
            `If the family name doesn't survive at all, what does?`,
            `Who gets an opinion about a baby's name where you're from — and does anybody listen to them?`
        ],
        upgrade: {
            term: `have the final say`,
            type: `phrase`,
            definition: `To be the person who makes the final decision, whatever anyone else thinks.`,
            ordinary: `“In our family my grandmother makes the final decision about absolutely everything, and nobody argues with her.”`,
            upgraded: `“My grandmother has the final say, and nobody argues.”`,
            priority: 'standard',
            atlasPrompt: `Who has the final say at your work — and is it the person whose name is on the door?`
        }
    },
    {
        id: 'cl-milk-kinship',
        contextLine: `Islamic law · milk kinship`,
        title: `The Sibling You Never Grew Up With`,
        teaser: `The same woman breastfed you both. Under Islamic law, that can create a family bond.`,
        context: `In Islamic tradition, breastfeeding can create a recognised family bond between children who are not biologically related. Under certain conditions, they become milk-siblings and cannot marry each other. The exact rules differ between traditions, but the bond can carry lasting family and religious importance.`,
        mainQuestion: `You discover that somebody you have never met is considered your milk-sibling. Would you want to meet them — and would the relationship feel real to you?`,
        followTheThread: [
            `Who is family to you who isn't related to you at all?`,
            `Is it really the blood doing the work — or the years in the same house?`
        ],
        upgrade: {
            term: `in name only`,
            type: `phrase`,
            definition: `Officially something, but not in any real or meaningful way.`,
            ordinary: `“He is officially my brother-in-law, but there is no real relationship there of any kind.”`,
            upgraded: `“He's my brother-in-law in name only.”`,
            priority: 'standard',
            atlasPrompt: `What is yours in name only — a title, a job, a membership, a qualification?`
        }
    },
    {
        id: 'cl-primogeniture',
        contextLine: `Europe · primogeniture`,
        title: `One Farm, Four Children`,
        teaser: `Split the farm four ways and it feeds nobody. So it all went to one of them.`,
        context: `In many wealthy landowning families, most or all of the property passed to one heir, often the eldest son. The logic was practical as well as unfair: divide a working farm again and again, and eventually it may support nobody. The system protected the land, but left the other children to find another future.`,
        mainQuestion: `It's your farm and you have four children. Split it and it feeds none of them. What do you actually do?`,
        followTheThread: [
            `Should the child who stayed and did the work get more than the one who left?`,
            `Where you're from, is anyone still expected to take over?`
        ],
        upgrade: {
            term: `cut someone out`,
            type: `phrasal verb`,
            definition: `To deliberately exclude someone, especially from a will or a decision.`,
            ordinary: `“He deliberately excluded his eldest daughter from the will and left absolutely everything to his son.”`,
            upgraded: `“He cut his eldest daughter out of the will completely.”`,
            priority: 'key',
            atlasPrompt: `Who has been quietly cut out of something at your work — a decision, a project, an email chain?`
        }
    },
    {
        id: 'cl-mukoyoshi',
        contextLine: `Japan`,
        title: `Adopting a Grown Man`,
        teaser: `No suitable son. So the family finds one and adopts him at thirty.`,
        context: `A Japanese family business without a suitable heir has a solution: adopt one. The daughter's husband — or sometimes a promising employee — is legally adopted as a son, takes the family name, and inherits the company. The overwhelming majority of adoptions in Japan are of adult men rather than children.`,
        mainQuestion: `They want you to take their name, become their son, and run the company. Do you do it?`,
        followTheThread: [
            `What exactly would you be giving up?`,
            `Is a family that recruits stronger than one that just hopes for the best?`
        ],
        upgrade: {
            term: `marry into something`,
            type: `phrasal verb`,
            definition: `To become part of a family, a business, or a social position through marriage.`,
            ordinary: `“He became part of an extremely wealthy family by marrying their daughter, and everybody knows it.”`,
            upgraded: `“He married into money, and everybody knows it.”`,
            priority: 'standard',
            atlasPrompt: `What would you happily marry into — a business, a country, a name, a very large house?`
        }
    },
    {
        id: 'cl-rent-a-partner',
        contextLine: `China · Lunar New Year`,
        title: `Rent a Boyfriend, Save Your New Year`,
        teaser: `Everyone is going to ask when you're getting married. So you hire somebody.`,
        context: `Every Lunar New Year, unmarried adults travel home to a fortnight of the same questions: when are you marrying, why aren't you, what is wrong with you. Services have been widely reported that will rent you a convincing partner for the visit. The rate, the rules, and the backstory are all agreed in advance.`,
        mainQuestion: `The questions are coming. Would you hire somebody to make them stop — or is that funnier as an idea than as a plan?`,
        followTheThread: [
            `What do your relatives ask you that nobody else would dare to ask?`,
            `Do they actually want the answer, or do they just want to ask?`
        ],
        upgrade: {
            term: `keep someone off your back`,
            type: `phrase`,
            definition: `To stop someone from pestering, nagging, or criticising you.`,
            ordinary: `“I told them I had a girlfriend purely so that they would stop constantly asking me about it.”`,
            upgraded: `“I told them I had a girlfriend just to keep them off my back.”`,
            priority: 'key',
            atlasPrompt: `What do you do purely to keep someone off your back — a boss, a landlord, a relative?`
        }
    },
    {
        id: 'cl-akan-matrilineal',
        contextLine: `Ghana · Akan`,
        title: `Your Uncle, Not Your Father`,
        teaser: `A man's heirs are his sister's children, not his own.`,
        context: `In some Akan traditions in Ghana, family descent and inheritance follow the mother's side. A man's sister's children may therefore have a stronger traditional claim than his own children, and a maternal uncle can play a major role in family life. Modern law makes the reality more varied, but the family logic remains very different from father-to-child inheritance.`,
        mainQuestion: `Which side of your family — your mother's or your father's — actually feels like the real one? And be honest.`,
        followTheThread: [
            `Who is the uncle or the aunt who genuinely mattered?`,
            `Would you feel cheated if your father's money went to your cousins?`
        ],
        upgrade: {
            term: `take sides`,
            type: `phrase`,
            definition: `To support one person or group in a disagreement rather than staying neutral.`,
            ordinary: `“When my parents argued, all the relatives immediately decided which one of them they were going to support.”`,
            upgraded: `“When my parents argued, everybody took sides immediately.”`,
            priority: 'standard',
            atlasPrompt: `When did you last have to take sides — at work, between friends, in an argument you had no part in?`
        }
    },
    {
        id: 'cl-sworn-virgins',
        contextLine: `Northern Albania`,
        title: `The Family Needed a Man`,
        teaser: `She swore never to marry, and the household got its head.`,
        context: `Under the old code of the northern highlands, a household without a man had no head, no voice, and little protection. A woman could take a lifelong oath of celibacy and step into the role — running the house, inheriting the property, carrying a weapon, sitting and drinking with the men, and being addressed as one of them. Very few are left.`,
        mainQuestion: `She got the property, the voice, and the freedom of the house. She gave up marriage and children for good. Was that a good deal?`,
        followTheThread: [
            `What has somebody in your family given up for everybody else?`,
            `Is a sacrifice still a sacrifice if the person chose it?`
        ],
        upgrade: {
            term: `fall to someone`,
            type: `phrasal verb`,
            definition: `(Of a duty or a job) to become someone's responsibility, often because nobody else will do it.`,
            ordinary: `“Nobody else was prepared to do it, so looking after my grandmother became my aunt's responsibility.”`,
            upgraded: `“It fell to my aunt to look after my grandmother.”`,
            priority: 'key',
            atlasPrompt: `What has fallen to you that nobody else wanted — at work, at home, in a group you belong to?`
        }
    },
    {
        id: 'cl-ancestor-altar',
        contextLine: `China and Vietnam`,
        title: `Telling the Dead Your News`,
        teaser: `The exam results, the promotion, the engagement. Somebody has to tell your grandmother.`,
        context: `In many Chinese and Vietnamese homes the ancestors have a place in the house — a shelf or an altar with photographs, incense, and a little food. They are not only remembered; they are kept informed. A marriage, a birth, a new job, an exam passed: somebody stands there and says it out loud.`,
        mainQuestion: `You get the promotion. Would you go and tell your dead grandmother — and would that be for her, or for you?`,
        followTheThread: [
            `Who in your family is dead and still consulted?`,
            `Where do people go to talk to somebody who isn't there?`
        ],
        upgrade: {
            term: `keep someone in the loop`,
            type: `phrase`,
            definition: `To keep someone informed about what is happening.`,
            ordinary: `“Somebody always makes sure to tell her everything that happens in this family, even now.”`,
            upgraded: `“Somebody always keeps her in the loop, even now.”`,
            priority: 'standard',
            atlasPrompt: `Who forgets to keep you in the loop — and what have you found out far too late?`
        }
    },
    {
        id: 'cl-grandmother-effect',
        contextLine: `Grandmothers`,
        title: `Why Grandmothers Exist`,
        teaser: `Almost no other animal lives for decades after it stops reproducing. We do.`,
        context: `Human women live for decades after they can no longer have children, which is rare in the animal world and takes some explaining. One well-supported answer is grandmothers. In old Finnish and Canadian parish records, children with a living maternal grandmother nearby were measurably more likely to survive. She wasn't spare. She was load-bearing.`,
        mainQuestion: `Who is the load-bearing person in your family — and does anybody actually thank them?`,
        followTheThread: [
            `What would collapse tomorrow if they stopped?`,
            `Do they enjoy it, or would they hand it over in a second if anyone offered?`
        ],
        upgrade: {
            term: `do the heavy lifting`,
            type: `phrase`,
            definition: `To do the hardest and most demanding part of the work.`,
            ordinary: `“My aunt does all the hardest and most demanding work in this family, and nobody ever notices.”`,
            upgraded: `“My aunt does all the heavy lifting, and nobody notices.”`,
            priority: 'key',
            atlasPrompt: `Who does the heavy lifting on your team — and does the credit go to them?`
        }
    }
];
