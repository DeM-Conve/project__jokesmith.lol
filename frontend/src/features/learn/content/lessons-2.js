// The curriculum, part 2: Formulas, Economy, Heightening.

export const FORMULAS = {
  skill: 'FORMULAS',
  title: 'The formula toolbox',
  tagline: "You don't wait for inspiration. You pick a tool and use it.",
  minutes: 15,
  lineage: "Joe Toplyn's punchline formulas, the classic rule of three, and the stand-up staples: exaggeration, comparison, literal interpretation, wordplay, reversal and mash-up.",
  drill: { to: '/gym', label: 'Formula Gym', why: 'One formula per drill, on random premises, with a checklist after every rep.' },
  cards: [
    {
      title: 'Formulas are training wheels you never fully take off',
      body: 'Professional writers rarely say "I used the rule of three here", but if you X-ray their jokes, the patterns are there. Learning them explicitly gives you a way to start when your mind is blank, which for a beginner is most of the time.',
    },
    {
      title: 'Rule of three: two set a pattern, the third breaks it',
      body: '"A good team needs trust, communication and someone to blame." Make the first two items boringly correct and grammatically parallel, then make the third the same shape from a different world.',
    },
    {
      title: 'Exaggeration: inflate the consequence, not the adjective',
      body: '"My commute is SO long" is a complaint. "My commute is so long I\'ve started getting post on the train" is a joke. Push a true feeling to a specific, picturable impossibility.',
    },
    {
      title: 'Comparison: two far worlds, one shared detail',
      body: '"My smart speaker is like a teenager. It only listens when I\'m saying something private." The further apart the worlds, the bigger the jolt, but the shared detail must be instant.',
    },
    {
      title: 'Literal interpretation and wordplay: words have two jobs',
      body: '**Literal**: take an idiom at its word ("My boss told me to go the extra mile. I\'m emailing you from the motorway."). **Wordplay**: one word, two meanings, setup uses one, punch cashes the other ("got a standing ovation. Everyone stood up to leave.").',
    },
    {
      title: 'Reversal and mash-up: flip it or move it',
      body: '**Reversal** flips the normal direction: the teacher Googles, the cat recruits the mice. **Mash-up** runs one world by another\'s rules: "If a budget airline ran a hospital: surgery is free, anaesthetic is fifteen euros."',
    },
  ],
  examples: [
    {
      "setup": "The bird, the bee,",
      "punchline": "the running child are all the same to the sliding glass door.",
      "punchWord": "door",
      "comedian": "Demetri Martin",
      "source": "This Is a Book (2011)",
      "sourceUrl": "https://text.npr.org/135989582",
      "steps": [
        {
          "label": "Formula",
          "text": "Rule of three."
        },
        {
          "label": "Items 1 and 2",
          "text": "\"The bird, the bee\": a nature pair everyone knows, so the pattern is \"things that fly\"."
        },
        {
          "label": "Item 3",
          "text": "\"the running child\": the same shape, from a completely different category."
        },
        {
          "label": "The reveal",
          "text": "What they really share: all three crash into glass doors."
        },
        {
          "label": "Punch word",
          "text": "\"door\", pushed to the very end."
        }
      ]
    },
    {
      "setup": "I was so ugly",
      "punchline": "my own Ouija board told me to go to hell.",
      "punchWord": "hell",
      "comedian": "Phyllis Diller",
      "source": "stage material, quoted in her NPR obituary (2012)",
      "sourceUrl": "https://text.npr.org/154540372",
      "steps": [
        {
          "label": "Formula",
          "text": "Exaggeration."
        },
        {
          "label": "True feeling",
          "text": "\"I was so ugly\": an old-school self-roast."
        },
        {
          "label": "Inflate the consequence",
          "text": "Not \"very ugly\" but a consequence: even the spirit world insults her."
        },
        {
          "label": "Specific",
          "text": "\"my own Ouija board\" is a picture, and it speaks."
        },
        {
          "label": "Punch word",
          "text": "\"hell\" is last, and it's a double hit: an insult and a destination."
        }
      ]
    },
    {
      "setup": "I think love is like central heating.",
      "punchline": "You turn it on before guests arrive and pretend it's like this all the time.",
      "punchWord": "time",
      "comedian": "Laura Lexx",
      "source": "Dave Funniest Joke of the Fringe, top 10 2018",
      "sourceUrl": "https://www.chortle.co.uk/news/2018/08/19/40950/adam_rowe_wins_daves_joke_of_the_fringe",
      "steps": [
        {
          "label": "Formula",
          "text": "Comparison."
        },
        {
          "label": "World 1",
          "text": "Love."
        },
        {
          "label": "World 2",
          "text": "Central heating."
        },
        {
          "label": "Shared detail",
          "text": "Both get switched on when guests come round, to look warmer than usual."
        },
        {
          "label": "Punch word",
          "text": "\"time\". The comparison is the setup; the shared detail is the joke."
        }
      ]
    },
    {
      "setup": "Cloquet hated reality but realized",
      "punchline": "it was still the only place to get a good steak.",
      "punchWord": "steak",
      "comedian": "Woody Allen",
      "source": "short story \"The Condemned\", The New Yorker (1977)",
      "sourceUrl": "https://quoteinvestigator.com/2015/10/18/steak/",
      "steps": [
        {
          "label": "Formula",
          "text": "Mash-up."
        },
        {
          "label": "World 1",
          "text": "Philosophy: hating reality, existential despair."
        },
        {
          "label": "World 2",
          "text": "A restaurant review."
        },
        {
          "label": "The line",
          "text": "Reality gets judged by restaurant rules, and gets a grudging recommendation."
        },
        {
          "label": "Punch word",
          "text": "\"steak\", the biggest possible drop in seriousness from \"reality\"."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Milton Jones",
      "title": "A masterclass of one-liners",
      "url": "https://www.youtube.com/watch?v=zfHM3IKJGgc",
      "channel": "Live at the Apollo (BBC)",
      "notice": [
        "Ten jokes in four minutes. Name the formula of each one as it lands.",
        "Most are literal readings or wordplay. Spot the connector before the punch."
      ]
    },
    {
      "comedian": "Stewart Francis",
      "title": "The one-liner king",
      "url": "https://www.youtube.com/watch?v=viwgYGqN-xQ",
      "channel": "Live at the Apollo (BBC)",
      "notice": [
        "Puns delivered with a straight face; listen for the beat before each pun word.",
        "Count how many setups are a single sentence."
      ]
    },
    {
      "comedian": "Rahul Subramanian",
      "title": "North Indians vs South Indians (Kal Main Udega)",
      "url": "https://www.youtube.com/watch?v=vWFq2T5j390",
      "channel": "Rahul Subramanian",
      "indian": true,
      "notice": [
        "A comparison bit: two worlds, with one detail at a time held side by side.",
        "Notice which details he picks: the ones both halves of the audience recognise."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Rule of three where all three items are jokes.', fix: 'Items one and two must be normal. They\'re the pattern. Only the third breaks it.' },
    { mistake: 'Comparisons to things nobody knows.', fix: 'World two must be instantly familiar to your audience.' },
    { mistake: 'Puns that announce themselves.', fix: 'Hide the double-meaning word until the end; let the setup firmly establish meaning one.' },
    { mistake: 'Using the formula as the joke ("X is like Y").', fix: 'The comparison is the setup. The shared detail is the punch.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Joan Rivers: "I\'m so boring, my answering machine put me on hold." Which formula?',
      options: ['Rule of three', 'Exaggeration', 'Reversal', 'Wordplay'],
      answer: 1,
      explain: 'A true feeling (being dull company) inflated to an impossible, specific consequence.',
    },
    {
      kind: 'choice',
      prompt: '"My doctor told me to cut down on snacks. So now I cut them into smaller pieces." Which formula?',
      options: ['Comparison', 'Mash-up', 'Literal interpretation', 'Attitude'],
      answer: 2,
      explain: '"Cut down" (reduce) is taken word for word (with a knife).',
    },
    {
      kind: 'word',
      prompt: 'Tap the punch word.',
      joke: { setup: 'Airport security asked me to remove', punchline: 'my belt, my shoes and my last shred of dignity.' },
      answer: 'dignity',
      explain: 'Items one and two are clothes. "dignity" breaks the pattern, and it\'s last.',
    },
    {
      kind: 'choice',
      prompt: 'In a rule-of-three joke, where should the surprising item go?',
      options: ['First', 'Second', 'Third', 'Anywhere'],
      answer: 2,
      explain: 'You need two items to create a pattern before you can break it.',
    },
    {
      kind: 'choice',
      prompt: '"Leaving the family group chat is like leaving a cult." What does the punch need to do?',
      options: [
        'Say "it really is like a cult".',
        'Prove it with one specific detail true of both, e.g. "they keep sending you leaflets".',
        'Change topic.',
        'Explain what a cult is.',
      ],
      answer: 1,
      explain: 'The comparison is the setup. The shared detail is the joke.',
    },
  ],
  exercise: {
    prompt: 'Write a rule-of-three joke: two normal items, then one that breaks the pattern. End on the odd item.',
    premise: 'Your morning routine',
    formula: 'RULE_OF_THREE',
    hint: 'My morning routine: [normal], [normal] and [surprising but true].',
    modelAnswers: [
      { setup: 'My morning routine is simple:', punchline: 'coffee, a shower and ten minutes staring at my socks.', note: 'Two normal tasks, then an oddly specific, relatable one.' },
      { setup: "This year's resolutions:", punchline: 'drink more water, read more books, lie less about the first two.', note: 'The third item turns the list on itself.' },
    ],
  },
}

export const ECONOMY = {
  skill: 'ECONOMY',
  title: 'Economy: cut to the bone',
  tagline: 'Every word before the punch is a tax on the laugh.',
  minutes: 10,
  lineage: 'Classic joke-editing practice taught by Joe Toplyn and Gene Perret: the punch word goes last, the setup is as short as it can be, and specifics beat adjectives.',
  drill: { to: '/punchup', label: 'Punch-Up Coach', why: 'Take your drafts and tighten them line by line.' },
  cards: [
    {
      title: 'Shorter is funnier (almost always)',
      body: "A joke is a bet: \"listen to this and you'll be rewarded\". The longer the setup, the bigger the reward needs to be. Cut until the joke breaks, then put back the one word that fixes it.",
    },
    {
      title: 'Rule 1: the punch word goes last',
      body: '"Christmas and Easter, mostly" leaks. "Mostly Christmas and Easter" lands. Rearrange the sentence so the surprise is the final sound. If there\'s a tail ("…, though", "…, you know?"), cut it.',
    },
    {
      title: 'Rule 2: cut words that don\'t build the assumption',
      body: 'Names, dates, adjectives and "so basically" all go unless they help the audience assume the wrong thing. Ask of every word: does the punch need this? If not, cut it.',
    },
    {
      title: 'Rule 3: specific nouns beat adjectives',
      body: '"A really old, slow phone" is three words of description. "A phone whose updates come by post" is one picture. Specific nouns (brands, places, numbers, objects) are compressed information.',
    },
    {
      title: 'Rule 4: no explaining',
      body: 'If you hear yourself adding "…because, you know, she never takes them out" after the punch, the setup didn\'t do its job. Fix the setup; never explain the punch.',
    },
  ],
  examples: [
    {
      "setup": "I saw a documentary on how ships are kept together.",
      "punchline": "Riveting.",
      "punchWord": "Riveting",
      "comedian": "Stewart Francis",
      "source": "Dave Funniest Joke of the Fringe, top 10 2012",
      "sourceUrl": "https://www.chortle.co.uk/news/2012/08/20/15987/stewart_francis_has_joke_of_the_fringe",
      "steps": [
        {
          "label": "Count",
          "text": "Twelve words in total, and the punchline is one word."
        },
        {
          "label": "Setup job",
          "text": "\"how ships are kept together\" plants rivets without saying the word."
        },
        {
          "label": "Cut test",
          "text": "Try removing \"documentary\": you lose the meaning \"gripping\". Every word is load-bearing."
        },
        {
          "label": "A flabby version (ours)",
          "text": "\"I watched this documentary about shipbuilding and honestly it was really riveting, if you know what I mean.\" The explanation kills it."
        },
        {
          "label": "Punch word",
          "text": "\"Riveting\", alone, last."
        }
      ]
    },
    {
      "setup": "I'm not a fan of the new pound coin, but then again,",
      "punchline": "I hate all change.",
      "punchWord": "change",
      "comedian": "Ken Cheng",
      "source": "Dave Funniest Joke of the Fringe, winner 2017",
      "sourceUrl": "https://www.independent.co.uk/arts-entertainment/comedy/news/edinburgh-fringe-festival-2017-best-jokes-comedy-ken-cheng-frankie-boyle-tim-vine-pound-coin-trump-a7905136.html",
      "steps": [
        {
          "label": "Count",
          "text": "17 words."
        },
        {
          "label": "Setup job",
          "text": "\"pound coin\" loads the money meaning of \"change\"."
        },
        {
          "label": "The hinge",
          "text": "\"but then again,\" sounds like he's widening the point, which hides the pun."
        },
        {
          "label": "Reorder test",
          "text": "\"I hate all change, like the new pound coin\" puts the reveal in the middle and wastes it."
        },
        {
          "label": "Punch word",
          "text": "\"change\", the final sound."
        }
      ]
    },
    {
      "setup": "I've decided to sell my Hoover…",
      "punchline": "well, it was just collecting dust.",
      "punchWord": "dust",
      "comedian": "Tim Vine",
      "source": "Dave Funniest Joke of the Fringe, winner 2014",
      "sourceUrl": "https://www.theguardian.com/stage/2014/aug/19/10-funniest-jokes-edinburgh-festival-fringe-2014",
      "steps": [
        {
          "label": "Count",
          "text": "14 words."
        },
        {
          "label": "Setup job",
          "text": "\"sell my Hoover\" names the object, nothing else."
        },
        {
          "label": "Specific noun",
          "text": "\"Hoover\", not \"vacuum cleaner\": shorter and more British."
        },
        {
          "label": "Idiom does the work",
          "text": "\"collecting dust\" is the everyday reason to sell anything, so nobody sees the pun coming."
        },
        {
          "label": "Punch word",
          "text": "\"dust\" is last. No \"honestly\", no \"you know?\"."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Gary Delaney",
      "title": "Five one-liners in fifty seconds",
      "url": "https://www.youtube.com/watch?v=BoWV1Ql86QU",
      "channel": "Gary Delaney",
      "notice": [
        "Ten seconds per joke, setup included. Nothing is wasted.",
        "Try writing out one of the jokes and cutting a word. You can't."
      ]
    },
    {
      "comedian": "Steven Wright",
      "title": "Room temperature is always room temperature (Letterman, 2009)",
      "url": "https://www.youtube.com/watch?v=ADIBba82yNM",
      "channel": "Letterman",
      "notice": [
        "Short sentences, no filler, no \"so anyway\".",
        "Each joke ends the moment the image is complete."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Throat-clearing openers ("So, the thing is…").', fix: 'Start on the topic noun. Momentum is free; don\'t waste it.' },
    { mistake: 'Ending on a tag word ("…, right?", "…, though").', fix: 'End on the punch word and let the silence ask "right?" for you.' },
    { mistake: 'Over-describing ("a really big, old, slightly broken car").', fix: 'One specific noun or detail beats three adjectives.' },
    { mistake: 'Cutting the words that build the assumption.', fix: 'Economy isn\'t minimum words; it\'s no unnecessary ones. Keep what makes them assume.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Which version lands best?',
      options: [
        'I\'ve been going to the gym religiously, mostly at Christmas and Easter, I guess.',
        'I\'ve been going to the gym religiously. Christmas and Easter.',
        'Religiously, I\'ve been going to the gym, which means Christmas and Easter basically.',
        'I go to the gym at Christmas and Easter, so, religiously.',
      ],
      answer: 1,
      explain: 'The assumption builds, the punch is tight, and it ends on the reveal.',
    },
    {
      kind: 'word',
      prompt: 'Groucho Marx left a tail on purpose. Tap the real punch word.',
      joke: { setup: 'One morning, I shot an elephant in my pajamas.', punchline: "How he got in my pajamas, I don't know." },
      answer: 'pajamas',
      explain: '"pajamas" is where the picture flips. "I don\'t know" is a shrug Groucho chose to add for his character. In your own jokes, cut the tail unless you can say why it earns its place.',
    },
    {
      kind: 'choice',
      prompt: '"My phone is really really old and slow." What\'s the best economy fix?',
      options: [
        'Add more adjectives: "really really old and slow and bad".',
        'Swap the adjectives for one specific picture of how old it is.',
        'Remove "my".',
        'Say it louder.',
      ],
      answer: 1,
      explain: 'A specific image compresses the description and adds the surprise.',
    },
    {
      kind: 'choice',
      prompt: 'When you feel the urge to explain a punchline, what should you do?',
      options: ['Explain it quickly.', 'Add "get it?".', 'Fix the setup so the assumption is clear.', 'Repeat the punch.'],
      answer: 2,
      explain: 'An explanation means the setup didn\'t build the assumption. Fix it there.',
    },
  ],
  exercise: {
    prompt: 'Rewrite this flabby joke as tightly as you can. Keep the idea and end on the punch word:\n"So basically my bank called me the other day because apparently there was some unusual activity on my account, and it turned out that what had happened was someone had put money into it, which never happens, lol."',
    premise: 'Your bank account',
    formula: 'MISDIRECTION',
    hint: 'Under 15 words is possible. What\'s the one word the whole joke is about?',
    modelAnswers: [
      { setup: 'My bank called about unusual activity on my account.', punchline: 'Apparently someone made a deposit.', note: '13 words. The punch word "deposit" lands last.' },
    ],
  },
}

export const HEIGHTENING = {
  skill: 'HEIGHTENING',
  title: 'Heightening: tags, escalation and "yes, and"',
  tagline: 'One laugh is a joke. Four laughs on the same idea is a bit.',
  minutes: 12,
  lineage: 'Improv\'s "yes, and" and heightening (Upright Citizens Brigade tradition), stand-up tags and runs, and callbacks.',
  drill: { to: '/riff', label: 'Daily Riff', why: 'One setup, as many punches as you can: the purest heightening rep.' },
  cards: [
    {
      title: "Don't leave a laugh alone",
      body: 'When a joke lands, the audience is primed and in the world you built. A **tag** is an extra punchline on the same setup, with no new setup needed. Pros often get three or four laughs from one premise this way. It\'s the cheapest laugh in comedy.',
    },
    {
      title: '"Yes, and": accept, then add',
      body: 'Improv\'s core rule: accept the reality offered (yes) and add something to it (and). In writing: once you\'ve established "my cat is a landlord", don\'t drop it. What else would cat-landlord do? Inspections? A deposit? Each answer is a tag.',
    },
    {
      title: 'Heighten: each beat a step further',
      body: 'Tags should escalate. If beat one is "rent is due at 5am", beat two might be "the deposit is one sock", and beat three "she\'s evicting me for a cardboard box". Same logic, bigger stakes. If a tag is smaller than the one before, cut it or move it earlier.',
    },
    {
      title: 'Runs: rule of three at bit scale',
      body: 'A run is a sequence of tags with a shared pattern. Like the rule of three, the audience catches the pattern by beat two, so beat three can break or top it. End a run on your strongest beat, then stop.',
    },
    {
      title: 'Callbacks: the reward for paying attention',
      body: 'A **callback** brings back an earlier joke in a new context. The audience feels clever for remembering, and the old line gains a new target. Plant early, pay off later. The bigger the gap between them, the bigger the reward.',
    },
  ],
  examples: [
    {
      "setup": "Hook up a Jamaican with an Italian. They can have little \"pasta-farians\". I'm Indian, I can hook up with a Jewish girl; we could have little \"hin-jews\".",
      "punchline": "Get a woman from the Philippines, a guy from Holland, you get little \"holla-pinos\". Guy from Cuba, woman from Iceland – little \"ice cubes\".",
      "punchWord": "cubes",
      "comedian": "Russell Peters",
      "source": "stand-up, on mixing ethnicities",
      "sourceUrl": "https://www.timeout.com/singapore/comedy/all-time-classics-from-russell-peters",
      "steps": [
        {
          "label": "Base joke",
          "text": "\"pasta-farians\": two nationalities make a funny word."
        },
        {
          "label": "Yes, and",
          "text": "Accept the game. Which other couples make words?"
        },
        {
          "label": "Tag 1",
          "text": "\"hin-jews\": he puts himself in the joke, which raises the stakes."
        },
        {
          "label": "Tag 2",
          "text": "\"holla-pinos\": the audience now knows the pattern and is playing along."
        },
        {
          "label": "Top",
          "text": "\"ice cubes\": the shortest, most everyday word. Once the pattern is set, the run needs less setup each time."
        }
      ]
    },
    {
      "setup": "\"Somebody gonna get hurt real bad\" – that was my dad's threat, right before he beat me.",
      "punchline": "Every single time. I hated that threat, 'cause he'd always say \"somebody\". He'd never tell you it was you! I mean, you knew it was you, but he'd give you this hope!",
      "punchWord": "hope",
      "comedian": "Russell Peters",
      "source": "stand-up, the \"Somebody gonna get hurt real bad\" bit (Just For Laughs, 2000)",
      "sourceUrl": "https://www.timeout.com/singapore/comedy/all-time-classics-from-russell-peters",
      "steps": [
        {
          "label": "Base",
          "text": "The quoted threat, in Dad's voice: funny on its own."
        },
        {
          "label": "Heighten",
          "text": "\"Every single time\": it's a ritual, not a one-off."
        },
        {
          "label": "Tag 1",
          "text": "He picks at the wording: \"somebody\", never \"you\"."
        },
        {
          "label": "Tag 2 (top)",
          "text": "\"he'd give you this hope!\" Same logic, bigger: the vague word becomes a cruel kindness."
        },
        {
          "label": "Stop",
          "text": "He ends on the biggest beat. A catchphrase like this can also come back later in a set as a callback."
        }
      ]
    },
    {
      "setup": "I had this joke: 'I played hide and seek;",
      "punchline": "they wouldn't even look for me.'",
      "punchWord": "me",
      "comedian": "Rodney Dangerfield",
      "source": "his account of building \"I get no respect\", quoted in his AP obituary (2004)",
      "sourceUrl": "https://www2.ljworld.com/news/2004/oct/06/comedian_rodney_dangerfield/",
      "steps": [
        {
          "label": "Base joke",
          "text": "A sad childhood one-liner that worked on its own."
        },
        {
          "label": "Find the frame",
          "text": "He looked for something to put in front of it: \"I was so poor, I was so dumb…\"."
        },
        {
          "label": "Try options",
          "text": "\"No one liked me\" was all right. Then: \"I get no respect.\""
        },
        {
          "label": "The runner",
          "text": "\"I get no respect\" can sit in front of hundreds of jokes, and every new joke heightens the same idea."
        },
        {
          "label": "Why it works",
          "text": "Each joke tops the last as proof of one attitude, so the act builds instead of resetting."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "John Mulaney",
      "title": "What's New Pussycat, 21 times (Salt and Pepper Diner)",
      "url": "https://www.youtube.com/watch?v=Mw7Gryt-rcc",
      "channel": "Comedy Central Stand-Up",
      "notice": [
        "One simple prank, heightened every time the song restarts.",
        "Notice that each beat escalates the reaction in the diner, not the prank itself.",
        "Watch how the story builds to its biggest beat and then stops."
      ]
    },
    {
      "comedian": "Eddie Izzard",
      "title": "Death Star canteen (Circle)",
      "url": "https://www.youtube.com/watch?v=7p5KpjR93SE",
      "channel": "Eddie Izzard",
      "notice": [
        "A \"yes, and\" bit: accept that Darth Vader queues for lunch, then keep adding.",
        "Each exchange raises the stakes while keeping the same frame."
      ]
    },
    {
      "comedian": "Zakir Khan",
      "title": "Bahut Pighle Hain (Sukha Puri 6)",
      "url": "https://www.youtube.com/watch?v=MLdXYEWTC1k",
      "channel": "Zakir Khan",
      "indian": true,
      "notice": [
        "A set of linked stories: his mom, the gym, his first kiss, a gym trainer.",
        "Listen for lines and phrases that come back from earlier stories. Those are callbacks.",
        "Notice how the stories build on each other instead of resetting."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Moving on after the first laugh.', fix: 'Ask "yes, and what else?" at least three times before leaving a premise.' },
    { mistake: 'Tags that change the logic.', fix: 'Stay in the frame you built. Heightening means more of the same rule, bigger.' },
    { mistake: 'Ending a run on a weaker beat.', fix: 'Order tags by strength; finish on the strongest and stop.' },
    { mistake: 'Callbacks too soon after the original.', fix: 'Let a few minutes (or jokes) pass so recognition feels like a reward.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'What is a tag?',
      options: [
        'A hashtag for social media',
        'An extra punchline on the same setup, with no new setup needed',
        'The title of a bit',
        'A joke about someone in the audience',
      ],
      answer: 1,
      explain: 'Tags harvest extra laughs from an audience that\'s already in your world.',
    },
    {
      kind: 'choice',
      prompt: 'Base joke: "My smart speaker is like a teenager. It only listens when I\'m saying something private." Which tag heightens it best?',
      options: [
        'Smart speakers are made by tech companies.',
        'Yesterday it rolled its eyes at me. I don\'t know how, it doesn\'t have eyes.',
        'It also asked to borrow the car.',
        'I like my smart speaker.',
      ],
      answer: 2,
      explain: 'Stays in the teenager frame and escalates with a classic teen move. Option B explains itself.',
    },
    {
      kind: 'choice',
      prompt: 'What does "yes, and" mean in joke writing?',
      options: [
        'Agree with every heckler.',
        'Accept the reality you\'ve set up and add to it.',
        'Always start jokes with "Yes".',
        'Say yes to every gig.',
      ],
      answer: 1,
      explain: 'Accept the frame, then build on it. That\'s heightening.',
    },
    {
      kind: 'word',
      prompt: 'Russell Peters\' run: tap the word that tops it.',
      joke: { setup: 'Jamaican + Italian: little "pasta-farians". Indian + Jewish: little "hin-jews". Philippines + Holland: little "holla-pinos".', punchline: 'Guy from Cuba, woman from Iceland – little "ice cubes".' },
      answer: 'cubes',
      explain: '"cubes" completes the last and shortest mash-up. Once the pattern is set, each beat needs less setup, so the run can end on its quickest laugh.',
    },
  ],
  exercise: {
    prompt: 'Here\'s a base joke. Write two tags that stay in the frame and escalate:\n"A toddler is basically a tiny drunk boss. Falls over, shouts orders and fires you at bedtime."\nPut your best tag in the punchline box and your other tag in the setup box.',
    premise: 'Toddlers',
    formula: null,
    hint: 'What else do drunk bosses do? Office parties, performance reviews, a 2am email…',
    modelAnswers: [
      { setup: 'Tag 1: Every meeting ends with someone crying, and it\'s usually the boss.', punchline: 'Tag 2: And the performance review is just "NO" in a really loud voice.', note: 'Both stay in the boss frame; the second escalates to formal HR language.' },
    ],
  },
}
