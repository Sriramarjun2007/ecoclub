
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useSettings } from '../context/SettingsContext'
import { SectionHeading } from '../components/Reveal'
import { StatCounter, META } from '../components/StatCounter'
import SDGCard from '../components/SDGCard'
import EventCard from '../components/EventCard'
import { Reveal } from '../components/Reveal'
import { FiArrowRight, FiCalendar } from 'react-icons/fi'
import { EmptyState } from '../components/Loader'

const SDG_NUMS = [3, 6, 7, 11, 12, 13, 14, 15, 17]

/*
 * Always return an array from an API response.
 *
 * Supports:
 * 1. Direct array:
 *    [...]
 *
 * 2. Django REST Framework pagination:
 *    { count: 10, results: [...] }
 *
 * 3. Unexpected/null response:
 *    []
 */
const getArray = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.results)) {
    return data.results
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

  useEffect(() => {
    const requests = [

      // Impact
      api.get('/impact/')
        .then((response) => {
          const data = response?.data

          if (data && typeof data === 'object' && !Array.isArray(data)) {
            setImpact(data)
          } else {
            setImpact({})
          }
        })
        .catch((error) => {
          console.error('Impact API error:', error)
          setImpact({})
        }),

      // SDGs
      api.get('/sdgs/', {
        params: {
          page_size: 20
        }
      })
        .then((response) => {
          const all = getArray(response?.data)

          const filtered = all
            .filter(
              (item) =>
                item &&
                SDG_NUMS.includes(Number(item.number))
            )
            .slice(0, 9)

          setSdgs(filtered)
        })
        .catch((error) => {
          console.error('SDGs API error:', error)
          setSdgs([])
        }),

      // Events
      api.get('/events/', {
        params: {
          is_past: false,
          page_size: 6
        }
      })
        .then((response) => {
          setEvents(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Events API error:', error)
          setEvents([])
        }),

      // Memories
      api.get('/memories/', {
        params: {
          page_size: 4
        }
      })
        .then((response) => {
          setMemories(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Memories API error:', error)
          setMemories([])
        }),

      // Gallery
      api.get('/gallery/', {
        params: {
          page_size: 6
        }
      })
        .then((response) => {
          setGallery(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Gallery API error:', error)
          setGallery([])
        }),

      // Team
      api.get('/team/', {
        params: {
          page_size: 6
        }
      })
        .then((response) => {
          setTeam(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Team API error:', error)
          setTeam([])
        }),

      // Announcements
      api.get('/announcements/', {
        params: {
          page_size: 5
        }
      })
        .then((response) => {
          setAnnouncements(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Announcements API error:', error)
          setAnnouncements([])
        }),

      // Blog
      api.get('/blog/', {
        params: {
          page_size: 3
        }
      })
        .then((response) => {
          setBlog(getArray(response?.data))
        })
        .catch((error) => {
          console.error('Blog API error:', error)
          setBlog([])
        })
    ]

    Promise.allSettled(requests)
  }, [])

  /*
   * Convert impact object into an array safely.
   */
  const impactList =
    impact && typeof impact === 'object' && !Array.isArray(impact)
      ? Object.entries(impact)
          .map(([metric, value]) => ({
            ...(META?.[metric] || {}),
            metric,
            value
          }))
          .filter((item) => item.value !== null && item.value !== undefined && item.value !== '')
      : []

  return (
    <div>

      {/* Impact stats */}
      <section className="section bg-cream">
        <div className="container-x">

          <SectionHeading
            eyebrow="Environmental Impact"
            title="Our Impact in Numbers"
            subtitle="Real, measurable results from the ECO CLUB community."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impactList.slice(0, 8).map((item, index) => (
              <Reveal
                key={item.metric}
                delay={index * 0.06}
              >
                <StatCounter
                  value={item.value}
                  label={item.label}
                  icon={item.icon}
                  color={item.color}
                  suffix={item.suffix}
                />
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* About */}
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
              Rooted in the United Nations Sustainable Development Goals,
              our work connects students with real environmental challenges —
              and real solutions.
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

      {/* Mission & Vision */}
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

      {/* SDGs */}
      <section className="section bg-cream">
        <div className="container-x">

          <SectionHeading
            eyebrow="Sustainable Development Goals"
            title="Our Contribution to the SDGs"
            subtitle="Tap any card to explore what ECO CLUB does for that goal."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.isArray(sdgs) &&
              sdgs.map((sdg, index) => (
                <SDGCard
                  key={sdg.id || index}
                  sdg={sdg}
                  delay={index * 0.05}
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

      {/* Upcoming events */}
      <section className="section bg-white">
        <div className="container-x">

          <SectionHeading
            eyebrow="Upcoming Events"
            title="What's Coming Next"
            subtitle="Join us at our next sustainability event."
          />

          {Array.isArray(events) && events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event, index) => (
                <EventCard
                  key={event.id || index}
                  event={event}
                  index={index}
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

      {/* Memories */}
      <section className="section bg-cream">
        <div className="container-x">

          <SectionHeading
            eyebrow="Moments"
            title="Moments That Made a Difference"
          />

          <div className="grid md:grid-cols-2 gap-6">

            {Array.isArray(memories) &&
              memories.map((memory, index) => (
                <Reveal
                  key={memory.id || index}
                  delay={index * 0.08}
                >
                  <div className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row">

                    <div className="md:w-2/5 h-44 md:h-auto bg-gradient-to-br from-emerald-600 to-green-500">

                      {memory.photo ? (
                        <img
                          src={memory.photo}
                          alt={memory.title || 'Eco Club memory'}
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
                        {memory.year}
                      </div>

                      <h3 className="font-display font-semibold text-forest-950 mt-1">
                        {memory.title}
                      </h3>

                      <p className="text-sm text-forest-700/80 mt-2 line-clamp-3">
                        {memory.description}
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

      {/* Gallery */}
      <section className="section bg-white">
        <div className="container-x">

          <SectionHeading
            eyebrow="Gallery"
            title="Recent Activities"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            {Array.isArray(gallery) &&
              gallery.map((item, index) => (
                <Link
                  key={item.id || index}
                  to="/gallery"
                  className="relative group overflow-hidden rounded-2xl h-40 md:h-56"
                >

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || item.caption || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-4xl">
                      📷
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition grid place-items-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-sm font-medium">
                      {item.title || item.caption}
                    </span>
                  </div>

                </Link>
              ))}

          </div>

        </div>
      </section>

      {/* Team */}
      <section className="section bg-cream">
        <div className="container-x">

          <SectionHeading
            eyebrow="Our Team"
            title="Meet the Team"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {Array.isArray(team) &&
              team.map((member, index) => (
                <Reveal
                  key={member.id || index}
                  delay={index * 0.07}
                >
                  <div className="glass rounded-2xl p-5 text-center">

                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-emerald-100 grid place-items-center mb-3">

                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name || 'Team member'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}

                    </div>

                    <h4 className="font-semibold text-forest-950">
                      {member.name}
                    </h4>

                    <div className="text-xs text-emerald-700 font-medium capitalize">
                      {String(member.role || 'Member').replaceAll('_', ' ')}
                    </div>

                    <div className="text-xs text-forest-600/70 mt-1">
                      {member.department}
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

      {/* CTA */}
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

      {/* Announcements */}
      <section className="section bg-white">
        <div className="container-x">

          <SectionHeading
            eyebrow="Announcements"
            title="Latest Updates"
          />

          <div className="space-y-3 max-w-3xl mx-auto">

            {Array.isArray(announcements) &&
              announcements.map((announcement, index) => (
                <Reveal
                  key={announcement.id || index}
                >
                  <div className="flex items-start gap-4 glass rounded-2xl p-5">

                    <span className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 grid place-items-center text-emerald-700">
                      <FiCalendar />
                    </span>

                    <div>

                      <h4 className="font-semibold text-forest-950">
                        {announcement.title}
                      </h4>

                      {announcement.body && (
                        <p className="text-sm text-forest-700/80 mt-1">
                          {announcement.body}
                        </p>
                      )}

                    </div>

                  </div>
                </Reveal>
              ))}

          </div>

        </div>
      </section>

      {/* Blog */}
      <section className="section bg-cream">
        <div className="container-x">

          <SectionHeading
            eyebrow="News & Blog"
            title="From the ECO CLUB Blog"
          />

          <div className="grid md:grid-cols-3 gap-5">

            {Array.isArray(blog) &&
              blog.map((post, index) => (
                <Reveal
                  key={post.id || index}
                  delay={index * 0.08}
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

      {/* Contact CTA */}
      <section className="section bg-white">
        <div className="container-x text-center max-w-xl">

          <SectionHeading
            eyebrow="Contact"
            title="Have a Question?"
            subtitle="Reach out to the ECO CLUB office or drop by the campus."
          />

          <div className="space-y-2 text-forest-700">

            <p>{s('address')}</p>

            <p>
              <a
                href={`mailto:${s('email')}`}
                className="text-emerald-700 font-semibold"
              >
                {s('email')}
              </a>
            </p>

            <p>{s('phone')}</p>

          </div>

        </div>
      </section>

    </div>
  )
}

