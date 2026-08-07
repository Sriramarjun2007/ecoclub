
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import Hero, { ScrollingMessage } from '../components/Hero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { StatCounter, META } from '../components/StatCounter'
import SDGCard from '../components/SDGCard'
import EventCard from '../components/EventCard'
import Loader, { EmptyState } from '../components/Loader'
import { FiArrowRight, FiCalendar } from 'react-icons/fi'

const SDG_NUMS = [3, 6, 7, 11, 12, 13, 14, 15, 17]

/*
  Safely convert any API response into an array.

  Handles:
  [
    {...},
    {...}
  ]

  and:

  {
    results: [...]
  }

  and:

  {
    data: [...]
  }

  If the API returns something unexpected,
  it returns [] instead of crashing .map().
*/
const getList = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  return []
}

export default function Home() {
  const { s } = useSettings()

  const [impact, setImpact] = useState(null)
  const [sdgs, setSdgs] = useState([])
  const [events, setEvents] = useState([])
  const [memories, setMemories] = useState([])
  const [gallery, setGallery] = useState([])
  const [team, setTeam] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [blog, setBlog] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const requests = [
      // =========================
      // IMPACT
      // =========================
      api
        .get('/impact/')
        .then((r) => {
          setImpact(r.data || {})
        })
        .catch((err) => {
          console.error('Impact API error:', err)
          setImpact({})
        }),

      // =========================
      // SDGs
      // =========================
      api
        .get('/sdgs/', {
          params: {
            page_size: 20,
          },
        })
        .then((r) => {
          const all = getList(r.data)

          setSdgs(
            all
              .filter((item) =>
                SDG_NUMS.includes(Number(item?.number))
              )
              .slice(0, 9)
          )
        })
        .catch((err) => {
          console.error('SDGs API error:', err)
          setSdgs([])
        }),

      // =========================
      // EVENTS
      // =========================
      api
        .get('/events/', {
          params: {
            is_past: false,
            page_size: 6,
          },
        })
        .then((r) => {
          setEvents(getList(r.data))
        })
        .catch((err) => {
          console.error('Events API error:', err)
          setEvents([])
        }),

      // =========================
      // MEMORIES
      // =========================
      api
        .get('/memories/', {
          params: {
            page_size: 4,
          },
        })
        .then((r) => {
          setMemories(getList(r.data))
        })
        .catch((err) => {
          console.error('Memories API error:', err)
          setMemories([])
        }),

      // =========================
      // GALLERY
      // =========================
      api
        .get('/gallery/', {
          params: {
            page_size: 6,
          },
        })
        .then((r) => {
          setGallery(getList(r.data))
        })
        .catch((err) => {
          console.error('Gallery API error:', err)
          setGallery([])
        }),

      // =========================
      // TEAM
      // =========================
      api
        .get('/team/', {
          params: {
            page_size: 6,
          },
        })
        .then((r) => {
          setTeam(getList(r.data))
        })
        .catch((err) => {
          console.error('Team API error:', err)
          setTeam([])
        }),

      // =========================
      // ANNOUNCEMENTS
      // =========================
      api
        .get('/announcements/', {
          params: {
            page_size: 5,
          },
        })
        .then((r) => {
          setAnnouncements(getList(r.data))
        })
        .catch((err) => {
          console.error('Announcements API error:', err)
          setAnnouncements([])
        }),

      // =========================
      // BLOG
      // =========================
      api
        .get('/blog/', {
          params: {
            page_size: 3,
          },
        })
        .then((r) => {
          setBlog(getList(r.data))
        })
        .catch((err) => {
          console.error('Blog API error:', err)
          setBlog([])
        }),
    ]

    Promise.allSettled(requests).finally(() => {
      setLoaded(true)
    })
  }, [])

  // =========================
  // IMPACT DATA
  // =========================
  const impactList =
    impact && typeof impact === 'object' && !Array.isArray(impact)
      ? Object.entries(impact)
          .map(([metric, value]) => ({
            ...(META?.[metric] || {}),
            metric,
            value,
          }))
          .filter((item) => item.value !== null && item.value !== undefined)
      : []

  return (
    <>
      {/* =========================
          HERO
      ========================= */}
      <Hero />

      <ScrollingMessage />

      {/* =========================
          LOADING
      ========================= */}
      {!loaded && (
        <div className="py-8">
          <Loader />
        </div>
      )}

      {/* =========================
          IMPACT STATS
      ========================= */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Environmental Impact"
            title="Our Impact in Numbers"
            subtitle="Real, measurable results from the ECO CLUB community."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.isArray(impactList) &&
              impactList.slice(0, 8).map((k, i) => (
                <Reveal
                  key={k.metric}
                  delay={i * 0.06}
                >
                  <StatCounter
                    value={k.value}
                    label={k.label}
                    icon={k.icon}
                    color={k.color}
                    suffix={k.suffix}
                  />
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}
      <section className="section bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-soft">
                <img
                  src="/hero-about.svg"
                  alt="Eco Club activities"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="inline-block text-emerald-700 text-sm font-semibold uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full">
              About {s('eco_club_name', 'ECO CLUB')}
            </span>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold text-forest-950">
              Empowering Students to Create Sustainable Change
            </h2>

            <p className="mt-5 text-forest-700/80 leading-relaxed">
              ECO CLUB is the college's environmental organization dedicated
              to building a greener, cleaner and more sustainable campus and
              community. Through plantations, clean-up drives, climate
              campaigns, workshops and community outreach, we turn awareness
              into action.
            </p>

            <p className="mt-4 text-forest-700/80 leading-relaxed">
              Rooted in the United Nations Sustainable Development Goals, our
              work connects students with real environmental challenges — and
              real solutions.
            </p>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Learn More
              <FiArrowRight />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* =========================
          MISSION & VISION
      ========================= */}
      <section className="section bg-gradient-to-br from-emerald-900 to-forest-900 text-white">
        <div className="container-x grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur h-full">
              <div className="text-3xl mb-4">🎯</div>

              <h3 className="font-display text-xl font-bold">
                Our Mission
              </h3>

              <p className="mt-3 text-emerald-100/80">
                {s(
                  'mission',
                  'Promote environmental awareness and empower students to participate in practical sustainability initiatives.'
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-white/10 border border-white/15 rounded-3xl p-8 backdrop-blur h-full">
              <div className="text-3xl mb-4">🔭</div>

              <h3 className="font-display text-xl font-bold">
                Our Vision
              </h3>

              <p className="mt-3 text-emerald-100/90">
                {s(
                  'vision',
                  'Build a generation of environmentally responsible students who contribute to a healthier, cleaner and more sustainable future.'
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================
          SDGs
      ========================= */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Sustainable Development Goals"
            title="Our Contribution to the SDGs"
            subtitle="Tap any card to explore what ECO CLUB does for that goal."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.isArray(sdgs) &&
              sdgs.map((sdg, i) => (
                <SDGCard
                  key={sdg.id}
                  sdg={sdg}
                  delay={i * 0.05}
                />
              ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/sdgs"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:gap-3 transition-all"
            >
              View all SDGs
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          UPCOMING EVENTS
      ========================= */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="What's Coming Next"
            subtitle="Join us at our next sustainability event."
          />

          {Array.isArray(events) && events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No upcoming events"
              message="Check back soon."
            />
          )}
        </div>
      </section>

      {/* =========================
          MEMORIES
      ========================= */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Moments"
            title="Moments That Made a Difference"
          />

          <div className="grid md:grid-cols-2 gap-6">
            {Array.isArray(memories) &&
              memories.map((m, i) => (
                <Reveal
                  key={m.id}
                  delay={i * 0.08}
                >
                  <div className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-2/5 h-44 md:h-auto bg-gradient-to-br from-emerald-600 to-green-500">
                      {m.photo ? (
                        <img
                          src={m.photo}
                          alt={m.title || 'Eco Club memory'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-5xl">
                          🌳
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1">
                      <div className="text-xs font-semibold text-emerald-600">
                        {m.year}
                      </div>

                      <h3 className="font-display font-semibold text-forest-950 mt-1">
                        {m.title}
                      </h3>

                      <p className="text-sm text-forest-700/80 mt-2 line-clamp-3">
                        {m.description}
                      </p>

                      <Link
                        to="/moments"
                        className="text-sm text-emerald-700 font-semibold mt-3 inline-block"
                      >
                        View Moments →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* =========================
          GALLERY
      ========================= */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="Gallery"
            title="Recent Activities"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.isArray(gallery) &&
              gallery.map((g) => (
                <Link
                  key={g.id}
                  to="/gallery"
                  className="relative group overflow-hidden rounded-2xl h-40 md:h-56"
                >
                  {g.image ? (
                    <img
                      src={g.image}
                      alt={g.title || g.caption || 'Eco Club activity'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-4xl">
                      📷
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition grid place-items-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-sm font-medium">
                      {g.title || g.caption}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* =========================
          TEAM
      ========================= */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Team"
            title="Meet the Team"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.isArray(team) &&
              team.map((t, i) => (
                <Reveal
                  key={t.id}
                  delay={i * 0.07}
                >
                  <div className="glass rounded-2xl p-5 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-emerald-100 grid place-items-center mb-3">
                      {t.photo ? (
                        <img
                          src={t.photo}
                          alt={t.name || 'Team member'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">
                          👤
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-forest-950">
                      {t.name}
                    </h4>

                    <div className="text-xs text-emerald-700 font-medium capitalize">
                      {t.role
                        ? String(t.role).replace('_', ' ')
                        : ''}
                    </div>

                    <div className="text-xs text-forest-600/70 mt-1">
                      {t.department}
                    </div>
                  </div>
                </Reveal>
              ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold"
            >
              Full Team
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}
      <section className="section bg-gradient-to-br from-emerald-700 to-green-600 text-white text-center">
        <div className="container-x">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold">
              Become a Change Maker
            </h2>

            <p className="mt-3 text-emerald-50/90 max-w-xl mx-auto">
              Join ECO CLUB and take part in a movement for a greener,
              cleaner and more sustainable future.
            </p>

            <Link
              to="/join"
              className="inline-block mt-7 px-8 py-3.5 rounded-lg bg-white text-emerald-700 font-bold hover:bg-emerald-50 transition"
            >
              Join Eco Club
            </Link>
          </Reveal>
        </div>
      </section>

      {/* =========================
          ANNOUNCEMENTS
      ========================= */}
      <section className="section bg-white">
        <div className="container-x">
          <SectionHeading
            eyebrow="Announcements"
            title="Latest Updates"
          />

          <div className="space-y-3 max-w-3xl mx-auto">
            {Array.isArray(announcements) &&
              announcements.map((a) => (
                <Reveal key={a.id}>
                  <div className="flex items-start gap-4 glass rounded-2xl p-5">
                    <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 grid place-items-center text-emerald-700">
                      <FiCalendar />
                    </span>

                    <div>
                      <h4 className="font-semibold text-forest-950">
                        {a.title}
                      </h4>

                      {a.body && (
                        <p className="text-sm text-forest-700/80 mt-1">
                          {a.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* =========================
          BLOG
      ========================= */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="News & Blog"
            title="From the ECO CLUB Blog"
          />

          <div className="grid md:grid-cols-3 gap-5">
            {Array.isArray(blog) &&
              blog.map((post, i) => (
                <Reveal
                  key={post.id}
                  delay={i * 0.08}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="glass rounded-2xl overflow-hidden hover:shadow-lg transition group block h-full"
                  >
                    <div className="h-40 bg-gradient-to-br from-emerald-700 to-lime-600 overflow-hidden">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title || 'Blog post'}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-4xl">
                          📰
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="text-xs text-emerald-600 font-semibold uppercase">
                        {post.category}
                      </div>

                      <h3 className="font-semibold text-forest-950 mt-1 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-xs text-forest-600/70 mt-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT
      ========================= */}
      <section className="section bg-white">
        <div className="container-x text-center max-w-xl">
          <SectionHeading
            eyebrow="Contact"
            title="Have a Question?"
            subtitle="Reach out to the ECO CLUB office or drop by the campus."
          />

          <div className="space-y-2 text-forest-700">
            <p>
              {s('address', '')}
            </p>

            <p>
              <a
                href={`mailto:${s('email', '')}`}
                className="text-emerald-700 font-semibold"
              >
                {s('email', '')}
              </a>
            </p>

            <p>
              {s('phone', '')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

