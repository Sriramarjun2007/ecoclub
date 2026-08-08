import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import { SectionHeading, Reveal } from '../components/Reveal'
import { StatCounter, META } from '../components/StatCounter'
import Loader from '../components/Loader'

export default function About() {
  const { s } = useSettings()

  const [impact, setImpact] = useState(null)

  useEffect(() => {
    api
      .get('/impact/')
      .then((r) => setImpact(r.data))
      .catch((err) => {
        console.error('Impact API error:', err)
        setImpact({})
      })
  }, [])

  // ============================================================
  // TECHNICAL ECO CLUB OBJECTIVES
  // ============================================================

  const objectives = [
    'Technical innovation for environmental sustainability',
    'AI and machine learning solutions for environmental challenges',
    'IoT-based smart environmental monitoring and automation',
    'Robotics and smart technology for sustainable solutions',
    'Research and development of innovative green technologies',
    'Technical workshops, seminars and hackathons',
    'Student projects focused on real-world environmental problems',
    'Community outreach through technology and digital awareness',
  ]

  // ============================================================
  // IMPACT DATA
  // ============================================================

  const impactList =
    impact && typeof impact === 'object' && !Array.isArray(impact)
      ? Object.entries(impact)
          .map(([metric, value]) => ({
            ...(META[metric] || {}),
            metric,
            value,
          }))
          .filter(
            (item) =>
              item.value !== null &&
              item.value !== undefined &&
              Number(item.value) > 0
          )
      : []

  return (
    <>
      {/* ========================================================
          PAGE HEADING
      ======================================================== */}

      <SectionHeading
        eyebrow="About Us"
        title={`About ${s('eco_club_name', 'TECHNICAL ECO CLUB')}`}
        subtitle={`${s(
          'college_name',
          'College Name'
        )} Technical ECO CLUB — Technology for Sustainability and Innovation.`}
      />

      {/* ========================================================
          ABOUT SECTION
      ======================================================== */}

      <section className="section bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <Reveal>
            <span className="inline-block text-emerald-700 text-sm font-semibold uppercase tracking-widest">
              What is TECHNICAL ECO CLUB?
            </span>

            <h2 className="mt-3 text-3xl font-bold text-forest-950">
              Technology Meets Sustainability
            </h2>

            <p className="mt-4 text-forest-700/80 leading-relaxed">
              {s(
                'about_description',
                'TECHNICAL ECO CLUB is a student-driven platform that combines technology, innovation and environmental sustainability. We encourage students to develop practical technological solutions for real-world environmental challenges.'
              )}
            </p>

            <p className="mt-3 text-forest-700/80 leading-relaxed">
              Our club brings together students interested in Artificial
              Intelligence, IoT, Robotics, Data Science, Software Development
              and emerging technologies to design smart and sustainable
              solutions.
            </p>

            <p className="mt-3 text-forest-700/80 leading-relaxed">
              Through technical workshops, hackathons, seminars, competitions,
              research projects and community initiatives, we transform
              innovative ideas into meaningful environmental impact.
            </p>

            {/* ====================================================
                IMPACT
            ==================================================== */}

            {impactList.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {impactList.slice(0, 6).map((item, index) => (
                  <Reveal
                    key={item.metric}
                    delay={index * 0.05}
                  >
                    <StatCounter
                      value={Number(item.value) || 0}
                      label={item.label || item.metric}
                      icon={item.icon}
                      color={
                        item.color ||
                        'text-emerald-600 bg-emerald-100'
                      }
                      suffix={item.suffix || ''}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </Reveal>

          {/* RIGHT */}
          <Reveal delay={0.1}>
            <div className="glass rounded-3xl p-8">

              <h3 className="font-display text-xl font-bold text-forest-950 mb-5">
                Our Objectives
              </h3>

              <ul className="space-y-3">
                {objectives.map((objective) => (
                  <li
                    key={objective}
                    className="flex items-start gap-3 text-forest-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />

                    <span>
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          </Reveal>

        </div>
      </section>

      {/* ========================================================
          MISSION & VISION
      ======================================================== */}

      <section className="section bg-cream">
        <div className="container-x grid md:grid-cols-2 gap-6">

          {/* MISSION */}

          <Reveal>
            <div className="rounded-3xl p-8 bg-white shadow-soft h-full">

              <div className="text-3xl">
                🎯
              </div>

              <h3 className="font-display text-xl font-bold mt-3">
                Mission
              </h3>

              <p className="mt-3 text-forest-700/80">
                {s(
                  'mission',
                  'Empower students to use technology, innovation and interdisciplinary collaboration to develop practical solutions for environmental and sustainability challenges.'
                )}
              </p>

            </div>
          </Reveal>

          {/* VISION */}

          <Reveal delay={0.1}>
            <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-700 to-green-600 text-white shadow-soft h-full">

              <div className="text-4xl">
                🔭
              </div>

              <h3 className="font-display text-xl font-bold mt-3">
                Vision
              </h3>

              <p className="mt-3 text-emerald-50/90">
                {s(
                  'vision',
                  'Build a generation of technically skilled and environmentally responsible innovators who create intelligent, sustainable and scalable solutions for a better future.'
                )}
              </p>

            </div>
          </Reveal>

        </div>
      </section>
    </>
  )
}