
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useToast } from '../lib/toast'
import { SectionHeading } from '../components/Reveal'


const INTERESTS = [
  'Treasurer',
  'Web Development Team',
  'Technical Team (AI, IoT, Robotics & Smart Environmental Solutions)',
  'Graphic Design Team',
  'Content Creator & Content Writing Team',
  'Video Editor',
  'Social Media Team',
  'Marketing & PR Team',
  'Event Coordinators',
]



export default function Join() {
  const toast = useToast()

  const [form, setForm] = useState({})
  const [interests, setInterests] = useState([])
  const [photo, setPhoto] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  const toggle = (interest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  const field = (key, label, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-forest-800 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      <input
        type={type}
        value={form[key] || ''}
        onChange={(e) =>
          setForm((current) => ({
            ...current,
            [key]: e.target.value,
          }))
        }
        required
        className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>
  )

  const submit = async (e) => {
    e.preventDefault()

    if (interests.length === 0) {
      toast('Please select at least one area of interest.', 'error')
      return
    }

    setSubmitting(true)

    const data = new FormData()

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value)
    })

    data.append('areas_of_interest', interests.join(', '))

    if (photo) {
      data.append('profile_photo', photo)
    }

    try {
      const response = await api.post('/auth/register/', data)

      setDone(response.data)

      toast('Membership application submitted!')
    } catch (err) {
      const responseData = err.response?.data

      const message =
        typeof responseData === 'string'
          ? responseData
          : responseData?.error ||
            (responseData && Object.values(responseData).flat()[0]) ||
            'Registration failed. Please try again.'

      toast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
        <section className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-4">🌱</div>

          <h1 className="text-3xl font-bold text-forest-900 mb-3">
            Welcome to the Movement!
          </h1>

          <p className="text-forest-700 mb-5">
            Your application has been received.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-forest-600 mb-1">
              Membership ID
            </p>

            <p className="text-2xl font-bold text-emerald-700">
              {done.membership_id}
            </p>
          </div>

          <p className="text-sm text-forest-600 mb-6">
            Your membership will be active once approved by the coordinator.
            We'll notify you once your application has been reviewed.
          </p>

          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Back to Home
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-50 py-12 pt-28 px-4">
      <section className="max-w-4xl mx-auto">
        <SectionHeading
          eyebrow="Join Us"
          title="Become a Member"
          subtitle="Join us in creating a greener, smarter and more sustainable future."
        />

        <form
          onSubmit={submit}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6"
        >
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {field('first_name', 'First Name')}
              {field('last_name', 'Last Name')}
              {field('register_number', 'Register Number')}
              {field('department', 'Department')}
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">
              Academic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.year || ''}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      year: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">Select Year</option>
                  {['1', '2', '3', '4', 'PG'].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {field('college', 'College')}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-bold text-forest-900 mb-4">
              Contact Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {field('email', 'Email', 'email')}
              {field('phone', 'Phone', 'tel')}

              <div>
                <label className="block text-sm font-medium text-forest-800 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  value={form.password || ''}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      password: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Areas of Interest */}
          <div>
            <label className="block text-sm font-medium text-forest-800 mb-2">
              Areas of Interest <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggle(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    interests.includes(interest)
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-emerald-200 text-forest-700 hover:border-emerald-400'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <p className="text-xs text-forest-500 mt-2">
              Select one or more areas that interest you.
            </p>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Why do you want to join?
            </label>

            <textarea
              rows="4"
              value={form.bio_join || ''}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  bio_join: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Tell us about your interests, skills, ideas, or motivation to join the club..."
            />
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-forest-800 mb-1">
              Profile Photo <span className="text-forest-500">(optional)</span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>

          <p className="text-xs text-center text-forest-600">
            Already a member?{' '}
            <Link
              to="/login"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}
