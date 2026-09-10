/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  The Odyssey: Worth the Hype?
  ---------------------------------------------------------------------------
  A premium interactive speaking subject for exploring why an ancient epic
  still works on modern screens: spectacle, heroism, home, temptation,
  adaptation, and the stories cultures keep retelling. Built for tutor-led
  conversation, shared-screen teaching, cultural discovery, and sharper
  spoken English.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: 'odyssey-worth-the-hype',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'The Odyssey: Worth the Hype?',
    titleHtml: 'The Odyssey: <em>Worth the Hype?</em>',
    navTitle: 'The Odyssey',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2AfNTRW3tus24aRHMr7-C-SizCaIZWt6S5WfFslYLurTBVD-IxBa-zjx3&s=10'
};

const subjectCopy = {
    cover: {
        hook: `What makes an ancient adventure feel brilliantly new?`
    },
    overview: {
        heading: `The Stories We Carry Home`,
        intro: [
            `Some films stay in our minds because they make a huge adventure feel surprisingly personal. We can laugh at a character’s bad decisions, worry about their choices, or recognise something from our own lives—even when the story is thousands of years old.`
        ],
        question: `What is one film or story you still remember clearly, and what made it memorable?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore the choices, characters, and creative details that can turn an ancient journey into a memorable modern film.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `See how time, place and changing social expectations can give an ancient adventure fresh meaning.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Use this final step to connect the subject with your own views, experiences and future choices.`
    },
    culturalLens: {
        heading: `Heroes, Home and Changing Times`,
        intro: `Explore how different places, periods and audiences can change the way people understand an epic journey. Look at shifting ideas about heroism, loyalty, family, danger and the meaning of returning home.`
    },
    discussion: {
        heading: `Beyond the Big Adventure`,
        intro: `Follow the journey through difficult choices, strange encounters, changing loyalties, and the powerful wish to return home. Talk about what makes an old story feel fresh, which characters we understand or question, and how a film’s images and performances can change our feelings.`
    },
    reflection: {
        title: `From Epic Journey to Your Own Story`,
        summary: `Think about why a very old adventure can still feel personal, especially through its difficult choices and powerful idea of home. Then consider how stories, films and changing viewpoints shape the way you see your own experiences.`,
        questions: [
            `How can a story about a huge journey and difficult choices become personal for different audiences, and what might this change in the way they understand home or loyalty?`,
            `After thinking about this subject, is there a story, film or personal experience you would now look at differently—or share with someone in a new way? Why?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: 'set-epic-film-adventure',
        title: `Your Epic Film Adventure`,
        stage: 'First Look',
        icon: 'first-look',
        description: `Start with the people, places, and moments that could make a modern Odyssey film exciting and memorable.`,
        moments: [
            {
                id: 'moment-first-impression',
                preview: `The first impression`,
                question: `What would make you want to watch a new film about The Odyssey: the story, the cast, the visuals, or something else?`,
                upgrade: {
                    term: `draw me in`,
                    type: 'phrasal verb',
                    definition: `to make you interested and want to give something your attention`,
                    ordinary: `A strong story and impressive visuals would make me want to watch the film.`,
                    upgraded: `The combination of epic visuals and a mysterious hero would really draw me in.`,
                    priority: 'key',
                    atlasPrompt: `What kind of opening would draw you into a new TV series or video game?`
                }
            },
            {
                id: 'moment-journey-worth-taking',
                preview: `A journey worth taking`,
                question: `If you could join Odysseus on one part of his journey, which place or encounter would you choose, and why?`,
                upgrade: {
                    term: `step out of your comfort zone`,
                    type: 'expression',
                    definition: `to do something unfamiliar or challenging instead of staying with what feels safe`,
                    ordinary: `I’d choose the island of the Cyclops because it would be exciting and completely new to me.`,
                    upgraded: `I’d choose the island of the Cyclops because it would really make me step out of my comfort zone.`,
                    priority: 'key',
                    atlasPrompt: `When was the last time you stepped out of your comfort zone to try something new?`
                }
            },
            {
                id: 'moment-heroes-and-troublemakers',
                preview: `Heroes and troublemakers`,
                question: `Which character sounds most interesting to you: a brave hero, a clever survivor, a dangerous enemy, or someone waiting at home?`,
                upgrade: {
                    term: `larger-than-life`,
                    type: 'adjective',
                    definition: `Very impressive, exciting, and unusual, often in a way that feels bigger than real life.`,
                    ordinary: `I’d choose a hero who is extremely impressive and dramatic, even if he isn’t very realistic.`,
                    upgraded: `I’d choose a larger-than-life hero who can survive impossible adventures and still make us laugh.`,
                    priority: 'key',
                    atlasPrompt: `What kind of person would make a family story, party, or workplace more memorable because they are larger-than-life?`
                }
            },
            {
                id: 'moment-pull-of-home',
                preview: `The pull of home`,
                question: `What might make someone keep travelling, even when returning home is their biggest wish?`,
                upgrade: {
                    term: `keep someone going`,
                    type: 'phrasal verb',
                    definition: `to give someone enough hope, energy, or motivation to continue during a difficult time`,
                    ordinary: `The hope of seeing his family again could give him the strength to continue through the dangerous journey.`,
                    upgraded: `The hope of seeing his family again could keep him going through the dangerous journey.`,
                    priority: 'key',
                    atlasPrompt: `What could keep you going during a difficult project, exam period, or busy week?`
                }
            },
            {
                id: 'moment-unforgettable-scene',
                preview: `One unforgettable scene`,
                question: `What kind of scene from this story would stay in your mind afterwards: a monster, a storm, a battle, a reunion, or a surprising act of kindness?`,
                upgrade: {
                    term: `linger`,
                    type: 'verb',
                    definition: `To remain in your mind or feelings after an experience has ended.`,
                    ordinary: `I think the reunion would stay in my memory because it would be very emotional.`,
                    upgraded: `I think the reunion would linger in my mind because it would be so emotional.`,
                    priority: 'key',
                    atlasPrompt: `What image, line, or moment from a film has lingered in your mind long after it ended?`
                }
            }
        ],
        makeItReal: {
            title: `Sell Us the Voyage`,
            prompt: `Imagine you’re recommending this film to a friend. Give a 30-second pitch with one character, one unforgettable scene, and the main reason the journey is worth watching—then finish with a memorable tagline.`
        }
    },
    {
        id: 'set-choices-behind-journey',
        title: `Choices Behind the Journey`,
        stage: 'Closer Look',
        icon: 'closer-look',
        description: `Examine the difficult choices, storytelling decisions, and changing loyalties that could make this ancient adventure feel real today.`,
        moments: [
            {
                id: 'moment-cost-of-cleverness',
                preview: `The cost of cleverness`,
                question: `Odysseus often survives through clever plans, but his confidence can create new problems. When does intelligence become dangerous overconfidence?`,
                upgrade: {
                    term: `let it go to your head`,
                    type: 'idiom',
                    definition: `To become too proud or overconfident because of your success or ability.`,
                    ordinary: `After solving several difficult problems, he became too confident and stopped listening to other people.`,
                    upgraded: `After solving several difficult problems, he let it go to his head and stopped listening to other people.`,
                    priority: 'key',
                    atlasPrompt: `How might success at work, school, or sport let someone go to their head?`
                }
            },
            {
                id: 'moment-hero-with-flaws',
                preview: `A hero with flaws`,
                question: `Would you enjoy the film more if Odysseus were shown as admirable, selfish, or both? What would make his character believable?`,
                upgrade: {
                    term: `warts and all`,
                    type: 'idiom',
                    definition: `Including someone’s faults and weaknesses, not just their good qualities.`,
                    ordinary: `I prefer heroes who have weaknesses because they feel more believable.`,
                    upgraded: `I’d rather see Odysseus warts and all, because his selfish decisions would make him feel more human.`,
                    priority: 'key',
                    atlasPrompt: `When can showing someone’s faults, warts and all, make a story or presentation more convincing?`
                },
                followUp: {
                    id: 'flaw-worth-keeping',
                    kind: 'go-deeper',
                    prompt: `Which flaw would you keep even if it made audiences like Odysseus less — and why would the story be weaker without it?`
                }
            },
            {
                id: 'moment-temptation-on-the-way',
                preview: `Temptation on the way`,
                question: `If you were adapting the story, which temptation would you make most powerful: comfort, fame, revenge, romance, or the chance to forget the past?`,
                upgrade: {
                    term: `give in to temptation`,
                    type: 'phrasal verb',
                    definition: `to stop resisting something attractive, even though you know it may be a bad choice`,
                    ordinary: `The hero might choose comfort instead of continuing the difficult journey.`,
                    upgraded: `The hero might give in to the temptation of comfort and abandon the journey home.`,
                    priority: 'key',
                    atlasPrompt: `When have you or someone you know given in to temptation, even though you knew it was probably not the best choice?`
                }
            },
            {
                id: 'moment-whose-story-is-it',
                preview: `Whose story is it?`,
                question: `How might the film change if it gave Penelope, Telemachus, or another character as much attention as Odysseus?`,
                upgrade: {
                    term: `foreground`,
                    type: 'verb',
                    definition: `To give a person, idea, or issue greater attention or importance.`,
                    ordinary: `The film could focus more on Penelope and show what she thinks and feels.`,
                    upgraded: `The film could foreground Penelope’s perspective and reveal a completely different side of the story.`,
                    priority: 'key',
                    atlasPrompt: `Whose perspective would you foreground in a story about your school, workplace, or community, and why?`
                },
                followUp: {
                    id: 'penelope-tells-it',
                    kind: 'another-angle',
                    prompt: `If Penelope told the story, which part of Odysseus’s adventure might suddenly seem least important?`
                }
            },
            {
                id: 'moment-making-myths-feel-modern',
                preview: `Making myths feel modern`,
                question: `What should a modern film change—and what should it keep—so the story feels fresh without losing its original identity?`,
                upgrade: {
                    term: `put a fresh spin on`,
                    type: 'phrase',
                    definition: `to present a familiar idea in a new, interesting, or modern way`,
                    ordinary: `The director should present the old story in a new way without changing what makes it special.`,
                    upgraded: `The director could put a fresh spin on the old story while keeping its central ideas about home and loyalty.`,
                    priority: 'key',
                    atlasPrompt: `What traditional food, song, or celebration could you put a fresh spin on, and how?`
                }
            }
        ],
        makeItReal: {
            title: `The Director’s Final Call`,
            prompt: `Choose one bold adaptation decision—about Odysseus, another character, a temptation, or what to change or keep—and give the tutor a 45-second director’s note. Explain the choice, one possible risk, and why it could make the film more unforgettable.`
        }
    },
    {
        id: 'set-why-journey-still-matters',
        title: `Why This Journey Still Matters`,
        stage: 'Wider View',
        icon: 'wider-view',
        description: `Consider what a spectacular Odyssey film might say about modern life, culture, and the stories people choose to remember.`,
        moments: [
            {
                id: 'moment-ancient-problems-modern-lives',
                preview: `Ancient problems, modern lives`,
                question: `Which problem from Odysseus’s journey feels most familiar today: being away from home, dealing with uncertainty, resisting temptation, or trying to start again?`,
                upgrade: {
                    term: `feel torn between`,
                    type: 'expression',
                    definition: `To feel unable to choose between two different people, needs, or possible actions.`,
                    ordinary: `Many people find it difficult to choose between their responsibilities and what they personally want.`,
                    upgraded: `Many people feel torn between their responsibilities and the freedom to live the life they want.`,
                    priority: 'key',
                    atlasPrompt: `When might someone feel torn between staying loyal to a friend and doing what is best for themselves?`
                }
            },
            {
                id: 'moment-what-makes-a-hero',
                preview: `What makes a hero?`,
                question: `After watching this story, would you want people to admire Odysseus, question him, or simply understand him? What should a modern hero be like?`,
                upgrade: {
                    term: `earn someone’s admiration`,
                    type: 'collocation',
                    definition: `to do something that makes people genuinely admire and respect you`,
                    ordinary: `A modern hero should do things that make people respect them.`,
                    upgraded: `A modern hero should earn our admiration through courage, honesty, and responsibility—not just impressive victories.`,
                    priority: 'key',
                    atlasPrompt: `What could a person do in everyday life to earn your admiration?`
                }
            },
            {
                id: 'moment-meaning-of-home',
                preview: `The meaning of home`,
                question: `Can a person still feel at home after years of change, or can home become more of an idea than a real place?`,
                upgrade: {
                    term: `put down roots`,
                    type: 'idiom',
                    definition: `to start building a stable, lasting life in a particular place`,
                    ordinary: `After years of moving from place to place, she finally feels settled in one town.`,
                    upgraded: `After years of moving around, she’s ready to put down roots and create a home of her own.`,
                    priority: 'key',
                    atlasPrompt: `What helps people put down roots when they move to a new city or join a new community?`
                }
            },
            {
                id: 'moment-spectacle-and-responsibility',
                preview: `Spectacle and responsibility`,
                question: `When a film turns monsters, violence, and ancient cultures into entertainment, what should the filmmakers handle carefully?`,
                upgrade: {
                    term: `tread carefully`,
                    type: 'phrase',
                    definition: `To act cautiously because something could easily cause harm or offence.`,
                    ordinary: `Filmmakers need to be very careful when showing ancient cultures and violent events.`,
                    upgraded: `Filmmakers need to tread carefully when turning ancient cultures and violent events into entertainment.`,
                    priority: 'key',
                    atlasPrompt: `What should a company tread carefully around when creating an advertisement for a sensitive issue?`
                }
            },
            {
                id: 'moment-stories-that-travel',
                preview: `Stories that travel`,
                question: `Why do people keep retelling stories from other times and cultures, and what can be lost or gained when a global audience discovers them through a big film?`,
                upgrade: {
                    term: `resonate`,
                    type: 'verb',
                    definition: `To feel meaningful, relevant, or emotionally powerful to someone.`,
                    ordinary: `A good film can make an unfamiliar story feel meaningful to people from different backgrounds.`,
                    upgraded: `A good film can resonate with audiences across cultures by making an unfamiliar story feel personally meaningful.`,
                    priority: 'key',
                    atlasPrompt: `What story, song, or film has resonated with you even though it came from another culture?`
                },
                followUp: {
                    id: 'first-odyssey-for-millions',
                    kind: 'add-a-twist',
                    prompt: `Imagine the film becomes most viewers’ first encounter with The Odyssey. What responsibility does that give the filmmakers?`
                }
            }
        ],
        makeItReal: {
            title: `The Modern Odyssey Survival Guide`,
            prompt: `Create a three-rule survival guide for someone facing an Odyssey-like challenge today, such as being far from home, resisting temptation, or starting again. Give the rules to your tutor and explain what they reveal about being a modern hero.`
        }
    }
];

const clCards = [
    {
        id: 'cl-long-way-home',
        contextLine: `Ancient Greece and modern audiences`,
        title: `The Long Way Home`,
        teaser: `For Odysseus, getting home is not simply travelling—it is proving who he is.`,
        context: `In ancient Greek storytelling, a hero’s return home, or “nostos”, was a powerful idea connected to identity, family and honour. Odysseus does not just survive storms and monsters; he must also rebuild his place in Ithaca after years away. Modern audiences may connect this journey with migration, military service, long-distance work or any experience that makes “home” feel different when you finally return.`,
        mainQuestion: `What makes a return home meaningful: the place itself, the people waiting there, or the changes the traveller has gone through?`,
        followTheThread: [
            `Would modern audiences judge Odysseus’s choices differently from ancient Greek audiences? Why?`,
            `What film, book or real-life story shows someone returning home and discovering that they have changed?`
        ],
        upgrade: {
            term: `find your feet`,
            type: 'idiom',
            definition: `to become comfortable and confident in a new or changed situation`,
            ordinary: `After being away for so long, it can take time to feel comfortable at home again.`,
            upgraded: `After being away for so long, it can take time to find your feet at home again.`,
            priority: 'key',
            atlasPrompt: `When might someone need time to find their feet in a new job, school, or city?`
        }
    },
    {
        id: 'cl-hospitality-test',
        contextLine: `Ancient Greek hospitality and modern storytelling`,
        title: `When Hospitality Becomes a Test`,
        teaser: `In The Odyssey, welcoming a stranger can reveal whether a society is civilised—or dangerously careless.`,
        context: `Ancient Greek culture placed strong importance on “xenia”, a tradition of hospitality between hosts and guests. In the poem, good hosts offer food and safety, while bad hosts may trap, deceive or attack visitors, as the Cyclops does. A modern film can make this idea feel surprisingly relevant by asking how we treat strangers, travellers and people who need help.`,
        mainQuestion: `Do you think a person’s attitude towards strangers is a strong sign of their character, and how could a film show this without simply making the “good” and “bad” sides obvious?`,
        followTheThread: [
            `Can you think of a modern situation in which welcoming someone creates both an opportunity and a risk?`,
            `Would audiences today sympathise more with a traveller looking for help or with a community trying to protect itself? Why?`
        ],
        upgrade: {
            term: `strike a balance`,
            type: 'idiom',
            definition: `to find a fair or effective middle point between two different needs or choices`,
            ordinary: `It is difficult to welcome strangers while also keeping the community safe.`,
            upgraded: `It is difficult to strike a balance between welcoming strangers and keeping the community safe.`,
            priority: 'key',
            atlasPrompt: `How could you strike a balance between protecting your privacy and staying connected online?`
        }
    },
    {
        id: 'cl-circe-reinterpretation',
        contextLine: `Circe in ancient epic and modern retellings`,
        title: `The Witch, the Hero and the Reinterpretation`,
        teaser: `A character once presented as a dangerous enchantress can become something much more complicated on screen.`,
        context: `In The Odyssey, Circe uses magic to transform Odysseus’s men into pigs, but she later helps Odysseus and his crew continue their journey. Modern films and books may present her less as a simple villain and more as a powerful woman with her own motives, knowledge and loneliness. This change can make audiences question whose point of view an old story represents.`,
        mainQuestion: `Should a modern film change a character like Circe to reflect contemporary ideas about power and independence, or should it stay closer to the ancient story?`,
        followTheThread: [
            `How can an actor make a character seem frightening, sympathetic, or both at the same time?`,
            `Can changing a character’s role improve an old story, or can it lose something important from the original?`
        ],
        upgrade: {
            term: `see someone in a different light`,
            type: 'expression',
            definition: `To understand or judge someone differently after learning more about them.`,
            ordinary: `The film made me think about the character differently.`,
            upgraded: `The film made me see the character in a different light.`,
            priority: 'key',
            atlasPrompt: `Has a book, interview, or conversation ever made you see a public figure in a different light? What changed?`
        }
    },
    {
        id: 'cl-fame-glory-hero',
        contextLine: `Ancient Greek values and modern action films`,
        title: `Fame, Glory and the Hero`,
        teaser: `Odysseus does not only want to survive—he wants his story to be remembered.`,
        context: `Ancient Greek epics valued “kleos”, or lasting fame earned through brave and clever actions. Odysseus is admired not just because he reaches home, but because his adventures become a story people repeat. Modern films often give heroes a similar kind of fame, while also asking whether victory, violence and reputation are really worth the cost.`,
        mainQuestion: `Would Odysseus still feel like a great hero to a modern audience if his cleverness caused suffering for other people? Why or why not?`,
        followTheThread: [
            `Which matters more in a hero story: what the hero achieves, or how they treat people along the way?`,
            `Can a film become overhyped because its hero is famous, even if the story itself is not very original?`
        ],
        upgrade: {
            term: `the ends justify the means`,
            type: 'idiom',
            definition: `The result is considered more important than the methods used to achieve it.`,
            ordinary: `Some people believe a successful result can make harmful actions acceptable.`,
            upgraded: `Some people may argue that the ends justify the means, even when a hero’s actions cause suffering.`,
            priority: 'key',
            atlasPrompt: `Can you think of a situation in sport, business or politics where people might say the ends justify the means?`
        }
    },
    {
        id: 'cl-woman-who-waits',
        contextLine: `Penelope in ancient epic and modern screen stories`,
        title: `The Woman Who Waits`,
        teaser: `While Odysseus battles monsters, Penelope faces a different kind of danger: pressure, patience and impossible choices.`,
        context: `Penelope is often remembered for waiting faithfully for Odysseus, but The Odyssey also shows her using intelligence to protect her home. Her famous weaving trick lets her delay remarriage by promising to choose a new husband when a cloth is finished—then secretly undoing the work each night. Modern adaptations can present her not as a passive wife, but as a strategist surviving a long political crisis at home.`,
        mainQuestion: `Would you rather watch a version of The Odyssey that gives Penelope equal importance, or keep Odysseus as the clear main hero? Why?`,
        followTheThread: [
            `What kinds of intelligence are often overlooked when stories focus on physical bravery?`,
            `Could waiting, delaying or appearing powerless ever be a form of strength in real life?`
        ],
        upgrade: {
            term: `play the long game`,
            type: 'idiom',
            definition: `To stay patient and make careful choices because you are thinking about a future result.`,
            ordinary: `She stayed patient and waited for the right moment to act.`,
            upgraded: `She was playing the long game, using patience and careful planning to protect her position.`,
            priority: 'key',
            atlasPrompt: `When might playing the long game help someone deal with a difficult situation at work or in their personal life?`
        }
    },
    {
        id: 'cl-before-cinema-crowd',
        contextLine: `Ancient Greek storytelling and modern film audiences`,
        title: `Before the Cinema, There Was the Crowd`,
        teaser: `The Odyssey was built for live performance long before anyone imagined a cinema screen.`,
        context: `The Odyssey probably grew from an oral storytelling tradition, in which performers recited familiar episodes for an audience. Repeated phrases, dramatic speeches and memorable monsters helped listeners follow a long story without reading it. A film adaptation faces a similar challenge: it must make an old story feel exciting and clear for a new audience, while deciding what to shorten, change or leave out.`,
        mainQuestion: `Would you rather watch a very faithful adaptation of The Odyssey or a bold version that changes major characters and events—and why?`,
        followTheThread: [
            `What parts of a famous story do audiences expect to recognise?`,
            `Can changing an old story help people understand it, or does it risk losing its original meaning?`
        ],
        upgrade: {
            term: `live up to expectations`,
            type: 'phrase',
            definition: `to be as good as people hoped or expected`,
            ordinary: `The film does not need to copy every detail, but it should satisfy what audiences expect from the story.`,
            upgraded: `The film does not need to copy every detail, but it should live up to audiences’ expectations about the story.`,
            priority: 'key',
            atlasPrompt: `When have you had to live up to someone else’s expectations?`
        }
    },
    {
        id: 'cl-home-not-enough',
        contextLine: `Dante’s medieval Italy and Homer’s ancient Greece`,
        title: `When Home Is Not Enough`,
        teaser: `Centuries after Homer, Dante imagined Odysseus as a man who could not stop searching—even when home was waiting.`,
        context: `In Homer’s epic, Odysseus’s goal is to return to “Ithaca”, his family and his old identity. In Dante’s Inferno, the character—called Ulysses—is reimagined as a restless explorer who sails beyond the known world, driven by curiosity and the desire for experience. This contrast shows how each age can reshape the same hero: loyal survivor in one story, dangerously ambitious adventurer in another.`,
        mainQuestion: `Which version of Odysseus would make the more exciting film hero: the man desperate to get home or the man who cannot stop exploring? Why?`,
        followTheThread: [
            `Can a strong desire for adventure become selfish or harmful?`,
            `How might a modern film change Odysseus to reflect what audiences admire today?`
        ],
        upgrade: {
            term: `have itchy feet`,
            type: 'idiom',
            definition: `To feel a strong desire to travel, move on, or try a new experience instead of staying in one place.`,
            ordinary: `She finds it difficult to settle down because she is always looking for a new adventure.`,
            upgraded: `She has itchy feet, so even when life is comfortable, she starts planning her next journey.`,
            priority: 'key',
            atlasPrompt: `When might someone have itchy feet in their work, studies, or personal life?`
        }
    },
    {
        id: 'cl-homecoming-nation-building',
        contextLine: `Ancient Rome and Virgil’s Aeneid`,
        title: `From Homecoming to Nation-Building`,
        teaser: `What if the hero’s journey is not about returning home, but creating a new one for everyone else?`,
        context: `Virgil’s Aeneid was written centuries after The Odyssey and follows Aeneas, a Trojan survivor who travels to Italy. Like Odysseus, he faces danger, loss and temptation, but his goal is different: he must help begin the story of Rome. This changes the meaning of sacrifice, loyalty and “home” from a personal destination into a national future.`,
        mainQuestion: `Which kind of journey would make a more powerful film: one person trying to return home, or one person giving up their old home to build a new future? Why?`,
        followTheThread: [
            `Would you admire Aeneas for putting a larger purpose before his personal happiness, or criticise him for it?`,
            `Can a film make a character feel heroic if their success depends on other people suffering or losing their homes?`
        ],
        upgrade: {
            term: `sacrifice`,
            type: 'verb',
            definition: `To give up something valuable for another person or a larger purpose.`,
            ordinary: `He gave up his own plans to support the people around him.`,
            upgraded: `He sacrificed his own plans to support the people around him.`,
            priority: 'key',
            atlasPrompt: `What might someone sacrifice for their family, team, or community?`
        }
    },
    {
        id: 'cl-name-that-saves-him',
        contextLine: `Odysseus, the Cyclops and the power of language`,
        title: `The Name That Saves Him`,
        teaser: `Sometimes the hero survives not by fighting, but by choosing exactly what to call himself.`,
        context: `When Odysseus meets the Cyclops, he says his name is “Nobody.” After Odysseus blinds him, the Cyclops cries that “Nobody” is attacking him, so the other Cyclopes do not come to help. The scene turns language into a survival tool—and also shows Odysseus’s weakness: later, his pride makes him reveal his real name.`,
        mainQuestion: `Is Odysseus’s clever use of language more impressive than his physical courage, and how might a film make this scene memorable for a modern audience?`,
        followTheThread: [
            `Can hiding or changing your identity still be useful in dangerous situations today?`,
            `Does Odysseus’s decision to reveal his name make him more human, or simply less intelligent?`
        ],
        upgrade: {
            term: `give yourself away`,
            type: 'phrasal verb',
            definition: `To reveal who you are or what you are thinking, often without meaning to.`,
            ordinary: `She tried to keep her plan secret, but one careless comment revealed what she was thinking.`,
            upgraded: `She tried to keep her plan secret, but one careless comment gave her away.`,
            priority: 'key',
            atlasPrompt: `How might someone give themselves away when they are pretending to be calm or confident?`
        }
    }
];
