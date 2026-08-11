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
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const getEventList = (response) => {
      const data = response?.data

      // DRF pagination
      if (Array.isArray(data?.results)) {
        return data.results
      }

      // Non-paginated API
      if (Array.isArray(data)) {
        return data
      }

      // Anything else should not break the page
      return []
    }

    const loadEvents = async () => {
      try {
        setLoading(true)
        setError('')

        const [upcomingResponse, pastResponse] = await Promise.all([
          api.get('/events/?is_past=false&page_size=50'),
          api.get('/events/?is_past=true&page_size=50'),
        ])

        if (!mounted) return

        const upcomingEvents = getEventList(upcomingResponse)
        const pastEvents = getEventList(pastResponse)

        setEvents(upcomingEvents)
        setPast(pastEvents)
      } catch (err) {
        console.error('Failed to load events:', err)

        if (!mounted) return

        setEvents([])
        setPast([])

        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Unable to load events. Please try again.'
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      mounted = false
    }
  }, [])

  const show = tab === 'upcoming' ? events : past

  // Extra safety
  const safeEvents = Array.isArray(show) ? show : []

  return (
    <div className="pt-28">

      <section className="container-x px-4">

        {/* ==========================================
            HEADING
        ========================================== */}

        <SectionHeading
          eyebrow="Events"
          title="Events & Activities"
          subtitle="From plantation drives to workshops, seminars and community outreach."
        />


        {/* ==========================================
            TABS
        ========================================== */}

        <div className="mb-10 flex justify-center gap-2">

          {[
            ['upcoming', 'Upcoming Events'],
            ['past', 'Our Environmental Journey'],
          ].map(([k, l]) => (

            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === k
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-forest-700 hover:bg-emerald-50'
              }`}
            >
              {l}
            </button>

          ))}

        </div>


        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <Loader />
        )}


        {/* ==========================================
            ERROR
        ========================================== */}

        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center">

            <p className="font-semibold text-red-700">
              Unable to load events
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        )}


        {/* ==========================================
            EVENTS
        ========================================== */}

        {!loading && !error && safeEvents.length > 0 && (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {safeEvents.map((event, index) => (

              <EventCard
                key={event?.id ?? `event-${index}`}
                event={event}
                index={index}
              />

            ))}

          </div>

        )}


        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {!loading && !error && safeEvents.length === 0 && (

          <EmptyState
            title={
              tab === 'upcoming'
                ? 'No upcoming events'
                : 'No past events recorded'
            }
          />

        )}

      </section>

    </div>
  )
}