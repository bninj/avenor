// Custom line drawings for each stage, framed in the Avenor arch.
const T = '#0F4C4A'
const G = '#C9A24B'

const art: Record<string, React.ReactNode> = {
  budget: (
    <g>
      {/* jar of savings with coins */}
      <path d="M40 58h40M42 58v42a8 8 0 0 0 8 8h20a8 8 0 0 0 8-8V58" />
      <path d="M44 52h32v6H44z" />
      <circle cx="60" cy="92" r="7" fill={G} stroke="none" />
      <circle cx="51" cy="99" r="5" fill={G} stroke="none" opacity=".7" />
      <circle cx="69" cy="100" r="5" fill={G} stroke="none" opacity=".85" />
      <path d="M60 30v14M54 37l6 7 6-7" />
    </g>
  ),
  mortgage: (
    <g>
      <path d="M38 40h34l12 12v54H38z" />
      <path d="M72 40v12h12M46 60h28M46 70h28M46 80h18" />
      <circle cx="74" cy="94" r="9" fill={G} stroke="none" />
      <path d="m70 94 3 3 5-6" stroke="#fff" />
    </g>
  ),
  search: (
    <g>
      <path d="M34 108V72l22-18 22 18v36z" />
      <path d="M50 108V90h12v18" />
      <circle cx="80" cy="56" r="12" fill="#fff" />
      <circle cx="80" cy="56" r="12" />
      <path d="m89 65 10 10" strokeWidth="4" stroke={G} />
    </g>
  ),
  offer: (
    <g>
      <path d="M34 62h52v40H34z" />
      <path d="m34 62 26 22 26-22" />
      <rect x="48" y="36" width="24" height="30" rx="2" fill="#fff" />
      <path d="M53 46h14M53 53h10" />
      <text x="60" y="44" />
      <circle cx="60" cy="88" r="6" fill={G} stroke="none" />
    </g>
  ),
  solicitor: (
    <g>
      <path d="M40 36h40v66H40z" />
      <path d="M48 48h24M48 57h24M48 66h24M48 75h14" />
      <path d="M58 92c4-6 8 4 12-2s6 2 10-2" stroke={G} strokeWidth="2.6" />
      <path d="m88 46 6-6 4 4-6 6zM88 46l-14 14-2 6 6-2 14-14" />
    </g>
  ),
  survey: (
    <g>
      <path d="M40 42h40v64H40z" />
      <path d="M52 38h16v8H52z" fill="#fff" />
      <path d="m48 70 12-10 12 10v18H48z" />
      <path d="M48 96h24" />
      <circle cx="80" cy="96" r="9" fill={G} stroke="none" />
      <path d="m76 96 3 3 5-6" stroke="#fff" />
    </g>
  ),
  completion: (
    <g>
      <circle cx="50" cy="80" r="14" />
      <circle cx="50" cy="80" r="5" fill={G} stroke="none" />
      <path d="m60 70 26-26M78 52l7 7M72 58l5 5" />
      <path d="M86 92c3 0 5-2 5-5 0 3 2 5 5 5-3 0-5 2-5 5 0-3-2-5-5-5z" fill={G} stroke="none" />
      <path d="M30 46c2 0 3.5-1.5 3.5-3.5 0 2 1.5 3.5 3.5 3.5-2 0-3.5 1.5-3.5 3.5 0-2-1.5-3.5-3.5-3.5z" fill={G} stroke="none" opacity=".7" />
    </g>
  ),
}

export function StageArt({ id, done, className = '', bg = '#F4F1EA' }: { id: string; done?: boolean; className?: string; bg?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <path d="M6 140V60a54 54 0 0 1 108 0v80z" fill={done ? '#E3EFEC' : bg} />
      <g fill="none" stroke={T} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{art[id]}</g>
    </svg>
  )
}
