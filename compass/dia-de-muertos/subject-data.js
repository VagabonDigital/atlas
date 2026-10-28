/*
 * ATLAS · COMPASS ORIGINAL
 * Día de Muertos: When the Dead Come Home
 * Editorially adapted from a tutor-created subject; no account or learner data.
 * Cover image: National Park Service (NPS Photo), public domain; Day of the Dead ofrenda at Mission Marquee Plaza, Texas; via Wikimedia Commons. Source: https://commons.wikimedia.org/wiki/File:Ofrenda_or_Day_of_the_Dead_Altar_at_Mission_Marquee_Plaza._(586908b4-40dd-4be5-bc53-ababb89291f1).JPG
 */

const MODULE = {
  "id": "dia-de-muertos",
  "schemaVersion": 2,
  "contentVersion": "1.0.0",
  "title": "Día de Muertos: When the Dead Come Home",
  "titleHtml": "Día de Muertos: When the Dead Come Home",
  "navTitle": "Día de Muertos: When the Dead Come Home",
  "bgImage": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Ofrenda_or_Day_of_the_Dead_Altar_at_Mission_Marquee_Plaza._%28586908b4-40dd-4be5-bc53-ababb89291f1%29.JPG/1280px-Ofrenda_or_Day_of_the_Dead_Altar_at_Mission_Marquee_Plaza._%28586908b4-40dd-4be5-bc53-ababb89291f1%29.JPG",
  "catalogDescription": "Día de Muertos brings remembrance into the home through candles, photographs, food, music and humour, opening conversations about family memory, cultural identity, celebration and respectful change."
};

const subjectCopy = {
  "cover": {
    "hook": "When memory sets an extra place."
  },
  "paths": {
    "discussionTitle": "Discussion",
    "reflectionTitle": "Reflection",
    "culturalLensTitle": "Cultural Lens",
    "discussionDescription": "Explore how people remember, celebrate and carry the presence of the dead into everyday life.",
    "reflectionDescription": "Reflect on how remembrance traditions shape what we value, how we connect with others and what we choose to carry forward.",
    "culturalLensDescription": "Explore how different communities and generations remember the dead, and how intimate traditions change when they enter public life."
  },
  "overview": {
    "intro": [
      "A trail of marigold petals leads to a doorway. Inside, candles flicker beside photographs, and someone's favourite food has been carefully prepared. The guest died years ago. Yet in many Día de Muertos traditions, families welcome departed loved ones back through offerings, stories, music and sometimes laughter. The customs vary across Mexico, but the invitation is extraordinary: what if remembrance felt like welcoming someone home?"
    ],
    "heading": "A Welcome in Candlelight",
    "question": "A family prepares dinner for someone who died twenty years ago. Is the meal really for the dead, the living, or both?"
  },
  "discussion": {
    "intro": "A yearly welcome can turn memory into something active: preparing a favourite dish, telling the same family story, laughing at a familiar joke, or visiting a meaningful place. This opens questions about how people keep loved ones present, how traditions change, and where celebration ends and respect begins.",
    "heading": "More Than a Goodbye"
  },
  "reflection": {
    "title": "What We Carry Forward",
    "summary": "Día de Muertos shows how memory can become an active welcome through food, stories, humour and shared places. It also invites us to consider how traditions can change, travel and become public while still keeping their meaning and respect.",
    "questions": [
      "After exploring these traditions, how do you now see the balance between private grief, joyful celebration and public cultural expression?",
      "What tradition, object or small action would you like to use—or adapt—in the future to keep an important person, place or story present?"
    ]
  },
  "keyLanguage": {
    "intro": "Useful language from this subject."
  },
  "culturalLens": {
    "intro": "Look at how Día de Muertos changes across Mexican regions, families and generations, from private acts of remembrance to lively public gatherings. Then compare these practices with other ways people welcome, honour or continue conversations with the dead, while considering the line between meaningful change and commercialised display.",
    "heading": "Many Ways to Keep Memory Alive"
  }
};

const discussionSets = [
  {
    "id": "discussion-set-ce4a999a-0f47-47fa-8213-32f500477fdc",
    "icon": "first-look",
    "stage": "First Look",
    "title": "The Return",
    "moments": [
      {
        "id": "moment-5f78c34a-30ba-45e9-b55a-acfc4ac3b93c",
        "preview": "Dinner for a guest who cannot arrive",
        "upgrade": {
          "term": "make someone feel at home",
          "type": "phrase",
          "ordinary": "I would prepare the room carefully so my guest felt comfortable and welcome.",
          "priority": "standard",
          "upgraded": "I would light candles and play their favourite music to make them feel at home.",
          "definition": "To make someone feel comfortable, welcome, and relaxed in a place.",
          "atlasPrompt": "How could you make a new colleague feel at home during their first week at work?"
        },
        "question": "A family sets a place at an ofrenda for a relative who died years ago. What could make that gesture feel like hospitality rather than simply a memorial?"
      },
      {
        "id": "moment-f5fd2bea-1725-4d04-b3e0-132bd46efefd",
        "preview": "The dish nobody will eat",
        "upgrade": {
          "term": "a taste of home",
          "type": "phrase",
          "ordinary": "Whenever I eat my grandmother’s soup, I think of my childhood and family.",
          "priority": "standard",
          "upgraded": "Whenever I eat my grandmother’s soup, it gives me a taste of home.",
          "definition": "Something that gives you the comforting feeling of being in your home or familiar culture.",
          "atlasPrompt": "What could give someone a taste of home after moving to another country?"
        },
        "question": "A family's ofrenda includes a favourite dish and a glass of water. Why might preparing food preserve someone's story more vividly than displaying a photograph?"
      },
      {
        "id": "moment-e54a5b1e-e9e7-443d-bfe7-e13ac9f2382b",
        "preview": "When laughter enters the room",
        "upgrade": {
          "term": "keep someone's memory alive",
          "type": "phrase",
          "ordinary": "Playing his favourite songs helps us remember him and feel that he is still part of the family.",
          "priority": "key",
          "upgraded": "Playing his favourite songs helps us keep his memory alive and feel that he is still part of the family.",
          "definition": "to continue remembering and talking about someone so they remain important in people's lives",
          "atlasPrompt": "How can a community keep the memory of an important local person alive?"
        },
        "question": "At a remembrance gathering, someone tells an old joke and the whole family laughs. Can laughter be as respectful as silence? Why?"
      },
      {
        "id": "moment-6d7d62f7-e986-4ee9-a0d1-605434603b3a",
        "preview": "A cemetery glowing after dark",
        "upgrade": {
          "term": "bring back memories",
          "type": "phrase",
          "ordinary": "That garden reminds me of my grandmother and the summers we spent there.",
          "priority": "standard",
          "upgraded": "That garden brings back so many memories of my grandmother and the summers we spent there.",
          "definition": "To make you remember a person, time, or experience from the past.",
          "atlasPrompt": "What smell, song, or object brings back memories for you?"
        },
        "question": "Imagine visiting a cemetery filled with candles, flowers and conversation. Would the atmosphere feel comforting, unsettling or both—and why?"
      },
      {
        "id": "moment-4cf2bbee-60a7-4af0-aae1-5cbdca22ae05",
        "preview": "A tradition far from home",
        "upgrade": {
          "term": "put your own spin on",
          "type": "phrase",
          "ordinary": "I would keep the tradition but add a few personal ideas to it.",
          "priority": "key",
          "upgraded": "I would keep the tradition but put my own spin on it by adding music and stories from my generation.",
          "definition": "To change something in a personal or creative way while keeping its basic idea.",
          "atlasPrompt": "What is a familiar meal, celebration, or activity that you would like to put your own spin on?"
        },
        "question": "A family moves abroad and cannot find the flowers or ingredients they usually use for Día de Muertos. How might they adapt the celebration without losing its meaning?"
      }
    ],
    "makeItReal": {
      "label": "Make It Real",
      "title": "Design a Welcome Home",
      "prompt": "Design a small remembrance ritual for a fictional character, a historical figure or someone you choose. Include three elements—a light, food, story, music or meaningful place—and explain what each represents. Give your ritual one unexpected detail, then defend your choice."
    },
    "description": "Step into an extraordinary welcome: marigolds, candles, food and the surprising idea that remembrance can feel like a homecoming."
  },
  {
    "id": "discussion-set-0f357ced-ac8b-44ad-b320-535bdd2ce4c2",
    "icon": "closer-look",
    "stage": "Look Closer",
    "title": "A Place at the Table",
    "moments": [
      {
        "id": "moment-978b7528-2f88-4c34-bfe3-65cb8351ebb3",
        "preview": "Following the marigold path",
        "upgrade": {
          "term": "symbolize",
          "type": "verb",
          "ordinary": "The flowers can represent welcome, hope, and connection with the people being remembered.",
          "priority": "standard",
          "upgraded": "The marigold path may symbolize a warm welcome for the dead and a connection between the living and those they remember.",
          "definition": "To represent an idea, feeling, or quality, often through an object, colour, or action.",
          "atlasPrompt": "What object or colour might symbolize an important value in your community or family?"
        },
        "question": "Picture marigold petals leading from the street to an ofrenda. What might this path communicate, and would the meaning change if someone used different flowers?"
      },
      {
        "id": "moment-f5b9b15f-fe5d-401e-aca7-d084a0ba67ff",
        "preview": "A meal for absent guests",
        "upgrade": {
          "term": "pay tribute to",
          "type": "phrase",
          "ordinary": "Leaving his favourite meal on the table is a way of showing respect for him.",
          "priority": "key",
          "upgraded": "Leaving his favourite meal on the table is a way of paying tribute to him and making his presence felt.",
          "definition": "To show respect and admiration for someone, especially after their death, through words or actions.",
          "atlasPrompt": "How might people pay tribute to a respected teacher, artist, or public figure?"
        },
        "question": "A family leaves favourite food and drinks on an ofrenda, even though nobody expects the food to be eaten. What do you think this gesture offers, and how is it different from simply looking at a photograph?"
      },
      {
        "id": "moment-56f588a6-abd2-4ded-8594-43dd6dce4ebe",
        "preview": "Private altar, public celebration",
        "upgrade": {
          "term": "walk a fine line between",
          "type": "idiom",
          "ordinary": "A public celebration needs to respect the original family tradition while also welcoming new people.",
          "priority": "key",
          "upgraded": "A public celebration has to walk a fine line between sharing a meaningful tradition and turning it into a commercial spectacle.",
          "definition": "To carefully balance two different choices or situations without going too far in either direction.",
          "atlasPrompt": "When might a school or company need to walk a fine line between being welcoming and respecting people’s privacy?"
        },
        "question": "Imagine a quiet family remembrance becoming a large public event with music, costumes, and visitors. What could be gained, and what might be lost?"
      },
      {
        "id": "moment-f987ec4f-2316-472f-aecf-eb65b9a719dc",
        "preview": "One tradition, many families",
        "upgrade": {
          "term": "remain true to",
          "type": "phrase",
          "ordinary": "A tradition can change and still reflect its original meaning.",
          "priority": "standard",
          "upgraded": "A tradition can change over time and still remain true to its original meaning.",
          "definition": "to continue to reflect the original values, meaning, or character of something",
          "atlasPrompt": "How can a family recipe change and still remain true to its origins?"
        },
        "question": "Two families in different parts of Mexico celebrate Día de Muertos in different ways, while both feel their traditions are authentic. Why can variation strengthen a tradition rather than weaken it?"
      },
      {
        "id": "moment-0a75d791-08ab-4bc5-b908-f704f530487a",
        "preview": "When tradition becomes a product",
        "upgrade": {
          "term": "cash in on",
          "type": "phrasal verb",
          "ordinary": "Some companies use the celebration mainly to make money, without learning what it means to the people who celebrate it.",
          "priority": "key",
          "upgraded": "Some companies are simply cashing in on the celebration rather than helping people understand its meaning.",
          "definition": "Use a popular idea, event, or tradition mainly to make money, often without showing much respect for its meaning.",
          "atlasPrompt": "Can you think of a company that may be cashing in on a social trend rather than supporting it? Why?"
        },
        "question": "Imagine a company selling brightly decorated Día de Muertos products to people who know little about the celebration. When does sharing a tradition become respectful appreciation, and when does it become commercialisation?"
      }
    ],
    "makeItReal": {
      "label": "Make It Real",
      "title": "Set the Boundaries",
      "prompt": "You are advising organisers of a public Día de Muertos event. Recommend two things they should include and one boundary they should respect, using the set’s ideas about remembrance, family variation, public celebration, and commercialisation to defend your choices."
    },
    "description": "Look more closely at the meanings, choices, and tensions behind Día de Muertos and other remembrance traditions."
  },
  {
    "id": "discussion-set-b0a9326f-75d9-49be-81f6-ea024d978b05",
    "icon": "wider-view",
    "stage": "Wider View",
    "title": "What We Leave Behind",
    "moments": [
      {
        "id": "moment-0e38a6ee-059d-4045-aa04-c86a924aa6bf",
        "preview": "A tradition crosses borders",
        "upgrade": {
          "term": "be mindful of",
          "type": "phrase",
          "ordinary": "People should think carefully about the tradition’s meaning before using its symbols.",
          "priority": "standard",
          "upgraded": "People should be mindful of the tradition’s meaning before using its symbols.",
          "definition": "to think carefully about something and show respect for its importance or effect",
          "atlasPrompt": "How can a restaurant be mindful of a dish’s cultural background when changing its recipe?"
        },
        "question": "When Día de Muertos symbols appear in another country, what should remain central, and what can people freely adapt?"
      },
      {
        "id": "moment-d3745518-371c-4475-8115-736dac4d811e",
        "preview": "Who gets remembered publicly?",
        "upgrade": {
          "term": "have a say in",
          "type": "phrase",
          "ordinary": "Local communities should be involved in deciding which memorials are built.",
          "priority": "standard",
          "upgraded": "Local communities should have a say in deciding which memorials are built.",
          "definition": "To have the right or opportunity to influence a decision.",
          "atlasPrompt": "Who should have a say in how a school celebrates its history?"
        },
        "question": "Public memorials often celebrate some lives more visibly than others. Who should decide whose stories receive space, attention, and money?"
      },
      {
        "id": "moment-5413949f-7b9f-4627-9990-0ae5d31355e5",
        "preview": "Celebration beside real grief",
        "upgrade": {
          "term": "handle something with sensitivity",
          "type": "collocation",
          "ordinary": "Organisers should deal with the event carefully because it may bring up painful feelings.",
          "priority": "key",
          "upgraded": "Organisers should handle the event with sensitivity, especially for families who are grieving.",
          "definition": "To deal with a difficult or emotional subject in a careful and respectful way.",
          "atlasPrompt": "What is a difficult topic that schools, workplaces, or the media should handle with sensitivity?"
        },
        "question": "A colourful public celebration may help people discuss death, but it may also feel painful or inappropriate to some families. How should organisers balance openness with respect?"
      },
      {
        "id": "moment-c79a31ad-67bc-4c64-a687-f490f7e7b463",
        "preview": "Different answers to death",
        "upgrade": {
          "term": "come to terms with",
          "type": "phrase",
          "ordinary": "Regular rituals can help people gradually accept the reality of losing someone.",
          "priority": "standard",
          "upgraded": "Regular rituals can help people come to terms with the loss of someone they love.",
          "definition": "to gradually accept and understand a difficult situation, especially after a loss or major change",
          "atlasPrompt": "How might someone come to terms with a major change in their life, such as moving abroad or losing a job?"
        },
        "question": "Some cultures treat death mainly as a farewell, while others keep the dead close through regular rituals. What might each approach offer people, and which feels more helpful to you?"
      },
      {
        "id": "moment-54309aae-7c1a-4572-b8b4-faeed6ab7fd0",
        "preview": "The legacy we design",
        "upgrade": {
          "term": "leave a legacy",
          "type": "collocation",
          "ordinary": "I hope my kindness and support will continue to matter to people after I am gone.",
          "priority": "standard",
          "upgraded": "I would like to leave a legacy of kindness, curiosity, and community rather than material possessions.",
          "definition": "To leave behind values, work, or influence that people remember and continue after your death.",
          "atlasPrompt": "What kind of legacy could a teacher, artist, or community leader leave through their work?"
        },
        "question": "Imagine choosing the objects, music, food and stories people might use to remember you—or a fictional character. What would you want that remembrance to communicate?"
      }
    ],
    "makeItReal": {
      "label": "Make It Real",
      "title": "Rewrite the Invitation",
      "prompt": "Imagine a city is inviting the public to a Día de Muertos event. Create a short, respectful invitation that welcomes people from different backgrounds without treating the tradition as a costume, then explain two choices you made."
    },
    "description": "Consider what remembrance traditions reveal about identity, cultural exchange, public life, and the ways societies imagine a meaningful legacy."
  }
];

const clCards = [
  {
    "id": "cultural-lens-card-d6741bcf-9afe-45c5-b2c8-af4e83ba477d",
    "title": "A Night Beside the Graves",
    "teaser": "In some communities, remembrance happens outdoors, under candlelight, beside the people who came before.",
    "context": "Around Lake Pátzcuaro, including communities such as Janitzio, families may spend part of the night near graves during Día de Muertos. Candles, flowers, music, prayers and shared food can turn the cemetery into a place of conversation rather than silence. These gatherings are not identical for every family, and they can combine Indigenous Purépecha traditions with Catholic practices and modern local customs.",
    "upgrade": {
      "term": "come together",
      "type": "phrasal verb",
      "ordinary": "The gathering could help the family feel closer.",
      "priority": "standard",
      "upgraded": "Spending the night together could help the family come together and share memories.",
      "definition": "to gather or become closer because of a shared experience, purpose or feeling",
      "atlasPrompt": "What kind of event can help people come together, even when they have very different opinions?"
    },
    "questions": [
      "An outsider visits a candlelit cemetery gathering near Lake Pátzcuaro. What might they find comforting, joyful or unfamiliar—and how could they show respect?"
    ],
    "contextLine": "Lake Pátzcuaro, Michoacán",
    "followTheThread": [
      "How might a public cemetery gathering change the way a family tells stories about someone who has died?",
      "When visitors come to witness a tradition like this, what should they do to show respect rather than treat it as a performance?"
    ]
  },
  {
    "id": "cultural-lens-card-267537cd-6240-420a-8bf1-bc053f9ef2e5",
    "title": "When the Streets Become a Stage",
    "teaser": "In Xantolo, the dead return through masked dancers, music and a celebration that fills the streets.",
    "context": "Xantolo is a Día de Muertos tradition in the Huasteca region, where communities may organise processions, masked dances and music to honour the dead. Masks may portray older people, skeletons, devils and other characters, creating a playful space where ordinary social roles are temporarily changed. The celebration shows that remembering the dead can be both intimate and intensely public, while also reflecting the region’s Indigenous and local traditions rather than a single national version of Día de Muertos.",
    "upgrade": {
      "term": "take on a life of its own",
      "type": "idiom",
      "ordinary": "As the celebration moved into the streets, it became much bigger and more independent.",
      "priority": "standard",
      "upgraded": "As the celebration moved into the streets, it took on a life of its own.",
      "definition": "To develop and become more powerful or independent than people originally expected.",
      "atlasPrompt": "How can a small event in your community take on a life of its own?"
    },
    "questions": [
      "Would a public, playful celebration like Xantolo feel like a respectful way to remember the dead in your culture, or would it cross a line? Why?"
    ],
    "contextLine": "La Huasteca, eastern Mexico",
    "followTheThread": [
      "What might people gain by using masks, music or humour when talking about death?",
      "How can a tradition remain meaningful when it becomes a large public event or attracts tourists?"
    ]
  },
  {
    "id": "cultural-lens-card-f267ec0d-38be-4a6f-9a05-3dc9eb7a6738",
    "title": "Poems for the Living and the Dead",
    "teaser": "During Día de Muertos, a playful poem can invite Death to comment on people who are still alive.",
    "context": "Calaveras literarias are short satirical poems traditionally written around Día de Muertos. They imagine La Calavera, or Death, visiting a friend, politician, teacher or celebrity, often teasing that person about their habits or public image. Although the poems mention death, their humour is usually aimed at the living, turning remembrance into a creative way to comment on society and relationships.",
    "upgrade": {
      "term": "poke fun at",
      "type": "phrase",
      "ordinary": "The poem makes gentle jokes about the politician's public image.",
      "priority": "standard",
      "upgraded": "The poem pokes fun at the politician's public image.",
      "definition": "to make gentle jokes about someone or something, usually without serious hostility",
      "atlasPrompt": "Think of a film, advertisement, or social-media trend: what could you poke fun at, and why?"
    },
    "questions": [
      "If you could write a playful calavera about a public figure, a workplace habit or a modern social problem, who or what would Death visit, and what would the poem reveal?"
    ],
    "contextLine": "Mexico City, Día de Muertos tradition",
    "followTheThread": [
      "Why might humour make difficult subjects easier to discuss?",
      "When does playful teasing become disrespectful, especially in a tradition connected with death?"
    ]
  },
  {
    "id": "cultural-lens-card-cd867a82-2598-4a39-9fd3-c2e3990d7d1b",
    "title": "When Remembrance Goes Public",
    "teaser": "Far from Mexico, a private tradition can become a large public gathering—and raise difficult questions about who gets to tell its story.",
    "context": "Hollywood Forever Cemetery in Los Angeles has hosted large Día de Muertos celebrations with music, performances, food, processions and community-created altars. For many Mexican American families, events like this can make cultural memory visible in a city shaped by migration. They can also create tension: when does sharing a tradition build understanding, and when does it turn remembrance into entertainment or a product?",
    "upgrade": {
      "term": "strike a balance",
      "type": "collocation",
      "ordinary": "Organizers need to make the event enjoyable without losing its meaning.",
      "priority": "key",
      "upgraded": "Organizers need to strike a balance between making the event enjoyable and protecting its deeper meaning.",
      "definition": "To find a reasonable middle point between two different needs or aims.",
      "atlasPrompt": "How could a school strike a balance between celebrating diversity and avoiding stereotypes?"
    },
    "questions": [
      "What should organizers protect when a deeply personal tradition becomes a major public event?"
    ],
    "contextLine": "Hollywood Forever Cemetery, Los Angeles",
    "followTheThread": [
      "Would you rather remember someone in a private family space or in a large community celebration, and why?",
      "How can visitors show respect when taking part in a tradition that is not their own?"
    ]
  },
  {
    "id": "cultural-lens-card-f6a717fc-ba91-4654-8bf7-3c7a27ed898e",
    "title": "The Skeleton Who Changed Her Clothes",
    "teaser": "A skeleton once used to mock social ambition became one of the most recognisable symbols of Día de Muertos.",
    "context": "José Guadalupe Posada created La Calavera Garbancera as a satirical image of people who rejected their Mexican roots while trying to appear European. Later, Diego Rivera helped make the elegant skeleton known as La Catrina famous, and she became connected with Día de Muertos. Her changing clothes and settings show how a political joke can become a symbol of identity, humour and commercial culture.",
    "upgrade": {
      "term": "strip something of its meaning",
      "type": "phrase",
      "ordinary": "Some people worry that turning a meaningful tradition into a product can make it less meaningful.",
      "priority": "key",
      "upgraded": "Some people worry that turning a meaningful tradition into a product can strip it of its meaning.",
      "definition": "To remove the original importance or significance from something.",
      "atlasPrompt": "Can a national symbol be stripped of its meaning when companies use it in advertising?"
    },
    "questions": [
      "When a symbol moves from political criticism into fashion, tourism or advertising, can it still keep its original meaning?"
    ],
    "contextLine": "Mexico City, early twentieth century to today",
    "followTheThread": [
      "What makes humour about death feel respectful in one context but offensive in another?",
      "If you redesigned La Catrina for your own culture, what would she wear and what would she represent?"
    ]
  },
  {
    "id": "cultural-lens-card-2d149874-0605-470f-9857-01884056aae3",
    "title": "A Dish Made for the Departed",
    "teaser": "In some Yucatecan families, remembering the dead includes preparing a special dish that is cooked slowly and shared by the whole household.",
    "context": "Hanal Pixán means “food for the souls” in Maya, and it is a remembrance tradition in Yucatán with strong Maya influence. Families may prepare mucbipollo, a large savoury dish traditionally wrapped and cooked in an underground pit, then place it on an altar or share it during the season. The practice shows how food can act as an invitation, carrying family memory, regional identity and beliefs about the presence of the dead.",
    "upgrade": {
      "term": "pass something down",
      "type": "phrasal verb",
      "ordinary": "Older relatives teach younger family members how to prepare the dish.",
      "priority": "standard",
      "upgraded": "Older relatives pass the recipe down to younger family members.",
      "definition": "to teach or give a tradition, skill, story, or object to a younger generation",
      "atlasPrompt": "What piece of advice or practical skill would you like to pass down to someone younger?"
    },
    "questions": [
      "Imagine preparing a special dish each year for a person, place or fictional family you want to remember. What ingredients and stories would you choose, and why?"
    ],
    "contextLine": "Yucatán, Hanal Pixán tradition",
    "followTheThread": [
      "How might a traditional dish change when younger family members live far away or do not know how to prepare it?",
      "Is sharing food with the dead mainly an expression of belief, memory, family identity, or could it be all three?"
    ]
  }
];
