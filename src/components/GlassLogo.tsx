import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* Gurpreet's logo as a real glass object: a crystal map pin that splits light into a
   spectrum at its bevelled edges (dispersion), with the gold house floating inside. */

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function pinShape() {
  // Circle (radius 1, centre y 0.55) meeting a point at y -1.75 with tangent lines
  const s = new THREE.Shape()
  const cy = 0.55, r = 1, tipY = -1.75
  const d = cy - tipY
  const a = Math.asin(r / d) // angle of tangent from the tip
  const tx = r * Math.cos(a), ty = cy - r * Math.sin(a)
  s.moveTo(0, tipY)
  s.lineTo(-tx, ty)
  // over the top, clockwise from the left tangent point to the right one
  s.absarc(0, cy, r, Math.atan2(ty - cy, -tx), Math.atan2(ty - cy, tx), true)
  s.lineTo(0, tipY)
  return s
}

function houseShape() {
  const s = new THREE.Shape()
  const w = 0.5, roofW = 0.66, h = 0.42, roofH = 0.4, base = 0.18
  s.moveTo(-w, base - h)
  s.lineTo(-w, base)
  s.lineTo(-roofW, base)
  s.lineTo(0, base + roofH)
  s.lineTo(roofW, base)
  s.lineTo(w, base)
  s.lineTo(w, base - h)
  // door notch
  s.lineTo(0.12, base - h)
  s.lineTo(0.12, base - h + 0.24)
  s.lineTo(-0.12, base - h + 0.24)
  s.lineTo(-0.12, base - h)
  s.lineTo(-w, base - h)
  return s
}

function Studio() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    return () => { env.dispose(); pmrem.dispose() }
  }, [gl, scene])
  return null
}

/** Soft light strips behind the glass: they are what the prism bends into colour */
function LightStrips() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 16; c.height = 256
    const g = c.getContext('2d')!
    const grd = g.createLinearGradient(0, 0, 0, 256)
    grd.addColorStop(0, 'rgba(255,255,255,0)')
    grd.addColorStop(0.5, 'rgba(255,255,255,1)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 16, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  // Short, soft beams that sit behind the glass only
  const strips: [number, number, number, string, number][] = [
    [-0.75, 0.35, -0.32, '#F3E2B6', 0.55],
    [0.05, 0.1, 0.18, '#FFFFFF', 0.5],
    [0.8, 0.25, -0.12, '#BFEBDD', 0.55],
  ]
  return (
    <group position={[0, 0, -1.6]}>
      {strips.map(([x, y, rot, color, op], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rot]}>
          <planeGeometry args={[0.16, 3.4]} />
          <meshBasicMaterial map={tex} color={color} transparent opacity={op} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function GlassPin() {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const on = (e: PointerEvent) => { pointer.current = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 } }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [])

  const pinGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(pinShape(), { depth: 0.55, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.12, bevelSegments: 10, curveSegments: 72 })
    g.center()
    return g
  }, [])
  const houseGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(houseShape(), { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4 })
    g.center()
    return g
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const targetY = (reduce ? 0 : Math.sin(t * 0.35) * 0.55) + pointer.current.x * 0.5
    const targetX = -0.08 + pointer.current.y * 0.25
    g.rotation.y += (targetY - g.rotation.y) * Math.min(1, dt * 2)
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, dt * 2)
    g.position.y = reduce ? 0 : Math.sin(t * 0.6) * 0.06
  })

  return (
    <group ref={group}>
      <mesh geometry={pinGeo}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.4}
          roughness={0.04}
          ior={1.55}
          dispersion={6}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor="#5E9C8E"
          attenuationDistance={1.6}
          color="#E6F4EF"
          envMapIntensity={0.7}
          specularIntensity={1}
        />
      </mesh>
      {/* The gold house, suspended inside the glass */}
      <mesh geometry={houseGeo} position={[0, 0.66, 0]} scale={1.05}>
        <meshPhysicalMaterial color="#E2BE6E" metalness={0.85} roughness={0.22} clearcoat={0.6} envMapIntensity={1.4} />
      </mesh>
    </group>
  )
}

export default function GlassLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, -0.15, 8.6], fov: 30 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.92 }}>
        <Studio />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, -2, 3]} intensity={0.8} color="#BFEBDD" />
        <LightStrips />
        <GlassPin />
      </Canvas>
    </div>
  )
}
