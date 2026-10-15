import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client.js'

export const meKey = ['me']

/** { id, handle, aiAvailable } - the anonymous-first identity (pid cookie). */
export function useMeQuery() {
  return useQuery({ queryKey: meKey, queryFn: () => api.get('/me').then((r) => r.data), staleTime: Infinity })
}

export function useRenameMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (handle) => api.put('/me', { handle }).then((r) => r.data),
    onSuccess: (me) => qc.setQueryData(meKey, me),
  })
}
