// Delivery Lab coaching copy: one entry per metric outcome (see delivery/analysis.js rate()).
// tone: good | warn | bad. Each outcome has a few variants so repeat takes don't read
// like a broken record; `drill` is one concrete thing to try on the next take.
// {wpm}, {pause}, {fillers}, {punch}, {after} (spoken after the punch) and {tail} (written after
// the punch word) are filled in by coachingFor().

const good = 'good'
const warn = 'warn'
const bad = 'bad'

export const METRIC_LABELS = {
  pause: 'Pause before the punch',
  pace: 'Pace',
  punch: 'Ending on the punch',
  fillers: 'Filler words',
  energy: 'Energy',
  structure: 'How the joke is written',
}

export const COACHING = {
  pause: {
    good: {
      tone: good,
      variants: [
        { headline: 'That pause did its job.', body: 'You held {pause} before the punch. Long enough for the room to lean in, short enough that nobody got bored. That\'s the beat pros rehearse.', drill: 'Keep it. Next take, try the same pause with a tiny look at the audience during it.' },
        { headline: 'Textbook beat.', body: '{pause} of silence right before the reveal. The silence is a drumroll: it tells everyone the important bit is coming.', drill: 'Try one take a touch longer (by a breath) and listen back to which feels more confident.' },
        { headline: 'You let it breathe.', body: 'A {pause} beat before the punch is right in the sweet spot. Most beginners rush this; you didn\'t.', drill: 'Now make the setup slightly quicker so the pause stands out even more by contrast.' },
      ],
    },
    short: {
      tone: warn,
      variants: [
        { headline: 'Almost a pause. Hold it longer.', body: 'There was a {pause} gap before the punch, but it reads as a breath, not a beat. Aim for about half a second.', drill: 'Next take, silently count "one-and" right before the punch word.' },
        { headline: 'The beat is there, just shy.', body: '{pause} before the reveal. It\'s nearly enough; another quarter-second turns a gap into anticipation.', drill: 'Put a comma in your head before the punchline and literally stop on it.' },
      ],
    },
    none: {
      tone: bad,
      variants: [
        { headline: 'You ran straight through the punch.', body: 'No real pause before the punchline, so the reveal arrived in the same breath as the setup. The audience never got the chance to guess wrong.', drill: 'Say the setup, close your mouth, count one, then say the punch. It will feel too slow. It isn\'t.' },
        { headline: 'Give the punch its own moment.', body: 'Setup and punch blurred together. The pause is where the audience builds the wrong assumption you\'re about to break.', drill: 'Record a take where you take a visible breath before the punch line, even if it feels theatrical.' },
        { headline: 'Rushing is the number one delivery killer.', body: 'Nerves make us hurry to the end. The punchline lands better when it isn\'t sprinting.', drill: 'Next take, look up from the script after the setup and only then say the punch.' },
      ],
    },
    long: {
      tone: warn,
      variants: [
        { headline: 'Bold pause. A bit too bold?', body: '{pause} before the punch. Long pauses can work for deadpan, but at this length a room starts wondering if you forgot the line.', drill: 'Try one take at roughly half that pause and compare the two in playback.' },
        { headline: 'Confident, maybe over-cooked.', body: 'A {pause} silence makes the punch feel very deliberate. If that\'s your style, own it with a steady face; otherwise trim it.', drill: 'Hold eye contact through the whole pause next time; a pause with eye contact feels intentional.' },
      ],
    },
    tooLong: {
      tone: bad,
      variants: [
        { headline: 'The pause turned into a gap.', body: '{pause} of silence before the punch. Past about two seconds, the audience stops anticipating and starts worrying.', drill: 'Know the punchline cold before recording, then aim for a one-second beat.' },
        { headline: 'You lost the thread for a moment.', body: 'That {pause} silence reads as hesitation rather than timing. Often it means the punch isn\'t memorised yet.', drill: 'Say just the punchline out loud five times, then do a full take.' },
      ],
    },
  },

  pace: {
    good: {
      tone: good,
      variants: [
        { headline: 'Great pace.', body: '{wpm} words a minute: unhurried and clear, right where stand-ups tend to sit.', drill: 'Keep this tempo and spend your energy on the pause and the punch word.' },
        { headline: 'Easy to follow.', body: 'At {wpm} wpm every word of the setup gets heard, which is what lets the punch surprise.', drill: 'Try speeding up the setup slightly and slowing down the punch; contrast sells it.' },
      ],
    },
    fast: {
      tone: warn,
      variants: [
        { headline: 'A little quick.', body: '{wpm} wpm. Still understandable, but the setup details that make the punch work are flying by.', drill: 'Slow down only the last line of the setup. That\'s the one the punch depends on.' },
        { headline: 'Ease off the gas.', body: 'You\'re at {wpm} wpm. Slowing by 10–15% will make you sound more confident, not less energetic.', drill: 'Next take, imagine talking to someone at the back of a big room.' },
      ],
    },
    tooFast: {
      tone: bad,
      variants: [
        { headline: 'Way too fast.', body: '{wpm} words a minute is nervous-energy territory. At this speed the audience is still decoding the setup when the punch goes past.', drill: 'Read it at half speed once, as if dictating, then do a take at "normal" speed. It\'ll land around the right pace.' },
        { headline: 'Slow down. Really.', body: 'At {wpm} wpm the joke sounds like something you want to get over with. Comedy needs the opposite: you, enjoying it.', drill: 'Put a deliberate breath after every sentence of the setup on the next take.' },
      ],
    },
    slow: {
      tone: warn,
      variants: [
        { headline: 'A touch slow.', body: '{wpm} wpm. Slow can be great for deadpan, but in the setup it gives people time to get ahead of you.', drill: 'Tighten the setup: say it a bit quicker, then keep your pause before the punch exactly the same.' },
        { headline: 'Keep the setup moving.', body: 'At {wpm} wpm the setup drags a little. Speed in the setup makes the stop before the punch feel bigger.', drill: 'Cut one word from the setup and say the rest a bit more briskly.' },
      ],
    },
    tooSlow: {
      tone: bad,
      variants: [
        { headline: 'Too slow to build momentum.', body: '{wpm} words a minute. The joke loses its spring; the audience guesses the end before you get there.', drill: 'Practise the joke from memory without the script, then record. Reading slows everyone down.' },
        { headline: 'Pick up the tempo.', body: 'At {wpm} wpm it sounds like you\'re searching for words. Know the line, then say it like you mean it.', drill: 'Say the setup as if you\'re telling a friend some gossip. Gossip is never slow.' },
      ],
    },
    unknown: {
      tone: warn,
      variants: [
        { headline: 'Couldn\'t measure pace.', body: 'We didn\'t catch enough speech to count words. Check your mic is picking you up and speak at a normal volume.', drill: 'Try again a little closer to the mic.' },
      ],
    },
  },

  punch: {
    last: {
      tone: good,
      variants: [
        { headline: 'You ended on "{punch}".', body: 'The punch word was the last thing out of your mouth. That\'s exactly where the laugh starts, and nothing stepped on it.', drill: 'After the punch, hold still and silent for a beat. Let them laugh.' },
        { headline: 'Clean ending.', body: 'Nothing after "{punch}". Stopping dead on the punch word is a pro habit.', drill: 'Next take, add the slightest lift of your eyebrows on the punch word.' },
      ],
    },
    trailing: {
      tone: bad,
      variants: [
        { headline: 'You kept talking after the punch.', body: 'After "{punch}" you said "{after}". Anything after the punch word steps on the laugh, like explaining the joke while people are still getting it.', drill: 'Say the punch word and close your mouth. Count two in silence.' },
        { headline: 'Stop on the punch word.', body: '"{after}" came after the punch. Little add-ons like "yeah" or "anyway" are nerves leaking out.', drill: 'Smile after the punch instead of speaking. The smile fills the silence for you.' },
      ],
    },
    missing: {
      tone: warn,
      variants: [
        { headline: 'Didn\'t hear the punch word.', body: 'The transcript doesn\'t include "{punch}". Either the speech recogniser misheard, or the punch word got swallowed.', drill: 'Say the punch word clearly and a touch louder than the setup; it should be your clearest word.' },
        { headline: 'Make "{punch}" unmissable.', body: 'We couldn\'t find "{punch}" in what you said. If people can\'t hear the punch word, there\'s no joke.', drill: 'Underline the punch word in your head and hit it like it\'s in bold.' },
      ],
    },
    unknown: {
      tone: warn,
      variants: [
        { headline: 'No transcript this time.', body: 'Your browser doesn\'t support live speech recognition (Chrome and Edge do), so we can\'t check fillers or whether you ended on the punch. Timing and energy still work.', drill: 'Listen back and check yourself: was the punch word the very last thing you said?' },
      ],
    },
  },

  fillers: {
    zero: {
      tone: good,
      variants: [
        { headline: 'No filler words.', body: 'Not a single "um" or "like". Clean speech sounds confident, and confidence is half of being funny.', drill: 'Keep it up. Try the joke from memory next.' },
        { headline: 'Clean take.', body: 'Zero fillers. Every word you said was part of the joke.', drill: 'Now try it faster than feels comfortable; see whether the fillers sneak back in.' },
      ],
    },
    few: {
      tone: warn,
      variants: [
        { headline: 'A couple of fillers.', body: 'We heard {fillers}. One or two is human, but each one blurs the rhythm, especially just before the punch.', drill: 'Wherever you\'d say "um", close your mouth and breathe instead.' },
        { headline: 'Nearly clean.', body: '{fillers} slipped in. Note that "so" and "like" are sometimes real words; if yours were, ignore this.', drill: 'Do a take where you start with the first word of the joke, no "so" warm-up.' },
      ],
    },
    many: {
      tone: bad,
      variants: [
        { headline: 'Fillers are crowding the joke.', body: 'We heard {fillers}. Fillers are the brain buying time; they\'re a sign the joke isn\'t memorised yet.', drill: 'Say the joke five times quickly to yourself, then record it without looking at the text.' },
        { headline: 'Trade the "um"s for silence.', body: '{fillers}. Silence feels long to you but sounds deliberate to an audience. Fillers sound unsure.', drill: 'Next take, every time you feel an "um" coming, pause instead. It\'ll feel weird and sound great.' },
      ],
    },
    unknown: {
      tone: warn,
      variants: [
        { headline: 'Fillers not checked.', body: 'No transcript, so we can\'t count "um"s and "like"s this time.', drill: 'Play the take back and count them yourself; you\'ll hear them instantly.' },
      ],
    },
  },

  energy: {
    good: {
      tone: good,
      variants: [
        { headline: 'Lively voice.', body: 'Your loudness moved around naturally: emphasis in the right places, not one flat line.', drill: 'Try putting the biggest lift (or the biggest drop) right on the punch word.' },
        { headline: 'Nice dynamics.', body: 'There\'s real light and shade in your volume. That variety keeps ears switched on.', drill: 'Experiment: deliver the punch quieter than the setup and see which gets the bigger reaction in playback.' },
      ],
    },
    flat: {
      tone: warn,
      variants: [
        { headline: 'A bit monotone.', body: 'Your volume barely changed. Deadpan can be brilliant, but even deadpan comics shift energy on the punch word.', drill: 'Next take, say the punch word noticeably louder or softer than everything before it.' },
        { headline: 'Give it some shape.', body: 'Steady volume all the way through makes the punch blend into the setup.', drill: 'Record the setup like a news anchor and the punch like you\'re telling a secret.' },
      ],
    },
    spiky: {
      tone: warn,
      variants: [
        { headline: 'Volume jumped around a lot.', body: 'Big swings in loudness can come across as nervous, or it could be the mic picking up bumps. Check your distance from the mic.', drill: 'Keep the setup at one steady level and save your one big change for the punch.' },
        { headline: 'Rein it in a little.', body: 'Lots of loud bursts. Energy is good, but when everything is emphasised, nothing is.', drill: 'Choose a single word to stress in the whole joke: the punch word.' },
      ],
    },
  },

  structure: {
    endsOnPunch: {
      tone: good,
      variants: [
        { headline: 'Well-built joke.', body: 'As written, the joke ends on its punch word ("{punch}"). That\'s the strongest structure: the reveal is the last thing they hear.', drill: null },
      ],
    },
    buried: {
      tone: warn,
      variants: [
        { headline: 'The punch word is buried.', body: 'As written, the joke ends with "{tail}" after the key word "{punch}". Try rewording so "{punch}" (or whatever the real surprise is) comes last.', drill: 'Rewrite the punchline so it ends on the surprise, then take it again.' },
        { headline: 'Move the surprise to the end.', body: 'The joke trails off with "{tail}" after "{punch}". Laughter starts at the reveal, so words after it get talked over or step on the laugh.', drill: 'Flip the sentence order of the punchline so "{punch}" is the final word.' },
      ],
    },
  },
}

/** Whole-take verdict from the 0..100 mic score. */
export const VERDICTS = [
  { min: 85, title: 'Killed.', body: 'That take would get a laugh in a real room. Bank it and move on to a new joke.' },
  { min: 70, title: 'Strong set.', body: 'Solid delivery with one or two things to tighten. One more take with the top note below.' },
  { min: 50, title: 'Getting there.', body: 'The bones are good. Fix the first note below and you\'ll hear the difference straight away.' },
  { min: 30, title: 'Rough draft.', body: 'Every comic\'s first takes sound like this. Pick one note below and only work on that.' },
  { min: 0, title: 'Warm-up take.', body: 'That one was for nerves. Take a breath, know the punchline, go again.' },
]

export const SILENT_TAKE = {
  title: 'We didn\'t hear anything.',
  body: 'The mic picked up almost no sound. Check the right microphone is selected in your browser, move a little closer, and try again.',
}

export function verdictFor(score) {
  return VERDICTS.find((v) => score >= v.min)
}
