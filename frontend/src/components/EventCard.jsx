import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiArrowRight } from 'react-icons/fi'

const STATUS_STYLE = {
  open: 'text-emerald-700 bg-emerald-100',
  full: 'text-rose-700 bg-rose-100',
  closed: 'text-amber-700 bg-amber-100',
  past: 'text-gray-600 bg-gray-200',
}
const STATUS_LABEL = { open: 'Open', full: 'Full', closed: 'Closed', past: 'Past Event' }

export default function EventCard({ event, index = 0 }) {
  const status = event.registration_status || 'open'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="glass rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition group"
    >
      <div className="relative h-44 bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500 overflow-hidden">
        {event.banner ? <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          : <div className="w-full h-full grid place-items-center text-white/70"><FiLeafIcon /></div>}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
        <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full bg-black/40 text-white capitalize">{event.category}</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-forest-950 group-hover:text-emerald-700 transition">{event.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-forest-700">
          <div className="flex items-center gap-2"><FiCalendar className="text-emerald-600" />{event.date}</div>
          <div className="flex items-center gap-2"><FiClock className="text-emerald-600" />{event.start_time}{event.end_time ? ` – ${event.end_time}` : ''}</div>
          <div className="flex items-center gap-2"><FiMapPin className="text-emerald-600" />{event.venue}</div>
          <div className="flex items-center gap-2"><FiUsers className="text-emerald-600" />{event.registrations_count} / {event.max_participants} registered</div>
        </div>
        <div className="mt-5 flex gap-3 mt-auto pt-4">
          <Link to={`/events/${event.slug || event.id}`} className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">View Details</Link>
          <Link to={`/events/${event.slug || event.id}?register=1`} className="flex-1 text-center text-sm font-semibold px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">Register Now</Link>
        </div>
      </div>
    </motion.div>
  )
}

function FlLeafIcon() { return <span className="text-5xl">🌱</span> }