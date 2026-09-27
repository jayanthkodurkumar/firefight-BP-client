const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return dateTimeFormatter.format(date)
}

export function formatUnitLocation(unit: {
  unit_id: string
  site_id: string
  site_name: string | null
}): string {
  const site = unit.site_name ?? unit.site_id
  return `${unit.unit_id} · ${site}`
}
