import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client.js'

/** The browser's IANA zone; days and streaks are counted in it. */
export function userTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export const progressKeys = {
  all: ['progress'],
  today: (tz) => ['progress', 'today', tz],
  radar: (tz) => ['progress', 'radar', tz],
  bank: ['progress', 'delivery', 'jokes'],
  takes: ['progress', 'delivery', 'takes'],
}

/** { newUser, streak, todayXp, dailyGoal, todayReps, totalXp, rank, plan[] } */
export function useTodayQuery() {
  const tz = userTimeZone()
  return useQuery({
    queryKey: progressKeys.today(tz),
    queryFn: () => api.get('/progress/today', { params: { tz } }).then((r) => r.data),
  })
}

/** { skills[], totalXp, totalReps, jokesWritten, rank, streak, days[] } */
export function useRadarQuery() {
  const tz = userTimeZone()
  return useQuery({
    queryKey: progressKeys.radar(tz),
    queryFn: () => api.get('/progress/radar', { params: { tz } }).then((r) => r.data),
  })
}

/** The user's joke bank, newest first, for the Delivery Lab picker. */
export function useDeliveryJokesQuery() {
  return useQuery({
    queryKey: progressKeys.bank,
    queryFn: () => api.get('/progress/delivery/jokes').then((r) => r.data),
  })
}

export function useDeliveryTakesQuery() {
  return useQuery({
    queryKey: progressKeys.takes,
    queryFn: () => api.get('/progress/delivery/takes').then((r) => r.data),
  })
}

/** Saves a take's metrics (never audio) and earns DELIVERY xp. */
export function useSaveTakeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/progress/delivery/takes', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: progressKeys.all }),
  })
}
