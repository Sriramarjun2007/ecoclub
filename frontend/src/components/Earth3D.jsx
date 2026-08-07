import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Abstract planet texture generated at runtime (no external asset needed).
function useEarthTexture() {
  return useMemo(() => {
    const size = 1024
    const c = document.createElement('canvas')
    c.width = size; c.height = size
    const ctx = c.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, '#0e6a4e'); grad.addColorStop(0.5, '#11684f'); grad.addColorStop(1, '#0d5c46')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size)
    const land = ['#2e8b57', '#3c9a5f', '#2f7d4f', '#46a566']
    const blobs = [[0.18,0.3,0.16],[0.55,0.22,0.2],[0.7,0.5,0.22],[0.35,0.6,0.26],[0.12,0.72,0.2],[0.85,0.75,0.2],[0.5,0.85,0.28]]
    blobs.forEach(([x,y,r], i) => {
      ctx.fillStyle = land[i % land.length]
      ctx.beginPath(); ctx.arc(x*size, y*size, r*size, 0, Math.PI*2); ctx.fill()
    })
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 9
    for (let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo((i*137)%size, 120); ctx.quadraticCurveTo((i*137+180)%size, 260, (i*137+400)%size, 160); ctx.stroke() }
    return new THREE.CanvasTexture(c)
  }, [])
}

function EarthSphere({ radius = 2.2 }) {
  const texture = useEarthTexture()
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.012, 40, 40]} />
        <meshBasicMaterial color="#6fce7a" transparent opacity={0.12} wireframe />
      </mesh>
    </group>
  )
}

function Floaters({ count = 36 }) {
  const particles = useMemo(() => {
    const arr = []
    const colors = ['#56C02B', '#2f7340', '#EAF6E9', '#7fd08a', '#bfe8c4']
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.7 + Math.random() * 1.0
      arr.push({
        position: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)],
        color: colors[i % colors.length],
        size: 0.02 + Math.random() * 0.05,
      })
    }
    return arr
  }, [count])

  return (
    <group>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Interactive 3D Earth — the signature hero element.
 * Lazy-loaded; the parent shows a static fallback when WebGL is unavailable.
 */
export default function Earth3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#8fd6ff" />
      <Suspense fallback={null}>
        <EarthSphere />
        <Floaters />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  )
}