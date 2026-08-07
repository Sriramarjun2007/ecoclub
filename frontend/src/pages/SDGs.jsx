import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import SDGCard from '../components/SDGCard'
import Loader, { EmptyState } from '../components/Loader'

export default function SDGs() {
  const [sdgs, setSdgs] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/sdgs/?page_size=20').then(r => setSdgs(r.data.results || r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])
  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="United Nations SDGs" title="Our Contribution to the Sustainable Development Goals"
          subtitle="ECO CLUB's work directly supports nine United Nations Sustainable Development Goals. Explore how we act on each one." />
        {loading ? <Loader /> : sdgs.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sdgs.map((sdg, i) => <SDGCard key={sdg.id} sdg={sdg} delay={i * 0.05} />)}
          </div>
        ) : <EmptyState title="No SDGs yet" message="The admin can add SDGs from the dashboard." />}
      </section>
    </div>
  )
}