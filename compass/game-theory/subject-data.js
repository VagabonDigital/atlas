/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Understanding Game Theory: Strategy, Trust & Choice
  ---------------------------------------------------------------------------
  A B2 concept-learning subject that introduces strategic interdependence,
  incentives, cooperation, competition, repeated interaction, reputation and
  trust through clear examples, applied reasoning and tutor-led discussion.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `game-theory`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `Understanding Game Theory: Strategy, Trust & Choice`,
    titleHtml: `Understanding Game Theory: <em>Strategy, Trust & Choice</em>`,
    navTitle: `Game Theory`,
    bgImage: `https://static.wixstatic.com/media/3eee0b_f7fae24af2bf4fdc8b705e7f35e943f7~mv2.png/v1/fill/w_568,h_316,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/3eee0b_f7fae24af2bf4fdc8b705e7f35e943f7~mv2.png`
};

const subjectCopy = {
    cover: {
        hook: `Your best move depends on theirs.`
    },
    overview: {
        heading: `The Choice Behind the Choice`,
        intro: [
            `Designed for B2 learners, this subject introduces game theory: the study of choices where your outcome depends partly on what other people choose. Through everyday examples, you will explore incentives, cooperation, competition, trust and strategic interdependence, then use the ideas to explain and predict real decisions.`
        ],
        question: `Can you think of a situation where working together gave you a better result than competing?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Talk through the strategies, incentives, and relationships that influence cooperation and competition in everyday life.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `Explore how social expectations and different ideas about trust, fairness and cooperation shape strategic choices.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from the strategies and consider how these ideas could change the way you make choices with other people.`
    },
    culturalLens: {
        heading: `Different Rules of Trust`,
        intro: `People in different communities, workplaces and historical periods may have different ideas about fairness, obligation, risk and competition. These differences can change how people read incentives, decide whether to cooperate, and respond when trust breaks down.`
    },
    discussion: {
        heading: `What Shapes the Move?`,
        intro: `Explore how people make choices when their outcomes depend on others. Consider when trust, clear communication, competition, or self-protection can change the result—and why a sensible choice for one person may create a poor outcome for everyone.`
    },
    reflection: {
        title: `The Move After This One`,
        summary: `Game theory shows how our choices are shaped by other people’s actions, incentives, trust, and expectations. It also raises a difficult question: how can we protect our interests while helping create better outcomes for everyone?`,
        questions: [
            `After exploring these situations, when do you think cooperation is a stronger strategy than competition, and when might protecting your own interests be more reasonable?`,
            `What is one relationship, decision, or shared situation where you would now communicate more clearly, build trust differently, or think further ahead?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-everyday-strategic-choices`,
        title: `Everyday Choices Together`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Talk about everyday situations where your choices depend on what other people might do.`,
        moments: [
            {
                id: `moment-choosing-with-another-person`,
                preview: `Choosing with another person`,
                question: `When have you had to make a choice together with someone else, and how did their preferences affect your decision?`,
                upgrade: {
                    term: `take someone’s preferences into account`,
                    type: `phrase`,
                    definition: `to consider what someone wants or prefers before making a decision`,
                    ordinary: `We considered what each person wanted before choosing where to go.`,
                    upgraded: `We had to take everyone’s preferences into account before deciding where to spend the holiday.`,
                    priority: `key`,
                    atlasPrompt: `When making plans at work or with friends, whose preferences do you usually take into account, and why?`
                }
            },
            {
                id: `moment-incentives-change-behaviour`,
                preview: `A reward changes behaviour`,
                question: `What is a situation where a reward, discount, rule, or punishment changed what you decided to do?`,
                upgrade: {
                    term: `be swayed by`,
                    type: `phrase`,
                    definition: `to be influenced by something when making a decision, especially when you were not completely certain before`,
                    ordinary: `The discount made me choose that phone instead of the other one.`,
                    upgraded: `I was swayed by the discount and chose that phone instead.`,
                    priority: `key`,
                    atlasPrompt: `What advice, argument, or personal opinion has swayed you recently?`
                }
            },
            {
                id: `moment-trusting-a-promise`,
                preview: `Trusting someone’s promise`,
                question: `Can you remember a time when you had to trust someone to do their part, and what happened?`,
                upgrade: {
                    term: `follow through on a promise`,
                    type: `phrasal verb`,
                    definition: `To do what you said you would do, especially after making a promise or commitment.`,
                    ordinary: `I trusted my colleague to finish the report, and she did what she promised.`,
                    upgraded: `I trusted my colleague to follow through on her promise to finish the report.`,
                    priority: `key`,
                    atlasPrompt: `When have you relied on someone to follow through on a commitment in a different situation?`
                }
            },
            {
                id: `moment-cooperate-or-protect-yourself`,
                preview: `Helping or protecting yourself`,
                question: `When might helping another person also help you, and when might you choose to protect your own interests instead?`,
                upgrade: {
                    term: `a win-win situation`,
                    type: `idiom`,
                    definition: `A situation in which everyone involved gains something useful or positive.`,
                    ordinary: `Sharing the work could benefit both of us.`,
                    upgraded: `Sharing the work could create a win-win situation for both of us.`,
                    priority: `key`,
                    atlasPrompt: `What could be a win-win situation when two colleagues disagree about how to complete a project?`
                },
                followUp: {
                    id: `cooperation-without-certainty`,
                    kind: `another-angle`,
                    prompt: `Now imagine cooperation would benefit both people, but neither can be certain the other will cooperate. What would make you take the risk, and what would make you protect yourself instead?`
                }
            },
            {
                id: `moment-competing-for-same-opportunity`,
                preview: `Competing for the same thing`,
                question: `Have you ever competed with someone for a job, place, prize, or opportunity, and how did the competition change your behaviour?`,
                upgrade: {
                    term: `outdo someone`,
                    type: `verb`,
                    definition: `to do better than someone else, especially in a competition`,
                    ordinary: `I tried to do better than the other applicants.`,
                    upgraded: `I found myself trying to outdo the other applicants.`,
                    priority: `key`,
                    atlasPrompt: `When might you try to outdo a friend or colleague, even if nobody has announced a competition?`
                }
            }
        ],
        makeItReal: {
            title: `Choose Your Strategy`,
            prompt: `Think of one everyday decision involving another person. Tell your tutor what each of you might do, predict their likely response, and choose the strategy you would use—explaining how trust, incentives, cooperation, or competition affects your choice.`
        }
    },
    {
        id: `set-reading-the-game`,
        title: `Reading the Situation`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Examine how incentives, information, trust, and timing can change the best choice in shared situations.`,
        moments: [
            {
                id: `moment-individually-sensible-choice`,
                preview: `The individually sensible choice`,
                question: `Imagine two businesses lowering their prices to attract customers, even though both would earn more if prices stayed higher. Why might each business still choose to lower its prices?`,
                upgrade: {
                    term: `prioritize short-term gains`,
                    type: `collocation`,
                    definition: `To give more importance to immediate benefits than to benefits that may come later.`,
                    ordinary: `Each business may focus on getting an immediate advantage instead of cooperating over time.`,
                    upgraded: `Each business may prioritize short-term gains over the larger benefits of keeping prices stable.`,
                    priority: `key`,
                    atlasPrompt: `When might someone prioritize short-term gains over long-term benefits in their career, health, or personal life?`
                }
            },
            {
                id: `moment-cooperation-needs-protection`,
                preview: `Cooperation needs protection`,
                question: `A group project gives everyone the same result, but one person can benefit by doing less work. What could the group change to encourage everyone to contribute?`,
                upgrade: {
                    term: `hold someone accountable`,
                    type: `phrase`,
                    definition: `To expect someone to take responsibility for their actions and results.`,
                    ordinary: `The team should make each person responsible for the work they agreed to do.`,
                    upgraded: `The team could hold each member accountable by checking progress and making individual contributions visible.`,
                    priority: `key`,
                    atlasPrompt: `How could a manager hold employees accountable without making them feel constantly watched?`
                }
            },
            {
                id: `moment-missing-information`,
                preview: `Missing information`,
                question: `You are choosing between two services, but one provider gives clear information while the other makes attractive promises without details. How would the uncertainty affect your decision?`,
                upgrade: {
                    term: `lack of transparency`,
                    type: `collocation`,
                    definition: `A situation in which important information is not explained clearly or openly.`,
                    ordinary: `I would hesitate because the provider does not explain what the service really includes.`,
                    upgraded: `The lack of transparency would make me cautious, even if the provider’s promises sounded attractive.`,
                    priority: `key`,
                    atlasPrompt: `How might a company’s lack of transparency affect whether you accept a job offer?`
                }
            },
            {
                id: `moment-promises-and-future-choices`,
                preview: `Promises and future choices`,
                question: `Someone offers you a short-term advantage if you break an agreement, but you may need their trust again later. How would you weigh the immediate benefit against the future relationship?`,
                upgrade: {
                    term: `play the long game`,
                    type: `idiom`,
                    definition: `To make choices based on long-term benefits rather than immediate results.`,
                    ordinary: `I would think about the future relationship, not only the benefit I could get right now.`,
                    upgraded: `I’d rather play the long game and protect the relationship, even if I have to refuse the immediate advantage.`,
                    priority: `key`,
                    atlasPrompt: `When might it be wiser to play the long game at work or in your personal life?`
                },
                followUp: {
                    id: `one-time-or-repeated`,
                    kind: `add-a-twist`,
                    prompt: `Now imagine this is the only time you will ever deal with the other person. How does removing the future relationship change your strategy?`
                }
            },
            {
                id: `moment-waiting-for-next-move`,
                preview: `Waiting for the next move`,
                question: `In a negotiation, one person makes the first offer and the other can accept, reject, or make a counteroffer. When is it better to act quickly, and when is it wiser to wait?`,
                upgrade: {
                    term: `keep your options open`,
                    type: `phrase`,
                    definition: `To delay a final decision so that several possible choices remain available.`,
                    ordinary: `I’m not ready to choose one plan yet because the situation could change.`,
                    upgraded: `I’d rather keep my options open until I have more information about the other side’s position.`,
                    priority: `key`,
                    atlasPrompt: `When choosing a job, course, or holiday plan, how might keeping your options open help you?`
                }
            }
        ],
        makeItReal: {
            title: `Change the Game`,
            prompt: `Choose one situation from this set and change one feature, such as the incentive, available information, future consequence, or timing. Explain how this change would affect the best choice, then state one practical rule for making decisions in similar situations.`
        }
    },
    {
        id: `set-beyond-the-best-move`,
        title: `Beyond the Best Move`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Consider how strategic choices shape trust, markets, public life, and the outcomes communities share.`,
        moments: [
            {
                id: `moment-when-everyone-protects-themselves`,
                preview: `When everyone protects themselves`,
                question: `If people act mainly to protect their own interests, what problems might appear in areas such as public transport, healthcare, or the environment?`,
                upgrade: {
                    term: `free-ride on`,
                    type: `phrasal verb`,
                    definition: `to benefit from other people’s efforts without contributing your fair share`,
                    ordinary: `Some residents may use the benefits of the system without helping to pay for them.`,
                    upgraded: `Some residents may try to free-ride on other people’s contributions.`,
                    priority: `key`,
                    atlasPrompt: `What problems can arise when some members of a team free-ride on the work of others?`
                }
            },
            {
                id: `moment-rules-change-the-game`,
                preview: `Rules change the game`,
                question: `What rules could make cooperation more attractive than competition in a workplace, a market, or a community?`,
                upgrade: {
                    term: `create the right incentives`,
                    type: `collocation`,
                    definition: `to design rewards or consequences that encourage people to make the desired choice`,
                    ordinary: `Good rules could encourage people to work together instead of competing.`,
                    upgraded: `Good rules could create the right incentives for people to work together instead of competing.`,
                    priority: `key`,
                    atlasPrompt: `How could a team leader create the right incentives for people to share information instead of keeping it to themselves?`
                },
                followUp: {
                    id: `when-incentives-backfire`,
                    kind: `go-deeper`,
                    prompt: `Suppose a new rule rewards cooperation but is easy to exploit. What behaviour might appear, and how would you redesign the incentive?`
                }
            },
            {
                id: `moment-trust-in-public-life`,
                preview: `Trust in public life`,
                question: `How can repeated broken promises by companies, leaders, or institutions change the way people behave and the trust they give others?`,
                upgrade: {
                    term: `erode trust`,
                    type: `collocation`,
                    definition: `to gradually weaken people’s confidence in someone or something`,
                    ordinary: `Repeated broken promises can slowly damage people’s confidence in a company.`,
                    upgraded: `Repeated broken promises can gradually erode trust in a company and make customers look for alternatives.`,
                    priority: `key`,
                    atlasPrompt: `What kinds of actions can erode trust between friends, colleagues, or business partners?`
                }
            },
            {
                id: `moment-technology-predicts-choices`,
                preview: `Technology predicts our choices`,
                question: `When apps, companies, or governments use information to predict and influence people’s decisions, what benefits and dangers do you see?`,
                upgrade: {
                    term: `nudge`,
                    type: `verb`,
                    definition: `to gently encourage someone to make a particular choice without forcing them`,
                    ordinary: `The app gently encourages users to choose healthier food.`,
                    upgraded: `The app nudges users towards healthier food choices.`,
                    priority: `key`,
                    atlasPrompt: `How could a supermarket nudge shoppers towards more sustainable products?`
                }
            },
            {
                id: `moment-winning-but-making-things-worse`,
                preview: `Winning but making things worse`,
                question: `Can a person, company, or country make a strategically successful choice that harms society in the long term, and what should happen then?`,
                upgrade: {
                    term: `come at a cost`,
                    type: `collocation`,
                    definition: `To bring a benefit or success but also cause a serious negative effect.`,
                    ordinary: `The company increased its profits, but this success caused problems for local workers and residents.`,
                    upgraded: `The company’s success came at a cost to local workers and residents.`,
                    priority: `key`,
                    atlasPrompt: `Can you think of a personal achievement that came at a cost to someone else?`
                }
            }
        ],
        makeItReal: {
            title: `Advise the Decision-Maker`,
            prompt: `Choose one area from the set, such as public transport, healthcare, the environment, business, or technology. Speak as an adviser and recommend one decision that balances personal interests with the shared outcome; predict how people might respond and explain how your plan would protect trust.`
        }
    }
];

const clCards = [
    {
        id: `cl-the-trust-circle`,
        title: `The Trust Circle`,
        contextLine: `Rotating savings groups in Mexico and West Africa`,
        teaser: `Why would people hand money to a group before receiving anything back?`,
        context: `In many communities, people join rotating savings groups, known in different places as tandas or susus. Each member contributes a fixed amount regularly, and one member receives the whole group pot each time until everyone has received a turn. The system depends on repeated interaction: reputation, social pressure and the expectation of future cooperation can be stronger incentives than a formal contract.`,
        followTheThread: [
            `How might the strategy change for a member who receives the group pot early compared with one who receives it at the end?`,
            `What could the group do if one person stopped contributing, and would punishment help or damage trust?`
        ],
        upgrade: {
            term: `reciprocate`,
            type: `verb`,
            definition: `to respond to someone’s action by doing something similar or equally helpful`,
            ordinary: `People keep contributing because they expect others to do the same.`,
            upgraded: `People keep contributing because they expect others to reciprocate.`,
            priority: `key`,
            atlasPrompt: `When has someone helped you at work or in your personal life, and how did you reciprocate?`
        },
        mainQuestion: `Would you trust this system more or less than borrowing from a bank, and what would make someone cooperate even when they could benefit by breaking the agreement?`
    },
    {
        id: `cl-gifts-that-keep-moving`,
        title: `Gifts That Keep Moving`,
        contextLine: `The Kula exchange in the Trobriand Islands`,
        teaser: `What makes a valuable gift worth giving when you may not receive an equal gift immediately?`,
        context: `In the Kula exchange, island communities in Papua New Guinea traditionally pass special shell valuables between partners over long distances. The exchange is not a simple sale: its value comes from relationships, reputation, obligations and the expectation that gifts will continue to circulate. From a game-theory perspective, repeated interaction can make cooperation sensible, because people care about their future relationships as well as today’s advantage.`,
        followTheThread: [
            `How might reputation change the strategy of someone who is tempted to keep a valuable gift instead of passing it on?`,
            `Can you think of a modern situation where relationships and future cooperation matter more than getting the best immediate deal?`
        ],
        upgrade: {
            term: `build a reputation`,
            type: `phrase`,
            definition: `to develop a public image based on how you behave over time`,
            ordinary: `People may cooperate because they want others to see them as reliable.`,
            upgraded: `People may cooperate because they want to build a reputation for being reliable.`,
            priority: `key`,
            atlasPrompt: `How can someone build a reputation for being trustworthy in a new workplace or group?`
        },
        mainQuestion: `Would you join a system where you give something valuable now and trust that cooperation will benefit you later? Why or why not?`
    },
    {
        id: `cl-strategy-that-starts-friendly`,
        title: `The Strategy That Starts Friendly`,
        contextLine: `Computer tournaments, 1980s game theory`,
        teaser: `Can a simple strategy beat a clever one when people meet again and again?`,
        context: `In a famous series of computer tournaments, researchers compared strategies for the repeated Prisoner’s Dilemma, a situation where people can cooperate or protect only themselves. One successful strategy, called “tit for tat,” began by cooperating, copied the other player’s last move, and returned to cooperation when the other player did. The example showed that cooperation can grow when people are patient, respond to behaviour, and expect future meetings.`,
        followTheThread: [
            `When might copying another person’s behaviour create a fair response, and when might it make a conflict worse?`,
            `What rules could help two competing businesses or groups cooperate without becoming too trusting?`
        ],
        upgrade: {
            term: `read the situation`,
            type: `phrase`,
            definition: `To understand what is happening and decide how to respond.`,
            ordinary: `In a repeated relationship, you need to understand what the other person is doing before you react.`,
            upgraded: `In a repeated relationship, you need to read the situation before deciding whether to cooperate or protect yourself.`,
            priority: `key`,
            atlasPrompt: `When a conversation at work starts to become tense, how do you read the situation and decide what to do?`
        },
        mainQuestion: `Would you choose a strategy like “tit for tat” in an ongoing relationship or workplace situation, and why?`
    },
    {
        id: `cl-when-honest-choices-work-best`,
        title: `When Honest Choices Work Best`,
        contextLine: `School admissions in Boston, United States`,
        teaser: `What happens when a system rewards people for telling the truth about what they want?`,
        context: `For many years, Boston’s school-allocation system encouraged families to rank a less-preferred school first if they feared losing a place at their favourite. In 2005, the city moved to a different system in which families could list their real preferences more safely. This shows that strategy depends not only on people’s choices, but also on the rules creating the incentives.`,
        followTheThread: [
            `Can you think of a situation in your country where people hide their real preference because of the rules?`,
            `Should institutions be responsible for making cooperation and honesty easier, or should individuals simply learn to play the game?`
        ],
        upgrade: {
            term: `level the playing field`,
            type: `idiom`,
            definition: `To make a situation fairer by giving everyone a similar chance to succeed.`,
            ordinary: `The rules should give everyone a fair chance to get what they want.`,
            upgraded: `A good system should level the playing field so people can state their real preferences without worrying that honesty will put them at a disadvantage.`,
            priority: `key`,
            atlasPrompt: `How could a workplace level the playing field for employees competing for promotion?`
        },
        mainQuestion: `Would you prefer a system where honest choices are usually safe, even if the final result is not always what you want? Why or why not?`
    },
    {
        id: `cl-everyone-changes-at-once`,
        title: `Everyone Changes at Once`,
        contextLine: `Sweden’s switch to right-hand traffic, 1967`,
        teaser: `How can a whole country coordinate when one person changing alone would create danger?`,
        context: `On 3 September 1967, Sweden changed from driving on the left to driving on the right. The change worked because drivers, road authorities and pedestrians followed the same new rule at the same time. This is a coordination game: the best choice depends less on personal preference than on what everyone else is expected to do.`,
        followTheThread: [
            `What could happen if some people changed their behaviour but others refused to change?`,
            `Can you think of a situation where a clear shared rule is more useful than allowing everyone to choose freely?`
        ],
        upgrade: {
            term: `coordinate`,
            type: `verb`,
            definition: `to organize people or actions so that they work together effectively`,
            ordinary: `Everyone had to make the same change at the same time for the plan to work.`,
            upgraded: `Everyone had to coordinate their actions for the plan to work safely.`,
            priority: `key`,
            atlasPrompt: `When have you had to coordinate with several people to avoid confusion or conflict?`
        },
        mainQuestion: `Where in everyday life do people need to follow the same rule, even if another choice might seem better for them personally?`
    },
    {
        id: `cl-cost-of-looking-weak`,
        title: `The Cost of Looking Weak`,
        contextLine: `The Cuban Missile Crisis, 1962`,
        teaser: `How do leaders make a credible threat without starting the disaster they want to avoid?`,
        context: `During the Cuban Missile Crisis, the United States and the Soviet Union had to make decisions with incomplete information and enormous risks. Each side wanted the other to believe it would defend its interests, but an extreme response could lead to war. This is an example of brinkmanship: trying to gain an advantage by moving close to a dangerous outcome while hoping the other side backs down.`,
        followTheThread: [
            `How can a person or organisation make a promise or threat seem credible without using force?`,
            `Can showing flexibility build trust, or does it encourage others to take advantage of you?`
        ],
        upgrade: {
            term: `stand your ground`,
            type: `idiom`,
            definition: `to keep your position when someone is pressuring you to change it`,
            ordinary: `The manager kept the original deadline even after several people complained.`,
            upgraded: `The manager stood her ground and kept the original deadline even after several people complained.`,
            priority: `key`,
            atlasPrompt: `When might you need to stand your ground during a disagreement at work or in your personal life?`
        },
        mainQuestion: `When, if ever, is it wise to make a threat that you hope you will not have to carry out?`
    },
    {
        id: `cl-rules-for-sharing-the-meadow`,
        title: `Rules for Sharing the Meadow`,
        contextLine: `Törbel, Switzerland, and the commons`,
        teaser: `Why do some communities protect shared resources without putting everything under private ownership?`,
        context: `In the Swiss mountain village of Törbel, villagers traditionally managed shared meadows and forests through local rules. These rules limited use, assigned responsibilities and helped people monitor one another, making cooperation more attractive than taking as much as possible. The example shows that shared resources do not always lead to a “race to take everything”; trust, repeated relationships and fair rules can change the game.`,
        followTheThread: [
            `What kinds of shared resources in your community need stronger rules or better cooperation?`,
            `When can monitoring and penalties build trust, and when might they damage it?`
        ],
        upgrade: {
            term: `pull your weight`,
            type: `idiom`,
            definition: `To do your fair share of the work or responsibility in a group.`,
            ordinary: `A shared project works better when everyone does their fair share.`,
            upgraded: `A shared project works better when everyone pulls their weight.`,
            priority: `key`,
            atlasPrompt: `Think of a team, household, or group you know: what happens when one person does not pull their weight?`
        },
        mainQuestion: `Would you be more willing to protect a shared resource if the people using it created and enforced the rules themselves? Why or why not?`
    },
    {
        id: `cl-code-credit-and-cooperation`,
        title: `Code, Credit and Cooperation`,
        contextLine: `Open-source software communities`,
        teaser: `Why do people improve something that anyone can use for free?`,
        context: `Open-source projects allow people to use, study and improve software together. Contributors may not receive direct payment for every change, but they can gain reputation, useful skills, influence and better tools for themselves. The community still faces a free-rider problem: many people may use the software without helping to maintain it.`,
        followTheThread: [
            `Which incentives might encourage people to contribute: money, recognition, friendship, practical benefit or a sense of responsibility?`,
            `What rules or habits could help an open-source community respond when someone takes advantage of the group?`
        ],
        upgrade: {
            term: `have a stake in`,
            type: `phrase`,
            definition: `to have a personal interest in the success or outcome of something`,
            ordinary: `People are more willing to help when the result matters to them personally.`,
            upgraded: `People are more willing to contribute when they have a stake in the project’s success.`,
            priority: `key`,
            atlasPrompt: `When might employees be more cooperative because they have a stake in a decision or project?`
        },
        mainQuestion: `Would you contribute to a shared project if most users gave nothing back, and what would make cooperation feel worthwhile?`
    },
    {
        id: `cl-a-reputation-that-travels`,
        title: `A Reputation That Travels`,
        contextLine: `Maghribi traders in the medieval Mediterranean`,
        teaser: `How can merchants trust someone they may never meet again?`,
        context: `Medieval Maghribi merchants often traded across long distances, where formal courts could be slow or difficult to use. Their networks helped spread information about reliable and dishonest agents, so one act of cheating could damage a person’s future business. This shows how reputation can change the incentives in a one-time deal: people may cooperate because others will remember what they did.`,
        followTheThread: [
            `Is reputation a stronger motivation than money in some situations? Can you think of an example?`,
            `What should a community do when someone breaks an important promise but later wants to regain trust?`
        ],
        upgrade: {
            term: `word gets around`,
            type: `expression`,
            definition: `Information spreads from person to person, especially when people are talking about someone’s actions or reputation.`,
            ordinary: `People may avoid cheating because other people will hear about it.`,
            upgraded: `People may avoid cheating because word gets around.`,
            priority: `key`,
            atlasPrompt: `When could word get around in a workplace or neighborhood, and how might that affect someone’s choices?`
        },
        mainQuestion: `Would you be more honest in a business deal if you knew that everyone in your professional community would hear about your decision? Why or why not?`
    }
];
