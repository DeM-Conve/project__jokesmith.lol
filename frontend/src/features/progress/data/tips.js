// Comedy tip of the day: a curated, hand-written list. One is picked per calendar day
// (tipForDate), so everybody sees the same tip on the same day, and it changes at local midnight.
// Each tip is one concrete thing to try today, not a platitude.

const T = (category, text) => ({ category, text })

export const TIP_CATEGORIES = {
  STRUCTURE: 'Structure',
  PREMISE: 'Premise',
  WORDS: 'Word choice',
  EDIT: 'Editing',
  RIFF: 'Riffing',
  WIT: 'Quick wit',
  DELIVERY: 'Delivery',
  HABIT: 'Habit',
  MINDSET: 'Mindset',
  AUDIENCE: 'Audience',
}

const C = TIP_CATEGORIES

export const TIPS = [
  // ---- Structure: how a joke is built ------------------------------------------
  T(C.STRUCTURE, 'Put the funniest word as close to the end as you can. Laughter starts at the reveal, so anything after it steps on the laugh.'),
  T(C.STRUCTURE, 'A setup creates an assumption; the punchline breaks it. Before you write a punchline, write down what the audience is assuming.'),
  T(C.STRUCTURE, 'Rule of three: two items set a pattern, the third breaks it. Make the first two boringly normal so the third has something to break.'),
  T(C.STRUCTURE, 'If your joke needs "because" in the punchline, the explanation is in the wrong place. Move it into the setup or cut it.'),
  T(C.STRUCTURE, 'Write the punchline first, then build the shortest setup that makes it surprising. Working backwards is how pros fix flat jokes.'),
  T(C.STRUCTURE, 'Find the "connector": the word or idea that means one thing in the setup and another in the punch. That double meaning is the hinge.'),
  T(C.STRUCTURE, 'A tag is a second punchline on the same setup. After any joke that works, try writing three tags before moving on.'),
  T(C.STRUCTURE, 'Callbacks get bigger laughs than new jokes. Note one image from early in your set and bring it back near the end in a new context.'),
  T(C.STRUCTURE, 'Misdirection works best when the setup is genuinely plausible. If the audience can see the twist coming, make the setup more ordinary.'),
  T(C.STRUCTURE, 'Try the reversal: state a common belief, then flip who it applies to. "My dog isn\'t allowed on the couch. I\'m not either, apparently."'),
  T(C.STRUCTURE, 'Try "It\'s like X, except Y": compare your topic to something unrelated, then name the one way they differ. The difference is the joke.'),
  T(C.STRUCTURE, 'A list of three where the third is oddly specific ("milk, eggs, and a lawyer") gets a laugh almost for free. Practise five today.'),
  T(C.STRUCTURE, 'Test your joke by saying only the setup to a friend. If they already guess the punch, you need a different reveal, not better wording.'),
  T(C.STRUCTURE, 'Keep the setup and the punch in the same "world". A punch that needs new information the setup never hinted at feels random, not clever.'),
  T(C.STRUCTURE, 'Turn a statement into a joke by adding a consequence: "I bought a standing desk" becomes funny when you say what happened next.'),

  // ---- Premise: finding something to say -----------------------------------------
  T(C.PREMISE, 'A premise is an opinion, not a topic. "Airports" is a topic. "Airports are the only place it\'s normal to drink at 7am" is a premise.'),
  T(C.PREMISE, 'Start with what annoys you today. Irritation has energy and a point of view built in. Write one sentence: "What bugs me about ___ is ___."'),
  T(C.PREMISE, 'The more specific, the funnier. "A car" is nothing; "a 2009 Honda Fit with one working headlight" is already a character.'),
  T(C.PREMISE, 'Look for things everyone does but nobody says out loud. Saying the quiet part is half of observational comedy.'),
  T(C.PREMISE, 'Write about what you actually know: your job, your family, your flat. Being boring in a specific way is great material.'),
  T(C.PREMISE, '"Not funny" people often notice details others miss. List five small things you noticed today; one of them is a premise.'),
  T(C.PREMISE, 'Ask "What would a very literal alien think of this?" about something normal, like birthday candles or hold music.'),
  T(C.PREMISE, 'Take a rule nobody questions (no talking in lifts, tipping, small talk) and ask who invented it and what they were thinking.'),
  T(C.PREMISE, 'Contradictions are premises. Find one thing you do that goes against what you claim to believe. Confessions get trust and laughs.'),
  T(C.PREMISE, 'Status is funny. Write about a time you were wrongly treated as important, or wrongly treated as unimportant.'),
  T(C.PREMISE, 'Take an emotion and make it far too big for its cause: grief over a dropped sandwich, triumph over a parking spot.'),
  T(C.PREMISE, 'Pick a mundane object near you and give it a motive. What does your printer want? Why does it choose violence?'),
  T(C.PREMISE, 'Compare generations: how your parents did something vs. how you do it vs. how a 12-year-old does it. Three angles, one premise.'),
  T(C.PREMISE, 'When a premise feels thin, ask "and what does that say about me?". Personal stakes turn an observation into a bit.'),

  // ---- Word choice -----------------------------------------------------------------
  T(C.WORDS, 'Words with a K sound (cupcake, pickle, Kentucky) really are funnier. Hard consonants pop. Swap one soft word for a crunchy one today.'),
  T(C.WORDS, 'Use brand names and proper nouns. "A cheap pen" is fine; "a Bic pen I stole from a bank" paints a picture.'),
  T(C.WORDS, 'Specific numbers beat round ones. "Forty-three minutes" is funnier than "about an hour" because it sounds like a true, tiny tragedy.'),
  T(C.WORDS, 'Swap adjectives for nouns. "Very old car" is weak. "A car with a cassette deck and a prayer" carries the image.'),
  T(C.WORDS, 'Cut qualifiers like "kind of", "sort of", "basically", "really". They make a punch apologise for itself.'),
  T(C.WORDS, 'Active verbs are funnier than "is" and "was". "My cat judged me" beats "my cat was judgmental".'),
  T(C.WORDS, 'Choose the word an expert would use in a ridiculous context: "I filed a formal complaint with my toaster."'),
  T(C.WORDS, 'Mixing registers is funny: very formal language about something childish, or very casual language about something grand.'),
  T(C.WORDS, 'Avoid "hilarious", "crazy" and "random" inside a joke. Telling people it\'s funny is the fastest way to stop it being funny.'),
  T(C.WORDS, 'Read the punchline aloud and find the stressed syllable. If the stress lands on a filler word, rewrite until it lands on the surprise.'),

  // ---- Editing ---------------------------------------------------------------------
  T(C.EDIT, 'Economy: count the words in your setup, then cut a third. Most setups survive losing half their words and get funnier.'),
  T(C.EDIT, 'Delete the first sentence of any story you tell. It\'s almost always throat-clearing ("So this one time...").'),
  T(C.EDIT, 'If two words do the job of one, keep the one with the stronger image.'),
  T(C.EDIT, 'Kill your darlings, but keep them in a "graveyard" file. Old cut lines often become perfect tags months later.'),
  T(C.EDIT, 'A joke that needs a long explanation is a story. Either commit to the story with more laughs along the way, or find the one-line version.'),
  T(C.EDIT, 'Laughs per minute is a real measure. Aim for something to laugh at every 15 to 20 seconds in a bit, and trim the dead air between.'),
  T(C.EDIT, 'Rewrite one old joke today instead of writing a new one. Craft grows faster from revision than from volume.'),
  T(C.EDIT, 'Write three different punchlines for the same setup, then pick one by reading them aloud, not by looking at them.'),
  T(C.EDIT, 'If a joke works only when you explain the reference, swap the reference for one everyone in the room shares.'),
  T(C.EDIT, 'Cut "I think" and "I feel like" from the front of your premise. Commit to the opinion; hedging kills the attitude.'),
  T(C.EDIT, 'Sleep on it. Reread yesterday\'s jokes with fresh eyes before you judge today\'s.'),
  T(C.EDIT, 'Check the order of information. Name the subject first, reveal the strange part last: "My grandma\'s new boyfriend is... 26."'),

  // ---- Riffing and heightening -----------------------------------------------------
  T(C.RIFF, 'Quantity before quality: write ten bad punchlines to one prompt in five minutes. Number seven is usually the first good one.'),
  T(C.RIFF, 'Heighten in steps. Take a silly idea and ask "if that\'s true, what else is true?" three times, getting bigger each time.'),
  T(C.RIFF, 'When riffing, write the obvious joke first, on purpose, then cross it out. Now you know what everyone else will say.'),
  T(C.RIFF, 'Mind-map a topic for two minutes: ten words connected to it. The funniest pairings come from two words far apart on the map.'),
  T(C.RIFF, 'Switch perspective: tell the same event from the point of view of the dog, the waiter or the furniture.'),
  T(C.RIFF, 'Exaggerate one detail to an absurd degree while keeping everything else realistic. Contrast does the work.'),
  T(C.RIFF, 'Shrink it: describe something huge (the internet, the ocean) as if it were tiny and domestic, like a messy kitchen drawer.'),
  T(C.RIFF, 'Write the joke in the voice of your strictest teacher, then of a sports commentator. Character voices unlock new angles.'),
  T(C.RIFF, 'Set a 3-minute timer and don\'t lift the pen. Editing while generating is how blank pages stay blank.'),
  T(C.RIFF, 'The "yes, and" rule from improv works on paper: accept your last silly line as true and build on it instead of starting over.'),
  T(C.RIFF, 'Find the "game" of a bit: the one unusual thing. Then play it again with higher stakes, and once more with the highest.'),
  T(C.RIFF, 'Try act-outs on paper: write what the person in your story would actually say, in quotes. Dialogue is funnier than description.'),
  T(C.RIFF, 'Collide two of today\'s headlines. Write what happens if the story from one happens inside the other.'),

  // ---- Quick wit -------------------------------------------------------------------
  T(C.WIT, 'Quick wit is mostly listening. In your next conversation, look for the one word you could take literally. That\'s your opening.'),
  T(C.WIT, 'Have a few all-purpose comebacks ready. Being prepared isn\'t cheating; it frees your brain to notice the real opportunity.'),
  T(C.WIT, 'Agreeing too much is a reliable quick laugh. Someone says "this weather is bad", and you treat it as the end of civilisation.'),
  T(C.WIT, 'When a joke flops in conversation, comment on the flop. "That was better in my head" usually gets the laugh the joke didn\'t.'),
  T(C.WIT, 'Answer the question that wasn\'t asked. "Did you sleep well?" "Define \'sleep\'." Literal-mindedness is an easy riff engine.'),
  T(C.WIT, 'Callback in real life: bring back something funny from earlier in the same conversation. People love being "in" on a joke.'),
  T(C.WIT, 'Speed matters less than you think. A good line after a two-second pause beats a weak one instantly.'),
  T(C.WIT, 'Teasing works up, not down. Joke about the boss\'s spreadsheet, not the intern\'s accent, and laugh at yourself first.'),
  T(C.WIT, 'Practise "the reframe": take what someone just said and describe it as if it were a much bigger event. "So it\'s war, then."'),
  T(C.WIT, 'Notice your first funny thought in a meeting and write it down. Saying it isn\'t the point yet; noticing it is the muscle.'),

  // ---- Delivery --------------------------------------------------------------------
  T(C.DELIVERY, 'Pause right before the punchline, about half a second. It lets the audience lean in and makes the reveal land.'),
  T(C.DELIVERY, 'Don\'t laugh at your own joke before the punch. If you must, laugh after; your laugh can give them permission.'),
  T(C.DELIVERY, 'Slow down. Nerves make everyone talk 20% faster. Aim for about 150 words a minute, a touch slower than conversation.'),
  T(C.DELIVERY, 'Say the punchline a little louder or a little quieter than the setup. A change in energy flags "this is the bit".'),
  T(C.DELIVERY, 'Stop talking after the punch. Fillers like "yeah" or "so, anyway" straight after a joke step right on the laugh.'),
  T(C.DELIVERY, 'Look at one person when you say the punchline. Delivering to a face is more natural than delivering to a crowd.'),
  T(C.DELIVERY, 'Record yourself telling one joke three ways: deadpan, excited, and annoyed. You\'ll find the attitude the joke wants.'),
  T(C.DELIVERY, 'Deadpan is a choice, not an absence. If you don\'t want to smile, commit fully to the serious face; half-smiles look nervous.'),
  T(C.DELIVERY, 'Replace "um" with a silent breath. Silence feels long to you and confident to the audience.'),
  T(C.DELIVERY, 'Hit the punch word. Underline the one word the whole joke depends on and make sure it\'s the clearest word you say.'),
  T(C.DELIVERY, 'Let the laugh peak before you start the next line. Talking over laughter teaches the room to stop laughing.'),
  T(C.DELIVERY, 'Act it out. If your story has a character, show their face or voice for one line instead of describing them.'),
  T(C.DELIVERY, 'Your first line sets the tempo. Rehearse your opener until you could say it half-asleep; everything after settles to it.'),
  T(C.DELIVERY, 'Stand still for the punch. Wandering or fidgeting at the key moment pulls eyes away from your face.'),
  T(C.DELIVERY, 'If a joke dies, don\'t apologise. Keep the energy, move on, or call it out lightly. The room follows your confidence.'),

  // ---- Habit -----------------------------------------------------------------------
  T(C.HABIT, 'Carry a joke notebook (or notes app). Write down anything odd within ten seconds of noticing it; memory deletes premises fast.'),
  T(C.HABIT, 'Ten minutes a day beats two hours on Sunday. Comedy writing is a muscle that likes small, frequent reps.'),
  T(C.HABIT, 'End each session by writing tomorrow\'s first premise. Starting is the hardest part; leave yourself a ramp.'),
  T(C.HABIT, 'Keep your streak honest but kind: on a busy day, one tiny rep counts. A short rep keeps the habit alive.'),
  T(C.HABIT, 'Study one joke you love each week. Write out its setup, assumption and reveal. Copying structure is how everyone learns.'),
  T(C.HABIT, 'Watch a stand-up special with the sound on and your eyes closed. You\'ll hear rhythm, pauses and emphasis you normally miss.'),
  T(C.HABIT, 'Transcribe two minutes of a comedian you like, word for word. You\'ll be surprised how few words the jokes actually use.'),
  T(C.HABIT, 'Review your joke bank on Fridays. Star the three best of the week; those are your set list.'),
  T(C.HABIT, 'Write at the same time every day. The brain warms up faster when it knows when the rep is coming.'),
  T(C.HABIT, 'Track which of your jokes get laughs from real people. Data beats your own taste, especially early on.'),
  T(C.HABIT, 'Read your jokes out loud every time. Written-funny and spoken-funny are different, and you\'re training for spoken.'),
  T(C.HABIT, 'Swap jokes with a friend. Giving notes on someone else\'s joke is the fastest way to see the problems in yours.'),

  // ---- Mindset ---------------------------------------------------------------------
  T(C.MINDSET, '"Not funny" usually means "not practised". Nobody calls themselves bad at piano before their first lesson.'),
  T(C.MINDSET, 'Most professional jokes are rewritten ten or more times. If your first draft is flat, you are doing it right.'),
  T(C.MINDSET, 'Bombing is data. Every joke that dies tells you something precise about the setup, the reveal or the room.'),
  T(C.MINDSET, 'You don\'t need to be the life of the party. Dry, observant people make some of the best writers.'),
  T(C.MINDSET, 'Aim for "that\'s true and I hadn\'t thought of it that way." Truth plus surprise is the core of almost every laugh.'),
  T(C.MINDSET, 'Write jokes for you first. If you find it a little funny, a room might find it very funny. If you don\'t, they won\'t.'),
  T(C.MINDSET, 'Embrace being boring on stage. A calm, ordinary persona makes a surprising line hit harder than manic energy does.'),
  T(C.MINDSET, 'Steal structures, never jokes. The rule of three is everyone\'s; somebody else\'s punchline is not.'),
  T(C.MINDSET, 'Compare yourself to your jokes from last month, not to comedians with twenty years on you.'),
  T(C.MINDSET, 'Be kind in your jokes about other people. Comedy that punches down gets cheap laughs and loses rooms.'),
  T(C.MINDSET, 'Your weird specific life is your edge. The bit only you could write is worth more than the bit anyone could.'),
  T(C.MINDSET, 'Curiosity beats cleverness. Asking "why is that like that?" out loud produces more jokes than trying to be clever.'),

  // ---- Audience --------------------------------------------------------------------
  T(C.AUDIENCE, 'Know the room. A joke about pensions kills at a retirement party and dies at a student bar. Pick references they live.'),
  T(C.AUDIENCE, 'The audience needs to know what you are talking about in the first sentence. Confusion uses up the attention a laugh needs.'),
  T(C.AUDIENCE, 'People laugh more when they like you. Open with something a little self-deprecating so they relax.'),
  T(C.AUDIENCE, 'If a joke needs the audience to agree with a premise first, earn the agreement with an obviously true detail.'),
  T(C.AUDIENCE, 'Small rooms laugh less loudly but no less. Judge a joke by smiles and nods, not by volume.'),
  T(C.AUDIENCE, 'Try a new joke between two proven ones. If it misses, the next sure thing carries the room back.'),
  T(C.AUDIENCE, 'Toasts and speeches follow the same rules: one specific story, one callback, end on the laugh, sit down.'),
  T(C.AUDIENCE, 'In a group chat, a photo plus a one-line caption is the purest setup-punch format. The photo is the setup.'),
  T(C.AUDIENCE, 'Silence is not hate. Rooms often need two or three jokes before they trust you enough to laugh out loud.'),
  T(C.AUDIENCE, 'The more an audience recognises itself in a joke, the bigger the laugh. "We all do this" beats "I did this once".'),
]

/** The tip for a calendar day (local date), stable all day, cycling through every tip. */
export function tipForDate(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  // Step 37 (prime) so consecutive days jump between categories; while the list length is not a
  // multiple of 37, every tip appears exactly once per cycle.
  const index = (((dayNumber * 37) % TIPS.length) + TIPS.length) % TIPS.length
  return { ...TIPS[index], index, total: TIPS.length }
}
