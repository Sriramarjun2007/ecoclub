import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import { SectionHeading, Reveal } from '../components/Reveal'
import { StatCounter } from '../components/StatCounter'
import Loader from '../components/Loader'

export default function About() {
  const { s } = useSettings()
  const [impact, setImpact] = useState(null)
  useEffect(() => { api.get('/impact/').then(r => setImpact(r.data)).catch(() => {}) }, [])

  const objectives = ['Environmental awareness and education', 'Tree plantation and campus greening',
    'Waste management and clean campus drives', 'Water and energy conservation',
    'Climate action and carbon footprint reduction', 'Biodiversity protection',
    'Community outreach and partnerships', 'Student leadership and volunteering']

  const impactList = impact ? Object.entries(impact).map(([metric, value]) => ({ ...(META[metric] || {}), metric, value })).filter(x => x.value) : []

  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="About Us" title={`About ${s('eco_club_name', 'ECO CLUB')}`} subtitle={`${s('college_name', 'College Name')} Environmental Sustainability Club.`} />
      </section>

      <section className="section bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="inline-block text-emerald-700 text-sm font-semibold uppercase tracking-widest">What is ECO CLUB?</span>
            <h2 className="mt-3 text-3xl font-bold text-forest-950">A Movement Rooted in the SDGs</h2>
            <p className="mt-4 text-forest-700/80 leading-relaxed">ECO CLUB is the college's official environmental organization. We exist to turn environmental concern into concrete action — on campus and beyond.</p>
            <p className="mt-3 text-forest-700/80 leading-relaxed">Why was it established? To give students a structured platform to lead plantation drives, climate campaigns, clean-campus initiatives, water and energy conservation, waste management and community outreach.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {impactList.slice(0, 6).map((k, i) => <Reveal key={k.metric} delay={i * 0.05}><StatCounter value={k.value} label={k.label} icon={k.icon} color={k.color} suffix={k.suffix} /></Reveal>)}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-8">
              <h3 className="font-display text-xl font-bold text-forest-950 mb-5">Our Objectives</h3>
              <ul className="space-y-3">
                {objectives.map(o => <li key={o} className="flex items-center gap-3 text-forest-800"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />{o}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x grid md:grid-cols-2 gap-6">
          <Reveal><div className="rounded-3xl p-8 bg-white shadow-soft h-full"><div className="text-3xl">🎯</div><h3 className="font-display text-xl font-bold mt-3">Mission</h3><p className="mt-3 text-forest-700/80">{s('mission', 'Promote environmental awareness and empower students to participate in practical sustainability initiatives.')}</p></div></Reveal>
          <Reveal delay={0.1}><div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-700 to-green-600 text-white shadow-soft h-full"><div className="text-4xl">🔭</div><h3 className="font-display text-xl font-bold mt-3">Vision</h3><p className="mt-3 text-emerald-50/90">{s('vision', 'Build a generation of environmentally responsible students who contribute to a healthier, cleaner and more sustainable future.')}</p></div></Reveal>
        </div>
      </section>
    </div>
  )
}

import { META } from '../components/StatCounter'