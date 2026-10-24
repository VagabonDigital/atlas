/*
  ATLAS · COMPASS ORIGINAL
  Editorial migration from Atlas Backup v3, 24 October 2026.
  Private owner, learner, continuity and account data excluded.
  Subject-specific review: science, conversation quality and optional paths.
  Cover: founder-selected externally hosted image — https://www.planetnatural.com/wp-content/uploads/2024/10/Plants-That-Glow-In-The-Dark.jpg
*/

const MODULE = {
    "id": "forests-that-glow-at-night",
    "schemaVersion": 2,
    "contentVersion": "1.0.0",
    "title": "The Forests That Glow at Night",
    "titleHtml": "The Forests That Glow at Night",
    "navTitle": "Glowing Forests",
    "bgImage": "https://www.planetnatural.com/wp-content/uploads/2024/10/Plants-That-Glow-In-The-Dark.jpg"
};

const subjectCopy = {
    "cover": {
        "hook": "Discover the forest’s hidden light"
    },
    "paths": {
        "discussionTitle": "Discussion",
        "reflectionTitle": "Reflection",
        "culturalLensTitle": "Cultural Lens",
        "discussionDescription": "Explore the surprising relationships and unseen processes that make a forest come alive after dark.",
        "reflectionDescription": "Step back from the subject, connect the ideas, and consider what you may now see or do differently.",
        "culturalLensDescription": "Discover how different places, periods, and ways of seeing can change our understanding of glowing fungi and the dark forest."
    },
    "overview": {
        "intro": [
            "Imagine walking through a quiet forest and noticing a faint green light on a fallen branch. A moment like this can make ordinary nature feel mysterious, while also showing how life can appear in unexpected places."
        ],
        "heading": "The Beauty of Hidden Things",
        "question": "Have you ever seen something in nature that surprised or fascinated you?\nWhat was it?"
    },
    "discussion": {
        "intro": "Talk about the hidden work that happens in forests, from the breakdown of fallen wood to the quiet connections between different forms of life. Consider what these discoveries can change about the way we see darkness, decay, and the natural world.",
        "heading": "Life in the Shadows"
    },
    "reflection": {
        "title": "A Different Kind of Wonder",
        "summary": "Glowing fungi invite us to look again at darkness, decay, and the quiet relationships that support life in a forest. They also show how scientific understanding can deepen wonder rather than remove it.",
        "questions": [
            "After exploring glowing fungi and the hidden life around them, has your view of darkness, decay, or “unimportant” parts of nature changed? Why?",
            "What is one way you might slow down, look more carefully, or make a different choice when you encounter overlooked parts of the natural world?"
        ]
    },
    "keyLanguage": {
        "intro": "Useful language from this subject."
    },
    "culturalLens": {
        "intro": "Explore how people in different places and periods understand dark forests, strange natural light, and the hidden life of decaying wood. Compare practical, scientific, and imaginative ways of seeing fungi and their role in the forest.",
        "heading": "When Darkness Feels Different"
    }
};

const discussionSets = [
    {
        "id": "discussion-set-f969a833-c308-4743-8c59-1c28cc6e38af",
        "icon": "first-look",
        "stage": "First Look",
        "title": "A Forest That Glows",
        "moments": [
            {
                "id": "moment-e06a536e-b152-4f85-b262-fc99085775af",
                "preview": "Your first reaction",
                "upgrade": {
                    "term": "catch someone off guard",
                    "type": "idiom",
                    "ordinary": "The strange green light would surprise me, and I might not know what to do at first.",
                    "priority": "key",
                    "upgraded": "The strange green light would really catch me off guard, so I might step back and look for its source.",
                    "definition": "To surprise someone so much that they are not prepared for how to react.",
                    "atlasPrompt": "What kind of unexpected event could catch you off guard in everyday life?"
                },
                "question": "If you saw green light coming from a fallen tree at night, what would you think or do first?"
            },
            {
                "id": "moment-44678c4d-a25a-489e-81bc-222e3d284162",
                "preview": "Beautiful or frightening",
                "upgrade": {
                    "term": "have mixed feelings about",
                    "type": "phrase",
                    "ordinary": "I would feel both interested and a little afraid if I saw glowing fungi in a forest.",
                    "priority": "key",
                    "upgraded": "I’d have mixed feelings about glowing fungi because they would seem beautiful but also slightly unsettling.",
                    "definition": "To feel both positive and negative emotions about something.",
                    "atlasPrompt": "When might you have mixed feelings about a decision someone else makes?"
                },
                "question": "Would glowing fungi seem beautiful, frightening, or both to you? Why?"
            },
            {
                "id": "moment-6bbc6b45-c5f1-4c5a-8f8a-2aac03cd2ef2",
                "preview": "A closer look",
                "upgrade": {
                    "term": "shed light on",
                    "type": "phrasal verb",
                    "ordinary": "I’d like to understand why this fungus produces light and what purpose it serves.",
                    "priority": "key",
                    "upgraded": "I’d like to learn how this unusual glow might shed light on the fungus’s relationships with insects and plants.",
                    "definition": "to help explain something or make it easier to understand",
                    "atlasPrompt": "What kind of evidence could shed light on a difficult problem in your work or daily life?"
                },
                "question": "What would you want to learn about a fungus that could make its own light?"
            },
            {
                "id": "moment-d4450214-f7e1-439d-a304-2d136d9ee2d3",
                "preview": "Finding it outdoors",
                "upgrade": {
                    "term": "venture into",
                    "type": "verb",
                    "ordinary": "I would be willing to go into a dark forest if I had someone with me.",
                    "priority": "key",
                    "upgraded": "I would be willing to venture into a dark forest if I had someone with me.",
                    "definition": "to go into an unfamiliar or possibly challenging place or situation, usually with some courage",
                    "atlasPrompt": "What unfamiliar place or situation would you be willing to venture into, and why?"
                },
                "question": "Would you enjoy exploring a dark forest to look for glowing fungi, or would you prefer to see them in a museum or video?"
            },
            {
                "id": "moment-f331913d-b0c7-4904-8fda-28d088a53540",
                "preview": "The overlooked forest",
                "upgrade": {
                    "term": "go unnoticed",
                    "type": "phrase",
                    "ordinary": "Many interesting details in nature are missed because people are in a hurry.",
                    "priority": "key",
                    "upgraded": "Many interesting details in nature go unnoticed because people are in a hurry.",
                    "definition": "To not be seen, recognized, or appreciated by people.",
                    "atlasPrompt": "What useful skills or everyday acts of kindness often go unnoticed in your community?"
                },
                "question": "What other small or hidden things in nature might people notice if they slowed down and looked more carefully?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Pitch the First Encounter",
            "prompt": "Choose the best way for a newcomer to experience glowing fungi: an outdoor search, a museum display, or a video. Give your tutor a short recommendation with two reasons and one thing you would want the person to notice or wonder about."
        },
        "description": "Share your reactions to glowing fungi and imagine discovering this strange light in a dark forest."
    },
    {
        "id": "discussion-set-caf46e94-e6a5-4c96-a40e-5a127f7a0b84",
        "icon": "closer-look",
        "stage": "Look Closer",
        "title": "What the Glow Is Doing",
        "moments": [
            {
                "id": "moment-86a96539-b22d-4a96-b596-d77a5600d86b",
                "preview": "A useful signal",
                "upgrade": {
                    "term": "see something in a different light",
                    "type": "phrase",
                    "ordinary": "I would think about the glow differently if I knew it helped fungi reproduce.",
                    "priority": "key",
                    "upgraded": "I would see the glow in a different light if I knew it helped fungi reproduce.",
                    "definition": "to understand or think about something in a new way",
                    "atlasPrompt": "Has learning a fact about a person or place ever made you see them in a different light?"
                },
                "question": "If glowing helps fungi attract insects or spread their spores, how might that change the way you see the light?",
                "followUp": {
                    "id": "glow-is-not-always-a-signal",
                    "kind": "go-deeper",
                    "prompt": "Researchers found that some glowing fungi attract insects, but a field study of Australia’s ghost fungus found no such effect. How could both results be correct? Design a simple fair comparison, decide what you would measure, and explain why one result cannot stand for every glowing fungus."
                }
            },
            {
                "id": "moment-75e0031e-12cc-43ee-bd78-2260f235f9c7",
                "preview": "Decay with a purpose",
                "upgrade": {
                    "term": "serve a purpose",
                    "type": "phrase",
                    "ordinary": "The old building looks empty, but it is still useful to the local community.",
                    "priority": "key",
                    "upgraded": "Even rotting wood can serve a purpose by supporting fungi and insects.",
                    "definition": "To have a useful reason, function, or role, even if its value is not immediately obvious.",
                    "atlasPrompt": "Can you describe something in your town or daily life that seems useless but actually serves a purpose?"
                },
                "question": "Why do people often see rotting wood as ugly or useless, and what might glowing fungi reveal about its importance?"
            },
            {
                "id": "moment-69505a04-9c86-4a96-9016-4d56313ec2e0",
                "preview": "Hidden teamwork",
                "upgrade": {
                    "term": "play a role in",
                    "type": "collocation",
                    "ordinary": "Even small insects may help keep the forest healthy.",
                    "priority": "key",
                    "upgraded": "Even small insects may play a role in keeping the forest healthy.",
                    "definition": "to be one of the things that helps cause a result or makes something happen",
                    "atlasPrompt": "What different factors might play a role in helping a community recover after a natural disaster?"
                },
                "question": "How might fungi, insects, plants, and dead wood depend on one another in ways people do not usually notice?"
            },
            {
                "id": "moment-dae04665-7428-4eb2-a0d6-4daba763d41e",
                "preview": "A difficult discovery",
                "upgrade": {
                    "term": "strike a balance between",
                    "type": "collocation",
                    "ordinary": "We need to protect the fungus but also learn more about it.",
                    "priority": "key",
                    "upgraded": "We need to strike a balance between protecting the fungus and studying it.",
                    "definition": "to find a fair middle point between two important but competing aims",
                    "atlasPrompt": "When a new technology has benefits and risks, how can society strike a balance between progress and safety?"
                },
                "question": "If a glowing fungus were found in a forest near your home, should people protect it, study it, or leave it completely alone?"
            },
            {
                "id": "moment-0105ca3c-bca2-4744-9673-dab3ad4f48ea",
                "preview": "Nature’s strange solutions",
                "upgrade": {
                    "term": "adapt to",
                    "type": "verb",
                    "ordinary": "Some desert plants have changed in ways that help them survive with very little water.",
                    "priority": "key",
                    "upgraded": "Some desert plants have adapted to survive with very little water.",
                    "definition": "Change your behavior or features so you can deal with new conditions or survive more successfully.",
                    "atlasPrompt": "How have people adapted to a major change in the way they work or study?"
                },
                "question": "What other surprising solutions might living things use to survive, attract help, or spread their species?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Change the Story of Decay",
            "prompt": "Imagine a friend calls rotting wood useless. Give them a short spoken reply that changes their view, using glowing fungi and one hidden forest relationship as evidence, then suggest one respectful action they could take."
        },
        "description": "Look more closely at the possible reasons fungi glow and the hidden forest relationships connected to this strange light."
    },
    {
        "id": "discussion-set-a09bd001-ef18-405c-b2d3-354af48a6e7c",
        "icon": "wider-view",
        "stage": "Wider View",
        "title": "Seeing the Hidden Forest",
        "moments": [
            {
                "id": "moment-a981db97-8821-44a7-a532-a1e72144e783",
                "preview": "Changing the meaning of darkness",
                "upgrade": {
                    "term": "open someone’s eyes to",
                    "type": "phrase",
                    "ordinary": "A guided walk could help people notice how much life exists after sunset.",
                    "priority": "key",
                    "upgraded": "A guided walk could open people’s eyes to how much life exists after sunset.",
                    "definition": "to help someone notice or understand something they had not seen before",
                    "atlasPrompt": "What experience could open your eyes to an aspect of your hometown that you had never noticed before?"
                },
                "question": "If forests were full of hidden lights and relationships, how might that change the way people feel about being in nature at night?"
            },
            {
                "id": "moment-6ef3eb8e-3266-4eb2-acdb-e53f60c732cf",
                "preview": "Beauty in decay",
                "upgrade": {
                    "term": "look beyond appearances",
                    "type": "phrase",
                    "ordinary": "We should not judge dead wood only by its appearance.",
                    "priority": "key",
                    "upgraded": "We need to look beyond appearances and recognize that dead wood can support a whole community of organisms.",
                    "definition": "To consider what something is really like, not only how it looks at first.",
                    "atlasPrompt": "When might it be important to look beyond appearances before forming an opinion about a person or place?"
                },
                "question": "Should people learn to value decay and dead wood as much as fresh flowers and healthy trees? Why or why not?"
            },
            {
                "id": "moment-6de50d56-47e1-43ae-a0d1-392cf4bfc8ef",
                "preview": "Science or wonder",
                "upgrade": {
                    "term": "take away from the mystery",
                    "type": "phrase",
                    "ordinary": "Understanding how the glowing fungi produce light does not make them less fascinating to me.",
                    "priority": "key",
                    "upgraded": "Understanding how the glowing fungi produce light does not take away from the mystery for me; it makes their world even more fascinating.",
                    "definition": "make something feel less mysterious or fascinating by explaining it",
                    "atlasPrompt": "Does knowing how a magic trick works take away from the mystery for you, or does it make the trick more interesting?"
                },
                "question": "When scientists explain how glowing fungi work, does that make them more interesting or less mysterious to you?",
                "followUp": {
                    "id": "wonder-under-the-microscope",
                    "kind": "another-angle",
                    "prompt": "You are preparing a nature exhibition. One visitor wants the mysterious story of “foxfire”; another wants a scientifically precise explanation. Write two 20-second introductions that are both truthful but produce very different reactions. Which would make a better opening for your learner?"
                }
            },
            {
                "id": "moment-2216c2a6-2ab2-4149-a202-e0b94bf537b3",
                "preview": "Protecting a rare discovery",
                "upgrade": {
                    "term": "put safeguards in place",
                    "type": "phrase",
                    "ordinary": "The park should create clear rules to protect the site from damage.",
                    "priority": "key",
                    "upgraded": "The park should put safeguards in place before opening the site to visitors.",
                    "definition": "to introduce rules or actions that protect something from harm or misuse",
                    "atlasPrompt": "What safeguards should a city put in place before introducing a popular new technology?"
                },
                "question": "If a rare glowing fungus attracted large numbers of visitors, what rules would be fair for protecting it?"
            },
            {
                "id": "moment-2876dd4c-7f86-4127-91c4-794f7e5089b2",
                "preview": "A lesson from the forest",
                "upgrade": {
                    "term": "nothing goes to waste",
                    "type": "expression",
                    "ordinary": "Forests show us that even old and damaged material can still be useful.",
                    "priority": "key",
                    "upgraded": "Forests show us that nothing goes to waste: dead plants and wood become resources for other living things.",
                    "definition": "Everything has a use or value, including things that might normally be thrown away.",
                    "atlasPrompt": "How could a school, workplace, or neighborhood make sure that nothing goes to waste?"
                },
                "question": "What could human communities learn from the quiet cooperation and recycling that happen in a forest?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Build a Night-Forest Code",
            "prompt": "Create a short three-rule code for people visiting a forest with glowing fungi. Explain how each rule protects both the forest’s hidden life and the visitor’s sense of wonder."
        },
        "description": "Consider how glowing fungi could change our ideas about darkness, decay, discovery, and protecting the natural world."
    }
];

const clCards = [
    {
        "id": "cultural-lens-card-aa09491f-f918-44e9-bbe2-8a6a411e9970",
        "title": "The Mystery of Foxfire",
        "teaser": "A faint green glow in rotten wood once seemed to belong to another world.",
        "context": "In North America, the faint light emitted by some fungi growing in dead wood has long been called “foxfire”. The greenish glow comes from chemical reactions inside living fungi, not from flames. Scientists have found evidence that certain glowing species may attract insects, but this is not true of every species and the glow’s ecological role remains an active question.",
        "upgrade": {
            "term": "make sense of",
            "type": "phrase",
            "ordinary": "A scientific explanation can help us understand why the event happens.",
            "priority": "key",
            "upgraded": "A scientific explanation can help us make sense of the event without making it feel less magical.",
            "definition": "to understand something that was confusing, surprising, or mysterious",
            "atlasPrompt": "What is something in everyday life that seemed confusing until you found an explanation for it?"
        },
        "contextLine": "Appalachian forests and old woodland stories",
        "followTheThread": [
            "How can a scientific explanation change the way people experience a mysterious natural event?",
            "Are there natural sights in your culture that still carry older stories or beliefs?"
        ],
        "mainQuestion": "Would you feel more curious, frightened, or respectful if you found glowing wood in a dark forest, and why?"
    },
    {
        "id": "cultural-lens-card-47049dbd-f182-4b21-b51d-f26092535041",
        "title": "The Ghost Fungus: Beauty with a Warning",
        "teaser": "In Australia, a glowing mushroom can look magical while being dangerous to eat.",
        "context": "Australia’s ghost fungus, Omphalotus nidiformis, grows around dead wood and emits a faint light that long-exposure photography can make appear dramatically bright. It is poisonous if eaten. Field research on this species found no evidence that its glow attracts insects that could disperse spores, reminding us that a striking biological feature need not serve the same purpose in every species.",
        "upgrade": {
            "term": "looks can be deceiving",
            "type": "idiom",
            "ordinary": "The fungus looked beautiful, but it was not safe to eat.",
            "priority": "key",
            "upgraded": "The ghost fungus shows that looks can be deceiving: something beautiful in nature may still be dangerous.",
            "definition": "Something may seem safe, attractive, or simple, but its true nature may be different.",
            "atlasPrompt": "Can you think of a situation where something looked harmless but turned out to need caution?"
        },
        "contextLine": "Australian forests and bushwalking culture",
        "followTheThread": [
            "How do warnings about poisonous plants or fungi change the way people experience a natural place?",
            "Do you think photographing unusual nature helps people respect it, or can it encourage people to disturb it?"
        ],
        "mainQuestion": "If you found a beautiful glowing fungus in a forest, would you feel more curious, cautious, or both—and why?"
    },
    {
        "id": "cultural-lens-card-ca7586cc-2975-49dc-9225-78931ad17c46",
        "title": "The Mushroom That Shines Like Moonlight",
        "teaser": "A beautiful green glow can make a forest mushroom seem inviting—but this one should never be eaten.",
        "context": "In Japan, the bioluminescent fungus known as tsukiyotake, or “moon-night mushroom,” can grow on old beech and oak wood. Its glow is striking, but the mushroom is poisonous and can be confused with edible species such as shiitake. The example shows how beauty, local knowledge, and careful identification meet in the dark forest.",
        "upgrade": {
            "term": "proceed with caution",
            "type": "phrase",
            "ordinary": "I would be careful before touching a mushroom just because it looks beautiful.",
            "priority": "key",
            "upgraded": "I would proceed with caution before touching a mushroom that looks beautiful but may be poisonous.",
            "definition": "to act carefully because there may be a risk or danger",
            "atlasPrompt": "When might you proceed with caution in an unfamiliar social or professional situation?"
        },
        "contextLine": "Japan’s forests and mushroom-foraging traditions",
        "followTheThread": [
            "Why can traditional knowledge about wild foods be valuable, and why might it still need support from modern science?",
            "Would you rather explore a dark forest with a local guide or discover it alone? What would each experience offer?"
        ],
        "mainQuestion": "Would a glowing mushroom make you more curious about nature, or more cautious about touching it? Why?"
    },
    {
        "id": "cultural-lens-card-92b72e45-6b2c-44e0-a7c9-2833e65d0d3a",
        "title": "The Glow You Cannot See in a Snapshot",
        "teaser": "A camera can reveal a fungal glow that the human eye almost misses.",
        "context": "Today, nature photographers often use long-exposure images to capture the faint green light of bioluminescent fungi on rotting wood and leaf litter. The photograph can make decomposition look mysterious and beautiful, while the living forest around it remains mostly invisible. This connects scientific observation with a modern desire to share hidden natural experiences online.",
        "upgrade": {
            "term": "romanticize",
            "type": "verb",
            "ordinary": "Photos can make nature seem more beautiful and mysterious than it really is.",
            "priority": "key",
            "upgraded": "Photos can romanticize nature, making it seem more mysterious than it really is.",
            "definition": "to describe or show something as more beautiful, exciting, or ideal than it really is",
            "atlasPrompt": "Can films or social media posts romanticize everyday life? Give an example."
        },
        "contextLine": "Night photography and citizen science in modern forests",
        "followTheThread": [
            "Would you rather discover a glowing fungus alone at night or see a detailed photograph of it first?",
            "How might seeing fungi as living recyclers change the way people think about dead wood and untidy forests?"
        ],
        "mainQuestion": "Does photography help people understand the hidden life of forests, or can it make nature seem more magical than it really is? Why?"
    },
    {
        "id": "cultural-lens-card-c82d4500-6cf6-459b-8da9-9342f7680d1d",
        "title": "A Dark Forest Needs Darkness",
        "teaser": "The faint light of fungi becomes a cultural treasure when artificial light starts to hide it.",
        "context": "In many places, dark-sky groups encourage communities to reduce unnecessary outdoor lighting so people can see stars and nocturnal wildlife. The same darkness makes the green glow of fungi easier to notice in rotting wood. Seeing this light can change how people value an untidy forest, where dead trees are not waste but part of a living cycle.",
        "upgrade": {
            "term": "come at the expense of",
            "type": "phrase",
            "ordinary": "Reducing outdoor lighting could make the night sky clearer, but it might make some people feel less safe.",
            "priority": "key",
            "upgraded": "Reducing outdoor lighting could make the night sky clearer, but it might come at the expense of some people’s sense of safety.",
            "definition": "To happen or be achieved while causing a disadvantage for something else.",
            "atlasPrompt": "What environmental improvement might come at the expense of convenience in your daily life?"
        },
        "contextLine": "Dark-sky conservation and glowing fungi",
        "followTheThread": [
            "How might attitudes toward fallen trees change if people understood them as homes and food sources for insects, fungi, and other organisms?",
            "What other natural experiences become difficult or impossible when modern life adds too much artificial light?"
        ],
        "mainQuestion": "Would you support darker public spaces if it helped people notice hidden natural phenomena like glowing fungi, even if some people felt less safe or comfortable?"
    },
    {
        "id": "cultural-lens-card-cb738a71-04ab-4c10-af04-0cb9d238f899",
        "title": "From Ghost Fire to Chemistry",
        "teaser": "What looked like supernatural fire slowly became a question for science.",
        "context": "In the seventeenth century, natural philosophers studied “foxfire”: the greenish light sometimes seen in rotting wood. Robert Boyle investigated this glow and helped show that it depended on conditions such as air, moving the subject away from purely supernatural explanations. The mystery did not disappear—it changed into a scientific puzzle about fungi, decomposition, and living systems.",
        "upgrade": {
            "term": "rule out",
            "type": "phrasal verb",
            "ordinary": "Before we call the strange light supernatural, we should check whether there is a natural explanation.",
            "priority": "key",
            "upgraded": "Before we call the strange light supernatural, we should rule out natural explanations.",
            "definition": "To decide that something is not the cause or explanation of a situation.",
            "atlasPrompt": "When you face a surprising problem at home or work, what possible causes would you try to rule out first?"
        },
        "contextLine": "Seventeenth-century Europe and the study of glowing wood",
        "followTheThread": [
            "Can scientific explanations make a natural phenomenon feel more or less magical to you?",
            "What modern mystery might people in the future understand very differently?"
        ],
        "mainQuestion": "When a strange natural event is difficult to explain, do you think people should begin with imagination, science, or both? Why?"
    }
];
