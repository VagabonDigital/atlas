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
Compass active subject · contentVersion 1.1.0
The subject may evolve.
The compass remains.
--------------------------------------------------------------------------
VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
==========================================================================
*/
const MODULE = {
    id: 'stories-screen',
    schemaVersion: 2,
    contentVersion: '1.1.0',
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
        heading: `Why It Stays`,
        intro: [
            `A story can pull you in, divide a room, or stay with you long after it ends. Sometimes one character, choice, image, or ending matters more than the whole plot.`
        ],
        question: `What story has stayed with you recently — and was it a character, a choice, an ending, or one small moment that made it matter?`
    },

    paths: {
        culturalLensDescription: `Explore how people have told, changed, shared, and waited for stories across different places and times.`,
        discussionDescription: `Stories that gripped you, endings you would change, and the characters or fragments that stayed.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to connect what pulled you in, what you judged, and what remained afterwards.`
    },

    culturalLens: {
        heading: `Before You Could Just Watch It`,
        intro: `Stories have not always arrived quietly, privately, or all at once. Step into other places and times, where audiences shouted back, endings changed, and people waited weeks for the next part.`
    },

    discussion: {
        heading: `What Stories Do to Us`
    },

    reflection: {
        title: `After the Ending`,
        summary: `Look back at the stories, characters, and choices that returned during the conversation — and what made them matter.`,
        questions: [
            `Which story, scene, or character became most vivid again during the conversation?`,
            `What makes an invented story matter long after you know it is not real?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing what grips you, giving your verdict, and explaining why a story stayed.`
    }
};

const discussionSets = [
    {
        id: 'set-it-had-you',
        title: `It Had You`,
        stage: `React`,
        icon: 'react',
        description: `Late nights, abandoned stories, and reactions you did not expect to have.`,

        moments: [
            {
                id: 'moment-gave-up-on-it',
                preview: `Everyone else finished it.`,
                question: `What story did everybody around you love but you gave up on — a series, film, book, game, or podcast? How far did you get, and what finally made you stop?`,

                upgrade: {
                    term: `get into something`,
                    type: `phrasal verb`,
                    definition: `To become interested enough in something to keep following or doing it.`,
                    ordinary: `“I watched two episodes, but I never became interested enough to continue.”`,
                    upgraded: `“I watched two episodes, but I just could not get into it.”`,
                    priority: 'key',
                    atlasPrompt: `What hobby, sport, or kind of music have other people recommended that you could not get into?`
                }
            },
            {
                id: 'moment-later-than-you-meant',
                preview: `One more, and then one more.`,
                question: `Which story kept you awake much later than you planned — a book, series, game, podcast, or somebody telling you something? What was happening when you realised you were not going to stop?`,

                upgrade: {
                    term: `hooked`,
                    type: `adjective`,
                    definition: `So interested in something that you find it difficult to stop.`,
                    ordinary: `“By the second episode, I was so interested that I could not make myself go to bed.”`,
                    upgraded: `“By the second episode, I was hooked and could not make myself go to bed.”`,
                    priority: 'key',
                    atlasPrompt: `What have you become hooked on unexpectedly — a podcast, a game, a routine, or an activity?`
                }
            },
            {
                id: 'moment-caught-you-off-guard',
                preview: `You did not expect to care that much.`,
                question: `What scene, character, or ending affected you much more than you expected? What surprised you most about your reaction — how strong it was, or how long it lasted?`,

                upgrade: {
                    term: `catch someone off guard`,
                    type: `phrase`,
                    definition: `To surprise someone when they are not prepared for what happens.`,
                    ordinary: `“I expected the film to be light, so its final scene completely surprised me.”`,
                    upgraded: `“I expected the film to be light, so its final scene completely caught me off guard.”`,
                    priority: 'key',
                    atlasPrompt: `What question, comment, or piece of news has caught you off guard recently?`
                }
            },
            {
                id: 'moment-not-ready-to-leave',
                preview: `The story ended. You were still inside it.`,
                question: `Which story world were you not ready to leave when it ended? What did you do afterwards — start it again, search for more, talk about it, or simply sit with it for a while?`,

                upgrade: {
                    term: `lose yourself in something`,
                    type: `phrase`,
                    definition: `To give something your complete attention and temporarily forget everything else.`,
                    ordinary: `“For three days, I forgot about everything else and simply read.”`,
                    upgraded: `“For three days, I completely lost myself in the story.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you lose yourself in when you want an hour to disappear?`
                }
            },
            {
                id: 'moment-what-ruins-it',
                preview: `Ruined in four seconds.`,
                question: `What ruins a story fastest for you — learning the ending, an unbearable character, too much hype, or something that goes on too long? Which story was genuinely spoiled for you, and how?`,

                upgrade: {
                    term: `put someone off`,
                    type: `phrasal verb`,
                    definition: `To make someone lose interest in or enthusiasm for something.`,
                    ordinary: `“The endless violence made me lose interest in the series.”`,
                    upgraded: `“The endless violence put me off the series.”`,
                    priority: 'key',
                    atlasPrompt: `What quickly puts you off a book, restaurant, product, place, or person?`
                }
            }
        ],

        makeItReal: {
            title: `The Thirty-Second Hook`,
            prompt: `Choose a story you love and make your tutor want to begin it. You have thirty seconds and may describe the opening, the mood, or one character — but not the ending. Your tutor then says what caught their interest.`
        }
    },

    {
        id: 'set-the-verdict',
        title: `The Verdict`,
        stage: `Explain`,
        icon: 'explain',
        description: `Endings you reject, punishments you would change, and tricks that work even when you can see them.`,

        moments: [
            {
                id: 'moment-the-wrong-ending',
                preview: `It reached the end and got it wrong.`,
                question: `Which ending still feels wrong to you? What should have happened instead — and what new problem might your version create?`,

                upgrade: {
                    term: `a cop-out`,
                    type: `noun`,
                    definition: `An easy way of avoiding a difficult decision, question, or ending.`,
                    ordinary: `“The ending avoided the difficult question the whole story had been building towards.”`,
                    upgraded: `“The ending was a complete cop-out.”`,
                    priority: 'key',
                    atlasPrompt: `When has an answer from a company, manager, or official body felt like a cop-out?`
                }
            },
            {
                id: 'moment-punishment-that-fit',
                preview: `What did they really deserve?`,
                question: `Choose a character whose punishment felt fair or excessive. What punishment would you have given them? What detail about them or the situation could make you reconsider?`,

                upgrade: {
                    term: `have it coming`,
                    type: `idiom`,
                    definition: `To deserve the unpleasant thing that happens to you.`,
                    ordinary: `“After everything he had done, I thought he fully deserved what happened.”`,
                    upgraded: `“After everything he had done, I thought he had it coming.”`,
                    priority: 'standard',
                    atlasPrompt: `When do people say somebody had it coming, and when does that judgement feel too harsh?`
                }
            },
            {
                id: 'moment-seeing-the-machinery',
                preview: `You can see the trick. It still works.`,
                question: `When have you seen exactly how a story was trying to make you feel — the swelling music, the slow goodbye, the dog — and still reacted exactly as intended? What made it work?`,

                upgrade: {
                    term: `lay it on thick`,
                    type: `idiom`,
                    definition: `To exaggerate something, especially emotion, to create a stronger reaction.`,
                    ordinary: `“They made the goodbye scene as emotional as possible, and I still cried.”`,
                    upgraded: `“They laid it on thick during the goodbye scene, and I still cried.”`,
                    priority: 'standard',
                    atlasPrompt: `Who tends to lay it on thick when describing how busy, ill, tired, or inconvenienced they were?`
                }
            },
            {
                id: 'moment-where-you-stop',
                preview: `The thing you will not sit through.`,
                question: `What kind of story do you avoid — extreme violence, children in danger, illness, cruelty, or something that affects you personally? Is that a permanent limit, or does it depend on your mood?`,

                upgrade: {
                    term: `too close to home`,
                    type: `phrase`,
                    definition: `Uncomfortably similar to your own life or personal experience.`,
                    ordinary: `“He avoids hospital dramas because they remind him too strongly of his own family.”`,
                    upgraded: `“He avoids hospital dramas because they are too close to home.”`,
                    priority: 'standard',
                    atlasPrompt: `What topic can feel too close to home in a joke, news story, or personal conversation?`
                }
            },
            {
                id: 'moment-recommendation-that-failed',
                preview: `You loved it. They shrugged.`,
                question: `Which story did you recommend so strongly that the other person came back unimpressed? Did the story fail them, did you oversell it, or were they simply the wrong audience?`,

                upgrade: {
                    term: `rave about something`,
                    type: `phrasal verb`,
                    definition: `To speak about something with great enthusiasm and praise.`,
                    ordinary: `“I talked so enthusiastically about the series that my sister finally watched it.”`,
                    upgraded: `“I raved about the series until my sister finally watched it.”`,
                    priority: 'standard',
                    atlasPrompt: `What restaurant, product, place, or experience have you raved about to somebody who was not impressed?`
                }
            }
        ],

        makeItReal: {
            title: `Put the Ending on Trial`,
            prompt: `Choose an ending you have never accepted. Argue against it while your tutor defends it. Then propose one change. Would it improve the story, or only make you happier?`
        }
    },

    {
        id: 'set-long-after',
        title: `Long After`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The fragments that remain, the favourites we inherit, and the invented people who begin to feel real.`,

        moments: [
            {
                id: 'moment-a-line-you-still-hear',
                preview: `Not the plot. The fragment.`,
                question: `Think of one line, image, sound, or expression from a story that has stayed with you. Describe it without naming the story. Your tutor will guess what kind of moment it came from. Then explain why it remained with you.`,

                upgrade: {
                    term: `stick with someone`,
                    type: `phrase`,
                    definition: `To remain in someone’s memory or continue affecting them for a long time.`,
                    ordinary: `“I kept thinking about the final image for weeks afterwards.”`,
                    upgraded: `“The final image stuck with me for weeks.”`,
                    priority: 'standard',
                    atlasPrompt: `What piece of advice, comment, image, or experience has stuck with you?`
                }
            },
            {
                id: 'moment-handed-to-you',
                preview: `Nobody asked whether you liked it.`,
                question: `What story was placed in front of you when you were young — a parent’s favourite film, a school book, or something always playing at home? Did it become yours too, or did you reject it?`,

                upgrade: {
                    term: `hand something down`,
                    type: `phrasal verb`,
                    definition: `To pass something to a younger person or later generation.`,
                    ordinary: `“My father gave us the westerns he had loved when he was young.”`,
                    upgraded: `“My father handed down the westerns he had loved to us.”`,
                    priority: 'key',
                    atlasPrompt: `What recipe, object, skill, name, or habit has been handed down to you?`
                }
            },
            {
                id: 'moment-went-back-to-it',
                preview: `You went back. It had changed.`,
                question: `What story did you love when you were younger and return to as an adult? What still worked — and what suddenly felt old, awkward, or much stranger than you remembered?`,

                upgrade: {
                    term: `dated`,
                    type: `adjective`,
                    definition: `No longer feeling modern or suitable because attitudes, language, or style have changed.`,
                    ordinary: `“Some parts still worked, but the jokes and attitudes felt very old.”`,
                    upgraded: `“Some parts still worked, but the jokes and attitudes felt dated.”`,
                    priority: 'standard',
                    atlasPrompt: `What product, workplace habit, piece of advice, or social rule now feels dated?`
                }
            },
            {
                id: 'moment-never-read-it',
                preview: `You know the ending anyway.`,
                question: `What famous story do you know surprisingly well without ever reading, watching, or playing it? Where did that knowledge come from — references, parodies, conversations, or people explaining it badly?`,

                upgrade: {
                    term: `by reputation`,
                    type: `phrase`,
                    definition: `Known through what other people say rather than through direct experience.`,
                    ordinary: `“I have never watched it, but I know what people say about it.”`,
                    upgraded: `“I have never watched it. I only know it by reputation.”`,
                    priority: 'standard',
                    atlasPrompt: `What person, business, place, or neighbourhood do you know only by reputation?`
                }
            },
            {
                id: 'moment-as-if-they-existed',
                preview: `Put them somewhere ordinary.`,
                question: `Which fictional person feels real enough that you can predict how they would behave? Put them into one ordinary situation from your own life — what would they do, and how would people react?`,

                upgrade: {
                    term: `true to character`,
                    type: `phrase`,
                    definition: `Behaving in a way that matches someone’s established personality.`,
                    ordinary: `“She would refuse to wait quietly because that matches the personality we already know.”`,
                    upgraded: `“She would refuse to wait quietly because that would be completely true to character.”`,
                    priority: 'key',
                    atlasPrompt: `What behaviour would be completely out of character for someone you know?`
                }
            }
        ],

        makeItReal: {
            title: `What You Would Pass On`,
            prompt: `Choose one story you would pass on to someone younger. Explain why they should experience it, then name one thing you would deliberately not explain beforehand because they need to discover it for themselves.`
        }
    }
];

const clCards = [
    {
        id: 'cl-teller-in-the-room',
        contextLine: `Storytelling before print`,
        title: `The Teller Could See Your Face`,
        teaser: `The story changed depending on who was listening.`,

        context: `Before print, most stories were heard in company rather than read alone. The teller could watch the listeners and change the story as they went: stretch a scene that was working, shorten one that was not, or alter the ending for that particular room. The same tale might sound different on two nights.`,

        mainQuestion: `You are halfway through telling a story and can see that people are losing interest. Do you change it as you go, or finish the version you planned?`,

        followTheThread: [
            `Who is the best storyteller you have actually heard, and what do they do that other people do not?`,
            `If a story improves every time it is told, is it still the same story?`
        ],

        upgrade: {
            term: `hold a room`,
            type: `phrase`,
            definition: `To keep a group of people listening and interested.`,
            ordinary: `“She can keep a whole table listening to her without any effort at all.”`,
            upgraded: `“She can hold a room without any effort at all.”`,
            priority: 'key',
            atlasPrompt: `Who do you know who can hold a room — at work, at a family meal, or in a meeting? What do they actually do?`
        }
    },

    {
        id: 'cl-audiences-that-talked-back',
        contextLine: `Theatre audiences`,
        title: `They Used to Shout Back`,
        teaser: `Audiences ate, moved about, and told the actors what they thought.`,

        context: `Audiences have not always sat quietly. In many theatres, people ate, moved around, called out praise or abuse, and sometimes demanded that a favourite passage be performed again. Sitting still in the dark and saying nothing became normal much later.`,

        mainQuestion: `Somebody near you talks all the way through a performance. Do you say something, move seats, or sit there resenting them for two hours?`,

        followTheThread: [
            `What is silence in a cinema or theatre actually protecting — the story or the other people?`,
            `What would you happily shout at a screen or stage if it were allowed?`
        ],

        upgrade: {
            term: `bite your tongue`,
            type: `idiom`,
            definition: `To stop yourself from saying something you want to say.`,
            ordinary: `“I wanted to say something to the man behind me, but I stopped myself.”`,
            upgraded: `“I wanted to say something to the man behind me, but I bit my tongue.”`,
            priority: 'key',
            atlasPrompt: `When did you last bite your tongue, and what stopped you from speaking?`
        }
    },

    {
        id: 'cl-endings-to-order',
        contextLine: `Censors and managers`,
        title: `Endings to Order`,
        teaser: `The tragic ending emptied the house, so somebody changed it.`,

        context: `People other than the writer have often changed how stories end. Censors sometimes required wrongdoers to be punished. Theatre managers replaced tragic endings with happy ones when audiences preferred them. Some famous plays were performed for years in rewritten versions before the original ending returned.`,

        mainQuestion: `You run a theatre. The tragic ending empties the house, while the happy one fills it. Which do you stage?`,

        followTheThread: [
            `Once audiences love a story, should the writer still have complete control over what happens to it?`,
            `Who should get the last word on an ending — the writer, the person paying, or the audience?`
        ],

        upgrade: {
            term: `sell out`,
            type: `phrasal verb`,
            definition: `To give up what you believed in for money or popularity.`,
            ordinary: `“They abandoned the tragic ending they believed in because the happy version would make more money.”`,
            upgraded: `“They sold out and gave it a happy ending.”`,
            priority: 'standard',
            atlasPrompt: `When have you heard somebody accused of selling out — a musician, a business, or a person who changed sides?`
        }
    },

    {
        id: 'cl-the-week-between',
        contextLine: `Serialised fiction`,
        title: `The Week in Between`,
        teaser: `Everyone was waiting, and nobody knew what came next.`,

        context: `Novels have often reached readers one part at a time, through magazines, newspapers, or cheap printed sections. People argued about what would happen next while the writer was still working. Writers could hear those reactions, and some plots may have changed because of them.`,

        mainQuestion: `Would you rather wait a week between episodes, with everybody else waiting too — or have the whole story available at once?`,

        followTheThread: [
            `What is lost when nobody has to wait for anything?`,
            `Have you ever slowed something down on purpose to make it last longer?`
        ],

        upgrade: {
            term: `a cliffhanger`,
            type: `noun`,
            definition: `An ending that stops at an exciting moment so you have to come back.`,
            ordinary: `“Every episode stopped at the worst possible moment, so you had no choice but to come back.”`,
            upgraded: `“Every episode ended on a cliffhanger, so you had no choice but to come back.”`,
            priority: 'standard',
            atlasPrompt: `When has real life stopped on a cliffhanger — a result you had to wait for or a conversation that was interrupted?`
        }
    },

    {
        id: 'cl-letters-to-a-character',
        contextLine: `Readers and characters`,
        title: `Letters to Somebody Who Never Existed`,
        teaser: `The actor who played the villain got shouted at in the street.`,

        context: `Readers and audiences have often treated invented people as if they were real. Some wrote letters to characters, sent them advice, or mourned a character’s death in newspapers. Actors playing villains were sometimes shouted at in the street, and writers received requests to spare characters in the next part.`,

        mainQuestion: `A stranger stops an actor in the street and blames them for what their character did. Is that a compliment to the performance, or has something gone wrong?`,

        followTheThread: [
            `Have you ever disliked a real person because of a part they played?`,
            `What would make you write to an author and ask them to spare a character?`
        ],

        upgrade: {
            term: `blur the line between two things`,
            type: `phrase`,
            definition: `To make the difference between two things less clear.`,
            ordinary: `“Some viewers treated the actor and the villain he played as though they were the same person.”`,
            upgraded: `“Some viewers blurred the line between the actor and the villain he played.”`,
            priority: 'key',
            atlasPrompt: `When can people blur the line between performance and reality — in acting, social media, sport, or public life?`
        }
    },

    {
        id: 'cl-tales-for-children',
        contextLine: `Tales told to children`,
        title: `Do That Again and See What Happens`,
        teaser: `The creature is waiting for children who do not do as they are told.`,

        context: `Stories told to children have often warned them through fear: the child who wanders off, the one who disobeys, or the creature waiting in the dark. Similar story shapes appear in very different places, but their endings vary. One version punishes the child, another forgives them, and another simply stops.`,

        mainQuestion: `In one version, the child who disobeys is punished. In another, nothing happens to them. Which version would you tell a child now? Which one would you have preferred to hear when you were young?`,

        followTheThread: [
            `What were you warned about through a story rather than a direct rule?`,
            `Which story from your childhood would sound alarming if you told it to a child today?`
        ],

        upgrade: {
            term: `a cautionary tale`,
            type: `phrase`,
            definition: `A story told as a warning about what could happen.`,
            ordinary: `“It was a story told to children to warn them against doing something.”`,
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

        context: `For most of history, people had to travel to a story, borrow it, or wait for it. A group of actors arrived in town and then moved on. One book might pass through a whole household and be read aloud. A single cinema screen could serve an entire district. What people encountered depended heavily on where they lived.`,

        mainQuestion: `When people had fewer stories to choose from but often shared the same ones, did each story feel more valuable — or were stories simply harder to access?`,

        followTheThread: [
            `What was the last thing you made a real effort to find, and did the effort change how you felt about it?`,
            `Is there anything you deliberately limit so that it does not disappear too quickly?`
        ],

        upgrade: {
            term: `spoilt for choice`,
            type: `phrase`,
            definition: `Having so many options that choosing becomes difficult.`,
            ordinary: `“There is so much available that I spend twenty minutes choosing and then watch nothing.”`,
            upgraded: `“I am so spoilt for choice that I spend twenty minutes choosing and then watch nothing.”`,
            priority: 'standard',
            atlasPrompt: `Where are you so spoilt for choice that deciding has become harder — food, clothes, entertainment, or places to go?`
        }
    },

    {
        id: 'cl-the-ones-that-vanished',
        contextLine: `Lost works`,
        title: `The Ones That Did Not Survive`,
        teaser: `Known only by its title, and by what somebody else said about it.`,

        context: `A great deal of storytelling has disappeared. Some plays are known only by their title or by comments from another writer. Many early films survive only in fragments, and some writers died before finishing their stories. Occasionally, a forgotten copy is found somewhere unexpected.`,

        mainQuestion: `A series you loved will never be finished. Would you want somebody else to complete it, or is an unfinished story better left alone?`,

        followTheThread: [
            `Does knowing how something ends matter more than the ending being good?`,
            `Would you read a summary of an ending you will never see, or would you rather not know?`
        ],

        upgrade: {
            term: `tie up loose ends`,
            type: `phrase`,
            definition: `To deal with remaining details that have not been settled.`,
            ordinary: `“The series finished without explaining several things it had introduced.”`,
            upgraded: `“The series finished without tying up several of its loose ends.”`,
            priority: 'key',
            atlasPrompt: `What loose ends have you been putting off tying up — at work, at home, or with somebody you have been meaning to contact?`
        }
    }
];
