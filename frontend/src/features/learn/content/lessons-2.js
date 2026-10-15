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
      setup: 'Christmas with my family means three things:',
      punchline: 'turkey, presents and a hostage situation.',
      punchWord: 'situation',
      steps: [
        { label: 'Formula', text: 'Rule of three.' },
        { label: 'Items 1 and 2', text: '"turkey, presents" are cosy, correct and the same category.' },
        { label: 'Item 3', text: '"a hostage situation" has the same grammatical shape but comes from a crime drama.' },
        { label: 'Why it\'s true', text: 'Everyone who\'s been trapped at a family Christmas recognises it.' },
        { label: 'Punch word', text: '"situation" ends on the phrase that names the new world.' },
      ],
    },
    {
      setup: 'Traffic was so slow this morning,',
      punchline: 'I aged out of my car insurance discount.',
      punchWord: 'discount',
      steps: [
        { label: 'Formula', text: 'Exaggeration.' },
        { label: 'True feeling', text: 'Traffic made the commute feel endless.' },
        { label: 'Inflate the consequence', text: 'Not "it took ages" but a real-world system (insurance age brackets) triggered by it.' },
        { label: 'Specific', text: 'A bureaucratic detail makes the absurd feel measured.' },
        { label: 'Punch word', text: '"discount" is last.' },
      ],
    },
    {
      setup: 'If my cat were a landlord:',
      punchline: '"You can stay, but the sofa is mine and rent is due at 5am."',
      punchWord: '5am',
      steps: [
        { label: 'Formula', text: 'Mash-up.' },
        { label: 'World 1', text: 'Cats: claim furniture, wake you at dawn for food.' },
        { label: 'World 2', text: 'Landlords: terms, rent, ownership.' },
        { label: 'The line', text: 'Written in the landlord\'s voice, built from cat behaviour.' },
        { label: 'Punch word', text: '"5am" is the cat\'s feeding time, re-labelled as rent.' },
      ],
    },
    {
      setup: 'The fancy restaurant served me three peas and called it "a small plate concept."',
      punchline: 'So I left them a small tip concept.',
      punchWord: 'concept',
      steps: [
        { label: 'Formula', text: 'Reversal.' },
        { label: 'Normal direction', text: 'The restaurant sets the terms; the customer pays.' },
        { label: 'The flip', text: 'The customer uses the restaurant\'s jargon against it.' },
        { label: 'Echo', text: 'Reusing "small … concept" makes the reversal audible.' },
        { label: 'Punch word', text: '"concept", the word they hid behind.' },
      ],
    },
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
      prompt: '"My bus is so late, the timetable is now classed as historical fiction." Which formula?',
      options: ['Rule of three', 'Exaggeration', 'Reversal', 'Wordplay'],
      answer: 1,
      explain: 'A true feeling (lateness) inflated to an impossible, specific consequence.',
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
      setup: 'Before: "So the thing about my dad is that he\'s very, very cheap, and like, he reuses tea bags a lot, so much that it\'s basically water at the end, honestly."',
      punchline: 'After: "My dad is so cheap, he reuses tea bags until it\'s legally just hot water."',
      punchWord: 'water',
      steps: [
        { label: 'Cut', text: '"So the thing about…" is throat-clearing. Gone.' },
        { label: 'Cut', text: '"very, very", "like", "a lot", "honestly" are filler that dilutes the rhythm.' },
        { label: 'Add', text: '"legally": one specific word that makes the exaggeration sound official.' },
        { label: 'Reorder', text: '"water" moves to the end instead of "honestly".' },
        { label: 'Result', text: '33 words down to 15. Same idea, twice the laugh.' },
      ],
    },
    {
      setup: 'Before: "Since March, which was when he lost his job, my dad has basically been sitting on the sofa between the cushions."',
      punchline: 'After: "My dad says he\'s between jobs. Since March, he\'s been between the sofa cushions."',
      punchWord: 'cushions',
      steps: [
        { label: 'Problem', text: 'The original gives away the connector ("between") without the setup that creates the assumption.' },
        { label: 'Fix', text: 'Give the polite phrase ("between jobs") its own sentence so the assumption forms.' },
        { label: 'Reorder', text: '"Since March" goes to the front of the punch so "cushions" is last.' },
        { label: 'Cut', text: '"basically", "sitting on" are implied by the image.' },
        { label: 'Result', text: 'Now it\'s a joke, not an anecdote.' },
      ],
    },
    {
      setup: 'Before: "Self-checkouts are so annoying because you have to scan everything yourself and then they still don\'t trust you, which is so stupid."',
      punchline: 'After: "Self-checkouts are stupid. I scan my own shopping, I bag my own shopping, and then a guard checks I didn\'t rob myself."',
      punchWord: 'myself',
      steps: [
        { label: 'Attitude first', text: '"are stupid" opens, three words, with the attitude clear.' },
        { label: 'Rhythm', text: 'Parallel phrases ("I scan…, I bag…") create a pattern.' },
        { label: 'Specific', text: '"a guard checks" shows instead of "they don\'t trust you".' },
        { label: 'Punch word', text: '"myself" exposes the absurd logic, last.' },
        { label: 'Cut', text: '"so annoying", "which is so stupid" are duplicates of the attitude.' },
      ],
    },
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
      prompt: 'This punch has a tail. Tap the real punch word.',
      joke: { setup: 'My teenager sleeps in so late,', punchline: "the neighbours think he's a rumour, honestly." },
      answer: 'rumour',
      explain: 'Cut "honestly". "rumour" is the surprise and should be last.',
    },
    {
      kind: 'choice',
      prompt: '"My phone is really really old and slow." What\'s the best economy fix?',
      options: [
        'Add more adjectives: "really really old and slow and bad".',
        'Swap adjectives for a specific picture: "My phone is so old, its updates come by post."',
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
      setup: 'If my cat were a landlord: "You can stay, but the sofa is mine and rent is due at 5am."',
      punchline: 'Tag: "The deposit is one sock." Tag: "Inspections are whenever you\'re in the bath." Tag: "And I\'m evicting you for a cardboard box."',
      punchWord: 'box',
      steps: [
        { label: 'Base joke', text: 'Cat behaviour, phrased as landlord terms.' },
        { label: 'Yes, and', text: 'Accept the frame. What else do landlords do? Deposits, inspections, evictions.' },
        { label: 'Tag 1', text: 'A deposit, paid in a stolen sock.' },
        { label: 'Tag 2', text: 'Inspections, timed to maximum awkwardness.' },
        { label: 'Tag 3 (top)', text: 'Eviction for a box: the biggest stakes and the most cat-like reason.' },
      ],
    },
    {
      setup: 'Last week I bought a self-cleaning oven. It has never once cleaned itself. … Later: I asked my teenager to tidy his room and he said he\'s on it.',
      punchline: "Turns out he's also self-cleaning.",
      punchWord: 'cleaning',
      steps: [
        { label: 'Plant', text: 'The oven joke works on its own: "self-cleaning", never cleans.' },
        { label: 'Gap', text: 'Move to a new topic so the audience forgets.' },
        { label: 'Setup', text: 'A teenager promising to tidy.' },
        { label: 'Callback', text: '"self-cleaning" returns with a new target.' },
        { label: 'Why it works', text: 'Double laugh: the new joke, plus the pleasure of recognition.' },
      ],
    },
    {
      setup: "I went back to the hotel breakfast buffet so many times, the omelette chef started calling me son.",
      punchline: 'Tag: "By Thursday he\'d put me in his will." Tag: "On the last day, he cried at the airport."',
      punchWord: 'airport',
      steps: [
        { label: 'Base joke', text: 'Exaggeration: so many visits it formed a relationship.' },
        { label: 'Heighten the relationship', text: 'Son → in his will. The stakes rise.' },
        { label: 'Top it', text: 'A tearful airport farewell: the full emotional cliché, applied to an omelette chef.' },
        { label: 'Pattern', text: 'Each tag escalates the same idea (family) without new setup.' },
        { label: 'Stop', text: 'End on the biggest beat. A fourth tag would deflate it.' },
      ],
    },
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
      prompt: 'Tap the callback word in this punch.',
      joke: { setup: 'Earlier: my "self-cleaning" oven has never cleaned itself. Later: my teenager says he\'s on his room.', punchline: "Turns out he's also self-cleaning." },
      answer: 'cleaning',
      explain: '"self-cleaning" is the planted phrase coming back with a new target.',
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
