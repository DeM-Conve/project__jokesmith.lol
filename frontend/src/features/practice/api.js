import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client.js'

// Query keys: riff / associate / banter, all under the practice feature.
export const practiceKeys = {
  riffDay: (date) => ['riff', 'day', date],
  riffPicks: (date) => ['riff', 'picks', date],
  riffArchive: (today) => ['riff', 'archive', today],
  topics: ['associate', 'topics'],
  banterSetup: ['banter', 'setup'],
}

// Practice reps change streaks and XP, which the progress feature shows.
const refreshProgress = (qc) => qc.invalidateQueries({ queryKey: ['progress'] })

// ---------------------------------------------------------------- daily riff

/** { date, number, setup, sessions, punchlines[{id,text}], bestJokeId, modelPunchlines|null } */
export function useRiffDayQuery(date) {
  return useQuery({
    queryKey: practiceKeys.riffDay(date),
    queryFn: () => api.get(`/practice/riff/days/${date}`).then((r) => r.data),
  })
}

/** Everyone's best pick for the day: [{ handle, punchline, mine }] */
export function useRiffPicksQuery(date, enabled = true) {
  return useQuery({
    queryKey: practiceKeys.riffPicks(date),
    queryFn: () => api.get(`/practice/riff/days/${date}/picks`).then((r) => r.data),
    enabled,
  })
}

/** Past days before `today`: [{ date, number, setup, riffed }] */
export function useRiffArchiveQuery(today, enabled = true) {
  return useQuery({
    queryKey: practiceKeys.riffArchive(today),
    queryFn: () => api.get(`/practice/riff/archive?today=${today}&limit=60`).then((r) => r.data),
    enabled,
  })
}

/** Finish a riff: { punchlines[], secondsUsed } -> { day, saved, xp, skill } */
export function useSubmitRiffMutation(date) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post(`/practice/riff/days/${date}`, body).then((r) => r.data),
    onSuccess: (res) => {
      qc.setQueryData(practiceKeys.riffDay(date), res.day)
      qc.invalidateQueries({ queryKey: ['riff', 'archive'] })
      refreshProgress(qc)
    },
  })
}

export function usePickBestMutation(date) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jokeId) => api.put(`/practice/riff/days/${date}/best`, { jokeId }).then((r) => r.data),
    onSuccess: (day) => {
      qc.setQueryData(practiceKeys.riffDay(date), day)
      qc.invalidateQueries({ queryKey: practiceKeys.riffPicks(date) })
    },
  })
}

// ------------------------------------------------------- association mapper

/** { topics[], categories[{key,label,hint}], tips[] } */
export function useTopicsQuery() {
  return useQuery({
    queryKey: practiceKeys.topics,
    queryFn: () => api.get('/practice/associate/topics').then((r) => r.data),
    staleTime: Infinity,
  })
}

/** Save the brainstorm: { topic, items[{category,text}] } -> map */
export function useStartMapMutation() {
  return useMutation({
    mutationFn: (body) => api.post('/practice/associate/sessions', body).then((r) => r.data),
  })
}

/** Re-roll collisions for a map. */
export function useShuffleMutation(id) {
  return useMutation({
    mutationFn: (shuffle) => api.get(`/practice/associate/sessions/${id}?shuffle=${shuffle}`).then((r) => r.data),
  })
}

/** Adopt a suggested association into the map. */
export function useAddItemMutation(id) {
  return useMutation({
    mutationFn: (item) => api.post(`/practice/associate/sessions/${id}/items`, item).then((r) => r.data),
  })
}

/** { a, b, setup?, punchline } -> { jokeId, xp, jokes } */
export function useCollisionJokeMutation(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post(`/practice/associate/sessions/${id}/jokes`, body).then((r) => r.data),
    onSuccess: () => refreshProgress(qc),
  })
}

// ---------------------------------------------------------- banter simulator

/** { personas[{key,label,description,lines}], techniques[], timers[], rounds } */
export function useBanterSetupQuery() {
  return useQuery({
    queryKey: practiceKeys.banterSetup,
    queryFn: () => api.get('/practice/banter/setup').then((r) => r.data),
    staleTime: Infinity,
  })
}

/** { persona, secondsLimit } -> session { id, persona, secondsLimit, rounds[{roundNo,line,result}], complete, xp } */
export function useStartBanterMutation() {
  return useMutation({
    mutationFn: (body) => api.post('/practice/banter/sessions', body).then((r) => r.data),
  })
}

export function useBanterReplyMutation(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roundNo, reply, responseMs }) =>
      api.post(`/practice/banter/sessions/${id}/rounds/${roundNo}/reply`, { reply, responseMs }).then((r) => r.data),
    onSuccess: (s) => {
      if (s.complete) refreshProgress(qc)
    },
  })
}

export function useSelfRatingMutation(id) {
  return useMutation({
    mutationFn: ({ roundNo, rating }) =>
      api.put(`/practice/banter/sessions/${id}/rounds/${roundNo}/self-rating`, { rating }).then((r) => r.data),
  })
}
