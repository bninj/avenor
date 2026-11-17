// Avenor mark: a location pin and a house drawn as one shape, with a brass door.
const PIN = 'M32 59 15.5 41.6A4 4 0 0 1 14.4 38.8V27.4a4 4 0 0 1 1.5-3.1L29.5 13.2a4 4 0 0 1 5 0l13.6 11.1a4 4 0 0 1 1.5 3.1v11.4a4 4 0 0 1-1.1 2.8z'
const DOOR = 'M28.5 41V33.5a3.5 3.5 0 0 1 7 0V41z'

export function Mark({ size = 28, tone = 'brand' }: { size?: number; tone?: 'brand' | 'light' }) {
  return (
    <svg width={size} height={size} viewBox="12 10 40 50" aria-hidden="true">
      <path d={PIN} fill={tone === 'light' ? '#EEF4F1' : '#123F3B'} />
      <path d={DOOR} fill={tone === 'light' ? '#E2C48A' : '#C79B4E'} />
    </svg>
  )
}

export function Logo({ size = 28, tone = 'brand' }: { size?: number; tone?: 'brand' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Avenor">
      <Mark size={size} tone={tone} />
      <span style={{ fontSize: size * 0.82, fontWeight: 650, letterSpacing: '-0.035em', color: tone === 'light' ? '#EEF4F1' : '#123F3B', lineHeight: 1 }}>avenor</span>
    </span>
  )
}
