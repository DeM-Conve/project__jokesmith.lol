import { Alert, Button, Grid, Skeleton, Stack } from '@mantine/core'
import { Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTodayQuery } from './api.js'
import PageHeader from '../../components/PageHeader.jsx'
import { GreetingTitle, RenameControl } from './today/HandleGreeting.jsx'
import OnboardingHero from './today/OnboardingHero.jsx'
import SetList from './today/SetList.jsx'
import TipCard from './today/TipCard.jsx'
import TodayStats from './today/TodayStats.jsx'

/** Home: "your daily set". Greeting, streak and goal, today's plan, a tip. */
export default function TodayPage() {
  const { data: today, isPending, isError, refetch } = useTodayQuery()

  return (
    <Stack gap={0} maw={1100}>
      <PageHeader
        eyebrow="Your daily set"
        title={<GreetingTitle />}
        description={
          !today
            ? null
            : today.newUser
            ? "You found the comedy gym for people who think they aren't funny. Good news: that's exactly who it's for."
            : "Fifteen minutes of reps a day. Here's tonight's set list, built around the skills that need it most."
        }
        actions={<RenameControl />}
      />

      {isPending && (
        <Stack gap="md">
          <Skeleton h={120} radius="lg" />
          <Skeleton h={280} radius="lg" />
        </Stack>
      )}

      {isError && (
        <Alert color="red" variant="light" title="Couldn't load today's set" mb="lg">
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Alert>
      )}

      {today && (
        <>
          {today.newUser ? (
            <OnboardingHero lessonRoute={today.plan.find((p) => p.kind === 'LESSON')?.route ?? '/learn'} />
          ) : (
            <TodayStats today={today} />
          )}
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <SetList plan={today.plan} newUser={today.newUser} primaryTaken={today.newUser} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap="md" h="100%">
                <TipCard />
                {!today.newUser && (
                  <Button variant="subtle" color="gray" component={Link} to="/progress" leftSection={<Gauge size={16} />}>
                    See your Funny Radar
                  </Button>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Stack>
  )
}
