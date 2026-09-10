/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  Job Interviews: Clear Answers Under Pressure
  ---------------------------------------------------------------------------
  A practical interview-performance subject for shaping concise answers,
  choosing strong evidence, responding to difficult follow-up questions,
  and staying composed when the conversation changes direction. Built for
  tutor-led speaking practice, role-play, and real-world interview preparation.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `job-interviews-clear-answers`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `Job Interviews: Clear Answers Under Pressure`,
    titleHtml: `Job Interviews: <em>Clear Answers Under Pressure</em>`,
    navTitle: `Job Interviews`,
    bgImage: `https://pub-13d93423376c4822820635b75cfbea29.r2.dev/images/interview-cover.png`
};

const subjectCopy = {
    cover: {
        hook: `Turn pressure into clear answers.`
    },
    overview: {
        heading: `When Your Mind Goes Blank`,
        intro: [
            `A difficult question can make even a prepared person lose their words. This conversation focuses on simple ways to organise your thoughts, choose a useful example, and stay calm when someone asks for more detail.`
        ],
        question: `How do you usually prepare before an important conversation?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Practise shaping clear answers, choosing useful examples, and handling follow-up questions with confidence.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `See how expectations about confidence, politeness, and personal examples can change the way people answer interview questions.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from the practice and decide what you want to carry into your next important conversation.`
    },
    culturalLens: {
        heading: `Different Rules for the Same Question`,
        intro: `Interview answers can be shaped by local ideas about confidence, respect, directness, and personal experience. Explore how people in different places and professional cultures prepare examples, show their strengths, and respond to follow-up questions.`
    },
    discussion: {
        heading: `From First Answer to Follow-Up`,
        intro: `Explore how the way you choose an example, explain your decisions, and respond to extra questions can change the strength of an interview answer. Consider what helps you sound clear and confident when you do not have much time to think.`
    },
    reflection: {
        title: `Your Next Answer`,
        summary: `Strong interview answers balance preparation with flexibility: you need a clear example, but also the calm to explain your choices, respond honestly, and adapt to different expectations. This reflection helps you turn those ideas into a more confident approach for future conversations.`,
        questions: [
            `After exploring different ways to structure an answer, show confidence, and handle follow-up questions, what would you now change about the way you answer under pressure?`,
            `What is one practical habit or strategy you could use before or during your next important interview or conversation?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-interview-first-answers`,
        title: `Your Interview First Answers`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Share familiar interview experiences, simple answer choices, and ways to stay clear when questions feel difficult.`,
        moments: [
            {
                id: `moment-question-you-expect`,
                preview: `The question you expect`,
                question: `Before an interview, which questions do you usually prepare for, and how do you prepare your answers?`,
                upgrade: {
                    term: `anticipate`,
                    type: `verb`,
                    definition: `to think about what is likely to happen or be asked so you can be ready`,
                    ordinary: `I think about the questions the interviewer might ask and plan my answers.`,
                    upgraded: `I try to anticipate the questions the interviewer is likely to ask and prepare clear answers.`,
                    priority: `key`,
                    atlasPrompt: `What questions do you try to anticipate before an important meeting or presentation?`
                }
            },
            {
                id: `moment-useful-personal-example`,
                preview: `A useful personal example`,
                question: `Think of a time you solved a problem at work, school, or in daily life. What would you choose to say about it in an interview?`,
                upgrade: {
                    term: `take ownership of`,
                    type: `collocation`,
                    definition: `to accept responsibility for a task, problem, or result and actively deal with it`,
                    ordinary: `I was responsible for fixing the problem and making sure it did not happen again.`,
                    upgraded: `I took ownership of the problem, organised a solution, and made sure it did not happen again.`,
                    priority: `key`,
                    atlasPrompt: `When have you taken ownership of a task or problem outside an interview?`
                }
            },
            {
                id: `moment-short-answer-or-full-story`,
                preview: `Short answer or full story`,
                question: `When someone asks about your experience, is it better to give a short answer first or tell the whole story? Why?`,
                upgrade: {
                    term: `get straight to the point`,
                    type: `phrase`,
                    definition: `To say the most important thing first, without unnecessary background or detail.`,
                    ordinary: `In an interview, I would answer the question briefly and then give a relevant example.`,
                    upgraded: `In an interview, I try to get straight to the point and then add a relevant example.`,
                    priority: `key`,
                    atlasPrompt: `When explaining a problem to a busy colleague, how could you get straight to the point?`
                }
            },
            {
                id: `moment-when-your-mind-goes-blank`,
                preview: `When your mind goes blank`,
                question: `If you need more time to answer an interview question, what could you say or do?`,
                upgrade: {
                    term: `gather your thoughts`,
                    type: `phrase`,
                    definition: `to take a short time to organise your ideas before you speak`,
                    ordinary: `Could I have a moment to organise my ideas before I answer?`,
                    upgraded: `Could I have a moment to gather my thoughts before I answer?`,
                    priority: `key`,
                    atlasPrompt: `When else might you need to gather your thoughts before responding?`
                },
                followUp: {
                    id: `buy-yourself-five-seconds`,
                    kind: `go-deeper`,
                    prompt: `Give the exact sentence you would use to buy yourself five seconds without sounding unprepared.`
                }
            },
            {
                id: `moment-unexpected-follow-up`,
                preview: `The unexpected follow-up`,
                question: `If an interviewer asks for more details about your answer, what kind of follow-up question would be hardest for you, and why?`,
                upgrade: {
                    term: `elaborate on`,
                    type: `phrasal verb`,
                    definition: `to give more details or explain something more fully`,
                    ordinary: `I would find it difficult if the interviewer asked me to explain one part of my answer in more detail.`,
                    upgraded: `I would find it difficult if the interviewer asked me to elaborate on a mistake I had made at work.`,
                    priority: `key`,
                    atlasPrompt: `When might someone ask you to elaborate on something you said in a meeting or presentation?`
                }
            }
        ],
        makeItReal: {
            title: `Handle the Follow-Up`,
            prompt: `Ask your tutor to give you an interview question, then answer in a clear short structure with one example. When your tutor asks a follow-up question, respond with one useful detail—or use a natural phrase to give yourself time before answering.`
        }
    },
    {
        id: `set-building-stronger-answers`,
        title: `Building Stronger Answers`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Examine how examples, structure, tone, and follow-up choices can make interview answers clearer and more convincing.`,
        moments: [
            {
                id: `moment-example-that-proves-it`,
                preview: `The example that proves it`,
                question: `Two examples may fit the same interview question, but one may show more useful skills. How would you decide which example to use?`,
                upgrade: {
                    term: `highlight`,
                    type: `verb`,
                    definition: `To give special attention to the most important quality, skill, or detail.`,
                    ordinary: `I would choose the example that shows the skills most relevant to the position.`,
                    upgraded: `I would choose the example that highlights the skills most relevant to the position.`,
                    priority: `key`,
                    atlasPrompt: `When describing a project to a new client, what would you highlight to build trust?`
                }
            },
            {
                id: `moment-details-that-earn-attention`,
                preview: `Details that earn attention`,
                question: `An answer can become weak if it is too general or too detailed. Which details make a work or study example sound believable and relevant?`,
                upgrade: {
                    term: `back up your claims`,
                    type: `phrase`,
                    definition: `Support what you say with specific facts, examples, or evidence.`,
                    ordinary: `You should support your answer with a specific example from your previous experience.`,
                    upgraded: `You should back up your claims with a specific example from your previous experience.`,
                    priority: `key`,
                    atlasPrompt: `How could you back up your claims when suggesting a change at work?`
                }
            },
            {
                id: `moment-explaining-your-decisions`,
                preview: `Explaining your decisions`,
                question: `When you describe a difficult situation, how can explaining your choices show good judgement rather than make the answer too long?`,
                upgrade: {
                    term: `weigh up`,
                    type: `phrasal verb`,
                    definition: `to carefully consider the advantages, disadvantages, and possible results before making a decision`,
                    ordinary: `I considered the possible risks before deciding to change the plan.`,
                    upgraded: `I weighed up the possible risks and benefits before deciding to change the plan.`,
                    priority: `key`,
                    atlasPrompt: `When making an important personal or financial decision, what factors do you usually weigh up?`
                }
            },
            {
                id: `moment-confidence-without-exaggeration`,
                preview: `Confidence without exaggeration`,
                question: `What is the difference between sounding confident and sounding as if you are exaggerating your achievements in an interview?`,
                upgrade: {
                    term: `come across as`,
                    type: `phrasal verb`,
                    definition: `To seem or appear a particular way to other people, especially through the way you speak or behave.`,
                    ordinary: `A candidate can sound confident without seeming arrogant or unrealistic.`,
                    upgraded: `A candidate can come across as confident without sounding as if they are exaggerating their achievements.`,
                    priority: `key`,
                    atlasPrompt: `When you explain a disagreement at work, how can you come across as professional rather than defensive?`
                },
                followUp: {
                    id: `claim-gets-challenged`,
                    kind: `another-angle`,
                    prompt: `Now imagine the interviewer challenges your claim. How would you defend it without exaggerating or becoming defensive?`
                }
            },
            {
                id: `moment-question-changes-direction`,
                preview: `When the question changes direction`,
                question: `If a follow-up question challenges your first answer or asks about a weakness, how could you stay focused while giving an honest response?`,
                upgrade: {
                    term: `acknowledge`,
                    type: `verb`,
                    definition: `to recognize and admit something honestly, especially a problem, weakness, or difficult point`,
                    ordinary: `I would admit that this is an area I need to improve and explain what I am doing about it.`,
                    upgraded: `I would acknowledge the weakness and explain the specific steps I am taking to improve.`,
                    priority: `key`,
                    atlasPrompt: `If a colleague points out a problem in your work, how could you acknowledge it professionally?`
                }
            }
        ],
        makeItReal: {
            title: `Choose, Shape, Deliver`,
            prompt: `Choose one interview question and two experiences that could answer it. Decide which experience is stronger, explain your choice, then give a concise answer with the most relevant details and a clear explanation of your decisions.`
        }
    },
    {
        id: `set-what-interviews-really-reward`,
        title: `What Interviews Really Reward`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Consider what interview answers reveal about fairness, workplace expectations, and the kind of candidate employers choose.`,
        moments: [
            {
                id: `moment-skill-or-speaking-performance`,
                preview: `Skill or speaking performance`,
                question: `If two candidates have similar experience but one speaks more smoothly under pressure, should that affect the hiring decision? Why or why not?`,
                upgrade: {
                    term: `articulate`,
                    type: `verb`,
                    definition: `To express your ideas clearly and effectively, especially when the situation is difficult or important.`,
                    ordinary: `She explained her experience clearly, even though the interviewer asked several difficult questions.`,
                    upgraded: `She articulated her experience clearly, even when the interviewer asked several difficult questions.`,
                    priority: `key`,
                    atlasPrompt: `How would you articulate your opinion if you disagreed with a colleague’s proposal?`
                }
            },
            {
                id: `moment-culture-behind-question`,
                preview: `The culture behind the question`,
                question: `What might an interviewer learn from asking about failure, conflict, or difficult decisions, and what might these questions fail to show?`,
                upgrade: {
                    term: `paint a complete picture`,
                    type: `phrase`,
                    definition: `To give a full and accurate understanding of a person, situation, or issue.`,
                    ordinary: `A few interview questions cannot show everything about a candidate.`,
                    upgraded: `A few interview questions cannot paint a complete picture of a candidate.`,
                    priority: `key`,
                    atlasPrompt: `Can a short online review paint a complete picture of a restaurant or service? Why or why not?`
                }
            },
            {
                id: `moment-honesty-about-uncertainty`,
                preview: `Honesty about uncertainty`,
                question: `Should candidates admit when they do not know an answer, or try to give their best possible response? What could happen in each case?`,
                upgrade: {
                    term: `be upfront about`,
                    type: `phrase`,
                    definition: `to speak honestly and directly about something, especially when it may be difficult or uncomfortable`,
                    ordinary: `I would honestly say that I do not know the answer yet.`,
                    upgraded: `I’d be upfront about what I know and explain how I would find the answer.`,
                    priority: `key`,
                    atlasPrompt: `If a project is behind schedule, how could you be upfront about the problem with your manager?`
                },
                followUp: {
                    id: `need-it-from-day-one`,
                    kind: `add-a-twist`,
                    prompt: `The interviewer says, “We need someone who can handle this from day one.” How would you respond without pretending to know something you do not?`
                }
            },
            {
                id: `moment-different-ideas-of-confidence`,
                preview: `Different ideas of confidence`,
                question: `How might ideas about confidence, politeness, or eye contact differ between cultures, and should interviewers make allowances for this?`,
                upgrade: {
                    term: `factor in`,
                    type: `phrasal verb`,
                    definition: `To include something when making a decision or judgement.`,
                    ordinary: `Interviewers should consider cultural differences when judging a candidate’s confidence.`,
                    upgraded: `Interviewers should factor in cultural differences when judging a candidate’s confidence.`,
                    priority: `key`,
                    atlasPrompt: `When making an important decision at work, what personal or practical factors should you factor in?`
                }
            },
            {
                id: `moment-answers-after-interview`,
                preview: `Answers after the interview`,
                question: `If a candidate gives a weak answer but performs well in the job, how much should the interview influence the employer’s final judgement?`,
                upgrade: {
                    term: `look beyond`,
                    type: `phrasal verb`,
                    definition: `Consider more than the first problem or impression before making a judgement.`,
                    ordinary: `The employer should consider the candidate’s actual performance, not only the interview.`,
                    upgraded: `The employer should look beyond a weak interview and consider how well the candidate performs in the job.`,
                    priority: `key`,
                    atlasPrompt: `When might you need to look beyond a person’s first impression before making a decision?`
                }
            }
        ],
        makeItReal: {
            title: `Build a Fair Interview Rule`,
            prompt: `Create one practical rule for judging interview answers fairly: say what the interviewer should reward, what they should not overvalue, and why. Explain your rule to your tutor, then respond when they challenge it with a different candidate’s situation.`
        }
    }
];

const clCards = [
    {
        id: `cl-answer-must-fit-scorecard`,
        title: `When the Answer Must Fit the Scorecard`,
        contextLine: `UK public-sector interviews`,
        teaser: `In some interviews, a well-told story matters less than showing clear evidence for each skill being assessed.`,
        context: `Many UK public-sector interviews use structured questions linked to specific competencies, such as teamwork, planning, or problem-solving. Interviewers may ask for one real example and then follow up about your exact actions and results. Candidates often use a structure like Situation, Task, Action, Result to make their evidence easy to score.`,
        followTheThread: [
            `How could you prepare examples that show one skill without sounding as if you memorised a speech?`,
            `What would you say if the interviewer asked for your personal contribution after you had described a team success?`
        ],
        upgrade: {
            term: `quantify`,
            type: `verb`,
            definition: `to describe something using numbers or a clear amount so its size or effect is easier to understand`,
            ordinary: `I explained the result, but I did not give any numbers to show how successful it was.`,
            upgraded: `I tried to quantify the results by showing the amount of time we saved.`,
            priority: `key`,
            atlasPrompt: `When describing the success of a personal project, what could you quantify to make your explanation more convincing?`
        },
        mainQuestion: `Would this structured style help you give clearer answers, or would it make you feel less natural under pressure? Why?`
    },
    {
        id: `cl-confident-without-bragging`,
        title: `Confident Without Bragging`,
        contextLine: `Japanese job interviews`,
        teaser: `A strong answer can show confidence while still respecting expectations about modesty and group harmony.`,
        context: `In many Japanese job interviews, candidates prepare a short jikoshoukai, or self-introduction, and explain how their experience could support the organisation. They may avoid sounding overly boastful, but they still need to give concrete evidence of their skills. This creates a useful challenge: how can a candidate sound respectful without making their answer vague or too modest?`,
        followTheThread: [
            `Would you change your answer if the interviewer valued teamwork more than individual achievement? Why?`,
            `What polite phrases could help you disagree with a difficult follow-up question or correct the interviewer’s misunderstanding?`
        ],
        upgrade: {
            term: `strike a balance`,
            type: `collocation`,
            definition: `to find a sensible middle point between two different needs or qualities`,
            ordinary: `I try to sound confident, but I do not want to seem boastful.`,
            upgraded: `I try to strike a balance between showing my strengths and staying modest.`,
            priority: `key`,
            atlasPrompt: `How could you strike a balance between being honest and being diplomatic when giving a colleague feedback?`
        },
        mainQuestion: `How can you show your strengths clearly in an interview without sounding as if you are boasting?`
    },
    {
        id: `cl-personal-question-crosses-line`,
        title: `When a Personal Question Crosses a Line`,
        contextLine: `United States workplace interviews`,
        teaser: `A calm, professional redirect can be stronger than answering an inappropriate question directly.`,
        context: `In the United States, interview questions about topics such as age, religion, marital status, or pregnancy may create legal and ethical concerns, although the rules vary by situation and location. Candidates often prepare a short bridge back to the job, such as, “I can meet the travel requirements, and I’d be happy to explain my relevant experience.” This approach helps them stay composed while giving the interviewer useful information.`,
        followTheThread: [
            `What makes a professional redirect sound confident rather than defensive?`,
            `Should interviewers be allowed to ask any question if it helps them understand a candidate’s personality? Why or why not?`
        ],
        upgrade: {
            term: `steer the conversation back to`,
            type: `phrasal verb`,
            definition: `to guide a discussion back to the main topic or a more useful subject`,
            ordinary: `I would bring the discussion back to my experience and skills.`,
            upgraded: `I would steer the conversation back to my experience and the requirements of the role.`,
            priority: `key`,
            atlasPrompt: `How could you steer the conversation back to the main issue if a colleague starts discussing an unrelated problem in a meeting?`
        },
        mainQuestion: `If an interviewer asked you a personal question that did not seem relevant to the job, how would you respond? Would you answer, redirect the question, or refuse?`
    },
    {
        id: `cl-i-for-action-we-for-result`,
        title: `I for My Action, We for the Result`,
        contextLine: `South Korean corporate interviews`,
        teaser: `In a team-focused interview culture, candidates may need to show individual ability without sounding disconnected from the group.`,
        context: `South Korean corporate interviews can place strong importance on teamwork, respect, and fitting into an organization. A useful answer structure is to explain exactly what you did, then show how your action helped the team or project. This helps a candidate answer follow-up questions clearly without presenting every success as a completely individual achievement.`,
        followTheThread: [
            `What follow-up question might an interviewer ask to test whether your contribution was really important?`,
            `When does talking too much about teamwork make it difficult for an interviewer to understand your own skills?`
        ],
        upgrade: {
            term: `contribute to`,
            type: `collocation`,
            definition: `To help cause a result or help something succeed.`,
            ordinary: `I helped the project succeed by organizing the schedule and checking the final details.`,
            upgraded: `I contributed to the project’s success by organizing the schedule and checking the final details.`,
            priority: `key`,
            atlasPrompt: `Think of a successful event or activity outside work: what did you contribute to its success?`
        },
        mainQuestion: `How could you describe your personal contribution to a team project while also showing respect for the team’s shared success?`
    },
    {
        id: `cl-think-aloud-not-answer-fast`,
        title: `Think Aloud, Not Just Answer Fast`,
        contextLine: `Management consulting interviews`,
        teaser: `In a case interview, interviewers often assess how you reason through an unfamiliar problem, not only whether you reach the right answer.`,
        context: `Candidates may be asked to estimate a market, explain a business problem, or recommend a decision with limited information. A strong response usually starts by clarifying the question, breaking the problem into parts, stating assumptions, and explaining the reasoning aloud. Follow-up questions are often part of the test: they show whether the candidate can listen, adapt, and stay organized under pressure.`,
        followTheThread: [
            `What phrases could you use to clarify the problem or explain an assumption while you are thinking?`,
            `How would you respond if the interviewer challenged one of your assumptions halfway through your answer?`
        ],
        upgrade: {
            term: `walk someone through`,
            type: `phrasal verb`,
            definition: `to explain a process or idea step by step so someone can follow it easily`,
            ordinary: `I would explain my reasoning step by step before giving my recommendation.`,
            upgraded: `I would walk the interviewer through my reasoning before giving my recommendation.`,
            priority: `key`,
            atlasPrompt: `When you need to explain a complicated decision to a colleague, how would you walk them through it?`
        },
        mainQuestion: `Would you find it easier or harder to give a good answer if the interviewer cared as much about your reasoning as your final conclusion? Why?`
    },
    {
        id: `cl-make-your-story-make-sense`,
        title: `Make Your Story Make Sense`,
        contextLine: `French motivation interviews`,
        teaser: `In some French interviews, candidates are expected to explain the logic connecting their studies, choices, and future plans.`,
        context: `A French entretien de motivation may focus closely on why a candidate chose a particular field, changed direction, or applied to this organisation. The interviewer may be listening for a coherent career story, not only a list of achievements. A clear answer can connect one past choice, what the candidate learned, and why the role is the next step.`,
        followTheThread: [
            `How would you answer if the interviewer challenged one of your choices or asked why you changed direction?`,
            `Is it better to present your career as a clear plan, or to be honest that some decisions were uncertain at the time?`
        ],
        upgrade: {
            term: `make a case for`,
            type: `phrase`,
            definition: `To give clear reasons why something should be accepted, supported, or chosen.`,
            ordinary: `I explained why this role is a good fit for my experience.`,
            upgraded: `I made a strong case for why this role was the logical next step in my career.`,
            priority: `key`,
            atlasPrompt: `What could you make a case for when asking your manager to support a change at work?`
        },
        mainQuestion: `If an interviewer asked you to explain the story behind your career choices, which experience would you use to show where you are going and why this job fits?`
    }
];
