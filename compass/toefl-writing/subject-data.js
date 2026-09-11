/*
  ===========================================================================
  ATLAS · COMPASS SUBJECT MODULE
  SmartStudy™ Methodology
  TOEFL Writing: From Sentence to Argument
  ---------------------------------------------------------------------------
  A C1+ TOEFL Writing subject for building accurate sentences, writing clear
  emails, developing academic discussion responses, and making strong choices
  under time pressure. Built for tutor-led writing practice, explicit strategy
  teaching, revision, and precise written communication.
  Compass active subject · contentVersion 1.0.0
  ---------------------------------------------------------------------------
  VERBA PONTES FACIUNT · SENSUS VIAM APERIT · DISCIPLINA VIVA EST
  ===========================================================================
*/

const MODULE = {
    id: `toefl-writing-sentence-to-argument`,
    schemaVersion: 2,
    contentVersion: `1.0.0`,
    title: `TOEFL Writing: From Sentence to Argument`,
    titleHtml: `TOEFL Writing: From <em>Sentence to Argument</em>`,
    navTitle: `TOEFL Writing`,
    bgImage: `https://thumbs.dreamstime.com/b/woman-hands-laptop-student-typing-education-writing-report-essay-studying-exam-university-scholarship-college-266007255.jpg`
};

const subjectCopy = {
    cover: {
        hook: `Build ideas that hold together.`
    },
    overview: {
        heading: `Give Your Ideas Direction`,
        intro: [
            `Designed for C1+ learners, this subject follows the current TOEFL iBT Writing task types: Build a Sentence, Write an Email, and Write for an Academic Discussion. You will practise making your meaning clear, choosing the right tone, developing ideas efficiently, and staying in control when time is limited.`
        ],
        question: `When you have only a short time to explain an idea, what helps you organise your thoughts?`
    },
    paths: {
        discussionTitle: `Discussion`,
        discussionDescription: `Explore practical choices that help you organise, develop and adapt your writing when time and clarity matter.`,
        culturalLensTitle: `Cultural Lens`,
        culturalLensDescription: `See how context and communication habits influence the way writers build clear, well-supported arguments.`,
        reflectionTitle: `Reflection`,
        reflectionDescription: `Step back from the practice and decide which writing choices you want to carry into your next response.`
    },
    culturalLens: {
        heading: `How Ideas Travel`,
        intro: `Explore how writers in different places, communities and situations organise ideas, show respect, give support and guide a reader. You will consider how audience, social expectations and communication habits can shape the choices you make in a timed response.`
    },
    discussion: {
        heading: `Make Your Meaning Work`,
        intro: `Explore how writers turn separate ideas into a clear response, adjust their language for different readers and purposes, and decide which details deserve space. You will also consider how planning, accuracy and time pressure shape the choices you make while writing.`
    },
    reflection: {
        title: `Carry the Argument Forward`,
        summary: `Strong writing is more than correct sentences: it gives ideas direction, suits the reader and uses limited time wisely. Reflect on how structure, tone, support and clarity can work together without making your writing feel mechanical.`,
        questions: [
            `After exploring different ways to organise and develop an argument, what tension do you notice between following a clear structure and expressing your own thinking?`,
            `What writing habit would you carry into your next timed response or real-life message, and how might it change the way you plan, write or revise?`
        ]
    },
    keyLanguage: {
        intro: `Useful language from this subject.`
    }
};

const discussionSets = [
    {
        id: `set-build-clear-response`,
        title: `Build a Clear Response`,
        stage: `First Look`,
        icon: `first-look`,
        description: `Start with familiar writing choices and practise making your meaning clear, organised, accurate and suitable for the reader.`,
        moments: [
            {
                id: `moment-one-clear-main-idea`,
                preview: `One clear main idea`,
                question: `A strong paragraph usually begins with one main idea before adding supporting details. Think of a topic you know well: what main idea would you state first, and what detail would support it?`,
                upgrade: {
                    term: `lead with`,
                    type: `phrasal verb`,
                    definition: `To put your most important idea or point first.`,
                    ordinary: `I would begin by saying that regular exercise improves people’s health, and then give a supporting example.`,
                    upgraded: `I would lead with the main idea that regular exercise improves people’s health, then explain how it helps.`,
                    priority: `key`,
                    atlasPrompt: `If you were writing an email to request a change at work, what main point would you lead with?`
                }
            },
            {
                id: `moment-linking-ideas-smoothly`,
                preview: `Linking ideas smoothly`,
                question: `Words such as however, because and for example help readers follow the connection between ideas. When have you needed to connect two different points in writing, and which linking word would fit best?`,
                upgrade: {
                    term: `draw a distinction`,
                    type: `phrase`,
                    definition: `to clearly show how two ideas, situations, or groups are different`,
                    ordinary: `It is important to show that these two arguments are not the same.`,
                    upgraded: `It is important to draw a distinction between these two arguments.`,
                    priority: `key`,
                    atlasPrompt: `When comparing two possible solutions at work or in daily life, where would you draw a distinction between them?`
                }
            },
            {
                id: `moment-choosing-right-tone`,
                preview: `Choosing the right tone`,
                question: `The same message can sound friendly, neutral or formal depending on the reader. Imagine writing to a friend and to a university staff member about the same problem: how would you change your wording?`,
                upgrade: {
                    term: `strike the right tone`,
                    type: `phrase`,
                    definition: `Use a style of language that is appropriate for the reader and situation.`,
                    ordinary: `You need to sound respectful but not too formal in this message.`,
                    upgraded: `You need to strike the right tone when asking your professor for an extension.`,
                    priority: `key`,
                    atlasPrompt: `How would you strike the right tone in a message to a colleague after a misunderstanding?`
                }
            },
            {
                id: `moment-details-earn-place`,
                preview: `Details that earn their place`,
                question: `A useful detail should explain, illustrate or support your main point rather than simply fill space. When you write about an opinion or experience, which specific example would make your meaning clearer?`,
                upgrade: {
                    term: `back up`,
                    type: `phrasal verb`,
                    definition: `to support an idea or opinion with reasons, facts, or examples`,
                    ordinary: `I used a personal example to support my opinion about working from home.`,
                    upgraded: `I used a personal example to back up my opinion about working from home.`,
                    priority: `key`,
                    atlasPrompt: `What evidence or example could you use to back up a recommendation to improve your neighbourhood?`
                }
            },
            {
                id: `moment-writing-limited-time`,
                preview: `Writing with limited time`,
                question: `Under time pressure, a quick plan can help you organise your ideas before you start writing. If you had fifteen minutes to answer a question, how would you divide your time and what would you plan first?`,
                upgrade: {
                    term: `budget your time`,
                    type: `collocation`,
                    definition: `To decide in advance how much time to spend on each part of a task.`,
                    ordinary: `I would decide how long to spend planning, writing and checking my answer.`,
                    upgraded: `I would budget my time carefully, leaving a few minutes at the end to check my answer.`,
                    priority: `key`,
                    atlasPrompt: `When you have several things to do before an important appointment, how do you budget your time?`
                }
            }
        ],
        makeItReal: {
            title: `Claim, Reason, Example`,
            prompt: `Use this quick structure: state your main point, give a reason, and add one specific example. Choose a familiar issue and write a clear three-sentence response using that structure, with one linking word and a tone suitable for a university reader.`
        }
    },
    {
        id: `set-strengthen-argument`,
        title: `Strengthen the Argument`,
        stage: `Closer Look`,
        icon: `closer-look`,
        description: `Examine the choices that make a response more convincing, precise and effective when ideas compete for limited space and time.`,
        moments: [
            {
                id: `moment-claim-with-limit`,
                preview: `A claim with a limit`,
                question: `A careful writer can make an argument stronger by showing when it is true and when it may not be. Think of an opinion you hold: what qualification could make it more accurate without making it weak?`,
                upgrade: {
                    term: `qualify`,
                    type: `verb`,
                    definition: `To add a limit or condition to a statement so it is more accurate and balanced.`,
                    ordinary: `I agree with the idea, but I would add that it is not true in every situation.`,
                    upgraded: `I would qualify that claim by saying it is mainly true when people have enough time and support.`,
                    priority: `key`,
                    atlasPrompt: `What opinion about technology, education, or work would you qualify, and what limit would you add?`
                }
            },
            {
                id: `moment-evidence-versus-explanation`,
                preview: `Evidence versus explanation`,
                question: `An example shows what happened, while explanation shows why it supports your point. If you were arguing that online classes can be effective, what example would you use and how would you explain its relevance?`,
                upgrade: {
                    term: `illustrate`,
                    type: `verb`,
                    definition: `To use an example to make an idea clearer or more convincing.`,
                    ordinary: `This example shows that students can learn effectively online.`,
                    upgraded: `This example illustrates how online classes can be effective when students receive regular feedback.`,
                    priority: `key`,
                    atlasPrompt: `What example could illustrate your opinion about working from home?`
                },
                followUp: {
                    id: `example-without-a-link`,
                    kind: `go-deeper`,
                    prompt: `Imagine your example is vivid but does not clearly prove the claim. How would you change the explanation so the connection becomes explicit?`
                }
            },
            {
                id: `moment-repairing-crowded-sentence`,
                preview: `Repairing a crowded sentence`,
                question: `When one sentence contains too many ideas, separating or reorganising them can improve accuracy and readability. Think of a complicated opinion you might express in writing: which part would you clarify or move first?`,
                upgrade: {
                    term: `break up`,
                    type: `phrasal verb`,
                    definition: `to divide something long or complicated into smaller, clearer parts`,
                    ordinary: `I would divide the sentence after the main point so the supporting ideas are easier to understand.`,
                    upgraded: `I would break up the sentence after the main point so the supporting ideas are easier to follow.`,
                    priority: `key`,
                    atlasPrompt: `How could you break up a long explanation when giving instructions to a new colleague?`
                }
            },
            {
                id: `moment-polite-disagreement-writing`,
                preview: `Polite disagreement in writing`,
                question: `In an academic discussion or email, disagreement is often clearer when you recognise another view before presenting your own. How could you disagree with a classmate’s suggestion while still sounding respectful and confident?`,
                upgrade: {
                    term: `concede`,
                    type: `verb`,
                    definition: `to admit that another person’s point is partly true before explaining why you still disagree`,
                    ordinary: `I understand that your idea could save time, but I think it may create other problems.`,
                    upgraded: `I concede that your idea could save time, but I still think it may create other problems.`,
                    priority: `key`,
                    atlasPrompt: `When might you concede part of someone’s argument before explaining your own position?`
                },
                followUp: {
                    id: `same-disagreement-different-reader`,
                    kind: `another-angle`,
                    prompt: `Rewrite the same disagreement for a classmate, a professor, and an academic discussion. What changes, and what should stay equally clear?`
                }
            },
            {
                id: `moment-correctness-and-progress`,
                preview: `Correctness and progress`,
                question: `During timed writing, stopping to fix every small error can leave too little time to develop your ideas. Which mistakes would you correct immediately, and which would you leave until the final check?`,
                upgrade: {
                    term: `let something slide`,
                    type: `phrasal verb`,
                    definition: `To decide not to correct or deal with something because it is minor or not urgent.`,
                    ordinary: `I would ignore a few small spelling mistakes if I was short of time.`,
                    upgraded: `I would let minor spelling mistakes slide until the final check if they did not affect the meaning.`,
                    priority: `key`,
                    atlasPrompt: `When might you let a small problem slide at work or in daily life rather than deal with it immediately?`
                }
            }
        ],
        makeItReal: {
            title: `Defend, Then Refine`,
            prompt: `Write a short position of three to four sentences. Add one clear qualification and briefly acknowledge an alternative view. Then let your tutor challenge one part and revise one sentence to make the argument more precise.`
        }
    },
    {
        id: `set-writing-beyond-test`,
        title: `Writing Beyond the Test`,
        stage: `Wider View`,
        icon: `wider-view`,
        description: `Consider how writing choices affect trust, access, fairness and communication beyond a timed exam.`,
        moments: [
            {
                id: `moment-clarity-builds-trust`,
                preview: `Clarity builds trust`,
                question: `A clear structure helps readers see how your ideas connect, which can make your message seem more reliable. When has unclear writing made you doubt information or misunderstand someone’s intention?`,
                upgrade: {
                    term: `open to interpretation`,
                    type: `phrase`,
                    definition: `Able to be understood in more than one way, especially because the meaning is not completely clear.`,
                    ordinary: `The manager’s message was unclear, so different employees understood it differently.`,
                    upgraded: `The manager’s message was open to interpretation, so different employees understood it differently.`,
                    priority: `key`,
                    atlasPrompt: `What kind of workplace message can be open to interpretation, and how would you make it clearer?`
                }
            },
            {
                id: `moment-one-voice-different-readers`,
                preview: `One voice, different readers`,
                question: `Good writers adjust examples, tone and detail without changing their central message. Think of an important idea you might share with a friend, a lecturer and a workplace manager: what would you change for each reader?`,
                upgrade: {
                    term: `tailor something to`,
                    type: `collocation`,
                    definition: `To change something so that it suits a particular person, purpose or situation.`,
                    ordinary: `I changed the presentation a little for the new employees.`,
                    upgraded: `I tailored the presentation to the new employees by using simpler examples and less technical language.`,
                    priority: `key`,
                    atlasPrompt: `How would you tailor a job application to a company you really want to work for?`
                }
            },
            {
                id: `moment-accuracy-and-access`,
                preview: `Accuracy and access`,
                question: `Grammar and word choice can affect whether people understand an important message, especially in applications, instructions or public information. When could a small language mistake create a serious problem, and how might you prevent it?`,
                upgrade: {
                    term: `misinterpret`,
                    type: `verb`,
                    definition: `to understand a message or situation in the wrong way`,
                    ordinary: `A small wording mistake can make readers understand an instruction incorrectly.`,
                    upgraded: `A small wording mistake can cause readers to misinterpret a safety instruction.`,
                    priority: `key`,
                    atlasPrompt: `When might someone misinterpret a short email, and how could the writer make the meaning clearer?`
                }
            },
            {
                id: `moment-persuasion-with-responsibility`,
                preview: `Persuasion with responsibility`,
                question: `Developing an argument means choosing which evidence to include, but leaving out important limits can mislead readers. When does persuasive writing become unfair or irresponsible, and what should a writer do about it?`,
                upgrade: {
                    term: `cherry-pick`,
                    type: `verb`,
                    definition: `To choose only the facts or examples that support your position while ignoring others that do not.`,
                    ordinary: `The report only included the success stories and ignored the disappointing results.`,
                    upgraded: `The report cherry-picked the success stories and left out the disappointing results.`,
                    priority: `key`,
                    atlasPrompt: `Have you ever seen a company or organisation cherry-pick information to make itself look better?`
                },
                followUp: {
                    id: `true-but-misleading`,
                    kind: `go-deeper`,
                    prompt: `Suppose the evidence is accurate but leaves out an important exception. How would you acknowledge the limit without weakening the whole argument?`
                }
            },
            {
                id: `moment-timed-writing-real-decisions`,
                preview: `Timed writing, real decisions`,
                question: `Planning quickly, prioritising ideas and checking key errors are useful beyond exams when decisions must be made under pressure. Where in everyday life could these writing habits help you, and which habit would matter most?`,
                upgrade: {
                    term: `make every word count`,
                    type: `phrase`,
                    definition: `Use each word carefully so your message is clear, focused and effective.`,
                    ordinary: `When I have little time, I try to include only the most important information.`,
                    upgraded: `When I have to write quickly, I try to make every word count by focusing on the main decision and the strongest reasons.`,
                    priority: `key`,
                    atlasPrompt: `If you had only a few minutes to explain a problem to a colleague, how could you make every word count?`
                }
            }
        ],
        makeItReal: {
            title: `The Responsible Recommendation`,
            prompt: `Use the reader–purpose–risk check: identify who needs your message, what they need to do, and what could be misunderstood. Choose an everyday situation from the discussion and write a short recommendation that is clear, appropriately toned, and honest about one important limitation.`
        }
    }
];

const clCards = [
    {
        id: `cl-polite-request-problem`,
        title: `The Polite Request Problem`,
        contextLine: `University email across cultures`,
        teaser: `A request can sound respectful in one setting but unclear in another.`,
        context: `When students email professors, the expected balance between politeness and directness can differ. In some academic settings, a student may begin with extensive respect and background before stating the request; in others, the reader expects the purpose in the first sentence, followed by a brief reason and a clear action. For TOEFL writing, the useful lesson is to make your main point easy to find while using a tone that fits the audience.`,
        followTheThread: [
            `What could happen if a writer focuses so much on sounding polite that the main purpose becomes difficult to identify?`,
            `How would you change the same message for a close classmate, a professor, and an admissions officer?`
        ],
        upgrade: {
            term: `come across as`,
            type: `phrasal verb`,
            definition: `to seem or appear to other people in a particular way, especially through your words or behaviour`,
            ordinary: `If I include too much background, the professor may think my request is unclear.`,
            upgraded: `If I include too much background, I may come across as indirect and make the professor work to find my request.`,
            priority: `key`,
            atlasPrompt: `When giving feedback to a colleague, how can you avoid coming across as rude or overly critical?`
        },
        mainQuestion: `When writing to an unfamiliar professor, how would you balance a clear request with enough politeness and explanation?`
    },
    {
        id: `cl-main-point-comes-first`,
        title: `When the Main Point Comes First`,
        contextLine: `Japanese composition and TOEFL writing`,
        teaser: `A familiar storytelling pattern can become a challenge when an exam reader expects an early argument.`,
        context: `In Japanese writing, the pattern kishōtenketsu often develops through introduction, expansion, a turn or change in direction, and conclusion; it does not always depend on direct debate. In TOEFL’s Academic Discussion task, the writer needs to make a position easy to identify, support it, and respond clearly to the discussion. This is not about one style being better—different audiences need different signals from a writer.`,
        followTheThread: [
            `How could you keep a gradual, engaging development while still making your main position clear early?`,
            `What words or phrases can help a reader see the connection between a reason, an example, and your main point?`
        ],
        upgrade: {
            term: `get straight to the point`,
            type: `phrase`,
            definition: `to say the most important idea immediately, without unnecessary introduction or delay`,
            ordinary: `In a timed response, it is usually better to state your main idea near the beginning and explain it afterward.`,
            upgraded: `In a timed response, it is usually best to get straight to the point and then develop your reasons with clear examples.`,
            priority: `key`,
            atlasPrompt: `When explaining a complicated problem to a colleague, how can you get straight to the point without leaving out important context?`
        },
        mainQuestion: `If you were used to revealing your main idea gradually, what would be hardest about stating your position in the first few sentences of a timed TOEFL response?`
    },
    {
        id: `cl-five-paragraph-box`,
        title: `Beyond the Five-Paragraph Box`,
        contextLine: `US classroom writing and TOEFL writing`,
        teaser: `A familiar structure can help you start an argument, but it can also limit how deeply you develop it.`,
        context: `In many US schools, students learn the five-paragraph essay: an introduction, three body paragraphs, and a conclusion. Current TOEFL Writing uses shorter, focused tasks rather than a traditional essay, so the transferable lesson is not the five-paragraph formula itself. The useful principle is logical progression: make the purpose or position clear, develop the strongest support, and show how each detail connects.`,
        followTheThread: [
            `If you had only two strong reasons instead of three, how could you organise your response effectively?`,
            `What kind of example or explanation makes a short response feel fully developed rather than merely complete?`
        ],
        upgrade: {
            term: `flesh out`,
            type: `phrasal verb`,
            definition: `to develop an idea by adding useful details, explanations, or examples`,
            ordinary: `A strong response needs more detail to explain why the reason matters.`,
            upgraded: `A strong response should flesh out each reason with a clear explanation or example.`,
            priority: `key`,
            atlasPrompt: `How could you flesh out a brief idea when explaining a plan to a colleague or classmate?`
        },
        mainQuestion: `When does a writing structure help you think clearly, and when might following it too strictly make your argument weaker?`
    },
    {
        id: `cl-two-sided-argument`,
        title: `The Two-Sided Argument`,
        contextLine: `French dissertation tradition and TOEFL writing`,
        teaser: `A formal debate structure can make an argument richer, but only if the writer still makes a clear decision.`,
        context: `In the French dissertation tradition, writers often examine a question through opposing positions before developing a more balanced conclusion. This can encourage careful qualification and stronger development, but a TOEFL Academic Discussion response still needs a visible main claim and efficient organisation. A useful adaptation is to present your position early, then acknowledge one important limitation or opposing view before explaining why your argument remains stronger.`,
        followTheThread: [
            `What language can you use to acknowledge an opposing view without making your own position sound uncertain?`,
            `How could you develop a balanced paragraph without losing focus or spending too many words on the other side?`
        ],
        upgrade: {
            term: `come down on the side of`,
            type: `phrase`,
            definition: `to finally decide to support one option or opinion after considering different possibilities`,
            ordinary: `After considering both options, I decided that working from home was better for me.`,
            upgraded: `After considering both options, I came down on the side of working from home.`,
            priority: `key`,
            atlasPrompt: `When choosing between two ways to spend a weekend, which option would you come down on the side of, and why?`
        },
        mainQuestion: `When you have limited time, is it better to argue one clear position or examine both sides before deciding, and why?`
    },
    {
        id: `cl-case-writer`,
        title: `Think Like a Case Writer`,
        contextLine: `Common-law legal education and academic discussion`,
        teaser: `A simple legal structure can help you turn a general opinion into a convincing explanation.`,
        context: `In many common-law legal courses, students learn IRAC: identify the Issue, explain the relevant Rule, Apply it to the situation, and state a Conclusion. A TOEFL Academic Discussion response can use a similar movement: make a claim, give a principle or reason, connect it to a specific example, and explain what the example proves. The important step is application—showing why the evidence supports your point instead of simply adding information.`,
        followTheThread: [
            `Take a simple TOEFL opinion such as “Universities should require students to study outside their major.” How would you develop it using a claim, reason, example, and explanation?`,
            `Can a fixed structure like IRAC improve clarity, or might it make your writing sound too mechanical? Explain your view.`
        ],
        upgrade: {
            term: `make the case for`,
            type: `phrase`,
            definition: `To give clear reasons and evidence to support an idea or decision.`,
            ordinary: `I explained why students should study outside their major, using a specific example.`,
            upgraded: `I made the case for studying outside your major by giving a clear reason and showing how the example supported it.`,
            priority: `key`,
            atlasPrompt: `When might you need to make the case for a change at work, at home, or in your community?`
        },
        mainQuestion: `When you write under time pressure, which part is hardest for you: stating the claim, giving a reason, using an example, or explaining the connection—and why?`
    },
    {
        id: `cl-plain-english-test`,
        title: `The Plain English Test`,
        contextLine: `UK public information and TOEFL writing`,
        teaser: `Clear writing does not have to sound simple-minded or informal.`,
        context: `The UK Plain English tradition encourages writers to use familiar words, active verbs and sentences that are easy to follow, especially when explaining public information. This does not mean removing complex ideas; it means making the logic visible to the reader. In a timed TOEFL response, this approach can help you develop a precise argument without hiding weak reasoning behind impressive vocabulary.`,
        followTheThread: [
            `Can you think of a sentence you could improve by replacing an abstract phrase with a direct verb?`,
            `When might a formal or less direct expression be more appropriate than plain English?`
        ],
        upgrade: {
            term: `spell out`,
            type: `phrasal verb`,
            definition: `to explain something clearly and in enough detail that it is easy to understand`,
            ordinary: `In my response, I should explain how this example supports my main idea.`,
            upgraded: `In my response, I should spell out how this example supports my main idea.`,
            priority: `key`,
            atlasPrompt: `When giving instructions to a new colleague, what important point would you need to spell out?`
        },
        mainQuestion: `When you write under time pressure, is it more difficult to make your ideas clear or to make your language sound sophisticated, and how could you balance both goals?`
    },
    {
        id: `cl-eight-part-argument`,
        title: `The Eight-Part Argument`,
        contextLine: `Imperial China and timed writing`,
        teaser: `A strict historical writing format shows how structure can support thinking—and also become a cage.`,
        context: `For centuries, candidates for China’s civil service examinations practised the eight-legged essay, a highly structured form that developed during the Ming and Qing periods. Its formal stages helped writers organise an argument, but success also depended on following established expectations closely. TOEFL writing is less rigid, yet the same tension remains: a clear structure can save time, while a memorised formula may prevent genuine development.`,
        followTheThread: [
            `Would you rather begin with a reliable template or build each response from the ideas you have? Why?`,
            `What is one writing habit that helps you organise quickly without making every answer sound the same?`
        ],
        upgrade: {
            term: `strike a balance`,
            type: `phrase`,
            definition: `to find a satisfactory middle point between two different needs or choices`,
            ordinary: `A good structure should help you organise ideas without making your response sound repetitive.`,
            upgraded: `A good structure should help you strike a balance between organisation and originality.`,
            priority: `key`,
            atlasPrompt: `When planning a presentation, how could you strike a balance between following a clear plan and responding naturally to your audience?`
        },
        mainQuestion: `In timed writing, when does a useful structure become too rigid, and how can a writer keep an organised response sounding thoughtful and original?`
    },
    {
        id: `cl-neutral-voice`,
        title: `The Neutral Voice`,
        contextLine: `Wikipedia’s neutral point of view`,
        teaser: `Writing fairly does not mean hiding your own conclusion.`,
        context: `Wikipedia editors use a principle called “neutral point of view”: articles should describe significant views fairly and support important claims with reliable sources. This is different from pretending that every opinion is equally strong. In a TOEFL response, you can use the same balance by acknowledging another perspective, explaining its limits, and then stating your own position clearly.`,
        followTheThread: [
            `What kind of evidence would make you trust a writer who presents two different viewpoints?`,
            `When does mentioning an opposing view strengthen an argument, and when might it waste valuable time?`
        ],
        upgrade: {
            term: `acknowledge`,
            type: `verb`,
            definition: `to recognise that something is true or important, even if you do not agree with it completely`,
            ordinary: `A strong response should mention the other side before explaining your own view.`,
            upgraded: `A strong response should acknowledge the other side before explaining its limitations and stating your own view.`,
            priority: `key`,
            atlasPrompt: `When giving advice to a friend, how could you acknowledge their concern while still recommending a different choice?`
        },
        mainQuestion: `How can you make a TOEFL argument sound fair and balanced without making your own position unclear?`
    },
    {
        id: `cl-build-groundwork`,
        title: `Build the Groundwork`,
        contextLine: `Nemawashi in Japanese organisations`,
        teaser: `A strong argument often succeeds because it prepares the reader before asking for agreement.`,
        context: `In Japan, nemawashi means informally discussing a proposal with relevant people before a formal meeting or decision. The writer or speaker can use a similar principle in a TOEFL response: introduce the issue, establish shared ground, then present a clear position with reasons and examples. This approach helps an argument feel considered rather than abrupt, even when time is limited.`,
        followTheThread: [
            `How could you use one sentence of shared ground in a timed TOEFL response without making your introduction too long?`,
            `Can acknowledging a possible objection make an argument sound stronger, or might it weaken the writer’s position?`
        ],
        upgrade: {
            term: `lay the groundwork`,
            type: `phrase`,
            definition: `To prepare people or a situation so that a later idea, decision, or action is more likely to succeed.`,
            ordinary: `I want to prepare people before I present my proposal.`,
            upgraded: `I want to lay the groundwork by explaining why the issue matters before I present my proposal.`,
            priority: `key`,
            atlasPrompt: `When introducing a difficult change at work or school, how could you lay the groundwork?`
        },
        mainQuestion: `When you need to persuade someone, is it more effective to begin with common ground or state your strongest opinion immediately? Why?`
    }
];
