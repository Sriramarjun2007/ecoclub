import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading, Reveal } from '../components/Reveal'
import Loader, { EmptyState } from '../components/Loader'

const GROUPS = [
  { key: 'faculty', label: 'Faculty Coordinator' },
  { key: 'student_coordinator', label: 'Student Coordinator' },
  { key: 'executive', label: 'Executive Members' },
]

export default function Team() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/team/?page_size=100').then(r => setTeam(r.data.results || r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])
  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="Our Team" title="The People Behind ECO CLUB" subtitle="Committed faculty and student leaders driving sustainability on campus." />
        {loading ? <Loader /> : team.length ? GROUPS.map(g => {
          const members = team.filter(t => t.role === g.key)
          if (!members.length) return null
          return (
            <div key={g.key} className="mb-12">
              <h3 className="font-display text-xl font-bold text-forest-950 mb-6">{g.label}</h3>
              <div className={`grid gap-5 ${g.key === 'executive' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3 max-w-4xl'}`}>
                {members.map((t, i) => (
                  <Reveal key={t.id} delay={i * 0.06}><div className="glass rounded-2xl p-6 text-center hover:shadow-soft transition">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-emerald-100 grid place-items-center mb-4">
                      {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <span className="text-3xl">👤</span>}
                    </div>
                    <h4 className="font-display font-semibold text-forest-950">{t.name}</h4>
                    <div className="text-sm text-emerald-700 font-medium mt-0.5">{t.position || t.designation}</div>
                    <div className="text-xs text-forest-600/70 mt-1">{t.department}{t.year ? ' · Year ' + t.year : ''}</div>
                    {t.email && <div className="text-xs mt-2"><a href={`mailto:${t.email}`} className="text-emerald-700 hover:underline">{t.email}</a></div>}
                  </div></Reveal>
                ))}
              </div>
            </div>
          )
        }) : <EmptyState title="No team members yet" />}
      </section>
    </div>
  )
}