import React, { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export default function Contact() {
  const { s } = useSettings()

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({
    type: '',
    message: '',
  })

  // ==========================================
  // SETTINGS
  // ==========================================

  const collegeName = s(
    'college_name',
    'Kalasalingam University'
  )

  const clubName = s(
    'eco_club_name',
    'ECO CLUB'
  )

  const officeName = s(
    'office_name',
    'Eco Club Office'
  )

  const address = s(
    'address',
    'Kalasalingam University, Krishnankoil, Tamil Nadu, India'
  )

  const email = s(
    'email',
    'ecoclub@example.com'
  )

  const phone = s(
    'phone',
    '+91 XXXXX XXXXX'
  )

  // ==========================================
  // INPUT HANDLER
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Remove error when user starts typing
    if (status.type === 'error') {
      setStatus({
        type: '',
        message: '',
      })
    }
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setStatus({
      type: '',
      message: '',
    })

    // Basic validation
    if (!form.name.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your name.',
      })
      return
    }

    if (!form.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your email.',
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      })
      return
    }

    if (!form.subject.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter a subject.',
      })
      return
    }

    if (!form.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your message.',
      })
      return
    }

    try {
      setLoading(true)

      /*
       * If you already have a backend API,
       * replace this section with your API call.
       *
       * Example:
       *
       * await fetch('/api/contact/', {
       *   method: 'POST',
       *   headers: {
       *     'Content-Type': 'application/json',
       *   },
       *   body: JSON.stringify(form),
       * })
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )

      setStatus({
        type: 'success',
        message:
          'Your message has been sent successfully. We will get back to you soon.',
      })

      setForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      console.error(error)

      setStatus({
        type: 'error',
        message:
          'Something went wrong. Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f3]">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="px-6 pb-10 pt-28 lg:px-8 lg:pt-36">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
              {clubName}
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Have a question, suggestion, collaboration idea, or
              want to know more about our activities? We'd love to
              hear from you.
            </p>

          </div>

        </div>

      </section>


      {/* ==========================================
          CONTACT SECTION
      ========================================== */}

      <section className="px-6 pb-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* ======================================
                CONTACT INFORMATION
            ====================================== */}

            <div className="space-y-5">

              {/* COLLEGE */}

              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  College
                </p>

                <h2 className="text-xl font-medium text-slate-800">
                  {collegeName}
                </h2>

              </div>


              {/* OFFICE */}

              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Office
                </p>

                <h2 className="text-xl font-medium text-slate-800">
                  {officeName}
                </h2>

              </div>


              {/* ADDRESS */}

              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Address
                </p>

                <p className="text-lg leading-7 text-slate-800">
                  {address}
                </p>

              </div>


              {/* EMAIL */}

              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Email
                </p>

                <a
                  href={`mailto:${email}`}
                  className="break-all text-lg font-medium text-emerald-700 transition-colors hover:text-emerald-500"
                >
                  {email}
                </a>

              </div>


              {/* PHONE */}

              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Phone
                </p>

                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-lg font-medium text-emerald-700 transition-colors hover:text-emerald-500"
                >
                  {phone}
                </a>

              </div>

            </div>


            {/* ======================================
                CONTACT FORM
            ====================================== */}

            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100 sm:p-10 lg:p-10">

              <div className="mb-8">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Contact Us
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Send us a message
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Fill out the form below and our team will get
                  back to you as soon as possible.
                </p>

              </div>


              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* NAME + EMAIL */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>


                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-800"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />

                  </div>

                </div>


                {/* SUBJECT */}

                <div>

                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What would you like to contact us about?"
                    className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />

                </div>


                {/* MESSAGE */}

                <div>

                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="7"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    className="w-full resize-none rounded-xl border border-emerald-200 bg-white px-4 py-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />

                </div>


                {/* STATUS MESSAGE */}

                {status.message && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      status.type === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-red-200 bg-red-50 text-red-600'
                    }`}
                  >
                    {status.message}
                  </div>
                )}


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <span className="flex items-center gap-3">

                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Sending...

                    </span>
                  ) : (
                    'Send Message'
                  )}

                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

    </div>
  )
}