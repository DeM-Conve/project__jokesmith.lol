import { Fragment } from 'react'

/** Renders lesson copy with **bold** and *italic* and keeps line breaks. */
export default function Rich({ children }) {
  const text = String(children ?? '')
  const lines = text.split('\n')
  return lines.map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text)' }}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
        return <Fragment key={i}>{part}</Fragment>
      })}
    </Fragment>
  ))
}
