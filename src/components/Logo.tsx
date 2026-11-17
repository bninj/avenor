// Avenor mark: Gurpreet's map pin with a gold house, refined for small sizes.
export function Mark({ size = 28, tone = 'brand' }: { size?: number; tone?: 'brand' | 'light' }) {
  const pin = tone === 'light' ? '#F6F0E3' : '#0F4C4A'
  const house = tone === 'light' ? '#0F4C4A' : '#E6C976'
  return (
    <svg width={size} height={size} viewBox="12 10 40 50" aria-hidden="true">
      <ellipse cx="32" cy="57.5" rx="8" ry="1.8" fill={tone === 'light' ? 'rgba(255,255,255,.25)' : '#A9D3CF'} opacity=".8" />
      <path d="M32 54.2c-1 0-1.8-.5-2.4-1.3L17.7 36.4a17 17 0 1 1 28.6 0L34.4 52.9c-.6.8-1.4 1.3-2.4 1.3z" fill={pin} />
      <path d="M32 13.6l-10.6 9.2c-.8.7-.3 2 .8 2h1.8v8.5c0 .7.6 1.2 1.2 1.2h3.9v-6.2h5.8v6.2h3.9c.7 0 1.2-.5 1.2-1.2v-8.5h1.8c1.1 0 1.6-1.3.8-2z" fill={house} />
    </svg>
  )
}

export function Logo({ size = 28, tone = 'brand' }: { size?: number; tone?: 'brand' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label="Avenor">
      <Mark size={size} tone={tone} />
      <span
        className="font-serif"
        style={{ fontSize: size * 0.86, fontWeight: 520, letterSpacing: '0.01em', color: tone === 'light' ? '#F6F0E3' : '#0F4C4A', fontVariationSettings: '"opsz" 48' }}
      >
        Avenor
      </span>
    </span>
  )
}
