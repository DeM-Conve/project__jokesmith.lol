import { Alert, Button, Grid, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/PageHeader.jsx'
import { useRadarQuery } from './api.js'
import RadarChart from './charts/RadarChart.jsx'
import RepsBars from './charts/RepsBars.jsx'
import StreakHeatmap from './charts/StreakHeatmap.jsx'
import { SKILL_BY_KEY } from './data/skills.js'
import RankLadder from './radar/RankLadder.jsx'
import SkillList from './radar/SkillList.jsx'
import StatTiles from './radar/StatTiles.jsx'

const REPS_DAYS = 30

function Panel({ title, subtitle, children }) {
  return (
    <Paper p="lg" radius="lg" h="100%" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Title order={2} mb={subtitle ? 2 : 'sm'}>
        {title}
      </Title>
      {subtitle && (
        <Text fz="sm" c="dimmed" mb="md">
          {subtitle}
        </Text>
      )}
      {children}
    </Paper>
  )
}

/** The weakest skill with a hint where to train it. */
function weakest(skills) {
  return [...skills].sort((a, b) => a.level - b.level || a.xp - b.xp)[0]
}

export default function ProgressPage() {
  const { data: radar, isPending, isError, refetch } = useRadarQuery()
  const skills = radar?.skills.map((s) => ({ ...SKILL_BY_KEY[s.skill], ...s, key: s.skill })) ?? []
  const fresh = radar && radar.totalReps === 0
  const low = skills.length ? weakest(skills) : null

  return (
    <Stack gap={0} maw={1100}>
      <PageHeader
        eyebrow="Progress"
        title="Funny Radar"
        description="Nine skills make a comedian. Every rep you do grows one of them; the first reps count the most."
      />

      {isPending && <Skeleton h={420} radius="lg" />}
      {isError && (
        <Alert color="red" variant="light" title="Couldn't load your radar">
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Alert>
      )}

      {radar && (
        <>
          {fresh && (
            <Alert variant="light" color="amber" icon={<Sparkles size={16} />} mb="lg" title="Your radar is a blank stage">
              <Text fz="sm" mb="xs">
                Every drill, riff and lesson lights up a skill here. Do one rep and watch the shape start to grow.
              </Text>
              <Button component={Link} to="/" size="xs">
                See today's set
              </Button>
            </Alert>
          )}
          {!fresh && <StatTiles radar={radar} />}

          <Grid gutter="md" mb="md">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Panel
                title="Skill radar"
                subtitle={low && !fresh ? `Quietest skill: ${low.label}. A couple of reps there will move the shape most.` : null}
              >
                <RadarChart skills={skills} />
              </Panel>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Panel title="Skills">
                <SkillList skills={skills} />
              </Panel>
            </Grid.Col>
          </Grid>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                <Panel title="Streak calendar" subtitle={`Current streak ${radar.streak.current} · best ${radar.streak.best}`}>
                  <StreakHeatmap days={radar.days} />
                </Panel>
                <Panel title="Reps per day" subtitle={`The last ${REPS_DAYS} days`}>
                  <RepsBars days={radar.days.slice(-REPS_DAYS)} />
                </Panel>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <RankLadder rank={radar.rank} ladder={radar.ladder} totalXp={radar.totalXp} />
            </Grid.Col>
          </Grid>
        </>
      )}
    </Stack>
  )
}
