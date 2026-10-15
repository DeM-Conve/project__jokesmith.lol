import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client.js'

// TanStack Query hooks for /api/learn/**. Components never call axios directly.
const get = (url, params) => api.get(url, params ? { params } : undefined).then((r) => r.data)
const post = (url, body) => api.post(url, body).then((r) => r.data)

export const learnKeys = {
  progress: ['learn', 'progress'],
  gallery: ['learn', 'xray', 'gallery'],
  xrayHistory: ['learn', 'xray', 'history'],
  gym: ['learn', 'gym'],
  gymStats: ['learn', 'gym', 'stats'],
  premise: (formula, n) => ['learn', 'gym', 'premise', formula, n],
}

/** { lessons: [{skill, bestQuizCorrect, quizTotal, timesCompleted, ...}], completedCount, totalLessons, xrayCount, gymReps } */
export function useLearnProgressQuery() {
  return useQuery({ queryKey: learnKeys.progress, queryFn: () => get('/learn/progress') })
}

export function useCompleteLessonMutation(skill) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => post(`/learn/lessons/${skill}/complete`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: learnKeys.progress }),
  })
}

export function useXRayMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text) => post('/learn/xray', { text }),
    onSuccess: () => qc.invalidateQueries({ queryKey: learnKeys.xrayHistory }),
  })
}

export function useAnnotateMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => post('/learn/xray/annotate', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: learnKeys.xrayHistory }),
  })
}

export function useGalleryQuery() {
  return useQuery({ queryKey: learnKeys.gallery, queryFn: () => get('/learn/xray/gallery'), staleTime: Infinity })
}

export function useXRayHistoryQuery() {
  return useQuery({ queryKey: learnKeys.xrayHistory, queryFn: () => get('/learn/xray/history') })
}

/** { formulas: [...], premiseCount } */
export function useGymQuery() {
  return useQuery({ queryKey: learnKeys.gym, queryFn: () => get('/learn/gym'), staleTime: Infinity })
}

/** A random premise; bump `n` to draw a new one. */
export function usePremiseQuery(formula, n, exclude) {
  return useQuery({
    queryKey: learnKeys.premise(formula, n),
    queryFn: () => get('/learn/gym/premise', exclude ? { exclude } : undefined),
    enabled: Boolean(formula),
    staleTime: Infinity,
  })
}

export function useGymAttemptMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => post('/learn/gym/attempts', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: learnKeys.gymStats }),
  })
}

export function useGymStatsQuery() {
  return useQuery({ queryKey: learnKeys.gymStats, queryFn: () => get('/learn/gym/stats') })
}
