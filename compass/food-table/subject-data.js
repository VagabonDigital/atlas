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
        heading: `The Charged Table`,
        intro: [
            `A meal is rarely only a meal. The same table can carry welcome and pressure, love and control, comfort and quiet competition — sometimes all in one evening. Who cooked, who is fed first, what you can politely refuse, and what a dish is meant to say can matter as much as the food itself.`
        ],
        question: `Think of the last meal you shared with other people. Was it really about the food — or about everything else going on around the table?`
    },
    paths: {
        culturalLensDescription: `Step into other places and centuries, where feeding a guest could seal a deal, mark your rank, or put a whole household to the test.`,
        discussionDescription: `Being fed and feeding others — the awkward plate, the insistent host, the meals you still taste years later.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to draw the threads of the subject together before you leave the table.`
    },
    culturalLens: {
        heading: `How the World Sets the Table`,
        intro: `Feeding people has never worked the same way everywhere. Step into other places and centuries, where a shared meal could seal an agreement, show off a family's standing, settle who ate first, or place a heavy duty on whoever opened the door.`
    },
    discussion: {
        heading: `Pull Up a Chair`
    },
    reflection: {
        title: `When the Plates Are Cleared`,
        summary: `Before you leave the table, notice what stayed with you — a memory that surfaced, a view you found yourself defending, or something you saw differently.`,
        questions: [
            `What makes you feel truly welcome at someone's table — and what can a host do that money and effort cannot?`,
            `Is there a way you feed people, or a table custom you grew up with, that you would never give up — or one you would happily leave behind?`
        ]
    },
    keyLanguage: {
        intro: `Ways to talk about hosting and being hosted, offering and refusing, and what a shared meal can mean.`
    }
};

const discussionSets = [
    {
        id: 'set-someone-elses-table',
        title: `Someone Else's Table`,
        stage: `React`,
        icon: 'react',
        description: `The dish you dreaded, the host who won't stop, and the tastes you defend against all reason.`,
        moments: [
            {
                id: 'moment-dreaded-dish',
                preview: `The plate you were dreading.`,
                question: `Have you ever sat in front of something a host had cooked specially, knowing you really didn't want to eat it? What was it — and what did you do, or have you watched someone else squirm through a meal they couldn't face?`,
                upgrade: {
                    term: `force something down`,
                    type: `phrasal verb`,
                    definition: `To make yourself eat or swallow something you find difficult or unpleasant.`,
                    ordinary: `“I didn't want it at all, but I made myself eat it so I wouldn't offend her.”`,
                    upgraded: `“I didn't want it at all, but I forced it down so I wouldn't offend her.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you had to force something down — food, medicine, or even bad news you didn't want to hear?`
                }
            },
            {
                id: 'moment-plate-never-empty',
                preview: `The plate that refills itself.`,
                question: `Some hosts simply will not let your plate stay empty — more rice, more meat, one more slice, you've barely started. Is that warmth, or a kind of pressure? Where's the line for you?`,
                upgrade: {
                    term: `won't hear of it`,
                    type: `phrase`,
                    definition: `To refuse to allow or accept something, especially a polite objection.`,
                    ordinary: `“I said I was completely full, but she insisted and put more on my plate anyway.”`,
                    upgraded: `“I said I was completely full, but she wouldn't hear of it.”`,
                    priority: 'standard',
                    atlasPrompt: `When has someone refused to accept your “no” — insisting on paying, helping, or giving you something you didn't need?`
                }
            },
            {
                id: 'moment-secret-favourite',
                preview: `The thing you love that others don't get.`,
                question: `What's a food, or a strange combination, that you genuinely love even though other people pull a face at it? Do you admit it, or keep it to yourself — and do you know anyone with a stranger habit?`,
                upgrade: {
                    term: `a guilty pleasure`,
                    type: `phrase`,
                    definition: `Something you enjoy even though you feel slightly embarrassed about it.`,
                    ordinary: `“Crisp sandwiches are something I love but feel a bit embarrassed about.”`,
                    upgraded: `“Crisp sandwiches are my guilty pleasure.”`,
                    priority: 'key',
                    atlasPrompt: `What's a guilty pleasure of yours — a show, a song, or a habit you enjoy but wouldn't broadcast?`
                }
            },
            {
                id: 'moment-said-it-was-lovely',
                preview: `“It's delicious,” you said.`,
                question: `Have you ever told someone their cooking was lovely when it really wasn't — or quietly made an excuse to leave half of it? Did they believe you, or have you been the cook watching someone pretend?`,
                upgrade: {
                    term: `a white lie`,
                    type: `phrase`,
                    definition: `A small, harmless lie told to be polite or to avoid hurting someone.`,
                    ordinary: `“It was not good at all, but I told her it was lovely so I wouldn't hurt her feelings.”`,
                    upgraded: `“It was not good at all, but I told her a white lie so I wouldn't hurt her feelings.”`,
                    priority: 'key',
                    atlasPrompt: `When is a white lie kinder than the truth — at work, with family, or between friends?`
                }
            },
            {
                id: 'moment-wont-touch-it',
                preview: `You will not eat it. That's final.`,
                question: `Is there a food you flatly refuse to eat, even when there's no real reason — you just won't, and no amount of persuading will change your mind? Where did it come from — or is there someone in your life who's impossible to budge?`,
                upgrade: {
                    term: `dig your heels in`,
                    type: `idiom`,
                    definition: `To stubbornly refuse to change your mind, even when others are pushing you.`,
                    ordinary: `“No matter how much they pushed, I refused to try it and would not change my mind.”`,
                    upgraded: `“No matter how much they pushed, I dug my heels in and would not try it.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you dig your heels in over something small, just because someone was pushing you to give in?`
                }
            }
        ],
        makeItReal: {
            title: `No, Really, I Couldn't`,
            prompt: `Your tutor is the host who will not stop feeding you. Keep turning down more food across several rounds — stay warm, stay polite, and don't give in. How many different ways can you say no without causing offence?`
        }
    },
    {
        id: 'set-who-cooks-who-eats',
        title: `Who Cooks, Who Eats`,
        stage: `Explain`,
        icon: 'explain',
        description: `The work nobody sees, the showing off, the refusals, and the quiet order of who gets served first.`,
        moments: [
            {
                id: 'moment-same-few-people',
                preview: `The same hands, every time.`,
                question: `At big meals, it's often the same few people cooking, serving, and clearing while everyone else just sits and eats. Is that fair, or just the way it's always been — and whose job is it to change it?`,
                upgrade: {
                    term: `not lift a finger`,
                    type: `idiom`,
                    definition: `To do nothing at all to help, especially when others are working.`,
                    ordinary: `“Everyone else did all the work while he sat there and did nothing to help.”`,
                    upgraded: `“Everyone else did all the work while he didn't lift a finger.”`,
                    priority: 'key',
                    atlasPrompt: `Where have you seen the same few people do everything while others don't lift a finger — at work, at home, or in a group?`
                }
            },
            {
                id: 'moment-impress-or-feed',
                preview: `Dinner as a performance.`,
                question: `Some people cook to impress — the ambitious dish, the perfect plating; others just want everyone full and happy. Which do you trust more at a dinner, and when does effort tip into showing off?`,
                upgrade: {
                    term: `all for show`,
                    type: `phrase`,
                    definition: `Done only to impress people, with little real meaning behind it.`,
                    ordinary: `“He cared more about how it looked than whether anyone actually enjoyed it.”`,
                    upgraded: `“It looked wonderful, but it was all for show.”`,
                    priority: 'key',
                    atlasPrompt: `Where have you seen something done all for show — a gift, an apology, or a grand gesture with nothing behind it?`
                }
            },
            {
                id: 'moment-refuse-what-was-cooked',
                preview: `Can you ever say no to a cooked meal?`,
                question: `Is it ever okay to refuse food someone has cooked specially for you — for an allergy, a strong dislike, or a principle you hold — or does saying no always land as an insult, however you word it?`,
                upgrade: {
                    term: `make an exception`,
                    type: `phrase`,
                    definition: `To not apply your usual rule in one particular case.`,
                    ordinary: `“I don't normally eat meat, but I ate it that once so I wouldn't offend them.”`,
                    upgraded: `“I don't normally eat meat, but I made an exception so I wouldn't offend them.”`,
                    priority: 'key',
                    atlasPrompt: `When have you made an exception to one of your own rules — and were you glad you did?`
                }
            },
            {
                id: 'moment-food-as-control',
                preview: `The one who decides what's on the table.`,
                question: `In some families — one you know, or one from a book or film — food is quietly about power: who cooks what, who is allowed seconds, whose treat gets withheld. Where have you seen a meal used to run the room?`,
                upgrade: {
                    term: `call the shots`,
                    type: `idiom`,
                    definition: `To be the person who makes the important decisions and holds the control.`,
                    ordinary: `“In that house, whoever controlled the kitchen controlled everything and made all the decisions.”`,
                    upgraded: `“In that house, whoever controlled the kitchen called the shots.”`,
                    priority: 'standard',
                    atlasPrompt: `In a group you know, who really calls the shots — and how can you tell it's them?`
                }
            },
            {
                id: 'moment-who-gets-served-first',
                preview: `Who gets the first plate.`,
                question: `Think about who gets served first where you've eaten — guests, elders, men, children, whoever cooked. What does that running order quietly say about what a place values?`,
                upgrade: {
                    term: `a pecking order`,
                    type: `phrase`,
                    definition: `An order of rank in a group, deciding who comes first and who comes last.`,
                    ordinary: `“The important guests were served first, then the men, then everyone else — there was a clear order of rank.”`,
                    upgraded: `“The important guests were served first, then the men, then everyone else — there was a clear pecking order.”`,
                    priority: 'standard',
                    atlasPrompt: `Where else have you noticed a pecking order — in an office, a family, or a group of friends?`
                }
            }
        ],
        makeItReal: {
            title: `The House Rule`,
            prompt: `Invent one fair rule for cooking, serving, and clearing when a group eats together. Then defend it to the person in the group who would be most annoyed by it. Is “fair” even the right goal here — or is it something else?`
        }
    },
    {
        id: 'set-what-the-table-keeps',
        title: `What the Table Keeps`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The dish you can't get back, the food that arrived when you needed it, and why some meals never leave you.`,
        moments: [
            {
                id: 'moment-dish-thats-gone',
                preview: `A taste you can't get back.`,
                question: `Is there a dish you'll never taste quite the same again — because the person who made it is gone, a place closed, or your own attempts just miss something? What do you think is actually missing?`,
                upgrade: {
                    term: `can't put your finger on it`,
                    type: `idiom`,
                    definition: `To be unable to identify exactly what is wrong or different about something.`,
                    ordinary: `“I follow the recipe exactly, but something is different and I just can't say what.”`,
                    upgraded: `“I follow the recipe exactly, but something is different and I can't put my finger on it.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you known something was off or different but couldn't put your finger on what?`
                }
            },
            {
                id: 'moment-fed-when-you-needed',
                preview: `The meal that was really about you.`,
                question: `Has someone ever fed you exactly when you needed it — after a loss, an illness, a hard week — where the food mattered far less than the fact they showed up? What did they bring, or did you do this for someone else?`,
                upgrade: {
                    term: `get someone through something`,
                    type: `phrase`,
                    definition: `To help someone survive or cope with a difficult period.`,
                    ordinary: `“Those meals she dropped round helped me survive a really hard few weeks.”`,
                    upgraded: `“Those meals she dropped round got me through a really hard few weeks.”`,
                    priority: 'key',
                    atlasPrompt: `Who or what got you through a hard stretch — a person, a routine, or a small daily comfort?`
                }
            },
            {
                id: 'moment-little-or-lavish',
                preview: `A feast that fell flat.`,
                question: `Think of a huge, expensive spread and a simple plate of something plain. Which has stayed with you more — and does a lavish meal ever leave you strangely unmoved?`,
                upgrade: {
                    term: `leave someone cold`,
                    type: `idiom`,
                    definition: `To fail to interest, impress, or move someone, despite seeming impressive.`,
                    ordinary: `“Everyone said the tasting menu was amazing, but it did nothing for me.”`,
                    upgraded: `“Everyone said the tasting menu was amazing, but it left me cold.”`,
                    priority: 'standard',
                    atlasPrompt: `What impresses everyone else but leaves you cold — a film, a trend, or a famous place?`
                }
            },
            {
                id: 'moment-dish-that-gives-you-away',
                preview: `The dish that says where you're from.`,
                question: `What dish gives away where you come from — the one you'd defend, cook for a newcomer, or argue about how it's “properly” made? And what do outsiders always get wrong — about yours, or about a dish you know is fiercely defended somewhere?`,
                upgrade: {
                    term: `a point of pride`,
                    type: `phrase`,
                    definition: `Something you feel proud of and will stand up for.`,
                    ordinary: `“How we make it at home is something I'm proud of and will always defend.”`,
                    upgraded: `“How we make it at home is a point of pride for me.”`,
                    priority: 'key',
                    atlasPrompt: `What's a point of pride for you — about where you're from, what you do, or how you do it?`
                }
            },
            {
                id: 'moment-was-it-the-food',
                preview: `Was the food ever the point?`,
                question: `Think of a meal you'll always remember. Was the food itself actually wonderful — or was it the people, the timing, the moment, and the plate in front of you barely registered at all?`,
                upgrade: {
                    term: `beside the point`,
                    type: `phrase`,
                    definition: `Not important compared with the real issue; not what really matters.`,
                    ordinary: `“Honestly, what we ate wasn't the thing that mattered — it was the whole evening.”`,
                    upgraded: `“Honestly, the food was beside the point — it was the whole evening.”`,
                    priority: 'key',
                    atlasPrompt: `When has the thing everyone focuses on turned out to be beside the point, and the real value was somewhere else?`
                }
            }
        ],
        makeItReal: {
            title: `A Meal That Says It`,
            prompt: `Plan a single meal meant to say something you'd struggle to say out loud — welcome, thank you, I'm sorry, or I've missed you — to one particular person. What goes on the table, and how does it carry the message?`
        }
    }
];

const clCards = [
    {
        id: 'cl-the-no-that-isnt',
        contextLine: `Hospitality customs`,
        title: `The No That Isn't`,
        teaser: `Here, “no thank you” is only the opening move.`,
        context: `In many cultures, politeness expects a guest to refuse food or drink at first, and expects the host to keep offering. Only after two or three rounds is the offer finally accepted. Everyone knows the steps, which makes a genuine “no” surprisingly hard to land — the whole exchange is built to end the same way.`,
        mainQuestion: `You honestly don't want any more, but here a “no” is treated as the first step in a dance. How would you refuse and actually be believed?`,
        followTheThread: [
            `Is a custom like this warm and generous, or a polite trap nobody can escape?`,
            `Where you live, what offer or apology do people make that they don't fully mean — and everyone understands that?`
        ],
        upgrade: {
            term: `take the hint`,
            type: `phrase`,
            definition: `To understand what someone means from an indirect signal, without being told directly.`,
            ordinary: `“I kept saying I had to leave, but he didn't understand the signal and carried on talking.”`,
            upgraded: `“I kept saying I had to leave, but he didn't take the hint and carried on talking.”`,
            priority: 'standard',
            atlasPrompt: `When has someone failed to take the hint — and what did you have to do in the end?`
        }
    },
    {
        id: 'cl-a-stranger-at-the-door',
        contextLine: `Traditional hospitality`,
        title: `A Stranger at the Door`,
        teaser: `A stranger arrives hungry. The custom says you must feed them.`,
        context: `Many traditional societies held strong rules of hospitality: a traveller or stranger who arrived at your door had to be given food, shelter, and safety, sometimes even if they were an enemy. To refuse could bring real shame on the household. The guest, in turn, was expected not to abuse the welcome.`,
        mainQuestion: `A stranger you don't trust arrives cold and hungry, and the custom says you must let them in and feed them. Would you follow it — and what would make you shut the door instead?`,
        followTheThread: [
            `What, if anything, do we owe a stranger in genuine need?`,
            `Has a stranger ever helped you when they didn't have to — or have you done that for someone?`
        ],
        upgrade: {
            term: `turn someone away`,
            type: `phrasal verb`,
            definition: `To refuse to let someone in, or to refuse to help them.`,
            ordinary: `“The custom meant you could not refuse a traveller and send them back out into the cold.”`,
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
        context: `In some societies, hosting a large feast has been a way to earn respect and show your standing. In certain traditions this turned competitive: hosts gave away, or even destroyed, great quantities of food and goods to prove they could afford the loss. Generosity and rivalry sat side by side at the same table.`,
        mainQuestion: `Imagine your standing in the community depended on throwing feasts you could barely afford. Would you play along — or refuse and let people talk?`,
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
        teaser: `You don't harm someone you've just eaten with.`,
        context: `Across many cultures, sharing a meal has been a way to seal an agreement or build a bond. Deals, agreements, and peace between enemies have long been marked by eating together, and some traditions treated harming someone you had shared food with as a serious wrong. The meal did work that words alone could not.`,
        mainQuestion: `Does sitting down to eat with someone actually change how you feel about them — or is that just a comforting story? Would you share a meal with someone you'd fallen out with?`,
        followTheThread: [
            `Has a shared meal ever changed one of your own relationships, for better or worse?`,
            `Why might eating together do something that talking alone cannot?`
        ],
        upgrade: {
            term: `common ground`,
            type: `phrase`,
            definition: `Shared interests, beliefs, or experiences that help people understand each other.`,
            ordinary: `“Once we started eating, we found things we agreed on and got along more easily.”`,
            upgraded: `“Once we started eating, we found some common ground.”`,
            priority: 'key',
            atlasPrompt: `When did you unexpectedly find common ground with someone you thought you'd disagree with?`
        }
    },
    {
        id: 'cl-one-persons-delicacy',
        contextLine: `Taste and disgust`,
        title: `One Person's Delicacy`,
        teaser: `A prized local treat that turns a visitor's stomach.`,
        context: `Almost every culture has a food it loves that outsiders find hard to face — strong cheeses, insects, fermented fish, certain organs. Much of what feels like natural disgust is actually learned: as children, we take in what counts as food, and what counts as disgusting, from the people around us. Move the border, and the “disgusting” and the “delicious” swap places.`,
        mainQuestion: `A host proudly offers you a local delicacy that genuinely turns your stomach. Do you try it out of respect — and can you talk yourself past disgust, or not?`,
        followTheThread: [
            `Is disgust at a food something you can actually unlearn — or does it always win?`,
            `What food did you dislike as a child and grow to love, or the other way around?`
        ],
        upgrade: {
            term: `an acquired taste`,
            type: `phrase`,
            definition: `Something you only begin to like after trying it several times.`,
            ordinary: `“I hated it at first, but after a few tries I started to enjoy it.”`,
            upgraded: `“It's an acquired taste, but after a few tries I loved it.”`,
            priority: 'key',
            atlasPrompt: `What's something — a food, a kind of music, a place — that was an acquired taste for you?`
        }
    },
    {
        id: 'cl-enough-to-last-the-winter',
        contextLine: `Before refrigeration`,
        title: `Enough to Last the Winter`,
        teaser: `Waste a little now, go hungry later.`,
        context: `Before reliable refrigeration, keeping food through the winter meant salting, smoking, drying, and pickling whatever you had. A poor harvest or a spoiled store could mean real hunger months later. Throwing food away was not a small thing — every scrap might be needed before spring.`,
        mainQuestion: `If wasting food could mean going hungry later, would today's easy attitude to scraping plates into the bin look reckless — or would plenty simply become normal to you too?`,
        followTheThread: [
            `How careful are you with food waste, and what shaped that — how you grew up, cost, or something else?`,
            `Has anything ever made you suddenly see food, or waste, differently?`
        ],
        upgrade: {
            term: `go to waste`,
            type: `phrase`,
            definition: `To be wasted or thrown away instead of being used.`,
            ordinary: `“They used every part of the animal so that nothing was thrown away or wasted.”`,
            upgraded: `“They used every part of the animal so that nothing went to waste.”`,
            priority: 'key',
            atlasPrompt: `What do you hate to see go to waste — food, money, time, or something else?`
        }
    },
    {
        id: 'cl-from-one-pot',
        contextLine: `Shared-dish meals`,
        title: `From One Pot`,
        teaser: `One dish in the middle, and everyone's hands in it.`,
        context: `In many places, a meal means one large dish in the centre that everyone eats from together, often with the right hand and no separate plates. It can feel warm and equal — no one served more or less than anyone else. It can also feel strange, or too close, to someone used to a plate of their own.`,
        mainQuestion: `You sit down to a single shared dish, everyone eating from the middle with their hands. Does that feel warm and welcoming to you, or a bit too close for comfort?`,
        followTheThread: [
            `What does eating from one dish quietly assume about how close, or how equal, the people are?`,
            `Where do you draw the line between what feels shared and what feels private — at a meal, or anywhere?`
        ],
        upgrade: {
            term: `muck in`,
            type: `phrasal verb`,
            definition: `To join in and share a task or situation without fuss or special treatment.`,
            ordinary: `“There were no separate portions — you just joined in with everyone else and helped yourself.”`,
            upgraded: `“There were no separate portions — you just mucked in with everyone else.”`,
            priority: 'standard',
            atlasPrompt: `When did you have to muck in with a group and get stuck into something together?`
        }
    }
];
