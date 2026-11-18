import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { HousePart } from '../data/stages'

// Palette (toy-like, matte)
// A Birmingham red-brick Victorian: brick walls, slate roof, white sashes, spruce door
const C = {
  plot: '#E3E8E5', plotDark: '#1E5A52', grass: '#9FC093', grassDark: '#5F9A6E', plinth: '#D2C9B8', wall: '#B4634A', band: '#F3EFE6', trim: '#F6F3EC',
  roof: '#39484A', door: '#1C5A53', gold: '#C79B4E', glass: '#F5D894', brick: '#9E5440', pot: '#C77A57', leaf: '#5E8F67', leaf2: '#7FAE84', trunk: '#7A5C44', path: '#DCD3C2',
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

function Roof() {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.6, 0); s.lineTo(0, 1.15); s.lineTo(1.6, 0); s.lineTo(-1.6, 0)
    const g = new THREE.ExtrudeGeometry(s, { depth: 2.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 })
    g.translate(0, 0, -1.25)
    return g
  }, [])
  return (
    <mesh geometry={geo} position={[0, 2.05, 0]} castShadow receiveShadow>
      <Mat color={C.roof} roughness={0.7} />
    </mesh>
  )
}

function Window({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box args={[0.52, 0.62, 0.06]} position={[0, 0, 0]} color={C.trim} />
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[0.4, 0.5]} />
        <Mat color={C.glass} emissive={C.glass} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>
      <Box args={[0.03, 0.5, 0.02]} position={[0, 0, 0.045]} color={C.trim} />
      <Box args={[0.4, 0.03, 0.02]} position={[0, 0, 0.045]} color={C.trim} />
      <Box args={[0.62, 0.06, 0.14]} position={[0, -0.34, 0.05]} color={C.band} />
      <Box args={[0.6, 0.07, 0.08]} position={[0, 0.35, 0.03]} color={C.band} />
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow><cylinderGeometry args={[0.06, 0.08, 0.6, 8]} /><Mat color={C.trunk} /></mesh>
      <mesh position={[0, 0.85, 0]} castShadow><sphereGeometry args={[0.42, 16, 12]} /><Mat color={C.leaf} roughness={0.9} /></mesh>
      <mesh position={[0.18, 1.12, 0.05]} castShadow><sphereGeometry args={[0.26, 14, 10]} /><Mat color={C.leaf2} roughness={0.9} /></mesh>
    </group>
  )
}

function House({ parts, spin, dark }: { parts: HousePart[]; spin: React.MutableRefObject<{ target: number; dragging: boolean }>; dark: boolean }) {
  const root = useRef<THREE.Group>(null)
  const has = (p: HousePart) => parts.includes(p)
  useFrame((_, dt) => {
    const r = root.current
    if (!r) return
    if (!spin.current.dragging && !reduceMotion) spin.current.target += dt * 0.25
    r.rotation.y += (spin.current.target - r.rotation.y) * Math.min(1, dt * 6)
  })
  return (
    <group ref={root}>
      {/* The plot is always there, waiting */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.9, 2.95, 0.1, 64]} />
        <Mat color={has('garden') ? (dark ? C.grassDark : C.grass) : dark ? C.plotDark : C.plot} roughness={1} />
      </mesh>

      <Part show={has('foundation')}>
        <Box args={[3.0, 0.22, 2.4]} position={[0, 0.11, 0]} color={C.plinth} />
      </Part>
      <Part show={has('walls')}>
        <Box args={[2.7, 1.8, 2.1]} position={[0, 1.13, 0]} color={C.wall} />
        <Box args={[2.76, 0.08, 2.16]} position={[0, 2.04, 0]} color={C.trim} />
        <Box args={[2.74, 0.07, 2.14]} position={[0, 1.08, 0]} color={C.band} />
      </Part>
      <Part show={has('windows')}>
        <Window position={[-0.75, 1.45, 1.06]} />
        <Window position={[0.75, 1.45, 1.06]} />
        <Window position={[1.36, 1.2, 0.35]} rotationY={Math.PI / 2} />
        <Window position={[-1.36, 1.2, -0.35]} rotationY={-Math.PI / 2} />
      </Part>
      <Part show={has('door')}>
        <group position={[0, 0.72, 1.07]}>
          <Box args={[0.62, 0.92, 0.06]} position={[0, 0, 0]} color={C.trim} />
          <Box args={[0.5, 0.84, 0.05]} position={[0, -0.02, 0.02]} color={C.door} />
          <mesh position={[0.15, -0.05, 0.06]}><sphereGeometry args={[0.035, 12, 8]} /><Mat color={C.gold} metalness={0.6} roughness={0.3} /></mesh>
          <Box args={[0.9, 0.08, 0.3]} position={[0, -0.47, 0.12]} color={C.plinth} />
        </group>
      </Part>
      <Part show={has('roof')}>
        <Roof />
      </Part>
      <Part show={has('chimney')}>
        <Box args={[0.42, 0.85, 0.36]} position={[0.85, 2.88, -0.4]} color={C.brick} />
        <Box args={[0.5, 0.08, 0.44]} position={[0.85, 3.32, -0.4]} color={C.band} />
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[0.85 + x, 3.46, -0.4]} castShadow><cylinderGeometry args={[0.06, 0.07, 0.22, 12]} /><Mat color={C.pot} /></mesh>
        ))}
      </Part>
      <Part show={has('garden')}>
        <Tree position={[-2.0, 0, 0.9]} scale={1.1} />
        <Tree position={[2.1, 0, -0.8]} scale={0.9} />
        <Tree position={[-1.7, 0, -1.4]} scale={0.75} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.02, 1.55 + i * 0.32]} receiveShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
            <Mat color={C.path} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.0, 0.16, 1.75]} castShadow>
            <boxGeometry args={[1.0, 0.3, 0.3]} />
            <Mat color={C.leaf2} roughness={1} />
          </mesh>
        ))}
        <pointLight position={[0, 1.2, 1.6]} intensity={1.2} distance={3} color={C.glass} />
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
