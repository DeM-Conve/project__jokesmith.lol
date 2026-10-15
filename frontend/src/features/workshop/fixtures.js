// Shared test fixtures for the workshop feature.
export const example = (fix) => ({
  fix,
  before: { setup: 'I asked my speaker to play something relaxing.', punchline: 'And then it went and turned off the news for me.' },
  after: { setup: 'I asked my speaker to play something relaxing.', punchline: 'It turned off the news.' },
  note: "'For me' is a weak ending. 'News' is the surprise, so it goes last.",
})

export function analysis({ score = 58, flags, words = 18 } = {}) {
  return {
    metrics: {
      words, setupWords: 9, punchWords: 9, fillers: ['really', 'just'], fillerWords: 2, punchWord: 'news',
      wordsAfterPunch: 2, lastWord: 'me', weakEnding: true, genericNouns: [], listItems: 0, cutTarget: 2, score,
    },
    flags: flags ?? [
      {
        fix: 'END_ON_PUNCH', label: 'End on a strong word', severity: 'HIGH',
        finding: "It ends on 'me'. The last word is where the laugh lands.",
        question: "What's the most surprising word in your punchline? Can the sentence end right there?",
        words: ['for', 'me'], example: example('END_ON_PUNCH'),
      },
      {
        fix: 'CUT_FILLER', label: 'Cut the filler', severity: 'MEDIUM', finding: "2 filler words: 'really', 'just'.",
        question: 'Read it aloud without them. Did you lose anything at all?', words: ['really', 'just'], example: example('CUT_FILLER'),
      },
    ],
    strengths: ['No filler words.'],
  }
}

export const v1 = {
  jokeId: 11, number: 1, setup: 'I asked my speaker to play something really relaxing.',
  punchline: 'And then it just turned off the news for me.', createdAt: '2026-10-15T10:00:00Z', analysis: analysis(),
}

export const v2 = {
  jokeId: 12, number: 2, setup: 'I asked my speaker to play something relaxing.', punchline: 'It turned off the news.',
  createdAt: '2026-10-15T10:01:00Z', analysis: analysis({ score: 92, flags: [], words: 12 }),
}

export const critique = {
  wordsBefore: 18, wordsAfter: 12, punchWordBefore: 'news', afterPunchBefore: 2, punchWordAfter: 'news', afterPunchAfter: 0,
  scoreBefore: 58, scoreAfter: 92, fillersCut: ['really', 'just'], fixed: ['END_ON_PUNCH', 'CUT_FILLER'], remaining: [],
  introduced: [], notes: ["Now ends on 'news' instead of 'me'. The laugh has somewhere to land."],
  verdict: 'Clean. No flags left. Send it to the Arena and find out what strangers think.',
  diff: [
    { text: 'And', op: 'REMOVED' }, { text: 'It', op: 'SAME' }, { text: 'turned', op: 'SAME' }, { text: 'off', op: 'SAME' },
    { text: 'the', op: 'SAME' }, { text: 'news', op: 'SAME' }, { text: 'for', op: 'REMOVED' }, { text: 'me', op: 'REMOVED' },
  ],
}

export const note = (id, extra = {}) => ({
  id, setup: `Setup ${id}`, punchline: `Punchline ${id}`, source: 'NOTEBOOK', promptRef: null, createdAt: '2026-10-15T10:00:00Z',
  favourite: false, tags: [], inArena: false, rating: 1200, votes: 0, winRate: null, ...extra,
})
