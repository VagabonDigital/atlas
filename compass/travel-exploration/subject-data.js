/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Travel & Exploration
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring why humans leave the
  familiar — the pull of elsewhere, what the journey reveals, and what
  home looks like on the way back.
  Built for live lessons, thoughtful discussion, and sharper spoken English
  around travel, culture shock, and the meaning of going somewhere new.
  Subject content may change.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'travel-exploration',
    schemaVersion: 1,
    contentVersion: '1.0.0',
    title: 'Travel & Exploration',
    titleHtml: 'Travel &amp;<br><em>Exploration</em>',
    navTitle: 'Travel',
    bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfY-NhvVgfEgIbLH673_HONFPonCXSMtXnlcwUtBO88A&s=10'
};

const subjectCopy = {
    cover: {
        hook: `Every journey changes the view — including the one back home.`
    },
    overview: {
        heading: `Why We Leave, and What We Bring Back`,
        intro: [
            `Travel is easy to mistake for a list of places. But the interesting part has never really been the destinations — it's what happens to a person in the gap between leaving and returning: the small disorientation of arriving somewhere that doesn't know you, the moment a foreign city stops feeling foreign, and the odd, brief strangeness of your own front door when you get back. This subject is about that gap, and what it does.`,
            `Here you'll explore the pull that sends people somewhere new, the gap between the traveller you imagine yourself to be and the one you actually are on the road, and the long human story of what it has meant — across cultures and eras — to leave the familiar behind. Some journeys were made for discovery, some for survival, some with no route home. All of them changed something.`
        ]
    },
    paths: {
        culturalLensDescription: `How different cultures and eras have understood the act of going — from Pacific navigators reading the ocean to digital nomads who've made movement their whole life.`,
        discussionDescription: `The places that surprised you, the trips that went wrong and became the best stories, and what home looked like when you finally got back.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Carry something forward from the journey — a thought, a shift, a question that stayed with you.`
    },
    culturalLens: {
        heading: `Why Humans Leave the Familiar`,
        intro: `Travel has never meant one thing. People have left home to survive, to trade, to worship, to learn, to escape, or simply because they couldn't sit still — and each reason makes the same act of going feel completely different. These cards look at how different cultures and eras have understood leaving the familiar, and what an outsider can so easily misread about a journey that isn't their own.`
    },
    discussion: {
        heading: `The Journey and the Return`,
        intro: `Travel gives everyone a story — the arrival that surprised you, the disaster that became the best memory, the moment your own home looked briefly unfamiliar. These sets move from the immediate pull of elsewhere, through what kind of traveller you really are, to what the going actually leaves behind. Some moments are quick reactions; others ask for a proper story. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `Every journey — the smooth ones, the ones that went pear-shaped, the brief stays and the long ones — leaves something behind. Sometimes it's a habit or a taste you carried home without noticing. Sometimes it's a quieter shift: the way a place looked different on return, or the moment you understood, from the outside, what being a foreigner actually feels like. Travel doesn't always change you in the ways the brochure promises — but it rarely leaves you entirely as you were.`,
        questions: [
            `Of all the places you've been, which one changed something — however small — in how you see your life at home?`,
            `What's one thing you believed about travel before you'd done much of it that turned out not to be quite right?`,
            `If someone with very little travel experience asked you whether it was worth it, what would you honestly say?`
        ]
    },
    keyLanguage: {
        intro: `Useful words and phrases for talking about journeys, arrivals, and the experience of going somewhere new.`
    }
};

const clCards = [
    {
        id: `cl-polynesian-navigators`,
        location: `The Pacific, ancient and medieval ocean voyaging`,
        title: `Reading the Ocean`,
        teaser: `Crossing an ocean without modern instruments — and arriving.`,
        insight: `Long before modern instruments, Polynesian navigators crossed thousands of kilometres of open Pacific using stars, swell patterns, bird flight, cloud colour, and a vast memory of the sea passed down by training. To an outsider this can look like luck or mysticism, but it was a precise, learned skill — a way of knowing the ocean that lived in the body and the senses rather than on paper. The human meaning underneath: knowledge doesn't have to be written down to be real. A whole science of the sea was carried in memory, observation, and apprenticeship, and it worked.`,
        question: `Have you ever trusted instinct or a "feel" for something over a map, a guide, or instructions — and were you right to?`,
        upgrade: {
            term: `know it like the back of your hand`,
            type: `idiom`,
            def: `To know a place or thing so well you need no help with it.`,
            in_action: `He's never used a map here — he knows these streets like the back of his hand.`,
            review_prompt: `What place or route do you know like the back of your hand? How did you learn it?`
        },
        deeper: {
            text: `It's tempting to assume that knowledge only counts when it's written, measured, or taught in a classroom — that's the form many of us were raised to trust. But the Polynesian system suggests a different idea: that deep expertise can live in observation and memory, refined over a lifetime and handed from teacher to student. The misread happens when outsiders see no charts and assume there's no method, when in fact the method is simply held somewhere they're not looking. There's a modern echo every time an experienced fisher reads the weather better than the forecast, or a local takes a shortcut no app would ever suggest. It raises a quiet question about our own moment: as we hand more and more of our knowing to devices, are we slowly losing the kind of deep, embodied knowledge that once carried people safely across an ocean?`,
            questions: [
                `Is there a skill in your culture that's learned by doing and watching, not from books?`,
                `Do you trust technology or experienced people more when you're genuinely lost?`,
                `What kind of knowledge do you think we're at risk of losing as we rely more on devices?`
            ]
        }
    },
    {
        id: `cl-silk-road-exchange`,
        location: `The Silk Road, roughly 200 BCE onward`,
        title: `What Travels With the Traveller`,
        teaser: `The goods were the smallest thing being carried.`,
        insight: `For centuries, merchants along the Silk Road carried silk, spices, and silver — but alongside the goods travelled religions, recipes, instruments, words, and stories, passing between civilisations that never met directly. The trade route was almost a side effect; the deeper exchange was cultural. Outsiders often picture travel as seeing places, but this reveals travel as mixing them — a slow blending where an idea born in one place quietly takes root a continent away. The human meaning: movement spreads more than objects. Wherever people go, a little of where they came from goes with them, and a little of where they've been comes back.`,
        question: `When you travel, do you think you're changed more by the places you see — or by the people you meet along the way?`,
        upgrade: {
            term: `cross-pollinate`,
            type: `verb`,
            def: `When ideas, styles, or cultures mix and influence each other.`,
            in_action: `That city's food is amazing because so many cultures cross-pollinated there for centuries.`,
            review_prompt: `Name a food, word, or style in your country that clearly came from somewhere else. How did it arrive?`
        },
        deeper: {
            text: `We tend to imagine cultures as separate boxes — this one here, that one there — but a route like the Silk Road shows how leaky those boxes have always been. An instrument plucked in one empire reappears, reshaped, in another. A faith carried by a few travelling believers becomes the heart of a distant society. The misunderstanding many people hold is that cultures are "pure" and that mixing is modern — when in truth, blending has been the normal state of human life for as long as people have moved. There's a contrast of styles worth noticing too: some cultures take pride in absorbing outside influences and remixing them, while others work hard to protect what they see as authentic and untouched. Both instincts are understandable. The interesting question is what we each think is worth keeping pure, and what's better left open to the world.`,
            questions: [
                `Is there something in your culture that's clearly borrowed from elsewhere but now feels completely "yours"?`,
                `Do you think a culture is stronger when it stays distinct, or when it mixes freely?`,
                `Have you ever brought a habit or taste home from abroad that your friends or family picked up too?`
            ]
        }
    },
    {
        id: `cl-grand-tour`,
        location: `Europe, 17th–19th centuries`,
        title: `Travel as Finishing School`,
        teaser: `A journey designed to make you a certain kind of person.`,
        insight: `For roughly two centuries, wealthy young Europeans were sent on a long tour of the continent — not for fun, but to acquire taste, languages, confidence, and social polish before taking their place in society. Travel here was deliberately educational, almost a finishing school on the move. To modern eyes it can look like a privileged holiday, but the underlying idea is one we've quietly kept: that going out into the world forms you in ways staying home cannot. The human meaning: some cultures and classes have long treated travel as a rite of passage — proof you've grown up — rather than as leisure.`,
        question: `Do you think travelling actually teaches you things you couldn't learn at home — or is that idea a bit overstated?`,
        upgrade: {
            term: `worldly`,
            type: `adjective`,
            def: `Experienced and knowledgeable about life, people, or culture beyond your own narrow world.`,
            in_action: `Travel made him more worldly, but not necessarily wiser about everything.`,
            review_prompt: `Can someone become worldly without travelling much? What would give them that quality?`
        },
        deeper: {
            text: `The Grand Tour belonged to a tiny, wealthy few, and that's part of what makes it interesting now — because the idea behind it has gone fully mainstream. The modern "gap year," the post-graduation backpacking trip, the belief that a young person should "see the world" before settling down: all of these are the Grand Tour's democratic grandchildren. But the assumption deserves a gentle poke. Does travel really form character, or do we just credit it because the people who could afford to travel were already going to turn out fine? Someone from a culture without this tradition might reasonably point out that wisdom, taste, and confidence can grow just as well from staying, working, raising a family, or reading deeply at home. The question of whether you must leave to grow is far less settled than the travel industry would like us to believe.`,
            questions: [
                `In your culture, is travelling young seen as important for growing up — or as a luxury or even a distraction?`,
                `Do you know someone wise and worldly who has barely travelled at all?`,
                `If you had a free year at eighteen, would you have spent it travelling, working, or studying — and why?`
            ]
        }
    },
    {
        id: `cl-sahara-caravans`,
        location: `The Sahara, medieval and early-modern periods`,
        title: `Where One Mistake Could Kill You`,
        teaser: `Months of desert, and survival hanging on memory.`,
        insight: `Crossing the Sahara by caravan could take months, and survival depended entirely on guides who held the route, the animals, and the hidden wells in living memory. A single wrong turn could end everyone. To us, comfortable with maps and rescue, it's hard to grasp travel where error meant death and trust in your guide was absolute. The human meaning underneath: for most of history, going somewhere meant placing your life in the hands of a person who knew the way — and travel was less about freedom than about whom you could trust to get you through.`,
        question: `Could you put your life in the hands of a guide or stranger who knew the way, the way desert travellers had to — or does that idea unsettle you?`,
        upgrade: {
            term: `at the mercy of`,
            type: `idiom`,
            def: `Completely dependent on something or someone you can't control.`,
            in_action: `Out there you're at the mercy of the weather and whoever's leading you.`,
            review_prompt: `When travelling, when have you been at the mercy of someone or something? How did it feel?`
        },
        deeper: {
            text: `Modern travel has quietly removed almost all of this. We carry maps in our pockets, summon help with a tap, and rarely have to trust a single human being with our survival. That's an enormous gain — but it may have changed the texture of travel itself. The desert crossing bound a group together through shared danger and total reliance on a guide's memory; the journey was the relationship. Some argue that the safety and independence of modern travel, wonderful as they are, have made it lonelier and lighter — you need no one, so you bond with no one. A traveller from a high-trust, guide-dependent tradition might find our solo, app-led wandering strangely isolated. It's worth asking what we've traded away along with the danger: perhaps some of the deep trust and togetherness that only real shared risk can create.`,
            questions: [
                `Do you think modern travel is lonelier now that we rarely have to rely on other people?`,
                `Have you ever bonded with someone quickly because you were both out of your depth somewhere?`,
                `Would you feel safer with a map and a phone, or with a person who truly knew the place?`
            ]
        }
    },
    {
        id: `cl-antarctic-isolation`,
        location: `Antarctica, late 19th–early 20th centuries`,
        title: `Surviving the Dark`,
        teaser: `Months of darkness, no rescue, and routine as a lifeline.`,
        insight: `Early Antarctic expeditions faced months of darkness, brutal cold, and no possibility of rescue. Some crews endured not only through physical toughness but through strict daily routines — meals, tasks, shared rituals — that protected their minds from the crushing isolation. The surprise here is that the deadliest threat wasn't always the cold but the emptiness, and that the cure was structure. The human meaning underneath: when the outside world disappears entirely, ordinary routine stops being boring and becomes the thing that holds a person together.`,
        question: `When you've been isolated or stuck somewhere, what kept you steady — routine, people, distraction, or something else?`,
        upgrade: {
            term: `anchor`,
            type: `noun`,
            def: `Something that keeps you steady, calm, or connected when life feels difficult or uncertain.`,
            in_action: `During those long dark weeks, the daily routine became an anchor — it gave everyone something to hold on to.`,
            review_prompt: `What routines or small rituals can become an anchor when life feels uncertain?`
        },
        deeper: {
            text: `There's a powerful lesson buried in those frozen expeditions about what humans actually need to stay sane, and it isn't comfort — it's structure and meaning. Crews that kept fixed mealtimes, gave everyone a job, and marked small occasions tended to hold together; those that let the days blur into shapeless dark struggled. We saw a faint, mass echo of this during long lockdowns, when many people discovered that loose, empty days were harder on the mind than busy ones, and that small rituals — a morning walk, a set mealtime — quietly kept them afloat. It suggests something counter-intuitive: freedom from all routine, which sounds like paradise, can actually be destabilising, while a little imposed order can be deeply protective. The polar crews understood, long before psychology had the words for it, that the mind needs a scaffold — especially when the world outside goes dark.`,
            questions: [
                `Have you ever found that having a routine helped you more than having total freedom?`,
                `During a hard or empty stretch of time, what small rituals kept you going?`,
                `Why do you think too much unstructured freedom can actually be hard on people?`
            ]
        }
    },
    {
        id: `cl-one-way-crossing`,
        location: `Transoceanic migration, 19th–early 20th centuries`,
        title: `The Journey With No Return`,
        teaser: `Everything you owned, and no way back.`,
        insight: `Millions crossed oceans in cramped lower-decks with everything they owned in one bag and no real prospect of returning. For them, travel was not adventure or escape for a season — it was a permanent break with one life and the uncertain start of another. To anyone whose travel always assumes a return ticket, this is a profoundly different act. The human meaning underneath: for much of history, and for many still today, leaving has been one-way and irreversible — not a holiday from your life, but the end of one version of it and the gamble on another.`,
        question: `Could most people leave home for good — no return, only what they could carry — if it meant a better chance elsewhere? What do you think would make that possible?`,
        upgrade: {
            term: `one-way journey`,
            type: `noun phrase`,
            def: `A journey made without a realistic chance of returning to the life you left behind.`,
            in_action: `For many migrants, the crossing was a one-way journey — not an adventure, but the start of a completely different life.`,
            review_prompt: `What makes a one-way journey feel different from a trip with a return ticket?`
        },
        deeper: {
            text: `It's worth holding the two kinds of journey side by side: the modern traveller, who leaves precisely because they know they can come home, and the one-way migrant, who leaves knowing they almost certainly can't. Those are nearly opposite emotional experiences hiding inside the same word, "travel." The return ticket changes everything — it makes a journey an experience rather than a fate. This still shapes how different people hear the word today: for someone whose family arrived as migrants or refugees, "travelling abroad" may carry a weight and an ache that a casual holidaymaker never feels. The same flight can be an adventure for one passenger and the hardest decision of a life for the person in the next seat. Remembering that gap is part of travelling thoughtfully — knowing that the freedom to come home is itself a kind of privilege not everyone has ever had.`,
            questions: [
                `Does your family have a story of someone who left home for good? What do you know of it?`,
                `How is travelling for fun different, emotionally, from being forced to leave?`,
                `Do you think people who can always return home travel differently from those who can't?`
            ]
        }
    },
    {
        id: `cl-backpacker-identity`,
        location: `Global, late 20th century to today`,
        title: `When the Trip Never Really Ends`,
        teaser: `Some build a whole life out of not staying.`,
        insight: `From the late twentieth century on, some travellers stopped taking trips and started living them — countries as temporary homes, friendships built fast and left behind, each place a chapter rather than a destination. To an outsider it can look enviable or aimless depending on their own values. The human meaning underneath: when travel stops being a break from ordinary life and becomes the shape of it, the experience of any single place changes too — and it becomes worth asking whether always moving means you're really arriving anywhere.`,
        question: `Does constant travel sound like freedom to you — or do you think each place starts to feel a little less special when there's always another one coming?`,
        upgrade: {
            term: `wanderlust`,
            type: `noun`,
            def: `A strong, restless desire to travel and keep seeing new places.`,
            in_action: `Her wanderlust never faded — she's never lived anywhere more than a year.`,
            review_prompt: `Do you have wanderlust, or do you feel happiest somewhere familiar? Why do you think that is?`
        },
        deeper: {
            text: `This way of living exposes a real difference in values that runs across cultures and even within families. In some traditions, a person who keeps moving and won't settle is admired as free, brave, and open; in others, the very same person is quietly seen as rootless, unserious, or running from something. Neither reading is simply correct — they come from genuinely different ideas about what a good life is. The settled person looks at the wanderer and sees someone missing out on deep roots, lasting friendship, and a place to belong. The wanderer looks back and sees someone trapped by routine and afraid of the unknown. Both can be a little right. What's interesting is to notice which instinct lives more strongly in you — and where you got it: from your family, your culture, your generation, or your own restlessness or need for home.`,
            questions: [
                `In your culture, is a person who never settles admired, pitied, or quietly judged?`,
                `Do you think you can build deep friendships while constantly moving — or does closeness need time and place?`,
                `Where do you think your own pull toward roots or movement comes from?`
            ]
        }
    },
    {
        id: `cl-digital-nomads`,
        location: `Global, 21st century`,
        title: `Living Here, Working There`,
        teaser: `A life stretched across two places at once.`,
        insight: `Technology now lets some people live in one country while working for another, blurring old ideas of home, nation, and the boundary between work and travel. The journey is no longer a break from ordinary life — it becomes the structure of life itself. What looks like a permanent holiday is often something stranger: belonging fully to nowhere. The human meaning underneath: when you can leave at any moment, the meaning of "staying" changes too — and it becomes a real question whether you can truly belong to a place you're always free to walk away from.`,
        question: `Does working while travelling still feel like travel to you — or does it quietly turn the journey into ordinary life in a different postcode?`,
        upgrade: {
            term: `untethered`,
            type: `adjective`,
            def: `Not strongly tied to one place, routine, or way of life.`,
            in_action: `The freedom was exciting at first, but after a while he started to feel untethered rather than free.`,
            review_prompt: `When might feeling untethered be exciting, and when might it feel lonely?`
        },
        deeper: {
            text: `There's a quiet trade-off inside this lifestyle that its glossy images rarely show. The freedom is real — to follow good weather, low costs, or simple curiosity, untied to one place. But belonging tends to be built from the very things this life avoids: staying through the dull stretches, knowing your neighbours over years, being part of a place when it's inconvenient as well as when it's lovely. A traveller who's always passing through often experiences a place as a guest sees it — the surface, the highlights — rather than as a resident knows it, with all its tedium and depth. Different cultures weigh this differently: some prize the freedom and adaptability, others quietly believe you only really know a place once you've been stuck in it through a hard winter. It raises an honest question about our connected age — whether the freedom to be everywhere has quietly cost us the deeper belonging that only comes from being somewhere, fully, for a long time.`,
            questions: [
                `Do you think you can know a place properly as a visitor, or only by living through its ordinary, boring times?`,
                `Would a life of working remotely from beautiful places appeal to you, or wear thin?`,
                `What do you think actually makes someone "belong" to a place — time, effort, or something else?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-first-pull`,
        title: `The Pull of Elsewhere`,
        desc: `First reactions to travel — the wanting, the arriving, and the places that stick with you.`,
        icon: `react`,
        moments: [
            {
                id: `moment-departures-board`,
                preview: `That feeling before you've gone anywhere.`,
                text: `You're standing in an airport or station, bags packed, the board flickering with places you've never been. What does that exact moment feel like to you — excitement, nerves, freedom, or something harder to name?`,
                upgrade: {
                    term: `itchy feet`,
                    type: `idiom`,
                    def: `A restless urge to travel or move on from where you are.`,
                    in_action: `I'd only been home three weeks and I already had itchy feet.`,
                    review_prompt: `When was the last time you got itchy feet — what set it off?`
                }
            },
            {
                id: `moment-place-surprised`,
                preview: `Nothing like the postcard.`,
                text: `Think of a place that turned out completely different from what you expected — better, worse, or just stranger. What had you imagined, and what was actually there when you arrived?`,
                upgrade: {
                    term: `fall short`,
                    type: `phrasal verb`,
                    def: `To be less good, impressive, or satisfying than expected.`,
                    in_action: `The city looked amazing online, but the actual trip fell short of what I had imagined.`,
                    review_prompt: `Has a famous place ever fallen short for you? What was missing?`
                }
            },
            {
                id: `moment-first-foreign`,
                preview: `The first hour in a country that isn't yours.`,
                text: `Remember arriving somewhere that felt genuinely unfamiliar — abroad, or even somewhere in your own country. The smell of the air, the signs you couldn't quite read, the money that felt like toy money. What's the detail that's stayed with you?`,
                upgrade: {
                    term: `sensory overload`,
                    type: `noun phrase`,
                    def: `The feeling of too much to take in at once through the senses.`,
                    in_action: `Stepping out of that station was total sensory overload — noise, colour, smell, all at once.`,
                    review_prompt: `Describe a place that gave you sensory overload — what hit you first?`
                }
            },
            {
                id: `moment-got-lost`,
                preview: `Lost, with no common language.`,
                text: `You're somewhere unfamiliar, properly lost, and nobody around speaks your language. How do you usually handle it — panic, point and gesture, follow your gut, or just wander until something makes sense?`,
                upgrade: {
                    term: `wing it`,
                    type: `phrasal verb`,
                    def: `To manage without a plan, improvising as you go.`,
                    in_action: `We had no map and no signal, so we just winged it and somehow found the hotel.`,
                    review_prompt: `Tell me about a time you had to wing it abroad — how did it go?`
                }
            },
            {
                id: `moment-go-back`,
                preview: `The one you'd return to tomorrow.`,
                text: `Some places you tick off and never think about again; one or two you'd go back to in a heartbeat. Which place keeps pulling you back, and what is it that won't let go?`,
                upgrade: {
                    term: `stick with you`,
                    type: `phrasal verb`,
                    def: `To stay in your mind or feelings for a long time.`,
                    in_action: `I was only there for two days, but that little town really stuck with me.`,
                    review_prompt: `What place has stuck with you most — and what keeps it there?`
                }
            }
        ],
        makeItReal: {
            title: `The trip you'd take tomorrow`,
            prompt: `Picture the trip you'd take tomorrow if time and money were no object — not the dream resort, but a place that genuinely pulls at you. Where would you go, and what is it really about that place that draws you? Tell the story of the pull.`
        }
    },
    {
        id: `set-why-we-go`,
        title: `Tourist or Traveller`,
        desc: `Why we travel, what kind of traveller we really are, and the ethics of how we go.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-tourist-traveller`,
                preview: `Two words people get oddly proud about.`,
                text: `Some people insist there's a difference between a "tourist" and a "traveller," and quietly think one is better. Do you think there's a real difference — and is anyone honestly above being a tourist?`,
                upgrade: {
                    term: `look down on`,
                    type: `phrasal verb`,
                    def: `To think of someone as inferior or less worthy.`,
                    in_action: `He looks down on package holidays, but he's just on a slightly fancier one.`,
                    review_prompt: `Is there a kind of traveller people look down on unfairly? Who, and why?`
                }
            },
            {
                id: `moment-escape-or-discover`,
                preview: `Running towards, or running away.`,
                text: `People travel for very different reasons — to discover something new, or to escape something at home. When you think about your own trips, which has it usually been, and does the reason change the trip?`,
                upgrade: {
                    term: `a change of scenery`,
                    type: `noun phrase`,
                    def: `A new environment, wanted as relief from the familiar.`,
                    in_action: `I wasn't chasing adventure — I just needed a change of scenery.`,
                    review_prompt: `When has a change of scenery actually helped you? What shifted?`
                }
            },
            {
                id: `moment-trip-went-wrong`,
                preview: `The disaster that became the best story.`,
                text: `Often the trip where everything went wrong — missed trains, lost bags, terrible weather — becomes the one you tell most. Why do you think the disasters make the best stories, while the perfect trips fade?`,
                upgrade: {
                    term: `go pear-shaped`,
                    type: `idiom`,
                    def: `To go badly wrong, often unexpectedly.`,
                    in_action: `The whole plan went pear-shaped the moment we missed the ferry.`,
                    review_prompt: `Tell me about a trip that went pear-shaped — and was it worth it in the end?`
                }
            },
            {
                id: `moment-package-vs-rough`,
                preview: `Everything arranged, or nothing arranged.`,
                text: `Some travellers want every detail booked and smooth; others want no plan, rough edges, room for things to go sideways. Which are you, and what do you think each kind of traveller gains — and misses?`,
                upgrade: {
                    term: `off the beaten track`,
                    type: `idiom`,
                    def: `Away from the usual, well-known routes.`,
                    in_action: `We skipped the big sights and stayed somewhere off the beaten track.`,
                    review_prompt: `Is "off the beaten track" always better, or is that a bit of a myth?`
                }
            },
            {
                id: `moment-ethics-of-going`,
                preview: `The crowd you're part of without meaning to be.`,
                text: `Some famous places are now overwhelmed by their own popularity — crowds, rising prices, locals priced out. When you visit somewhere like that, do you ever feel part of the problem, or is that someone else's worry?`,
                upgrade: {
                    term: `love something to death`,
                    type: `idiom`,
                    def: `To harm something through too much enthusiasm or attention.`,
                    in_action: `That little fishing village got loved to death — now it's all souvenir shops.`,
                    review_prompt: `Name a place that's been loved to death. What was lost?`
                }
            }
        ],
        makeItReal: {
            title: `The journey that meant something`,
            prompt: `Think back to a journey that mattered to you — not necessarily the most beautiful one, but one that meant something. What were you really going for, and did the trip give you that, or something you didn't expect? Tell the story of why you went.`
        }
    },
    {
        id: `set-changed-by-going`,
        title: `Home, Seen from Away`,
        desc: `What the journey leaves behind — in how you see home, other people, and yourself.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-home-different`,
                preview: `Your own front door, suddenly strange.`,
                text: `Coming home after a long trip, your own city can look briefly unfamiliar — smaller, stranger, or somehow not quite yours anymore. Have you felt that? What looked different when you got back?`,
                upgrade: {
                    term: `see something with fresh eyes`,
                    type: `idiom`,
                    def: `To notice something familiar as if for the first time.`,
                    in_action: `After a year away, I saw my hometown with fresh eyes — the good and the dull.`,
                    review_prompt: `What did you see with fresh eyes after time away? What stood out?`
                }
            },
            {
                id: `moment-foreigner-feeling`,
                preview: `The day you were the outsider.`,
                text: `Travelling makes you the foreigner — the one who doesn't know the rules, the one being patient with. What did it teach you about being on the other side, when you're usually the one who belongs?`,
                upgrade: {
                    term: `fish out of water`,
                    type: `idiom`,
                    def: `Someone who feels out of place in unfamiliar surroundings.`,
                    in_action: `First day there I was a total fish out of water — couldn't even order coffee right.`,
                    review_prompt: `When did you most feel like a fish out of water abroad? What made it ease?`
                }
            },
            {
                id: `moment-changed-you`,
                preview: `Something a journey rearranged in you.`,
                text: `People say travel changes you, though it's hard to pin down how. Looking back at a real trip, did something actually shift in how you saw your life or what you wanted — or is that more myth than truth?`,
                upgrade: {
                    term: `a shift in perspective`,
                    type: `noun phrase`,
                    def: `A change in how you see a situation, often after experiencing or comparing something different.`,
                    in_action: `That trip gave me a real shift in perspective — I came home less worried about things that used to feel huge.`,
                    review_prompt: `Has a trip ever given you a shift in perspective? What changed?`
                }
            },
            {
                id: `moment-stay-or-go`,
                preview: `The ones who left, and the ones who stayed.`,
                text: `Some people build a whole life around movement; others can't imagine leaving where they're from. Where do you fall — and do you think constant travelling makes you freer, or just harder to root anywhere?`,
                upgrade: {
                    term: `branch out`,
                    type: `phrasal verb`,
                    def: `To try something new or extend your life beyond what's familiar and safe.`,
                    in_action: `After years in the same city, she felt she needed to branch out — somewhere no one knew her.`,
                    review_prompt: `When did you last branch out — travel or otherwise? Did it pay off?`
                }
            },
            {
                id: `moment-souvenir-meaning`,
                preview: `The thing you brought back that wasn't a thing.`,
                text: `The best thing people bring home from travel often isn't an object — it's a habit, a taste, a way of seeing, a word they kept using. What have you carried back from somewhere that quietly stuck with you?`,
                upgrade: {
                    term: `rub off on`,
                    type: `phrasal verb`,
                    def: `When a quality or habit passes from one person or place to you.`,
                    in_action: `Their slower way of eating really rubbed off on me after that summer.`,
                    review_prompt: `What rubbed off on you from a place you visited? Has it lasted?`
                }
            }
        ],
        makeItReal: {
            title: `What the going gave you`,
            prompt: `Think of one journey that left a real mark — somewhere that shifted how you see home, other people, or your own life, even slightly. What did you carry back that's still with you now? Tell the story of what the going gave you.`
        }
    }
];
