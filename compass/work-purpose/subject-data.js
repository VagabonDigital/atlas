/*
  ==========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Work & Purpose
  --------------------------------------------------------------------------
  A premium interactive speaking subject for exploring what work is actually
  for — the wage, the craft, the duty, the boredom, and the arguments people
  have about who is really working. Built for tutor-led conversation, shared
  screens, practical disagreement, and sharper spoken English.
  Compass active subject · contentVersion 1.0.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/
const MODULE = {
    id: 'work-purpose',
    schemaVersion: 2,
    contentVersion: '1.0.0',
    title: 'Work & Purpose',
    titleHtml: 'Work &amp; <em>Purpose</em>',
    navTitle: 'Work',
    bgImage: 'https://images.aeonmedia.co/images/320f9f78-678b-476d-be7e-9d977b7e6ead/essay-gettyimages-1142223181.jpg?width=3840&quality=75&format=auto'
};
const subjectCopy = {
    cover: {
        hook: `Most of a life goes into it. Nobody agrees what for.`
    },
    overview: {
        heading: `The Wage and Everything Else`,
        intro: [
            `People do the same job for completely different reasons — a wage, a habit, a duty, a craft they would keep doing if nobody paid them. Most people are carrying two or three of those reasons at once, and they do not always agree with each other.`
        ],
        question: `Think of somebody whose work you know well. What do you think they are actually in it for?`
    },
    paths: {
        culturalLensDescription: `Guilds, bells, vanished trades, and arguments about work that were settled long before anyone asked you.`,
        discussionDescription: `The job up close, what it is worth, and what a working life leaves behind.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from the day-to-day and look at the whole thing.`
    },
    culturalLens: {
        heading: `Somebody Decided This`,
        intro: `Almost nothing about a working day is natural. The hours, the shape of the week, the age you stop, the idea that work happens somewhere other than home — all of it was argued over, and much of it more recently than you would think.`
    },
    discussion: {
        heading: `Somebody Has to Do It`
    },
    reflection: {
        title: `Was It Worth the Hours?`,
        summary: `Work is easier to argue about than to sum up. Take a moment with the parts of this that turned out to be less obvious than you expected.`,
        questions: [
            `Whose idea of a good working life is closest to yours — and is it one you chose, or one you were handed?`,
            `What would you want counted, if somebody were judging whether a working life had gone well?`
        ]
    },
    keyLanguage: {
        intro: `Language for describing effort, judging worth, defending a standard, and saying what a job is really like.`
    }
};
const discussionSets = [
    {
        id: 'set-never-mind-the-title',
        title: `Never Mind the Job Title`,
        stage: `React`,
        icon: 'react',
        description: `What the work is actually made of — the tasks, the hours, and the parts nobody mentions beforehand.`,
        moments: [
            {
                id: 'moment-never-for-any-wage',
                preview: `There’s a number, or there isn’t.`,
                question: `What job would you turn down whatever the wage — nothing illegal, nothing dangerous, just work you could not stand? And be honest: is there a number that would change your mind?`,
                upgrade: {
                    term: `you couldn’t pay me enough`,
                    type: `spoken phrase`,
                    definition: `Used to say that nothing would persuade you to do something.`,
                    ordinary: `“I would never go back to night shifts, whatever the salary was.”`,
                    upgraded: `“You couldn’t pay me enough to go back to night shifts.”`,
                    priority: 'key',
                    atlasPrompt: `What could somebody not pay you enough to do — a performance, a sport, a long journey, a particular food?`
                }
            },
            {
                id: 'moment-thought-it-was-nothing',
                preview: `Nothing much, until you try it.`,
                question: `Which job do people think is nothing much until they actually try it? Take one you have done, one you have watched closely, or one you only noticed when somebody did it badly.`,
                upgrade: {
                    term: `make something look easy`,
                    type: `phrase`,
                    definition: `To do something difficult so well that other people think it takes no skill.`,
                    ordinary: `“She does it so smoothly that people assume the job takes no skill at all.”`,
                    upgraded: `“She makes it look so easy that people assume the job takes no skill at all.”`,
                    priority: 'key',
                    atlasPrompt: `Who do you know who makes something difficult look easy — a cook, a driver, a parent, a musician?`
                }
            },
            {
                id: 'moment-nobody-would-check',
                preview: `Nobody would ever know.`,
                question: `Think of a task you do regularly — at work, at home, anywhere. What part of it would you still do properly even if nobody would ever check? And what part would you quietly skip?`,
                upgrade: {
                    term: `cut corners`,
                    type: `idiom`,
                    definition: `To do something in a quicker, cheaper, or easier way, leaving out part of what should be done.`,
                    ordinary: `“Nobody ever checks the last step, so most people just leave it out.”`,
                    upgraded: `“Nobody ever checks the last step, so most people cut corners.”`,
                    priority: 'key',
                    atlasPrompt: `Where is cutting corners completely harmless, and where would it genuinely matter — cooking, driving, cleaning, packing?`
                }
            },
            {
                id: 'moment-end-of-the-day',
                preview: `The screen looks the same as it did at nine.`,
                question: `Some days end with something you can point at. Others end with a screen that looks much the same as it did at nine in the morning. Which kind of day is more common — for you, or for a job you can picture clearly?`,
                upgrade: {
                    term: `have something to show for it`,
                    type: `phrase`,
                    definition: `To have a visible result after spending time or effort on something.`,
                    ordinary: `“I was busy from morning to night and at the end there was nothing I could actually see.”`,
                    upgraded: `“I was busy from morning to night and had nothing to show for it.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you spent a lot of time on something and had nothing to show for it — a search, a queue, a course, a repair at home?`
                }
            },
            {
                id: 'moment-not-in-the-advert',
                preview: `The part they leave out of the advert.`,
                question: `What does a job advertisement never mention about the actual work? Pick any job at all — it does not have to be one of yours.`,
                upgrade: {
                    term: `what you’re letting yourself in for`,
                    type: `phrase`,
                    definition: `The difficulty or trouble that something will involve, which you do not realise beforehand.`,
                    ordinary: `“I took the job without really understanding how much it was going to involve.”`,
                    upgraded: `“I took the job without really knowing what I was letting myself in for.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you agree to something without knowing what you were letting yourself in for — a favour, a course, a move, a pet?`
                }
            }
        ],
        makeItReal: {
            title: `One Ordinary Hour`,
            prompt: `Take a job you know from the inside — your own, or one you have watched closely. Talk your partner through one ordinary hour of it, in order, including the dull parts and the waiting. Then let them tell you which part would finish them off.`
        }
    },
    {
        id: 'set-earning-it',
        title: `Earning It`,
        stage: `Explain`,
        icon: 'explain',
        description: `Effort you can see, effort nobody notices, and the arguments about who is really working.`,
        moments: [
            {
                id: 'moment-not-one-thing-more',
                preview: `Exactly enough, and not one thing more.`,
                question: `Somebody does exactly what their job requires and not one thing more — no favours, no extra, no staying late. Are they doing the job properly, or are they missing the point of it?`,
                upgrade: {
                    term: `the bare minimum`,
                    type: `phrase`,
                    definition: `The smallest amount of effort or work that is acceptable.`,
                    ordinary: `“She only ever does the smallest amount she can get away with.”`,
                    upgraded: `“She only ever does the bare minimum.”`,
                    priority: 'key',
                    atlasPrompt: `Where is doing the bare minimum completely reasonable — a chore, a duty, a favour, an event you did not want to attend?`
                }
            },
            {
                id: 'moment-paid-what-its-worth',
                preview: `Two jobs, two wages, neither of them right.`,
                question: `Name one job that is paid far less than it is worth, and one that is paid far more. You only get one of each, so choose carefully.`,
                upgrade: {
                    term: `nowhere near`,
                    type: `phrase`,
                    definition: `Not close to a particular amount, level, or standard.`,
                    ordinary: `“Care workers are paid much, much less than the job deserves.”`,
                    upgraded: `“Care workers are paid nowhere near what the job deserves.”`,
                    priority: 'key',
                    atlasPrompt: `What is nowhere near as good — or as bad — as people say? A film, a city, a famous dish, a reputation.`
                }
            },
            {
                id: 'moment-only-notice-when-it-stops',
                preview: `You only see it when it stops.`,
                question: `Whose work in your daily life do you only notice when it stops happening — and what would actually go wrong if they did not turn up for a week?`,
                upgrade: {
                    term: `behind the scenes`,
                    type: `phrase`,
                    definition: `Doing necessary work that other people do not see.`,
                    ordinary: `“There were about ten people working where none of the customers could see them.”`,
                    upgraded: `“There were about ten people working behind the scenes.”`,
                    priority: 'standard',
                    atlasPrompt: `What goes on behind the scenes at something you have been to — a wedding, a concert, a restaurant on a busy night?`
                }
            },
            {
                id: 'moment-helped-nobody',
                preview: `It helped nobody, and it took all morning.`,
                question: `What is the most pointless thing you have ever been asked to do as part of a job — a form, a rule, a report, a task that helped nobody at all? Yours, or one you have heard somebody else complain about.`,
                upgrade: {
                    term: `for the sake of it`,
                    type: `phrase`,
                    definition: `Done only because it is normally done, with no real purpose behind it.`,
                    ordinary: `“We had a meeting every Monday even when there was nothing at all to discuss.”`,
                    upgraded: `“We had a meeting every Monday for the sake of it.”`,
                    priority: 'key',
                    atlasPrompt: `What do people do for the sake of it — a tradition, a purchase, an argument, a photograph?`
                }
            },
            {
                id: 'moment-just-a-job',
                preview: `A wage, and a life somewhere else.`,
                question: `Somebody says: “It is just a job. It pays for my life outside it, and that is all I want from it.” Is that a perfectly sensible way to live, or is something being wasted?`,
                upgrade: {
                    term: `a means to an end`,
                    type: `phrase`,
                    definition: `Something you do only because it gets you something else you want.`,
                    ordinary: `“He does not care about the work itself — it is only there to get him something else.”`,
                    upgraded: `“He does not care about the work itself — it is just a means to an end.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you put up with as a means to an end — a journey, an exam, a queue, a conversation you would rather not have?`
                }
            }
        ],
        makeItReal: {
            title: `The Order You Can Both Live With`,
            prompt: `Between you, put these five in order of how well they ought to be paid: a nurse, a bin collector, a primary teacher, a professional footballer, a lorry driver. You have to agree on the top one and the bottom one. When you have finished, say which one was hardest to place and what nearly changed your mind.`
        }
    },
    {
        id: 'set-a-working-life',
        title: `What It Adds Up To`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `Where it came from, what it does to people, and what is left at the end of it.`,
        moments: [
            {
                id: 'moment-who-taught-you',
                preview: `Somebody showed you how.`,
                question: `Who taught you how to work? Not a subject — how to actually do a thing properly. A first boss, a parent, an older colleague, somebody you just watched. What stayed with you?`,
                upgrade: {
                    term: `learn on the job`,
                    type: `phrase`,
                    definition: `To learn how to do something while you are already doing it, rather than through training.`,
                    ordinary: `“Nobody trained me. I picked it all up while I was already doing it.”`,
                    upgraded: `“Nobody trained me. I learned it all on the job.”`,
                    priority: 'standard',
                    atlasPrompt: `What have you learned on the job rather than from a lesson — driving, cooking, a language, looking after somebody?`
                }
            },
            {
                id: 'moment-same-money-whatever',
                preview: `Same money whatever you do.`,
                question: `Imagine you were paid exactly the same whatever you did, including nothing at all. What would you actually do with your weeks — and be honest about the first three months.`,
                upgrade: {
                    term: `a labour of love`,
                    type: `phrase`,
                    definition: `Work done for pleasure or devotion rather than for money.`,
                    ordinary: `“He spends every weekend on it and has never earned a penny from it.”`,
                    upgraded: `“The whole thing is a labour of love — he has never earned a penny from it.”`,
                    priority: 'standard',
                    atlasPrompt: `What in your life is a labour of love — a garden, a collection, a restoration, something you keep going for a family?`
                }
            },
            {
                id: 'moment-job-changed-them',
                preview: `Ten years in, they talk differently.`,
                question: `Have you seen somebody change because of the work they do — the way they talk, what they notice first, what they find funny? What did the job do to them?`,
                upgrade: {
                    term: `rub off on someone`,
                    type: `phrase`,
                    definition: `Used when somebody gradually takes on the habits or manner of the people around them.`,
                    ordinary: `“He spent years working around lawyers and now he argues exactly like one.”`,
                    upgraded: `“He spent years working around lawyers and it rubbed off on him.”`,
                    priority: 'standard',
                    atlasPrompt: `Whose habits have rubbed off on you — a friend, a relative, a neighbour, somebody you once lived with?`
                }
            },
            {
                id: 'moment-still-point-to',
                preview: `Still worth pointing at.`,
                question: `What is one piece of work — paid or not — that you would still point to years later? Something made, fixed, organised, or got right when it was difficult. Yours, or somebody’s you watched being done.`,
                upgrade: {
                    term: `take pride in something`,
                    type: `phrase`,
                    definition: `To care about doing something well and be pleased with how it is done.`,
                    ordinary: `“She cares a great deal about doing the job properly, and you can see it.”`,
                    upgraded: `“She takes real pride in her work, and you can see it.”`,
                    priority: 'key',
                    atlasPrompt: `What do you take pride in away from work — a home, a garden, a skill, the way you do one small thing?`
                }
            },
            {
                id: 'moment-too-good-for-it',
                preview: `You wouldn’t have touched it then.`,
                question: `Is there a job you once thought you were too good for, or one you would have been embarrassed to admit to? Would you see it the same way now — and what changed: the job, the world, or you?`,
                upgrade: {
                    term: `turn your nose up at something`,
                    type: `idiom`,
                    definition: `To refuse or reject something because you think it is not good enough for you.`,
                    ordinary: `“When I was younger I would have refused that kind of work because I thought it was below me.”`,
                    upgraded: `“When I was younger I would have turned my nose up at that kind of work.”`,
                    priority: 'standard',
                    atlasPrompt: `What did you turn your nose up at when you were younger and would happily accept now — a food, a place, a kind of music, a piece of advice?`
                }
            }
        ],
        makeItReal: {
            title: `The Thing Nobody Tells You`,
            prompt: `Think of somebody about to start their first proper job — a niece, a nephew, a neighbour, anyone. Tell them the one thing about working that nobody told you, and that they will not believe until it happens to them. Your partner can push back if they think you are wrong.`
        }
    }
];
const clCards = [
    {
        id: 'cl-name-was-your-job',
        contextLine: `Europe · Surnames`,
        title: `Your Name Was Your Job`,
        teaser: `Smith, Baker, Taylor — a surname that once told the village what you did.`,
        context: `In many parts of the world, family names grew out of the work a family did. English carries Smith, Baker, Taylor, Miller and Cooper; other languages have their own equivalents. A name that once told a whole village what somebody did all day may now belong to a person who has never held the tool it refers to.`,
        mainQuestion: `If surnames were handed out today based on the work people actually do, what would yours be — and what would your neighbours be called?`,
        followTheThread: [
            `Is there a name in your language that still tells you what a family once did?`,
            `Would you want a job that your children were expected to take over?`
        ],
        upgrade: {
            term: `follow in someone’s footsteps`,
            type: `idiom`,
            definition: `To do the same thing as somebody before you, often a parent.`,
            ordinary: `“Both of his children went into exactly the same trade as their father.”`,
            upgraded: `“Both of his children followed in their father’s footsteps.”`,
            priority: 'standard',
            atlasPrompt: `Who have you seen follow in somebody’s footsteps — into a sport, a hobby, or a way of living?`
        }
    },
    {
        id: 'cl-seven-years-no-wage',
        contextLine: `Europe · Craft guilds`,
        title: `Seven Years Before You Were Anybody`,
        teaser: `Years of work for no wage, and then one object to prove you were finished.`,
        context: `In many European craft guilds, a young person entered a trade by living and working in a master’s household for years, usually for food and a bed rather than wages. The length varied by trade and place. In some traditions the last task was to produce a single piece of work good enough to prove the apprentice had finished learning.`,
        mainQuestion: `You are twenty-two and you have spent seven years learning a trade for no wage. It is nearly over — and you realise you do not like the work. Do you finish it?`,
        followTheThread: [
            `How many years of training is too many for one job?`,
            `Is anything still learned properly in less than a year?`
        ],
        upgrade: {
            term: `stick it out`,
            type: `phrasal verb`,
            definition: `To continue with something difficult or unpleasant until it is finished.`,
            ordinary: `“He hated the last two years of it but he stayed until the end.”`,
            upgraded: `“He hated the last two years of it but he stuck it out.”`,
            priority: 'key',
            atlasPrompt: `What have you stuck out to the end when stopping would have been much easier — a course, a book, a film, a long journey?`
        }
    },
    {
        id: 'cl-paid-by-the-hour',
        contextLine: `Industrial Britain`,
        title: `Paid by the Hour`,
        teaser: `A bell decided when work began, not the work itself.`,
        context: `Before factories, a great deal of work was measured by the task and the season: you worked until the job was done, or until the light went. Factory work introduced something different — fixed hours marked by a bell or a whistle, with pay attached to the time you were present rather than to what you produced.`,
        mainQuestion: `Would you rather be paid for the hours you are there, or for the work you actually finish? And which of those would you trust an employer with?`,
        followTheThread: [
            `Which kind of job would be worse if it were paid by the hour?`,
            `If nobody could see you working, how would anyone know that you had?`
        ],
        upgrade: {
            term: `clock off`,
            type: `phrasal verb`,
            definition: `To stop work for the day, or to stop thinking about it.`,
            ordinary: `“He stops thinking about the job the second he leaves the building.”`,
            upgraded: `“He clocks off the second he leaves the building.”`,
            priority: 'standard',
            atlasPrompt: `What do you never really clock off from — a role at home, a worry, a phone, a responsibility?`
        }
    },
    {
        id: 'cl-jobs-that-died-out',
        contextLine: `Britain and Ireland · Lost trades`,
        title: `Somebody Used to Do This`,
        teaser: `A man was paid to walk the street before dawn and wake you up.`,
        context: `Some jobs disappeared so completely that the word survives longer than the work. In industrial Britain and Ireland, a knocker-up was paid to walk the streets before dawn, tapping on bedroom windows with a long pole to wake people for their shift. Lamplighters lit the street lamps by hand. Telephone operators connected every call by plugging in a wire.`,
        mainQuestion: `Which job that exists today will your grandchildren find hard to believe anybody was ever paid to do?`,
        followTheThread: [
            `Which vanished job would you actually have enjoyed?`,
            `When a job disappears, does anything go with it that people miss?`
        ],
        upgrade: {
            term: `die out`,
            type: `phrasal verb`,
            definition: `To gradually stop existing, until there is none left.`,
            ordinary: `“That trade slowly disappeared until there was nobody left doing it.”`,
            upgraded: `“That trade slowly died out.”`,
            priority: 'key',
            atlasPrompt: `What has died out where you live — a shop, a custom, a way of speaking, a kind of building?`
        }
    },
    {
        id: 'cl-shape-of-the-week',
        contextLine: `19th century · The working day`,
        title: `Eight Hours for Yourself`,
        teaser: `The free Saturday was argued for, not handed over.`,
        context: `The length of the working day and the shape of the week were fought over for a long time before they settled. Nineteenth-century labour movements campaigned to divide the day into three equal parts: work, rest, and time that belonged to you. Where the week now breaks still varies — many countries rest on Saturday and Sunday, others on Friday and Saturday.`,
        mainQuestion: `You are offered the same money for a four-day week, but the four days are longer and harder. Do you take it?`,
        followTheThread: [
            `Is a day off still a day off if you can be contacted?`,
            `Which is worth more to you: one extra day, or shorter days?`
        ],
        upgrade: {
            term: `flat out`,
            type: `phrase`,
            definition: `Working as fast and as hard as possible, with no let-up.`,
            ordinary: `“We worked as fast and as hard as we possibly could for four days.”`,
            upgraded: `“We were flat out for four days.”`,
            priority: 'standard',
            atlasPrompt: `When were you last flat out for days at a time — before a move, an event, an exam, a family occasion?`
        }
    },
    {
        id: 'cl-workshop-front-room',
        contextLine: `Before the commute`,
        title: `The Workshop Was the Front Room`,
        teaser: `Work and home shared a door long before anyone called it working from home.`,
        context: `For most of history a great many people worked where they lived. The workshop was attached to the house, the shop was underneath it, the fields began at the door. Sending everybody out to a separate building for the working day is a relatively recent arrangement — and one that a good many people have started to undo again.`,
        mainQuestion: `If your home were also your workplace — customers at the door, tools in the front room — who else in the house would pay for that, and how?`,
        followTheThread: [
            `What does the journey to and from work actually do for people?`,
            `Which jobs could never be done at home, and would you want one of those?`
        ],
        upgrade: {
            term: `a change of scene`,
            type: `phrase`,
            definition: `Being somewhere different, especially when it improves how you feel.`,
            ordinary: `“Even when the work is the same, going somewhere else to do it makes a difference.”`,
            upgraded: `“Even when the work is the same, a change of scene makes a difference.”`,
            priority: 'key',
            atlasPrompt: `When has a change of scene made more difference than you expected — a move, a holiday, a different café, another room in the house?`
        }
    },
    {
        id: 'cl-age-you-are-finished',
        contextLine: `State pensions`,
        title: `The Age You Are Finished`,
        teaser: `Somebody decided which birthday ends a working life.`,
        context: `The idea that a working life ends on a particular birthday is younger than it feels. State pension schemes were introduced by governments from the late nineteenth century onwards, and the age attached to them has been set, argued over and raised many times since. It still differs from country to country. For most of history, and in many places today, people worked for as long as they were able to.`,
        mainQuestion: `A roofer and an accountant reach the same birthday. Should they both stop?`,
        followTheThread: [
            `Who should decide when somebody is too old for their job, and on what evidence?`,
            `Would you rather be told when to stop, or decide it for yourself?`
        ],
        upgrade: {
            term: `call it a day`,
            type: `idiom`,
            definition: `To decide to stop doing something, either for now or for good.`,
            ordinary: `“After thirty years he decided that was enough and stopped.”`,
            upgraded: `“After thirty years he decided to call it a day.”`,
            priority: 'key',
            atlasPrompt: `When is it right to call it a day — on a search, an argument, a night out, a project that is not working?`
        }
    },
    {
        id: 'cl-punishment-or-proof',
        contextLine: `Ideas about work`,
        title: `Punishment or Proof`,
        teaser: `One tradition treats work as a burden. Another treats it as evidence of a good life.`,
        context: `Ideas about what work is for have never agreed with each other. Some traditions have treated labour as a burden to be escaped where possible, and free time as the condition in which a person becomes fully themselves. Others have treated steady work as evidence of a serious and honest life, and idleness as something close to a fault.`,
        mainQuestion: `Somebody you know has enough money and chooses not to work at all. What do you actually think of them — and would your answer change if they were sixty rather than thirty?`,
        followTheThread: [
            `Is there an age at which not working stops being a scandal?`,
            `Which do you find harder to respect: somebody who never works, or somebody who never stops?`
        ],
        upgrade: {
            term: `earn your keep`,
            type: `phrase`,
            definition: `To do enough work to justify the food, money, or place you are given.`,
            ordinary: `“He does not work at all, and some people think he ought to be contributing something.”`,
            upgraded: `“He does not work at all, and some people think he ought to be earning his keep.”`,
            priority: 'standard',
            atlasPrompt: `Who is expected to earn their keep in a household — and at what age does that expectation usually start?`
        }
    }
];
