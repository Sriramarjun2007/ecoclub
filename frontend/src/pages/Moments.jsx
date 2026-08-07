import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading, Reveal } from '../components/Reveal'
import Loader, { EmptyState } from '../components/Loader'

export default function Moments() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/memories/?page_size=100').then(r => setMemories(r.data.results || r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])
  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="Memories" title="Moments That Made a Difference"
          subtitle="A cinematic timeline of the moments that shaped our environmental journey." />
        {loading ? <Loader /> : memories.length ? (
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-emerald-200 hidden md:block" />
            <div className="space-y-10">
              {memories.map((m, i) => (
                <Reveal key={m.id} delay={i * 0.05}>
                  <div className={`relative md:flex gap-8 ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                    <div className="md:w-1/2">
                      <div className="glass rounded-3xl overflow-hidden">
                        <div className="h-52 bg-gradient-to-br from-emerald-700 to-green-500">
                          {m.photo ? <img src={m.photo} alt={m.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-5xl">🌳</div>}
                        </div>
                        <div className="p-6">
                          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{m.year}{m.date ? ' · ' + m.date : ''}</div>
                          <h3 className="font-display text-xl font-bold text-forest-950 mt-1">{m.title}</h3>
                          <p className="mt-2 text-forest-700/85">{m.description}</p>
                          {m.participants > 0 && <div className="mt-3 text-sm font-medium text-emerald-700">👥 {m.participants} participants</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : <EmptyState title="No memories yet" />}
      </section>
    </div>
  )
}