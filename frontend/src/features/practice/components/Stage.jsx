import { Box, Text } from '@mantine/core'
import classes from '../practice.module.css'

/** The spotlit card the setup line sits in: the hero of every practice screen. */
export function Stage({ children, p = 'xl', ...rest }) {
  return (
    <Box className={classes.stage} p={p} {...rest}>
      {children}
    </Box>
  )
}

/** A setup / line in the display face. */
export function SetupLine({ children, fz = '3xl', ...rest }) {
  return (
    <Text className={classes.setup} fz={fz} {...rest}>
      {children}
    </Text>
  )
}

/** Small uppercase label used above stage content. */
export function Eyebrow({ children, c = 'var(--text-faint)', ...rest }) {
  return (
    <Text fz="2xs" fw={600} tt="uppercase" lts={1.2} c={c} {...rest}>
      {children}
    </Text>
  )
}
