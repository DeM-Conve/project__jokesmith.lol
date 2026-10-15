import { Anchor, Text } from '@mantine/core'
import { ExternalLink } from 'lucide-react'

/**
 * "— Comedian, Source" under a famous joke, linking to the page that verifies the wording.
 * Accepts either a credit object ({ comedian, source, sourceUrl, translation }) or the same
 * fields spread on a lesson example.
 */
export default function Credit({ credit, size = 'sm', withTranslation = true }) {
  if (!credit?.comedian) return null
  const label = credit.source ? `${credit.comedian}, ${credit.source}` : credit.comedian
  return (
    <>
      {withTranslation && credit.translation && (
        <Text fz={size} c="dimmed" fs="italic">
          “{credit.translation}”
        </Text>
      )}
      <Text fz={size} c="var(--text-muted)" data-testid="credit">
        —{' '}
        {credit.sourceUrl ? (
          <Anchor
            href={credit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            c="var(--text-muted)"
            underline="hover"
            onClick={(e) => e.stopPropagation()}
          >
            {label} <ExternalLink size={11} style={{ verticalAlign: 'baseline' }} aria-hidden />
          </Anchor>
        ) : (
          label
        )}
      </Text>
    </>
  )
}

/** Plain-text attribution for places where a link would be nested inside a button. */
export function creditLabel(credit) {
  if (!credit?.comedian) return ''
  return credit.source ? `${credit.comedian}, ${credit.source}` : credit.comedian
}
