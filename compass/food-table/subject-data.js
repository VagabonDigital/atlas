/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Food & The Table
  --------------------------------------------------------------------------
  A premium interactive speaking subject for the charged table — hospitality
  and refusal, who cooks and who is fed, feeding as love and power, scarcity
  and plenty, and the meals that stay with us. Built for tutor-led
  conversation, shared-screen teaching, real disagreement, and sharper speech.
  Compass active subject · contentVersion 1.0.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'food-table',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Food & The Table',
    titleHtml: 'Food &amp; <em>The Table</em>',
    navTitle: 'Food',
    bgImage: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D'
};

const subjectCopy = {
    cover: {
        hook: `Nobody is ever just eating.`
    },

    overview: {
        heading: `More Than the Meal`,
        intro: [
            `A shared meal can feel warm, awkward, generous, competitive, or deeply familiar. What happens around the table often matters as much as what is served.`
        ],
        question: `What usually matters most to you at a shared meal: the food itself, the people around you, or the feeling at the table?`
    },

    paths: {
        culturalLensDescription: `Explore the customs, duties, and social rules that have shaped how people feed one another.`,
        discussionDescription: `Cravings, table habits, care, and memory — from the first bite to what stays after the meal.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to connect the tastes, habits, people, and memories that surfaced.`
    },

    culturalLens: {
        heading: `Other Tables, Other Times`,
        intro: `Meals have always carried more than food. Step into other places and times, where feeding someone could show trust, duty, status, belonging — or decide who was welcome at the table.`
    },

    discussion: {
        heading: `Around the Table`
    },

    reflection: {
        title: `After the Plates Are Cleared`,
        summary: `Pause on what the conversation brought back, changed, or made you notice about the way people eat together.`,
        questions: [
            `What food memory or table habit from the conversation would you most like to return to?`,
            `What makes a meal feel like care rather than simply food?`
        ]
    },

    keyLanguage: {
        intro: `Words and expressions for talking about taste, hosting, sharing, refusing, care, and the rules around a meal.`
    }
};

const discussionSets = [
    {
        id: 'set-first-bite',
        title: `The First Bite`,
        stage: `React`,
        icon: 'react',
        description: `Cravings, odd combinations, near disasters, and the food that arrives at exactly the right moment.`,

        moments: [
            {
                id: 'moment-right-food-right-time',
                preview: `Exactly what you needed.`,
                question: `When has food arrived at exactly the right moment — after a long day, a late journey, or when you were cold, tired, or starving? What was it, and why did it feel so good?`,

                upgrade: {
                    term: `hit the spot`,
                    type: `phrase`,
                    definition: `To be exactly what you wanted or needed at that moment.`,
                    ordinary: `“After the long journey, that hot bowl of soup was exactly what I needed.”`,
                    upgraded: `“After the long journey, that hot bowl of soup really hit the spot.”`,
                    priority: 'standard',
                    atlasPrompt: `What small comfort really hits the spot after a difficult or exhausting day?`
                }
            },
            {
                id: 'moment-combination-that-works',
                preview: `It sounds wrong. It works.`,
                question: `What food combination do you love that other people find completely wrong — something sweet with something salty, an unusual sauce, or a family habit nobody else understands? How did you discover it?`,

                upgrade: {
                    term: `moreish`,
                    type: `adjective`,
                    definition: `So pleasant to eat that you want to keep having more.`,
                    ordinary: `“It sounds like a strange combination, but once I start eating it, I always want more.”`,
                    upgraded: `“It sounds like a strange combination, but it is surprisingly moreish.”`,
                    priority: 'standard',
                    atlasPrompt: `What snack or small treat do you find dangerously moreish once you start?`
                }
            },
            {
                id: 'moment-meal-nearly-ruined',
                preview: `It nearly went in the bin.`,
                question: `Have you ever nearly ruined a meal — burned it, added the wrong ingredient, or forgotten something important — and then somehow saved it? What did you do, or who came to the rescue?`,

                upgrade: {
                    term: `salvage`,
                    type: `verb`,
                    definition: `To save something from failure, damage, or ruin.`,
                    ordinary: `“The sauce had nearly split, but adding a little water saved the meal.”`,
                    upgraded: `“The sauce had nearly split, but adding a little water salvaged the meal.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you managed to salvage a plan, project, or conversation that was going badly?`
                }
            },
            {
                id: 'moment-looked-awful-tasted-good',
                preview: `It looked awful.`,
                question: `What meal looked awful but tasted far better than expected — something homemade, street food, leftovers, or a dish you could barely identify? What made you take the first bite?`,

                upgrade: {
                    term: `unappetising`,
                    type: `adjective`,
                    definition: `Not looking or smelling pleasant enough to eat.`,
                    ordinary: `“It looked so unpleasant that I nearly refused it, but it tasted wonderful.”`,
                    upgraded: `“It looked so unappetising that I nearly refused it, but it tasted wonderful.”`,
                    priority: 'standard',
                    atlasPrompt: `What food looks unappetising to you even when other people insist it tastes excellent?`
                }
            },
            {
                id: 'moment-ordinary-food-you-miss',
                preview: `The ordinary thing you start craving.`,
                question: `What food do you miss when you are away from home — not necessarily a special dish, but something ordinary you suddenly start craving? What makes the version back home different?`,

                upgrade: {
                    term: `crave`,
                    type: `verb`,
                    definition: `To feel a strong desire for something.`,
                    ordinary: `“Whenever I am away, I really want the bread we eat at home.”`,
                    upgraded: `“Whenever I am away, I crave the bread we eat at home.”`,
                    priority: 'key',
                    atlasPrompt: `What do you tend to crave when you are tired, stressed, or far from home?`
                }
            }
        ],

        makeItReal: {
            title: `Convince Me to Try It`,
            prompt: `Choose a food you love that sounds, looks, or smells unconvincing. Persuade your tutor to try it without pretending it is normal: describe the first bite, the best part, and the warning they need.`
        }
    },

    {
        id: 'set-rules-nobody-wrote',
        title: `Rules Nobody Wrote`,
        stage: `Explain`,
        icon: 'explain',
        description: `Sharing, refusing, helping, waiting, and the table habits people judge without saying so.`,

        moments: [
            {
                id: 'moment-host-keeps-serving',
                preview: `You said you were full.`,
                question: `You say you are full, but the host is already putting another spoonful on your plate. Do you accept it, stop them, or find a polite escape? What kind of host makes this hardest?`,

                upgrade: {
                    term: `relent`,
                    type: `verb`,
                    definition: `To finally agree after refusing or resisting.`,
                    ordinary: `“I kept saying no, but eventually I gave in and accepted another serving.”`,
                    upgraded: `“I kept saying no, but eventually I relented and accepted another serving.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you eventually relent after someone kept asking or trying to persuade you?`
                }
            },
            {
                id: 'moment-everyone-wants-some',
                preview: `You ordered it. Everyone wants some.`,
                question: `You order the dish you really wanted, and everyone immediately suggests sharing everything. Are you happy to pass it around, or do you secretly want your own plate left alone?`,

                upgrade: {
                    term: `territorial`,
                    type: `adjective`,
                    definition: `Unwilling to share something because you feel strongly that it belongs to you.`,
                    ordinary: `“I am happy to share most things, but I get very possessive about my chips.”`,
                    upgraded: `“I am happy to share most things, but I get territorial about my chips.”`,
                    priority: 'standard',
                    atlasPrompt: `What space, object, responsibility, or routine do you become surprisingly territorial about?`
                }
            },
            {
                id: 'moment-photo-before-eating',
                preview: `Nobody can eat yet.`,
                question: `Someone stops the whole table to photograph every dish before anyone can eat. Is that harmless fun, good manners for the cook, or deeply annoying? What would make you finally start without them?`,

                upgrade: {
                    term: `hold someone up`,
                    type: `phrasal verb`,
                    definition: `To delay someone or make them wait.`,
                    ordinary: `“She delayed everyone while she photographed every plate.”`,
                    upgraded: `“She held everyone up while she photographed every plate.”`,
                    priority: 'key',
                    atlasPrompt: `What small habit often holds people up at work, while travelling, or when getting ready to leave?`
                }
            },
            {
                id: 'moment-work-after-the-meal',
                preview: `Somebody cooked. Somebody disappeared.`,
                question: `At a big meal, who usually shops, cooks, serves, and clears up — and who somehow disappears when the work begins? Is that habit changing where you live, or not really?`,

                upgrade: {
                    term: `chip in`,
                    type: `phrasal verb`,
                    definition: `To help with a task or contribute money, effort, or ideas.`,
                    ordinary: `“Everyone should help with the cooking or clearing instead of leaving it to one person.”`,
                    upgraded: `“Everyone should chip in with the cooking or clearing instead of leaving it to one person.”`,
                    priority: 'key',
                    atlasPrompt: `When everyone is busy, do you naturally chip in or wait until somebody asks you directly?`
                }
            },
            {
                id: 'moment-food-people-overpraise',
                preview: `Everyone says it is amazing.`,
                question: `What expensive, fashionable, or famous food do people praise far more than it deserves? What would you happily eat instead, even if it looked much less impressive?`,

                upgrade: {
                    term: `overrated`,
                    type: `adjective`,
                    definition: `Considered better or more impressive than it really is.`,
                    ordinary: `“People praise truffle oil far more than I think it deserves.”`,
                    upgraded: `“I think truffle oil is completely overrated.”`,
                    priority: 'key',
                    atlasPrompt: `What film, place, product, or trend do you think is overrated — and what deserves more attention instead?`
                }
            }
        ],

        makeItReal: {
            title: `The Rules of Your Table`,
            prompt: `Create three rules for a shared meal — about phones, sharing, helping, refusing food, or anything else that matters. For each rule, your tutor will describe a guest or situation that makes it difficult to follow. Decide whether to keep, change, or drop the rule.`
        }
    },

    {
        id: 'set-what-table-keeps',
        title: `What the Table Keeps`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `Recipes passed down, food offered as care, and tastes that stay with us or change over time.`,

        moments: [
            {
                id: 'moment-taste-you-cannot-recreate',
                preview: `A taste you cannot get back.`,
                question: `Is there a dish you can no longer taste exactly as you remember it — because the person who made it is gone, the place closed, or the recipe changed? What do you think is missing?`,

                upgrade: {
                    term: `recreate`,
                    type: `verb`,
                    definition: `To make something again so that it closely matches the original.`,
                    ordinary: `“I have tried to make my grandmother’s soup again, but it never tastes exactly the same.”`,
                    upgraded: `“I have tried to recreate my grandmother’s soup, but it never tastes exactly the same.”`,
                    priority: 'standard',
                    atlasPrompt: `What experience, atmosphere, or moment have you tried to recreate without quite succeeding?`
                }
            },
            {
                id: 'moment-food-as-care',
                preview: `The food was really about care.`,
                question: `Think of a time food became a way of caring for someone — perhaps during an illness, a loss, or a terrible week. Who brought or cooked it, and what did the gesture say that words could not?`,

                upgrade: {
                    term: `get someone through something`,
                    type: `phrase`,
                    definition: `To help someone cope with or survive a difficult period.`,
                    ordinary: `“The meals she brought helped me cope with a terrible few weeks.”`,
                    upgraded: `“The meals she brought got me through a terrible few weeks.”`,
                    priority: 'key',
                    atlasPrompt: `Who or what got you through a difficult period — a person, a routine, or a small daily comfort?`
                }
            },
            {
                id: 'moment-recipe-changed-hands',
                preview: `A recipe that changed hands.`,
                question: `What dish, recipe, or kitchen habit has been passed through a family or group you know? Who changed it along the way — and which version now feels “right”?`,

                upgrade: {
                    term: `hand something down`,
                    type: `phrasal verb`,
                    definition: `To pass a skill, object, story, or tradition to a younger person or later generation.`,
                    ordinary: `“My grandmother taught the recipe to my aunt, who later taught it to me.”`,
                    upgraded: `“My grandmother handed the recipe down to my aunt, who later handed it down to me.”`,
                    priority: 'key',
                    atlasPrompt: `What skill, object, story, or tradition has been handed down in your family or community?`
                }
            },
            {
                id: 'moment-taste-changed-over-time',
                preview: `You used to hate it.`,
                question: `What food did you dislike when you were younger but now enjoy — or the other way round? What changed first: the food, your habits, or your idea of it?`,

                upgrade: {
                    term: `grow on someone`,
                    type: `phrasal verb`,
                    definition: `To become more enjoyable or appealing to someone over time.`,
                    ordinary: `“I did not like olives at first, but gradually I began to enjoy them.”`,
                    upgraded: `“I did not like olives at first, but they gradually grew on me.”`,
                    priority: 'key',
                    atlasPrompt: `What person, place, activity, or idea took time to grow on you?`
                }
            },
            {
                id: 'moment-food-was-not-the-point',
                preview: `Was the food ever the point?`,
                question: `Think of a meal you still remember clearly. Was the food actually exceptional, or did the people, timing, or place make it matter? What part comes back first?`,

                upgrade: {
                    term: `beside the point`,
                    type: `phrase`,
                    definition: `Not important compared with the real issue or reason something mattered.`,
                    ordinary: `“The food was not really what mattered; it was the people and the whole evening.”`,
                    upgraded: `“The food was beside the point; it was the people and the whole evening.”`,
                    priority: 'key',
                    atlasPrompt: `When has the thing everyone focused on been beside the point, while the real value was somewhere else?`
                }
            }
        ],

        makeItReal: {
            title: `Say It With a Meal`,
            prompt: `Choose one person and one message you would rather express through a meal than say directly — welcome, thank you, I’m sorry, or I missed you. Build the meal and explain how each choice carries the message.`
        }
    }
];

const clCards = [
    {
        id: 'cl-the-no-that-isnt',
        contextLine: `Hospitality customs`,
        title: `The No That Isn't`,
        teaser: `Here, “no thank you” is only the opening move.`,

        context: `In some hospitality customs, a guest refuses food or drink the first time it is offered. The host offers again, the guest refuses again, and only after several rounds do they accept. Because both people know the pattern, a guest who truly means “no” may struggle to make it clear.`,

        mainQuestion: `You really do not want any more food, but the host keeps offering. How would you refuse without sounding rude — and make sure they believe you?`,

        followTheThread: [
            `Does repeated offering feel generous to you, or does it make a guest’s “no” harder to respect?`,
            `What polite words or phrases do people sometimes use where you live without meaning them literally?`
        ],

        upgrade: {
            term: `insistent`,
            type: `adjective`,
            definition: `Continuing to press for something despite another person’s hesitation or refusal.`,
            ordinary: `“The host kept offering more food even after I said I was full.”`,
            upgraded: `“The host was so insistent that I eventually accepted more food even though I was full.”`,
            priority: 'key',
            atlasPrompt: `Who becomes insistent when they think they know what is best for you?`
        }
    },

    {
        id: 'cl-a-stranger-at-the-door',
        contextLine: `Traditional hospitality`,
        title: `A Stranger at the Door`,
        teaser: `A stranger arrives hungry. The custom says you must feed them.`,

        context: `A traveller arrives at a stranger’s home after dark, cold and hungry. In some older hospitality traditions, the household was expected to offer food, shelter, and safety before asking much about them. Refusing could bring shame, while the guest was expected to accept the welcome without taking advantage of it.`,

        mainQuestion: `A stranger you do not trust arrives cold and hungry, and custom says you should feed them. Would you open the door — and what would make you refuse?`,

        followTheThread: [
            `What should one person owe a stranger in genuine need?`,
            `When has someone helped you before they knew whether they could trust you?`
        ],

        upgrade: {
            term: `turn someone away`,
            type: `phrasal verb`,
            definition: `To refuse to let someone in, or to refuse to help them.`,
            ordinary: `“The custom meant you could not refuse a traveller and send them back into the cold.”`,
            upgraded: `“The custom meant you could not turn a traveller away.”`,
            priority: 'key',
            atlasPrompt: `When is it fair to turn someone away, and when should you always help — at a door, a business, or a border?`
        }
    },

    {
        id: 'cl-the-more-you-feed-them',
        contextLine: `Status and feasting`,
        title: `The More You Feed Them`,
        teaser: `Feeding people generously was how you proved your standing.`,

        context: `A host invites the whole community to a feast. Food is piled high, gifts are handed out, and wealth is spent where everyone can see it. In some traditions, hosts competed to give away more food and goods than their rivals — or even destroyed valuable things to prove they could afford to lose them.`,

        mainQuestion: `Imagine people judged your success by the size of the feasts you gave, even when you could barely afford them. Would you keep competing — or let others think you were ungenerous?`,

        followTheThread: [
            `When does being generous stop being about the guests and start being about the host?`,
            `Where have you seen generosity used to win status or admiration rather than simply to help?`
        ],

        upgrade: {
            term: `push the boat out`,
            type: `idiom`,
            definition: `To spend a lot of money or make a special effort for an occasion.`,
            ordinary: `“For the wedding they spent far more than usual to make it impressive.”`,
            upgraded: `“For the wedding they really pushed the boat out.”`,
            priority: 'standard',
            atlasPrompt: `When did someone push the boat out for an occasion — and was it worth it?`
        }
    },

    {
        id: 'cl-breaking-bread',
        contextLine: `Meals and trust`,
        title: `Breaking Bread`,
        teaser: `You do not harm someone you have just eaten with.`,

        context: `Two people who distrust each other sit at the same table. They pass food, eat from the same dishes, and stay long enough to talk. In many places, people have shared a meal to confirm an agreement or end a conflict. Harming someone afterwards could then be treated as a serious betrayal.`,

        mainQuestion: `Would you sit down to eat with someone you had fallen out with? What might become easier once the meal began?`,

        followTheThread: [
            `Has eating together ever softened a difficult relationship in your life?`,
            `Why might sharing food change a conversation that was going nowhere?`
        ],

        upgrade: {
            term: `common ground`,
            type: `phrase`,
            definition: `Shared interests, beliefs, or experiences that help people understand each other.`,
            ordinary: `“Once we started eating, we found things we agreed on and got along more easily.”`,
            upgraded: `“Once we started eating, we found some common ground.”`,
            priority: 'key',
            atlasPrompt: `When did you unexpectedly find common ground with someone you thought you would disagree with?`
        }
    },

    {
        id: 'cl-one-persons-delicacy',
        contextLine: `Taste and disgust`,
        title: `One Person's Delicacy`,
        teaser: `A prized local treat that turns a visitor’s stomach.`,

        context: `A host proudly brings out a local delicacy: strong cheese, fermented fish, insects, or an organ dish. Everyone at the table sees a treat, while the visitor struggles not to react. From childhood, people learn which smells, textures, and animals count as food — and which do not.`,

        mainQuestion: `A host proudly offers you a delicacy that turns your stomach. Would you try it out of respect — and what might help you get past the first reaction?`,

        followTheThread: [
            `Can people learn to enjoy almost any food, or are some reactions too strong?`,
            `What food did you dislike at first but later begin to enjoy?`
        ],

        upgrade: {
            term: `an acquired taste`,
            type: `phrase`,
            definition: `Something you only begin to like after trying it several times.`,
            ordinary: `“I hated it at first, but after a few tries I started to enjoy it.”`,
            upgraded: `“It was an acquired taste, but after a few tries I started to enjoy it.”`,
            priority: 'key',
            atlasPrompt: `What has been an acquired taste for you — a food, a kind of music, a place, or an activity?`
        }
    },

    {
        id: 'cl-enough-to-last-the-winter',
        contextLine: `Before refrigeration`,
        title: `Enough to Last the Winter`,
        teaser: `Waste a little now, go hungry later.`,

        context: `Before reliable refrigeration, families kept food through winter by salting, smoking, drying, and pickling it. A poor harvest or a spoiled supply of food could mean hunger months later. Throwing away a usable scrap was not a small mistake when spring was still far away.`,

        mainQuestion: `Imagine every jar, scrap, and preserved piece might be needed before spring. What would you save — and what would still feel reasonable to throw away?`,

        followTheThread: [
            `How careful are you with food waste, and what shaped that habit?`,
            `What experience has changed how you think about food or waste?`
        ],

        upgrade: {
            term: `go to waste`,
            type: `phrase`,
            definition: `To be wasted or thrown away instead of being used.`,
            ordinary: `“They used every part of the animal so that nothing was thrown away.”`,
            upgraded: `“They used every part of the animal so that nothing went to waste.”`,
            priority: 'key',
            atlasPrompt: `What do you hate to see go to waste — food, money, time, talent, or something else?`
        }
    },

    {
        id: 'cl-from-one-pot',
        contextLine: `Shared-dish meals`,
        title: `From One Pot`,
        teaser: `One dish in the middle, and everyone’s hands in it.`,

        context: `A large dish is placed in the centre, and everyone eats from it together. There may be no separate plates; people use bread, spoons, or the right hand and take food from the part nearest to them. For someone used to an individual plate, the closeness can feel unfamiliar.`,

        mainQuestion: `You sit down and everyone begins eating from one shared dish. Would that feel warm and welcoming to you, or too close for comfort?`,

        followTheThread: [
            `What changes when everyone reaches into the same dish instead of receiving a separate portion?`,
            `Which parts of a meal feel naturally shared to you, and which feel private?`
        ],

        upgrade: {
            term: `dig in`,
            type: `phrasal verb`,
            definition: `To start eating, especially with energy or without waiting too formally.`,
            ordinary: `“There were no separate portions, so everyone simply started eating from the middle.”`,
            upgraded: `“There were no separate portions, so everyone simply dug in.”`,
            priority: 'standard',
            atlasPrompt: `When do you feel comfortable digging in, and when do you wait for someone else to begin?`
        }
    },

    {
        id: 'cl-carried-across-borders',
        contextLine: `Food and migration`,
        title: `What You Take With You`,
        teaser: `Leave everything behind — but not this dish.`,

        context: `Someone moves far from the place they grew up and searches several shops for one familiar ingredient. They cook a family recipe in a new kitchen, and the smell brings back a person, a street, or a home they no longer see every day.`,

        mainQuestion: `You move far from home and can keep only one dish from the place where you grew up. Which dish do you choose — and who or what does it bring back?`,

        followTheThread: [
            `Can a recipe keep someone connected to a place, or does the recipe always change when people move?`,
            `Do you know someone who keeps a person or place close by cooking a particular dish?`
        ],

        upgrade: {
            term: `a taste of home`,
            type: `phrase`,
            definition: `Something, usually food, that strongly reminds you of where you come from.`,
            ordinary: `“That dish strongly reminded me of where I grew up.”`,
            upgraded: `“That dish gave me a real taste of home.”`,
            priority: 'standard',
            atlasPrompt: `What food, smell, or small routine gives you a taste of home when you are away?`
        }
    },

    {
        id: 'cl-a-separate-table',
        contextLine: `Who eats together`,
        title: `A Separate Table`,
        teaser: `Some people belong at this table. Some are seated elsewhere.`,

        context: `At one meal, the family sits at the main table while servants eat elsewhere. At another, children are sent to a smaller table, or guests are seated according to rank. Who eats together — and who is kept apart — can reveal the social order before anyone says a word.`,

        mainQuestion: `You are a guest and notice that some people have been seated separately. Would you stay where you were placed, or move to join them? What might stop you?`,

        followTheThread: [
            `When is a separate table simply practical, and when does it show who is considered important?`,
            `Have you seen a table used to include someone who felt out of place — or to leave someone out?`
        ],

        upgrade: {
            term: `make room for someone`,
            type: `phrase`,
            definition: `To create space for someone so they can join or be included.`,
            ordinary: `“When I arrived unexpectedly, they found me a space and included me straight away.”`,
            upgraded: `“When I arrived unexpectedly, they made room for me straight away.”`,
            priority: 'key',
            atlasPrompt: `When has a group made room for you — at work, in a friendship, or somewhere you did not expect to fit in?`
        }
    }
];
