import { Box, Text } from '@mantine/core'
import classes from '../learn.module.css'

/** The spotlighted panel every learn screen puts its hero content on. */
export default function Stage({ children, ...rest }) {
  return (
    <Box className={classes.stage} {...rest}>
      {children}
    </Box>
  )
}

export function Eyebrow({ children, c = 'var(--accent)' }) {
  return (
    <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c={c}>
      {children}
    </Text>
  )
}
