/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  How Octopuses Change Colour
  ---------------------------------------------------------------------------
  A visually curious speaking subject about camouflage, signalling,
  perception, animal intelligence, and the strange ways octopuses
  change their bodies to respond to the world around them. Built for
  tutor-led conversation, shared-screen teaching, and scientific curiosity.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `octopuses-change-colour`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `How Octopuses Change Colour`,
    titleHtml: `How Octopuses <em>Change Colour</em>`,
    navTitle: `Octopuses`,
    bgImage: `https://www.telegraph.co.uk/content/dam/news/2021/03/25/TELEMMGLPICT000120700160_trans_NvBQzQNjv4BqZgEkZX3M936N5BQK4Va8RWtT0gK_6EfZT336f62EI5U.jpeg?imwidth=640`
};

const subjectCopy = {
    cover: {
        hook: `A master of disguise beneath the waves`
    },
    overview: {
        heading: `A World of Signals`,
        intro: [
            `Imagine being able to change your appearance whenever you felt threatened, curious, or ready to communicate. An octopus does something like this in seconds, using its body to respond to the world around it.`
        ],
        question: `If you could change your appearance instantly for one situation, when would you use this ability?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore how animals use appearance and behaviour to respond, communicate, and survive in their surroundings.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `Explore how different places and times have shaped the way people observe, interpret, and talk about octopuses.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Connect the subject to your own ideas about intelligence, communication, and the way humans respond to other living creatures.`
    },
    culturalLens: {
        heading: `Many Ways to Read the Sea`,
        intro: `Look at how people in different places and periods have understood octopuses, their changing bodies, and the signals they may send. This path connects ideas about camouflage, intelligence, and survival with local knowledge, stories, and relationships with the sea.`
    },
    discussion: {
        heading: `Reading the Living World`,
        intro: `An octopus’s changing appearance can be a way to hide, send a message, or respond to danger. This opens up questions about how animals sense their surroundings, how we interpret signals, and what intelligence can look like in very different creatures.`
    },
    reflection: {
        title: `Seeing Intelligence Differently`,
        summary: `Octopuses show that communication, protection, and intelligence can take forms very different from our own. Their changing appearance also invites us to question how confidently we interpret animals and how we value them in different contexts.`,
        questions: [
            `How has thinking about an octopus’s changing appearance affected your ideas about animal intelligence or communication?`,
            `What might you now do or notice differently when you see an animal hiding, changing its behaviour, or giving a warning signal?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-animal-signals`,
        title: `Animal Signals`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Start with familiar reactions to colour, camouflage, and the surprising ways animals communicate.`,
        moments: [
            {
                id: `moment-a-sudden-change`,
                preview: `A sudden change`,
                question: `What animal has surprised you with its colours, patterns, or appearance? What happened?`,
                upgrade: {
                    term: `catch someone off guard`,
                    type: `idiom`,
                    definition: `to surprise someone so that they are not ready for what happens`,
                    ordinary: `The animal’s sudden change in appearance really surprised me.`,
                    upgraded: `The animal’s sudden change in appearance caught me off guard.`,
                    priority: `key`,
                    atlasPrompt: `When has someone’s unexpected reaction caught you off guard?`
                }
            },
            {
                id: `moment-built-to-disappear`,
                preview: `Built to disappear`,
                question: `Which animals do you think are especially good at hiding, and where might they hide?`,
                upgrade: {
                    term: `blend into`,
                    type: `phrasal verb`,
                    definition: `to look so similar to your surroundings that it is difficult to notice you`,
                    ordinary: `Some insects are difficult to see because they look like the leaves around them.`,
                    upgraded: `Some insects can blend into their surroundings so well that predators may not notice them.`,
                    priority: `key`,
                    atlasPrompt: `When might a person or object need to blend into its surroundings in everyday life?`
                }
            },
            {
                id: `moment-colour-with-a-purpose`,
                preview: `Colour with a purpose`,
                question: `What might an octopus gain by changing its colour or pattern?`,
                upgrade: {
                    term: `send a signal`,
                    type: `collocation`,
                    definition: `To communicate a message or feeling without using words, often through behaviour, colour, or movement.`,
                    ordinary: `An octopus might use its colours to show another animal that it feels threatened.`,
                    upgraded: `An octopus might change its colours to send a signal that it feels threatened.`,
                    priority: `key`,
                    atlasPrompt: `How can people send a signal that they are interested, worried, or uncomfortable without saying anything?`
                }
            },
            {
                id: `moment-signals-we-miss`,
                preview: `Signals we miss`,
                question: `How do animals you know show that they are scared, angry, relaxed, or ready to attack?`,
                upgrade: {
                    term: `show signs of`,
                    type: `collocation`,
                    definition: `to display small clues that suggest a particular feeling, condition, or behaviour`,
                    ordinary: `A dog may look frightened when it hears a sudden loud noise.`,
                    upgraded: `A dog may show signs of fear when it hears a sudden loud noise.`,
                    priority: `key`,
                    atlasPrompt: `What signs might someone show when they are feeling stressed at work?`
                }
            },
            {
                id: `moment-change-in-seconds`,
                preview: `Change in seconds`,
                question: `If you could change your appearance instantly, when would you use that ability?`,
                upgrade: {
                    term: `draw attention to yourself`,
                    type: `collocation`,
                    definition: `To make people notice you, especially by your appearance or behaviour.`,
                    ordinary: `I would wear something bright if I wanted people to notice me at a party.`,
                    upgraded: `I’d change my appearance to draw attention to myself if I wanted to be noticed in a crowded place.`,
                    priority: `key`,
                    atlasPrompt: `When might you deliberately draw attention to yourself in everyday life?`
                }
            }
        ],
        makeItReal: {
            title: `Build an Octopus Signal Code`,
            prompt: `Imagine you are an octopus living near people. Create three appearance changes to communicate different messages—such as “I’m scared,” “stay away,” or “I’m relaxed”—and explain what each signal means.`
        }
    },
    {
        id: `set-signals-beneath-the-surface`,
        title: `Signals Beneath the Surface`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Look more closely at why octopuses change appearance and how difficult animal signals can be to interpret.`,
        moments: [
            {
                id: `moment-one-change-two-jobs`,
                preview: `One change, two jobs`,
                question: `How could an octopus’s sudden change in colour help it hide and communicate at the same time?`,
                upgrade: {
                    term: `serve a dual purpose`,
                    type: `phrase`,
                    definition: `to have two useful or important functions at the same time`,
                    ordinary: `The colour change can help the octopus hide and communicate at the same time.`,
                    upgraded: `The sudden colour change can serve a dual purpose: it can hide the octopus while also communicating a warning.`,
                    priority: `key`,
                    atlasPrompt: `What is something in everyday life that serves a dual purpose?`
                }
            },
            {
                id: `moment-camouflage-depends-on-place`,
                preview: `Camouflage depends on place`,
                question: `What might make camouflage successful in one environment but useless in another?`,
                upgrade: {
                    term: `lose its effectiveness`,
                    type: `collocation`,
                    definition: `To stop working as well as it did before.`,
                    ordinary: `A colour pattern may work well on the sea floor but fail among bright coral.`,
                    upgraded: `A colour pattern may lose its effectiveness when an octopus moves from the sea floor to bright coral.`,
                    priority: `key`,
                    atlasPrompt: `When might a familiar safety measure lose its effectiveness in a different situation?`
                }
            },
            {
                id: `moment-when-camouflage-backfires`,
                preview: `When camouflage backfires`,
                question: `When might changing colour or texture attract attention instead of preventing danger?`,
                upgrade: {
                    term: `backfire`,
                    type: `verb`,
                    definition: `To have the opposite result from the one you intended, often making a situation worse.`,
                    ordinary: `A warning display might accidentally make the animal easier to notice.`,
                    upgraded: `A warning display might backfire by making the animal easier to notice.`,
                    priority: `key`,
                    atlasPrompt: `Can you describe a time when an attempt to solve a problem backfired?`
                }
            },
            {
                id: `moment-choice-or-reflex`,
                preview: `Choice or reflex?`,
                question: `How could we tell whether an octopus is choosing a signal deliberately or simply reacting automatically?`,
                upgrade: {
                    term: `read the situation`,
                    type: `phrase`,
                    definition: `to understand what is happening and respond appropriately to it`,
                    ordinary: `We need to understand what is happening before deciding whether the octopus is communicating or just reacting.`,
                    upgraded: `We need to read the situation carefully before deciding whether the octopus is communicating deliberately or just reacting automatically.`,
                    priority: `key`,
                    atlasPrompt: `When might you need to read the situation carefully before responding in a conversation or social situation?`
                },
                followUp: {
                    id: `choice-or-reflex`,
                    kind: `another-angle`,
                    prompt: `If the colour change turned out to be mostly automatic, would that make the octopus seem less intelligent—or would intelligence be the wrong question?`
                }
            },
            {
                id: `moment-what-counts-as-intelligence`,
                preview: `What counts as intelligence?`,
                question: `Which seems more intelligent to you: solving a problem, communicating with others, or changing behaviour quickly? Why?`,
                upgrade: {
                    term: `adapt to`,
                    type: `phrasal verb`,
                    definition: `to change your behaviour or approach so you can deal successfully with a new situation`,
                    ordinary: `The animal can change its behaviour when its surroundings change.`,
                    upgraded: `The animal can adapt to changing surroundings almost immediately.`,
                    priority: `key`,
                    atlasPrompt: `How do people adapt to a new workplace or social environment?`
                }
            }
        ],
        makeItReal: {
            title: `Choose the Safer Change`,
            prompt: `Imagine an octopus notices a possible threat in an unfamiliar environment. Decide whether it should hide, communicate, change its texture, or do nothing, then explain your choice and one possible risk of that response.`
        }
    },
    {
        id: `set-beyond-human-intelligence`,
        title: `Beyond Human Intelligence`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Consider what octopuses can teach us about intelligence, communication, and our relationship with other living creatures.`,
        moments: [
            {
                id: `moment-intelligence-without-us`,
                preview: `Intelligence without us`,
                question: `If an octopus can solve problems without living in a group, how might that change your idea of intelligence?`,
                upgrade: {
                    term: `challenge the assumption that`,
                    type: `phrase`,
                    definition: `make someone question a belief that people usually accept as true`,
                    ordinary: `Octopuses make me question the belief that intelligent animals need to live in groups.`,
                    upgraded: `Octopuses challenge the assumption that intelligent animals need to live in groups.`,
                    priority: `key`,
                    atlasPrompt: `What experience or example from education or work has challenged the assumption that people learn best in the same way?`
                }
            },
            {
                id: `moment-a-different-sensory-world`,
                preview: `A different sensory world`,
                question: `How could an octopus’s way of sensing its surroundings lead to decisions that humans would not understand?`,
                upgrade: {
                    term: `a different frame of reference`,
                    type: `phrase`,
                    definition: `a different set of experiences or ways of understanding the world`,
                    ordinary: `We may not understand the octopus’s decision because it experiences the world differently.`,
                    upgraded: `We may not understand the octopus’s decision because it operates from a different frame of reference.`,
                    priority: `key`,
                    atlasPrompt: `When might two people have a different frame of reference in a disagreement?`
                }
            },
            {
                id: `moment-the-aquarium-question`,
                preview: `The aquarium question`,
                question: `What should aquariums consider before keeping highly intelligent animals such as octopuses?`,
                upgrade: {
                    term: `have a duty of care`,
                    type: `phrase`,
                    definition: `To have a responsibility to protect someone or something’s health, safety, and wellbeing.`,
                    ordinary: `Aquariums should be responsible for the physical and mental wellbeing of octopuses in their care.`,
                    upgraded: `Aquariums have a duty of care towards highly intelligent animals such as octopuses.`,
                    priority: `key`,
                    atlasPrompt: `When do schools or employers have a duty of care towards the people they work with?`
                },
                followUp: {
                    id: `evidence-before-captivity`,
                    kind: `go-deeper`,
                    prompt: `What evidence would you need before deciding that an aquarium can genuinely meet an octopus’s needs?`
                }
            },
            {
                id: `moment-seeing-animals-through-ourselves`,
                preview: `Seeing animals through ourselves`,
                question: `When can comparing animals with humans help us understand them, and when can it mislead us?`,
                upgrade: {
                    term: `project human ideas onto`,
                    type: `phrase`,
                    definition: `to interpret an animal’s behaviour using human feelings, thoughts, or intentions`,
                    ordinary: `We may judge an animal’s behaviour by human standards and misunderstand it.`,
                    upgraded: `We may project human ideas onto animals and misunderstand what their behaviour really means.`,
                    priority: `key`,
                    atlasPrompt: `When might people project human ideas onto technology or artificial intelligence?`
                }
            },
            {
                id: `moment-what-discovery-should-change`,
                preview: `What discovery should change`,
                question: `Should discoveries about animal intelligence affect the way humans protect oceans and other habitats? Why?`,
                upgrade: {
                    term: `rethink our approach to`,
                    type: `phrase`,
                    definition: `to consider again how we deal with or solve something, usually because new information has changed our view`,
                    ordinary: `New research may change how we manage forests and protect wildlife.`,
                    upgraded: `New research about animal intelligence may make us rethink our approach to protecting marine habitats.`,
                    priority: `key`,
                    atlasPrompt: `Has new information ever made you rethink your approach to a personal, social, or environmental issue?`
                }
            }
        ],
        makeItReal: {
            title: `Make the Keeper’s Recommendation`,
            prompt: `Imagine an aquarium is deciding whether to keep an octopus. Give the keeper one clear recommendation, including one condition that would make the decision more respectful, and defend it with two reasons.`
        }
    }
];

const clCards = [
    {
        id: `cl-hidden-reef-village-street`,
        contextLine: `Greek coastal life`,
        title: `From Hidden Reef to Village Street`,
        teaser: `An octopus can disappear among rocks underwater and become a familiar sight hanging outside a seaside home.`,
        context: `In many Greek coastal communities, octopus has long been part of everyday seafood culture and is often hung outdoors to dry before cooking. Catching one can require careful observation because it may blend into rocks, change its pattern, or hide in a small space. This creates an interesting contrast between the animal’s remarkable ability to remain unseen in the sea and its visible place in village life afterward.`,
        mainQuestion: `How might seeing octopuses both as highly intelligent animals and as traditional food change the way people think about them?`,
        upgrade: {
            term: `strike a balance between`,
            type: `phrase`,
            definition: `to find a fair and practical middle point between two different needs or priorities`,
            ordinary: `People may need to find a balance between respecting tradition and caring about animals.`,
            upgraded: `People may need to strike a balance between respecting tradition and caring about animals.`,
            priority: `key`,
            atlasPrompt: `How might a town strike a balance between attracting tourists and protecting its local environment?`
        }
    },
    {
        id: `cl-stranger-seabed`,
        contextLine: `Indo-Pacific reefs`,
        title: `A Stranger on the Seabed`,
        teaser: `In Indonesian waters, one octopus can seem to become several different animals without leaving the ocean floor.`,
        context: `The mimic octopus, found in parts of the Indo-Pacific, changes its colour, shape, and movement to resemble animals such as lionfish, flatfish, and sea snakes. Divers may see the same creature appear to take on very different identities as it moves across the sand. Its behaviour raises an interesting question about whether camouflage is only about hiding—or also about creating a convincing message.`,
        mainQuestion: `Does mimicry seem more like hiding, communication, or deception to you—and what would change your answer?`,
        upgrade: {
            term: `give off the impression of`,
            type: `phrase`,
            definition: `to make people think that you have a particular quality or identity`,
            ordinary: `Its appearance might make people think it is dangerous.`,
            upgraded: `By copying a dangerous animal, it gives off the impression of being dangerous.`,
            priority: `key`,
            atlasPrompt: `What impression might you give off when you meet someone for the first time?`
        }
    },
    {
        id: `cl-blue-ringed-warning`,
        contextLine: `Australian tidal pools`,
        title: `The Blue-Ringed Warning`,
        teaser: `A tiny octopus can turn its hidden blue rings into a powerful warning when it feels threatened.`,
        context: `The blue-ringed octopus usually looks small and quiet, but bright blue rings can appear across its body when it is disturbed. In coastal Australia, this striking display is a reminder that colour can be more than camouflage: it can communicate danger. People exploring rock pools must learn that a beautiful pattern may be a serious warning rather than an invitation to look more closely.`,
        mainQuestion: `How might seeing a sudden warning colour change your behaviour, and can you think of other animals or situations where appearance communicates danger?`,
        upgrade: {
            term: `be a red flag`,
            type: `idiom`,
            definition: `To be a clear sign that something may be dangerous, problematic, or unsuitable.`,
            ordinary: `The bright rings should tell people not to get too close.`,
            upgraded: `The bright rings are a red flag for anyone getting too close.`,
            priority: `key`,
            atlasPrompt: `What behaviour in a new friendship or work situation would be a red flag for you?`
        }
    },
    {
        id: `cl-takoyaki-living-signal`,
        contextLine: `Japanese food culture and the sea`,
        title: `From Takoyaki to Living Signal`,
        teaser: `A familiar food can look very different when people see the living animal behind it.`,
        context: `In Japan, octopus is a familiar ingredient in dishes such as takoyaki, but a living octopus can rapidly change its colour, pattern, and skin texture. This contrast invites us to think about how food traditions and marine science can give people very different images of the same animal. One view focuses on taste; another notices a highly responsive creature communicating with its surroundings.`,
        mainQuestion: `How might your opinion of octopuses change if you regularly ate them but then watched one alter its appearance to hide or react to danger?`,
        upgrade: {
            term: `see something in a different light`,
            type: `idiom`,
            definition: `To understand or think about something differently after learning more about it.`,
            ordinary: `Learning more about the animal changed the way I thought about it.`,
            upgraded: `Seeing the living animal made me see octopuses in a different light.`,
            priority: `key`,
            atlasPrompt: `When have you seen a familiar person, place, or tradition in a different light after learning something new about it?`
        }
    },
    {
        id: `cl-creature-refuses-one-shape`,
        contextLine: `Minoan Crete, around 1500 BCE`,
        title: `A Creature That Refuses One Shape`,
        teaser: `Ancient Aegean artists gave octopuses an important place in their designs—perhaps because the animal seemed to belong everywhere and nowhere at once.`,
        context: `Octopuses appear often on pottery from Minoan Crete, with their arms spreading across the surface of a vessel. These images show how closely people in the ancient Aegean observed marine life, even before scientists explained camouflage or skin texture. Today, an octopus changing colour can make those old images feel surprisingly modern: the animal is not just a fixed shape, but a moving pattern.`,
        mainQuestion: `Does seeing an octopus as a changing pattern, rather than a fixed animal, affect the way you understand its intelligence or beauty?`,
        upgrade: {
            term: `blur the line between`,
            type: `phrase`,
            definition: `to make the difference between two things less clear`,
            ordinary: `The octopus makes it difficult to separate a real animal from a moving design.`,
            upgraded: `The octopus blurs the line between a real animal and a moving design.`,
            priority: `key`,
            atlasPrompt: `When can technology blur the line between being helpful and being intrusive?`
        }
    },
    {
        id: `cl-reading-living-display`,
        contextLine: `Modern marine biology`,
        title: `Reading a Living Display`,
        teaser: `Scientists do not read an octopus’s colour like a simple code; they study the whole moving pattern and the situation around it.`,
        context: `Marine biologists often describe an octopus’s appearance through several features at once, including colour, lines, spots, body posture, and skin texture. The same darkening or flash of colour can mean different things depending on whether the animal is hiding, hunting, meeting another octopus, or reacting to danger. This reminds us that communication is not always a fixed set of signals with one clear meaning.`,
        mainQuestion: `Would simple, fixed signals make an octopus easier to understand, and what might we miss by treating its displays like a code with one meaning?`,
        upgrade: {
            term: `be open to interpretation`,
            type: `phrase`,
            definition: `To have a meaning that is not completely clear and can be understood in different ways.`,
            ordinary: `The same gesture can mean different things to different people.`,
            upgraded: `A person's tone of voice can be open to interpretation, especially in a short message.`,
            priority: `key`,
            atlasPrompt: `How can you make a work email less open to interpretation?`
        }
    },
    {
        id: `cl-octopus-political-cartoon`,
        contextLine: `United States, early 20th century`,
        title: `The Octopus as a Political Cartoon`,
        teaser: `An animal famous for changing shape became a powerful image of hidden control and expanding power.`,
        context: `In American political cartoons, the octopus was often used as a symbol for a company or institution that seemed to reach into many areas of life. A famous 1904 cartoon showed Standard Oil as a giant octopus stretching its tentacles towards government and industry. The image reflects a human response to the animal’s flexible, many-armed body: people can see it as clever and adaptive, but also as mysterious or threatening.`,
        mainQuestion: `Does the octopus make a convincing symbol for hidden influence and control, or does this image misunderstand the real animal?`,
        upgrade: {
            term: `wield influence`,
            type: `collocation`,
            definition: `To use your power or influence effectively to affect people or events.`,
            ordinary: `The cartoon suggests that one organisation can strongly affect many parts of society.`,
            upgraded: `The cartoon suggests that one organisation can wield influence across many parts of society.`,
            priority: `key`,
            atlasPrompt: `Who can wield influence in your community, even without having an official position?`
        }
    },
    {
        id: `cl-learning-see-seabed`,
        contextLine: `Jeju haenyeo, South Korea`,
        title: `Learning to See the Seabed`,
        teaser: `For Jeju’s women divers, finding an octopus depends on noticing small changes in colour, shape, and movement underwater.`,
        context: `Haenyeo, the traditional women divers of Jeju, have gathered seafood such as shellfish and octopuses without modern breathing equipment. Their work depends on close observation: an octopus may be difficult to see because its skin matches the rocks, sand, or seaweed around it. This shows that camouflage is not only a trick performed by the animal; it also changes what human observers must learn to notice.`,
        mainQuestion: `Would you enjoy learning to read the seabed in this way, or would the hidden animals make the work too difficult? Why?`,
        upgrade: {
            term: `pick up on`,
            type: `phrasal verb`,
            definition: `to notice and understand a small detail, change, or signal`,
            ordinary: `Experienced divers can notice small changes in colour and movement.`,
            upgraded: `Experienced divers can pick up on small changes in colour and movement.`,
            priority: `key`,
            atlasPrompt: `What small changes do you need to pick up on when you are meeting someone for the first time?`
        }
    },
    {
        id: `cl-law-notices-mind`,
        contextLine: `United Kingdom, 2022`,
        title: `When the Law Notices a Mind`,
        teaser: `A change in British animal-welfare policy asked society to take an octopus’s inner experience seriously.`,
        context: `In 2022, the United Kingdom’s Animal Welfare (Sentience) Act recognised cephalopod molluscs, including octopuses, as sentient animals. This does not mean that an octopus thinks like a human, but it reflects evidence that these animals can experience pain and respond flexibly to their surroundings. Their changing bodies are therefore not only a scientific curiosity; they also raise questions about how humans should treat intelligent sea life.`,
        mainQuestion: `If an animal can sense, learn, and react to danger in complex ways, how should that influence the way people use or protect it?`,
        upgrade: {
            term: `weigh up`,
            type: `phrasal verb`,
            definition: `To carefully consider the advantages, disadvantages, or importance of different factors before making a decision.`,
            ordinary: `Before deciding how animals should be protected, people should carefully consider their ability to feel pain and the choices humans want to make.`,
            upgraded: `Before deciding how animals should be protected, people should weigh up their ability to feel pain against the choices humans want to make.`,
            priority: `key`,
            atlasPrompt: `What factors do you weigh up when deciding whether to accept a new job or opportunity?`
        }
    }
];
