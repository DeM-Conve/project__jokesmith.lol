// The curriculum, part 3: Real-time wit, Delivery, Feedback.

export const REAL_TIME_WIT = {
  skill: 'REAL_TIME_WIT',
  title: 'Real-time wit: riffing in conversation',
  tagline: "Everything people say is a setup. Most just don't notice.",
  minutes: 12,
  lineage: 'Improv listening skills, plus the same mechanics as written jokes (connector, literal reading, exaggeration, callback) applied at conversation speed.',
  drill: { to: '/banter', label: 'Banter Simulator', why: 'Timed replies to lines from a friend, a coworker or a date.' },
  cards: [
    {
      title: 'Wit is listening, then reinterpreting',
      body: "In conversation you don't write setups. Other people hand them to you constantly. Every sentence has phrases with second meanings, claims you could exaggerate and things you could take literally. Quick wit is noticing a connector in someone else's sentence.",
    },
    {
      title: 'The four fastest moves',
      body: '**Literal**: "Can you give me a hand?" "Sure, which one?" **Agree and exaggerate**: "This meeting is long." "My plants have flowered twice." **Misread on purpose**: answer the other meaning of the question. **Callback**: reuse something from five minutes ago. Practise one at a time until it\'s reflex.',
    },
    {
      title: 'Agree and exaggerate is the friendliest',
      body: "It's \"yes, and\" in real time: accept what they said and inflate it. It never makes anyone wrong, so it's perfect for quiet people who don't want to steal the spotlight. Colleague: \"It's cold in here.\" You: \"I've seen a penguin in the kitchen asking for a jumper.\"",
    },
    {
      title: 'Read the room before you riff',
      body: "Wit lands when it serves the conversation. Riff on situations and on yourself, not on someone's sore spot. If a person is genuinely upset, the funniest move is to be kind. Status matters too: teasing upward (the boss, the situation) is safer than teasing downward.",
    },
    {
      title: 'Speed comes from reps, not genius',
      body: 'A "quick" response is usually a pattern you\'ve practised. Run drills: hear a sentence, give three responses in ten seconds, pick the best. After a few weeks, the pause before your reply shrinks on its own.',
    },
  ],
  examples: [
    {
      "setup": "One time, I joked about periods, and a guy shouted, 'Excuse me. We don't want to know about this'. I replied back, 'Maybe you should know about it because",
      "punchline": "a period is how life begins.'",
      "punchWord": "begins",
      "comedian": "Aditi Mittal",
      "source": "her reply to a heckler, told in a 2017 interview about Things They Wouldn't Let Me Say",
      "sourceUrl": "https://scroll.in/magazine/844417/aditi-mittal-talks-about-the-things-they-wouldnt-let-her-say-and-then-some",
      "steps": [
        {
          "label": "What they handed her",
          "text": "A heckler: \"We don't want to know about this.\" He has named the topic for her."
        },
        {
          "label": "Move",
          "text": "Agree with his premise and flip it: he should know about it, and here is why."
        },
        {
          "label": "Connector",
          "text": "\"period\": the thing he finds gross is also the reason he is alive."
        },
        {
          "label": "Why it's safe",
          "text": "No insult, no swearing. The logic does the damage, and the room is on her side."
        },
        {
          "label": "Punch word",
          "text": "\"begins\", the last word, and then she can stop."
        }
      ]
    },
    {
      "setup": "I would say it is an honor to be here,",
      "punchline": "but that would be an alternative fact - it is not.",
      "punchWord": "not",
      "comedian": "Hasan Minhaj",
      "source": "White House Correspondents' Dinner (2017)",
      "sourceUrl": "https://www.npr.org/transcripts/528936208",
      "steps": [
        {
          "label": "What the room handed him",
          "text": "The news of the week: the White House had just defended a false claim as an \"alternative fact\"."
        },
        {
          "label": "Move",
          "text": "Take the polite opening every speaker uses (\"an honor to be here\") and run it through the phrase everyone in the room knew."
        },
        {
          "label": "Speed",
          "text": "Topical riffs have a short shelf life, so they are written and used fast."
        },
        {
          "label": "Delivery",
          "text": "He says the polite half completely straight, so the turn hits the room at full speed."
        },
        {
          "label": "Punch word",
          "text": "\"not\". A blunt, one-syllable ending."
        }
      ]
    },
    {
      "setup": "I said, \"It's serious, doctor, I've broken my arm in 20 places.\"",
      "punchline": "He said, 'Well stop going to those places.'",
      "punchWord": "places",
      "comedian": "Tommy Cooper",
      "source": "stage material",
      "sourceUrl": "https://www.chortle.co.uk/features/2021/03/16/48029/tommy_coopers_best_jokes_and_tricks",
      "steps": [
        {
          "label": "What the patient handed him",
          "text": "\"I've broken my arm in 20 places.\""
        },
        {
          "label": "Move",
          "text": "Literal reading: \"places\" as locations."
        },
        {
          "label": "Response",
          "text": "Give sensible advice for the wrong meaning: \"stop going to those places\"."
        },
        {
          "label": "Why it works",
          "text": "It sounds helpful. The best quick replies sound like a real answer."
        },
        {
          "label": "Punch word",
          "text": "\"places\", the connector itself, handed straight back."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Kenny Sebastian",
      "title": "Chai Time Comedy: making chai on stage",
      "url": "https://www.youtube.com/watch?v=NsBsDYEf4PU",
      "channel": "Kenny Sebastian",
      "indian": true,
      "notice": [
        "He makes chai live on stage, so the jokes have to work around what is actually happening.",
        "Watch for the moments where he reacts to the chai or the room, not the script."
      ]
    },
    {
      "comedian": "Dave Chappelle",
      "title": "An impossible punchline (Equanimity)",
      "url": "https://www.youtube.com/watch?v=VHkHw-NQ5Wk",
      "channel": "Netflix Is A Joke",
      "notice": [
        "Notice how relaxed he is: no rush to the punch, no matter the topic.",
        "Watch how long he keeps the audience waiting, and how the payoff still arrives."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Waiting for the perfect line.', fix: 'The moment passes in about two seconds. A decent line on time beats a great one late.' },
    { mistake: 'Making the other person wrong.', fix: 'Use agree-and-exaggerate: build on their line instead of correcting it.' },
    { mistake: 'Riffing on someone\'s real pain.', fix: 'Read the room. Target the situation, the object or yourself.' },
    { mistake: 'Explaining a riff that didn\'t land.', fix: 'Smile and move on. Riffs are cheap; there\'ll be another one in a minute.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Your friend says: "I\'m so hungry I could eat a horse." Which is an agree-and-exaggerate reply?',
      options: [
        '"You shouldn\'t eat horses."',
        '"Same. I\'ve already eaten the menu."',
        '"Let\'s get food."',
        '"That\'s a cliché."',
      ],
      answer: 1,
      explain: 'Accepts the feeling and inflates it with a specific image. The others correct or ignore.',
    },
    {
      kind: 'choice',
      prompt: '"Can you give me a hand?" "Sure, which one?" Which move is this?',
      options: ['Callback', 'Literal interpretation', 'Exaggeration', 'Rule of three'],
      answer: 1,
      explain: '"Give a hand" (help) is taken literally (a physical hand).',
    },
    {
      kind: 'word',
      prompt: 'Tap the connector, the word the riff grabs.',
      joke: { setup: 'Boss: "We need to think outside the box on this one."', punchline: 'You: "Great. I\'ll book a meeting room without walls."' },
      answer: 'box',
      explain: '"box" is the idiom being taken literally. A room without walls is outside the box.',
    },
    {
      kind: 'choice',
      prompt: 'Someone tells you their dog just died. What\'s the best "witty" response?',
      options: [
        'A literal pun about the dog.',
        'Agree and exaggerate.',
        'No riff. Be kind; humour can come later if they lead.',
        'A callback to an earlier joke.',
      ],
      answer: 2,
      explain: 'Reading the room is part of the skill. Wit serves the conversation.',
    },
  ],
  exercise: {
    prompt: 'Your coworker says: "Ugh, this meeting could have been an email." Write your reply. Try agree-and-exaggerate.',
    premise: 'Meetings that could have been an email',
    formula: 'EXAGGERATION',
    hint: 'Accept it, then inflate it: what could the meeting have been, if it was that pointless?',
    modelAnswers: [
      { setup: 'Coworker: "This meeting could have been an email."', punchline: 'You: "This meeting could have been a Post-it, and I\'d still have skimmed it."', note: 'Agrees, escalates and makes yourself the target.' },
      { setup: 'Coworker: "This meeting could have been an email."', punchline: 'You: "It could have been a long blink."', note: 'Exaggeration in four words, ending on the image.' },
    ],
  },
}

export const DELIVERY = {
  skill: 'DELIVERY',
  title: 'Delivery: landing it out loud',
  tagline: 'The same words can kill or die. The difference is timing.',
  minutes: 11,
  lineage: 'Stand-up delivery basics: the pause before the punch, stressing the punch word, commitment, act-outs, and not stepping on the laugh.',
  drill: { to: '/delivery', label: 'Delivery Lab', why: 'Record yourself, check pacing and pauses, and try again.' },
  cards: [
    {
      title: 'The pause is part of the joke',
      body: 'Right before the punch, take a beat. Half a second is enough. The pause lets the target assumption settle and tells the audience "something\'s coming". Rushing the pause is the number one beginner delivery mistake.',
    },
    {
      title: 'Hit the punch word',
      body: 'Give the punch word a little extra weight: slightly slower, slightly clearer. Then stop. Don\'t trail off, don\'t add "so yeah". The silence after the punch word is where the laugh grows.',
    },
    {
      title: 'Commit, and don\'t laugh first',
      body: 'Say it like you mean it. If you laugh or apologise ("this is probably dumb, but…"), you tell the audience not to. Deadpan suits quiet people: say the absurd thing as if it\'s a sensible fact.',
    },
    {
      title: 'Wait for the laugh, then tag',
      body: "When the laugh comes, don't talk over it. Let it peak and start to fall, then come in with your tag. If there's no laugh, keep going: confident, no apology. Nobody else knew there was supposed to be a laugh there.",
    },
    {
      title: 'Act-outs: show the voice',
      body: "If your joke quotes someone (your grandma, a sat-nav, a cat), briefly become them: their voice, posture or expression. An act-out turns a description into a scene and often adds a second laugh.",
    },
  ],
  examples: [
    {
      "setup": "A lot of people are afraid of heights.",
      "punchline": "Not me, I'm afraid of widths",
      "punchWord": "widths",
      "comedian": "Steven Wright",
      "source": "stand-up, quoted in an A.V. Club live review",
      "sourceUrl": "https://www.avclub.com/steven-wright-s-act-hasn-t-changed-much-in-30-years-an-1798269157",
      "steps": [
        {
          "label": "Setup",
          "text": "Delivered as a sincere, slightly sleepy observation. No smile."
        },
        {
          "label": "Pause",
          "text": "A beat after \"heights\" lets everyone picture a fear they know."
        },
        {
          "label": "Punch",
          "text": "\"Not me\", said almost proudly, then the made-up phobia."
        },
        {
          "label": "Deadpan",
          "text": "Wright says impossible things as if they're facts. The flatter the voice, the bigger the laugh."
        },
        {
          "label": "After",
          "text": "He doesn't wait for approval; he moves to the next line. Watch the Letterman clip below."
        }
      ]
    },
    {
      "setup": "In the middle of the street, my dad's in the middle of the road sweeping glass out of the road",
      "punchline": "like he works at like a hate crime barbershop",
      "punchWord": "barbershop",
      "comedian": "Hasan Minhaj",
      "source": "Homecoming King (Netflix, 2017)",
      "sourceUrl": "https://www.npr.org/transcripts/528936208",
      "steps": [
        {
          "label": "Setup",
          "text": "A frightening true story, told quietly."
        },
        {
          "label": "Picture",
          "text": "Dad in the road, sweeping up glass."
        },
        {
          "label": "Comparison",
          "text": "\"like he works at like a hate crime barbershop\": the \"like… like\" is real speech rhythm, not a script."
        },
        {
          "label": "Act-out",
          "text": "Next he becomes his dad: \"We got customers. We got to clean this up.\" The voice turns a description into a scene."
        },
        {
          "label": "Punch word",
          "text": "\"barbershop\", stressed, then a beat for the laugh before the act-out."
        }
      ]
    },
    {
      "setup": "I got a king-sized bed. I don't know any kings,",
      "punchline": "but if one came over, I guess he'll be comfortable.",
      "punchWord": "comfortable",
      "comedian": "Mitch Hedberg",
      "source": "stand-up, quoted in an NPR retrospective (2007)",
      "sourceUrl": "https://text.npr.org/7484154",
      "steps": [
        {
          "label": "Setup",
          "text": "\"I got a king-sized bed.\" Said like small talk."
        },
        {
          "label": "Beat",
          "text": "\"I don't know any kings,\" a tiny pause as he follows the logic."
        },
        {
          "label": "Hedge",
          "text": "\"I guess\" makes it sound considered and slightly unsure, which is Hedberg's whole persona."
        },
        {
          "label": "Stress",
          "text": "\"comfortable\", said kindly, as if he's a thoughtful host."
        },
        {
          "label": "After",
          "text": "No wink. Hedberg barely sold his lines, which made the audience lean in."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Steven Wright",
      "title": "Stand-up debut on Late Night (1982)",
      "url": "https://www.youtube.com/watch?v=mMNvJKQ54Jo",
      "channel": "Letterman",
      "notice": [
        "Deadpan: absurd lines said like facts, with almost no expression.",
        "Notice the pauses: he waits for the laugh, then moves on without a smile."
      ]
    },
    {
      "comedian": "Russell Peters",
      "title": "Somebody gonna get hurt real bad (Just For Laughs, 2000)",
      "url": "https://www.youtube.com/watch?v=Adz4l5qEpD4",
      "channel": "Just For Laughs",
      "indian": true,
      "lines": [
        {
          "text": "\"Somebody gonna get hurt real bad\""
        }
      ],
      "notice": [
        "The act-out: he becomes his dad, voice and posture included.",
        "Listen for how he keeps returning to one word, \"somebody\".",
        "Watch the timing of each tag after the laugh."
      ]
    },
    {
      "comedian": "Nate Bargatze",
      "title": "How to order artisanal coffee (The Tennessee Kid)",
      "url": "https://www.youtube.com/watch?v=MOm7Gr-1BUc",
      "channel": "Netflix Is A Joke",
      "notice": [
        "A slow, unbothered pace: he never rushes a punch.",
        "Notice how he plays confused, so the audience gets there a beat before him."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Rushing the punch because you\'re nervous.', fix: 'Breathe before the punch line, every time. The pause feels long to you and normal to them.' },
    { mistake: 'Apologising before or after the joke.', fix: 'Commit. If it doesn\'t land, move on confidently.' },
    { mistake: 'Laughing at your own joke.', fix: 'Deadpan is easier and funnier. Let them laugh first.' },
    { mistake: 'Talking over the laugh.', fix: 'Wait for it to peak, then bring your tag in on the way down.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Where is the most important pause?',
      options: ['At the very start', 'Right before the punch', 'In the middle of the punch word', 'After every word'],
      answer: 1,
      explain: 'A beat before the punch lets the assumption settle and signals that something\'s coming.',
    },
    {
      kind: 'choice',
      prompt: 'Your joke got silence. What do you do?',
      options: [
        'Explain it.',
        'Say "tough crowd".',
        'Carry on to the next line with confidence.',
        'Repeat it louder.',
      ],
      answer: 2,
      explain: 'Only you knew a laugh was expected. Confidence keeps the room with you.',
    },
    {
      kind: 'word',
      prompt: 'Which word should get the extra stress when you say this out loud?',
      joke: { setup: "Tim Vine: I've just been on a once-in-a-lifetime holiday.", punchline: "I'll tell you what, never again." },
      answer: 'again',
      explain: 'The punch word gets the weight, then you stop.',
    },
    {
      kind: 'choice',
      prompt: 'What is an act-out?',
      options: [
        'Leaving the stage',
        'Briefly performing a character\'s voice or action instead of describing it',
        'Acting angry',
        'A joke about acting',
      ],
      answer: 1,
      explain: 'Show, don\'t tell: the audience sees the scene, which often adds a second laugh.',
    },
  ],
  exercise: {
    prompt: 'Write a joke with a quoted line you can act out, like a parent, a sign, a device or a pet. Mark the pause with [pause]. Then say it out loud three times, changing only the pause length.',
    premise: 'Something a device says to you',
    formula: null,
    hint: 'Sat-nav, smart speaker, self-checkout, washing machine beeps… What does it say, and how would you answer it?',
    modelAnswers: [
      { setup: 'The self-checkout keeps shouting "unexpected item in bagging area." [pause]', punchline: 'Mate, at these prices every item is unexpected.', note: 'The machine\'s voice is the act-out. Answer it like a tired person.' },
    ],
  },
}

export const FEEDBACK = {
  skill: 'FEEDBACK',
  title: 'Feedback: the writer\'s discipline',
  tagline: 'Funny is a numbers game. Write a lot, test a lot, keep the best.',
  minutes: 10,
  lineage: "Gene Perret's practice discipline (daily joke quotas, rewriting, a joke file), plus workshop and open-mic testing habits.",
  drill: { to: '/arena', label: 'Joke Arena', why: 'Put jokes head-to-head and let real votes tell you which works.' },
  cards: [
    {
      title: 'Quantity makes quality',
      body: "Gene Perret, who wrote for Bob Hope and taught generations of writers, preached volume: write jokes every day, many of them, because most will be average. If you write ten, one or two are good. If you write one, you're betting everything on it.",
    },
    {
      title: 'Separate writing from judging',
      body: 'Write first, judge later. If you criticise every line as you write it, you\'ll write nothing. Set a timer, write ten versions without stopping, then switch hats and pick the best.',
    },
    {
      title: 'The audience is the only judge that counts',
      body: "You can't fully judge your own jokes: you already know the punch, so it can't surprise you. Test on friends, open mics, the Arena. A laugh is the data. When a joke fails, ask: was it not clear, or not surprising? Those need different fixes.",
    },
    {
      title: 'Ask better questions',
      body: '"Was that funny?" gets polite lies. Ask "What did you think was going to happen?" (did the assumption form?) and "Which bit did you laugh at?" (where\'s the real punch?). Specific questions get usable answers.',
    },
    {
      title: 'Keep a joke file, and rewrite',
      body: 'Every line you write goes somewhere you can find it again (that\'s the Bit Notebook). Old failed jokes often become good when you rewrite the setup, move the punch word, or attach them to a new premise. Nothing is wasted.',
    },
  ],
  examples: [
    {
      "setup": "Well, OK, my answering machine - I'm so boring, my answering machine doesn't even pick up. No, that's not good enough.",
      "punchline": "OK, let's do answering machine - all right, how about - I'm so boring, my answering machine put me on hold.",
      "punchWord": "hold",
      "comedian": "Joan Rivers",
      "source": "her writing sessions with Rodney Dangerfield, described on NPR Fresh Air",
      "sourceUrl": "https://text.npr.org/345945166",
      "steps": [
        {
          "label": "Topic first",
          "text": "They picked a topic (\"answering machines\") and just started saying lines out loud."
        },
        {
          "label": "Draft 1",
          "text": "\"doesn't even pick up\": a fine idea, but the machine just sits there."
        },
        {
          "label": "Judge",
          "text": "\"No, that's not good enough.\" Write first, judge second, and be honest."
        },
        {
          "label": "Draft 2",
          "text": "\"put me on hold\": now the machine acts, rudely, which is a picture."
        },
        {
          "label": "Lesson",
          "text": "Same premise, better punch. Rivers said you bounce lines off each other until you find the one."
        }
      ]
    },
    {
      "setup": "When they invented the Pop-Tart, the back of my head blew right off.",
      "punchline": "And they can't go stale 'cause they weren't ever fresh.",
      "punchWord": "fresh",
      "comedian": "Jerry Seinfeld",
      "source": "Jerry Seinfeld: 23 Hours to Kill (Netflix, 2020), played on NPR in 2024",
      "sourceUrl": "https://www.npr.org/2024/05/02/1248634090/unfrosted-jerry-seinfelds-movie-about-the-fictional-history-of-pop-tarts",
      "steps": [
        {
          "label": "The bit",
          "text": "A long-running Pop-Tart bit. The New York Times filmed him working on it years earlier (see the clip below)."
        },
        {
          "label": "Audience as editor",
          "text": "Seinfeld told NPR his jokes \"have been picked by 25 audiences before you got there\"."
        },
        {
          "label": "The rule",
          "text": "\"They might not be the ones you like, but you do not disagree with them.\""
        },
        {
          "label": "The tag",
          "text": "\"they weren't ever fresh\": a tag that tops the first line by flipping \"stale\"."
        },
        {
          "label": "Lesson",
          "text": "Even a famous comedian treats the crowd as the judge."
        }
      ]
    },
    {
      "setup": "When I started in show business, I played one club that was so far out",
      "punchline": "my act was reviewed in Field and Stream",
      "punchWord": "Stream",
      "comedian": "Rodney Dangerfield",
      "source": "stage material and his own account, AP obituary (2004)",
      "sourceUrl": "https://www2.ljworld.com/news/2004/oct/06/comedian_rodney_dangerfield/",
      "steps": [
        {
          "label": "Test it live",
          "text": "Dangerfield tried his new framing, \"I get no respect\", at a New York club."
        },
        {
          "label": "Data",
          "text": "Per his obituary, the joke drew a bigger response than ever, so he kept the phrase."
        },
        {
          "label": "Keep a file",
          "text": "He built a career of short jokes on one attitude, and the strongest ones survived."
        },
        {
          "label": "This joke",
          "text": "\"so far out\" means remote, and Field and Stream reviews the outdoors, not comedy."
        },
        {
          "label": "Lesson",
          "text": "You don't decide what works. The room does, and you keep score."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Jerry Seinfeld",
      "title": "How to write a joke (The New York Times, 2012)",
      "url": "https://www.youtube.com/watch?v=itWxXyCfW5s",
      "channel": "The New York Times",
      "notice": [
        "He takes apart a joke that is still a work in progress, the Pop-Tart bit.",
        "Watch the longhand rewriting: a joke is drafted and redrafted, not written once."
      ]
    },
    {
      "comedian": "Chris Rock",
      "title": "His process for writing new material (60 Minutes, 2005)",
      "url": "https://www.youtube.com/watch?v=rZL3PUInrCw",
      "channel": "60 Minutes",
      "notice": [
        "Rock describes how he writes new material.",
        "Listen for \"there is a rhythm to comedy\": the feedback is about timing as well as words."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Writing one version and polishing it forever.', fix: 'Write ten rough versions, then polish the best one.' },
    { mistake: 'Asking "Was that funny?"', fix: 'Ask "What did you expect to happen?" and "Where did you laugh?"' },
    { mistake: 'Treating silence as "I\'m not funny".', fix: 'Silence is data about one joke, not about you. Diagnose: clarity or surprise?' },
    { mistake: 'Deleting failed jokes.', fix: 'Keep everything in your notebook. Rewrites rescue more jokes than new ideas do.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'A joke got confused looks, not groans. What\'s most likely wrong?',
      options: [
        'It\'s not surprising enough.',
        'It\'s not clear: the audience didn\'t form the assumption or catch the connector.',
        'It\'s too short.',
        'You\'re not funny.',
      ],
      answer: 1,
      explain: 'Confusion is a clarity problem. Fix the setup so the assumption and connector are obvious.',
    },
    {
      kind: 'choice',
      prompt: 'Why can\'t you judge your own jokes reliably?',
      options: [
        'Because you\'re biased against yourself.',
        'Because you already know the punch, so it can\'t surprise you.',
        'Because jokes are subjective.',
        'You can, easily.',
      ],
      answer: 1,
      explain: 'Surprise is the engine of the laugh, and you\'ve spoiled it for yourself. Test on others.',
    },
    {
      kind: 'choice',
      prompt: 'Gene Perret\'s core practice advice is…',
      options: [
        'Wait for inspiration.',
        'Write a lot, every day, and rewrite.',
        'Only write when you feel funny.',
        'Copy famous comedians.',
      ],
      answer: 1,
      explain: 'Volume and routine. Funny is a trained output, not a mood.',
    },
    {
      kind: 'choice',
      prompt: 'Which feedback question gives the most useful answer?',
      options: [
        '"Was that funny?"',
        '"Did you like it?"',
        '"What did you think was going to happen?"',
        '"Be honest, am I funny?"',
      ],
      answer: 2,
      explain: 'It tells you whether the target assumption formed, the first thing to check.',
    },
  ],
  exercise: {
    prompt: 'Quota rep: write the BEST of five punchlines for this setup. Write all five somewhere (or in your head), then submit only your favourite.\nSetup: "My doctor told me to get more exercise."',
    premise: 'Your doctor\'s advice',
    formula: null,
    hint: 'Push past the first three. Try a literal reading, an exaggeration and a specific place.',
    modelAnswers: [
      { setup: 'My doctor told me to get more exercise.', punchline: 'So I\'ve started taking the long way to the fridge.', note: 'Literal-ish compliance with a tiny, specific detail.' },
      { setup: 'My doctor said I need to get out more.', punchline: "So I've started sleeping in the garden.", note: 'A literal reading with a gentle, sad image.' },
    ],
  },
}
