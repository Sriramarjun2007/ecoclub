import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { SectionHeading } from '../components/Reveal'
import { FiCalendar, FiAward, FiDownload } from 'react-icons/fi'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [points, setPoints] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [certs, setCerts] = useState([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    api.get('/auth/me/').then(r => setMe(r.data)).catch(() => {})
    api.get('/auth/points/').then(r => setPoints(r.data)).catch(() => {})
    api.get('/registrations/?page_size=50').then(r => setRegistrations(r.data.results || r.data)).catch(() => {})
    api.get('/certificates/?page_size=50').then(r => setCerts(r.data.results || r.data)).catch(() => {})
  }, [authLoading, user])

  if (authLoading || !me) return <div className="pt-40 text-center text-forest-600">Loading dashboard…</div>

  const profile = me.profile
  const membership = me.membership
  const impact = points?.total || membership?.eco_points || 0

  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="Student Dashboard" title={`Welcome, ${(me.user?.full_name || 'Student').split(' ')[0]}!`} subtitle="Track your membership, participation and environmental impact." />

        <div className="grid md:grid-cols-3 gap-5">
          {/* Profile */}
          <div className="glass rounded-3xl p-6 md:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center text-2xl">{me.profile?.profile_photo ? <img src={me.profile.profile_photo} alt="" className="w-full h-full rounded-full object-cover" /> : '👤'}</div>
              <div><h3 className="font-display font-semibold text-forest-950">{me.user?.full_name}</h3>
                <div className="text-xs text-forest-500">{me.user?.email}</div></div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-forest-700">
              <div className="flex justify-between"><span>Register No.</span><span className="font-semibold">{me.profile?.register_number || '—'}</span></div>
              <div className="flex justify-between"><span>Department</span><span className="font-semibold">{me.profile?.department || '—'}</span></div>
              <div className="flex justify-between"><span>Year</span><span className="font-semibold">{me.profile?.year || '—'}</span></div>
              <div className="flex justify-between"><span>College</span><span className="font-semibold">{me.profile?.college || '—'}</span></div>
            </div>
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
              <div className="text-xs text-forest-500 font-semibold uppercase">Membership ID</div>
              <div className="font-mono font-bold text-emerald-700 text-lg mt-1">{membership?.membership_id || 'Pending'}</div>
              <div className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${membership?.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'}`}>{membership?.status || 'pending'}</div>
            </div>
          </div>

          {/* Impact */}
          <div className="md:col-span-2 grid gap-5">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-semibold text-forest-950 mb-4">🌍 Your Environmental Impact</h3>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold text-emerald-600">{impact}</div>
                <div className="text-forest-600 pb-2">Eco Points</div>
              </div>
              <div className="mt-4 h-3 rounded-full bg-emerald-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${Math.min(100, (impact / 500) * 100)}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {[['Event +10', 10], ['Tree +20', 20], ['Campaign +15', 15], ['Workshop +10', 10]].map(([l, v]) => <div key={l} className="rounded-xl bg-emerald-50 p-2 font-medium text-emerald-700">{l}</div>)}
              </div>
              {points?.history?.length > 0 && (
                <div className="mt-5 space-y-2 max-h-40 overflow-auto">
                  {points.history.map(h => <div key={h.id} className="flex justify-between text-sm bg-white rounded-lg p-2.5"><span className="text-forest-700">{h.description || h.reason}</span><span className="font-bold text-emerald-600">+{h.points}</span></div>)}
                </div>
              )}
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-semibold mb-4">📋 Your Registered Events</h3>
              {registrations.length ? (
                <div className="space-y-2">{registrations.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-white rounded-xl p-3 text-sm">
                    <div><div className="font-semibold text-forest-900">{r.event_title || `Event #${r.event}`}</div>
                      <div className="text-xs text-forest-500">{r.registration_id} · {r.status}</div></div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{r.status}</span>
                  </div>))}
                </div>
              ) : <p className="text-sm text-forest-500">You haven't registered for any events yet. <Link to="/events" className="text-emerald-700 font-semibold">Browse events</Link></p>}
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-display font-semibold mb-4">🏆 Certificates & Achievements</h3>
              {certs.length ? (
                <div className="space-y-2">{certs.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-white rounded-xl p-3 text-sm">
                    <div><div className="font-semibold text-forest-900">{c.event_title}</div>
                      <div className="text-xs text-forest-500 font-mono">{c.certificate_id}</div></div>
                    <div className="flex gap-2">
                      <Link to={`/verify/${c.verification_code}`} className="text-emerald-700 font-semibold text-xs">Verify</Link>
                      <a href={`/api/certificates/${c.id}/print/`} target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold text-xs underline">Download</a>
                    </div>
                  </div>))}
                </div>
              ) : <p className="text-sm text-forest-500">No certificates yet. Participate in events to earn them.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}