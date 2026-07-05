/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Family & Belonging
  --------------------------------------------------------------------------
  A premium interactive speaking module for exploring the unchosen bonds
  of family — the roles, duties, and inheritances that shape who we are.
  Built for live lessons, thoughtful discussion, and sharper awareness
  of obligation, belonging, and what we carry forward.
  Subject content may change.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/

const MODULE = {
    id: 'family-belonging',
    schemaVersion: 1,
    contentVersion: '1.0.0',
    title: 'Family & Belonging',
    titleHtml: 'Family &amp; <em>Belonging</em>',
    navTitle: 'Family',
    bgImage: 'https://plus.unsplash.com/premium_photo-1661455879453-0074b541e205?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D'
};

const subjectCopy = {
    cover: {
        hook: `No one can embarrass you quite like the people who knew you first — the ones who remember every old version of you.`
    },
    overview: {
        heading: `The Ties You Inherit`,
        intro: [
            `Family is the belonging that arrives before choice: a name, a face people recognise, a story retold at every gathering, a duty nobody voted on, and the strange moment someone says you're exactly like a person you never meant to become.`,
            `This subject follows what families hand down — roles, recipes, tempers, jokes, obligations, names — and why the people we come from can be funny, tender, awkward, maddening, and still somehow ours.`
        ]
    },
    paths: {
        culturalLensDescription: `Discover how different cultures answer the most fundamental family questions — who counts as kin, what you owe the people you were born to, and what gets passed on through the generations.`,
        discussionDescription: `Talk through the characters, duties, inheritances, and unspoken rules of family life — from quick reactions to the relatives everyone has an opinion about, to deeper questions about obligation, belonging, and what we carry forward.`,
        reflectionTitle: `Complete the Conversation`,
        reflectionDescription: `Carry something forward — a thought about what families hand down, and what people choose to keep.`
    },
    culturalLens: {
        heading: `Family across cultures and history`,
        intro: `Who counts as family, who you owe something to, and what gets passed down — these are questions every culture answers differently. From households spanning many generations to naming customs that carry the memory of the dead, from birth order that once fixed your entire future to bonds deliberately created and loaded with real duty, the shape of family turns out to be less fixed than it first appears. What feels like the obvious arrangement in one culture is one option among many.`
    },
    discussion: {
        heading: `The Ties You Didn't Choose`,
        intro: `Family comes before you can agree to it — with roles already set, duties already implied, and a cast of characters you didn't pick. These conversations move from quick, recognisable reactions to the relatives everyone has an opinion about, into the deeper questions of obligation, inheritance, and belonging that family quietly raises for everyone. The closer you look, the more there is to say. Choose a set to begin.`
    },
    reflection: {
        title: `Complete the Conversation`,
        summary: `You've explored family as the one belonging that arrives unchosen — across cultures and history, through the characters and duties and inheritances that shape a life, and through what it means to belong somewhere nobody signs up for. These are conversations worth sitting with: how obligation works, what gets passed forward, and what it means to come from somewhere in particular.`,
        questions: [
            `Looking back at the cultural examples today, which approach to family did you find most appealing — and which would be hardest to imagine living inside?`,
            `Think about the things families hand down — a role, a saying, a duty, an expectation. Which kind do you think is hardest to put down once it's been handed to you?`,
            `Which word or phrase from today gave you a more precise way to describe something about family life you'd felt but never quite named — and where might you actually use it?`
        ]
    },
    keyLanguage: {
        intro: `Higher-level expressions from this subject — with definitions and natural in-action examples.`
    }
};

const clCards = [
    {
        id: `cl-china-lineage`,
        location: `China`,
        title: `One name in a very long list`,
        teaser: `You're not just yourself — you're the latest entry in a line that runs both ways.`,
        insight: `In many Chinese family traditions, a person is understood not only as an individual but as one link between the generations that came before and those still to come. Detailed family genealogies, shared generational names, and a strong sense of continuing the line can give people a place in something much larger than a single lifetime. For someone from a more individualist background, this can be hard to feel from the outside — but the underlying idea is that who you are includes where you sit in a long, ongoing line.`,
        question: `If someone knew their family line going back hundreds of years, do you think that would make them feel rooted, pressured, proud, or trapped?`,
        upgrade: {
            term: `lineage`,
            type: `noun`,
            def: `The line of people you are descended from, traced through the generations.`,
            in_action: `He could trace his lineage back several hundred years, and you could tell he felt the weight of it.`,
            review_prompt: `Would knowing your lineage back several generations feel meaningful, heavy, or strangely distant?`
        },
        deeper: {
            text: `One reason this way of seeing family may run so deep is that, in many East Asian traditions, the family line was treated as something with real duties attached — to remember those who came before, and to provide for those who come after. Keeping a genealogy, continuing a family name, or honouring earlier generations were ways of locating yourself in a story already in progress. The contrast with a more individualist outlook is striking. Where one person feels mainly responsible for their own choices and future, another may feel quietly accountable to a line stretching in both directions. Neither is more loving; they simply answer the question "who am I?" differently — one starting from the self, the other from the line the self belongs to. Even today, the pull between those two instincts shapes decisions about names, careers, and where people choose to live.`,
            questions: [
                `What kinds of names, stories, or traditions tend to get kept alive across several generations?`,
                `Do you think people feel a real responsibility to relatives who came before them, or who will come after — or is that fading?`,
                `Do you think seeing yourself as part of a long line would feel more like support or more like pressure?`
            ]
        }
    },
    {
        id: `cl-pacific-village`,
        location: `Pacific Islands`,
        title: `A child with many parents`,
        teaser: `In some places, "who's raising you?" doesn't have a single answer.`,
        insight: `In many Pacific Island cultures, and in plenty of other communities around the world, raising a child is shared widely across the extended family rather than resting on two parents alone. Grandparents, aunts, uncles, and older cousins may all take a real, ongoing role, and children sometimes spend long stretches living with relatives as a normal part of life. To an outsider used to a tight nuclear unit, this can look confusing or even unsettling — but within these communities it can offer a child many sources of care, attention, and belonging.`,
        question: `Where you're from, is raising a child mostly down to the parents, or are grandparents and other relatives expected to be closely involved too?`,
        upgrade: {
            term: `it takes a village`,
            type: `idiom`,
            def: `The idea that raising a child well depends on a whole community, not just the parents.`,
            in_action: `My sister and I help with each other's kids constantly — honestly, it takes a village.`,
            review_prompt: `In what situations does the idea that "it takes a village" really hold true?`
        },
        deeper: {
            text: `One reason this shared approach may develop is practical as much as cultural: when households are close together and life is demanding, spreading the work of raising children across many willing hands simply makes sense. But it also reflects a particular idea of belonging — that a child is not the private project of two people, but a member of a wider web of relatives who all have a stake in how they grow up. This can sit awkwardly against the more nuclear model, where parents are expected to be the central, almost exclusive authority. A relative who "interferes" in one setting is simply "helping" in another. Children raised this way often describe a strong sense of always having someone to turn to — though some also notice they had far less privacy, and many more adults entitled to an opinion about their lives.`,
            questions: [
                `Besides parents, who else often has a real hand in raising children — and what might they give that the parents don't?`,
                `Do you think a child gains more from a close circle of one or two parents, or from a wide net of relatives?`,
                `Have you seen a relative's involvement in raising a child welcomed as help in one family and resented as interference in another?`
            ]
        }
    },
    {
        id: `cl-india-joint-family`,
        location: `India`,
        title: `The family decides together`,
        teaser: `In some homes, the big choices were never yours to make alone.`,
        insight: `In many Indian families, the joint family — several generations, and sometimes several brothers' households, sharing a home or a common economic life — has long been a central model. Major decisions about money, marriage, work, or property may be made collectively, with significant weight given to elders. For someone raised to value individual independence, this can look like a loss of personal freedom; but for many within it, the same arrangement offers security, shared burdens, and a strong, dependable safety net that a lone individual rarely has.`,
        question: `When people make a big life decision where you're from, how much do family expectations usually weigh on it — a lot, a little, or somewhere in between?`,
        upgrade: {
            term: `shared household`,
            type: `noun phrase`,
            def: `A home where several people or generations live together and share daily life.`,
            in_action: `In a shared household, childcare, money, meals, and decisions often become everyone's business.`,
            review_prompt: `What might be the best and hardest parts of living in a shared household?`
        },
        deeper: {
            text: `One reason a collective model may hold so strongly is that it spreads risk: when one person loses a job, falls ill, or faces a crisis, a larger family unit can absorb the shock far better than a single household can. The trade-off is autonomy. Decisions an individualist might consider entirely personal — who to marry, what career to pursue, where to live — can become matters the wider family feels entitled to weigh in on. This is where misunderstanding often arises across cultures. What one person experiences as warm, supportive involvement, another experiences as pressure or control. And as cities grow and younger generations move away for work, many families are now negotiating a middle path — staying closely connected and mutually responsible, while living more independently than their parents or grandparents did.`,
            questions: [
                `Are there decisions most people would consider entirely their own that, in some families, the whole family would expect a say in?`,
                `Do you think shared family decision-making offers more security or more restriction — and might that change at different stages of life?`,
                `Have you noticed the balance between family involvement and independence shifting between generations in families you know?`
            ]
        }
    },
    {
        id: `cl-jewish-naming`,
        location: `Jewish communities`,
        title: `A name that remembers someone`,
        teaser: `The person you're named after may say more than the name itself.`,
        insight: `In many Jewish families, children are named in honour of a relative — and the custom can run in opposite directions. In many Ashkenazi communities, children are traditionally named after a relative who has died, keeping that person's memory alive in a new life. In many Sephardic communities, by contrast, naming a child after a living grandparent is a cherished honour. Either way, a name is not just a label but a thread of memory and connection. For an outsider, it's easy to miss how much family history a single first name can quietly carry.`,
        question: `Where you're from, is it common to name a child after a relative — and does it tend to mean something when it happens?`,
        upgrade: {
            term: `namesake`,
            type: `noun`,
            def: `A person named after someone else, or the person they were named for.`,
            in_action: `I'm my grandfather's namesake, so his name turns up every time someone calls me.`,
            review_prompt: `What does it mean to be someone's namesake, and why might a family choose that?`
        },
        deeper: {
            text: `Naming customs are one of the quietest but most powerful ways families carry memory forward. A name chosen to honour a grandparent, a lost sibling, or an admired ancestor turns an everyday word into a small act of remembrance, repeated every time the name is spoken. Different traditions encode different values in this: naming after the dead can express continuity and respect for those who came before, while naming after the living can celebrate a bond in the present. The same logic appears far beyond any one community — in families who reuse a name every generation, who pass down a middle name, or who name a child after a place or person that mattered. The interesting tension is between honouring the past and letting a child be entirely their own person, free of someone else's story.`,
            questions: [
                `What kinds of names carry a story or a connection to someone else?`,
                `Do you think being named after a relative is more of a gift, or more of a quiet expectation to live up to?`,
                `If someone were naming a child, would honouring a relative or choosing a wholly new name be the better gift — and why?`
            ]
        }
    },
    {
        id: `cl-primogeniture`,
        location: `Historical Europe`,
        title: `Everything to the eldest`,
        teaser: `For centuries, your whole future could be decided by the order you were born in.`,
        insight: `Across much of European history, the custom of primogeniture meant the eldest son typically inherited the land, the title, and the family wealth, while younger sons and daughters had to find another path — often the church, the military, marriage, or migration. A person's prospects could be set not by talent or effort, but simply by their position in the birth order. To modern eyes this seems strikingly unfair, but it had a cold logic: it kept estates whole rather than splitting them into ever-smaller, weaker pieces.`,
        question: `In families you know, does birth order still seem to shape what's expected of people — the eldest, the youngest, the middle child?`,
        upgrade: {
            term: `birthright`,
            type: `noun`,
            def: `Something you're entitled to simply by being born into a particular family or position.`,
            in_action: `Running the company felt like his birthright — he'd assumed it was his since he was a boy.`,
            review_prompt: `Is there something — a role, a name, an expectation — treated as someone's birthright in a family you know?`
        },
        deeper: {
            text: `Although formal primogeniture has largely faded, its echo lingers wherever something valuable must pass to the next generation. Family businesses still wrestle with who takes over; family homes, names, and even unspoken roles still tend to land on particular shoulders, often the eldest. Birth order continues to carry quiet expectations — the eldest cast as responsible and dependable, the youngest as freer but less seriously regarded. None of this is destiny, and plenty of families overturn it completely. But the old pattern reveals something that still matters: inheritance is rarely only about money. What gets handed down includes duties, reputations, and assumptions about who is "meant" to carry the family forward — and being passed over, or being the one chosen, can shape a person's sense of their place for life.`,
            questions: [
                `What roles or expectations tend to get attached to being the oldest, the youngest, or somewhere in the middle?`,
                `Do you think birth order genuinely shapes people, or do we just enjoy the stories we tell about it?`,
                `Have you seen a family business or family role pass down in a way that caused tension over who "should" get it?`
            ]
        }
    },
    {
        id: `cl-east-asian-sibling-terms`,
        location: `China, Korea & Vietnam`,
        title: `No simple word for "brother"`,
        teaser: `In some languages, you can't mention a sibling without marking who's older.`,
        insight: `In many East Asian languages, there isn't a single neutral word for "brother" or "sister" — you must specify older or younger, and often use different terms again for relatives on each side of the family. Birth order and seniority are built right into everyday speech, so respect for elders is reinforced every time family is mentioned. For a speaker of a language with one all-purpose word like "brother," this can be surprising: a whole quiet system of hierarchy and respect is doing its work inside words that seem, at first, completely ordinary.`,
        question: `In your language, are words for siblings and relatives mostly neutral, or do they mark age, side of the family, or status?`,
        upgrade: {
            term: `seniority`,
            type: `noun`,
            def: `The status that comes from being older or higher in rank within a group or family.`,
            in_action: `At family dinners, seniority quietly shapes who speaks first, who gets listened to, and who is expected to wait.`,
            review_prompt: `How can seniority show itself in a family without anyone saying it directly?`
        },
        deeper: {
            text: `Language doesn't just describe family relationships; it can quietly train how people feel about them. When a child grows up unable to refer to a sibling without naming who is older, age order becomes part of the texture of everyday life rather than an abstract rule to be taught. In some Korean families, even twins may still be understood through this older-younger order, with the first-born twin treated as senior by a matter of minutes. This often connects to wider expectations: an older sibling may carry real responsibility for younger ones, and may also receive particular respect in return. To an outsider, the system can look rigid, but it can also be reassuring — everyone knows where they stand and what is expected of them. The contrast with cultures that play down hierarchy between siblings is sharp. In one, calling an older brother by a special respectful term feels natural and warm; in another, treating siblings as equals regardless of age is precisely the point. Both are teaching children something about fairness and respect — just very different lessons.`,
            questions: [
                `Does being older or younger tend to come with particular duties, privileges, or expectations where you're from?`,
                `Do you think a clear seniority order between siblings is more reassuring or more limiting?`,
                `Are there words in your language that carry respect or status which are hard to translate into another language?`
            ]
        }
    },
    {
        id: `cl-western-independence`,
        location: `United States & Northern Europe`,
        title: `The day you're supposed to leave`,
        teaser: `In some places staying close is care; in others, it can look like never growing up.`,
        insight: `In much of the United States and Northern Europe, leaving the family home in early adulthood — for university, work, or simply independence — is widely treated as a natural sign of maturity. Moving out, paying your own way, and "standing on your own" can be sources of real pride. Seen from a culture where staying close to family is the loving default, this can look surprisingly cold, even like abandoning your parents. Seen from within, it's not rejection at all — it's how care and respect are expressed: by becoming someone who doesn't need to be looked after.`,
        question: `In your culture, when is someone "supposed" to leave home — and is staying longer seen as sensible, or as not quite growing up?`,
        upgrade: {
            term: `self-reliant`,
            type: `adjective`,
            def: `Able to manage your own life without depending too much on other people.`,
            in_action: `His parents wanted him to become self-reliant early, so moving out was treated as a normal step, not a rejection.`,
            review_prompt: `When does becoming self-reliant feel healthy, and when can it feel lonely?`
        },
        deeper: {
            text: `The age at which someone leaves home — and whether leaving is even expected at all — is one of the clearest places where ideas about family quietly diverge. In more individualist cultures, early independence is read as healthy and admirable; an adult child still living at home may face gentle questions about when they'll "move on." In many other cultures the opposite holds: remaining close, sharing a home, and caring for parents directly is the obvious expression of a good family. Neither is simply right. But the gap causes real misreadings. One person sees independence as strength and distance as freedom; another sees the same distance as a failure of duty, and closeness as love. As economies shift and housing grows expensive, even strongly individualist cultures are seeing more adult children stay or return home — and quietly renegotiating what that's supposed to mean.`,
            questions: [
                `When you picture a healthy adult relationship with parents, does it involve living near them, far from them, or does distance not matter much?`,
                `Have you seen someone judged — fairly or unfairly — for living with their parents as an adult?`,
                `Do you think living far from family tends to strengthen independence, weaken the bond, or both?`
            ]
        }
    },
    {
        id: `cl-akan-matrilineal`,
        location: `Ghana (Akan tradition)`,
        title: `Your uncle, not your father`,
        teaser: `In some families, the most important man in a child's life isn't the one you'd expect.`,
        insight: `In the matrilineal tradition of the Akan people of Ghana, descent and inheritance pass through the mother's line rather than the father's. This can mean a child belongs primarily to the mother's family, and that a man's heirs are traditionally his sister's children rather than his own — giving the maternal uncle a central role in a child's upbringing and future. For someone who assumes family runs through the father's name and wealth, this can be genuinely surprising: it shows that even "who counts as your closest relative" is shaped by culture, not fixed by nature.`,
        question: `In families where you're from, does one side — the mother's or the father's — often end up feeling closer or more central? Why might that be?`,
        upgrade: {
            term: `next of kin`,
            type: `noun phrase`,
            def: `Your closest living relative, often the one with recognised responsibility for you.`,
            in_action: `The form asked for my next of kin, and I realised I wasn't sure whether to put my brother or my mother.`,
            review_prompt: `Who counts as a person's next of kin, and what tends to make them the obvious choice?`
        },
        deeper: {
            text: `Matrilineal systems are a powerful reminder that the shape of a family is not simply given by biology — it is decided by the rules a culture chooses to follow. In a society that traces belonging and inheritance through mothers, a father may love his children deeply while his formal duties and wealth flow towards his sister's children instead. To outsiders this can seem strange, even unfair, but it has its own coherence: it binds the mother's line tightly together and gives every child a clear, dependable place within it. The wider lesson reaches beyond any one tradition. Around the world, cultures answer basic questions — whose name you take, whose property you inherit, who is responsible for you — in strikingly different ways. What feels like the obvious, natural arrangement to one family is simply one option among many, and often the reverse of what another family takes for granted.`,
            questions: [
                `Whose family name do people take where you're from, and what happens to that name when people marry?`,
                `Have you noticed one side of a family tending to be closer or more involved than the other, in families you know?`,
                `Does it surprise you that something as basic as "who your closest relative is" can be decided so differently across cultures?`
            ]
        }
    },
    {
        id: `cl-compadrazgo`,
        location: `Latin America`,
        title: `Family you choose on purpose`,
        teaser: `Some bonds are deliberately made into family — with duties to match.`,
        insight: `In much of Latin America — and in parts of southern Europe and the Philippines — the bond of compadrazgo, or godparenthood, creates a serious, lasting tie that goes well beyond a religious formality. Godparents (padrinos) take on real responsibility for a child, and the two sets of parents become compadres — a kind of chosen kin, bound by mutual obligation and respect. For an outsider who thinks of a godparent as a mostly symbolic role, the depth of this can be surprising: here, family is something you can deliberately extend, with genuine duties attached, not only something you're born into.`,
        question: `Is it common where you're from for someone who isn't a blood relative to count as real family — and how does that kind of bond usually come about?`,
        upgrade: {
            term: `take under your wing`,
            type: `idiom`,
            def: `To take responsibility for guiding, protecting, or caring for someone less established than you.`,
            in_action: `My godfather took me under his wing early on — advice, introductions, the lot — and it shaped my whole start in life.`,
            review_prompt: `What does it look like when someone takes another person under their wing?`
        },
        deeper: {
            text: `The idea that family can be deliberately created — not just inherited — runs through many cultures, even if the forms differ. Godparenthood is one formal version, complete with ceremony and lifelong duties, but the same instinct appears in chosen "aunts" and "uncles" who are close family friends, in mentors who become like parents, and in tight communities where unrelated elders are treated with a relative's respect. What makes these bonds distinctive is that they carry obligation, not just affection: a true godparent is expected to step in if something happens to the parents, to guide the child, to be genuinely present. This blurs a line some assume is fixed — that family is only blood. In practice, many people's most family-like relationships are with people they're not related to at all, formed by choice and held together by a sense of duty as real as any inherited one.`,
            questions: [
                `In your culture, is godparenthood (or anything like it) a serious lifelong role, or more of a symbolic one?`,
                `What do you think turns a close friend into someone who genuinely counts as family?`,
                `Do you think a chosen family bond can carry the same weight as a blood one — or is there always a difference?`
            ]
        }
    }
];

const discussionSets = [
    {
        id: `set-the-relatives`,
        title: `The Relatives`,
        desc: `Quick reactions to the people you didn't pick but got anyway — the family characters, scenes, and habits everyone recognises.`,
        icon: `react`,
        moments: [
            {
                id: `moment-the-one-everyone-talks-about`,
                preview: `Every family has one.`,
                text: `Most families have a relative everyone has an opinion about — the one who gets mentioned before they even arrive. No names needed: what kind of relative is that usually — the loud one, the dramatic one, the difficult one, the one who went their own way?`,
                upgrade: {
                    term: `black sheep`,
                    type: `idiom`,
                    def: `The family member seen as different, difficult, or the odd one out — often spoken about more than the rest.`,
                    in_action: `Every family seems to have a black sheep — the one the others quietly talk about at every gathering.`,
                    review_prompt: `What kind of behaviour gets someone labelled the black sheep of a family?`
                }
            },
            {
                id: `moment-back-in-the-role`,
                preview: `You walk in the door and you're twelve again.`,
                text: `Some people find that the moment they're back with family, they slide straight into an old version of themselves — quieter, bossier, more childish, whatever it is. Why do you think family has that effect on people?`,
                upgrade: {
                    term: `fall back into old habits`,
                    type: `phrasal verb`,
                    def: `To return to an old way of behaving, especially when a familiar situation brings it out.`,
                    in_action: `I'm independent all year, but two days at my parents' house and I fall back into old habits — suddenly I'm the baby again.`,
                    review_prompt: `What kind of family setting makes people fall back into old habits?`
                }
            },
            {
                id: `moment-obligatory-gathering`,
                preview: `You're going. You were always going.`,
                text: `Some family events get attended not because anyone chose to, but because not going was never really an option. What kind of gathering is that usually — and is the obligation more of a comfort, a burden, or a bit of both?`,
                upgrade: {
                    term: `turn up`,
                    type: `phrasal verb`,
                    def: `To arrive or attend, especially when you feel you have to rather than because you really want to.`,
                    in_action: `Half the people at these reunions just turn up out of duty — but somehow it still matters that they came.`,
                    review_prompt: `What kind of event do people turn up to even when they'd rather stay home?`
                }
            },
            {
                id: `moment-family-saying`,
                preview: `A phrase you'd know anywhere.`,
                text: `Lots of families have a saying, a phrase, or a piece of advice that gets repeated for generations — sometimes wise, sometimes ridiculous. What kind of saying tends to survive like that, and why do they stick?`,
                upgrade: {
                    term: `hand down`,
                    type: `phrasal verb`,
                    def: `To pass something — a belief, object, saying, or tradition — from older generations to younger ones.`,
                    in_action: `That phrase got handed down from my grandmother, and now I catch myself saying it to the kids.`,
                    review_prompt: `What kind of thing — a saying, a recipe, a habit — most often gets handed down in families?`
                }
            },
            {
                id: `moment-resemblance-remark`,
                preview: `"You're just like your father."`,
                text: `At some point most people get told they're "just like" a parent or relative — in how they look, talk, or behave. When someone hears that, why can it land as a compliment, a warning, or something they'd rather argue with?`,
                upgrade: {
                    term: `the spitting image of`,
                    type: `idiom`,
                    def: `Looking almost exactly like an older family member — a striking physical resemblance.`,
                    in_action: `Everyone says I'm the spitting image of my uncle — same face, same terrible jokes, apparently.`,
                    review_prompt: `When is being the spitting image of a relative a nice thing to be told, and when isn't it?`
                }
            }
        ],
        makeItReal: {
            title: `The family character`,
            prompt: `Most families — or families you've known — have a real "character" everyone has a story about. What's the kind of thing they get known for, and how do people tend to talk about them when they're not in the room?`
        }
    },
    {
        id: `set-the-ties-that-bind`,
        title: `The Ties That Bind`,
        desc: `Go deeper into how family actually works — the duties no one signed up for, the roles each person gets handed, and the things that pass down whether you want them or not.`,
        icon: `explain`,
        moments: [
            {
                id: `moment-how-much-owed`,
                preview: `Where does duty end?`,
                text: `People disagree about how much grown children owe their parents — time, money, care, presence. Where do you think a reasonable line sits, and does it change depending on the relationship behind it?`,
                upgrade: {
                    term: `sense of duty`,
                    type: `noun phrase`,
                    def: `A feeling that you should do something because it is your responsibility, not just because you want to.`,
                    in_action: `There was a strong sense of duty in her family — when someone needed help, everyone was expected to step in.`,
                    review_prompt: `Where does a sense of duty usually come from in family life?`
                }
            },
            {
                id: `moment-cast-in-a-role`,
                preview: `The responsible one. The wild one. The peacemaker.`,
                text: `Families often hand each child a role early on — the sensible one, the difficult one, the funny one — and it can stick for life. Why do you think these roles form, and how easy is it for someone to escape the one they were given?`,
                upgrade: {
                    term: `pegged as`,
                    type: `phrasal verb`,
                    def: `Fixed in everyone's mind as a particular type, often early and hard to shake off.`,
                    in_action: `He got pegged as the irresponsible one at fifteen, and forty years later the family still treats him that way.`,
                    review_prompt: `How might someone get pegged as one thing early and struggle to shake it off?`
                }
            },
            {
                id: `moment-keeping-the-peace`,
                preview: `Some things just don't get said at the table.`,
                text: `Many families have topics everyone quietly avoids to keep things calm — politics, money, an old falling-out. Is keeping the peace that way wise, or does avoiding it just store the problem up for later?`,
                upgrade: {
                    term: `elephant in the room`,
                    type: `idiom`,
                    def: `An obvious problem or tension that everyone is aware of but no one is willing to mention.`,
                    in_action: `We all sat there making small talk, completely ignoring the elephant in the room.`,
                    review_prompt: `What kind of subject becomes the elephant in the room at a family gathering?`
                }
            },
            {
                id: `moment-inheritance-beyond-money`,
                preview: `Not everything you inherit is in the will.`,
                text: `Families pass down more than money or belongings — they pass down sayings, tempers, ways of arguing, attitudes to work, even how people welcome guests. What kind of thing gets inherited without ever appearing in a will?`,
                upgrade: {
                    term: `run in the family`,
                    type: `idiom`,
                    def: `To be a trait, tendency, or condition shared by many members of the same family.`,
                    in_action: `Stubbornness runs in our family — we're all convinced we're the reasonable one.`,
                    review_prompt: `What's a trait or habit that seems to run in families you know?`
                }
            },
            {
                id: `moment-chosen-vs-given`,
                preview: `Friends you pick. Family you don't.`,
                text: `There's an old idea that you can choose your friends but not your family. Does that unchosen quality make family bonds stronger, more complicated, or just harder to walk away from than other relationships?`,
                upgrade: {
                    term: `flesh and blood`,
                    type: `idiom`,
                    def: `Your blood relatives — used to stress the strength or inescapability of a family tie.`,
                    in_action: `We don't always get along, but he's my flesh and blood, so I'd never turn him away.`,
                    review_prompt: `Does being someone's flesh and blood change what people will do for them? How?`
                }
            }
        ],
        makeItReal: {
            title: `The role and the inheritance`,
            prompt: `Think about the roles in a family you know well — who got cast as what, and what kinds of things (habits, sayings, attitudes) seem to have passed down through the generations. What stands out to you?`
        }
    },
    {
        id: `set-where-you-come-from`,
        title: `Where You Come From`,
        desc: `The conversation turns to roots — what family belonging gives people, what's worth keeping, what's worth changing, and what gets carried forward.`,
        icon: `reflect`,
        moments: [
            {
                id: `moment-keep-or-leave-traditions`,
                preview: `Some traditions you keep. Some you quietly drop.`,
                text: `As people grow up, they often keep some family traditions and quietly let others fade. What kind of tradition tends to survive that journey — and what kind usually gets dropped?`,
                upgrade: {
                    term: `carry on`,
                    type: `phrasal verb`,
                    def: `To continue a tradition, practice, or way of doing things started by others before you.`,
                    in_action: `I carry on my grandmother's Sunday cooking, but I happily let the stiff formal dinners go.`,
                    review_prompt: `What kind of tradition is worth carrying on, and what kind is fine to let fade?`
                }
            },
            {
                id: `moment-meaning-of-home-family`,
                preview: `"Family" might not mean what the dictionary says.`,
                text: `For some people "family" means blood relatives; for others it's the people who actually showed up — close friends, mentors, a community. What do you think decides which way a person leans?`,
                upgrade: {
                    term: `kindred spirit`,
                    type: `noun phrase`,
                    def: `Someone who feels like family because they share your outlook or values, whether related to you or not.`,
                    in_action: `She's not a relative, but she's a kindred spirit — she feels more like family than some of my cousins.`,
                    review_prompt: `What turns someone into a kindred spirit — close enough to count as family without being related?`
                }
            },
            {
                id: `moment-distance-and-closeness`,
                preview: `Close, even from far away.`,
                text: `Some relatives live nearby and barely speak; others live across the world and somehow stay central to family life. What do you think keeps that connection strong when people no longer share the same place?`,
                upgrade: {
                    term: `family ties`,
                    type: `noun phrase`,
                    def: `The connections and obligations between family members, whether they are close day to day or not.`,
                    in_action: `They live on different continents, but the family ties are still strong — everyone knows who will show up if needed.`,
                    review_prompt: `What keeps family ties strong when people live far apart?`
                }
            },
            {
                id: `moment-pass-forward`,
                preview: `What stays after someone.`,
                text: `Sometimes a person leaves something behind without meaning to — a phrase, a recipe, a way of welcoming people, a way of arguing, a standard everyone still measures things by. What kind of thing can remain in a family long after the person who started it is gone?`,
                upgrade: {
                    term: `live on`,
                    type: `phrasal verb`,
                    def: `To continue to exist or be remembered after a person, moment, or tradition has passed.`,
                    in_action: `Her warmth lived on in the way the whole family treated guests.`,
                    review_prompt: `What can live on in a family long after one person is gone?`
                }
            },
            {
                id: `moment-break-the-pattern`,
                preview: `The pattern someone refuses.`,
                text: `In some families, people are expected to follow a familiar path — the same work, the same values, the same way of living. Then someone chooses something different. What makes that admirable, difficult, or threatening inside a family?`,
                upgrade: {
                    term: `break the mould`,
                    type: `idiom`,
                    def: `To do something different from what is expected, especially after the same pattern has repeated for a long time.`,
                    in_action: `Everyone expected her to join the family business, but she broke the mould and became a musician.`,
                    review_prompt: `In what kind of family would breaking the mould be admired, and in what kind would it cause tension?`
                }
            }
        ],
        makeItReal: {
            title: `What gets carried forward`,
            prompt: `When people leave home and build their own lives, certain things tend to travel with them — a value, a habit, a way of seeing the world. What kind of thing do you think is most worth carrying forward, and is there something you'd want to keep?`
        }
    }
];
