
import React, { useEffect, useRef, useState } from 'react'
import { useInView, animate } from 'framer-motion'

import {
  FiCode,
  FiCpu,
  FiUsers,
  FiTool,
  FiActivity,
  FiRadio,
  FiCalendar,
  FiUserPlus,
} from 'react-icons/fi'

// ============================================================
// IMPACT META
// ============================================================

export const META = {
  trees: {
    icon: FiCode,
    label: 'Technical Projects',
    color: 'text-emerald-600 bg-emerald-100',
    suffix: '+',
  },

  waste: {
    icon: FiTool,
    label: 'Technical Workshops',
    color: 'text-amber-600 bg-amber-100',
    suffix: '+',
  },

  water: {
    icon: FiCpu,
    label: 'AI & Innovation Projects',
    color: 'text-sky-600 bg-sky-100',
    suffix: '+',
  },

  volunteers: {
    icon: FiUsers,
    label: 'Active Volunteers',
    color: 'text-indigo-600 bg-indigo-100',
    suffix: '+',
  },

  students: {
    icon: FiActivity,
    label: 'Students Engaged',
    color: 'text-violet-600 bg-violet-100',
    suffix: '+',
  },

  campaigns: {
    icon: FiRadio,
    label: 'Tech Awareness Campaigns',
    color: 'text-rose-600 bg-rose-100',
    suffix: '+',
  },

  events: {
    icon: FiCalendar,
    label: 'Technical Events',
    color: 'text-teal-600 bg-teal-100',
    suffix: '+',
  },

  members: {
    icon: FiUserPlus,
    label: 'ECO CLUB Members',
    color: 'text-green-600 bg-green-100',
    suffix: '+',
  },
}

// ============================================================
// STAT COUNTER
// ============================================================

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

    const numericValue = Number(value) || 0

    const controls = animate(
      0,
      numericValue,
      {
        duration,
        ease: 'easeOut',

        onUpdate: (v) => {
          setDisplay(Math.round(v))
        },
      }
    )

    return () => controls.stop()
  }, [inView, value, duration])

  // ==========================================================
  // IMPORTANT
  // Prevent strings/emojis from being rendered as components.
  // ==========================================================

  const SafeIcon =
    typeof Icon === 'function'
      ? Icon
      : FiCode

  return (
    <div
      ref={ref}
      className="text-center"
    >
      {/* ICON */}

      <div
        className={`
          w-12
          h-12
          mx-auto
          rounded-full
          grid
          place-items-center
          mb-3
          ${color}
        `}
      >
        <SafeIcon className="w-6 h-6" />
      </div>

      {/* NUMBER */}

      <div className="text-2xl font-bold text-gray-900">
        {display.toLocaleString()}
        {suffix}
      </div>

      {/* LABEL */}

      <div className="text-sm text-gray-600 mt-1">
        {label}
      </div>
    </div>
  )
}

// ============================================================
// IMPACT CARD
// ============================================================

export function ImpactCard({ item }) {
  const metric = String(
    item?.metric || ''
  ).toLowerCase()

  const meta = META[metric] || {
    icon: FiCode,
    label: item?.metric || 'Impact',
    color: 'text-emerald-600 bg-emerald-100',
    suffix: '',
  }

  return (
    <StatCounter
      value={Number(item?.value) || 0}
      label={item?.label || meta.label}
      icon={meta.icon}
      color={meta.color}
      suffix={
        item?.suffix !== undefined &&
        item?.suffix !== null
          ? item.suffix
          : meta.suffix
      }
    />
  )
}

