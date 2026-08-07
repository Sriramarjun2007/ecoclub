import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import Loader from '../components/Loader'
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser } from 'react-icons/fi'

const STATUS_BADGE = { open: 'Open for Registration', full: 'Registration Full', closed: 'Registration Closed', past: 'Past Event' }
const STATUS_COLOR = { open: 'bg-emerald-500', full: 'bg-rose-500', closed: 'bg-amber-500', past: 'bg-gray-400' }

export default function EventDetail() {
  const { slug } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const toast = useToast()
  const [event, setEvent] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(params.get('register') === '1')
  const [done, setDone] = useState(null)
  const [already, setAlready] = useState(false)

  useEffect(() => {
    const get = async () => {
      try {
        const idOrSlug = slug || ''
        const res = await api.get(`/events/${idOrSlug}/`)
        setEvent(res.data)
        if (user?.profile) {
          setForm({ full_name: user.user.full_name, email: user.user.email, register_number: user.profile.register_number, department: user.profile.department, year: user.profile.year, college: user.profile.college, phone: user.user.phone })
        }
      } catch (e) { toast(String(e.response?.data?.detail || 'Event not found'), 'error') }
    }
    get()
  }, [slug])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post(`/events/${event.id}/register/`, form)
      setDone(res.data)
      toast('Registration Successful!')
    } catch (err) {
      const detail = err.response?.data
      if (typeof detail === 'string') toast(detail, 'error')
      else if (detail?.detail) toast(detail.detail, 'error')
      else toast('Unable to register. Please try again.', 'error')
    } finally { setSubmitting(false) }
  }

  const field = (key, label, type = 'text', req = true) => (
    <div>
      <label className="block text-sm font-medium text-forest-800 mb-1">{label} {req && <span className="text-rose-500">*</span>}</label>
      <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={req}
        className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-400 outline-none" />
    </div>
  )

  if (!event) return <div className="pt-32"><Loader /></div>

  return (
    <div className="pt-28">
      <div className="container-x px-4">
        <div className="relative rounded-3xl overflow-hidden h-64 md:h-96 bg-gradient-to-br from-emerald-800 to-green-600">
          {event.banner ? <img src={event.banner} alt={event.title} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-7xl">🌱</div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent grid items-end p-6">
            <div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full text-white ${STATUS_COLOR[event.registration_status]}`}>{STATUS_BADGE[event.registration_status]}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">{event.title}</h1>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-forest-950">About this Event</h2>
              <p className="mt-3 text-forest-700/90 leading-relaxed">{event.description}</p>
            </div>
            {event.agenda && <div className="glass rounded-2xl p-6"><h2 className="font-display text-lg font-semibold">Agenda</h2><p className="mt-3 text-forest-700/90 whitespace-pre-line">{event.agenda}</p></div>}
            {event.rules && <div className="glass rounded-2xl p-6"><h2 className="font-display text-lg font-semibold">Rules & Guidelines</h2><p className="mt-3 text-forest-700/90 whitespace-pre-line">{event.rules}</p></div>}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display font-semibold">Event Details</h2>
              {[[FiCalendar, 'Date', event.date], [FiClock, 'Time', `${event.start_time}${event.end_time ? ' – ' + event.end_time : ''}`],
                [FiMapPin, 'Venue', event.venue], [FiUser, 'Coordinator', event.coordinator || '—']].map(([Icon, l, v]) => (
                <div key={l} className="flex items-center gap-3 text-forest-800"><Icon className="text-emerald-600 shrink-0" /><div><div className="text-xs text-forest-500">{l}</div><div className="font-medium">{v}</div></div></div>
              ))}
              <div className="flex items-center gap-3 text-forest-800"><FiUsers className="text-emerald-600" /><div><div className="text-xs text-forest-500">Registered</div><div className="font-medium">{event.registrations_count} / {event.max_participants}</div></div></div>
              <div className="h-2 rounded-full bg-emerald-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (event.registrations_count / event.max_participants) * 100)}%` }} /></div>
            </div>

            <div className="glass rounded-2xl p-6">
              {done ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="font-display text-xl font-bold text-forest-950">Registration Successful!</h3>
                  <p className="mt-2 text-sm text-forest-700">Your Registration ID:</p>
                  <div className="mt-2 font-mono text-lg font-bold text-emerald-700">{done.registration_id}</div>
                  <p className="mt-3 text-xs text-forest-600">You will receive confirmation with the event details. Check your dashboard for updates.</p>
                </div>
              ) : event.registration_status === 'past' ? (
                <div className="text-center py-4"><p className="font-semibold text-forest-700">This event has concluded.</p></div>
              ) : event.registration_status === 'full' ? (
                <div className="text-center py-4"><div className="text-4xl mb-2">😔</div><p className="font-semibold text-rose-600">Registration Full</p><p className="text-sm text-forest-600 mt-1">All spots are taken. Follow our announcements for the next event.</p></div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <h2 className="font-display font-semibold mb-2">Register Now</h2>
                  {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg p-2">{error}</p>}
                  <div className="grid grid-cols-2 gap-3">{field('full_name', 'Full Name')}{field('register_number', 'Register Number')}</div>
                  <div className="grid grid-cols-2 gap-3">{field('department', 'Department')}
                    <div><label className="block text-sm font-medium mb-1">Year</label>
                      <select value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none">
                        <option value="">Select Year</option>{['1','2','3','4','PG'].map(y => <option key={y} value={y}>{y === 'PG' ? 'Graduate' : y + 'st/nd/rd/th'}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">{field('email', 'Email', 'email')}{field('phone', 'Phone', 'tel')}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium mb-1">Gender</label>
                      <select value={form.gender || ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-emerald-200"><option value="">Select</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></div>
                    {field('college', 'College', 'text', false)}
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Optional Message</label>
                    <textarea value={form.message || ''} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows="2" className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none" /></div>
                  {!user && <p className="text-xs text-amber-600">Tip: Log in to auto-fill your details and receive eco points.</p>}
                  <button disabled={submitting} className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">{submitting ? 'Submitting…' : 'Confirm Registration'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}