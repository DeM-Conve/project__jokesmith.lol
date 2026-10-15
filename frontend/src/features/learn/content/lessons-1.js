// The curriculum, part 1: Anatomy, Point of view, Association.
// Every joke here is original. Frameworks credited in `lineage`.

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
      setup: "I've finally started getting eight hours of sleep a night.",
      punchline: 'Spread across the week.',
      punchWord: 'week',
      steps: [
        { label: 'Setup', text: 'Sounds like a wellness brag. Nothing funny yet, and that\'s correct.' },
        { label: 'Target assumption', text: 'Eight hours, every night. A healthy person.' },
        { label: 'Connector', text: '"eight hours … a night". The number is attached to a unit we assume is fixed.' },
        { label: 'Reinterpretation', text: 'The eight hours are a weekly total: about one hour a night.' },
        { label: 'Punch word', text: '"week", the last word, so the swap and the silence arrive together.' },
      ],
    },
    {
      setup: 'People always tell me I\'m a great listener.',
      punchline: "I'm not listening. I'm buffering.",
      punchWord: 'buffering',
      steps: [
        { label: 'Setup', text: 'A compliment. The audience pictures a warm, attentive person.' },
        { label: 'Target assumption', text: 'Quiet means engaged.' },
        { label: 'Connector', text: '"great listener". What does the listening look like from the outside? Silence.' },
        { label: 'Reinterpretation', text: 'Same silence, opposite cause: a brain stuck on a loading screen.' },
        { label: 'Punch word', text: '"buffering" brings in a whole new image from a different world (video streaming), in one word.' },
      ],
    },
    {
      setup: 'My job interview went brilliantly. The panel laughed at every single answer I gave.',
      punchline: 'I was applying to be a pilot.',
      punchWord: 'pilot',
      steps: [
        { label: 'Setup', text: 'Builds a success story with a supporting detail.' },
        { label: 'Target assumption', text: "Laughter means rapport. They liked you." },
        { label: 'Connector', text: '"laughed": we hear warmth, but laughter is also how people react to the absurd.' },
        { label: 'Reinterpretation', text: 'They laughed because the idea of you flying a plane is ridiculous.' },
        { label: 'Punch word', text: "\"pilot\". One noun reframes every sentence before it." },
      ],
    },
    {
      setup: 'My flatmate asked me to keep an eye on her soup.',
      punchline: 'It burned, but I watched every second.',
      punchWord: 'second',
      steps: [
        { label: 'Setup', text: 'An everyday request.' },
        { label: 'Target assumption', text: '"Keep an eye on" means take care of it.' },
        { label: 'Connector', text: 'The idiom "keep an eye on" can be read literally.' },
        { label: 'Reinterpretation', text: 'They only watched it, faithfully, as it burned.' },
        { label: 'Punch word', text: '"second" ends on the defensive detail that makes the character.' },
      ],
    },
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
      explain: 'That\'s the normal reading. The punch ("Since March, he\'s been between the sofa cushions") reinterprets "between".',
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
      body: '\"Dentists\" is a topic. \"Dentists are scary\" is an attitude. \"The scariest thing at the dentist is being asked questions with their hands in your mouth\" is a **premise**: a specific, arguable observation. Jokes come from premises, not topics.',
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
      setup: "It's weird being the quiet one. Say one thing,",
      punchline: 'and the whole room turns round like the furniture spoke.',
      punchWord: 'spoke',
      steps: [
        { label: 'Topic', text: 'Being the quiet person.' },
        { label: 'Attitude', text: 'Weird, stated in the first three words.' },
        { label: 'Premise', text: "When a quiet person speaks, people react as if something impossible happened." },
        { label: 'Proof', text: 'A comparison: the furniture speaking. Specific, visual, and kind to yourself.' },
        { label: 'Punch word', text: '"spoke". The image completes on the last word.' },
      ],
    },
    {
      setup: 'Car alarms are stupid. When one goes off, nobody thinks "theft".',
      punchline: 'Everyone thinks "Steve\'s sat on his keys."',
      punchWord: 'keys',
      steps: [
        { label: 'Topic', text: 'Car alarms.' },
        { label: 'Attitude', text: 'Stupid.' },
        { label: 'Premise', text: 'A device built to signal crime has only ever signalled clumsiness.' },
        { label: 'Proof', text: "Acting out everyone's real inner voice, with a named neighbour." },
        { label: 'Punch word', text: '"keys", the specific, innocent cause.' },
      ],
    },
    {
      setup: 'Being an adult is hard.',
      punchline: 'Nobody gives you a sticker for eating a vegetable.',
      punchWord: 'vegetable',
      steps: [
        { label: 'Topic', text: 'Adulthood.' },
        { label: 'Attitude', text: 'Hard.' },
        { label: 'Premise', text: "It's hard not because of the big stuff but because the tiny wins go unrewarded." },
        { label: 'Proof', text: 'A childhood reward system (stickers) applied to the smallest adult task.' },
        { label: 'Punch word', text: '"vegetable". The tinier the achievement, the bigger the laugh.' },
      ],
    },
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
      setup: "My neighbour's kitchen renovation has now lasted",
      punchline: 'longer than most celebrity marriages.',
      punchWord: 'marriages',
      steps: [
        { label: 'Handles', text: 'neighbour · renovation · kitchen' },
        { label: 'List: renovation', text: 'drills at 8am, dust, "two more weeks", skips, builders\' radio, it never ends' },
        { label: 'List: things that are short', text: 'mayflies, a fringe, a celebrity marriage, my attention span' },
        { label: 'Collision', text: '"never ends" × "famously short" makes a durations comparison.' },
        { label: 'Why that pick', text: 'Celebrity marriages are a universal reference with a built-in attitude.' },
      ],
    },
    {
      setup: 'Texts from my grandma read like ransom notes.',
      punchline: 'All caps, no punctuation and a mysterious photo of a cat.',
      punchWord: 'cat',
      steps: [
        { label: 'Handles', text: 'grandma · texting' },
        { label: 'List: grandma texts', text: 'ALL CAPS, signs her name, no punctuation, random photos, "Is this working"' },
        { label: 'List: other all-caps messages', text: 'ransom notes, telegrams, a shouty boss, protest signs' },
        { label: 'Collision', text: 'Ransom notes share three traits with grandma texts.' },
        { label: 'Why that pick', text: 'Sweet grandma vs criminal note: maximum distance between the worlds.' },
      ],
    },
    {
      setup: 'A toddler is basically a tiny drunk boss.',
      punchline: 'Falls over, shouts orders and fires you at bedtime.',
      punchWord: 'bedtime',
      steps: [
        { label: 'Handle', text: 'toddler' },
        { label: 'List', text: 'falls over, shouts, sticky, naps, refuses food, demands, unpredictable' },
        { label: 'Second world', text: 'Who else falls over and shouts orders? A drunk. Who gives orders? A boss.' },
        { label: 'Collision', text: 'Drunk + boss = a person who falls over AND gives orders.' },
        { label: 'Why that pick', text: 'Every item in the list now does double duty.' },
      ],
    },
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
