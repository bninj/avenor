// Sovarna line icons, drawn on a 24px grid with 1.7 strokes and round ends.
const paths: Record<string, React.ReactNode> = {
  home: <><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></>,
  journey: <><path d="M3.5 20.5h5v-5h5v-5h5v-5" /><path d="M18.5 5.5V2.5l3.5 1.5-3.5 1.5" /></>,
  learn: <><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V18c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" /><path d="M12 6v12.5" /></>,
  money: <><path d="M15.5 7.5A3.6 3.6 0 0 0 9 9.6V17h7.5M7 13h6" /><path d="M7 17h2" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  right: <path d="m9.5 6 6 6-6 6" />,
  left: <path d="m14.5 6-6 6 6 6" />,
  down: <path d="m6 9.5 6 6 6-6" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />,
  lock: <><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  star: <path d="m12 4.5 2.3 4.7 5.2.7-3.8 3.6.9 5.1L12 16.2l-4.6 2.4.9-5.1-3.8-3.6 5.2-.7z" />,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z" />,
  spark: <><path d="M12 3.5c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7z" /><path d="M18.5 16.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2z" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  shield: <><path d="M12 3.5 5 6.2v5.3c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6.2z" /><path d="m9 12 2.2 2.2L15.2 10" /></>,
  external: <><path d="M13.5 5H19v5.5M19 5l-8 8" /><path d="M17 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4.5" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" /></>,
  send: <path d="M12 19V5.5M6 11l6-6 6 6" />,
  map: <><path d="m9 5-5 2v12l5-2 6 2 5-2V5l-5 2z" /><path d="M9 5v12M15 7v12" /></>,
  list: <path d="M8.5 7H19M8.5 12H19M8.5 17H19M5 7h.01M5 12h.01M5 17h.01" />,
  message: <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V16h-.5A1.5 1.5 0 0 1 4 14.5z" />,
  phone: <path d="M7 4.5h2.5l1.5 4-2 1.3a9 9 0 0 0 5.2 5.2l1.3-2 4 1.5V17a2 2 0 0 1-2 2A13 13 0 0 1 5 6.5a2 2 0 0 1 2-2z" />,
  key: <><circle cx="8" cy="15" r="3.5" /><path d="m10.5 12.5 8-8M16 7l2.5 2.5M14 9l1.8 1.8" /></>,
  refresh: <><path d="M19 12a7 7 0 1 1-2-4.9" /><path d="M19 4.5V8h-3.5" /></>,
  globe: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16M12 4c2.2 2.3 3.2 5 3.2 8s-1 5.7-3.2 8c-2.2-2.3-3.2-5-3.2-8s1-5.7 3.2-8z" /></>,
  train: <><rect x="6.5" y="4" width="11" height="12" rx="3" /><path d="M6.5 11h11M9 19.5l1.5-3.5M15 19.5 13.5 16" /></>,
  tag: <><path d="M4.5 12.3V5.5a1 1 0 0 1 1-1h6.8l7.2 7.2a1 1 0 0 1 0 1.4l-5.8 5.8a1 1 0 0 1-1.4 0z" /><circle cx="8.5" cy="8.5" r="1.2" /></>,
  calc: <><rect x="5.5" y="3.5" width="13" height="17" rx="2" /><path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5V17M8.5 17h3.5" /></>,
  rotate: <><path d="M4.5 12a7.5 7.5 0 0 1 13-5.1" /><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1" /><path d="M17.5 3.5v3.4h-3.4M6.5 20.5v-3.4h3.4" /></>,
  folder: <><path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v8.3a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" /></>,
  report: <><rect x="5.5" y="4" width="13" height="16.5" rx="2" /><path d="M9 4V3h6v1M8.5 10.5l1.5 1.5 2.5-3M8.5 16h7M14 11h1.5" /></>,
  compare: <><rect x="3.5" y="5" width="7" height="14" rx="1.5" /><rect x="13.5" y="5" width="7" height="14" rx="1.5" /><path d="M6 9h2M6 12h2M16 9h2M16 12h2" /></>,
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9h18M12 9v11M12 9c-1.5-3-5-3.5-5-1.2C7 9 12 9 12 9zM12 9c1.5-3 5-3.5 5-1.2C17 9 12 9 12 9z" /></>,
  door: <><path d="M6 20.5V5.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15M4 20.5h16" /><path d="M14.5 12.5h.01" /></>,
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 22, stroke = 1.7, className = '', fill = 'none' }: { name: IconName; size?: number; stroke?: number; className?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
