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
      setup: 'Coworker: "This printer hates me."',
      punchline: 'You: "It\'s not personal. It hates everyone. I\'ve seen its diary."',
      punchWord: 'diary',
      steps: [
        { label: 'What they handed you', text: 'A personification ("hates me").' },
        { label: 'Move', text: 'Yes, and: accept the printer has feelings, then add detail.' },
        { label: 'Heighten', text: 'If it has feelings, it has a private life: a diary.' },
        { label: 'Why it\'s safe', text: 'Teases a machine and builds on their line instead of correcting it.' },
        { label: 'Punch word', text: '"diary", a specific object proving the absurd premise.' },
      ],
    },
    {
      setup: 'Friend: "Can you keep an eye on my bag?"',
      punchline: 'You: "Sure. If it tries anything, I\'ll call you."',
      punchWord: 'call',
      steps: [
        { label: 'Connector', text: '"keep an eye on" means guard it, but literally means watch it.' },
        { label: 'Move', text: 'Literal plus personification: treat the bag as a suspect.' },
        { label: 'Delivery', text: 'Said straight, as if it\'s a serious promise.' },
        { label: 'Why it works', text: 'It still says yes, so it\'s funny AND helpful.' },
        { label: 'Punch word', text: '"call" completes the picture of you reporting the bag.' },
      ],
    },
    {
      setup: 'Date: "So, are you a morning person?"',
      punchline: 'You: "I\'m a morning person in the way a bear is a winter person."',
      punchWord: 'person',
      steps: [
        { label: 'What they handed you', text: 'A simple yes/no question.' },
        { label: 'Move', text: 'Comparison: answer by linking to another world (hibernation).' },
        { label: 'Structure', text: 'Reuses their phrase ("___ person") so the echo is clean.' },
        { label: 'Why it works', text: 'It answers the question (no) and shows personality.' },
        { label: 'Punch word', text: 'The repeated "person" closes the parallel; "winter" carries the surprise.' },
      ],
    },
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
      setup: 'I\'ve been going to the gym religiously. [pause]',
      punchline: 'Christmas… and Easter.',
      punchWord: 'Easter',
      steps: [
        { label: 'Setup', text: 'Said proudly, as if it\'s a brag. Commit to the assumption.' },
        { label: 'Pause', text: 'A half-second beat after "religiously" lets the audience picture a gym devotee.' },
        { label: 'Punch', text: 'Flat and factual. Don\'t wink.' },
        { label: 'Micro-pause', text: 'A tiny beat between "Christmas" and "Easter" makes the second word land.' },
        { label: 'After', text: 'Stop. Hold eye contact. Let the silence do the work.' },
      ],
    },
    {
      setup: 'It\'s weird that my grandma signs her texts.',
      punchline: '[act-out, reading phone] "Love, Gran." [beat, to phone] Yes, Gran. Your name\'s at the top.',
      punchWord: 'top',
      steps: [
        { label: 'Setup', text: 'Conversational, observational tone.' },
        { label: 'Act-out', text: 'Mime holding a phone and read in her voice. The audience sees the text.' },
        { label: 'Beat', text: 'A pause as you "read" the signature lets the absurdity register.' },
        { label: 'Reply', text: 'Speak to the phone, patient and loving.' },
        { label: 'Punch word', text: '"top", gently stressed, then stop.' },
      ],
    },
    {
      setup: 'My teenager sleeps in so late,',
      punchline: "the neighbours think he's a rumour.",
      punchWord: 'rumour',
      steps: [
        { label: 'Setup', text: 'Weary parent energy. The attitude is in the voice.' },
        { label: 'Pause', text: 'A short beat after "so late," builds the "how late?" question.' },
        { label: 'Punch', text: 'Almost a whisper, as if sharing gossip, which fits "rumour".' },
        { label: 'Stress', text: '"RUmour", a clear first syllable.' },
        { label: 'After', text: 'If it gets a laugh, wait, then tag: "Some of them have set up a podcast."' },
      ],
    },
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
      joke: { setup: 'My dad is so cheap, he reuses tea bags', punchline: "until it's legally just hot water." },
      answer: 'water',
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
      setup: 'Draft 1: "My bus is always really late, it\'s so annoying."',
      punchline: 'Draft 4: "My bus is so late, the timetable is now classed as historical fiction."',
      punchWord: 'fiction',
      steps: [
        { label: 'Draft 1', text: 'A complaint with no surprise. Feedback: "Yeah, buses."' },
        { label: 'Draft 2', text: '"My bus is so late I age on it." Better, but vague: an exaggeration with no picture.' },
        { label: 'Draft 3', text: '"…the timetable is basically fiction." Getting there, but "basically" softens it.' },
        { label: 'Draft 4', text: '"…classed as historical fiction": official language plus a genre gives a specific image.' },
        { label: 'Lesson', text: 'The idea was in draft 1. The joke arrived through rewriting.' },
      ],
    },
    {
      setup: 'Test: "I\'m in the best shape of my life. A pear."',
      punchline: 'Fix: "I\'m in the best shape of my life. Admittedly, that shape is a pear."',
      punchWord: 'pear',
      steps: [
        { label: 'Result', text: 'Confused faces. Not a surprise problem, a clarity problem.' },
        { label: 'Question asked', text: '"What did you think \'a pear\' meant?" Half didn\'t connect it to "shape".' },
        { label: 'Diagnosis', text: 'The connector "shape" needs repeating so the second meaning is clear.' },
        { label: 'Fix', text: '"that shape is a pear" re-uses the connector.' },
        { label: 'Lesson', text: 'No laugh plus confused faces means a clarity fix. No laugh plus nodding means a surprise fix.' },
      ],
    },
    {
      setup: 'Quota: 10 punches for "My dentist told me to brush after every meal."',
      punchline: 'Pick: "The restaurant asked me to stop doing it at the table."',
      punchWord: 'table',
      steps: [
        { label: '1–3', text: 'Obvious: "I eat a lot", "my toothbrush is tired", "I\'m out of toothpaste". Everyone\'s first ideas.' },
        { label: '4–6', text: 'Better: literal readings (brushing the meal itself, brushing at a buffet).' },
        { label: '7–9', text: 'Specific: the waiter, the table, a fancy restaurant.' },
        { label: 'Pick', text: 'Number 8: social cost, a specific place, punch word last.' },
        { label: 'Lesson', text: 'Your best line came after you\'d used up the obvious ones. That\'s why quotas work.' },
      ],
    },
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
