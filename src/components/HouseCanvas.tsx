import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { HousePart } from '../data/stages'

// A pretty, traditional English cottage: warm brick, cream stone details, slate roof, white sashes
const C = {
  plot: '#E6ECE8', plotDark: '#1E5A52', grass: '#A4C894', grassDark: '#5F9A6E', plinth: '#D6CDBC', wall: '#B86A4E', band: '#F1EADC', trim: '#F8F5EE',
  stone: '#EDE3CF', roof: '#46545A', ridge: '#B9603F', door: '#1F5F57', gold: '#C9A24B', glass: '#F6DC9C', brick: '#A25840', pot: '#C77A57',
  leaf: '#5F9268', leaf2: '#82B285', trunk: '#7A5C44', path: '#DDD3C1', fence: '#FBFAF6', pink: '#E8A0AE', yellow: '#F2C860', lilac: '#AFA3D8', ink: '#24302F',
}

// Unbuilt parts can be drawn as a faint "ghost" of the finished home
const GhostOn = createContext<{ enabled: boolean; dark: boolean }>({ enabled: false, dark: false })
const IsGhost = createContext(false)

type MatProps = { color: string; roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number }
function Mat(props: MatProps) {
  const ghost = useContext(IsGhost)
  const { dark } = useContext(GhostOn)
  if (ghost) return <meshBasicMaterial color={dark ? '#CFE7E0' : '#123F3B'} transparent opacity={dark ? 0.11 : 0.07} depthWrite={false} />
  return <meshStandardMaterial {...props} />
}

function GhostGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useEffect(() => {
    ref.current?.traverse((o) => { o.castShadow = false; o.receiveShadow = false; if ((o as THREE.Light).isLight) o.visible = false })
  })
  return <IsGhost.Provider value={true}><group ref={ref}>{children}</group></IsGhost.Provider>
}

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A part that drops in and settles with a little bounce the first time it appears. */
function Part({ show, children, delay = 0 }: { show: boolean; children: React.ReactNode; delay?: number }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(reduceMotion ? 1 : -delay)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (!show) { g.visible = false; t.current = -delay; return }
    g.visible = t.current > 0 || reduceMotion
    t.current = Math.min(1, t.current + dt * 1.6)
    const k = Math.max(0, t.current)
    // ease out back
    const s = 1.70158
    const e = 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2)
    g.position.y = (1 - Math.min(1, k * 1.25)) * 1.6
    g.scale.setScalar(0.001 + e * 0.999)
  })
  const { enabled } = useContext(GhostOn)
  return (
    <>
      <group ref={ref} visible={false}>{children}</group>
      {enabled && !show && <GhostGroup>{children}</GhostGroup>}
    </>
  )
}

function Box({ args, position, color, rotation }: { args: [number, number, number]; position: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <Mat color={color} roughness={0.85} />
    </mesh>
  )
}

/** A prism (roof shape) along X: triangle in the YZ plane, `w` wide */
function Prism({ w, d, h, position, color, rotationY = 0 }: { w: number; d: number; h: number; position: [number, number, number]; color: string; rotationY?: number }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-d / 2, 0); s.lineTo(0, h); s.lineTo(d / 2, 0); s.lineTo(-d / 2, 0)
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 2 })
    g.translate(0, 0, -w / 2)
    g.rotateY(Math.PI / 2)
    return g
  }, [w, d, h])
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotationY, 0]} castShadow receiveShadow>
      <Mat color={color} roughness={0.75} />
    </mesh>
  )
}

/** A flat triangle (gable end wall) facing +Z */
function Gable({ w, h, position, color }: { w: number; h: number; position: [number, number, number]; color: string }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0); s.lineTo(0, h); s.lineTo(w / 2, 0); s.lineTo(-w / 2, 0)
    return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false })
  }, [w, h])
  return <mesh geometry={geo} position={position} castShadow receiveShadow><Mat color={color} roughness={0.85} /></mesh>
}

/** A white sash window with glazing bars, sill, lintel and an optional flower box */
function Sash({ position, w = 0.46, h = 0.6, flowers = false, rotationY = 0 }: { position: [number, number, number]; w?: number; h?: number; flowers?: boolean; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box args={[w + 0.1, h + 0.1, 0.05]} position={[0, 0, 0]} color={C.trim} />
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w, h]} />
        <Mat color={C.glass} emissive={C.glass} emissiveIntensity={0.4} roughness={0.35} />
      </mesh>
      <Box args={[0.025, h, 0.02]} position={[0, 0, 0.045]} color={C.trim} />
      <Box args={[w, 0.03, 0.02]} position={[0, 0, 0.045]} color={C.trim} />
      <Box args={[w, 0.02, 0.02]} position={[0, h / 4, 0.045]} color={C.trim} />
      <Box args={[w, 0.02, 0.02]} position={[0, -h / 4, 0.045]} color={C.trim} />
      <Box args={[w + 0.18, 0.07, 0.14]} position={[0, h / 2 + 0.08, 0.04]} color={C.stone} />
      <Box args={[w + 0.16, 0.05, 0.16]} position={[0, -h / 2 - 0.06, 0.06]} color={C.stone} />
      {flowers && (
        <group position={[0, -h / 2 - 0.13, 0.12]}>
          <Box args={[w + 0.06, 0.1, 0.13]} position={[0, 0, 0]} color={C.door} />
          {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
            <mesh key={x} position={[x * (w / 0.46), 0.09, 0]} castShadow>
              <sphereGeometry args={[0.055, 10, 8]} />
              <Mat color={[C.pink, C.yellow, C.lilac, C.pink][i]} roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.32, 0]} castShadow><cylinderGeometry args={[0.06, 0.09, 0.64, 8]} /><Mat color={C.trunk} /></mesh>
      <mesh position={[0, 0.92, 0]} castShadow><sphereGeometry args={[0.42, 18, 14]} /><Mat color={C.leaf} roughness={0.9} /></mesh>
      <mesh position={[0.2, 1.2, 0.06]} castShadow><sphereGeometry args={[0.27, 16, 12]} /><Mat color={C.leaf2} roughness={0.9} /></mesh>
      <mesh position={[-0.18, 1.12, -0.08]} castShadow><sphereGeometry args={[0.24, 16, 12]} /><Mat color={C.leaf2} roughness={0.9} /></mesh>
    </group>
  )
}

/** Brick corner stones (quoins), alternating long and short, up one corner */
function Quoins({ x, z, flipX = 1, flipZ = 1 }: { x: number; z: number; flipX?: number; flipZ?: number }) {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const long = i % 2 === 0
        return <Box key={i} args={[long ? 0.22 : 0.13, 0.17, 0.05]} position={[x - flipX * (long ? 0.11 : 0.065), 0.36 + i * 0.215, z + 0.02 * flipZ]} color={C.stone} />
      })}
    </group>
  )
}

// Wall: front at z = 1.05, sides at x = +-1.35, height 0.22 to 2.02
function House({ parts, spin, dark }: { parts: HousePart[]; spin: React.MutableRefObject<{ target: number; dragging: boolean }>; dark: boolean }) {
  const root = useRef<THREE.Group>(null)
  const has = (p: HousePart) => parts.includes(p)
  useFrame((_, dt) => {
    const r = root.current
    if (!r) return
    if (!spin.current.dragging && !reduceMotion) spin.current.target += dt * 0.22
    r.rotation.y += (spin.current.target - r.rotation.y) * Math.min(1, dt * 6)
  })
  return (
    <group ref={root}>
      {/* The plot is always there, waiting */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.95, 3.0, 0.1, 72]} />
        <Mat color={has('garden') ? (dark ? C.grassDark : C.grass) : dark ? C.plotDark : C.plot} roughness={1} />
      </mesh>

      {/* 1. Foundations: stone plinth and front step */}
      <Part show={has('foundation')}>
        <Box args={[2.95, 0.24, 2.3]} position={[0, 0.12, 0]} color={C.plinth} />
        <Box args={[1.0, 0.12, 0.42]} position={[0.55, 0.06, 1.33]} color={C.plinth} />
      </Part>

      {/* 2. Walls: warm brick with cream corner stones and a string course */}
      <Part show={has('walls')}>
        <Box args={[2.7, 1.8, 2.1]} position={[0, 1.12, 0]} color={C.wall} />
        <Box args={[2.76, 0.07, 2.16]} position={[0, 1.16, 0]} color={C.band} />
        <Box args={[2.78, 0.1, 2.18]} position={[0, 2.04, 0]} color={C.trim} />
        <Quoins x={-1.35} z={1.05} flipX={-1} />
        <Quoins x={1.35} z={1.05} />
        {/* front gable wall, above the door side */}
        <Gable w={1.3} h={0.75} position={[0.55, 2.02, 1.02]} color={C.wall} />
      </Part>

      {/* 3. Windows: sashes with flower boxes, a bay window, side windows */}
      <Part show={has('windows')}>
        {/* bay window on the left, ground floor */}
        <group position={[-0.68, 0, 1.05]}>
          <Box args={[0.95, 0.85, 0.32]} position={[0, 0.72, 0.16]} color={C.wall} />
          <Sash position={[0, 0.74, 0.33]} w={0.6} h={0.5} />
          <Sash position={[-0.48, 0.74, 0.16]} w={0.22} h={0.5} rotationY={-Math.PI / 2} />
          <Sash position={[0.48, 0.74, 0.16]} w={0.22} h={0.5} rotationY={Math.PI / 2} />
          <Box args={[1.05, 0.08, 0.42]} position={[0, 1.2, 0.17]} color={C.trim} />
          <Prism w={1.0} d={0.4} h={0.18} position={[0, 1.24, 0.17]} color={C.roof} />
        </group>
        <Sash position={[-0.68, 1.6, 1.08]} flowers />
        <Sash position={[0.55, 1.72, 1.08]} w={0.36} h={0.46} flowers />
        <Sash position={[1.38, 1.2, 0.35]} rotationY={Math.PI / 2} />
        <Sash position={[-1.38, 1.2, -0.35]} rotationY={-Math.PI / 2} />
        <Sash position={[0.4, 1.2, -1.08]} rotationY={Math.PI} />
      </Part>

      {/* 4. Front door with a little porch: columns, canopy, brass knocker */}
      <Part show={has('door')}>
        <group position={[0.55, 0, 1.06]}>
          <Box args={[0.62, 0.98, 0.05]} position={[0, 0.74, 0]} color={C.trim} />
          <Box args={[0.48, 0.86, 0.05]} position={[0, 0.7, 0.02]} color={C.door} />
          {/* fanlight above the door */}
          <mesh position={[0, 1.15, 0.03]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.24, 24, 0, Math.PI]} />
            <Mat color={C.glass} emissive={C.glass} emissiveIntensity={0.4} />
          </mesh>
          <Box args={[0.14, 0.2, 0.02]} position={[0, 0.82, 0.05]} color={C.door} />
          <mesh position={[0.15, 0.66, 0.07]}><sphereGeometry args={[0.035, 12, 8]} /><Mat color={C.gold} metalness={0.7} roughness={0.25} /></mesh>
          <mesh position={[0, 0.9, 0.07]}><torusGeometry args={[0.045, 0.012, 8, 20]} /><Mat color={C.gold} metalness={0.7} roughness={0.25} /></mesh>
          {/* porch */}
          {[-0.42, 0.42].map((x) => (
            <mesh key={x} position={[x, 0.75, 0.42]} castShadow><cylinderGeometry args={[0.045, 0.05, 1.12, 14]} /><Mat color={C.trim} /></mesh>
          ))}
          <Box args={[1.05, 0.08, 0.56]} position={[0, 1.33, 0.22]} color={C.trim} />
          <Prism w={1.1} d={0.62} h={0.32} position={[0, 1.37, 0.22]} color={C.roof} rotationY={Math.PI / 2} />
        </group>
      </Part>

      {/* 5. Roof: steep slate, cross gable over the door, a dormer */}
      <Part show={has('roof')}>
        <Prism w={3.05} d={2.5} h={1.3} position={[0, 2.06, 0]} color={C.roof} />
        <Prism w={1.0} d={1.5} h={0.82} position={[0.55, 2.06, 0.62]} color={C.roof} rotationY={Math.PI / 2} />
        {/* bargeboard trim on the gable */}
        <Box args={[0.06, 0.95, 0.06]} position={[0.23, 2.43, 1.32]} rotation={[0, 0, -0.98]} color={C.trim} />
        <Box args={[0.06, 0.95, 0.06]} position={[0.87, 2.43, 1.32]} rotation={[0, 0, 0.98]} color={C.trim} />
        {/* dormer on the left slope */}
        <group position={[-0.68, 2.55, 0.58]}>
          <Box args={[0.5, 0.42, 0.5]} position={[0, 0, 0]} color={C.wall} />
          <Sash position={[0, 0, 0.26]} w={0.28} h={0.26} />
          <Prism w={0.6} d={0.62} h={0.26} position={[0, 0.21, 0]} color={C.roof} rotationY={Math.PI / 2} />
        </group>
        <Box args={[3.1, 0.06, 0.08]} position={[0, 3.36, 0]} color={C.ridge} />
      </Part>

      {/* 6. Checked and sound: a tall chimney with pots */}
      <Part show={has('chimney')}>
        <Box args={[0.42, 1.1, 0.4]} position={[-1.05, 3.0, -0.3]} color={C.brick} />
        <Box args={[0.52, 0.08, 0.5]} position={[-1.05, 3.58, -0.3]} color={C.band} />
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[-1.05 + x, 3.72, -0.3]} castShadow><cylinderGeometry args={[0.06, 0.075, 0.24, 14]} /><Mat color={C.pot} /></mesh>
        ))}
      </Part>

      {/* 7. Home, finished: picket fence and gate, path, flowers, hedges, trees, a lamp */}
      <Part show={has('garden')}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.55, 0.02, 1.62 + i * 0.3]} receiveShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.04, 20]} /><Mat color={C.path} />
          </mesh>
        ))}
        {/* picket fence, with a gap for the gate */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = -2.1 + i * 0.2
          if (x > 0.3 && x < 0.85) return null
          return <Box key={i} args={[0.06, 0.32, 0.04]} position={[x, 0.16, 2.55]} color={C.fence} />
        })}
        <Box args={[2.45, 0.05, 0.03]} position={[-0.9, 0.24, 2.55]} color={C.fence} />
        <Box args={[1.35, 0.05, 0.03]} position={[1.55, 0.24, 2.55]} color={C.fence} />
        <Box args={[0.42, 0.26, 0.03]} position={[0.58, 0.17, 2.62]} color={C.fence} rotation={[0, 0.5, 0]} />
        {/* flower beds along the front */}
        {[-1.3, -1.0, -0.7, -0.4, 1.2, 1.5].map((x, i) => (
          <mesh key={x} position={[x, 0.1, 1.55]} castShadow><sphereGeometry args={[0.1, 12, 10]} /><Mat color={[C.pink, C.yellow, C.lilac, C.pink, C.yellow, C.lilac][i]} roughness={0.9} /></mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.55, 0.2, -1.4]} castShadow><boxGeometry args={[0.9, 0.38, 0.36]} /><Mat color={C.leaf2} roughness={1} /></mesh>
        ))}
        <Tree position={[-2.15, 0, 0.6]} scale={1.1} />
        <Tree position={[2.2, 0, -0.9]} scale={0.95} />
        <Tree position={[-1.8, 0, -1.6]} scale={0.75} />
        {/* lamp post by the gate */}
        <mesh position={[1.05, 0.5, 2.3]} castShadow><cylinderGeometry args={[0.025, 0.03, 1.0, 10]} /><Mat color={C.ink} /></mesh>
        <mesh position={[1.05, 1.04, 2.3]}><sphereGeometry args={[0.07, 14, 10]} /><Mat color={C.glass} emissive={C.glass} emissiveIntensity={1.2} /></mesh>
        <pointLight position={[1.05, 1.0, 2.3]} intensity={1.2} distance={2.6} color={C.glass} />
        <pointLight position={[0.55, 1.1, 1.8]} intensity={0.9} distance={2.4} color={C.glass} />
      </Part>
    </group>
  )
}

/** Keeps the whole plot in frame, whatever the canvas shape (tall frames need a farther camera). */
function Rig({ zoom }: { zoom: number }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const k = Math.max(1, 1.3 / aspect) / zoom
    camera.position.set(7.0 * k, 5.4 * k, 8.0 * k)
    camera.lookAt(0, 1.25, 0)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, zoom])
  return null
}

export default function HouseCanvas({ parts, className = '', interactive = true, dark = false, zoom = 1, ghost = false }: { parts: HousePart[]; className?: string; interactive?: boolean; dark?: boolean; zoom?: number; ghost?: boolean }) {
  const spin = useRef({ target: -0.5, dragging: false })
  const last = useRef(0)
  return (
    <div
      className={`touch-pan-y ${interactive ? '' : 'pointer-events-none'} ${className}`}
      onPointerDown={(e) => { if (!interactive) return; spin.current.dragging = true; last.current = e.clientX; }}
      onPointerMove={(e) => { if (!spin.current.dragging) return; spin.current.target += (e.clientX - last.current) * 0.012; last.current = e.clientX }}
      onPointerLeave={() => (spin.current.dragging = false)}
      onPointerUp={() => (spin.current.dragging = false)}
      onPointerCancel={() => (spin.current.dragging = false)}
      aria-label={`3D model of your home: ${parts.length} of 7 parts built`}
      role="img"
    >
      <Canvas flat shadows="percentage" dpr={[1, 2]} camera={{ position: [7.0, 5.4, 8.0], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} style={{ touchAction: 'pan-y', pointerEvents: interactive ? 'auto' : 'none' }}>
        <hemisphereLight args={['#FFFDF6', dark ? '#9FC0B6' : '#D9E2DC', 1.8]} />
        <directionalLight position={[4, 7, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-bias={-0.0005} />
        <Rig zoom={zoom} />
        <GhostOn.Provider value={{ enabled: ghost, dark }}><House parts={parts} spin={spin} dark={dark} /></GhostOn.Provider>
      </Canvas>
    </div>
  )
}
