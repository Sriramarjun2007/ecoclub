import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Interactive SDG card — click to expand details.
export default function SDGCard({ sdg, delay = 0 }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl overflow-hidden cursor-pointer hover:shadow-soft transition"
      onClick={() => setOpen(v => !v)}
      style={{ borderTop: `4px solid ${sdg.color || '#56C02B'}` }}
    >
      <div className="p-5 flex items-center gap-4">
        <div className="shrink-0 w-14 h-14 rounded-xl grid place-items-center text-white font-bold text-lg shadow" style={{ background: sdg.color || '#3f8f4f' }}>
          {sdg.number}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-forest-500">SDG {sdg.number}</div>
          <h4 className="font-display font-semibold text-forest-950 leading-snug">{sdg.name}</h4>
        </div>
        <span className="ml-auto text-forest-500">{open ? '−' : '+'}</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 text-sm text-forest-800">
              {sdg.contribution && <p className="mb-3">{sdg.contribution}</p>}
              {sdg.activities?.length > 0 && (
                <ul className="space-y-1.5">
                  {sdg.activities.map(a => (
                    <li key={a.id} className="flex items-center gap-2 text-forest-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{a.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}