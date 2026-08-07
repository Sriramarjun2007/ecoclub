import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Scroll-reveal wrapper
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <Reveal className={center ? 'text-center max-w-2xl mx-auto mb-12' : 'max-w-2xl mb-10'}>
      {eyebrow && (
        <span className={`inline-block text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4 ${light ? 'bg-white/15 text-emerald-100' : 'bg-emerald-100 text-emerald-700'}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl md:text-4xl font-bold ${light ? 'text-white' : 'text-forest-950'}`}>{title}</h2>
      {subtitle && <p className={`mt-4 text-lg ${light ? 'text-emerald-100/80' : 'text-forest-700/80'}`}>{subtitle}</p>}
    </Reveal>
  )
}