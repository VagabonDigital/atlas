/*
  ATLAS · COMPASS ORIGINAL #15
  Migrated from an account-generated Compass subject (B2 · Balanced · Standard · All).
  Editorial review: nuanced eyewitness examples, two optional discussion paths,
  and a locally owned cover. No learner records or account identifiers retained.
  Content version 1.0.0.
*/

const MODULE = {
    "id": "can-you-trust-your-own-memories",
    "schemaVersion": 2,
    "contentVersion": "1.0.0",
    "title": "Can You Trust Your Own Memories?",
    "titleHtml": "Can You Trust <em>Your Own Memories?</em>",
    "navTitle": "Your Own Memories",
    "bgImage": "/assets/atlas-originals/memory-reliability.svg"
};

const subjectCopy = {
    "cover": {
        "hook": "When certainty gets it wrong"
    },
    "paths": {
        "discussionTitle": "Discussion",
        "reflectionTitle": "Reflection",
        "culturalLensTitle": "Cultural Lens",
        "discussionDescription": "Explore the surprising gap between feeling sure about a memory and knowing what really happened.",
        "reflectionDescription": "Step back from familiar memories and consider how you might listen, question and act differently in the future.",
        "culturalLensDescription": "Examine how memory, storytelling, and social expectations can change across places, generations, and everyday situations."
    },
    "overview": {
        "intro": [
            "Think of a familiar moment you remember clearly: a conversation, a journey, or something funny that happened with friends. What if another person remembered the same moment differently—not because either of you was lying, but because memory changes as we recall it?"
        ],
        "heading": "A Story Your Mind Rewrites",
        "question": "Have you ever remembered an event differently from someone who was there?"
    },
    "discussion": {
        "intro": "Explore why two people can remember the same moment differently, how suggestions and later conversations can change what we recall, and whether confidence is a reliable guide to truth. You can also consider how memory affects decisions, relationships, and the stories we tell about our own lives.",
        "heading": "When Certainty Shifts"
    },
    "reflection": {
        "title": "After Certainty",
        "summary": "Memory can feel like a personal recording, but confidence, emotion and shared stories can all shape what we recall. This is an invitation to hold your memories seriously while staying open to other versions and new evidence.",
        "questions": [
            "After exploring how suggestions, emotions and repeated stories can change memory, has your view of a confident memory—or of someone else’s different version—changed? Why?",
            "What is one situation in your life where you would now pause, check the evidence, or ask another person before treating a memory as certain?"
        ]
    },
    "keyLanguage": {
        "intro": "Useful language from this subject."
    },
    "culturalLens": {
        "intro": "Explore how people’s memories are shaped by the stories they share, the questions they hear, and the social settings in which they remember. Compare how different communities, generations, and expectations can influence what feels reliable—and whose version of an event is accepted.",
        "heading": "Whose Version Becomes the Story?"
    }
};

const discussionSets = [
    {
        "id": "discussion-set-5a711e65-b165-407d-9aea-644c70f209ad",
        "icon": "first-look",
        "stage": "First Look",
        "title": "Memory’s First Draft",
        "moments": [
            {
                "id": "moment-f7f494fd-b7d8-4e0f-a3e7-95787f87e393",
                "preview": "A memory you trust",
                "upgrade": {
                    "term": "a vivid recollection",
                    "type": "collocation",
                    "ordinary": "I remember my first day at school very clearly.",
                    "priority": "standard",
                    "upgraded": "I have a vivid recollection of my first day at school, although some details may not be accurate.",
                    "definition": "a memory that feels very clear, detailed, and real",
                    "atlasPrompt": "What is a vivid recollection you have of a holiday, concert, or family celebration?"
                },
                "question": "Think of a childhood memory or an important event you remember clearly. What makes you feel sure that your memory is accurate?"
            },
            {
                "id": "moment-2d0e6f82-128a-4dbb-ac2b-4e9e52f6c919",
                "preview": "Different versions of one moment",
                "upgrade": {
                    "term": "misremember",
                    "type": "verb",
                    "ordinary": "I may have remembered some of the details incorrectly.",
                    "priority": "key",
                    "upgraded": "I may have misremembered some of the details, because my version is different from yours.",
                    "definition": "To remember something incorrectly, often without realising it.",
                    "atlasPrompt": "Have you ever misremembered a name, date, or instruction and only discovered the mistake later?"
                },
                "question": "Have you ever remembered an event differently from a friend or family member? What did you each remember?"
            },
            {
                "id": "moment-b4f20982-0279-4051-87dc-d5645c515aeb",
                "preview": "The detail that changed",
                "upgrade": {
                    "term": "cast doubt on",
                    "type": "phrase",
                    "ordinary": "Finding out the date was wrong made me less certain that I remembered the event correctly.",
                    "priority": "standard",
                    "upgraded": "Finding out the date was wrong cast doubt on the whole memory.",
                    "definition": "make someone less certain that something is true, accurate, or reliable",
                    "atlasPrompt": "What kind of evidence could cast doubt on a confident opinion about a person or situation?"
                },
                "question": "Have you ever discovered that one small detail in a familiar memory was probably wrong? How did you react?"
            },
            {
                "id": "moment-f12f7cc7-3851-4992-92af-887f297ac8f4",
                "preview": "A suggestion takes hold",
                "upgrade": {
                    "term": "plant a false memory",
                    "type": "phrase",
                    "ordinary": "A persuasive suggestion can make you remember something that never happened.",
                    "priority": "standard",
                    "upgraded": "A persuasive suggestion can plant a false memory that feels completely real.",
                    "definition": "To cause someone to remember an event that did not really happen.",
                    "atlasPrompt": "How might a film, advertisement, or persuasive friend plant a false memory in someone’s mind?"
                },
                "question": "If someone confidently suggests that something happened, how might that influence what you later remember about it?"
            },
            {
                "id": "moment-9188a719-e8b9-40c1-8906-f6f49332b2b2",
                "preview": "Confidence versus accuracy",
                "upgrade": {
                    "term": "cross-check",
                    "type": "verb",
                    "ordinary": "I would compare both stories with photos, messages, or other evidence.",
                    "priority": "key",
                    "upgraded": "I would cross-check both stories against photos, messages, and other independent evidence.",
                    "definition": "to compare information with another source to see whether it is correct",
                    "atlasPrompt": "When deciding whether an online claim is reliable, what would you cross-check it against?"
                },
                "question": "When two people remember the same event differently, whose memory would you trust more, and what evidence would you look for?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Be the Memory Investigator",
            "prompt": "Imagine two people remember the same event differently. Decide what questions or evidence you would use to investigate, then give them practical advice about how confidently to trust their memories."
        },
        "description": "Start with familiar moments when memories feel clear, surprising, or different from someone else’s."
    },
    {
        "id": "discussion-set-57a32994-52e8-4c1c-a48f-b3adbec810c8",
        "icon": "closer-look",
        "stage": "Look Closer",
        "title": "When Memories Collide",
        "moments": [
            {
                "id": "moment-3b5cecf4-c02e-4282-8ac6-070102acb5ce",
                "preview": "The story grows in the telling",
                "upgrade": {
                    "term": "embellish",
                    "type": "verb",
                    "ordinary": "When he tells the story, he adds details that make the accident sound more dramatic.",
                    "priority": "standard",
                    "upgraded": "When he tells the story, he tends to embellish it and make the accident sound more dramatic.",
                    "definition": "To add extra details to a story, sometimes making it more interesting or dramatic than it really was.",
                    "atlasPrompt": "Do people sometimes embellish stories about their holidays, achievements, or childhood? Why?"
                },
                "question": "When people retell the same story several times, what kinds of details might become stronger, simpler, or more dramatic?"
            },
            {
                "id": "moment-34247357-a4aa-446d-a8a2-380c3fa7ee71",
                "preview": "A leading question",
                "upgrade": {
                    "term": "colour your memory",
                    "type": "collocation",
                    "ordinary": "The way people describe an experience can change how you remember it.",
                    "priority": "key",
                    "upgraded": "The way people describe an experience can colour your memory of it.",
                    "definition": "To influence the way you remember an event, often without you noticing.",
                    "atlasPrompt": "How might a photo or another person’s opinion colour your memory of a holiday or school event?"
                },
                "question": "Imagine someone asks, “Where were you standing when the red car hit the wall?” before you have described the event. How could that wording affect your memory?",
                "followUp": {
                    "id": "neutral-versus-leading-question",
                    "kind": "add-a-twist",
                    "prompt": "Two witnesses saw the same minor traffic incident. Interviewer A asks, “What happened next?” Interviewer B asks, “How fast was the careless driver going?” Role-play both interviews. Which question risks changing the account, and how would you rewrite it to avoid planting an assumption?"
                }
            },
            {
                "id": "moment-d618739a-cef4-4cef-b5c8-5ec5ed00d419",
                "preview": "Emotion steals the spotlight",
                "upgrade": {
                    "term": "fade into the background",
                    "type": "phrase",
                    "ordinary": "People may remember the strong feeling, but the less important details can become difficult to recall.",
                    "priority": "standard",
                    "upgraded": "The emotional shock stands out, while the smaller details fade into the background.",
                    "definition": "To become less noticeable or less important compared with something stronger or more attention-grabbing.",
                    "atlasPrompt": "Think of a busy day at work or school: which details might fade into the background, and why?"
                },
                "question": "Why might people remember the emotional feeling of an event clearly but disagree about ordinary details around it?"
            },
            {
                "id": "moment-65e533e2-0f2c-42f3-85b0-4cb1ab85fd9e",
                "preview": "The confident eyewitness",
                "upgrade": {
                    "term": "weigh up the evidence",
                    "type": "collocation",
                    "ordinary": "People should look carefully at all the facts before deciding which witness is right.",
                    "priority": "key",
                    "upgraded": "People should weigh up the evidence rather than simply trust the witness who sounds most confident.",
                    "definition": "to consider all the available facts carefully before deciding what to believe",
                    "atlasPrompt": "When choosing between two conflicting online reviews, how would you weigh up the evidence?"
                },
                "question": "If an eyewitness sounds completely certain but gives a different account from a quieter witness, how should other people decide what to believe?"
            },
            {
                "id": "moment-dd019d4c-a848-4372-825b-b90c734ac296",
                "preview": "Checking before acting",
                "upgrade": {
                    "term": "get a second opinion",
                    "type": "phrase",
                    "ordinary": "I would ask someone else what they think before deciding who was right.",
                    "priority": "key",
                    "upgraded": "I’d get a second opinion from someone who was also present before taking action.",
                    "definition": "Ask another person for an independent view before you decide or act.",
                    "atlasPrompt": "When might you get a second opinion before making an important personal or professional decision?"
                },
                "question": "Suppose you remember an important conversation one way, but another person remembers it differently. What would be a sensible way to investigate before making a decision?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Make a Fair Memory Rule",
            "prompt": "Create three practical rules for handling conflicting memories, then rank them from most to least important and defend your top choice. Apply your rules to a disagreement about an important conversation."
        },
        "description": "Examine why memories change, how suggestions influence them, and whether confidence deserves our trust."
    },
    {
        "id": "discussion-set-1ddadaa9-9731-4322-b30c-5d00f35fb800",
        "icon": "wider-view",
        "stage": "Wider View",
        "title": "Memory in the Real World",
        "moments": [
            {
                "id": "moment-8882ee56-d101-48c9-a2a6-a693d0d1f620",
                "preview": "Memory in court",
                "upgrade": {
                    "term": "corroborate",
                    "type": "verb",
                    "ordinary": "The witness’s memory should be supported by other evidence before the court relies on it.",
                    "priority": "standard",
                    "upgraded": "The witness’s memory should be corroborated by independent evidence before the court relies on it.",
                    "definition": "To support a statement or memory with additional independent evidence.",
                    "atlasPrompt": "If a friend tells you an unbelievable story, what kind of evidence might corroborate it?"
                },
                "question": "If a person sincerely remembers a crime incorrectly, what should courts do to balance respect for their experience with the need for reliable evidence?"
            },
            {
                "id": "moment-89b306c0-7e7e-45b9-b6ba-03065265d6e2",
                "preview": "Family stories become history",
                "upgrade": {
                    "term": "pass down",
                    "type": "phrasal verb",
                    "ordinary": "Older relatives tell the same story to each new generation.",
                    "priority": "standard",
                    "upgraded": "The story has been passed down through several generations, so it feels like part of the family’s identity.",
                    "definition": "to give a story, tradition, belief, or object to younger generations",
                    "atlasPrompt": "What tradition, belief, or skill has been passed down in your family or community?"
                },
                "question": "When a family repeats the same story for years, how might that story shape younger members’ identity even if some details are wrong?"
            },
            {
                "id": "moment-20ebd73e-cc6d-4583-ad6a-2f3072db451e",
                "preview": "A record against a memory",
                "upgrade": {
                    "term": "a false sense of certainty",
                    "type": "collocation",
                    "ordinary": "I felt completely sure about what had happened, but I may have been wrong.",
                    "priority": "key",
                    "upgraded": "My strong memory may have given me a false sense of certainty, so I would check the recording carefully.",
                    "definition": "A feeling of being completely sure that is not supported by the facts.",
                    "atlasPrompt": "Can you think of a situation where confidence gave someone a false sense of certainty?"
                },
                "question": "If your memory strongly disagreed with a video, message, or photograph, which would you trust first, and why?",
                "followUp": {
                    "id": "limits-of-the-record",
                    "kind": "another-angle",
                    "prompt": "Now imagine the video has no audio and starts twenty seconds after the disagreement. One person insists a promise was made before filming began. Explain what the recording establishes, what it cannot establish, and what else you would check before reaching a conclusion."
                }
            },
            {
                "id": "moment-d02b7d6d-78f7-410f-bb12-0ed823525c50",
                "preview": "Remembering past mistakes",
                "upgrade": {
                    "term": "give someone the benefit of the doubt",
                    "type": "idiom",
                    "ordinary": "I would not accuse either person of lying until we knew more about what happened.",
                    "priority": "standard",
                    "upgraded": "If two friends remember an argument differently, I would give both of them the benefit of the doubt until we had more information.",
                    "definition": "To believe someone may be telling the truth, even when you are not completely sure.",
                    "atlasPrompt": "When might you give someone the benefit of the doubt after they miss an important deadline?"
                },
                "question": "How should people respond when someone’s memory of a hurtful event differs from the other person’s memory, especially when both seem sincere?"
            },
            {
                "id": "moment-9c90d5fd-fd45-47ff-ad1e-b11c60be1a34",
                "preview": "Who controls the shared story?",
                "upgrade": {
                    "term": "acknowledge multiple perspectives",
                    "type": "collocation",
                    "ordinary": "A museum should show that people experienced the event differently.",
                    "priority": "standard",
                    "upgraded": "A museum should acknowledge multiple perspectives rather than presenting one account as the whole truth.",
                    "definition": "To recognise that people may understand or experience the same situation in different ways.",
                    "atlasPrompt": "When reporting on a controversial local issue, how can journalists acknowledge multiple perspectives without giving every claim equal weight?"
                },
                "question": "When a community remembers a difficult historical event in different ways, whose version should appear in public education or museums, and how should that decision be made?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Design a Trustworthy Story",
            "prompt": "Imagine you are designing a museum display about a disputed community event. Decide what to include from personal memories, records, and conflicting versions, then give a short explanation of why visitors should trust your presentation."
        },
        "description": "Consider how unreliable memories shape justice, relationships, identity, and the stories communities share."
    }
];

const clCards = [
    {
        "id": "cultural-lens-card-acf73eef-7047-414a-97e2-429940aebce9",
        "title": "The Mandela Effect",
        "teaser": "Sometimes thousands of people confidently remember the same detail that was never there.",
        "context": "The “Mandela Effect” describes shared false memories, such as the belief that Nelson Mandela died in prison in the 1980s or that the Monopoly mascot normally wears a monocle. Research has documented striking shared errors about familiar images. The causes can vary and are still being studied: agreement and strong confidence are not proof that a memory is accurate.",
        "upgrade": {
            "term": "take something at face value",
            "type": "idiom",
            "ordinary": "I accepted his explanation without checking whether it was accurate.",
            "priority": "standard",
            "upgraded": "We should not take everyone’s shared memory at face value, even when they sound completely certain.",
            "definition": "To accept something as true or accurate without questioning or checking it.",
            "atlasPrompt": "When might you be tempted to take a piece of advice or information at face value?"
        },
        "contextLine": "Popular culture and shared memory",
        "followTheThread": [
            "Why might people trust a memory more when many others remember the same thing?",
            "Is checking evidence always better than trusting your memory, or are there situations where memory is the most useful guide?"
        ],
        "mainQuestion": "Have you ever shared a confident memory with other people and then discovered that all of you were wrong? What might have created that memory?"
    },
    {
        "id": "cultural-lens-card-0b92840f-9c65-4044-8f52-04b0259e874a",
        "title": "The Face in the Line-Up",
        "teaser": "A confident witness can point to the wrong person and still feel completely certain.",
        "context": "In 1984, Ronald Cotton was wrongly identified by an eyewitness in a sexual-assault case. DNA testing exonerated him in 1995. His case became a prominent example of the dangers of eyewitness misidentification. Research also shows that suggestion and identification procedures can affect witness recollection and confidence.",
        "upgrade": {
            "term": "stand by",
            "type": "phrasal verb",
            "ordinary": "The witness continued to say that her identification was correct, even after people questioned it.",
            "priority": "standard",
            "upgraded": "The witness stood by her identification, even after new evidence challenged it.",
            "definition": "To continue to say that something is true, even when other people question it.",
            "atlasPrompt": "When have you stood by an opinion or decision even after other people questioned it?"
        },
        "contextLine": "Eyewitnesses and the justice system",
        "followTheThread": [
            "Should eyewitness evidence be treated differently from physical evidence such as DNA or video?",
            "Would writing down your memory immediately after an event make it more accurate, or could it create a false sense of certainty?"
        ],
        "mainQuestion": "Should a confident eyewitness account ever be enough to convict someone? What other evidence or safeguards would you insist on?"
    },
    {
        "id": "cultural-lens-card-4e11d87d-e152-485d-a412-d4d1fcff3b66",
        "title": "The Shopping-Mall Memory",
        "teaser": "A person may remember a frightening childhood event that never actually happened.",
        "context": "In a well-known experiment, researchers suggested to participants that they had once been lost in a shopping mall as children. Some participants later described details of this event, even though it had not happened. The study showed how suggestion can help create a memory that feels personal and real, although people do not always accept every suggested story.",
        "upgrade": {
            "term": "fill in the gaps",
            "type": "phrase",
            "ordinary": "When I cannot remember parts of an event, I sometimes add details without realising it.",
            "priority": "standard",
            "upgraded": "When parts of a memory are missing, we may fill in the gaps without realising it.",
            "definition": "To add information that is missing, sometimes without knowing whether it is accurate.",
            "atlasPrompt": "When might people fill in the gaps in a story or conversation, even if they do not have all the facts?"
        },
        "contextLine": "Memory research in the 1990s",
        "followTheThread": [
            "Why might people add realistic details to a memory when they are unsure about what really happened?",
            "What could families, teachers, or researchers do to avoid accidentally influencing someone’s memories?"
        ],
        "mainQuestion": "If a relative told you a vivid childhood story about yourself that you could not remember, what would make you accept it or question it?"
    },
    {
        "id": "cultural-lens-card-5600a381-99c1-4654-934c-fb03cf70725d",
        "title": "The Day Everyone Remembers",
        "teaser": "A shocking event can make a memory feel like a photograph, even when some details quietly change.",
        "context": "After major events such as the September 11 attacks, many people remember exactly where they were and who told them the news. Psychologists call these vivid personal memories “flashbulb memories,” but vividness does not guarantee accuracy. People may keep the emotional certainty while later changing small details as they retell the story and hear other people’s versions.",
        "upgrade": {
            "term": "be swayed by",
            "type": "phrase",
            "ordinary": "People may change their memories because of what other people say.",
            "priority": "standard",
            "upgraded": "People can be swayed by other versions of the same event and become less certain about what really happened.",
            "definition": "to be influenced by someone or something, especially when deciding what to think or believe",
            "atlasPrompt": "When might you be swayed by a confident speaker, even if they do not have strong evidence?"
        },
        "contextLine": "Flashbulb memories and major public events",
        "followTheThread": [
            "Why do you think emotional memories can feel more reliable than ordinary memories?",
            "If your memory differed from your family or friends’ memories of the same event, how would you decide what to believe?"
        ],
        "mainQuestion": "Would you trust your memory of where you were during a major public event, or would you check messages, photos or other records? Why?"
    },
    {
        "id": "cultural-lens-card-cce87ae0-3a54-4f41-8779-c6fe42854e95",
        "title": "The Rashomon Effect",
        "teaser": "One event can produce several honest stories, with no storyteller believing they are lying.",
        "context": "Akira Kurosawa’s 1950 film Rashomon presents a violent event through several contradictory accounts. The film helped inspire the term “Rashomon effect” for situations in which participants give different versions of the same event. Different perspectives, imperfect recall, self-interest or deliberate deception may all play a part; disagreement alone does not establish which version is true.",
        "upgrade": {
            "term": "reconstruct a memory",
            "type": "collocation",
            "ordinary": "Our memories can change when we talk about an event again.",
            "priority": "key",
            "upgraded": "We may reconstruct a memory each time we talk about the event.",
            "definition": "To piece together a remembered event, drawing on details, later information or expectations; the reconstruction may not be completely accurate.",
            "atlasPrompt": "How might people reconstruct a memory of a holiday or family celebration over time?"
        },
        "contextLine": "Japanese cinema and conflicting memories",
        "followTheThread": [
            "Have you ever disagreed with someone about what happened, while both of you felt completely certain?",
            "What kinds of evidence can help separate a confident memory from an accurate one?"
        ],
        "mainQuestion": "Two witnesses tell different stories: one saw the event from the street, the other from a window. How could you separate differences in perspective from mistakes or deliberate deception?"
    },
    {
        "id": "cultural-lens-card-c44aad5b-cd26-427a-8941-8d15f0e23ef1",
        "title": "The Conversation Afterward",
        "teaser": "Talking about an event can make people remember details they never personally saw.",
        "context": "In studies of eyewitness memory, people who witness the same event can influence one another when they discuss it later. A witness may accept a detail from someone else’s account and eventually remember it as part of their own experience. This is called memory conformity, and it shows how social conversation can change what feels like a personal memory.",
        "upgrade": {
            "term": "blur the line between",
            "type": "phrase",
            "ordinary": "After talking to the other witness, she was no longer sure which details she had seen herself.",
            "priority": "key",
            "upgraded": "After talking to the other witness, she began to blur the line between what she had seen and what she had been told.",
            "definition": "To make the difference between two things less clear.",
            "atlasPrompt": "When can a conversation blur the line between your own opinion and someone else’s?"
        },
        "contextLine": "Co-witnesses and shared memory",
        "followTheThread": [
            "What kinds of conversations or questions might make a memory less reliable?",
            "Have you ever become more confident in a memory after hearing someone else describe a similar experience?"
        ],
        "mainQuestion": "If two people remember an event differently, should they discuss it together before describing it to others? Why or why not?"
    }
];
