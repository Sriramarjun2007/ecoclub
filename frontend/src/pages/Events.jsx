import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import EventCard from '../components/EventCard'
import Loader, { EmptyState } from '../components/Loader'

export default function Events() {
  const [events, setEvents] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  useEffect(() => {
    Promise.all([
      api.get('/events/?is_past=false&page_size=50').then(r => setEvents(r.data.results || r.data)).catch(() => {}),
      api.get('/events/?is_past=true&page_size=50').then(r => setPast(r.data.results || r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const show = tab === 'upcoming' ? events : past

  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="Events" title="Events & Activities" subtitle="From plantation drives to workshops, seminars and community outreach." />
        <div className="flex justify-center gap-2 mb-10">
          {[['upcoming','Upcoming Events'],['past','Our Environmental Journey']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${tab === k ? 'bg-emerald-600 text-white' : 'bg-white text-forest-700 hover:bg-emerald-50'}`}>{l}</button>
          ))}
        </div>
        {loading ? <Loader /> : show.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{show.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}</div>
        ) : <EmptyState title={tab === 'upcoming' ? 'No upcoming events' : 'No past events recorded'} />}
      </section>
    </div>
  )
}