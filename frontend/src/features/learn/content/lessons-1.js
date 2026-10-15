// The curriculum, part 1: Anatomy, Point of view, Association.
// Worked examples are real jokes by working comedians, each credited with the page that
// verifies its wording (`sourceUrl`). "Watch the masters" cards link to official clips only.
// Quizzes and model answers are our own. Frameworks credited in `lineage`.

export const ANATOMY = {
  skill: 'ANATOMY',
  title: 'Anatomy of a joke',
  tagline: 'Every joke is a tiny magic trick: make them assume, then reveal.',
  minutes: 12,
  lineage: "Greg Dean's joke structure (setup, target assumption, connector, reinterpretation), plus the incongruity theory of humour.",
  drill: { to: '/xray', label: 'Joke X-Ray', why: 'Dissect real jokes until you can see the parts without thinking.' },
  cards: [
    {
      title: "Jokes aren't magic. They're machines.",
      body: "\"Being funny\" sounds like a personality trait. It isn't. A joke has parts, and the parts have jobs. Funny people do this instinctively because they've heard thousands of jokes. You're going to do it deliberately until it becomes instinct. It's how musicians learn scales.",
    },
    {
      title: 'Part 1: the setup builds a story in their head',
      body: "The setup isn't there to be funny. It's there to make the audience believe something. Every setup quietly leads the listener to picture one specific scenario, the most normal one. Greg Dean calls that picture the **target assumption**. They don't notice they've made it, and that's the point.",
    },
    {
      title: 'Part 2: the connector has two readings',
      body: "Somewhere in the setup is a word or phrase that can be read two ways: the **connector**. In \"I've been going to the gym religiously\", the connector is *religiously*. The audience reads it as \"devotedly\". It could also mean \"the way some people go to church\": Christmas and Easter.",
    },
    {
      title: 'Part 3: the punch reveals the other story',
      body: "The punchline exposes a **reinterpretation**: a second story that fits every fact in the setup but isn't the one they pictured. The laugh is the moment their brain swaps stories. Too obvious and there's no swap. Too random and the new story doesn't fit the facts. Surprise that makes sense is the target.",
    },
    {
      title: 'Part 4: the punch word is the trigger',
      body: "Inside the punchline, one word makes the second story undeniable: the **punch word**. Put it as close to the end as you can, ideally last. Anything after it is talking over the laugh.",
    },
    {
      title: "Write backwards. That's the secret.",
      body: "Beginners write a setup and hope a punch appears. Pros often start from the surprise (a true, odd thing) and work backwards: what's the most innocent way to say this so that people assume the wrong thing? Ask \"what will they assume?\" before you ask \"what's funny?\"",
    },
  ],
  examples: [
    {
      "setup": "I've just been on a once-in-a-lifetime holiday.",
      "punchline": "I'll tell you what, never again.",
      "punchWord": "again",
      "comedian": "Tim Vine",
      "source": "Dave Funniest Joke of the Fringe, winner 2010",
      "sourceUrl": "https://www.comedy.co.uk/fringe/2010/features/tim_vine_joke_of_the_year/",
      "steps": [
        {
          "label": "Setup",
          "text": "Sounds like a holiday brag. Nothing funny yet, and that's correct."
        },
        {
          "label": "Target assumption",
          "text": "The trip of a lifetime: the best holiday he will ever have."
        },
        {
          "label": "Connector",
          "text": "\"once-in-a-lifetime\". It can mean \"so good it only happens once\" or \"so bad I'll only do it once\"."
        },
        {
          "label": "Reinterpretation",
          "text": "It was awful, and he will never go again."
        },
        {
          "label": "Punch word",
          "text": "\"again\", the last word, so the swap and the silence arrive together. \"I'll tell you what\" is the stall that makes you wait for it."
        }
      ]
    },
    {
      "setup": "I'm sure wherever my dad is; he's looking down on us.",
      "punchline": "He's not dead, just very condescending.",
      "punchWord": "condescending",
      "comedian": "Jack Whitehall",
      "source": "Dave Funniest Joke of the Fringe, top 10 2009",
      "sourceUrl": "https://www.chortle.co.uk/news/2009/08/24/9487/revealed:_the_funniest_joke_on_the_fringe",
      "steps": [
        {
          "label": "Setup",
          "text": "A tender line about a dad who has died. The audience goes quiet and respectful."
        },
        {
          "label": "Target assumption",
          "text": "Dad is in heaven, watching over the family."
        },
        {
          "label": "Connector",
          "text": "\"looking down on us\": watching over us, or looking down his nose at us."
        },
        {
          "label": "Reinterpretation",
          "text": "Dad is alive and a snob."
        },
        {
          "label": "Punch word",
          "text": "\"condescending\". \"He's not dead\" clears the old picture away first, so the new word lands alone at the end."
        }
      ]
    },
    {
      "setup": "As a kid I was made to walk the plank.",
      "punchline": "We couldn't afford a dog.",
      "punchWord": "dog",
      "comedian": "Gary Delaney",
      "source": "Dave Funniest Joke of the Fringe, top 10 2010",
      "sourceUrl": "https://www.chortle.co.uk/news/2010/08/23/11592/",
      "steps": [
        {
          "label": "Setup",
          "text": "A pirate image from childhood."
        },
        {
          "label": "Target assumption",
          "text": "Walking the plank is a punishment on a pirate ship."
        },
        {
          "label": "Connector",
          "text": "\"walk\": you walk a plank, and you walk a dog."
        },
        {
          "label": "Reinterpretation",
          "text": "The family couldn't afford a pet, so the child took a plank for walks."
        },
        {
          "label": "Punch word",
          "text": "\"dog\". The punch never mentions walking again: the audience builds the picture themselves, which is why the laugh comes a beat late and big."
        }
      ]
    },
    {
      "setup": "One morning, I shot an elephant in my pajamas.",
      "punchline": "How he got in my pajamas, I don't know.",
      "punchWord": "pajamas",
      "comedian": "Groucho Marx",
      "source": "Animal Crackers (1930)",
      "sourceUrl": "https://time.com/4049402/groucho-marx-125/",
      "steps": [
        {
          "label": "Setup",
          "text": "A hunting boast from Captain Spaulding, the explorer Groucho plays in Animal Crackers."
        },
        {
          "label": "Target assumption",
          "text": "He was wearing his pajamas when he shot the elephant."
        },
        {
          "label": "Connector",
          "text": "\"in my pajamas\" can attach to \"I\" or to \"an elephant\". Grammar gives you both."
        },
        {
          "label": "Reinterpretation",
          "text": "The elephant was in his pajamas."
        },
        {
          "label": "Punch word",
          "text": "\"pajamas\", which is NOT last. Groucho adds \"I don't know\" as a shrug for his character. A rule broken on purpose by a master: you're allowed once you know why."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Tim Vine",
      "title": "Three minutes of one-liners",
      "url": "https://www.youtube.com/watch?v=V6bdLiEFoYE",
      "channel": "Live at the Apollo (BBC)",
      "notice": [
        "Count how many words come after each punch word.",
        "Find the connector in each one before he reaches the punch.",
        "Notice how fast he moves on: no explaining, no waiting for approval."
      ]
    },
    {
      "comedian": "Kanan Gill",
      "title": "How Indians do timepass (Yours Sincerely, Kanan Gill)",
      "url": "https://www.youtube.com/watch?v=P6aPg3YBvBQ",
      "channel": "Netflix India",
      "indian": true,
      "notice": [
        "The bit hangs on two near-identical words, \"pastime\" and \"timepass\". Listen for how he makes you hear both.",
        "Watch how long the setup is compared with each payoff."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Making the setup funny too.', fix: 'A jokey setup warns the audience. Keep it plain and believable so the assumption forms.' },
    { mistake: "Ending with words after the surprise (\"…Christmas and Easter, basically.\").", fix: 'Find the punch word and end on it. Cut or move everything after it.' },
    { mistake: 'A punch that is random, not a reinterpretation.', fix: 'Check that the punch still fits every fact in the setup. Surprise has to make sense.' },
    { mistake: 'Explaining the joke in the punch ("…because I only go on holidays").', fix: "Trust the audience to do the swap. Their doing it IS the laugh." },
  ],
  quiz: [
    {
      kind: 'word',
      prompt: 'Tap the punch word.',
      joke: { setup: 'My mum says I can do anything I put my mind to.', punchline: 'So I put my mind to a nap.' },
      answer: 'nap',
      explain: '"nap" is where the big ambition collapses into the smallest possible one, and it\'s last.',
    },
    {
      kind: 'choice',
      prompt: 'What target assumption does this setup create? "My dad says he\'s between jobs."',
      options: [
        'He is temporarily unemployed and looking for work.',
        'He works two jobs at once.',
        'He is sitting on the sofa.',
        'He hates his job.',
      ],
      answer: 0,
      explain: 'That\'s the normal reading, and the one a punch would break: "between" could just as easily mean between the sofa cushions.',
    },
    {
      kind: 'choice',
      prompt: 'In "I\'m in the best shape of my life. Admittedly, that shape is a pear." What is the connector?',
      options: ['best', 'shape', 'life', 'admittedly'],
      answer: 1,
      explain: '"Shape" means fitness in the setup and a geometric outline in the punch. One word, two readings.',
    },
    {
      kind: 'choice',
      prompt: 'Why should the punch word come last?',
      options: [
        'Grammar rules require it.',
        "The laugh starts when the surprise lands; words after it talk over the laugh and leak the energy.",
        'Short words are funnier at the end.',
        "It doesn't matter much.",
      ],
      answer: 1,
      explain: 'The audience laughs the moment the story swaps. Make that moment the very end of your line.',
    },
  ],
  exercise: {
    prompt: 'Write a misdirection joke. Start with a surprising truth, then write the most innocent setup that hides it.',
    premise: 'A habit you\'re secretly bad at',
    formula: 'MISDIRECTION',
    hint: 'Try: "I\'ve finally started [good habit]." then a punch that keeps the facts but changes the picture.',
    modelAnswers: [
      { setup: "I've been going to the gym religiously.", punchline: 'Christmas and Easter.', note: 'Connector: "religiously".' },
      { setup: "I'm a big believer in waking up at 5am.", punchline: 'I just believe in it from bed.', note: 'Connector: "believer".' },
    ],
  },
}

export const POINT_OF_VIEW = {
  skill: 'POINT_OF_VIEW',
  title: 'Find your attitude',
  tagline: "Topics aren't funny. How you feel about them is.",
  minutes: 11,
  lineage: "Judy Carter's attitudes (weird, stupid, scary, hard) and the topic → attitude → premise → act-out method from The Comedy Bible.",
  drill: { to: '/notebook', label: 'Bit Notebook', why: 'Collect your attitude lines and grow them into bits.' },
  cards: [
    {
      title: '"I\'m not funny" usually means "I don\'t say what I think"',
      body: "Quiet, \"boring\" people often notice more than anyone: the odd rule nobody questions, the thing everyone pretends is fine. Comedy point of view is just saying that noticing out loud, with feeling. You don't need to be wacky. You need to be honest and specific.",
    },
    {
      title: 'The four attitudes',
      body: "Judy Carter's shortcut: almost every stand-up line starts from one of four feelings. Something is **weird**, **stupid**, **scary** or **hard**. Say the feeling first: \"You know what's weird about hotel rooms?\" It tells the audience how to listen and gives you a direction to write in.",
    },
    {
      title: 'Topic + attitude + premise',
      body: '"Dentists" is a topic. "Dentists are scary" is an attitude. "The scariest thing at the dentist is being asked questions with their hands in your mouth" is a **premise**: a specific, arguable observation. Jokes come from premises, not topics.',
    },
    {
      title: 'Prove it with a specific',
      body: "Once you've claimed something is stupid, prove it with the most specific example you can find: an exact sentence someone said, a price, an object. \"Car alarms are stupid\" is a claim. \"Nobody hears one and thinks 'theft'. Everyone thinks 'Steve's sat on his keys'\" is proof.",
    },
    {
      title: 'Your weakness is your material',
      body: 'Self-deprecation is the friendliest attitude for a beginner. When you are the target, the audience relaxes. Being quiet, awkward, over-planning, bad at small talk: each one is a topic with built-in attitudes.',
    },
  ],
  examples: [
    {
      "setup": "People say, \"I'm taking it one day at a time.\" You know what? So is everybody.",
      "punchline": "That's how time works.",
      "punchWord": "works",
      "comedian": "Hannibal Buress",
      "source": "Dave Funniest Joke of the Fringe, top 10 2011",
      "sourceUrl": "https://www.chortle.co.uk/news/2011/08/24/13850/nick_helm_scoops_joke_of_the_fringe",
      "steps": [
        {
          "label": "Topic",
          "text": "Things people say when life is hard."
        },
        {
          "label": "Attitude",
          "text": "Stupid. \"You know what?\" is the sound of someone who has heard this phrase once too often."
        },
        {
          "label": "Premise",
          "text": "\"One day at a time\" is presented as wisdom, but it's a description of how time works for everybody."
        },
        {
          "label": "Proof",
          "text": "\"So is everybody.\" No example needed: the audience checks it against their own day."
        },
        {
          "label": "Punch word",
          "text": "\"works\": the flattest, most factual ending possible. The deadpan IS the attitude."
        }
      ]
    },
    {
      "setup": "When women gossip we get called bitchy;",
      "punchline": "but when men do it's called a podcast.",
      "punchWord": "podcast",
      "comedian": "Sikisa",
      "source": "Dave Funniest Joke of the Fringe, top 10 2023",
      "sourceUrl": "https://www.chortle.co.uk/news/2023/08/21/53955/lorna_rose_treen_wins_joke_of_the_fringe",
      "steps": [
        {
          "label": "Topic",
          "text": "Gossip."
        },
        {
          "label": "Attitude",
          "text": "Unfair: it's a double standard, which is a version of \"stupid\"."
        },
        {
          "label": "Premise",
          "text": "The same behaviour gets an insult for women and a product for men."
        },
        {
          "label": "Proof",
          "text": "One specific, modern example everyone recognises: the podcast."
        },
        {
          "label": "Punch word",
          "text": "\"podcast\", last, and the whole argument in one word."
        }
      ]
    },
    {
      "setup": "A spa hotel? It's like a normal hotel,",
      "punchline": "only in reception there's a picture of a pebble.",
      "punchWord": "pebble",
      "comedian": "Rhod Gilbert",
      "source": "Dave Funniest Joke of the Fringe, top 10 2009",
      "sourceUrl": "https://www.chortle.co.uk/news/2009/08/24/9487/revealed:_the_funniest_joke_on_the_fringe",
      "steps": [
        {
          "label": "Topic",
          "text": "Spa hotels."
        },
        {
          "label": "Attitude",
          "text": "Stupid, delivered as an exasperated question: \"A spa hotel?\""
        },
        {
          "label": "Premise",
          "text": "A spa hotel is an ordinary hotel with a price rise and some decoration."
        },
        {
          "label": "Proof",
          "text": "The most specific, smallest difference he can find: a picture of a pebble in reception."
        },
        {
          "label": "Punch word",
          "text": "\"pebble\". A topic becomes a joke when the proof is that precise."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Vir Das",
      "title": "On being both Indian and Western (Landing)",
      "url": "https://www.youtube.com/watch?v=_nAm1U0jj_0",
      "channel": "Netflix Is A Joke",
      "indian": true,
      "notice": [
        "Notice that the topic is himself: two identities that don't quite fit together.",
        "Listen for the attitude word in each line. Is it weird, stupid, scary or hard?"
      ]
    },
    {
      "comedian": "Hasan Minhaj",
      "title": "How Indian parents make you tougher (Homecoming King)",
      "url": "https://www.youtube.com/watch?v=30cYjy7_DDg",
      "channel": "Netflix Is A Joke",
      "indian": true,
      "notice": [
        "A big, arguable claim (why Indian kids win spelling bees and become doctors), proved with his own family.",
        "Notice the claim is specific enough to argue with. That makes it a premise, not just a topic."
      ]
    },
    {
      "comedian": "Bill Burr",
      "title": "The population problem (I'm Sorry You Feel That Way)",
      "url": "https://www.youtube.com/watch?v=a9WowBxdhTQ",
      "channel": "Netflix Is A Joke",
      "notice": [
        "A deliberately outrageous point of view, argued step by step as if it's reasonable.",
        "Watch how he commits: no hedging, no apology."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Writing about a topic with no feeling ("Airports. Right?").', fix: 'Pick an attitude and say it out loud: weird, stupid, scary or hard.' },
    { mistake: 'Fake outrage you don\'t really feel.', fix: 'Audiences smell it. Choose things that actually bother or baffle you.' },
    { mistake: 'Staying general ("Technology is annoying").', fix: 'Narrow it until it\'s one moment, one object, one sentence.' },
    { mistake: 'Punching down at people with less power.', fix: 'Aim at situations, institutions, and yourself. It\'s funnier and you keep the room.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Which of these is a premise (not just a topic)?',
      options: [
        'Weddings.',
        'Weddings are expensive.',
        'A best-man speech is a roast where the victim paid for the venue.',
        'I went to a wedding.',
      ],
      answer: 2,
      explain: 'A premise is a specific, arguable observation. You can write ten jokes from it.',
    },
    {
      kind: 'choice',
      prompt: '"The scariest sentence at work is \'Can I borrow you for a sec?\'" Which attitude is this?',
      options: ['Weird', 'Stupid', 'Scary', 'Hard'],
      answer: 2,
      explain: 'It literally says scary. Naming the attitude upfront is a good habit.',
    },
    {
      kind: 'word',
      prompt: 'Tap the punch word.',
      joke: { setup: "Hotel rooms are weird. There's always one light switch that doesn't control anything.", punchline: "I think it turns on a light in someone else's room." },
      answer: 'room',
      explain: '"room" completes the absurd explanation: somewhere, a stranger\'s lamp flicks on.',
    },
    {
      kind: 'choice',
      prompt: 'You\'ve written "Self-checkouts are stupid." What\'s the best next step?',
      options: [
        'Add "so stupid" for emphasis.',
        'Find the most specific proof, like scanning your own shopping and then being checked for robbing yourself.',
        'Move to a new topic.',
        'Explain why shops use them.',
      ],
      answer: 1,
      explain: 'Attitude, then proof. The specific detail is where the laugh lives.',
    },
  ],
  exercise: {
    prompt: 'Pick something from your actual week. Name an attitude (weird, stupid, scary or hard), then prove it with one specific detail.',
    premise: 'Something you did this week',
    formula: 'ATTITUDE',
    hint: 'Start with: "You know what\'s weird about…" or "The scariest part of…"',
    modelAnswers: [
      { setup: 'Horoscopes are stupid.', punchline: "Mine said I'd have a difficult week, then had the nerve to be right.", note: 'Attitude: stupid. The twist: annoyed it worked.' },
      { setup: 'Small talk in a lift is hard. You\'ve got eight floors to be interesting,', punchline: 'and my best material is "Busy day?"', note: 'Attitude: hard. Proof by honest self-deprecation.' },
    ],
  },
}

export const ASSOCIATION = {
  skill: 'ASSOCIATION',
  title: 'Association: mining a topic',
  tagline: 'Jokes are connections. More raw material means better connections.',
  minutes: 12,
  lineage: "Joe Toplyn's handles and associations (Comedy Writing for Late-Night TV), and the mind-mapping methods common in sketch rooms.",
  drill: { to: '/associate', label: 'Association Mapper', why: 'Timed reps building association lists until it\'s automatic.' },
  cards: [
    {
      title: "Funny people aren't faster. They have more to choose from.",
      body: "When someone riffs a great line, it looks like lightning. Usually they've unconsciously tried ten connections and said the best one. Association is that hidden step made visible: list everything a topic touches, then look for two items that collide.",
    },
    {
      title: 'Find the handles',
      body: "Joe Toplyn's term: a **handle** is a word or phrase in a premise you can grab and pull on. In \"My neighbour is renovating his kitchen\", the handles are *neighbour*, *renovating* and *kitchen*. Each handle gets its own list.",
    },
    {
      title: 'List associations: people, places, things, phrases, feelings',
      body: 'For each handle, write fast: who\'s involved, where it happens, the objects, the phrases people say, the feelings. For *renovating*: drills at 8am, skips, "should be done by Friday", dust, builders\' radios, the budget doubling. Aim for 15 or more. The first 5 are everyone\'s; the funny ones come after.',
    },
    {
      title: 'Collide two lists',
      body: "Now look across two lists for a pair that shares something unexpected. *Renovation* time × *relationships* gives \"My neighbour's renovation has lasted longer than most celebrity marriages.\" The joke is the connection you found. You didn't invent it, you noticed it.",
    },
    {
      title: 'Specific beats general, every time',
      body: '"Food" is dead; "petrol-station sushi" is alive. "A car" is nothing; "a 2003 Fiesta with one working window" is a character. When listing, push every entry one step more specific. Specifics are funnier because they\'re picturable and they sound true.',
    },
  ],
  examples: [
    {
      "setup": "Guy from Cuba, woman from Iceland –",
      "punchline": "little \"ice cubes\".",
      "punchWord": "cubes",
      "comedian": "Russell Peters",
      "source": "stand-up, on mixing ethnicities",
      "sourceUrl": "https://www.timeout.com/singapore/comedy/all-time-classics-from-russell-peters",
      "steps": [
        {
          "label": "Handles",
          "text": "Mixed-heritage couples · their children."
        },
        {
          "label": "List: countries",
          "text": "Jamaica, Italy, India, Israel, the Philippines, Holland, Cuba, Iceland…"
        },
        {
          "label": "List: words hiding in them",
          "text": "Rasta, pasta, Hindu, Jew, holla, Cuba, ice…"
        },
        {
          "label": "Collision",
          "text": "Find two country names whose pieces make an everyday word: Cuba + Iceland = ice cubes."
        },
        {
          "label": "Why that pick",
          "text": "It ends the run (after \"pasta-farians\", \"hin-jews\" and \"holla-pinos\") on the most ordinary object, which makes it the biggest laugh."
        }
      ]
    },
    {
      "setup": "Jesus fed 5,000 people with two fishes and a loaf of bread. That's not a miracle.",
      "punchline": "That's tapas",
      "punchWord": "tapas",
      "comedian": "Mark Nelson",
      "source": "Dave Funniest Joke of the Fringe, top 10 2015",
      "sourceUrl": "https://www.chortle.co.uk/news/2015/08/24/23103/and_the_joke_of_the_fringe_is...",
      "steps": [
        {
          "label": "Handles",
          "text": "Jesus · feeding the 5,000 · fish and bread."
        },
        {
          "label": "List: the miracle",
          "text": "crowds, loaves, fishes, baskets of leftovers, sharing"
        },
        {
          "label": "List: modern eating",
          "text": "small plates, sharing platters, bottomless brunch, tapas"
        },
        {
          "label": "Collision",
          "text": "Tiny portions shared among lots of people = tapas."
        },
        {
          "label": "Why that pick",
          "text": "\"Tapas\" is instantly familiar and drags a sacred story into a Spanish bar in one word."
        }
      ]
    },
    {
      "setup": "I needed a password with eight characters",
      "punchline": "– so I picked Snow White and the Seven Dwarves.",
      "punchWord": "Dwarves",
      "comedian": "Nick Helm",
      "source": "Dave Funniest Joke of the Fringe, winner 2011",
      "sourceUrl": "https://www.chortle.co.uk/news/2011/08/24/13850/nick_helm_scoops_joke_of_the_fringe",
      "steps": [
        {
          "label": "Handles",
          "text": "password · eight characters"
        },
        {
          "label": "List: password rules",
          "text": "eight characters, a capital letter, a number, a symbol, not your pet's name"
        },
        {
          "label": "List: \"characters\"",
          "text": "letters, symbols, people in a story, famous groups of characters"
        },
        {
          "label": "Collision",
          "text": "A story with exactly eight characters: Snow White and the Seven Dwarves."
        },
        {
          "label": "Why that pick",
          "text": "The count is correct, so the joke feels clever rather than random."
        }
      ]
    }
  ],
  masters: [
    {
      "comedian": "Michael McIntyre",
      "title": "The man drawer (Live and Laughing)",
      "url": "https://www.youtube.com/watch?v=wgrmB8M0sgU",
      "channel": "Michael McIntyre",
      "notice": [
        "The whole bit is an association list: everything that ends up in one drawer.",
        "Each object is specific and picturable. Count how many he names.",
        "Notice which item he saves for last."
      ]
    },
    {
      "comedian": "Kenny Sebastian",
      "title": "Middle-class restaurant problems (Insides Out)",
      "url": "https://www.youtube.com/watch?v=TZgyeEE2hx4",
      "channel": "Kenny Sebastian",
      "indian": true,
      "notice": [
        "One handle (\"Indian restaurant\") becomes a list: the parents ordering, the waiters, the mysterious manager.",
        "Each item on the list becomes its own little scene."
      ]
    }
  ],
  mistakes: [
    { mistake: 'Stopping at five associations.', fix: 'The first ideas are everyone\'s ideas. Push past 15. The weird ones are the useful ones.' },
    { mistake: 'Listing only nouns.', fix: 'Include phrases people say, feelings, sounds, smells, prices. Phrases are gold for wordplay and literal jokes.' },
    { mistake: 'Writing generic entries ("food", "work").', fix: 'Make each entry picturable: "the sad desk salad", "the 4:55pm email".' },
    { mistake: 'Judging while listing.', fix: 'Generate first, judge later. Editing kills the flow.' },
  ],
  quiz: [
    {
      kind: 'choice',
      prompt: 'Which association is most useful for a joke about gyms?',
      options: ['Exercise', 'Health', 'The person who wipes down a machine they never used', 'Fitness'],
      answer: 2,
      explain: 'Specific and picturable, with a built-in attitude. The others are categories, not images.',
    },
    {
      kind: 'choice',
      prompt: 'What is a "handle" (Toplyn)?',
      options: [
        'The comedian\'s stage name',
        'A word or phrase in the premise you can pull associations from',
        'The last word of the joke',
        'A catchphrase',
      ],
      answer: 1,
      explain: 'Find two or three handles, list for each, then collide the lists.',
    },
    {
      kind: 'word',
      prompt: 'Tap the punch word.',
      joke: { setup: 'Reading the comments section is like eating petrol-station sushi.', punchline: 'You know exactly how it ends, and you still go back for seconds.' },
      answer: 'seconds',
      explain: '"seconds" is a food word that also confesses the compulsion. Both lists meet in one word.',
    },
    {
      kind: 'choice',
      prompt: 'Why do the funniest associations usually appear after the 10th item?',
      options: [
        'Your brain gets tired and silly.',
        'The first items are the obvious ones everyone thinks of; surprise needs less obvious material.',
        'Lists are funnier when long.',
        'They don\'t; the first idea is best.',
      ],
      answer: 1,
      explain: 'Obvious associations make obvious jokes. Surprise lives deeper in the list.',
    },
  ],
  exercise: {
    prompt: 'Pick two handles from the premise, quickly list associations for each (in your head or on paper), then write one joke that connects an item from each list.',
    premise: 'Moving house',
    formula: 'COMPARISON',
    hint: 'Handles: boxes, the kettle, "misc", the last night in the old place… What else is like that?',
    modelAnswers: [
      { setup: 'Moving house is an escape room you pay for.', punchline: 'Every clue is a box labelled misc.', note: 'Collides "boxes labelled misc" with escape-room clues.' },
    ],
  },
}
