import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client.js'

// Query keys: punchup / arena / notebook, all under the workshop feature.
export const workshopKeys = {
  jokes: (filter) => ['notebook', 'jokes', filter ?? {}],
  allJokes: ['notebook', 'jokes'],
  tags: ['notebook', 'tags'],
  bits: ['notebook', 'bits'],
  callbacks: (jokeId) => ['notebook', 'callbacks', jokeId ?? 'all'],
  session: (id) => ['punchup', 'session', id],
  recent: ['punchup', 'recent'],
  pair: (samePrompt) => ['arena', 'pair', samePrompt],
  leaderboard: (period) => ['arena', 'leaderboard', period],
  mine: ['arena', 'mine'],
}

const data = (r) => r.data
// Reps change streaks and XP, which the progress feature shows.
const refreshProgress = (qc) => qc.invalidateQueries({ queryKey: ['progress'] })
const refreshNotebook = (qc) => {
  qc.invalidateQueries({ queryKey: ['notebook'] })
  qc.invalidateQueries({ queryKey: workshopKeys.mine })
}

function params(filter = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(filter)) if (v !== undefined && v !== null && v !== '') p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

// ---------------------------------------------------------------- notebook

/** [{ id, setup, punchline, source, promptRef, createdAt, favourite, tags[], inArena, rating, votes, winRate }] */
export function useJokesQuery(filter) {
  return useQuery({ queryKey: workshopKeys.jokes(filter), queryFn: () => api.get(`/workshop/jokes${params(filter)}`).then(data) })
}

export function useTagsQuery() {
  return useQuery({ queryKey: workshopKeys.tags, queryFn: () => api.get('/workshop/tags').then(data) })
}

export function useSaveJokeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => (id ? api.put(`/workshop/jokes/${id}`, body) : api.post('/workshop/jokes', body)).then(data),
    onSuccess: () => refreshNotebook(qc),
  })
}

export function useDeleteJokeMutation() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id) => api.delete(`/workshop/jokes/${id}`), onSuccess: () => refreshNotebook(qc) })
}

export function useFavouriteMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, favourite }) => api.put(`/workshop/jokes/${id}/favourite`, { favourite }).then(data),
    onSuccess: () => refreshNotebook(qc),
  })
}

export function useJokeTagsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tags }) => api.put(`/workshop/jokes/${id}/tags`, { tags }).then(data),
    onSuccess: () => refreshNotebook(qc),
  })
}

export function useArenaEntryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, inArena }) => api.put(`/workshop/jokes/${id}/arena`, { inArena }).then(data),
    onSuccess: () => {
      refreshNotebook(qc)
      qc.invalidateQueries({ queryKey: ['punchup'] })
    },
  })
}

/** [{ a: {id,setup,punchline}, b, sharedWords[], score, hint }] */
export function useCallbacksQuery(jokeId, enabled = true) {
  return useQuery({
    queryKey: workshopKeys.callbacks(jokeId),
    queryFn: () => api.get(`/workshop/callbacks${params({ jokeId })}`).then(data),
    enabled,
  })
}

/** [{ id, title, createdAt, jokes: [notebook joke] }] */
export function useBitsQuery() {
  return useQuery({ queryKey: workshopKeys.bits, queryFn: () => api.get('/workshop/bits').then(data) })
}

export function useCreateBitMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/workshop/bits', body).then(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.bits }),
  })
}

export function useRenameBitMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }) => api.put(`/workshop/bits/${id}`, { title }).then(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.bits }),
  })
}

export function useDeleteBitMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/workshop/bits/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.bits }),
  })
}

/** Sets a bit's jokes in order: add, remove and reorder are all this call. Optimistic. */
export function useBitJokesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, jokeIds }) => api.put(`/workshop/bits/${id}/jokes`, { jokeIds }).then(data),
    onSuccess: (bit) =>
      qc.setQueryData(workshopKeys.bits, (bits) => (bits ? bits.map((b) => (b.id === bit.id ? bit : b)) : bits)),
  })
}

// ---------------------------------------------------------------- punch-up

export function usePunchUpSessionQuery(id) {
  return useQuery({
    queryKey: workshopKeys.session(id),
    queryFn: () => api.get(`/workshop/punchup/${id}`).then(data),
    enabled: id != null,
  })
}

export function useRecentPunchUpsQuery() {
  return useQuery({ queryKey: workshopKeys.recent, queryFn: () => api.get('/workshop/punchup').then(data) })
}

export function useStartPunchUpMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/workshop/punchup', body).then(data),
    onSuccess: (s) => {
      qc.setQueryData(workshopKeys.session(s.id), s)
      qc.invalidateQueries({ queryKey: workshopKeys.recent })
      qc.invalidateQueries({ queryKey: ['notebook'] })
    },
  })
}

export function useRewriteMutation(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post(`/workshop/punchup/${id}/rewrites`, body).then(data),
    onSuccess: (s) => {
      qc.setQueryData(workshopKeys.session(id), s)
      qc.removeQueries({ queryKey: ['punchup', 'moves', id] })
      qc.invalidateQueries({ queryKey: workshopKeys.recent })
      qc.invalidateQueries({ queryKey: ['notebook'] })
      refreshProgress(qc)
    },
  })
}

/** { jokeId, moves: [{ fix, label, instruction, words[], example }] } - 409 until the first rewrite. */
export function useMovesQuery(id, enabled) {
  return useQuery({
    queryKey: ['punchup', 'moves', id],
    queryFn: () => api.get(`/workshop/punchup/${id}/moves`).then(data),
    enabled: enabled && id != null,
  })
}

export function useSendPunchUpToArenaMutation(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post(`/workshop/punchup/${id}/arena`).then(data),
    onSuccess: (s) => {
      qc.setQueryData(workshopKeys.session(id), s)
      refreshNotebook(qc)
    },
  })
}

// ---------------------------------------------------------------- arena

/** { left, right, promptLabel, samePrompt, votesCast, nextXpIn } - left/right null when exhausted. */
export function usePairQuery(samePrompt) {
  return useQuery({
    queryKey: workshopKeys.pair(samePrompt),
    queryFn: () => api.get(`/workshop/arena/pair${params({ samePrompt })}`).then(data),
    staleTime: Infinity,
  })
}

export function useVoteMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/workshop/arena/votes', body).then(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['arena', 'leaderboard'] })
      if (res.xpAwarded) refreshProgress(qc)
    },
  })
}

/** { period, jokes: [{rank, jokeId, setup, punchline, handle, house, mine, rating, wins, losses, gained}], writers } */
export function useLeaderboardQuery(period) {
  return useQuery({
    queryKey: workshopKeys.leaderboard(period),
    queryFn: () => api.get(`/workshop/arena/leaderboard${params({ period })}`).then(data),
  })
}

/** { writerRating, writerRank, votesCast, nextXpIn, jokes: [{jokeId, ..., inArena, rating, wins, losses, votes, winRate}] } */
export function useMyArenaQuery(enabled = true) {
  return useQuery({ queryKey: workshopKeys.mine, queryFn: () => api.get('/workshop/arena/mine').then(data), enabled })
}

/** The server's ProblemDetail message, for notifications. */
export function errorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.detail ?? err?.message ?? fallback
}
