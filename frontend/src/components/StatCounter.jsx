
import React, { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'
import {
  FiFeather,
  FiTrash2,
  FiDroplet,
  FiUsers,
  FiActivity,
  FiSun,
  FiCalendar,
  FiUserPlus,
} from 'react-icons/fi'

export const META = {
  trees: {
    icon: FiFeather,
    label: 'Trees Planted',
    color: 'text-emerald-600 bg-emerald-100',
    suffix: '+',
  },

  waste: {
    icon: FiTrash2,
    label: 'Waste Collected',
    color: 'text-amber-600 bg-amber-100',
    suffix: ' kg',
  },

  water: {
    icon: FiDroplet,
    label: 'Water Saved',
    color: 'text-sky-600 bg-sky-100',
    suffix: ' L',
  },

  volunteers: {
    icon: FiUsers,
    label: 'Volunteers',
    color: 'text-indigo-600 bg-indigo-100',
    suffix: '+',
  },

  students: {
    icon: FiActivity,
    label: 'Students Reached',
    color: 'text-violet-600 bg-violet-100',
    suffix: '+',
  },

  campaigns: {
    icon: FiSun,
    label: 'Campaigns Conducted',
    color: 'text-rose-600 bg-rose-100',
    suffix: '+',
  },

  events: {
    icon: FiCalendar,
    label: 'Events Conducted',
    color: 'text-teal-600 bg-teal-100',
    suffix: '+',
  },

  members: {
    icon: FiUserPlus,
    label: 'Total Members',
    color: 'text-green-600 bg-green-100',
    suffix: '+',
  },
}

export function StatCounter({
  value,
  label,
  icon: Icon,
  color = 'text-emerald-600 bg-emerald-100',
  suffix = '',
  duration = 1.6,
}) {
  const ref = useRef(null)

  const inView = useInView(ref, {
    once: true,
    margin: '-40px',
  })

  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        setDisplay(Math.round(v))
      },
    })

    return () => controls.stop()
  }, [inView, value, duration])

  return (
    <div ref={ref} className="text-center">
      <div
        className={`w-12 h-12 mx-auto rounded-full grid place-items-center mb-3 ${color}`}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>

      <div className="text-2xl font-bold text-gray-900">
        {display.toLocaleString()}
        {suffix}
      </div>

      <div className="text-sm text-gray-600 mt-1">
        {label}
      </div>
    </div>
  )
}

export function ImpactCard({ item }) {
  const meta = META[item.metric] || {
    icon: FiFeather,
    label: item.metric,
    color: 'text-emerald-600 bg-emerald-100',
    suffix: '',
  }

  return (
    <StatCounter
      value={Number(item.value) || 0}
      label={item.label || meta.label}
      icon={meta.icon}
      color={meta.color}
      suffix={item.suffix ?? meta.suffix}
    />
  )
}