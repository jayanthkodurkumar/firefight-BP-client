import { List, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { basePalette } from '../../theme/basePalette'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={4}>
      <Title order={6} c={basePalette.grey100} tt="uppercase" fw={600} lts="0.04em">
        {title}
      </Title>
      {children}
    </Stack>
  )
}

export function FirefightAbout() {
  return (
    <Stack
      gap="md"
      style={{
        maxHeight: '42vh',
        overflowY: 'auto',
        paddingRight: 4,
      }}
    >
      <Section title="Problem">
        <Text size="sm" c={basePalette.grey80} lh={1.55}>
          When a home battery fails in the field, the alert starts a long manual relay.
          A coordinator reads the ticket, guesses severity and priority, and works out
          which team should own it. A technician then digs through raw BMS logs to find
          what went wrong, runs tests, and updates the ticket. Each handoff costs time,
          and a lot of that time goes to working out why the ticket fired at all, while
          a family may be without backup power.
        </Text>
      </Section>

      <Section title="Who it helps">
        <Text size="sm" c={basePalette.grey80} lh={1.55}>
          Field operations engineers and dispatch coordinators at distributed-battery
          companies like Base, who triage failures across thousands of deployed homes.
        </Text>
      </Section>

      <Section title="Solution">
        <Text size="sm" c={basePalette.grey80} lh={1.55} mb={4}>
          Firefight turns BMS telemetry into tickets that are already triaged:
        </Text>
        <List size="sm" spacing={4} c={basePalette.grey80}>
          <List.Item>
            A rules engine flags out-of-range signals and opens a ticket with a DTC,
            severity, and priority.
          </List.Item>
          <List.Item>
            An AI agent adds root cause analysis—real vs sensor fault, cause vs symptoms,
            and fleet patterns such as a single firmware version.
          </List.Item>
          <List.Item>
            Engineers chat on any ticket: which signals failed, why it was raised, whether
            it is happening elsewhere.
          </List.Item>
          <List.Item>
            The agent recommends the right technician by skills, region, on-call status,
            and workload.
          </List.Item>
        </List>
      </Section>

      <Section title="Impact">
        <Text size="sm" c={basePalette.grey80} lh={1.55}>
          Triage that took several people and handoffs becomes one screen and one
          conversation. Critical issues—thermal runaway precursors, homes without
          backup—reach the right technician first. Fleet-wide patterns show up at the
          second ticket instead of the thirtieth. On a simulated 40-home fleet, the
          pipeline caught 29 of 30 planted faults with zero false alarms.
        </Text>
      </Section>

      <Text size="xs" c={basePalette.grey60} fw={600}>
        Tracks: Most Commercializable (primary), Orchestration
      </Text>
    </Stack>
  )
}
