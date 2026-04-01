// Shared color palette — self-contained like The Board
export const C = {
  bg: '#faf6f0',
  card: 'rgba(255,255,255,0.75)',
  cardBorder: 'rgba(180,155,120,0.13)',
  accent: '#b7522f',
  accentSoft: 'rgba(183,82,47,0.10)',
  gold: '#c8943a',
  goldSoft: 'rgba(200,148,58,0.10)',
  text1: '#2e2418',
  text2: '#6b5d4e',
  text3: '#a39580',
  text4: '#c4b8a6',
  divider: 'rgba(180,155,120,0.10)',
  avatarBg: '#efe7da',
  ring: 'linear-gradient(135deg, #b7522f 0%, #c8943a 100%)',
}

// Stagger animation helper
export const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay },
})

// Star rating hints
export const HINTS = ['', 'Not great', 'It was okay', 'Good spot', 'Really liked it', 'Loved it']

export interface BreweryStats {
  visit_count: number
  total_time_formatted: string
  most_ordered_beer: { name: string; count: number } | null
  visitor_rank: number
  total_visitors: number
}

export function formatDuration(startedAt: string, endedAt?: string | null) {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function formatSessionDate(startedAt: string, endedAt?: string | null) {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const dayStr = start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${dayStr} · ${startTime} – ${endTime}`
}

export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
