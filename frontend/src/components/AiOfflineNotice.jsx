import { Alert } from '@mantine/core'
import { Sparkles } from 'lucide-react'
import { useMeQuery } from '../api/me.js'

/** Shown by AI-powered pages when the backend has no ANTHROPIC_API_KEY. */
export default function AiOfflineNotice() {
  const { data } = useMeQuery()
  if (!data || data.aiAvailable) return null
  return (
    <Alert variant="light" color="gray" icon={<Sparkles size={16} />} mb="md">
      The AI coach is offline (no API key on the server), so you're getting the built-in rule-based coach instead.
    </Alert>
  )
}
