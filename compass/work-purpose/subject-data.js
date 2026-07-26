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
  Compass active subject · contentVersion 2.0.0
  The subject may evolve.
  The compass remains.
  --------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ==========================================================================
*/
const MODULE = {
    id: 'work-purpose',
    schemaVersion: 2,
    contentVersion: '2.0.0',
    title: 'Work & Purpose',
    titleHtml: 'Work &amp; <em>Purpose</em>',
    navTitle: 'Work',
    bgImage: 'https://images.aeonmedia.co/images/320f9f78-678b-476d-be7e-9d977b7e6ead/essay-gettyimages-1142223181.jpg?width=3840&quality=75&format=auto'
};

const subjectCopy = {
    cover: {
        hook: `Work takes a large part of life. What should it give back?`
    },

    overview: {
        heading: `The Wage and Everything Else`,
        intro: [
            `A job can provide money, routine, pride, skill, status, or simply a way to support life elsewhere. The same work may feel worthwhile to one person and empty to another.`
        ],
        question: `What matters most in a good working life: fair pay, useful work, freedom, respect, or something else?`
    },

    paths: {
        culturalLensDescription: `Explore the systems, trades, and ideas that shaped when people work, where they work, and when they stop.`,
        discussionDescription: `Hidden effort, honest job descriptions, fair pay, and what work changes in people over time.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `A place to decide what makes work worthwhile and what deserves more respect.`
    },

    culturalLens: {
        heading: `How Work Took Its Shape`,
        intro: `Working life has not always looked the way it does now. Step into other places and times, where names revealed trades, bells controlled hours, apprentices worked for years, and retirement had no fixed age.`
    },

    discussion: {
        heading: `What Work Really Takes`
    },

    reflection: {
        title: `What Makes It Worthwhile?`,
        summary: `Look back at the effort, standards, people, and choices that shaped the conversation — and what they reveal about the kind of working life you respect.`,
        questions: [
            `Which kind of work from the conversation deserves more respect than it usually receives?`,
            `What would make your own working life feel worthwhile, even if it never looked impressive from the outside?`
        ]
    },

    keyLanguage: {
        intro: `Expressions for describing effort, hidden work, fair value, professional standards, and what makes a job worth doing.`
    }
};

const discussionSets = [
    {
        id: 'set-never-mind-the-title',
        title: `Never Mind the Job Title`,
        stage: `React`,
        icon: 'react',
        description: `The real tasks, hidden standards, exhausting days, and details job adverts quietly leave out.`,

        moments: [
            {
                id: 'moment-never-for-any-wage',
                preview: `There’s a number, or there isn’t.`,
                question: `What job would you refuse no matter what it paid — nothing illegal or dangerous, just work you could not stand? What part puts you off, and could any salary change your mind?`,

                upgrade: {
                    term: `you couldn’t pay me enough`,
                    type: `phrase`,
                    definition: `Used to say that nothing would persuade you to do something.`,
                    ordinary: `“I would never go back to night shifts, whatever the salary was.”`,
                    upgraded: `“You couldn’t pay me enough to go back to night shifts.”`,
                    priority: 'key',
                    atlasPrompt: `What could nobody pay you enough to try — a performance, sport, journey, or food challenge?`
                }
            },
            {
                id: 'moment-thought-it-was-nothing',
                preview: `Nothing much, until you try it.`,
                question: `Which job looks easy until you try it — or until you watch someone do it badly? What does a skilled person do that most people never notice?`,

                upgrade: {
                    term: `make something look easy`,
                    type: `phrase`,
                    definition: `To do something difficult so well that other people think it requires little effort or skill.`,
                    ordinary: `“She does the job so smoothly that people assume it is easy.”`,
                    upgraded: `“She makes the job look so easy that people underestimate the skill involved.”`,
                    priority: 'key',
                    atlasPrompt: `Who makes something difficult look easy — a cook, driver, parent, musician, or colleague?`
                }
            },
            {
                id: 'moment-nobody-would-check',
                preview: `Nobody would ever know.`,
                question: `Think of a task you do regularly, at work or elsewhere. Which part would you still do properly if nobody ever checked — and which part would you quietly skip?`,

                upgrade: {
                    term: `cut corners`,
                    type: `idiom`,
                    definition: `To save time or effort by leaving out part of what should be done.`,
                    ordinary: `“Nobody checks the final step, so some people simply leave it out.”`,
                    upgraded: `“Nobody checks the final step, so some people cut corners.”`,
                    priority: 'key',
                    atlasPrompt: `Where is cutting corners fairly harmless, and where could it cause a serious problem?`
                }
            },
            {
                id: 'moment-end-of-the-day',
                preview: `The result is not always something you can see.`,
                question: `Some work leaves a visible result: a repaired door, a clean room, or a finished meal. Other work prevents a problem, helps someone decide, or keeps something running smoothly. Which kind gives you more satisfaction? What invisible result can still make a day feel worthwhile?`,

                upgrade: {
                    term: `have something to show for it`,
                    type: `phrase`,
                    definition: `To have a clear or visible result after spending time or effort on something.`,
                    ordinary: `“I was busy all day, but there was almost no visible result at the end.”`,
                    upgraded: `“I was busy all day, but I had almost nothing to show for it.”`,
                    priority: 'standard',
                    atlasPrompt: `When have you spent a great deal of time on something and had very little to show for it?`
                }
            },
            {
                id: 'moment-not-in-the-advert',
                preview: `The sentence they left out.`,
                question: `Choose any job and add one brutally honest sentence to its advertisement. What would applicants deserve to know before saying yes?`,

                upgrade: {
                    term: `what you’re letting yourself in for`,
                    type: `phrase`,
                    definition: `The difficulty or trouble something will involve, which may not be obvious beforehand.`,
                    ordinary: `“The advert never explained how much pressure and weekend work the job involved.”`,
                    upgraded: `“The advert never explained what you were letting yourself in for.”`,
                    priority: 'standard',
                    atlasPrompt: `When did you agree to something without knowing what you were letting yourself in for?`
                }
            }
        ],

        makeItReal: {
            title: `One Ordinary Hour`,
            prompt: `Choose a job you know from the inside. Walk your tutor through one ordinary hour, including the waiting, interruptions, and dull parts. Your tutor will question one step or suggest an easier way. Explain why the work is really done that way.`
        }
    },

    {
        id: 'set-earning-it',
        title: `Earning It`,
        stage: `Explain`,
        icon: 'explain',
        description: `Fair pay, invisible effort, pointless procedures, and the line between a healthy boundary and not caring.`,

        moments: [
            {
                id: 'moment-not-one-thing-more',
                preview: `Exactly enough, and not one thing more.`,
                question: `A colleague completes every required task but refuses unpaid extras, favours, or staying late. Their manager calls them uncommitted. Whose side are you on — and what would you actually say in the room?`,

                upgrade: {
                    term: `the bare minimum`,
                    type: `phrase`,
                    definition: `The smallest amount of work or effort that is acceptable.`,
                    ordinary: `“The manager thinks she only does the smallest amount the job requires.”`,
                    upgraded: `“The manager thinks she only does the bare minimum.”`,
                    priority: 'key',
                    atlasPrompt: `When is doing the bare minimum reasonable, and when does it affect other people unfairly?`
                }
            },
            {
                id: 'moment-paid-what-its-worth',
                preview: `Two jobs, two wages, neither feels right.`,
                question: `Name one job that is paid far less than it deserves and one that is paid far more. Compare your choices with your tutor: where do you disagree most?`,

                upgrade: {
                    term: `undervalued`,
                    type: `adjective`,
                    definition: `Not recognised, respected, or rewarded as much as something deserves.`,
                    ordinary: `“Care work receives far less pay and respect than it deserves.”`,
                    upgraded: `“Care work is seriously undervalued.”`,
                    priority: 'key',
                    atlasPrompt: `What skill, service, place, or everyday contribution is widely undervalued?`
                }
            },
            {
                id: 'moment-only-notice-when-it-stops',
                preview: `You only see it when it stops.`,
                question: `Choose someone whose work you barely notice while it is happening. Imagine they do not turn up for a week. What breaks first — and who finally realises how much they were doing?`,

                upgrade: {
                    term: `behind the scenes`,
                    type: `phrase`,
                    definition: `In a role where important work happens without being visible to most people.`,
                    ordinary: `“Several people were doing essential work where the customers could not see them.”`,
                    upgraded: `“Several people were doing essential work behind the scenes.”`,
                    priority: 'standard',
                    atlasPrompt: `What happens behind the scenes at an event, business, or service you know well?`
                }
            },
            {
                id: 'moment-helped-nobody',
                preview: `It helped nobody, and it took all morning.`,
                question: `What is the most pointless piece of workplace bureaucracy you have encountered — or heard someone complain about? It could be a form, approval, report, meeting, or rule. Why did people keep doing it?`,

                upgrade: {
                    term: `red tape`,
                    type: `noun`,
                    definition: `Official rules and paperwork that create unnecessary difficulty or delay.`,
                    ordinary: `“The approval process involved weeks of unnecessary forms and rules.”`,
                    upgraded: `“The approval process was buried in red tape.”`,
                    priority: 'key',
                    atlasPrompt: `Where have rules or paperwork made a simple task much harder than it needed to be?`
                }
            },
            {
                id: 'moment-just-a-job',
                preview: `A wage, and a life somewhere else.`,
                question: `Read this twice: once as someone who is genuinely content, and once as someone who feels stuck but does not want to admit it. “It is just a job. It pays for my life outside it, and that is enough.” What changes in the way you say it? What else would you need to know before deciding which version was true?`,

                upgrade: {
                    term: `a means to an end`,
                    type: `phrase`,
                    definition: `Something done mainly because it helps you obtain something else you want.`,
                    ordinary: `“He does not value the work itself; he only does it to support the rest of his life.”`,
                    upgraded: `“For him, the job is simply a means to an end.”`,
                    priority: 'standard',
                    atlasPrompt: `What do you tolerate as a means to an end because the final result matters to you?`
                }
            }
        ],

        makeItReal: {
            title: `The Pay Committee`,
            prompt: `Together, rank these five jobs by how well they ought to be paid: a nurse, a bin collector, a primary teacher, a professional footballer, and a lorry driver. Agree on the top and bottom positions. Then identify the strongest argument either person made, whether or not it changed the final ranking.`
        }
    },

    {
        id: 'set-a-working-life',
        title: `What It Adds Up To`,
        stage: `Reflect and Relate`,
        icon: 'reflect',
        description: `The people who shape how you work, the work you would choose freely, and what remains worth remembering.`,

        moments: [
            {
                id: 'moment-who-taught-you',
                preview: `Somebody showed you how.`,
                question: `Who taught you how to work — not a school subject, but how to do something properly? What habit, standard, or attitude did you take from them?`,

                upgrade: {
                    term: `show someone the ropes`,
                    type: `idiom`,
                    definition: `To teach someone how a job, place, or activity works.`,
                    ordinary: `“My first manager taught me how to handle difficult customers and organise the day.”`,
                    upgraded: `“My first manager showed me the ropes, including how to handle difficult customers and organise the day.”`,
                    priority: 'key',
                    atlasPrompt: `Who showed you the ropes when you were new somewhere, and what did they make easier?`
                }
            },
            {
                id: 'moment-same-money-whatever',
                preview: `Same money whatever you do.`,
                question: `Imagine you received the same comfortable income whether you worked or not. What would you do with the first three months — and what do you think your weeks would look like a year later?`,

                upgrade: {
                    term: `a sense of purpose`,
                    type: `phrase`,
                    definition: `A feeling that your life or actions have meaning and a worthwhile direction.`,
                    ordinary: `“After a few months, I think I would need to feel that my time mattered.”`,
                    upgraded: `“After a few months, I think I would need a real sense of purpose.”`,
                    priority: 'standard',
                    atlasPrompt: `What gives people a sense of purpose outside paid work?`
                }
            },
            {
                id: 'moment-job-changed-them',
                preview: `The job followed them home.`,
                question: `Have you seen someone bring their workplace home in the way they speak or behave — checking every detail, organising everything, correcting people, or making the same kind of jokes? Which habit followed them home?`,

                upgrade: {
                    term: `carry over into something`,
                    type: `phrasal verb`,
                    definition: `If a habit or behaviour carries over into another situation, it continues there.`,
                    ordinary: `“After years in management, he started organising everyone at home as well.”`,
                    upgraded: `“After years in management, the habit of organising everyone carried over into his home life.”`,
                    priority: 'standard',
                    atlasPrompt: `What habit from one part of your life has carried over into another?`
                }
            },
            {
                id: 'moment-still-point-to',
                preview: `Put one piece in the window.`,
                question: `Imagine a small exhibition showing one thing you helped make, fix, organise, or improve. What would you display — and what would the label beside it say?`,

                upgrade: {
                    term: `take pride in something`,
                    type: `phrase`,
                    definition: `To care about doing something well and feel pleased with the result.`,
                    ordinary: `“She cares deeply about doing the work properly and feels pleased with the result.”`,
                    upgraded: `“She takes real pride in her work.”`,
                    priority: 'key',
                    atlasPrompt: `What do you take pride in outside paid work, even if other people rarely notice it?`
                }
            },
            {
                id: 'moment-too-good-for-it',
                preview: `You wouldn’t have touched it then.`,
                question: `Is there a job you once thought you were too good for, or would once have felt embarrassed to do? Would you judge it differently now — and what changed?`,

                upgrade: {
                    term: `look down on`,
                    type: `phrasal verb`,
                    definition: `To consider someone or something less valuable, respectable, or important than you.`,
                    ordinary: `“When I was younger, I thought that kind of work was beneath me.”`,
                    upgraded: `“When I was younger, I looked down on that kind of work.”`,
                    priority: 'standard',
                    atlasPrompt: `What job, hobby, taste, or lifestyle do people unfairly look down on?`
                }
            }
        ],

        makeItReal: {
            title: `The Thing Nobody Tells You`,
            prompt: `Imagine someone starting their first proper job tomorrow. Give them one warning and one promise about working life. Discuss which sounds more honest, then revise either one if the conversation changes your mind.`
        }
    }
];

const clCards = [
    {
        id: 'cl-name-was-your-job',
        contextLine: `Europe · Surnames`,
        title: `Your Name Was Your Job`,
        teaser: `Smith, Baker, Taylor — a surname that once told the village what you did.`,

        context: `In many places, family names grew from the work a family did. English surnames such as Smith, Baker, Taylor, Miller, and Cooper once told neighbours what someone made or sold. Today, the same name may belong to a person whose work has nothing to do with that old trade.`,

        mainQuestion: `If surnames were created from today’s jobs, what might yours be — and what names would appear in your neighbourhood?`,

        followTheThread: [
            `Is there a name in your language that still tells you what a family once did?`,
            `Would you want a job that your children were expected to take over?`
        ],

        upgrade: {
            term: `follow in someone’s footsteps`,
            type: `idiom`,
            definition: `To do the same thing as somebody before you, often a parent.`,
            ordinary: `“Both of his children entered exactly the same trade as their father.”`,
            upgraded: `“Both of his children followed in their father’s footsteps.”`,
            priority: 'standard',
            atlasPrompt: `Who have you seen follow in somebody’s footsteps — into a sport, hobby, job, or way of living?`
        }
    },

    {
        id: 'cl-seven-years-no-wage',
        contextLine: `Europe · Craft guilds`,
        title: `Seven Years Before You Were Anybody`,
        teaser: `Years of work for no wage, and then one object to prove you were finished.`,

        context: `In many European craft guilds, a young apprentice lived and worked in a master’s household for years, receiving food and a bed rather than wages. The length varied by trade and place. In some traditions, the final test was one piece of work good enough to prove they had learned the craft.`,

        mainQuestion: `You are twenty-two and have spent seven years learning a trade for no wage. It is nearly over, but you realise you do not like the work. Do you finish the training?`,

        followTheThread: [
            `How many years of training is too many for one job?`,
            `What skill do you think genuinely takes years to learn well?`
        ],

        upgrade: {
            term: `stick it out`,
            type: `phrasal verb`,
            definition: `To continue with something difficult or unpleasant until it is finished.`,
            ordinary: `“He hated the final two years, but he stayed until the end.”`,
            upgraded: `“He hated the final two years, but he stuck it out.”`,
            priority: 'key',
            atlasPrompt: `What have you stuck out until the end when stopping would have been much easier?`
        }
    },

    {
        id: 'cl-paid-by-the-hour',
        contextLine: `Industrial Britain`,
        title: `Paid by the Hour`,
        teaser: `A bell decided when work began, not the work itself.`,

        context: `Before factories, much work followed the task, the season, or the available daylight. Factory work introduced fixed hours marked by bells or whistles. Pay increasingly depended on how long a worker was present, not only on what they finished or produced.`,

        mainQuestion: `Would you rather be paid for the hours you work or for the work you complete? Which system would be fairer in your own job — or one you know well?`,

        followTheThread: [
            `Which jobs would become unfair if pay depended only on the amount produced?`,
            `When work is difficult to see, what evidence shows that it has been done well?`
        ],

        upgrade: {
            term: `be on the clock`,
            type: `phrase`,
            definition: `To be working during time for which you are being paid.`,
            ordinary: `“He was paid for the time he was at work, not only for what he produced.”`,
            upgraded: `“He was paid for every hour he was on the clock, not only for what he produced.”`,
            priority: 'standard',
            atlasPrompt: `When can someone be on the clock without doing useful work — and when is that not their fault?`
        }
    },

    {
        id: 'cl-jobs-that-died-out',
        contextLine: `Britain and Ireland · Lost trades`,
        title: `Somebody Used to Do This`,
        teaser: `A man was paid to walk the street before dawn and wake you up.`,

        context: `Some jobs disappeared so completely that only the name remains. In industrial Britain and Ireland, a knocker-up walked the streets before dawn and tapped bedroom windows with a long pole to wake people for work. Lamplighters lit street lamps by hand, while telephone operators connected calls by plugging in wires.`,

        mainQuestion: `Which job that exists today will future generations find hard to believe anybody was ever paid to do?`,

        followTheThread: [
            `Which vanished job would you actually have enjoyed?`,
            `When a job disappears, what skills, routines, or relationships might disappear with it?`
        ],

        upgrade: {
            term: `die out`,
            type: `phrasal verb`,
            definition: `To gradually stop existing until none remain.`,
            ordinary: `“That trade slowly disappeared until nobody was left doing it.”`,
            upgraded: `“That trade slowly died out.”`,
            priority: 'key',
            atlasPrompt: `What has died out where you live — a shop, custom, expression, or type of building?`
        }
    },

    {
        id: 'cl-shape-of-the-week',
        contextLine: `19th century · The working day`,
        title: `Eight Hours for Yourself`,
        teaser: `The working day and the weekend were argued for, not handed over.`,

        context: `Working hours and days off were argued over for generations. In the nineteenth century, labour movements campaigned for a day divided into eight hours of work, eight hours of rest, and eight hours for personal life. The weekly break still differs: many countries rest on Saturday and Sunday, others on Friday and Saturday.`,

        mainQuestion: `You are offered the same money for a four-day week, but the four working days are longer and harder. Do you take it?`,

        followTheThread: [
            `Is a day off still a day off if your workplace can contact you?`,
            `Which is worth more to you: one extra free day or shorter working days?`
        ],

        upgrade: {
            term: `flat out`,
            type: `phrase`,
            definition: `Working as fast and as hard as possible, with no let-up.`,
            ordinary: `“We worked as fast and as hard as possible for four days.”`,
            upgraded: `“We were flat out for four days.”`,
            priority: 'standard',
            atlasPrompt: `When were you last flat out for several days — before a move, event, deadline, or family occasion?`
        }
    },

    {
        id: 'cl-workshop-front-room',
        contextLine: `Before the commute`,
        title: `The Workshop Was the Front Room`,
        teaser: `Work and home shared a door long before anyone called it working from home.`,

        context: `For most of history, many people worked where they lived. A workshop might join the house, a shop could sit underneath it, and fields began at the door. Travelling to a separate workplace every day became common much later — and many people now work from home again.`,

        mainQuestion: `If customers arrived at your home and work tools filled the front room, how would that affect the other people living there?`,

        followTheThread: [
            `What does the journey between home and work give people besides transport?`,
            `Which jobs could never be done at home, and would you want one of them?`
        ],

        upgrade: {
            term: `draw a line between two things`,
            type: `phrase`,
            definition: `To create a clear boundary between two parts of life or two kinds of behaviour.`,
            ordinary: `“Going somewhere else to work helped create a clear boundary between the job and family life.”`,
            upgraded: `“Going somewhere else to work helped people draw a clear line between work and home.”`,
            priority: 'key',
            atlasPrompt: `Where do you need to draw a clearer line between work and personal time?`
        }
    },

    {
        id: 'cl-age-you-are-finished',
        contextLine: `State pensions`,
        title: `The Age You Are Finished`,
        teaser: `Somebody decided which birthday ends a working life.`,

        context: `Stopping work on a particular birthday is a relatively recent idea. Governments began introducing state pension schemes from the late nineteenth century, and retirement ages have been set, debated, and raised many times since. They still differ between countries. In many places, people continue working for as long as they are able.`,

        mainQuestion: `A roofer and an accountant reach the same retirement age. Should they both be expected to stop working at the same time?`,

        followTheThread: [
            `Who should decide when somebody is too old for a job, and what evidence should they use?`,
            `Would you rather choose when to stop working or have a fixed age decide for you?`
        ],

        upgrade: {
            term: `call it a day`,
            type: `idiom`,
            definition: `To decide to stop doing something, either for now or permanently.`,
            ordinary: `“After thirty years, he decided that he had done enough and stopped.”`,
            upgraded: `“After thirty years, he decided to call it a day.”`,
            priority: 'key',
            atlasPrompt: `When is it right to call it a day on a search, argument, project, or night out?`
        }
    },

    {
        id: 'cl-punishment-or-proof',
        contextLine: `Ideas about work`,
        title: `Punishment or Proof`,
        teaser: `One life is judged idle. Another is judged wasted on work.`,

        context: `In one household, a person with enough money spends the day reading, visiting friends, and taking part in public life. In another, someone rises early and sees steady work as proof of discipline and good character. Some traditions have praised life without paid work and criticised constant labour as a waste of life. Others have praised steady work and criticised people without jobs as idle.`,

        mainQuestion: `Someone has enough money and chooses not to have a job. They use their time however they like. What would make you respect that choice — or judge it?`,

        followTheThread: [
            `Would your reaction change if they were thirty, sixty, or caring for other people?`,
            `Which is harder to respect: somebody who never works or somebody who never stops?`
        ],

        upgrade: {
            term: `earn your keep`,
            type: `phrase`,
            definition: `To do enough work to justify the food, money, or place you are given.`,
            ordinary: `“Some people think he should contribute something rather than live there without working.”`,
            upgraded: `“Some people think he should earn his keep rather than live there without working.”`,
            priority: 'standard',
            atlasPrompt: `Who is expected to earn their keep in a household, and when does that expectation usually begin?`
        }
    }
];
