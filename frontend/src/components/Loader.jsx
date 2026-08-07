import React from 'react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-emerald-700">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message = '', icon }) {
  return (
    <div className="text-center py-16 text-forest-600">
      <div className="text-5xl mb-3">{icon || '🌿'}</div>
      <h3 className="font-display text-lg font-semibold text-forest-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-forest-600/70">{message}</p>}
    </div>
  )
}