
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import Loader, { EmptyState } from '../components/Loader'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLogOut,
} from 'react-icons/fi'

const TABS = [
  'Overview',
  'Students',
  'Events',
  'Registrations',
  'Gallery',
  'Team',
  'SDGs',
  'Announcements',
  'Blog',
  'Certificates',
  'Messages',
  'Impact',
  'Settings',
]

/* ============================================================
   ADMIN
============================================================ */

export default function Admin() {
  const { user, authLoading, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin()) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, isAdmin, navigate])

  if (authLoading || !user || !isAdmin()) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-forest-950">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-forest-700/70">
              Manage the ECO CLUB platform ·{' '}
              {user?.user?.full_name ||
                user?.full_name ||
                user?.username ||
                user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg bg-white border border-emerald-200 text-forest-800 text-sm font-medium hover:bg-emerald-50"
            >
              View Site
            </button>

            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                tab === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-forest-700 hover:bg-emerald-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {tab === 'Overview' && <Overview onNav={setTab} />}
        {tab === 'Students' && <Students />}
        {tab === 'Events' && <Events />}
        {tab === 'Registrations' && <Registrations />}
        {tab === 'Gallery' && <Gallery />}
        {tab === 'Team' && <Team />}
        {tab === 'SDGs' && <SDGs />}
        {tab === 'Announcements' && <Announcements />}
        {tab === 'Blog' && <Blog />}
        {tab === 'Certificates' && <Certificates />}
        {tab === 'Messages' && <Messages />}
        {tab === 'Impact' && <Impact />}
        {tab === 'Settings' && <Settings />}
      </div>
    </div>
  )
}

/* ============================================================
   OVERVIEW
============================================================ */

function Overview({ onNav }) {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    api
      .get('/overview/')
      .then((response) => {
        if (!mounted) return

        console.log('Overview API:', response.data)
        setOverview(response.data)
      })
      .catch((error) => {
        console.error(
          'Overview API error:',
          error.response?.data || error
        )

        if (!mounted) return

        setOverview({
          students: 0,
          events: 0,
          registrations: 0,
          volunteers: 0,
          trees: 0,
          waste: 0,
          water: 0,
          campaigns: 0,
          members: 0,
        })
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const cards = [
    [
      'Students',
      overview?.students,
      'Registered students',
      () => onNav('Students'),
    ],
    [
      'Events',
      overview?.events,
      'Total events',
      () => onNav('Events'),
    ],
    [
      'Registrations',
      overview?.registrations,
      'Event registrations',
      () => onNav('Registrations'),
    ],
    [
      'Trees Planted',
      overview?.trees,
      'Environmental impact',
      () => onNav('Impact'),
    ],
  ]

  return (
    <div className="space-y-8">

      {/* OVERVIEW */}
      <div>
        <h2 className="text-xl font-bold text-forest-950 mb-4">
          Overview
        </h2>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(([label, value, subtitle, go]) => (
              <button
                key={label}
                onClick={go}
                className="text-left bg-white rounded-2xl p-5 shadow-soft hover:-translate-y-0.5 transition"
              >
                <div className="text-sm text-forest-600">
                  {label}
                </div>

                <div className="text-3xl font-bold text-forest-950 mt-2">
                  {Number(value || 0).toLocaleString()}
                </div>

                <div className="text-xs text-forest-500 mt-1">
                  {subtitle}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-bold text-forest-950 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Create Event', 'Events'],
            ['Manage Gallery', 'Gallery'],
            ['Team Members', 'Team'],
            ['Impact Stats', 'Impact'],
            ['Blog Posts', 'Blog'],
            ['Announcements', 'Announcements'],
            ['Website Settings', 'Settings'],
            ['Certificate / Participants', 'Certificates'],
          ].map(([label, target]) => (
            <button
              key={target}
              onClick={() => onNav(target)}
              className="text-left px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-forest-800 font-medium text-sm"
            >
              {label} →
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

/* ============================================================
   SHARED LIST HOOK
============================================================ */

function useList(url) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)

    api
      .get(url)
      .then((response) => {
        setData(
          response.data?.results ||
            response.data ||
            []
        )
      })
      .catch((error) => {
        console.error(
          `API error: ${url}`,
          error.response?.data || error
        )

        setData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    reload()
  }, [url])

  return {
    data,
    loading,
    reload,
  }
}

/* ============================================================
   MODAL
============================================================ */

function Modal({
  open,
  onClose,
  title,
  children,
  onSave,
  saving = false,
  color = 'bg-emerald-600',
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-forest-950">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {children}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            disabled={saving}
            className={`flex-1 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 ${color}`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   STUDENTS
============================================================ */

function Students() {
  const {
    data,
    loading,
    reload,
  } = useList('/auth/memberships/')

  const [q, setQ] = useState('')
  const toast = useToast()

  const filtered = data.filter((m) =>
    `${m.membership_id || ''}
     ${m.profile?.register_number || ''}
     ${m.profile?.user?.full_name || ''}
     ${m.profile?.department || ''}`
      .toLowerCase()
      .includes(q.toLowerCase())
  )

  const setStatus = async (id, status) => {
    try {
      await api.patch(
        `/auth/memberships/${id}/`,
        {
          status,
        }
      )

      toast('Updated')
      reload()
    } catch (error) {
      console.error(
        'Membership update error:',
        error.response?.data || error
      )

      toast(
        error.response?.data?.detail ||
          error.response?.data?.status?.[0] ||
          'Unable to update membership',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-forest-950">
            Students & Memberships
          </h2>

          <p className="text-sm text-forest-600 mt-1">
            Manage ECO CLUB student memberships.
          </p>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="px-3 py-2 rounded-lg border border-emerald-200 text-sm outline-none"
        />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Member</th>
                <th className="py-3">Member ID</th>
                <th className="py-3">Department</th>
                <th className="py-3">Status</th>
                <th className="py-3">Points</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-0"
                >
                  <td className="py-3">
                    {m.profile?.user?.full_name ||
                      m.membership_id}
                  </td>

                  <td className="py-3">
                    {m.membership_id}
                  </td>

                  <td className="py-3">
                    {m.profile?.department || '—'}
                  </td>

                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        m.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : m.status === 'rejected'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3">
                    {m.eco_points || 0}
                  </td>

                  <td className="py-3">
                    <div className="flex gap-2">
                      {m.status !== 'approved' && (
                        <button
                          onClick={() =>
                            setStatus(
                              m.id,
                              'approved'
                            )
                          }
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-xs"
                        >
                          Approve
                        </button>
                      )}

                      {m.status !== 'rejected' && (
                        <button
                          onClick={() =>
                            setStatus(
                              m.id,
                              'rejected'
                            )
                          }
                          className="px-2 py-1 rounded bg-rose-600 text-white text-xs"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="No students found." />
      )}
    </div>
  )
}

/* ============================================================
   EVENTS
============================================================ */

function Events() {
  const {
    data,
    loading,
    reload,
  } = useList('/events/?page_size=100')

  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setForm({})
    setModal(true)
  }

  const save = async () => {
    setSaving(true)

    try {
      if (form.id) {
        await api.patch(
          `/events/${form.id}/`,
          form
        )

        toast('Event updated')
      } else {
        await api.post('/events/', form)

        toast('Event created')
      }

      setModal(false)
      reload()
    } catch (error) {
      console.error(
        'Event save error:',
        error.response?.data || error
      )

      toast(
        Object.values(
          error.response?.data || {}
        )[0]?.[0] ||
          'Unable to save event',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this event?')) {
      return
    }

    try {
      await api.delete(`/events/${id}/`)

      toast('Deleted')
      reload()
    } catch (error) {
      console.error(error)
      toast('Unable to delete event', 'error')
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-950">
          Events
        </h2>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
        >
          <FiPlus />
          New Event
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((event) => (
            <div
              key={event.id}
              className="border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-semibold text-forest-950">
                  {event.title}
                </h3>

                <p className="text-sm text-forest-600 mt-1">
                  {event.date} · {event.venue}
                </p>

                <p className="text-xs text-forest-500 mt-1">
                  {event.registrations_count || 0}/
                  {event.max_participants || 0}{' '}
                  registered
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm(event)
                    setModal(true)
                  }}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
                >
                  <FiEdit2 />
                </button>

                <button
                  onClick={() => del(event.id)}
                  className="p-2 rounded-lg bg-rose-50 text-rose-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No events found." />
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={
          form.id
            ? 'Edit Event'
            : 'Create Event'
        }
        onSave={save}
        saving={saving}
      >
        <Field
          label="Title"
          value={form.title}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              title: value,
            }))
          }
        />

        <Field
          label="Venue"
          value={form.venue}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              venue: value,
            }))
          }
        />

        <Field
          label="Date"
          type="date"
          value={form.date}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              date: value,
            }))
          }
        />

        <Field
          label="Category"
          value={form.category}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              category: value,
            }))
          }
        />

        <Field
          label="Start Time"
          type="time"
          value={form.start_time}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              start_time: value,
            }))
          }
        />

        <Field
          label="Max Participants"
          type="number"
          value={form.max_participants}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              max_participants: value,
            }))
          }
        />

        <div>
          <label className="block text-sm font-medium text-forest-800 mb-1">
            Description
          </label>

          <textarea
            value={form.description || ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                description: e.target.value,
              }))
            }
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm outline-none"
          />
        </div>
      </Modal>
    </div>
  )
}

/* ============================================================
   REGISTRATIONS
============================================================ */

function Registrations() {
  const {
    data,
    loading,
  } = useList('/registrations/?page_size=100')

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950 mb-5">
        Event Registrations
      </h2>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((registration) => (
            <div
              key={registration.id}
              className="border border-emerald-100 rounded-xl p-4"
            >
              <div className="font-semibold">
                {registration.full_name}
              </div>

              <div className="text-sm text-gray-600">
                {registration.event_title ||
                  registration.event?.title}
              </div>

              <div className="text-sm text-gray-600">
                {registration.register_number} ·{' '}
                {registration.email}
              </div>

              <span className="inline-block mt-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                {registration.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No registrations found." />
      )}
    </div>
  )
}

/* ============================================================
   GALLERY
============================================================ */

function Gallery() {
  const {
    data,
    loading,
    reload,
  } = useList('/gallery/?page_size=100')

  const toast = useToast()
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  const upload = async () => {
    if (!file) {
      toast(
        'Select an image first',
        'error'
      )
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()

      formData.append('image', file)
      formData.append('title', title)

      await api.post(
        '/gallery/',
        formData
      )

      toast('Uploaded')

      setFile(null)
      setTitle('')

      reload()
    } catch (error) {
      console.error(
        'Gallery upload error:',
        error.response?.data || error
      )

      toast(
        'Upload failed',
        'error'
      )
    } finally {
      setUploading(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete image?')) {
      return
    }

    try {
      await api.delete(`/gallery/${id}/`)

      toast('Deleted')
      reload()
    } catch (error) {
      console.error(error)
      toast(
        'Delete failed',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950 mb-5">
        Photo Gallery
      </h2>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(
              e.target.files?.[0] || null
            )
          }
          className="text-sm"
        />

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Caption"
          className="px-3 py-2 rounded-lg border border-emerald-200 text-sm"
        />

        <button
          onClick={upload}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {uploading
            ? 'Uploading...'
            : 'Upload'}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((gallery) => (
            <div
              key={gallery.id}
              className="group relative rounded-xl overflow-hidden bg-emerald-50"
            >
              {gallery.image ? (
                <img
                  src={gallery.image}
                  alt={
                    gallery.title ||
                    'Gallery image'
                  }
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 grid place-items-center text-4xl">
                  📷
                </div>
              )}

              <div className="p-2">
                <div className="text-sm font-medium text-forest-800 truncate">
                  {gallery.title ||
                    'Untitled'}
                </div>
              </div>

              <button
                onClick={() =>
                  del(gallery.id)
                }
                className="absolute top-2 right-2 p-2 rounded-lg bg-rose-600 text-white"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No gallery images found." />
      )}
    </div>
  )
}

/* ============================================================
   TEAM
============================================================ */

function Team() {
  const {
    data,
    loading,
    reload,
  } = useList('/team/?page_size=100')

  const toast = useToast()
  const [form, setForm] = useState({})
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)

    try {
      if (form.id) {
        await api.patch(
          `/team/${form.id}/`,
          form
        )
      } else {
        await api.post(
          '/team/',
          form
        )
      }

      toast('Saved')
      setModal(false)
      reload()
    } catch (error) {
      console.error(
        'Team save error:',
        error.response?.data || error
      )

      toast(
        'Error',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Remove?')) {
      return
    }

    try {
      await api.delete(
        `/team/${id}/`
      )

      toast('Removed')
      reload()
    } catch (error) {
      console.error(error)

      toast(
        'Delete failed',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-950">
          Team Members
        </h2>

        <button
          onClick={() => {
            setForm({})
            setModal(true)
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
        >
          <FiPlus className="inline mr-1" />
          Add
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="grid md:grid-cols-2 gap-3">
          {data.map((member) => (
            <div
              key={member.id}
              className="border border-emerald-100 rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {member.name}
                </div>

                <div className="text-sm text-emerald-700 capitalize">
                  {(member.role || '')
                    .replace(
                      '_',
                      ' '
                    )}
                </div>

                <div className="text-sm text-gray-600">
                  {member.department}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm(member)
                    setModal(true)
                  }}
                  className="p-2 rounded bg-emerald-50 text-emerald-700"
                >
                  <FiEdit2 />
                </button>

                <button
                  onClick={() =>
                    del(member.id)
                  }
                  className="p-2 rounded bg-rose-50 text-rose-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No team members found." />
      )}

      <Modal
        open={modal}
        onClose={() =>
          setModal(false)
        }
        title={
          form.id
            ? 'Edit Member'
            : 'Add Member'
        }
        onSave={save}
        saving={saving}
      >
        <Field
          label="Name"
          value={form.name}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              name: value,
            }))
          }
        />

        <Field
          label="Role"
          type="select"
          options={[
            'faculty',
            'student_coordinator',
            'executive',
          ]}
          value={form.role}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              role: value,
            }))
          }
        />

        <Field
          label="Position / Designation"
          value={form.position}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              position: value,
            }))
          }
        />

        <Field
          label="Department"
          value={form.department}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              department: value,
            }))
          }
        />

        <Field
          label="Year"
          value={form.year}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              year: value,
            }))
          }
        />

        <Field
          label="Email"
          value={form.email}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              email: value,
            }))
          }
        />
      </Modal>
    </div>
  )
}

/* ============================================================
   SDGs
============================================================ */

function SDGs() {
  const {
    data,
    loading,
    reload,
  } = useList('/sdgs/?page_size=20')

  const toast = useToast()
  const [form, setForm] = useState({})
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)

    try {
      if (form.id) {
        await api.patch(
          `/sdgs/${form.id}/`,
          form
        )
      } else {
        await api.post(
          '/sdgs/',
          form
        )
      }

      toast('Saved')
      setModal(false)
      reload()
    } catch (error) {
      console.error(
        'SDG save error:',
        error.response?.data || error
      )

      toast(
        'Error',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-950">
          Sustainable Development Goals
        </h2>

        <button
          onClick={() => {
            setForm({})
            setModal(true)
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
        >
          Add SDG
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((sdg) => (
            <div
              key={sdg.id}
              className="flex items-center gap-3 border border-emerald-100 rounded-xl p-4"
            >
              <span
                className="w-10 h-10 rounded-lg grid place-items-center text-white font-bold text-sm"
                style={{
                  background:
                    sdg.color ||
                    '#10b981',
                }}
              >
                {sdg.number}
              </span>

              <div>
                <div className="font-semibold">
                  {sdg.name}
                </div>

                <div className="text-sm text-gray-500">
                  {sdg.activities?.length ||
                    0}{' '}
                  activities
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No SDGs found." />
      )}

      <Modal
        open={modal}
        onClose={() =>
          setModal(false)
        }
        title="Add SDG"
        onSave={save}
        saving={saving}
      >
        <Field
          label="Number"
          type="number"
          value={form.number}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              number: value,
            }))
          }
        />

        <Field
          label="Name"
          value={form.name}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              name: value,
            }))
          }
        />

        <Field
          label="Color"
          value={form.color}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              color: value,
            }))
          }
        />

        <Field
          label="Icon"
          value={form.icon}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              icon: value,
            }))
          }
        />

        <div>
          <label className="block text-sm font-medium text-forest-800 mb-1">
            Contribution
          </label>

          <textarea
            value={
              form.contribution ||
              ''
            }
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                contribution:
                  e.target.value,
              }))
            }
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm"
          />
        </div>
      </Modal>
    </div>
  )
}

/* ============================================================
   ANNOUNCEMENTS
============================================================ */

function Announcements() {
  const {
    data,
    loading,
    reload,
  } = useList(
    '/announcements/?page_size=50'
  )

  const toast = useToast()
  const [form, setForm] = useState({})
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)

    try {
      if (form.id) {
        await api.patch(
          `/announcements/${form.id}/`,
          form
        )
      } else {
        await api.post(
          '/announcements/',
          form
        )
      }

      toast('Posted')
      setModal(false)
      reload()
    } catch (error) {
      console.error(
        'Announcement save error:',
        error.response?.data || error
      )

      toast(
        'Unable to save announcement',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete?')) {
      return
    }

    try {
      await api.delete(
        `/announcements/${id}/`
      )

      toast('Deleted')
      reload()
    } catch (error) {
      console.error(error)

      toast(
        'Delete failed',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-950">
          Announcements
        </h2>

        <button
          onClick={() => {
            setForm({})
            setModal(true)
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
        >
          Publish
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((announcement) => (
            <div
              key={announcement.id}
              className="border border-emerald-100 rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {announcement.title}
                </div>

                <div className="text-sm text-gray-500">
                  {announcement.category}
                  {announcement.is_pinned
                    ? ' · pinned'
                    : ''}
                </div>
              </div>

              <button
                onClick={() =>
                  del(announcement.id)
                }
                className="p-2 rounded bg-rose-50 text-rose-600"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No announcements found." />
      )}

      <Modal
        open={modal}
        onClose={() =>
          setModal(false)
        }
        title={
          form.id
            ? 'Edit Announcement'
            : 'New Announcement'
        }
        onSave={save}
        saving={saving}
      >
        <Field
          label="Title"
          value={form.title}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              title: value,
            }))
          }
        />

        <div>
          <label className="block text-sm font-medium text-forest-800 mb-1">
            Body
          </label>

          <textarea
            value={
              form.body || ''
            }
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                body: e.target.value,
              }))
            }
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm"
          />
        </div>
      </Modal>
    </div>
  )
}

/* ============================================================
   BLOG
============================================================ */

function Blog() {
  const {
    data,
    loading,
    reload,
  } = useList(
    '/blog/?page_size=50'
  )

  const toast = useToast()
  const [form, setForm] = useState({})
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)

    try {
      if (form.id) {
        await api.patch(
          `/blog/${form.id}/`,
          form
        )
      } else {
        await api.post(
          '/blog/',
          form
        )
      }

      toast('Published')
      setModal(false)
      reload()
    } catch (error) {
      console.error(
        'Blog save error:',
        error.response?.data || error
      )

      toast(
        'Unable to save post',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete post?')) {
      return
    }

    try {
      await api.delete(
        `/blog/${id}/`
      )

      toast('Deleted')
      reload()
    } catch (error) {
      console.error(error)

      toast(
        'Delete failed',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-forest-950">
          Blog Posts
        </h2>

        <button
          onClick={() => {
            setForm({})
            setModal(true)
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
        >
          New Post
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((post) => (
            <div
              key={post.id}
              className="border border-emerald-100 rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {post.title}
                </div>

                <div className="text-sm text-gray-500">
                  {post.category} ·{' '}
                  {post.created_at?.slice(
                    0,
                    10
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  del(post.id)
                }
                className="p-2 rounded bg-rose-50 text-rose-600"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No blog posts found." />
      )}

      <Modal
        open={modal}
        onClose={() =>
          setModal(false)
        }
        title={
          form.id
            ? 'Edit Blog Post'
            : 'New Blog Post'
        }
        onSave={save}
        saving={saving}
      >
        <Field
          label="Title"
          value={form.title}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              title: value,
            }))
          }
        />

        <Field
          label="Category"
          value={form.category}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              category: value,
            }))
          }
        />

        <Field
          label="Author"
          value={form.author}
          onChange={(value) =>
            setForm((f) => ({
              ...f,
              author: value,
            }))
          }
        />

        <div>
          <label className="block text-sm font-medium text-forest-800 mb-1">
            Content
          </label>

          <textarea
            value={
              form.content || ''
            }
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                content:
                  e.target.value,
              }))
            }
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm"
          />
        </div>
      </Modal>
    </div>
  )
}

/* ============================================================
   CERTIFICATES
============================================================ */

function Certificates() {
  const {
    data,
    loading,
    reload,
  } = useList(
    '/participants/?page_size=100'
  )

  const toast = useToast()

  const certify = async (id) => {
    try {
      await api.post(
        `/participants/${id}/certify/`
      )

      toast(
        'Certificate generated!'
      )

      reload()
    } catch (error) {
      console.error(
        'Certificate error:',
        error.response?.data || error
      )

      toast(
        error.response?.data?.detail ||
          'Unable to generate certificate',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950">
        Event Participants → Certificates
      </h2>

      <p className="text-sm text-gray-600 mt-1 mb-5">
        Mark participants as attended and
        generate their certificates.
      </p>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((participant) => (
            <div
              key={participant.id}
              className="border border-emerald-100 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-semibold">
                  {participant.full_name}
                </div>

                <div className="text-sm text-gray-500">
                  {participant.event_title} ·{' '}
                  {participant.register_number}
                </div>
              </div>

              {participant.has_certificate ? (
                <span className="text-emerald-600 text-sm font-semibold">
                  ✓ Certified
                </span>
              ) : (
                <button
                  onClick={() =>
                    certify(
                      participant.id
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold"
                >
                  Generate Certificate
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No participants found." />
      )}
    </div>
  )
}

/* ============================================================
   MESSAGES
============================================================ */

function Messages() {
  const {
    data,
    loading,
  } = useList(
    '/contact/admin/?page_size=50'
  )

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950 mb-5">
        Contact Messages
      </h2>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((message) => (
            <div
              key={message.id}
              className="border border-emerald-100 rounded-xl p-4"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div className="font-semibold">
                  {message.name}{' '}
                  <span className="text-gray-500 font-normal">
                    ({message.email})
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  {message.created_at?.slice(
                    0,
                    10
                  )}
                </div>
              </div>

              <div className="font-medium mt-2">
                {message.subject}
              </div>

              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No messages found." />
      )}
    </div>
  )
}

/* ============================================================
   IMPACT
============================================================ */

function Impact() {
  const {
    data,
    loading,
    reload,
  } = useList(
    '/impact/admin/?page_size=20'
  )

  const toast = useToast()
  const [form, setForm] = useState({})

  const update = async (
    id,
    metric,
    fallback
  ) => {
    try {
      await api.patch(
        `/impact/admin/${id}/`,
        {
          value:
            parseInt(
              form[metric] ??
                fallback,
              10
            ) || 0,
        }
      )

      toast('Updated')
      reload()
    } catch (error) {
      console.error(
        'Impact update error:',
        error.response?.data || error
      )

      toast(
        'Unable to update impact',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950 mb-5">
        Impact Statistics
      </h2>

      {loading ? (
        <Loader />
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-100 rounded-xl p-4"
            >
              <div>
                <div className="font-semibold capitalize">
                  {(item.label ||
                    item.metric ||
                    ''
                  ).replace(
                    /_/g,
                    ' '
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  metric: {item.metric}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={
                    item.value
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [item.metric]:
                        e.target.value,
                    }))
                  }
                  className="w-24 px-2 py-1.5 rounded-lg border border-emerald-200 text-sm"
                />

                <button
                  onClick={() =>
                    update(
                      item.id,
                      item.metric,
                      item.value
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="No impact statistics found." />
      )}
    </div>
  )
}

/* ============================================================
   SETTINGS
============================================================ */

function Settings() {
  const {
    data,
    loading,
    reload,
  } = useList(
    '/settings/admin/?page_size=100'
  )

  const toast = useToast()
  const [edits, setEdits] = useState({})

  const saveAll = async () => {
    try {
      for (
        const [id, value]
        of Object.entries(edits)
      ) {
        await api.patch(
          `/settings/admin/${id}/`,
          {
            value,
          }
        )
      }

      toast(
        'Settings saved'
      )

      setEdits({})
      reload()
    } catch (error) {
      console.error(
        'Settings error:',
        error.response?.data || error
      )

      toast(
        'Unable to save settings',
        'error'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft">

      <h2 className="text-xl font-bold text-forest-950 mb-5">
        Website Settings
      </h2>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {data.map((setting) => (
              <div key={setting.id}>
                <label className="block text-sm font-medium text-forest-800">
                  {setting.label ||
                    setting.key}
                </label>

                <input
                  defaultValue={
                    setting.value || ''
                  }
                  onChange={(e) =>
                    setEdits((f) => ({
                      ...f,
                      [setting.id]:
                        e.target.value,
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveAll}
            className="mt-6 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold"
          >
            Save All Settings
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Tip: Upload the college logo by
            uploading an image below — it will
            be used across the site.
          </p>
        </>
      )}
    </div>
  )
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
}) {
  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-forest-800 mb-1">
          {label}
        </label>

        <select
          value={value || ''}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm outline-none"
        >
          <option value="">
            Select {label}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option.replace(
                '_',
                ' '
              )}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-forest-800 mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ''}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm outline-none"
      />
    </div>
  )
}

