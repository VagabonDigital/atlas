/*
  ATLAS · COMPASS ORIGINAL
  Editorial migration from Atlas Backup v3, 24 October 2026.
  Private owner, learner, continuity and account data excluded.
  Subject-specific review: science, conversation quality and optional paths.
  Cover: James Marchment / Insects Unlocked, CC0; source https://commons.wikimedia.org/wiki/File:Paraponera_clavata_with_Cordyceps_fungus_(1).jpg
*/

const MODULE = {
    "id": "the-zombie-ant-fungus",
    "schemaVersion": 2,
    "contentVersion": "1.0.0",
    "title": "The Zombie Ant Fungus",
    "titleHtml": "The Zombie Ant Fungus",
    "navTitle": "Zombie Ant Fungus",
    "bgImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Paraponera_clavata_with_Cordyceps_fungus_%281%29.jpg/1280px-Paraponera_clavata_with_Cordyceps_fungus_%281%29.jpg"
};

const subjectCopy = {
    "cover": {
        "hook": "When nature takes control"
    },
    "paths": {
        "discussionTitle": "Discussion",
        "reflectionTitle": "Reflection",
        "culturalLensTitle": "Cultural Lens",
        "discussionDescription": "Talk about behaviour, influence, and survival—and question how much control any living thing really has.",
        "reflectionDescription": "Step back from the subject, connect its ideas, and consider what they might change in the way you see the world.",
        "culturalLensDescription": "Compare different cultural and historical views of instinct, control, survival, and what it means to act freely."
    },
    "overview": {
        "intro": [
            "Some parasitic fungi can change an infected ant’s behaviour so that it moves, grips vegetation and eventually dies in conditions favourable to the fungus. Researchers have found fungal networks spreading through muscle tissues without necessarily invading the brain itself. How can a parasite redirect an animal’s behaviour—and what do we really mean by control?"
        ],
        "heading": "A Mind of Its Own",
        "question": "Have you ever acted on an impulse you could not fully explain?"
    },
    "discussion": {
        "intro": "Explore the forces that shape behaviour, from impulses and habits to outside influence. Consider where control begins and ends, whether freedom is always possible, and how living things adapt when survival is at stake.",
        "heading": "Who Is Really in Charge?"
    },
    "reflection": {
        "title": "Where Freedom Ends",
        "summary": "The zombie ant challenges simple ideas about control, choice, and survival. Looking at parasites, colonies, and human influence can make us question whether independence is ever complete.",
        "questions": [
            "After exploring the fungus, the colony, and other forms of influence, how has your idea of control or freedom changed?",
            "What is one situation in your own life that you would now examine more carefully before deciding that someone—or something—is acting completely freely?"
        ]
    },
    "keyLanguage": {
        "intro": "Useful language from this subject."
    },
    "culturalLens": {
        "intro": "Explore how people in different places and periods understand control, instinct, and behaviour shaped by forces outside conscious choice. The fungus and the ant remain the starting point, while wider cultural ideas about freedom, responsibility, survival, and the natural world open new ways to see the subject.",
        "heading": "Different Ideas of Agency"
    }
};

const discussionSets = [
    {
        "id": "discussion-set-c640c129-29b9-4800-8acd-3baff1f07622",
        "icon": "first-look",
        "stage": "First Look",
        "title": "When Behaviour Changes",
        "moments": [
            {
                "id": "moment-f6c2bbbd-a08a-48b9-a1bc-4462ee14bc71",
                "preview": "An ant follows a strange path",
                "question": "If you saw an ant behaving in a completely unusual way, what would you think was happening?"
            },
            {
                "id": "moment-a044d6eb-1f1c-4701-8789-0930ca96a85d",
                "preview": "Control from inside the body",
                "upgrade": {
                    "term": "act against your will",
                    "type": "phrase",
                    "ordinary": "I’d feel terrified if I started making choices I didn’t really want to make.",
                    "priority": "key",
                    "upgraded": "I’d feel terrified if I started acting against my will without realizing it.",
                    "definition": "To do something you do not really want to do or have not freely chosen to do.",
                    "atlasPrompt": "Can people sometimes act against their will because of pressure from friends, family, or society?"
                },
                "question": "How would you feel if something inside your body could change your decisions without you knowing?"
            },
            {
                "id": "moment-6118cc28-a905-4576-922b-a15971a3db2f",
                "preview": "Everyday influences on behaviour",
                "question": "What outside influences can change the way people behave, even when they believe they are choosing freely?"
            },
            {
                "id": "moment-5d964e4f-ef0e-4972-b5fe-d5b79e600e41",
                "preview": "Useful or harmful habits",
                "upgrade": {
                    "term": "cut both ways",
                    "type": "idiom",
                    "ordinary": "Being very competitive can help you succeed, but it can also create problems with other people.",
                    "priority": "key",
                    "upgraded": "Being very competitive can cut both ways: it can help you succeed, but it can also create problems with other people.",
                    "definition": "To have both positive and negative effects, depending on the situation.",
                    "atlasPrompt": "How can social media cut both ways for someone who wants to stay informed?"
                },
                "question": "Can a behaviour be helpful in one situation but harmful in another? What is a good example?"
            },
            {
                "id": "moment-7c2fb4db-4a49-48f7-974e-b0b965aeadd2",
                "preview": "Survival at a high cost",
                "question": "If the fungus survives by changing the ant’s behaviour, whose survival does this strategy serve—and why is that distinction important?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Design a Fair Survival Trade",
            "prompt": "Imagine a living thing can survive only by giving up some control over its behaviour. Decide what it could give up, what it must keep, and explain why your trade is fair."
        },
        "description": "Start with the fungus’s strange effect on ants, then connect it to familiar experiences of habits, influence, and survival."
    },
    {
        "id": "discussion-set-a90558e1-504c-4cfb-b337-fec1e259c4f5",
        "icon": "closer-look",
        "stage": "Look Closer",
        "title": "Control by Design",
        "moments": [
            {
                "id": "moment-80e5c5d8-3c97-4569-92f4-13be1c5c1aa1",
                "preview": "A precise final destination",
                "question": "Why might guiding an infected ant to one particular place be more effective than changing its behaviour randomly?",
                "followUp": {
                    "id": "a-place-to-die",
                    "kind": "go-deeper",
                    "prompt": "In a study of infected carpenter ants in Thailand, researchers observed ants dying while gripping leaves in a narrow zone with suitable humidity and temperature for fungal development. Imagine you move the dead ants much higher into drier air. What might change for the fungus? State your prediction and one observation that would challenge it."
                },
                "upgrade": {
                    "priority": "key",
                    "term": "favourable conditions",
                    "type": "collocation",
                    "definition": "environmental circumstances that make a particular outcome more likely or successful",
                    "ordinary": "The fungus grows better in a place with the right humidity.",
                    "upgraded": "The fungus is more likely to develop under favourable conditions of temperature and humidity.",
                    "atlasPrompt": "What favourable conditions help you concentrate or learn a new skill?"
                }
            },
            {
                "id": "moment-ca363cb8-5f4b-422d-89b1-920975fe648a",
                "preview": "The fungus’s hidden advantage",
                "upgrade": {
                    "term": "at the expense of",
                    "type": "collocation",
                    "ordinary": "The fungus gains control, but the ant suffers because of it.",
                    "priority": "key",
                    "upgraded": "The fungus secures its own survival at the expense of the ant’s freedom and eventually its life.",
                    "definition": "If something happens at the expense of someone or something, it benefits one side but causes harm or loss to another.",
                    "atlasPrompt": "Can a company increase its profits at the expense of its workers or customers? Give an example."
                },
                "question": "What does the fungus gain when an infected ant dies in a suitable place, and what does the ant lose? Why might this outcome have evolved?"
            },
            {
                "id": "moment-cb591e59-8d35-405a-9dbe-fa20b0e1d7fe",
                "preview": "Behaviour or control?",
                "question": "Where would you draw the line between an organism responding to its environment and another organism controlling it?",
                "upgrade": {
                    "priority": "key",
                    "term": "draw the line between",
                    "type": "phrase",
                    "definition": "to decide where one category ends and another begins",
                    "ordinary": "It can be hard to decide when influence becomes control.",
                    "upgraded": "It can be hard to draw the line between influence and control.",
                    "atlasPrompt": "Where would you draw the line between helpful advice and unwanted pressure?"
                }
            },
            {
                "id": "moment-d7ce4985-96c6-40c4-b7ed-5dca1d2ca010",
                "preview": "Survival versus independence",
                "upgrade": {
                    "term": "serve its own interests",
                    "type": "phrase",
                    "ordinary": "The fungus behaves in a way that helps it survive, even though the ant suffers.",
                    "priority": "key",
                    "upgraded": "The fungus is effectively serving its own interests, not the ant’s.",
                    "definition": "To act mainly to protect or benefit oneself, rather than to help someone else.",
                    "atlasPrompt": "Can you think of a situation where a company or organisation seems to serve its own interests rather than the public’s?"
                },
                "question": "If the fungus survives by taking control of the ant, does evolution reward successful behaviour or individual freedom?"
            },
            {
                "id": "moment-d1d9fc19-9fd2-4b5e-a3e6-dab938849fca",
                "preview": "Different kinds of hosts",
                "question": "Why might a parasite affect one species very precisely but have little effect on another, and what could that reveal about adaptation?",
                "followUp": {
                    "id": "the-universal-zombie-claim",
                    "kind": "another-angle",
                    "prompt": "A headline claims: “This fungus could control ANY insect.” You have evidence of highly specialised ant–fungus relationships, but not of every species. Challenge the headline in clear English and explain what evidence you would need before accepting it."
                },
                "upgrade": {
                    "priority": "key",
                    "term": "species-specific",
                    "type": "adjective",
                    "definition": "limited to or characteristic of one particular species or a narrow group of species",
                    "ordinary": "The fungus may only work on certain kinds of ants.",
                    "upgraded": "The behavioural manipulation appears to be species-specific.",
                    "atlasPrompt": "Why might a species-specific strategy work better than one that affects many animals?"
                }
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Draw the Control Line",
            "prompt": "Create one short rule for deciding whether behaviour is adaptation or control by another organism. Apply your rule to the fungus-ant relationship and explain why it places the case on one side of the line."
        },
        "description": "Examine how precise behavioural control, survival pressures, and competing interests shape the fungus-ant relationship."
    },
    {
        "id": "discussion-set-e45d8560-0336-443a-9ea1-4f1cd278d399",
        "icon": "wider-view",
        "stage": "Wider View",
        "title": "Freedom in a Living World",
        "moments": [
            {
                "id": "moment-e64969eb-0dc2-434b-8107-6e2ad594e686",
                "preview": "Nature without human values",
                "question": "Is it reasonable to call the fungus cruel or controlling, or are those human ideas that do not belong in nature?"
            },
            {
                "id": "moment-54e43f06-46a9-4421-b425-73175dece819",
                "preview": "A difficult scientific choice",
                "upgrade": {
                    "term": "weigh up",
                    "type": "phrasal verb",
                    "ordinary": "Scientists should carefully consider the possible benefits and risks before continuing the research.",
                    "priority": "key",
                    "upgraded": "Scientists need to weigh up the possible benefits against the harm the research could cause.",
                    "definition": "To carefully consider the advantages, disadvantages, and possible consequences before making a decision.",
                    "atlasPrompt": "When choosing a new job, how would you weigh up the advantages and disadvantages?"
                },
                "question": "If studying the fungus could help people understand disease, how much harm to ants or other animals would be acceptable?"
            },
            {
                "id": "moment-3fba2677-d7bb-48c1-90ec-15b17b59e21d",
                "preview": "Who deserves protection?",
                "question": "Should humans try to protect insects from parasites, or should natural processes usually be left alone?"
            },
            {
                "id": "moment-e97b3346-0978-4e3d-bd3c-b08cfdabc46f",
                "preview": "The ant as a warning",
                "upgrade": {
                    "term": "raise questions about",
                    "type": "phrase",
                    "ordinary": "The infected ant makes me think about how much control people really have over their lives.",
                    "priority": "key",
                    "upgraded": "The infected ant raises questions about how much control people really have over their lives.",
                    "definition": "to make people think carefully about an issue or ask what it means",
                    "atlasPrompt": "What recent discovery or event has raised questions about how society should behave?"
                },
                "question": "What human situations, if any, does the zombie ant make you think about, and where does the comparison stop being useful?"
            },
            {
                "id": "moment-440c41cf-8bb9-4e43-8e0a-e59ac4cbcb64",
                "preview": "Freedom in a connected world",
                "question": "Can any living creature be completely independent, or are all organisms shaped by other living things and their environment?"
            }
        ],
        "makeItReal": {
            "label": "Make It Real",
            "title": "Advise the Research Team",
            "prompt": "Imagine a research team asks for your recommendation about studying the fungus. Decide whether they should go ahead, and give one condition or limit that would make their work responsible."
        },
        "description": "Use the infected ant to explore responsibility, autonomy, scientific curiosity, and humanity’s place among other living systems."
    }
];

const clCards = [
    {
        "id": "cultural-lens-card-0636a0dd-69d8-4038-aa9c-aded4d8dc2bc",
        "title": "What Makes a Zombie?",
        "teaser": "The word “zombie” carries a very different meaning in Haiti from the one found in films and video games.",
        "context": "In Haitian Vodou and Haitian storytelling, a zonbi is often understood as a person whose will or life has been taken away, rather than simply a violent, walking corpse. Later popular culture transformed the idea into the familiar movie zombie, usually linked to infection and physical danger. The fungus gives the word a striking biological connection, but the older idea also raises a human question: is losing control about the body, the mind, or both?",
        "contextLine": "Haiti and popular culture",
        "followTheThread": [
            "Can a person still be responsible for an action if another force has strongly shaped their behaviour?",
            "How do films and stories change the way we understand real scientific discoveries?"
        ],
        "mainQuestion": "When you compare the zombie ant with different ideas of a zombie, which seems more disturbing: losing control of your body or losing control of your choices? Why?"
    },
    {
        "id": "cultural-lens-card-92240009-4b13-4823-9ad3-8beeb4adf5a1",
        "title": "The Colony Has a Mind",
        "teaser": "An ant may seem like an independent creature, but its colony can behave more like one larger living system.",
        "context": "Biologists sometimes describe an ant colony as a “superorganism” because many individuals coordinate through simple signals, including chemical trails. Together, they can find routes, collect food and defend their nest without a single leader directing every step. This is different from the fungus redirecting an ant’s behaviour for the parasite’s reproductive benefit.",
        "contextLine": "Ant societies and the superorganism idea",
        "followTheThread": [
            "Can human groups also behave like superorganisms, or are people too independent for that comparison?",
            "When does cooperation become a form of control?"
        ],
        "mainQuestion": "Which seems more powerful: an individual ant’s freedom or the needs of the colony, and why?"
    },
    {
        "id": "cultural-lens-card-a26becf3-21f2-4597-9347-f644a3d14374",
        "title": "A Different Kind of Puppet",
        "teaser": "Another parasite can guide an animal’s actions without completely taking over its body.",
        "context": "The emerald jewel wasp stings a cockroach and uses venom that changes the cockroach’s motivation rather than simply paralysing it. The cockroach can still walk, but it follows the wasp to a suitable place, where the wasp lays an egg on it. Compared with the zombie ant fungus, this suggests that biological control can work through changing desire and movement, not only through direct physical force.",
        "upgrade": {
            "term": "blur the line between",
            "type": "collocation",
            "ordinary": "The wasp makes the difference between choice and control less clear.",
            "priority": "key",
            "upgraded": "The wasp blurs the line between choice and control.",
            "definition": "To make the difference between two things less clear.",
            "atlasPrompt": "Can advertising or social pressure blur the line between a personal choice and outside influence?"
        },
        "contextLine": "Emerald jewel wasps and cockroaches",
        "followTheThread": [
            "Which seems more astonishing to you: the fungus changing an ant’s behaviour from inside its body, or the wasp changing a cockroach’s motivation with a sting?",
            "Can humans also be influenced in ways that feel like our own choices, such as by advertising, habits, or social pressure?"
        ],
        "mainQuestion": "Does changing an animal’s motivation count as controlling it, even if the animal can still move by itself?"
    },
    {
        "id": "cultural-lens-card-82999945-3aea-4da8-bfe0-15ab00b1b361",
        "title": "The Parasite’s Extended Body",
        "teaser": "Sometimes an organism’s influence reaches beyond its own body and into another creature’s behaviour.",
        "context": "Biologist Richard Dawkins used the idea of the “extended phenotype” to describe how genes can affect the world outside an organism’s body, such as when a beaver builds a dam. The zombie ant fungus offers a more dramatic example: its genes help produce changes in the ant’s movement and final location, because the fungus benefits from controlling its host. This view shifts attention from the ant as an individual to the larger life cycle connecting parasite, host, and environment.",
        "contextLine": "Evolutionary biology and the extended phenotype",
        "followTheThread": [
            "Are humans also influenced by organisms, systems, or technologies in ways we do not fully notice?",
            "Does losing control require conscious choice first, or can an organism lose freedom even if it has no idea what is happening?"
        ],
        "mainQuestion": "Does the fungus truly control the ant, or is it more accurate to say that evolution has made the ant part of the fungus’s life cycle? Why?"
    },
    {
        "id": "cultural-lens-card-08039607-bf51-49f7-bbef-989d47eba5b1",
        "title": "Under Someone Else’s Influence",
        "teaser": "When hypnosis became a public spectacle in the nineteenth century, people argued about whether a person could be made to act against their will.",
        "context": "In Victorian Europe, demonstrations of hypnosis attracted large audiences and created intense debate about control and responsibility. Some people believed a hypnotised person could be forced to do almost anything, while others argued that people still retained limits and personal judgement. The debate offers a human comparison with the fungus: changing behaviour is not necessarily the same as completely removing agency.",
        "upgrade": {
            "term": "retain a degree of control",
            "type": "collocation",
            "ordinary": "Even when people are influenced by others, they may still have some control over their actions.",
            "priority": "key",
            "upgraded": "Even when people are strongly influenced by others, they may retain a degree of control over their actions.",
            "definition": "to continue to have some power to decide what happens or what you do",
            "atlasPrompt": "In what situations should people retain a degree of control over decisions made by their employer or family?"
        },
        "contextLine": "Victorian Europe and the rise of hypnosis",
        "followTheThread": [
            "Do you think responsibility should depend more on a person’s intentions, their actions, or how much control they had?",
            "Can influence ever be helpful without becoming a form of control?"
        ],
        "mainQuestion": "If an outside force changes an ant’s behaviour, or influences a person’s actions, when should we say that freedom has been lost?"
    },
    {
        "id": "cultural-lens-card-9ccdad37-6480-4a6e-b921-5522448a29f2",
        "title": "The Fungus People Search For",
        "teaser": "Not every remarkable fungus is feared as a parasite; one insect-infecting fungus has become a prized source of income and medicine.",
        "context": "In Tibet and nearby Himalayan regions, yartsa gunbu is a fungus that infects and eventually grows from ghost moth larvae underground. It has long been used in traditional medicine and is also an important source of income for many people who collect it. The same broad relationship between fungus and insect can therefore be viewed as frightening, useful, or economically valuable, depending on whose perspective we take.",
        "contextLine": "The Tibetan Plateau and yartsa gunbu",
        "followTheThread": [
            "Would you personally be more interested in, or more afraid of, a fungus if it had an important use for humans?",
            "What other examples can you think of where people depend on something in nature that may also be harmful or destructive?"
        ],
        "mainQuestion": "Does turning a parasitic organism into a valuable resource change how we should think about it?"
    }
];
