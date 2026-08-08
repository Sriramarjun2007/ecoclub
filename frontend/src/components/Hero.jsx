import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'
import Earth3D from './Earth3D'

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

export default function Hero() {
  const { s } = useSettings()
  const [webgl, setWebgl] = useState(true)
  useEffect(() => { setWebgl(supportsWebGL()) }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0b2e1c] via-[#123d27] to-[#0d5c3a] text-white pt-24">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-green-400/10 blur-3xl" />

      <div className="container-x relative z-10 grid lg:grid-cols-2 items-center gap-10 px-4">
        <div>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-emerald-100">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> {s('college_name', 'kalasalingam university')} · Sustainability
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight font-display">
            {s('hero_title', 'Together for a Greener Tomorrow')}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 text-lg text-emerald-100/85 max-w-xl">
            {s('hero_subtitle', 'ECO CLUB — Empowering Students to Create Sustainable Change.')}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3">
            <a href="#activities" className="px-6 py-3 rounded-lg bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition">Explore Our Activities</a>
            <Link to="/join" className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition">Join Eco Club</Link>
            <Link to="/events" className="px-6 py-3 rounded-lg bg-white/10 border border-white/25 text-white font-semibold hover:bg-white/20 transition">Upcoming Events</Link>
          </motion.div>
        </div>

        {/* 3D Earth or static fallback */}
        <div className="relative h-[22rem] md:h-[30rem]">
          {webgl ? (
            <Earth3D />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-emerald-500 via-green-600 to-forest-900 shadow-glow flex items-center justify-center text-7xl">🌍</div>
            </div>
          )}
          {/* floating icons */}
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-6 left-8 text-3xl">🍃</motion.div>
          <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute bottom-10 left-6 text-3xl">💧</motion.div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }} className="absolute top-1/3 right-8 text-3xl">☀️</motion.div>
          <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 5.5, repeat: Infinity, delay: 1.5 }} className="absolute bottom-8 right-10 text-3xl">♻️</motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-[#f4f7f2]" />
    </section>
  )
}

export function ScrollingMessage() {
  return (
    <div className="bg-emerald-900 text-emerald-100 py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap text-sm md:text-base tracking-widest font-medium">
        Think Green • Act Green • Live Green • Protect Our Planet • Reduce • Reuse • Recycle • Plant • Conserve • Nurture
      </div>
    </div>
  )
}