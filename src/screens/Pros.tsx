import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { pros, proTypeLabel, type Pro } from '../data/pros'
import type { ProType } from '../data/stages'
import { areas } from '../data/areas'
import { freeIntroUsed, useApp } from '../store'
import { Icon } from '../components/Icon'
import { Avatar, Button, Sheet, toast } from '../components/ui'
import { ReturnPill } from '../components/TaskRow'

const FILTERS: { id: ProType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'adviser', label: 'Mortgage' },
  { id: 'solicitor', label: 'Solicitors' },
  { id: 'surveyor', label: 'Surveyors' },
  { id: 'agent', label: 'Agents' },
]
const TOP = 132
// Small drawn icons per profession (stroke follows the pin's colour)
const glyph: Record<ProType, string> = {
  adviser: '<path d="M15 8.5A3 3 0 0 0 9.6 10v6.5H15M8 13h5" />',
  solicitor: '<path d="M12 5v14M7 19h10M6 8h12M6 8l-2.5 5h5zM18 8l-2.5 5h5z" />',
  surveyor: '<path d="M5 19h14M7 19v-6l5-4 5 4v6" /><path d="M10 19v-3h4v3" />',
  agent: '<path d="M6 20V5M6 6h11l-2.5 3L17 12H6" />',
}

function pinIcon(p: Pro, active: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div style="transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:5px;white-space:nowrap;padding:6px 10px 6px 7px;border-radius:999px;font:600 13px 'Albert Sans Variable',sans-serif;box-shadow:0 2px 10px rgba(11,43,42,.22);${active ? 'background:#123F3B;color:#fff;transform:translate(-50%,-100%) scale(1.08)' : 'background:#fff;color:#0C2A27'}">
      <span style="display:grid;place-items:center;width:20px;height:20px;border-radius:999px;${active ? 'background:#C79B4E;color:#0C2A27' : 'background:#F5EBD8;color:#A47B33'}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${glyph[p.type]}</svg></span>${p.rating.toFixed(1)}</div>`,
  })
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], zoom, { duration: 0.8 }) }, [lat, lng, zoom, map])
  return null
}

export default function Pros() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const { profile, saved, toggleSaved } = useApp()
  const type = (params.get('type') as ProType | null) ?? 'all'
  const openId = params.get('id')
  const [focus, setFocus] = useState<string | null>(openId)
  const list = useMemo(() => (type === 'all' ? pros : pros.filter((p) => p.type === type)), [type])
  const home = areas.find((a) => a.name === profile?.area) ?? { lat: 52.4580, lng: -1.9000 }
  const open = pros.find((p) => p.id === openId) ?? null
  const focusPro = pros.find((p) => p.id === focus)

  const [expanded, setExpanded] = useState(false)
  const controls = useDragControls()
  const wrap = useRef<HTMLElement>(null)
  const [h, setH] = useState(700)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const panelH = h - TOP
  const collapsedY = Math.max(0, panelH - Math.round(h * 0.4))

  const setType = (t: string) => { const n = new URLSearchParams(params); if (t === 'all') n.delete('type'); else n.set('type', t); n.delete('id'); setParams(n, { replace: true }) }
  const openPro = (id: string | null) => { const n = new URLSearchParams(params); if (id) n.set('id', id); else n.delete('id'); setParams(n, { replace: true }); if (id) setFocus(id) }

  return (
    <main ref={wrap} className="screen-tab absolute inset-0 overflow-hidden bg-stone-100">
      <MapContainer center={[home.lat, home.lng]} zoom={12} zoomControl={false} attributionControl className="absolute inset-x-0 top-0 z-0" style={{ height: '62%' }}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        {list.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p, p.id === focus)} eventHandlers={{ click: () => openPro(p.id) }} zIndexOffset={p.id === focus ? 1000 : 0} />
        ))}
        {focusPro && <FlyTo lat={focusPro.lat} lng={focusPro.lng} zoom={13} />}
      </MapContainer>

      {/* Floating search + filters, Airbnb style */}
      <div className="absolute inset-x-0 top-0 z-[500] p-4 space-y-3 pointer-events-none">
        <div className="pointer-events-auto min-h-14 rounded-full bg-white shadow-float flex items-center gap-3 px-5">
          <Icon name="search" size={20} />
          <div className="flex-1 leading-tight">
            <p className="font-semibold">Checked pros near {profile?.postcode ?? 'Birmingham'}</p>
            <p className="t-micro font-normal text-muted">{profile?.area ?? 'Birmingham'} and nearby</p>
          </div>
        </div>
        <div className="pointer-events-auto"><ReturnPill /></div>
        <div className="pointer-events-auto flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setType(f.id)} className={`shrink-0 min-h-10 rounded-full px-4 t-small font-semibold shadow-pill transition-colors ${type === f.id ? 'bg-teal-800 text-teal-50' : 'bg-white'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* List panel: peeks over the map, slides up to full height. The map and list never share a gesture. */}
      <motion.section
        className="absolute inset-x-0 bottom-0 z-[600] rounded-t-[28px] bg-white shadow-sheet flex flex-col"
        style={{ top: TOP }}
        initial={false}
        animate={{ y: expanded ? 0 : collapsedY }}
        transition={{ type: 'spring', damping: 34, stiffness: 320 }}
        drag="y"
        dragListener={!expanded}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: collapsedY }}
        dragElastic={0.06}
        onDragEnd={(_, i) => {
          if (i.velocity.y < -250 || i.offset.y < -50) setExpanded(true)
          else if (i.velocity.y > 250 || i.offset.y > 50) setExpanded(false)
        }}
      >
        <button
          onPointerDown={(e) => controls.start(e)}
          onClick={() => setExpanded((x) => !x)}
          aria-label={expanded ? 'Show the map' : 'Show the full list'}
          className="shrink-0 pt-3 pb-2 px-5 text-left touch-none"
        >
          <span className="block mx-auto h-1.5 w-10 rounded-full bg-stone-200 mb-3" />
          <span className="block t-h3">{list.length} {type === 'all' ? 'professionals' : proTypeLabel[type].many.toLowerCase()}</span>
          <span className="t-small text-muted flex items-center gap-1.5 mt-0.5"><Icon name="shield" size={15} className="text-teal-700" /> Checked on official registers</span>
        </button>
        <div className={`flex-1 min-h-0 overscroll-contain no-scrollbar ${expanded ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <ul className="px-5 pt-2 space-y-3 pb-48">
            {list.map((p) => (
              <li key={p.id}>
                <button onClick={() => openPro(p.id)} className={`w-full text-left rounded-[20px] p-4 ring-1 transition-shadow ${focus === p.id ? 'ring-teal-800 shadow-float' : 'ring-stone-200'}`}>
                  <div className="flex gap-3.5 items-center">
                    <Avatar name={p.person} tone={p.tone} size={52} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug">{p.firm}</p>
                      <p className="t-small text-muted flex items-center gap-1">{p.person}, {p.area}<span className="w-1.5" /><Icon name="star" size={13} fill="currentColor" stroke={0} className="text-gold-500" /><span className="text-teal-900 font-semibold num">{p.rating}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge icon="shield">{p.register} checked</Badge>
                    {p.ftb && <Badge icon="key">First-time buyers</Badge>}
                    <Badge icon="clock">{p.replies.replace('Usually replies', 'Replies')}</Badge>
                  </div>
                </button>
              </li>
            ))}
            <li className="t-micro font-normal text-stone-400 pt-2">Demo profiles. These firms are invented for the prototype.</li>
          </ul>
        </div>
      </motion.section>

      <AnimatePresence>
        {expanded && (
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} onClick={() => setExpanded(false)}
            className="absolute left-1/2 -translate-x-1/2 bottom-28 z-[700] rounded-full bg-teal-900 text-teal-50 t-small font-semibold px-5 min-h-12 flex items-center gap-2 lift">
            <Icon name="map" size={18} /> Map
          </motion.button>
        )}
      </AnimatePresence>

      <Sheet open={!!open} onClose={() => openPro(null)} label={open?.firm ?? 'Professional'} tall>
        {open && (
          <ProSheet p={open} saved={!!saved[open.id]} onSave={() => { toggleSaved(open.id); toast(saved[open.id] ? 'Removed from saved' : 'Saved to your dashboard') }} onPremium={() => nav('/premium')} />
        )}
      </Sheet>
    </main>
  )
}

function Badge({ icon, children }: { icon: 'shield' | 'key' | 'clock'; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 t-micro"><Icon name={icon} size={13} />{children}</span>
}

function ProSheet({ p, saved, onSave, onPremium }: { p: Pro; saved: boolean; onSave: () => void; onPremium: () => void }) {
  const plan = useApp((s) => s.plan)
  const locked = plan === 'free'
  const { intros, requestIntro } = useApp()
  const sent = !!intros[p.id]
  const limitHit = locked && !sent && freeIntroUsed(intros)
  return (
    <div className="px-6 pb-8 pt-2">
      <div className="flex items-center gap-4">
        <Avatar name={p.person} tone={p.tone} size={72} />
        <div className="flex-1 min-w-0 pr-6">
          <p className="t-micro text-muted">{proTypeLabel[p.type].one}</p>
          <h2 className="t-h2 leading-tight">{p.firm}</h2>
          <p className="t-small text-muted">{p.person}, {p.area} {p.district}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-6 rounded-2xl ring-1 ring-stone-200 divide-x divide-stone-200 text-center">
        <div className="py-3"><p className="font-semibold num flex items-center justify-center gap-1"><Icon name="star" size={14} fill="currentColor" stroke={0} className="text-gold-500" />{p.rating}</p><p className="t-micro text-muted">{p.reviews} reviews</p></div>
        <div className="py-3"><p className="font-semibold num">{new Date().getFullYear() - p.since} yrs</p><p className="t-micro text-muted">experience</p></div>
        <div className="py-3"><p className="font-semibold">{p.languages.length}</p><p className="t-micro text-muted">languages</p></div>
      </div>

      <div className="mt-5 rounded-2xl bg-teal-50 p-4 flex gap-3">
        <span className="text-teal-700"><Icon name="shield" size={22} /></span>
        <div className="t-small">
          <p className="font-semibold">Checked on the {p.register} register</p>
          <p className="text-muted">{p.registerNo}. Insurance and reviews checked too.</p>
        </div>
      </div>

      <p className="t-body mt-5">{p.about}</p>

      <ul className="mt-5 space-y-3 t-small">
        <li className="flex gap-3"><Icon name="money" size={20} className="text-muted" /><span><span className="text-muted">Fees: </span>{p.fee}</span></li>
        <li className="flex gap-3"><Icon name="clock" size={20} className="text-muted" />{p.replies}</li>
        <li className="flex gap-3"><Icon name="globe" size={20} className="text-muted" />{p.languages.join(', ')}</li>
      </ul>

      <figure className="mt-6 rounded-2xl bg-stone-50 p-5">
        <blockquote className="t-h3 font-medium leading-snug">“{p.review.text}”</blockquote>
        <figcaption className="t-small text-muted mt-2">{p.review.by}</figcaption>
      </figure>

      {/* Contact: the business model, visible */}
      <h3 className="t-h3 mt-7 mb-3">Contact</h3>
      <div className="relative rounded-2xl ring-1 ring-stone-200 divide-y divide-stone-200">
        <div className="flex items-center gap-3 p-4"><Icon name="phone" size={20} className="text-muted" /><span className={locked ? 'blur-[5px] select-none' : ''} aria-hidden={locked}>{locked ? '0121 000 0000' : `0121 496 0${p.reviews}`}</span></div>
        <div className="flex items-center gap-3 p-4"><Icon name="message" size={20} className="text-muted" /><span className={locked ? 'blur-[5px] select-none' : ''} aria-hidden={locked}>{locked ? 'name@firm.example' : `${p.person.split(' ')[0].toLowerCase()}@${p.firm.split(' ')[0].toLowerCase()}.example`}</span></div>
        {locked && (
          <button onClick={onPremium} className="absolute inset-0 grid place-items-center bg-white/40">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-900 text-white t-small font-semibold px-4 py-2.5 shadow-float"><Icon name="lock" size={16} /> Unlock with Premium</span>
          </button>
        )}
      </div>

      <div className="mt-5 space-y-2.5">
        <Button onClick={() => { if (limitHit) { onPremium(); return } requestIntro(p.id); toast(`Intro sent to ${p.person.split(' ')[0]}`) }} disabled={sent}>
          {sent ? 'Intro requested' : limitHit ? 'Free intro used. Get more with Premium' : locked ? 'Request your free intro' : 'Request an intro'}
        </Button>
        <Button variant="ghost" icon="heart" onClick={onSave}>{saved ? 'Saved' : 'Save'}</Button>
        <p className="t-micro font-normal text-muted text-center pt-1">{locked ? 'One free intro a month. ' : ''}Pros pay per introduction, never to rank higher.</p>
      </div>
    </div>
  )
}
