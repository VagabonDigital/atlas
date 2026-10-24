/*
  ATLAS · COMPASS ORIGINAL
  Editorial migration from Atlas Backup v3, 24 October 2026.
  Private owner, learner, continuity and account data excluded.
  Subject-specific review: science, conversation quality and optional paths.
  Cover: founder-selected externally hosted image — https://encoreentertainment.net/wp-content/uploads/2023/10/goosebumps-music-frisson-asmr-1.webp
*/

const MODULE = {
    "id": "why-certain-songs-give-us-chills",
    "schemaVersion": 2,
    "contentVersion": "1.0.0",
    "title": "Why Certain Songs Give Us Chills",
    "titleHtml": "Why Certain Songs Give Us Chills",
    "navTitle": "Songs That Give Us Chills",
    "bgImage": "https://encoreentertainment.net/wp-content/uploads/2023/10/goosebumps-music-frisson-asmr-1.webp"
};

const subjectCopy = {
    "cover": {
        "hook": "When music gets under your skin"
    },
    "paths": {
        "discussionTitle": "Discussion",
        "reflectionTitle": "Reflection",
        "culturalLensTitle": "Cultural Lens",
        "discussionDescription": "Explore the memories, moods, and personal meanings that can make music feel especially powerful.",
        "reflectionDescription": "Step back from the discussion and consider how music shapes your feelings, choices, and connections with other people.",
        "culturalLensDescription": "Discover how people in different places, generations, and social settings connect with music in their own ways."
    },
    "overview": {
        "intro": [
            "Sometimes a song changes the feeling of a moment in seconds. It might bring back a memory, lift your mood, or give you goosebumps. Research with listeners who experienced intense musical pleasure has found activity in the brain’s reward system, but the songs and situations that move us differ. Why does one passage hit so hard when another leaves us cold?"
        ],
        "heading": "A Feeling in the Sound",
        "question": "What song can change your mood quickly?"
    },
    "discussion": {
        "intro": "Think about the songs that stay with you, change how you feel, or seem different in different places and moments. You can explore personal memories, shared experiences, musical choices, and why the same song may affect people in very different ways.",
        "heading": "More Than Just a Song"
    },
    "reflection": {
        "title": "What the Feeling Means to You",
        "summary": "A song’s power can come from its sound, our memories, our mood, or the people around us. Thinking about these different influences can change how we understand our own reactions—and other people’s.",
        "questions": [
            "After exploring how mood, setting, memory, and shared singing can change a song, what do you think matters most in making music feel powerful to you?",
            "Is there a song, listening habit, or shared music experience you would now approach differently? What would you do or notice?"
        ]
    },
    "keyLanguage": {
        "intro": "Useful language from this subject."
    },
    "culturalLens": {
        "intro": "Music can feel powerful in different ways depending on where, when, and with whom we hear it. Explore how social settings, local habits, life stages, and shared memories shape our reactions to songs.",
        "heading": "Shared Sound, Different Meaning"
    }
};

const discussionSets = [
    {
        "id": "discussion-set-e78a96a5-47ff-4c2f-8c6a-b2d64af59ce6",
        "icon": "first-look",
        "stage": "First Look",
        "title": "Songs That Move You",
        "moments": [
            {
                "id": "moment-b472d6a3-3409-4168-a4d7-a6f235f27546",
                "preview": "A song that gives you a physical reaction",
                "upgrade": {
                    "term": "a rush of adrenaline",
                    "type": "collocation",
                    "ordinary": "I suddenly feel very excited when the powerful chorus begins.",
                    "priority": "standard",
                    "upgraded": "The powerful chorus gives me a rush of adrenaline, especially when I hear it live.",
                    "definition": "A sudden feeling of energy and excitement in your body.",
                    "atlasPrompt": "What kind of activity gives you a rush of adrenaline, and what does it feel like?"
                },
                "question": "Can you think of a song that gives you goosebumps or makes you feel a strong physical reaction? When does it happen?",
                "followUps": [
                    {
                        "id": "follow-up-9e9692fa-24b4-4222-ba8a-d7c0b1e09257",
                        "kind": "go-deeper",
                        "prompt": "What part of the song creates the strongest reaction for you—the lyrics, the melody, the singer’s voice, or the memory connected to it?"
                    }
                ]
            },
            {
                "id": "moment-528f0310-ae54-4c0b-8b53-b75b76763b91",
                "preview": "Music and unexpected memories",
                "upgrade": {
                    "term": "take me right back to",
                    "type": "phrase",
                    "ordinary": "That song makes me remember my first year at university.",
                    "priority": "key",
                    "upgraded": "That song takes me right back to my first year at university.",
                    "definition": "To make you remember a particular time, place, or experience very strongly.",
                    "atlasPrompt": "What smell, food, or place takes you right back to a particular time in your life?"
                },
                "question": "What song immediately reminds you of a person, place, or moment from your past?"
            },
            {
                "id": "moment-d15b875b-4757-4a20-a7bc-ab2adfabedad",
                "preview": "The best setting for music",
                "upgrade": {
                    "term": "make all the difference",
                    "type": "phrase",
                    "ordinary": "Listening to the song alone feels completely different from hearing it at a concert.",
                    "priority": "key",
                    "upgraded": "The setting can make all the difference to how a song feels.",
                    "definition": "To have a very strong effect on how something feels or works.",
                    "atlasPrompt": "What small detail can make all the difference to your experience of a meal or a holiday?"
                },
                "question": "Where and when do you most enjoy listening to music, and does the setting change how the song feels?"
            },
            {
                "id": "moment-4384f47d-b32c-4d88-8083-3bb3b80e4cb5",
                "preview": "A powerful first listen",
                "upgrade": {
                    "term": "catch me off guard",
                    "type": "idiom",
                    "ordinary": "I was not expecting the song to affect me so much when I first heard it.",
                    "priority": "key",
                    "upgraded": "The song caught me off guard because its quiet opening suddenly became incredibly powerful.",
                    "definition": "To surprise you because you were not expecting something.",
                    "atlasPrompt": "What kind of comment or news might catch you off guard in everyday life?"
                },
                "question": "Have you ever heard a song for the first time and felt surprised by how strongly you reacted? What happened?"
            },
            {
                "id": "moment-3aa74e86-4ed2-4380-8e6e-024daf0177d3",
                "preview": "Sharing a meaningful song",
                "upgrade": {
                    "term": "strike a chord",
                    "type": "idiom",
                    "ordinary": "That song really connects with me because it reminds me of my family.",
                    "priority": "key",
                    "upgraded": "That song really strikes a chord with me because it reminds me of my family.",
                    "definition": "To create a strong emotional response because something feels familiar or meaningful to you.",
                    "atlasPrompt": "What film, book, or speech has struck a chord with you recently, and why?"
                },
                "question": "What song would you choose to show someone who wanted to understand your taste or personality better?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Build Your Three-Song Soundtrack",
            "prompt": "Choose three songs to create a short soundtrack for a meaningful moment in your life. Put them in order and tell your tutor what each song adds—such as a memory, a feeling, or a physical reaction."
        },
        "description": "Share songs that create strong feelings, bring back memories, or feel especially powerful in certain moments."
    },
    {
        "id": "discussion-set-c13579e5-e17f-4526-8fc6-82f437268935",
        "icon": "closer-look",
        "stage": "Look Closer",
        "title": "Why Music Hits Hard",
        "moments": [
            {
                "id": "moment-796c0de1-ec38-4d01-a35c-b6f17f773472",
                "preview": "The musical detail that changes everything",
                "upgrade": {
                    "term": "build up to",
                    "type": "phrasal verb",
                    "ordinary": "The song slowly prepares you for the final chorus, which makes it more powerful.",
                    "priority": "key",
                    "upgraded": "The song builds up to the final chorus, so when it arrives, the emotional impact is much stronger.",
                    "definition": "to develop gradually toward an important or exciting moment",
                    "atlasPrompt": "What kind of event or experience builds up to a satisfying moment for you?"
                },
                "question": "What part of a song affects you most—the voice, lyrics, rhythm, instruments, or the build-up—and why do you think it works?",
                "followUp": {
                    "id": "anticipation-versus-payoff",
                    "kind": "go-deeper",
                    "prompt": "In one study, researchers observed dopamine release during intensely pleasurable music listening, with different brain areas involved during anticipation and at the emotional peak. Choose a song and explain the musical build-up, what you expect to happen, and the moment that surprises or rewards you. Would the same moment work for every listener?"
                }
            },
            {
                "id": "moment-d7ee0816-b3ce-4478-a31c-22a39592f806",
                "preview": "When mood changes the song",
                "upgrade": {
                    "term": "hit differently",
                    "type": "expression",
                    "ordinary": "I heard that song again after the breakup, and I reacted to it in a completely different way.",
                    "priority": "key",
                    "upgraded": "I heard that song again after the breakup, and it hit differently.",
                    "definition": "To affect you in a noticeably different way, often because your feelings or situation have changed.",
                    "atlasPrompt": "Can you describe a film, place, or piece of advice that hit differently at another point in your life?"
                },
                "question": "Have you ever heard the same song in two different moods and reacted to it in completely different ways? What changed?"
            },
            {
                "id": "moment-a662e376-fd87-40c7-bed0-96b238141bbe",
                "preview": "A song that grows stronger",
                "upgrade": {
                    "term": "grow on me",
                    "type": "phrasal verb",
                    "ordinary": "I didn’t like the song at first, but I started to enjoy it after hearing it several times.",
                    "priority": "key",
                    "upgraded": "The song really grew on me after a few listens, especially because of its unusual chorus.",
                    "definition": "to gradually become more enjoyable or appealing after you experience it several times",
                    "atlasPrompt": "Have you ever disliked a film, book, or place at first but gradually started to enjoy it?"
                },
                "question": "Why do you think some songs become more powerful after several listens, while others lose their appeal?"
            },
            {
                "id": "moment-1477cea5-12c6-4d4c-bc5b-001579bbca84",
                "preview": "Personal taste versus musical quality",
                "upgrade": {
                    "term": "for all its flaws",
                    "type": "phrase",
                    "ordinary": "The song has some problems, but it still gives me chills.",
                    "priority": "key",
                    "upgraded": "For all its flaws, that song still gives me chills.",
                    "definition": "Although something has several problems or weaknesses, it can still have a positive effect.",
                    "atlasPrompt": "Think of a film, book, or meal with clear weaknesses that you still enjoy. How could you describe it using “for all its flaws”?"
                },
                "question": "Can a song give you chills even if you do not think it is especially well made? Tell us about an example."
            },
            {
                "id": "moment-267ef136-fe9b-4fee-8536-8a0340704c93",
                "preview": "The power of a shared reaction",
                "upgrade": {
                    "term": "feed off each other’s energy",
                    "type": "phrase",
                    "ordinary": "At a big event, people often become more excited when they see everyone else enjoying themselves.",
                    "priority": "key",
                    "upgraded": "At a concert, people feed off each other’s energy, so the music can feel much more powerful than it does at home.",
                    "definition": "To become more excited or enthusiastic because of the feelings and reactions of the people around you.",
                    "atlasPrompt": "When have you and other people fed off each other’s energy during a celebration or group activity?"
                },
                "question": "Why might people feel more intensely about music at a concert, party, or sports event than when listening alone?",
                "followUps": [
                    {
                        "id": "follow-up-67d7ecce-d569-41e9-aed3-60ef4de1c476",
                        "kind": "go-deeper",
                        "prompt": "How might sharing that reaction with other people change the way someone remembers the song later?"
                    }
                ]
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Plan the Perfect Listening Moment",
            "prompt": "Choose one song and create the ideal situation for hearing it: decide where, with whom, and in what mood you would listen. Explain which musical detail or personal feeling you expect would make the experience especially powerful."
        },
        "description": "Look at the musical details, situations, and personal differences that can make one song feel unusually powerful."
    },
    {
        "id": "discussion-set-01714a6f-dee8-48aa-bb32-89f7f37197e5",
        "icon": "wider-view",
        "stage": "Wider View",
        "title": "When Music Connects Us",
        "moments": [
            {
                "id": "moment-6790a52f-a208-46af-8378-ed1380beb1bf",
                "preview": "Music at important public moments",
                "upgrade": {
                    "term": "come to represent",
                    "type": "phrase",
                    "ordinary": "People strongly connect this song with the protests because it was played everywhere at the time.",
                    "priority": "key",
                    "upgraded": "Over time, the song came to represent the protesters’ hope for change.",
                    "definition": "To gradually become a symbol of a person, group, idea, or important time.",
                    "atlasPrompt": "What song has come to represent an important period in your life or a group you belong to?"
                },
                "question": "Why do certain songs become connected with national celebrations, protests, disasters, or other important public events?"
            },
            {
                "id": "moment-e92bef93-8302-4d0c-a64a-bfd60db2c6db",
                "preview": "Songs that cross cultural borders",
                "upgrade": {
                    "term": "transcend language barriers",
                    "type": "phrase",
                    "ordinary": "I could feel the emotion in the song even though I did not understand all the lyrics.",
                    "priority": "key",
                    "upgraded": "The song transcended language barriers, because its emotion came through without me understanding every word.",
                    "definition": "To communicate feelings or meaning even when people do not speak the same language.",
                    "atlasPrompt": "What kind of film, image, or performance can transcend language barriers for you?"
                },
                "question": "Have you ever felt deeply moved by a song in a language you do not understand well? What made it meaningful?"
            },
            {
                "id": "moment-babf8662-1807-4022-8ae1-b7dd5327127b",
                "preview": "Music and group identity",
                "upgrade": {
                    "term": "identify with",
                    "type": "phrasal verb",
                    "ordinary": "Many young people feel that the song reflects their experiences and values.",
                    "priority": "key",
                    "upgraded": "Many young people identify with the song because it reflects their experiences and values.",
                    "definition": "to feel that someone, something, or an idea reflects who you are or what you believe",
                    "atlasPrompt": "What kind of public figure, story, or fictional character do people in your country often identify with, and why?"
                },
                "question": "How can a song make people feel that they belong to a particular generation, community, or movement?"
            },
            {
                "id": "moment-ca00f069-0adb-468e-bc57-51029a40e4ad",
                "preview": "Commercial uses of emotion",
                "upgrade": {
                    "term": "play on my emotions",
                    "type": "phrase",
                    "ordinary": "Emotional music can influence how I see a product, even when I know the advertisement is trying to persuade me.",
                    "priority": "key",
                    "upgraded": "Emotional music can play on my emotions and make a product seem more appealing than it really is.",
                    "definition": "to use someone’s feelings to influence what they think or do, often in a slightly unfair way",
                    "atlasPrompt": "Can you think of a situation outside advertising where someone might play on your emotions to influence your decision?"
                },
                "question": "When advertisements, films, or shops use emotional music, does it change your feelings about the product or situation? Why?",
                "followUp": {
                    "id": "soundtrack-swap",
                    "kind": "add-a-twist",
                    "prompt": "A charity advert plays a slow piano track while a technology advert uses an energetic beat. Swap the soundtracks. Explain how the message, credibility and emotional pressure might change, then defend whether deliberately triggering a strong musical response is fair persuasion."
                }
            },
            {
                "id": "moment-c5fe332a-b73f-44b5-954a-0a38f05bf966",
                "preview": "Keeping emotional distance from music",
                "upgrade": {
                    "term": "take something at face value",
                    "type": "idiom",
                    "ordinary": "A song can affect you deeply, but that doesn't mean you should automatically believe everything it says.",
                    "priority": "key",
                    "upgraded": "A song can affect you deeply, but you shouldn't take its message at face value without thinking about it critically.",
                    "definition": "To accept something as true or genuine without questioning it or looking more deeply.",
                    "atlasPrompt": "When might you avoid taking someone’s confident opinion at face value?"
                },
                "question": "Do you think people should be careful about the messages in songs that affect them strongly, or is emotional impact separate from meaning?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Give a Song a New Role",
            "prompt": "Choose one song you know and place it in a new public setting, such as a celebration, protest, film, advertisement, or community event. Explain how it could connect people there and one possible problem with its message or emotional effect."
        },
        "description": "Consider how powerful music shapes groups, cultures, memories, and the way people understand themselves and others."
    }
];

const clCards = [
    {
        "id": "cultural-lens-card-cc42bf84-689d-41e1-8b09-ca4a66681181",
        "title": "When a Crowd Sings as One",
        "teaser": "A song can feel completely different when thousands of people sing it together.",
        "context": "Before Liverpool matches, supporters traditionally sing “You’ll Never Walk Alone” together. The song is not only entertainment: for many fans, it represents loyalty, hope, and belonging to a community. Someone hearing it alone might focus on the melody, while a supporter in the stadium may feel the crowd, the history, and personal memories all at once.",
        "upgrade": {
            "term": "a sense of belonging",
            "type": "collocation",
            "ordinary": "When everyone sang together, I felt like I was part of the group.",
            "priority": "key",
            "upgraded": "When everyone sang together, it gave me a strong sense of belonging.",
            "definition": "the feeling that you are accepted and connected to a group or community",
            "atlasPrompt": "When has a group, team, or community activity given you a sense of belonging?"
        },
        "contextLine": "Football stadiums in Liverpool",
        "followTheThread": [
            "Do songs connected to sports, schools, festivals, or national events create stronger emotions than songs you listen to privately? Why?",
            "Can a song belong to a community while still having a different personal meaning for each listener?"
        ],
        "mainQuestion": "Have you ever experienced a song that felt much more powerful because you heard it with other people? What made that moment special?"
    },
    {
        "id": "cultural-lens-card-f5145cf3-623c-4c2f-85fa-826d23acd914",
        "title": "The Song Everyone Knows",
        "teaser": "Sometimes the strongest feeling comes from sharing an imperfect song with other people.",
        "context": "Karaoke became popular in Japan and is now enjoyed in many countries. In a karaoke room, friends or colleagues often take turns singing songs that everyone recognises, even when the performance is not perfect. A familiar melody, the singer’s personal choice, and the support of the group can create a surprisingly emotional moment.",
        "upgrade": {
            "term": "let your guard down",
            "type": "idiom",
            "ordinary": "People often feel more comfortable and open when they are with close friends.",
            "priority": "key",
            "upgraded": "Singing together can help people let their guard down, even if they are usually shy.",
            "definition": "to relax and stop worrying about how other people may judge you",
            "atlasPrompt": "When do you find it easiest to let your guard down around other people?"
        },
        "contextLine": "Karaoke nights in Japan",
        "followTheThread": [
            "Would you rather sing a meaningful song in front of friends or listen quietly while someone else sings it? Why?",
            "Do people need to sing well for a musical moment to feel powerful, or can enthusiasm matter more?"
        ],
        "mainQuestion": "Have you ever felt a strong emotion because other people were singing a familiar song with you? What made that moment special?"
    },
    {
        "id": "cultural-lens-card-a02002eb-7a9b-45d2-b209-716d1e78b2a3",
        "title": "When Singing Becomes a Tradition",
        "teaser": "At one famous concert, the audience does not simply listen—they help create the emotional climax.",
        "context": "At the Last Night of the Proms in London, audiences traditionally sing along to patriotic songs such as “Jerusalem” and “Rule, Britannia!”. For some people, this creates excitement, pride, and a powerful sense of belonging. For others, the same songs can feel old-fashioned or uncomfortable because they are connected to Britain’s national history and identity.",
        "upgrade": {
            "term": "mixed feelings",
            "type": "collocation",
            "ordinary": "I felt happy to join in, but part of me also felt uncomfortable.",
            "priority": "key",
            "upgraded": "I had mixed feelings about joining in because the singing was exciting, but the history behind it made me uncomfortable.",
            "definition": "A combination of positive and negative emotions about something.",
            "atlasPrompt": "Have you ever had mixed feelings about a change at work, at home, or in your community?"
        },
        "contextLine": "The Last Night of the Proms, Britain",
        "followTheThread": [
            "Is there a song in your culture that people sing together at public events, and what does it represent?",
            "Can a song still give you chills if you disagree with the ideas or history connected to it?"
        ],
        "mainQuestion": "How would you react to joining a huge crowd singing a traditional or patriotic song, and what might make the experience moving or uncomfortable for you?"
    },
    {
        "id": "cultural-lens-card-16332b05-eb00-4fd9-be51-b33d64235429",
        "title": "A Song for the Journey Home",
        "teaser": "In some places, music is valued not for making people dance, but for expressing feelings that are difficult to say directly.",
        "context": "Fado is a Portuguese musical tradition often associated with longing, loss, memory, and the feeling of saudade. In Lisbon’s fado houses, singers perform while audiences listen closely, creating an intimate atmosphere. A quiet song can sometimes produce a stronger emotional reaction than a loud, dramatic one.",
        "upgrade": {
            "term": "put into words",
            "type": "phrase",
            "ordinary": "Sometimes I know how I feel, but I cannot explain it clearly.",
            "priority": "key",
            "upgraded": "Sometimes a song helps me put into words feelings that I cannot explain in conversation.",
            "definition": "To express a feeling or idea clearly by speaking or writing.",
            "atlasPrompt": "What is a personal experience that you have found difficult to put into words?"
        },
        "contextLine": "Fado houses in Lisbon, Portugal",
        "followTheThread": [
            "Do you think people in your culture are comfortable showing strong emotions while listening to music? Why or why not?",
            "Can a song help people express feelings that they would find difficult to explain in conversation?"
        ],
        "mainQuestion": "Have you ever heard a quiet or sad song that gave you chills, and what made it affect you so strongly?"
    },
    {
        "id": "cultural-lens-card-ed7657b7-3c9b-4180-8ae0-800fbf8faf02",
        "title": "When a Song Holds a Memory",
        "teaser": "A familiar song can suddenly connect a private memory with a shared moment.",
        "context": "At midnight on New Year’s Eve, many people sing or hear “Auld Lang Syne,” a song about friendship and remembering the past. Even when people do not know all the words, its melody can create a feeling of belonging, nostalgia, or hope. The same song may feel joyful to one person and deeply emotional to another, depending on their experiences.",
        "upgrade": {
            "term": "hold a lot of meaning for me",
            "type": "phrase",
            "ordinary": "That song is very important to me because I heard it during a special time in my life.",
            "priority": "key",
            "upgraded": "That song holds a lot of meaning for me because I heard it during a special time in my life.",
            "definition": "To be deeply important to me because of my memories or experiences.",
            "atlasPrompt": "Is there a place, object, or tradition that holds a lot of meaning for you? Why?"
        },
        "contextLine": "New Year’s Eve around the world",
        "followTheThread": [
            "What kind of public event could make a song feel especially powerful in your culture?",
            "Do you think a song’s meaning comes more from its words, its melody, or the memories people attach to it?"
        ],
        "mainQuestion": "Have you ever heard a song in a special moment and felt that it became connected to your memory of that time?"
    },
    {
        "id": "cultural-lens-card-80465851-d0d6-4875-932b-8c41696ab391",
        "title": "When a Song Becomes a Voice",
        "teaser": "Some songs create chills because they carry the memory of people standing together for change.",
        "context": "During the U.S. civil rights movement, songs such as “We Shall Overcome” were sung at marches, meetings, and moments of struggle. The simple melody made it easy for many people to join in, while the words expressed hope, courage, and solidarity. Hearing the song today can still connect listeners with that history, even if they were not there.",
        "upgrade": {
            "term": "carry the weight of",
            "type": "phrase",
            "ordinary": "The song feels powerful because people remember the important events connected to it.",
            "priority": "key",
            "upgraded": "The song still carries the weight of that history for many listeners.",
            "definition": "To contain or express the emotional importance of something from the past.",
            "atlasPrompt": "What object, place, or tradition carries the weight of an important experience for your family or community?"
        },
        "contextLine": "Protest music in the United States",
        "followTheThread": [
            "Do you think music can change people’s opinions, or does it mainly strengthen feelings they already have?",
            "Would you feel comfortable singing a serious or political song in a public group? Why or why not?"
        ],
        "mainQuestion": "Have you ever heard a song that felt powerful because of the history or social movement connected to it? What made it affect you?"
    }
];
