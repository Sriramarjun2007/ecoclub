import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import Loader from '../components/Loader'
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiUser,
} from 'react-icons/fi'


// ============================================================
// STATUS
// ============================================================

const STATUS_BADGE = {
  open: 'Open for Registration',
  full: 'Registration Full',
  closed: 'Registration Closed',
  past: 'Past Event',
}

const STATUS_COLOR = {
  open: 'bg-emerald-500',
  full: 'bg-rose-500',
  closed: 'bg-amber-500',
  past: 'bg-gray-400',
}


// ============================================================
// EVENT DETAIL
// ============================================================

export default function EventDetail() {
  const { slug } = useParams()
  const [params] = useSearchParams()

  const { user } = useAuth()
  const toast = useToast()

  const [event, setEvent] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(
    params.get('register') === '1'
  )
  const [done, setDone] = useState(null)
  const [already, setAlready] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)


  // ============================================================
  // LOAD EVENT
  // ============================================================

  useEffect(() => {
    let mounted = true

    const getEvent = async () => {
      try {
        setLoading(true)
        setError('')

        const idOrSlug = slug || ''

        const res = await api.get(`/events/${idOrSlug}/`)

        if (!mounted) return

        setEvent(res.data)

        // --------------------------------------------------------
        // AUTO FILL LOGGED-IN USER
        // --------------------------------------------------------

        if (user) {
          const profile = user.profile || {}
          const userData = user.user || user

          setForm({
            full_name:
              userData.full_name ||
              userData.name ||
              '',

            email:
              userData.email ||
              '',

            register_number:
              profile.register_number ||
              '',

            department:
              profile.department ||
              '',

            year:
              profile.year ||
              '',

            college:
              profile.college ||
              '',

            phone:
              userData.phone ||
              '',

            gender:
              profile.gender ||
              '',
          })
        }

      } catch (e) {
        console.error('Event detail error:', e)

        if (!mounted) return

        const message =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          'Event not found'

        setError(message)

        toast(String(message), 'error')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getEvent()

    return () => {
      mounted = false
    }
  }, [slug, user])


  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const submit = async (e) => {
    e.preventDefault()

    if (!event?.id) {
      setError('Event information is unavailable.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await api.post(
        `/events/${event.id}/register/`,
        form
      )

      setDone(res.data)

      toast('Registration Successful!')

    } catch (err) {
      console.error('Registration error:', err)

      const detail = err?.response?.data

      if (typeof detail === 'string') {
        setError(detail)
        toast(detail, 'error')

      } else if (detail?.detail) {
        setError(detail.detail)
        toast(detail.detail, 'error')

      } else if (detail && typeof detail === 'object') {
        const firstError = Object.values(detail)
          .flat()
          .find(Boolean)

        const message =
          firstError ||
          'Unable to register. Please check your details.'

        setError(String(message))
        toast(String(message), 'error')

      } else {
        setError(
          'Unable to register. Please try again.'
        )

        toast(
          'Unable to register. Please try again.',
          'error'
        )
      }

    } finally {
      setSubmitting(false)
    }
  }


  // ============================================================
  // FORM FIELD
  // ============================================================

  const field = (
    key,
    label,
    type = 'text',
    req = true
  ) => (
    <div>

      <label className="mb-1 block text-sm font-medium text-forest-800">
        {label}

        {req && (
          <span className="text-rose-500">
            {' '}*
          </span>
        )}
      </label>

      <input
        type={type}
        value={form[key] || ''}
        onChange={(e) => {
          setForm((f) => ({
            ...f,
            [key]: e.target.value,
          }))

          if (error) {
            setError('')
          }
        }}
        required={req}
        className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400"
      />

    </div>
  )


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="pt-32">
        <Loader />
      </div>
    )
  }


  // ============================================================
  // EVENT NOT FOUND
  // ============================================================

  if (!event) {
    return (
      <div className="px-4 pb-20 pt-32">

        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">

          <div className="mb-3 text-5xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-forest-950">
            Event Not Found
          </h1>

          <p className="mt-2 text-sm text-forest-700">
            {error || 'The event could not be found.'}
          </p>

        </div>

      </div>
    )
  }


  // ============================================================
  // SAFE EVENT VALUES
  // ============================================================

  const registrationStatus =
    event.registration_status || 'closed'

  const statusBadge =
    STATUS_BADGE[registrationStatus] ||
    'Registration Closed'

  const statusColor =
    STATUS_COLOR[registrationStatus] ||
    'bg-gray-400'

  const registrationsCount =
    Number(event.registrations_count) || 0

  const maxParticipants =
    Number(event.max_participants) || 0

  const percentage =
    maxParticipants > 0
      ? Math.min(
          100,
          (registrationsCount / maxParticipants) * 100
        )
      : 0


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="pt-28">

      <div className="container-x px-4">

        {/* ======================================================
            EVENT BANNER
        ====================================================== */}

        <div className="relative h-64 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-green-600 md:h-96">

          {event.banner ? (
            <img
              src={event.banner}
              alt={event.title || 'Event'}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-7xl">
              🌱
            </div>
          )}

          <div className="absolute inset-0 grid items-end bg-gradient-to-t from-black/70 to-transparent p-6">

            <div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase text-white ${statusColor}`}
              >
                {statusBadge}
              </span>

              <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                {event.title || 'Untitled Event'}
              </h1>

            </div>

          </div>

        </div>


        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">


          {/* ====================================================
              LEFT
          ==================================================== */}

          <div className="space-y-8 lg:col-span-2">

            {/* ABOUT */}

            <div className="glass rounded-2xl p-6">

              <h2 className="font-display text-lg font-semibold text-forest-950">
                About this Event
              </h2>

              <p className="mt-3 leading-relaxed text-forest-700/90">
                {event.description ||
                  'Event details will be updated soon.'}
              </p>

            </div>


            {/* AGENDA */}

            {event.agenda && (
              <div className="glass rounded-2xl p-6">

                <h2 className="font-display text-lg font-semibold">
                  Agenda
                </h2>

                <p className="mt-3 whitespace-pre-line text-forest-700/90">
                  {event.agenda}
                </p>

              </div>
            )}


            {/* RULES */}

            {event.rules && (
              <div className="glass rounded-2xl p-6">

                <h2 className="font-display text-lg font-semibold">
                  Rules & Guidelines
                </h2>

                <p className="mt-3 whitespace-pre-line text-forest-700/90">
                  {event.rules}
                </p>

              </div>
            )}

          </div>


          {/* ====================================================
              RIGHT
          ==================================================== */}

          <div className="space-y-6">


            {/* ==================================================
                EVENT DETAILS
            ================================================== */}

            <div className="glass space-y-4 rounded-2xl p-6">

              <h2 className="font-display font-semibold">
                Event Details
              </h2>


              {/* DATE */}

              <div className="flex items-center gap-3 text-forest-800">

                <FiCalendar className="shrink-0 text-emerald-600" />

                <div>

                  <div className="text-xs text-forest-500">
                    Date
                  </div>

                  <div className="font-medium">
                    {event.date || '—'}
                  </div>

                </div>

              </div>


              {/* TIME */}

              <div className="flex items-center gap-3 text-forest-800">

                <FiClock className="shrink-0 text-emerald-600" />

                <div>

                  <div className="text-xs text-forest-500">
                    Time
                  </div>

                  <div className="font-medium">
                    {event.start_time || '—'}

                    {event.end_time
                      ? ` – ${event.end_time}`
                      : ''}
                  </div>

                </div>

              </div>


              {/* VENUE */}

              <div className="flex items-center gap-3 text-forest-800">

                <FiMapPin className="shrink-0 text-emerald-600" />

                <div>

                  <div className="text-xs text-forest-500">
                    Venue
                  </div>

                  <div className="font-medium">
                    {event.venue || '—'}
                  </div>

                </div>

              </div>


              {/* COORDINATOR */}

              <div className="flex items-center gap-3 text-forest-800">

                <FiUser className="shrink-0 text-emerald-600" />

                <div>

                  <div className="text-xs text-forest-500">
                    Coordinator
                  </div>

                  <div className="font-medium">
                    {event.coordinator || '—'}
                  </div>

                </div>

              </div>


              {/* REGISTERED */}

              <div className="flex items-center gap-3 text-forest-800">

                <FiUsers className="text-emerald-600" />

                <div>

                  <div className="text-xs text-forest-500">
                    Registered
                  </div>

                  <div className="font-medium">
                    {registrationsCount}
                    {' / '}
                    {maxParticipants || 'Unlimited'}
                  </div>

                </div>

              </div>


              {/* PROGRESS */}

              {maxParticipants > 0 && (
                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">

                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>
              )}

            </div>


            {/* ==================================================
                REGISTRATION
            ================================================== */}

            <div className="glass rounded-2xl p-6">

              {/* SUCCESS */}

              {done ? (

                <div className="py-6 text-center">

                  <div className="mb-3 text-5xl">
                    ✅
                  </div>

                  <h3 className="font-display text-xl font-bold text-forest-950">
                    Registration Successful!
                  </h3>

                  <p className="mt-2 text-sm text-forest-700">
                    Your Registration ID:
                  </p>

                  <div className="mt-2 font-mono text-lg font-bold text-emerald-700">
                    {done.registration_id || 'Confirmed'}
                  </div>

                  <p className="mt-3 text-xs text-forest-600">
                    You will receive confirmation with the event
                    details. Check your dashboard for updates.
                  </p>

                </div>


              ) : registrationStatus === 'past' ? (

                <div className="py-4 text-center">

                  <p className="font-semibold text-forest-700">
                    This event has concluded.
                  </p>

                </div>


              ) : registrationStatus === 'full' ? (

                <div className="py-4 text-center">

                  <div className="mb-2 text-4xl">
                    😔
                  </div>

                  <p className="font-semibold text-rose-600">
                    Registration Full
                  </p>

                  <p className="mt-1 text-sm text-forest-600">
                    All spots are taken. Follow our announcements
                    for the next event.
                  </p>

                </div>


              ) : registrationStatus === 'closed' ? (

                <div className="py-4 text-center">

                  <p className="font-semibold text-amber-600">
                    Registration Closed
                  </p>

                  <p className="mt-1 text-sm text-forest-600">
                    Registration for this event is currently closed.
                  </p>

                </div>


              ) : (

                <form
                  onSubmit={submit}
                  className="space-y-3"
                >

                  <h2 className="mb-2 font-display font-semibold">
                    Register Now
                  </h2>


                  {/* ERROR */}

                  {error && (
                    <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600">
                      {error}
                    </p>
                  )}


                  {/* FULL NAME + REGISTER NUMBER */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {field(
                      'full_name',
                      'Full Name'
                    )}

                    {field(
                      'register_number',
                      'Register Number'
                    )}

                  </div>


                  {/* DEPARTMENT + YEAR */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {field(
                      'department',
                      'Department'
                    )}


                    <div>

                      <label className="mb-1 block text-sm font-medium">
                        Year
                      </label>

                      <select
                        value={form.year || ''}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            year: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 outline-none"
                      >

                        <option value="">
                          Select Year
                        </option>

                        {['1', '2', '3', '4', 'PG'].map(
                          (y) => (
                            <option
                              key={y}
                              value={y}
                            >
                              {y === 'PG'
                                ? 'Graduate'
                                : `${y} Year`}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                  </div>


                  {/* EMAIL + PHONE */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {field(
                      'email',
                      'Email',
                      'email'
                    )}

                    {field(
                      'phone',
                      'Phone',
                      'tel'
                    )}

                  </div>


                  {/* GENDER + COLLEGE */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div>

                      <label className="mb-1 block text-sm font-medium">
                        Gender
                      </label>

                      <select
                        value={form.gender || ''}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            gender: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-emerald-200 px-4 py-2.5"
                      >

                        <option value="">
                          Select
                        </option>

                        <option value="M">
                          Male
                        </option>

                        <option value="F">
                          Female
                        </option>

                        <option value="O">
                          Other
                        </option>

                      </select>

                    </div>


                    {field(
                      'college',
                      'College',
                      'text',
                      false
                    )}

                  </div>


                  {/* MESSAGE */}

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Optional Message
                    </label>

                    <textarea
                      value={form.message || ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          message: e.target.value,
                        }))
                      }
                      rows="2"
                      className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 outline-none"
                    />

                  </div>


                  {/* LOGIN TIP */}

                  {!user && (
                    <p className="text-xs text-amber-600">
                      Tip: Log in to auto-fill your details and
                      receive eco points.
                    </p>
                  )}


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {submitting
                      ? 'Submitting…'
                      : 'Confirm Registration'}

                  </button>

                </form>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}