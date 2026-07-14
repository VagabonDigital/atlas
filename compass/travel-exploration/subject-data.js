/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Travel & Exploration
  --------------------------------------------------------------------------
  A premium interactive speaking subject for exploring the people, choices,
  habits, tensions, surprises, and cultural assumptions that shape travel.

  Built for tutor-led conversation, shared-screen teaching, thoughtful
  disagreement, cultural reflection, and sharper spoken English.

  Compass v3 provisional implementation subject.
  Editorially frozen for the build phase.
  Copy should change only when rendering or live testing exposes a concrete
  failure.

  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'travel-exploration',
    schemaVersion: 2,
    contentVersion: '3.3.0',
    title: 'Travel & Exploration',
    titleHtml: 'Travel &amp; <em>Exploration</em>',
    navTitle: 'Travel',
    bgImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2lmdQM4psQaMkjfD9_oEcSyYotoHZLhcmLe6VSYRNsJIeMKss3ol57bH5E-UAKrYdF9zBzC2bqaxJYJj-8-IDp4umNP-PevoJpHPpH9lrIBisztiwq56af7NseoacPMmH3E3D1tG4olo/s2048/pexels-photo-3935702.jpeg'
};

const subjectCopy = {
    cover: {
        hook: `The place is only part of it.`
    },

    overview: {
        heading: `Travel Up Close`,
        intro: [
            `Two people can take the same trip and experience it completely differently. The place may be the same, but the people, choices, timing, and unexpected moments are not. What decides how a trip turns out for you: where you go, who you go with, or what happens once you’re there?`
        ]
    },

    paths: {
        culturalLensDescription: `Explore the customs, rules, and ideas that have shaped how people move through the world.`,
        discussionDescription: `Trips, habits, choices, and opinions — from small everyday details to strong disagreements.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to connect ideas from different parts of the subject.`
    },

    culturalLens: {
        heading: `Other Places, Other Centuries`,
        intro: `Travel has never worked the same way everywhere. Step into another place or century, where a journey could feel stranger, freer, riskier, or more demanding than anything familiar today.`
    },

    discussion: {
        heading: `Travel as It Happens`
    },

    reflection: {
        title: `What Stays With You?`,
        summary: `Pause on the conversation before you leave it. Notice what surprised you, shifted your thinking, or connected with your own experience.`,
        questions: [
            `Which idea from the conversation stayed with you most?`,
            `What do you think makes a journey feel meaningful?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for telling what happened, reacting to it, and saying where you stand.`
    }
};

const discussionSets = [
    {
        id: 'set-honest-bit',
        title: `The Honest Bit`,
        stage: `React`,
        icon: 'react',
        description: `The mess, the wanting, and the small things you only notice once you’re away.`,

        moments: [
            {
                id: 'moment-worst-place-slept',
                preview: `A bed you still complain about.`,
                question: `What’s the worst place you’ve ever ended up sleeping away from home — the grim hostel bunk, a night on an airport floor, a sofa that wrecked your back? Set the scene: what made it so bad?`,

                upgrade: {
                    term: `grotty`,
                    type: `adjective`,
                    definition: `Dirty, shabby, and unpleasant.`,
                    ordinary: `“The room was so dirty and unpleasant that I slept in my clothes on top of the covers.”`,
                    upgraded: `“The room was so grotty I slept in my clothes on top of the covers.”`,
                    priority: 'standard',
                    atlasPrompt: `Think of a café, flat, office, or changing room that looked grotty. What made it feel that way?`
                }
            },
            {
                id: 'moment-ordinary-thing-made-no-sense',
                preview: `Everyone else understood it.`,
                question: `What ordinary thing took you longer than expected to understand while you were away — a ticket machine, public transport, a door or shower, ordering food, paying, or following a local rule? What finally made sense?`,

                upgrade: {
                    term: `work something out`,
                    type: `phrasal verb`,
                    definition: `To figure out how something functions or what is happening.`,
                    ordinary: `“It took me a full minute to understand that you paid the driver at the back, not the front.”`,
                    upgraded: `“It took me a full minute to work out that you paid the driver at the back, not the front.”`,
                    priority: 'key',
                    atlasPrompt: `Think of a device, rule, or process that took you a while to work out. What finally made sense?`
                }
            },
            {
                id: 'moment-photo-made-it-look-better',
                preview: `What the perfect photo left out.`,
                question: `Have you ever taken — or helped stage — a travel photo that made the moment look much better than it really was? What did the picture hide?`,

                upgrade: {
                    term: `get the shot`,
                    type: `phrase`,
                    definition: `To capture the exact photograph or video someone wants.`,
                    ordinary: `“She turned one sunset photo into a twenty-minute production and had everyone moving bags and waiting while she tried to take exactly the photo she wanted.”`,
                    upgraded: `“She turned one sunset photo into a twenty-minute production and had everyone moving bags and waiting while she tried to get the shot.”`,
                    priority: 'standard',
                    atlasPrompt: `Think of a photo that people spent far too long trying to get. What was happening behind the picture?`
                }
            },
            {
                id: 'moment-have-it-again',
                preview: `One taste worth going back for.`,
                question: `What’s something you ate or drank away from home that you would love to have again exactly as it was? What made it so good?`,

                upgrade: {
                    term: `speciality`,
                    type: `noun`,
                    definition: `A food, drink, or product that a particular place is known for.`,
                    ordinary: `“That restaurant was known for its spicy noodle soup, and people queued for it.”`,
                    upgraded: `“That restaurant’s speciality was a spicy noodle soup, and people queued for it.”`,
                    priority: 'standard',
                    atlasPrompt: `Think of a shop, café, or restaurant near you that’s known for one particular thing. What’s its speciality, and is it actually the best thing on the menu?`
                }
            },
            {
                id: 'moment-took-on-too-much',
                preview: `You said yes too quickly.`,
                question: `Have you ever said yes to something on a trip — a difficult hike, unfamiliar food, an activity, a long journey, or a night out — and then realised it was more than you could handle? What made you agree, or have you seen it happen to someone else?`,

                upgrade: {
                    term: `out of your depth`,
                    type: `idiom`,
                    definition: `In a situation you do not have the knowledge or skills to handle comfortably.`,
                    ordinary: `“I thought I could manage the hike, but after an hour I realised I couldn’t handle it, so I turned back.”`,
                    upgraded: `“I thought I could manage the hike, but after an hour I realised I was completely out of my depth, so I turned back.”`,
                    priority: 'key',
                    atlasPrompt: `When have you felt out of your depth at work or while learning something new? What made it difficult?`
                }
            }
        ],

        makeItReal: {
            title: `The version you usually leave out`,
            prompt: `Choose one trip story you normally tell quickly. Tell it again with one small detail you usually leave out — a sound, smell, delay, awkward moment, minor problem, or something happening in the background.`
        }
    },

    {
        id: 'set-what-kind-of-traveller',
        title: `What Kind of Traveller Are You?`,
        stage: `Explain`,
        icon: 'explain',
        description: `The types you defend, the habits you would never change, and the choices travellers quietly judge one another for.`,

        moments: [
            {
                id: 'moment-traveller-or-tourist',
                preview: `Two labels, one quiet hierarchy.`,
                question: `Some people call themselves “travellers” rather than “tourists.” What, if anything, is the real difference — and why do people care so much about the label?`,

                upgrade: {
                    term: `look down on`,
                    type: `phrasal verb`,
                    definition: `To believe that you are better than someone else.`,
                    ordinary: `“He thinks he is better than people who take package holidays, but he’s just on a slightly posher version of one.”`,
                    upgraded: `“He looks down on package holidays, but he’s just on a slightly posher version of one.”`,
                    priority: 'standard',
                    atlasPrompt: `What hobby, job, or taste do people unfairly look down on?`
                }
            },
            {
                id: 'moment-planner-or-spontaneous',
                preview: `Every hour planned—or none of it.`,
                question: `Some people plan every hour before they leave; others arrive with a bag and almost no plan. Which are you — and what habit in the other type drives you mad?`,

                upgrade: {
                    term: `play it by ear`,
                    type: `idiom`,
                    definition: `To decide what to do as events happen rather than planning everything beforehand.`,
                    ordinary: `“We didn’t book anything after the first night. We decided what to do as we went along.”`,
                    upgraded: `“We didn’t book anything after the first night. We just played it by ear.”`,
                    priority: 'key',
                    atlasPrompt: `When is it better to play something by ear rather than make a detailed plan?`
                }
            },
            {
                id: 'moment-seller-accepted-the-price',
                preview: `The price was accepted too quickly.`,
                question: `You’re bargaining in a market, and the seller accepts your price immediately. Do you feel pleased, embarrassed, or suspicious that you pushed too far? Where would you draw the line?`,

                upgrade: {
                    term: `haggle`,
                    type: `verb`,
                    definition: `To argue about a price until the buyer and seller reach an agreement.`,
                    ordinary: `“We argued about the price for ten minutes before agreeing.”`,
                    upgraded: `“We haggled for ten minutes before agreeing on a price.”`,
                    priority: 'standard',
                    atlasPrompt: `Would you ever haggle over a second-hand item or a service? What would make you try?`
                }
            },
            {
                id: 'moment-visitor-would-photograph',
                preview: `Ordinary to you, fascinating to them.`,
                question: `What completely ordinary thing where you live would a visitor probably stop to photograph — and what do local people fail to notice about it?`,

                upgrade: {
                    term: `take something for granted`,
                    type: `phrase`,
                    definition: `To stop noticing or valuing something because it is always available.`,
                    ordinary: `“I hardly notice the sea view anymore, but friends from the city cannot stop looking at it.”`,
                    upgraded: `“I take the sea view for granted, but friends from the city cannot stop looking at it.”`,
                    priority: 'key',
                    atlasPrompt: `What convenience in your daily life do you take for granted until it stops working?`
                }
            },
            {
                id: 'moment-brings-out-the-worst',
                preview: `The trigger that changes your personality.`,
                question: `Every traveller has one thing that brings out the worst in them — delays, hunger, getting lost, bad rooms, or someone else moving too slowly. What is yours, and what are you like when it happens?`,

                upgrade: {
                    term: `lose your cool`,
                    type: `phrase`,
                    definition: `To stop staying calm and become angry, impatient, or upset.`,
                    ordinary: `“I’m normally patient, but after three hours at the airport I became really angry.”`,
                    upgraded: `“I’m normally patient, but after three hours at the airport I completely lost my cool.”`,
                    priority: 'standard',
                    atlasPrompt: `What small situation is most likely to make you lose your cool?`
                }
            }
        ],

        makeItReal: {
            title: `The rule you travel by`,
            prompt: `What’s one travel rule you learned the hard way? What happened?`
        }
    },

    {
        id: 'set-what-the-going-leaves',
        title: `What the Going Leaves`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The people you remember, the stories that improve with time, and what feels different when you come home.`,

        moments: [
            {
                id: 'moment-travel-companion',
                preview: `Wonderful company—or a day-three nightmare.`,
                question: `Some people are wonderful to travel with, and others become a quiet nightmare by day three. Who was the best — or the worst — and what did they do?`,

                upgrade: {
                    term: `get on someone’s nerves`,
                    type: `idiom`,
                    definition: `To annoy someone, especially repeatedly or over time.`,
                    ordinary: `“By the end of the trip, every little thing he did was annoying me.”`,
                    upgraded: `“By the end of the trip, every little thing he did was getting on my nerves.”`,
                    priority: 'standard',
                    atlasPrompt: `What harmless habit can quickly get on your nerves when somebody repeats it?`
                }
            },
            {
                id: 'moment-unexpected-help',
                preview: `A stranger who did more than expected.`,
                question: `Has a stranger ever made a special effort to help you when you were away from home — or have you done that for someone else? What happened?`,

                upgrade: {
                    term: `go out of your way`,
                    type: `phrasal verb`,
                    definition: `To make a special effort beyond what is normally expected.`,
                    ordinary: `“A woman made a special effort to walk us all the way to the station.”`,
                    upgraded: `“A woman went out of her way to walk us all the way to the station.”`,
                    priority: 'key',
                    atlasPrompt: `When has somebody gone out of their way to help you at work or in daily life?`
                }
            },
            {
                id: 'moment-disliked-now-love-telling',
                preview: `A bad trip that improved with time.`,
                question: `Is there a trip or day out that you disliked at the time but now love telling people about? What changed — the memory, the story, or you?`,

                upgrade: {
                    term: `with hindsight`,
                    type: `spoken phrase`,
                    definition: `Looking back later, with knowledge of how events developed.`,
                    ordinary: `“Looking back, it was a great trip, but at the time I just wanted to go home.”`,
                    upgraded: `“With hindsight, it was a great trip, but at the time I just wanted to go home.”`,
                    priority: 'key',
                    atlasPrompt: `With hindsight, what decision would you handle differently now?`
                }
            },
            {
                id: 'moment-miss-and-relieved-to-leave',
                preview: `What you miss—and what you don’t.`,
                question: `When a trip ends, what do you miss first — and what are you relieved to leave behind?`,

                upgrade: {
                    term: `have had enough of something`,
                    type: `phrase`,
                    definition: `To feel that you no longer want to deal with or experience something.`,
                    ordinary: `“By the end of the week, I didn’t want to deal with the noise and the crowds anymore.”`,
                    upgraded: `“By the end of the week, I’d had enough of the noise and the crowds.”`,
                    priority: 'standard',
                    atlasPrompt: `What situation have you recently had enough of, and what would need to change?`
                }
            },
            {
                id: 'moment-travel-spoiled-home',
                preview: `When home stops measuring up.`,
                question: `Sometimes a trip ruins something back home for you — the coffee, the bread, public transport, beaches, or customer service. What has travel spoiled for you, and do people around you think you’re being a bit of a snob about it?`,

                upgrade: {
                    term: `not live up to something`,
                    type: `phrase`,
                    definition: `To be less good than expected, or less good than something you are comparing it with.`,
                    ordinary: `“Coffee at home has never been as good as what we had in Italy.”`,
                    upgraded: `“Coffee at home has never quite lived up to what we had in Italy.”`,
                    priority: 'standard',
                    atlasPrompt: `Think of a product, film, or event that did not live up to expectations. What disappointed you?`
                }
            }
        ],

        makeItReal: {
            title: `The postcard you didn’t send`,
            prompt: `Choose one trip you now remember fondly. What would you have written on the postcard at the time — and what honest sentence would you have left off?`
        }
    }
];

const clCards = [
    {
        id: 'cl-different-clock',
        contextLine: `Slow-clock places`,
        title: `We’ll Get There When We Get There`,
        teaser: `The bus leaves when full, and “ten minutes” may mean an hour.`,

        context: `Often, the first real surprise abroad is not the language or food but the pace. You arrive expecting timetables and quick service. Then the bus leaves only when it is full, the shops close for a long afternoon, and “ten minutes” turns out to mean nearer an hour.`,

        mainQuestion: `Have you ever arrived somewhere that ran much slower — or much faster — than home? Did it relax you or slowly drive you up the wall?`,

        followTheThread: [
            `Could you happily live in a place with a completely different relationship to time?`,
            `Have you ever judged someone as rude or lazy when they were simply following a different rhythm?`
        ],

        upgrade: {
            term: `laid-back`,
            type: `adjective`,
            definition: `Relaxed, informal, and not worried about rushing or strict timing.`,
            ordinary: `“Everyone was so relaxed that arriving ten minutes late meant nothing.”`,
            upgraded: `“Everyone was so laid-back that arriving ten minutes late meant nothing.”`,
            priority: 'key',
            atlasPrompt: `Who is the most laid-back person you know, and when does their attitude help—or frustrate—other people?`
        }
    },

    {
        id: 'cl-rude-without-knowing-it',
        contextLine: `Everyday manners`,
        title: `Rude Without Knowing It`,
        teaser: `A polite gesture at home may offend somewhere else.`,

        context: `The same small gesture can feel warm in one place and offensive in another — a thumbs-up, showing the sole of your shoe, eating with the wrong hand, or keeping your shoes on indoors. A visitor may repeat it for days without realising.`,

        mainQuestion: `A visitor where you live keeps getting one of these things wrong. Would you tell them? How?`,

        followTheThread: [
            `Is it the visitor’s responsibility to learn local manners, or the host’s responsibility to forgive an honest mistake?`,
            `What piece of politeness where you live do newcomers often misunderstand?`
        ],

        upgrade: {
            term: `misread the situation`,
            type: `phrase`,
            definition: `To understand a social situation incorrectly and respond in the wrong way.`,
            ordinary: `“I completely misunderstood what was expected and kept my shoes on while everyone else took theirs off.”`,
            upgraded: `“I completely misread the situation and kept my shoes on while everyone else took theirs off.”`,
            priority: 'key',
            atlasPrompt: `Think of a meeting, conversation, or social event where someone misread the situation. What signal did they miss?`
        }
    },

    {
        id: 'cl-mandatory-souvenir',
        contextLine: `Japan`,
        title: `The Mandatory Souvenir`,
        teaser: `The holiday ends with one last duty: gifts for everyone back home.`,

        context: `In Japan, travellers commonly bring back omiyage — often regional sweets or snacks — for family, friends, and coworkers. Station and airport shops sell carefully packed boxes designed to be shared piece by piece. The gift is not simply a private reminder of the trip; it also acknowledges the people who stayed behind.`,

        mainQuestion: `Would choosing omiyage for your coworkers feel generous to you — or like one more job waiting at the end of the holiday?`,

        followTheThread: [
            `Does a gift lose some of its meaning when people expect it?`,
            `What custom where you live appears voluntary but carries strong social pressure?`
        ],

        upgrade: {
            term: `empty-handed`,
            type: `adjective`,
            definition: `Without bringing a gift or contribution when one may be expected.`,
            ordinary: `“I felt awkward arriving back at the office without bringing anything.”`,
            upgraded: `“I felt awkward arriving back at the office empty-handed.”`,
            priority: 'standard',
            atlasPrompt: `When would you feel uncomfortable arriving empty-handed—to a dinner, celebration, visit, or meeting?`
        }
    },

    {
        id: 'cl-no-room-of-your-own',
        contextLine: `Colonial North America`,
        title: `No Room of Your Own`,
        teaser: `The only bed left already has a stranger in it.`,

        context: `Travellers staying at busy inns often shared bedrooms and sometimes beds with strangers. Privacy might not be available, and objecting could make someone seem unusually fussy. A long journey could therefore end beside a snoring, drunken, blanket-stealing bedmate whom you had never met before.`,

        mainQuestion: `The only bed left already has a stranger in it. Would you share it or sleep alone on the floor?`,

        followTheThread: [
            `Which kinds of privacy now feel like basic needs but might once have been treated as luxuries?`,
            `If everyone around you treated bed-sharing as normal, do you think you would eventually adapt?`
        ],

        upgrade: {
            term: `fussy`,
            type: `adjective`,
            definition: `Difficult to please or unusually concerned about small details.`,
            ordinary: `“People thought he was being difficult because he refused to share the room.”`,
            upgraded: `“People thought he was being fussy because he refused to share the room.”`,
            priority: 'standard',
            atlasPrompt: `What is one thing you are genuinely fussy about, even when other people think it does not matter?`
        }
    },

    {
        id: 'cl-speed-of-madness',
        contextLine: `Britain · Early railways`,
        title: `The Speed of Madness`,
        teaser: `Early trains seemed faster than the body could safely bear.`,

        context: `Before passenger railways, most people had never travelled over land much faster than a horse. Early locomotives suddenly carried crowds at unprecedented speeds, producing fascination as well as fear. The noise, vibration, speed, and possibility of catastrophe made the new machine feel thrilling and physically unnatural at the same time.`,

        mainQuestion: `Would you have trusted the first fast trains? Why or why not?`,

        followTheThread: [
            `What might have persuaded you to get on despite the fear?`,
            `Do driverless cars or space tourism create the same mix of excitement and fear?`
        ],

        upgrade: {
            term: `put someone off`,
            type: `phrasal verb`,
            definition: `To make someone less interested in doing something or discourage them from trying it.`,
            ordinary: `“The warnings were enough to discourage some passengers from travelling by train.”`,
            upgraded: `“The warnings were enough to put some passengers off travelling by train.”`,
            priority: 'key',
            atlasPrompt: `What has put you off trying something before you gave it a chance?`
        }
    },

    {
        id: 'cl-crossing-the-line',
        contextLine: `Equator crossing`,
        title: `Crossing the Line`,
        teaser: `A mock court, a soaking, and then the newcomer belongs.`,

        context: `For centuries, sailors crossing the Equator for the first time have taken part in a ceremony known as “Crossing the Line.” Newcomers may be brought before a mock court ruled by King Neptune, dressed up, soaked with water, and declared accepted by the crew. The details vary, but the newcomer is always made the centre of attention.`,

        mainQuestion: `When does a ridiculous initiation make someone feel part of the group — and when is “tradition” just an excuse to embarrass the newcomer?`,

        followTheThread: [
            `What makes public embarrassment funny rather than cruel?`,
            `Why do journeys and closed groups create rituals people would never accept in ordinary life?`
        ],

        upgrade: {
            term: `be a good sport`,
            type: `phrase`,
            definition: `To accept teasing, embarrassment, or an inconvenience without becoming angry or complaining.`,
            ordinary: `“They expected every newcomer to accept the joke without complaining and take part in the ceremony.”`,
            upgraded: `“They expected every newcomer to be a good sport and take part in the ceremony.”`,
            priority: 'key',
            atlasPrompt: `When is it reasonable to expect someone to be a good sport, and when does that phrase become pressure?`
        }
    },

    {
        id: 'cl-put-on-for-the-tourists',
        contextLine: `Global tourism`,
        title: `Put On for the Tourists`,
        teaser: `The welcome dance runs again for every arriving coach.`,

        context: `A welcome dance may run three times a day, once for each arriving coach. A market may sell the same “local” souvenirs as one two countries over. A village may slowly reshape itself around the photograph visitors arrive expecting to take.`,

        mainQuestion: `Would the welcome dance still feel special if it happened for every arriving coach? Why or why not?`,

        followTheThread: [
            `Can something be staged and still feel genuine?`,
            `When does adapting a tradition for visitors start changing the tradition itself?`
        ],

        upgrade: {
            term: `touristy`,
            type: `adjective`,
            definition: `Full of tourists and businesses or experiences designed mainly for them, often in a way that feels artificial.`,
            ordinary: `“The old town was lovely, but the main square felt artificial and designed mainly for visitors, so we did not stay long.”`,
            upgraded: `“The old town was lovely, but the main square was so touristy that we did not stay long.”`,
            priority: 'standard',
            atlasPrompt: `Think of a popular area that has become too touristy. What still feels genuine there, if anything?`
        }
    },

    {
        id: 'cl-does-going-really-change-you',
        contextLine: `Travel as education`,
        title: `Does Going Really Change You?`,
        teaser: `Travel has long been treated as a form of education.`,

        context: `There is an old belief that travel improves people — that going out into the world teaches what cannot be learned at home. Wealthy young Europeans once took long continental tours to acquire culture and polish. Modern versions include gap years, backpacking trips, and the idea that young people ought to “see the world.”`,

        mainQuestion: `Do you believe travel changes people for the better — or is that partly a flattering story told by those who can afford to go?`,

        followTheThread: [
            `Do you know anyone wise and worldly who has hardly travelled at all?`,
            `If a young person had a free year, would you advise them to travel, work, or study?`
        ],

        upgrade: {
            term: `broaden your horizons`,
            type: `phrase`,
            definition: `To increase your experience and understanding by encountering unfamiliar people or ideas.`,
            ordinary: `“Travel can increase your experience and understanding, but it does not automatically make you open-minded.”`,
            upgraded: `“Travel can broaden your horizons, but it does not automatically make you open-minded.”`,
            priority: 'standard',
            atlasPrompt: `What experience other than travel has broadened your horizons—a job, friendship, book, class, or major change?`
        }
    },

    {
        id: 'cl-you-may-cross-my-land',
        contextLine: `Sweden`,
        title: `You May Cross My Land`,
        teaser: `You may cross private land, provided you leave no trace.`,

        context: `In Sweden, people can walk, pick berries and mushrooms, and camp briefly across much of the countryside, including some privately owned land. The freedom depends on restraint: stay away from homes and crops, avoid damage, and leave no disturbance behind. Access is treated as a shared right tied to shared responsibility.`,

        mainQuestion: `Should responsible people be free to cross and camp on privately owned countryside without asking — or should ownership always include the right to keep others out?`,

        followTheThread: [
            `What would make you trust strangers with that freedom?`,
            `Would a system like this work where you live, or would people abuse it?`
        ],

        upgrade: {
            term: `roam`,
            type: `verb`,
            definition: `To move freely around a wide area without following one fixed route.`,
            ordinary: `“People are free to move around much of the countryside without following one fixed route.”`,
            upgraded: `“People are free to roam across much of the countryside.”`,
            priority: 'standard',
            atlasPrompt: `Where would you most enjoy being free to roam without a route, schedule, or particular destination?`
        }
    }
];
