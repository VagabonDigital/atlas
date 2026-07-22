/*
==========================================================================
ATLAS · COMPASS SUBJECT MODULE
SmartStudy™ Methodology
Stories & Screen
--------------------------------------------------------------------------
A premium interactive speaking subject for exploring why invented people
and events take hold of us — the grip, the verdict, the argument, and what
a story leaves behind once it is finished. Built for tutor-led conversation,
shared-screen teaching, genuine disagreement, and sharper spoken English.
Compass active subject · contentVersion 1.0.0
The subject may evolve.
The compass remains.
--------------------------------------------------------------------------
VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
==========================================================================
*/
const MODULE = {
    id: 'stories-screen',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Stories & Screen',
    titleHtml: 'Stories &amp; <em>Screen</em>',
    navTitle: 'Stories',
    bgImage: 'https://media.istockphoto.com/id/1207065646/photo/happy-audience-applauding-in-the-theater.jpg?s=612x612&w=0&k=20&c=jan59CA1SD4JMTww7ixt7xbyp4TOmp15JtqSb839kO4='
};
const subjectCopy = {
    cover: {
        hook: `It never happened, and you are still not over it.`
    },
    overview: {
        heading: `Why It Held You`,
        intro: [
            `Something invented — told, read, watched, played — can take a stronger hold on you than most of what actually happens. It can keep you up, follow you around for a week, and start an argument with somebody you agree with about everything else.`
        ],
        question: `What is the last story that got a real grip on you? And did somebody near you not see it at all?`
    },
    paths: {
        culturalLensDescription: `How stories have been told, waited for, shouted at, and rewritten by people who had no right to.`,
        discussionDescription: `What stories do to people: the ones that took hold, the ones that failed, and the arguments they start.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from the individual stories and look at what they have in common.`
    },
    culturalLens: {
        heading: `Before You Could Just Watch It`,
        intro: `Stories have not always arrived the way they arrive now. Getting hold of one could take a season, a journey, or somebody else’s permission.`
    },
    discussion: {
        heading: `What a Story Does to You`
    },
    reflection: {
        title: `Why We Keep Doing This`,
        summary: `Invented people, things that never happened, and arguments about both. Worth stopping to ask what all of it is actually for.`,
        questions: [
            `What makes a story worth arguing about at all — and which of the ones that came up today qualifies?`,
            `Some people would say all of this is time you do not get back. What would you say to them?`
        ]
    },
    keyLanguage: {
        intro: `Language for being gripped, giving a verdict, and arguing about something neither of you can change.`
    }
};
const discussionSets = [
    {
        id: 'set-it-had-you',
        title: `It Had You`,
        stage: `React`,
        icon: 'react',
        description: `Late nights, abandoned books, and reactions you did not plan on having.`,
        moments: [
            {
                id: 'moment-gave-up-on-it',
                preview: `Everyone else finished it.`,
                question: `What did you give up on that everyone around you loved — a series, a book, a much-praised film? How far did you get, and what made you stop? And if you finish everything you start, who in your life gives up fastest?`,
                upgrade: {
                    term: `get into something`,
                    type: `phrasal verb`,
                    definition: `To become interested enough in something to keep going with it.`,
                    ordinary: `“I watched two episodes and I never really started enjoying it, so I stopped.”`,
                    upgraded: `“I watched two episodes and I just couldn’t get into it, so I stopped.”`,
                    priority: 'key',
                    atlasPrompt: `What have people recommended to you — a hobby, a sport, a kind of music — that you simply could not get into?`
                }
            },
            {
                id: 'moment-later-than-you-meant',
                preview: `One more, and then one more.`,
                question: `Which story kept you up far later than you meant to stay up? A book, a series, a game, or somebody telling you something. What was happening at the point you knew you were not going to stop?`,
                upgrade: {
                    term: `hooked`,
                    type: `adjective`,
                    definition: `Unable to stop doing or following something because you enjoy it so much.`,
                    ordinary: `“By the second episode I was so interested that I could not make myself go to bed.”`,
                    upgraded: `“By the second episode I was hooked and I could not make myself go to bed.”`,
                    priority: 'key',
                    atlasPrompt: `What have you got hooked on that you did not expect to — a podcast, a game, a walk you now do every day?`
                }
            },
            {
                id: 'moment-caught-you-off-guard',
                preview: `You did not expect to mind that much.`,
                question: `An invented thing gets a much bigger reaction out of somebody than they were expecting: a scene they cannot shake off, a death they take badly, an ending that annoys them by upsetting them. Whose do you remember best — your own, or somebody else’s?`,
                upgrade: {
                    term: `catch someone off guard`,
                    type: `phrase`,
                    definition: `To surprise someone who was not prepared for it.`,
                    ordinary: `“I was not expecting a film about a dog to affect me at all, and then it completely surprised me.”`,
                    upgraded: `“A film about a dog completely caught me off guard.”`,
                    priority: 'key',
                    atlasPrompt: `What question at work or in a family conversation has caught you off guard recently?`
                }
            },
            {
                id: 'moment-not-ready-to-leave',
                preview: `The world closed and you were still in it.`,
                question: `Some stories end and you are not ready to be back in your own life. Which world did you not want to leave, and what did you do about it? Started it again, went looking for more, or just sat there? And if no world has done that to you, which one do people keep insisting would?`,
                upgrade: {
                    term: `lose yourself in something`,
                    type: `phrase`,
                    definition: `To give something your whole attention so that you forget everything else.`,
                    ordinary: `“For three days I forgot about everything else and just read.”`,
                    upgraded: `“For three days I completely lost myself in it.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you lose yourself in when you want an hour to disappear — cooking, a job, music, a walk?`
                }
            },
            {
                id: 'moment-what-ruins-it',
                preview: `Ruined in four seconds.`,
                question: `What ruins a story for you fastest: knowing the ending in advance, a character you cannot stand, the wrong person recommending it, or the thing simply being too long? And has one been ruined permanently — for you, or for somebody who still complains about it?`,
                upgrade: {
                    term: `let something slip`,
                    type: `phrasal verb`,
                    definition: `To say something by accident that you were supposed to keep quiet about.`,
                    ordinary: `“My brother accidentally told me that the main character dies, and he did not even notice he had done it.”`,
                    upgraded: `“My brother let it slip that the main character dies, and he did not even notice he had done it.”`,
                    priority: 'key',
                    atlasPrompt: `When has somebody let something slip that they were not supposed to — a surprise, a plan, somebody else’s news?`
                }
            }
        ],
        makeItReal: {
            title: `Find the exact moment`,
            prompt: `Take the story that gripped you hardest and find the exact point where it took hold. Not the plot — the moment. Then do the same for one that lost you: where did it go, and what were you doing when you stopped caring?`
        }
    },
    {
        id: 'set-the-verdict',
        title: `The Verdict`,
        stage: `Explain`,
        icon: 'explain',
        description: `Endings, punishments, and the argument you would happily have with a friend.`,
        moments: [
            {
                id: 'moment-the-wrong-ending',
                preview: `It owed you something.`,
                question: `Endings divide people more than anything else in a story. Which one — book, film, series, or something somebody once told you the end of — do you still think was wrong? Too neat, too cruel, too pleased with itself? What did it owe you that it never paid?`,
                upgrade: {
                    term: `a cop-out`,
                    type: `noun`,
                    definition: `An easy way of avoiding a difficult decision or a difficult ending.`,
                    ordinary: `“The ending avoided the one hard question the whole thing had been building towards.”`,
                    upgraded: `“The ending was a complete cop-out.”`,
                    priority: 'key',
                    atlasPrompt: `When has an answer at work or from an official body been a complete cop-out?`
                }
            },
            {
                id: 'moment-punishment-that-fit',
                preview: `More than they had earned.`,
                question: `Some characters are punished exactly as much as they should be. Others get far worse than they earned. Which case still bothers you, and would you have been merciful?`,
                upgrade: {
                    term: `have it coming`,
                    type: `idiom`,
                    definition: `To deserve the bad thing that happens to you.`,
                    ordinary: `“After everything he had done to those people, I thought he fully deserved what happened to him.”`,
                    upgraded: `“After everything he had done to those people, he had it coming.”`,
                    priority: 'standard',
                    atlasPrompt: `Is there anyone in the news or at work you have quietly thought had it coming — and did you say so out loud?`
                }
            },
            {
                id: 'moment-seeing-the-machinery',
                preview: `You can see it working and it works.`,
                question: `Sometimes you can see exactly what a story is doing to you: the music swelling, the slow walk to the door, the dog. And it works anyway. When has that happened to somebody you know, or to you? And when did noticing ruin it completely?`,
                upgrade: {
                    term: `lay it on thick`,
                    type: `idiom`,
                    definition: `To exaggerate something, especially emotion, to have a stronger effect on people.`,
                    ordinary: `“They made that goodbye scene as sad as they possibly could, and I still cried.”`,
                    upgraded: `“They laid it on thick, and I still cried.”`,
                    priority: 'standard',
                    atlasPrompt: `Who do you know who lays it on thick — about how busy they are, how ill they were, how far they had to travel?`
                }
            },
            {
                id: 'moment-where-you-stop',
                preview: `The thing you will not sit through.`,
                question: `Some people will not watch anything with a child in danger. Others stop at blood, or will not touch anything sad after a long week. Where does somebody you know stop, or where do you? Is that a limit worth having, or one you would talk somebody out of?`,
                upgrade: {
                    term: `too close to home`,
                    type: `phrase`,
                    definition: `Uncomfortably similar to your own life or situation.`,
                    ordinary: `“He cannot watch anything set in a hospital, because it reminds him far too much of his own family.”`,
                    upgraded: `“He cannot watch anything set in a hospital. It is too close to home.”`,
                    priority: 'standard',
                    atlasPrompt: `What subject is too close to home for somebody you know — a joke, a news story, a question at a family meal?`
                }
            },
            {
                id: 'moment-recommendation-that-failed',
                preview: `They came back unimpressed.`,
                question: `You press something you love on somebody and they hand it back with a shrug. Which recommendation of yours has gone worst? Did you decide the problem was them, the thing, or the way you sold it? Or have you been the unimpressed one?`,
                upgrade: {
                    term: `rave about something`,
                    type: `phrasal verb`,
                    definition: `To talk about something with a great deal of enthusiasm.`,
                    ordinary: `“I talked about that series so enthusiastically for a whole week that my sister finally watched it.”`,
                    upgraded: `“I raved about that series for a whole week until my sister finally watched it.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you raved about to somebody who then was not impressed — a restaurant, a shop, a place you had just been?`
                }
            }
        ],
        makeItReal: {
            title: `The ending you would change`,
            prompt: `Choose an ending you have never accepted. Rewrite it out loud — not better, just different. Then say honestly whether your version would have stayed with you as long as the one you did not want.`
        }
    },
    {
        id: 'set-long-after',
        title: `Long After`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `Fragments, inherited favourites, and the story you know without ever having read it.`,
        moments: [
            {
                id: 'moment-a-line-you-still-hear',
                preview: `Not the plot. The fragment.`,
                question: `Forget the plot. What is the piece of a story you can still see or hear years later — a line, an image, a room, a sound? And why that fragment rather than all the rest of it?`,
                upgrade: {
                    term: `haunt someone`,
                    type: `verb`,
                    definition: `To stay in someone’s mind for a long time in a way they cannot control.`,
                    ordinary: `“I kept thinking about that last scene for weeks afterwards and I could not get rid of it.”`,
                    upgraded: `“That last scene haunted me for weeks.”`,
                    priority: 'standard',
                    atlasPrompt: `What decision or conversation still haunts somebody you know, years later?`
                }
            },
            {
                id: 'moment-handed-to-you',
                preview: `Nobody asked whether you liked it.`,
                question: `Somebody put a story in front of you before you were old enough to choose: a parent’s favourite film, a set book at school, whatever was always on in the house. Which one did you inherit? And did whoever gave it to you ever ask whether you liked it?`,
                upgrade: {
                    term: `hand something down`,
                    type: `phrasal verb`,
                    definition: `To pass something to a younger person, usually within a family or a group.`,
                    ordinary: `“My father made sure all three of us grew up watching his favourite westerns.”`,
                    upgraded: `“My father handed his favourite westerns down to all three of us.”`,
                    priority: 'key',
                    atlasPrompt: `What has been handed down to you that you did not choose — a recipe, a tool, a name, a way of doing something?`
                }
            },
            {
                id: 'moment-went-back-to-it',
                preview: `You went back. It did not.`,
                question: `Something you loved at twelve, read or watched again as an adult. Did it survive? Be specific about what you saw the second time, or about what you now wish you had left alone.`,
                upgrade: {
                    term: `grow out of something`,
                    type: `phrasal verb`,
                    definition: `To stop liking or needing something as you get older.`,
                    ordinary: `“I stopped enjoying those books at some point, and I never really noticed when it happened.”`,
                    upgraded: `“I had grown out of those books without ever really noticing.”`,
                    priority: 'key',
                    atlasPrompt: `What have you grown out of without noticing — a food, a kind of music, a way of spending a Saturday?`
                }
            },
            {
                id: 'moment-never-read-it',
                preview: `You know the ending anyway.`,
                question: `What famous story do you know the whole of without ever having read or watched it? The ending, the twist, the line everybody quotes. Where did you actually get it from, and has that ever gone embarrassingly wrong?`,
                upgrade: {
                    term: `by reputation`,
                    type: `phrase`,
                    definition: `Known only through what other people say, not through direct experience.`,
                    ordinary: `“I have never actually read it, but I know roughly what it is about because everyone talks about it.”`,
                    upgraded: `“I have never actually read it. I only know it by reputation.”`,
                    priority: 'standard',
                    atlasPrompt: `Who or what do you know only by reputation — a restaurant, a colleague, a neighbourhood you have never been to?`
                }
            },
            {
                id: 'moment-as-if-they-existed',
                preview: `You argue about what they would do.`,
                question: `Which invented person gets discussed in your house — or in somebody else’s — as though they actually exist? Arguing about what they would do, whether they would like you. What is it about them that makes that possible?`,
                upgrade: {
                    term: `bring someone to life`,
                    type: `phrase`,
                    definition: `To describe or perform someone so well that they feel real.`,
                    ordinary: `“The writing made her feel like a real person you could have actually met.”`,
                    upgraded: `“The writing brought her completely to life.”`,
                    priority: 'standard',
                    atlasPrompt: `Who can bring a place or a person to life just by describing them?`
                }
            }
        ],
        makeItReal: {
            title: `What you would not tell them`,
            prompt: `Choose one story you would want somebody twenty years younger to encounter. Say what you would tell them about it beforehand — and what you would deliberately keep back, and why.`
        }
    }
];
const clCards = [
    {
        id: 'cl-teller-in-the-room',
        contextLine: `Storytelling before print`,
        title: `The Teller Could See Your Face`,
        teaser: `The story changed depending on who was listening.`,
        context: `For most of human history, stories were heard in company rather than read alone. A teller could see the faces in front of them and work accordingly: stretch a scene that was landing, cut one that was not, change an ending for the room. The same tale could arrive quite differently on two nights.`,
        mainQuestion: `You are halfway through telling a story and you can see it is not landing. Do you change it as you go, or finish the version you meant to tell?`,
        followTheThread: [
            `Who is the best storyteller you have actually heard, and what do they do that the rest of us do not?`,
            `Is a story that improves every time it is told still the same story?`
        ],
        upgrade: {
            term: `hold a room`,
            type: `phrase`,
            definition: `To keep a group of people listening and interested.`,
            ordinary: `“She can keep a whole table listening to her without any effort at all.”`,
            upgraded: `“She can hold a room without any effort at all.”`,
            priority: 'key',
            atlasPrompt: `Who do you know who can hold a room — at work, at a family meal, in a meeting? What do they actually do?`
        }
    },
    {
        id: 'cl-audiences-that-talked-back',
        contextLine: `Theatre audiences`,
        title: `They Used to Shout Back`,
        teaser: `Audiences ate, moved about, and told the actors what they thought.`,
        context: `Audiences have not always been quiet. In many periods people ate, walked around, called out approval or abuse, and expected a favourite passage to be performed again on the spot. Sitting still in the dark and saying nothing is a fairly recent arrangement.`,
        mainQuestion: `Somebody near you talks all the way through. Do you say something, move seats, or sit there resenting them for two hours?`,
        followTheThread: [
            `What is the silence in a cinema or a theatre actually protecting — the story, or the other people?`,
            `Is there anything you would happily shout at a screen or a stage if it were allowed?`
        ],
        upgrade: {
            term: `bite your tongue`,
            type: `idiom`,
            definition: `To stop yourself from saying something you want to say.`,
            ordinary: `“I wanted to say something to the man behind me, but I stopped myself.”`,
            upgraded: `“I wanted to say something to the man behind me, but I bit my tongue.”`,
            priority: 'key',
            atlasPrompt: `When did you last bite your tongue, and how long did it hold?`
        }
    },
    {
        id: 'cl-endings-to-order',
        contextLine: `Censors and managers`,
        title: `Endings to Order`,
        teaser: `The tragic ending emptied the house, so somebody changed it.`,
        context: `Endings have often been altered by people who did not write them. Censors have required that wrongdoing be shown as punished. Theatre managers have replaced tragic endings with happy ones because audiences preferred them. Well-known plays have run for long stretches in rewritten versions, and the original has sometimes returned much later.`,
        mainQuestion: `You run a theatre. The tragic ending empties the house; the happy one fills it. Which do you stage?`,
        followTheThread: [
            `Does a writer still own a story once the public has taken to it?`,
            `Who should get the last word on how a story ends — whoever wrote it, whoever paid for it, or whoever is watching?`
        ],
        upgrade: {
            term: `sell out`,
            type: `phrasal verb`,
            definition: `To give up what you believed in for money or popularity.`,
            ordinary: `“They gave it a happy ending because that was what would make the most money.”`,
            upgraded: `“They sold out and gave it a happy ending.”`,
            priority: 'standard',
            atlasPrompt: `When have you heard somebody accused of selling out — a musician, a shop that changed, a friend who switched sides in an argument?`
        }
    },
    {
        id: 'cl-the-week-between',
        contextLine: `Serialised fiction`,
        title: `The Week in Between`,
        teaser: `Everyone was waiting, and nobody knew what came next.`,
        context: `Novels have often reached readers a piece at a time, in magazines, newspapers or cheap parts, with weeks between them. People argued about what would happen next before it existed. Writers could hear the reaction while the story was still being written, and some plots are said to have shifted because of it.`,
        mainQuestion: `Would you rather wait a week between episodes, with everybody else waiting too — or have the whole thing at once, alone?`,
        followTheThread: [
            `What is actually lost when nobody has to wait for anything?`,
            `Have you ever slowed something down on purpose to make it last?`
        ],
        upgrade: {
            term: `a cliffhanger`,
            type: `noun`,
            definition: `An ending that stops at an exciting moment so you have to come back.`,
            ordinary: `“Every episode stopped at the worst possible moment, so you had no choice but to come back.”`,
            upgraded: `“Every episode ended on a cliffhanger, so you had no choice but to come back.”`,
            priority: 'standard',
            atlasPrompt: `When has real life stopped on a cliffhanger — a result you had to wait for, a conversation that got interrupted?`
        }
    },
    {
        id: 'cl-letters-to-a-character',
        contextLine: `Readers and characters`,
        title: `Letters to Somebody Who Never Existed`,
        teaser: `The actor who played the villain got shouted at in the street.`,
        context: `Readers and audiences have long treated invented people as though they were real: writing to them, sending them advice, mourning a character’s death in the newspapers, shouting at the performer who played the villain. Writers have received letters addressed to their characters, and requests to spare them.`,
        mainQuestion: `A stranger stops an actor in the street and blames them for what their character did. Is that a compliment to the performance, or has something gone wrong?`,
        followTheThread: [
            `Have you ever disliked a real person because of a part they played?`,
            `What would it take for you to write to a writer and ask them to spare somebody?`
        ],
        upgrade: {
            term: `take something personally`,
            type: `phrase`,
            definition: `To treat something as an attack on you when it was not meant that way.`,
            ordinary: `“He got angry about it as though the whole comment had been aimed directly at him.”`,
            upgraded: `“He took the whole thing completely personally.”`,
            priority: 'key',
            atlasPrompt: `What kind of comment do people take personally at work even when it was not meant that way?`
        }
    },
    {
        id: 'cl-tales-for-children',
        contextLine: `Tales told to children`,
        title: `Do That Again and See What Happens`,
        teaser: `The creature is waiting for children who do not do as they are told.`,
        context: `Stories told to children have often been built to frighten them into behaving: the child who wanders off, the one who will not stop asking questions, the creature waiting for anyone who disobeys. The same shape turns up in very distant places, and the endings do not match. One version punishes, another forgives, another simply stops.`,
        mainQuestion: `Two versions reach you. In one, the child who disobeys is punished. In the other, nothing happens to them at all. Which would you pass on, and which would you have preferred to be told?`,
        followTheThread: [
            `What were you warned about as a child through a story rather than a rule?`,
            `Which story from your own childhood would sound alarming if you told it to a child today?`
        ],
        upgrade: {
            term: `a cautionary tale`,
            type: `phrase`,
            definition: `A story told as a warning about what could happen to you.`,
            ordinary: `“It was one of those stories told to children to warn them away from doing something.”`,
            upgraded: `“It was a cautionary tale.”`,
            priority: 'standard',
            atlasPrompt: `Whose career, purchase, or holiday has become a cautionary tale among the people who know them?`
        }
    },
    {
        id: 'cl-one-screen-in-town',
        contextLine: `Getting hold of a story`,
        title: `One Screen, One Town`,
        teaser: `The players arrived, performed, and left again.`,
        context: `For most of history a story had to be travelled to, borrowed, or waited for. A company of players arrived in a town and moved on. A book was passed around a household and read aloud to people who could not read it themselves. A single screen could serve a whole district. What you encountered depended a great deal on where you were standing.`,
        mainQuestion: `Everything you might want to watch or read is now available immediately. Has anything actually been lost, or is that just nostalgia for queuing?`,
        followTheThread: [
            `What was the last thing you had to make a real effort to get hold of, and did the effort change how you felt about it?`,
            `Is there anything you deliberately ration so that it does not run out?`
        ],
        upgrade: {
            term: `spoilt for choice`,
            type: `phrase`,
            definition: `Having so many options that choosing becomes difficult.`,
            ordinary: `“There is so much available that I spend twenty minutes choosing and then watch nothing at all.”`,
            upgraded: `“I am so spoilt for choice that I spend twenty minutes choosing and then watch nothing at all.”`,
            priority: 'standard',
            atlasPrompt: `Where are you so spoilt for choice that deciding has actually got harder — food, clothes, places to go?`
        }
    },
    {
        id: 'cl-the-ones-that-vanished',
        contextLine: `Lost works`,
        title: `The Ones That Did Not Survive`,
        teaser: `Known only by its title, and by what somebody else said about it.`,
        context: `A great deal of storytelling has not survived. Some plays are known only by their title, or by what another writer said about them. Many films from the earliest decades exist as fragments or not at all. Writers have died leaving a story unfinished. Occasionally a copy turns up somewhere nobody thought to look.`,
        mainQuestion: `A series you loved will never be finished. Would you want somebody else to complete it, or is an unfinished story better left alone?`,
        followTheThread: [
            `Does knowing how something ends matter more than the ending being any good?`,
            `Would you read a summary of an ending you will never see, or would you rather not know?`
        ],
        upgrade: {
            term: `tie up loose ends`,
            type: `phrase`,
            definition: `To deal with the small remaining details that have not been settled.`,
            ordinary: `“The series finished without ever explaining several things it had set up.”`,
            upgraded: `“The series finished without tying up any of the loose ends.”`,
            priority: 'key',
            atlasPrompt: `What loose ends have you been putting off tying up — at work, at home, or with somebody you have been meaning to contact?`
        }
    }
];
