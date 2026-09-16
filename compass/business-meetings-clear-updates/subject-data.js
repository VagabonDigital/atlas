/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Business Meetings: Clear Updates, Questions & Decisions
  ---------------------------------------------------------------------------
  A practical Business English subject for giving concise updates, asking
  useful questions, clarifying uncertainty, challenging ideas professionally,
  and helping meetings move from discussion to clear decisions. Built for
  tutor-led speaking practice and realistic workplace communication.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `business-meetings-clear-updates`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `Business Meetings: Clear Updates, Questions & Decisions`,
    titleHtml: `Business Meetings: <em>Clear Updates, Questions & Decisions</em>`,
    navTitle: `Business Meetings`,
    bgImage: `https://media.istockphoto.com/id/1355159388/photo/business-people-sitting-around-the-table-and-talking.jpg?s=612x612&w=0&k=20&c=w8pZYQMUG013b50faYS7RgvQ3Rmxc9Vet34AWoRb-_U=`
};

const subjectCopy = {
    cover: {
        hook: `Make every meeting move forward.`
    },
    overview: {
        heading: `From Talk to Action`,
        intro: [
            `A meeting can change direction when someone gives a clear update, asks the right question, or helps the group choose a next step. In this subject, you will practise making your ideas easy to understand and keeping conversations focused without sounding too forceful.`
        ],
        question: `What helps you feel comfortable speaking in a meeting?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore practical ways to contribute, question ideas and help a meeting reach a clear next step.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `See how cultural expectations shape the way people speak, question ideas and reach decisions in meetings.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from meeting language and consider how you can communicate more clearly, thoughtfully and usefully at work.`
    },
    culturalLens: {
        heading: `Different Rooms, Different Rules`,
        intro: `Meetings do not work in the same way everywhere: people may differ in how directly they speak, show agreement, ask questions, challenge ideas, or make decisions. Explore how workplace expectations change across cultures and situations, while keeping the focus on clear communication and useful action.`
    },
    discussion: {
        heading: `Make Space for Better Decisions`,
        intro: `Good meetings depend on more than speaking clearly: people also need to listen, check understanding, question ideas and respond in a useful way. Explore how different meeting behaviours can build trust, solve confusion and help a group move from opinions to action.`
    },
    reflection: {
        title: `Make the Next Move Clear`,
        summary: `Effective meetings balance clarity with care: people need to question ideas, notice concerns and still help the group move towards action. The way we speak can also shape who feels heard and how much trust a decision creates.`,
        questions: [
            `After exploring these meeting behaviours, how would you balance speaking directly with making space for other people’s concerns and different ways of communicating?`,
            `What is one meeting habit or phrase you would use differently in your next meeting to help the group reach a clearer, more useful decision?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-meetings-that-move-forward`,
        title: `Meetings That Move Forward`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Practise simple ways to update colleagues, check understanding, ask questions and support clear meeting decisions.`,
        moments: [
            {
                id: `moment-short-project-update`,
                preview: `A short project update`,
                question: `A useful update often follows this order: what happened, what is happening now, and what happens next. How would you give a short update on a project you are working on?`,
                upgrade: {
                    term: `bring someone up to speed`,
                    type: `phrase`,
                    definition: `to give someone the latest information about a situation or project`,
                    ordinary: `I’ll give you the latest information about the project before we start.`,
                    upgraded: `I’ll bring you up to speed on the project before we discuss the next steps.`,
                    priority: `key`,
                    atlasPrompt: `How would you bring a new colleague up to speed before an important client meeting?`
                }
            },
            {
                id: `moment-when-something-is-unclear`,
                preview: `When something is unclear`,
                question: `You can check understanding by saying, “So, if I understand correctly, …” How would you use this phrase when a colleague explains a new task?`,
                upgrade: {
                    term: `pin down`,
                    type: `phrasal verb`,
                    definition: `To establish the exact details of something, especially when they are still unclear.`,
                    ordinary: `I’d ask a few questions to get the exact details of the task and its deadline.`,
                    upgraded: `I’d ask a few questions to pin down exactly what needs to be done and by when.`,
                    priority: `key`,
                    atlasPrompt: `How could you pin down the details of a project before agreeing to take responsibility for it?`
                }
            },
            {
                id: `moment-question-that-helps`,
                preview: `A question that helps`,
                question: `Instead of asking a very general question, try, “What would be the main benefit of this option?” What useful question would you ask about an idea in a meeting?`,
                upgrade: {
                    term: `trade-off`,
                    type: `noun`,
                    definition: `a situation where you accept one benefit or advantage in order to get another.`,
                    ordinary: `What are the advantages and disadvantages of choosing this option?`,
                    upgraded: `What are the main trade-offs if we choose this option?`,
                    priority: `key`,
                    atlasPrompt: `When comparing two ways to organise your working week, what trade-offs would you consider?`
                }
            },
            {
                id: `moment-disagreeing-without-tension`,
                preview: `Disagreeing without creating tension`,
                question: `You can disagree professionally by saying, “I see your point, but I’m not sure this will work because …” How would you use this phrase to challenge a colleague’s suggestion?`,
                upgrade: {
                    term: `raise a concern`,
                    type: `collocation`,
                    definition: `to say that you are worried about a possible problem or risk`,
                    ordinary: `I’m worried that this plan could cause problems for the team.`,
                    upgraded: `I’d like to raise a concern about the impact this plan could have on the team.`,
                    priority: `key`,
                    atlasPrompt: `In a project meeting, what concern might you raise before agreeing to a tight deadline?`
                },
                followUp: {
                    id: `same-disagreement-more-power`,
                    kind: `another-angle`,
                    prompt: `Now imagine the suggestion came from your manager or a senior client. How would you challenge the same idea while keeping the relationship constructive?`
                }
            },
            {
                id: `moment-making-next-step-clear`,
                preview: `Making the next step clear`,
                question: `To help a meeting finish clearly, ask, “What exactly are we agreeing to do next?” How would you use this question before the meeting ends?`,
                upgrade: {
                    term: `action point`,
                    type: `noun`,
                    definition: `a specific task that someone agrees to complete, usually by a certain time`,
                    ordinary: `Before we finish, we should agree on the next steps and who will do them.`,
                    upgraded: `Before we finish, let’s turn that into a clear action point for Maya to complete by Friday.`,
                    priority: `key`,
                    atlasPrompt: `How could you use the phrase “action point” when ending a project-planning call?`
                }
            }
        ],
        makeItReal: {
            title: `Close the Meeting Clearly`,
            prompt: `Imagine your meeting is about to end. Give a short closing statement: clarify the decision, raise one final concern or question, and state exactly what should happen next.`
        }
    },
    {
        id: `set-meetings-under-pressure`,
        title: `Meetings Under Pressure`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Explore how meeting language can manage uncertainty, competing priorities and disagreement while keeping decisions practical.`,
        moments: [
            {
                id: `moment-update-with-risk`,
                preview: `An update with a risk`,
                question: `When an update includes a problem, signal it clearly with, “The main risk is …” How would you give an update about a project that may miss its deadline?`,
                upgrade: {
                    term: `flag`,
                    type: `verb`,
                    definition: `to point out a possible problem or risk so people can consider it`,
                    ordinary: `I want to mention that the supplier may not deliver the materials on time.`,
                    upgraded: `I'd like to flag a potential delay with the supplier's delivery.`,
                    priority: `key`,
                    atlasPrompt: `What potential problem would you flag before an important client presentation?`
                }
            },
            {
                id: `moment-clarifying-real-priority`,
                preview: `Clarifying the real priority`,
                question: `When several tasks seem urgent, ask, “Which outcome matters most here?” How would you use this question when colleagues want different things from a project?`,
                upgrade: {
                    term: `get everyone on the same page`,
                    type: `idiom`,
                    definition: `make sure everyone has the same understanding or agrees about the main goal`,
                    ordinary: `Before we choose a solution, we need to make sure everyone agrees about the main goal.`,
                    upgraded: `Before we choose a solution, let’s get everyone on the same page about the main goal.`,
                    priority: `key`,
                    atlasPrompt: `How could you get everyone on the same page before starting a group project with unclear roles?`
                }
            },
            {
                id: `moment-testing-an-assumption`,
                preview: `Testing an assumption`,
                question: `To examine an idea carefully, say, “What are we basing that on?” How would you use this phrase when a colleague makes a strong claim without much evidence?`,
                upgrade: {
                    term: `back something up`,
                    type: `phrasal verb`,
                    definition: `to support a statement or claim with evidence or facts`,
                    ordinary: `What evidence do we have for that claim?`,
                    upgraded: `What evidence do we have to back that up?`,
                    priority: `key`,
                    atlasPrompt: `A supplier promises delivery by Friday. How could you ask them to back that up?`
                }
            },
            {
                id: `moment-offering-a-different-route`,
                preview: `Offering a different route`,
                question: `To challenge a proposal constructively, say, “Could we get the same result another way?” How would you use this question when you think a cheaper or simpler option might work?`,
                upgrade: {
                    term: `a viable alternative`,
                    type: `collocation`,
                    definition: `another option that has a realistic chance of working successfully`,
                    ordinary: `Could we look at another option that can still meet the deadline?`,
                    upgraded: `Before we commit, could we explore a viable alternative that meets the deadline?`,
                    priority: `key`,
                    atlasPrompt: `Your team wants to use a familiar supplier, but delivery is uncertain. How would you ask about a viable alternative?`
                }
            },
            {
                id: `moment-deciding-despite-uncertainty`,
                preview: `Deciding despite uncertainty`,
                question: `When a group cannot get complete information, move the discussion forward with, “What do we know well enough to decide today?” How would you use this phrase in a meeting where people keep asking for more time?`,
                upgrade: {
                    term: `make a call`,
                    type: `phrase`,
                    definition: `to make a decision, especially when the situation is difficult or uncertain`,
                    ordinary: `We need to decide which supplier to use before the end of the meeting.`,
                    upgraded: `We need to make a call on which supplier to use before the end of the meeting.`,
                    priority: `key`,
                    atlasPrompt: `When might you need to make a call before you have all the information you want?`
                },
                followUp: {
                    id: `information-worth-waiting-for`,
                    kind: `go-deeper`,
                    prompt: `What missing information would be important enough to delay the decision, and what uncertainty could you reasonably accept?`
                }
            }
        ],
        makeItReal: {
            title: `Make the Call`,
            prompt: `With your tutor playing a colleague, lead a short meeting decision about a project facing a deadline risk and competing priorities. Use at least two phrases from the discussion to test the situation, challenge one option, and recommend what the team should decide today.`
        }
    },
    {
        id: `set-meetings-we-create`,
        title: `The Meetings We Create`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Consider how meeting habits shape trust, participation, accountability and the quality of decisions across a workplace.`,
        moments: [
            {
                id: `moment-whose-voice-gets-heard`,
                preview: `Whose voice gets heard`,
                question: `To invite a quieter colleague into the discussion, say, “We haven’t heard your view yet.” How would you use this respectfully when the same people usually do most of the talking?`,
                upgrade: {
                    term: `make space for`,
                    type: `phrase`,
                    definition: `To give someone time and opportunity to speak or contribute.`,
                    ordinary: `A good chairperson gives quieter people a chance to contribute.`,
                    upgraded: `A good chairperson makes space for quieter people to contribute.`,
                    priority: `key`,
                    atlasPrompt: `How could you make space for a colleague who has useful expertise but rarely speaks in team meetings?`
                },
                followUp: {
                    id: `invite-without-putting-on-the-spot`,
                    kind: `add-a-twist`,
                    prompt: `What if the quieter colleague looks uncomfortable being invited to speak publicly? How else could you make space for their view?`
                }
            },
            {
                id: `moment-speed-versus-careful-thinking`,
                preview: `Speed versus careful thinking`,
                question: `To slow down a rushed decision, say, “Before we decide, can we look at one possible risk?” How would you use this when a team wants to act quickly?`,
                upgrade: {
                    term: `buy some time`,
                    type: `phrase`,
                    definition: `To delay a decision or action briefly so you can think, check information, or prepare.`,
                    ordinary: `I’d like us to wait until we have checked the customer data.`,
                    upgraded: `Could we buy some time by checking the customer data before we commit?`,
                    priority: `key`,
                    atlasPrompt: `When might you ask a colleague to buy some time before responding to a difficult client?`
                }
            },
            {
                id: `moment-decision-people-can-trust`,
                preview: `A decision people can trust`,
                question: `To make the basis for a decision clear, say, “We chose this option because …” How would you explain a difficult team decision to someone who disagreed with it?`,
                upgrade: {
                    term: `justify`,
                    type: `verb`,
                    definition: `to give clear reasons for a decision or action, especially when someone questions it`,
                    ordinary: `I explained why we chose the more expensive supplier, even though some people disagreed.`,
                    upgraded: `I justified the decision by showing how the more expensive supplier would reduce risks later.`,
                    priority: `key`,
                    atlasPrompt: `When you need approval for an unpopular change, how would you justify it to your colleagues?`
                }
            },
            {
                id: `moment-meetings-and-accountability`,
                preview: `Meetings and real accountability`,
                question: `To confirm responsibility, ask, “Who will take this forward, and by when?” How would you use this question when a meeting produces many ideas but no clear action?`,
                upgrade: {
                    term: `follow through`,
                    type: `phrasal verb`,
                    definition: `to do what you said you would do, especially by completing an agreed action`,
                    ordinary: `We need to make sure someone completes each task after the meeting.`,
                    upgraded: `We need to make sure someone follows through on each task after the meeting.`,
                    priority: `key`,
                    atlasPrompt: `How could you encourage a colleague to follow through on an important task without sounding too demanding?`
                }
            },
            {
                id: `moment-changing-an-unhelpful-culture`,
                preview: `Changing an unhelpful culture`,
                question: `To suggest a better meeting habit, say, “Could we try a different approach next time?” What meeting behaviour would you change in your workplace, and why?`,
                upgrade: {
                    term: `set the tone`,
                    type: `collocation`,
                    definition: `To establish the general mood, attitude, or standard that others are likely to follow.`,
                    ordinary: `Managers strongly influence how people behave in meetings by showing what they expect.`,
                    upgraded: `Managers set the tone by listening carefully, inviting different views, and keeping discussions respectful.`,
                    priority: `key`,
                    atlasPrompt: `How could a manager set the tone for respectful communication when a new team starts working together?`
                }
            }
        ],
        makeItReal: {
            title: `Design One Better Meeting Rule`,
            prompt: `Choose one meeting habit you would change in your workplace and turn it into a simple team rule. Tell your tutor the rule, explain why it matters, and give one phrase a colleague could use to follow it.`
        }
    }
];

const clCards = [
    {
        id: `cl-decision-before-the-meeting`,
        title: `The Decision Before the Meeting`,
        contextLine: `Japan: nemawashi and workplace decisions`,
        teaser: `In some Japanese workplaces, the meeting is not where agreement begins—it is where earlier conversations become official.`,
        context: `The practice of nemawashi means informally preparing the people affected by a decision before a formal meeting. Colleagues may share concerns privately, adjust a proposal, and build support before the group discusses it openly. As a result, a meeting can seem quiet or indirect, but the decision may still be carefully considered and widely supported.`,
        followTheThread: [
            `How could a meeting leader make space for disagreement without making people feel publicly embarrassed?`,
            `What should the meeting record include so that the final decision and next steps are clear to everyone?`
        ],
        upgrade: {
            term: `sound someone out`,
            type: `phrasal verb`,
            definition: `To talk to someone informally to discover their opinion before making a decision.`,
            ordinary: `I’d like to ask a few colleagues what they think before we decide.`,
            upgraded: `I’d like to sound out the colleagues affected by the proposal before we make a final decision.`,
            priority: `key`,
            atlasPrompt: `When might you sound someone out before announcing a change to your team?`
        },
        mainQuestion: `A useful way to challenge an idea professionally is to say, “Could we look at one possible risk before we decide?” Imagine that your team is about to approve a proposal, but some important colleagues have not been consulted. Would you raise the concern in the meeting, speak to people privately first, or do both? Why?`
    },
    {
        id: `cl-silence-is-not-agreement`,
        title: `When Silence Is Not Agreement`,
        contextLine: `South Korea: hierarchy and speaking up at work`,
        teaser: `A quiet room may show respect, uncertainty, or disagreement—not necessarily support for the decision.`,
        context: `In many South Korean workplaces, hierarchy can influence who speaks first and how directly junior employees challenge senior colleagues. A person may avoid openly saying “no” in a group meeting, especially when a manager has stated a strong opinion. In an international team, a useful follow-up can make disagreement safer: “Could I check whether everyone is comfortable with this plan?”`,
        followTheThread: [
            `How could a manager invite honest questions without putting a junior colleague under pressure?`,
            `What signs might help you distinguish respectful silence from real agreement in a multicultural meeting?`
        ],
        upgrade: {
            term: `read the room`,
            type: `idiom`,
            definition: `To notice the mood, reactions, and level of support in a group before you speak or act.`,
            ordinary: `We should pay attention to how people are reacting before we ask for a decision.`,
            upgraded: `We should read the room before we ask for a decision.`,
            priority: `key`,
            atlasPrompt: `You are leading a project update and the team seems tired and distracted. How could you read the room before introducing a new request?`
        },
        mainQuestion: `Use the phrase “Could I check whether everyone is comfortable with this plan?” Imagine a senior manager proposes a deadline that your team thinks is unrealistic: how would you raise the concern and help the group reach a clear decision?`
    },
    {
        id: `cl-consensus-takes-time`,
        title: `Consensus Takes Time`,
        contextLine: `Sweden: consensus in workplace meetings`,
        teaser: `In some Swedish workplaces, a decision may take longer because people are expected to understand concerns before moving forward.`,
        context: `Swedish workplace culture is often associated with consensus: people may expect colleagues to contribute, raise concerns, and support a decision before it is announced. This can make meetings feel less competitive, but it may also seem slow to people who expect a manager to decide quickly. A useful phrase in this setting is, “Could we hear any concerns before we make a final decision?”`,
        followTheThread: [
            `When is consensus worth the extra time, and when is a clear manager’s decision more practical?`,
            `How can a meeting leader invite honest concerns without making the discussion continue indefinitely?`
        ],
        upgrade: {
            term: `build consensus`,
            type: `collocation`,
            definition: `to help a group reach an agreement that its members can support`,
            ordinary: `We should discuss the different views before we decide.`,
            upgraded: `We need to build consensus before we commit to the new plan.`,
            priority: `key`,
            atlasPrompt: `How could you build consensus when your project team disagrees about its priorities?`
        },
        mainQuestion: `Use the phrase “Could we hear any concerns before we make a final decision?” How would you use it in a meeting where your team wants to move quickly, but one or two people may not yet support the proposal?`
    },
    {
        id: `cl-polite-challenge`,
        title: `The Polite Challenge`,
        contextLine: `The Netherlands: direct feedback in meetings`,
        teaser: `A direct comment can sound negative in one workplace but clear and helpful in another.`,
        context: `In many Dutch workplaces, colleagues may state disagreement openly and separate the idea from the person. Someone might say, “I don’t think this approach will work because…” and still expect a constructive discussion, not an argument. The useful meeting skill is to make the reason clear while keeping the tone respectful.`,
        followTheThread: [
            `How might this direct style be misunderstood by someone who expects disagreement to be expressed more indirectly?`,
            `What would you say if a colleague challenged your idea clearly but you felt their tone was too strong?`
        ],
        upgrade: {
            term: `push back on`,
            type: `phrasal verb`,
            definition: `To question or disagree with an idea, plan, or request in a clear but professional way.`,
            ordinary: `I want to question the proposed deadline because it may not be realistic.`,
            upgraded: `I’d like to push back on the proposed deadline because it may not be realistic.`,
            priority: `key`,
            atlasPrompt: `When might you need to push back on a request from a client or manager, and how could you do it professionally?`
        },
        mainQuestion: `The phrase “I see the benefit, but I have a concern about…” helps you challenge an idea without rejecting the person; in a meeting, how would you use it to question a proposed plan and move the group toward a better decision?`
    },
    {
        id: `cl-disagree-then-commit`,
        title: `Disagree, Then Commit`,
        contextLine: `United States: Amazon’s decision-making principle`,
        teaser: `A team can disagree strongly during discussion and still leave the meeting united behind one decision.`,
        context: `Amazon is known for the workplace principle “disagree and commit.” It encourages people to explain their concerns before a decision, but once the decision is made, they support the agreed action instead of reopening the same debate. A useful meeting phrase is: “I still have concerns, but I’m prepared to support the decision.”`,
        followTheThread: [
            `What information should a team check before asking people to commit to a decision?`,
            `How can a manager make sure that “commit” does not simply mean hiding disagreement?`
        ],
        upgrade: {
            term: `stand behind`,
            type: `phrasal verb`,
            definition: `to support a person, idea, or decision, even if it was not your first choice`,
            ordinary: `I don't fully agree, but I can support the team's decision and help put it into practice.`,
            upgraded: `I don't fully agree, but I can stand behind the decision and help put it into practice.`,
            priority: `key`,
            atlasPrompt: `If your team chooses a project deadline that you think is risky, how could you say that you will stand behind it?`
        },
        mainQuestion: `Use the phrase “I still have concerns, but I’m prepared to support the decision”: in a meeting, when would this be a better response than continuing to argue?`
    },
    {
        id: `cl-english-as-shared-workplace-language`,
        title: `When English Is Everyone’s Second Language`,
        contextLine: `International teams: English as a shared workplace language`,
        teaser: `In a multilingual meeting, simple English can be more professional than impressive English.`,
        context: `In international teams, colleagues may use English as a shared language even when it is nobody’s first language. Idioms, fast speech, and vague phrases such as “We’ll see” can create different interpretations, so effective speakers often use plain language and confirm the decision. A useful move is: “Just to check, are we agreeing to…?”`,
        followTheThread: [
            `What workplace expressions or idioms might be confusing for colleagues from other language backgrounds?`,
            `How can a chairperson make sure that a quiet participant has understood and accepted the final decision?`
        ],
        upgrade: {
            term: `spell out`,
            type: `phrasal verb`,
            definition: `To explain something clearly and in detail, so that there is little chance of misunderstanding.`,
            ordinary: `Could you explain exactly what we have agreed to?`,
            upgraded: `Could you spell out exactly what we have agreed to?`,
            priority: `key`,
            atlasPrompt: `When giving instructions to a new colleague, what would you spell out to prevent confusion?`
        },
        mainQuestion: `In a meeting with international colleagues, how would you use the phrase “Just to check, are we agreeing to…?” to confirm a decision without sounding difficult or distrustful?`
    },
    {
        id: `cl-business-starts-with-trust`,
        title: `Business Starts with Trust`,
        contextLine: `Spain: relationship-building before the agenda`,
        teaser: `In some Spanish business settings, a few minutes of personal conversation can help the real meeting begin.`,
        context: `In Spain, workplace meetings may begin with conversation about family, travel, food, or recent events before people move to the agenda. This is not necessarily a waste of time: building a comfortable relationship can make later questions, disagreement, and negotiation easier. However, international teams still need to make the practical outcome clear.`,
        followTheThread: [
            `How might this opening feel different from a meeting culture where people start with the agenda immediately?`,
            `What signs would help you decide whether personal conversation is strengthening the meeting or preventing useful progress?`
        ],
        upgrade: {
            term: `strike a balance`,
            type: `collocation`,
            definition: `to find a good middle point between two different needs or priorities`,
            ordinary: `We need to keep the meeting friendly but still finish on time.`,
            upgraded: `We need to strike a balance between building relationships and keeping the meeting on track.`,
            priority: `key`,
            atlasPrompt: `How could you strike a balance between giving detailed information and keeping a presentation concise?`
        },
        mainQuestion: `A useful move is to connect warmth with structure: “It’s good to catch up. Shall we move to the first item?” Imagine you are leading a meeting with Spanish colleagues and the opening conversation is taking longer than planned. How would you keep the relationship positive while bringing the group back to the agenda?`
    },
    {
        id: `cl-agreement-is-not-unanimity`,
        title: `Agreement Is Not Always Unanimity`,
        contextLine: `European Union: consensus and formal voting`,
        teaser: `A group can move forward without everyone loving the decision—as long as the decision process is clear.`,
        context: `In European Union institutions, people often try to build consensus, but some decisions are made through formal voting, including qualified majority voting. This shows an important meeting distinction: agreement can mean shared support, no serious objection, or simply acceptance of the agreed process. In business meetings, making that meaning explicit prevents confusion later.`,
        followTheThread: [
            `How could you check whether someone is genuinely accepting the decision rather than staying silent?`,
            `When is it better to delay a decision and seek stronger agreement?`
        ],
        upgrade: {
            term: `go along with`,
            type: `phrasal verb`,
            definition: `to accept or support a decision, plan, or suggestion even if it was not your first choice`,
            ordinary: `I do not completely agree with the proposal, but I am willing to accept it.`,
            upgraded: `I have some reservations, but I can go along with the decision if we review the results next month.`,
            priority: `key`,
            atlasPrompt: `Your manager suggests a plan you would not have chosen yourself. How could you explain that you can go along with it, and what condition might you add?`
        },
        mainQuestion: `A useful move is to say, “Can we agree that this is the decision, even if it is not everyone’s first choice?” Imagine your team has discussed two options and needs to move forward today: how would you use this phrase or a similar one?`
    },
    {
        id: `cl-daily-stand-up`,
        title: `The Meeting That Stays Standing`,
        contextLine: `Agile teams: the daily stand-up`,
        teaser: `A short daily meeting can work best when updates focus on progress, obstacles and the next action—not long explanations.`,
        context: `In Scrum and other agile ways of working, a daily stand-up is designed to help a team coordinate quickly. Participants often share what they completed, what they will do next, and what is blocking them; detailed problem-solving happens separately with the right people. This creates a useful distinction between giving an update and trying to solve every issue in the meeting.`,
        followTheThread: [
            `When does a short meeting become too short to deal with an important problem?`,
            `How can a team make sure that “I need help” leads to a clear owner and next step?`
        ],
        upgrade: {
            term: `take it offline`,
            type: `phrase`,
            definition: `to continue a detailed or sensitive discussion separately, outside the current meeting`,
            ordinary: `We should discuss the technical details after this meeting with the right people.`,
            upgraded: `Let’s take the technical details offline and keep this meeting focused on the update.`,
            priority: `key`,
            atlasPrompt: `A meeting is running out of time, but two colleagues want to discuss a complex issue. How would you suggest taking it offline?`
        },
        mainQuestion: `A clear update move is to separate status from action: “So far…, next…, and I need…”. Imagine you are in a daily stand-up and your task is delayed by another team—how would you use this structure to explain the situation and ask for useful help?`
    }
];
