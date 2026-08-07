import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function StaticPage({ title }) {
  const { s } = useSettings()
  const content = {
    'Privacy Policy': `Your privacy matters. ${s('eco_club_name', 'ECO CLUB')} at ${s('college_name', 'College Name')} collects only the information needed to manage membership, event registrations and certificates. We never sell personal data.`,
    'Terms of Service': `By joining ${s('eco_club_name', 'ECO CLUB')}, you agree to participate responsibly, respect others and follow the club and college code of conduct.`,
  }[title]

  if (title === 'Page Not Found') {
    return (
      <div className="pt-40 min-h-[70vh] text-center px-4">
        <div className="text-7xl mb-4">🌿</div>
        <h1 className="font-display text-3xl font-bold text-forest-950">Page Not Found</h1>
        <p className="mt-2 text-forest-600">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-block mt-6 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="pt-32 min-h-[60vh]">
      <div className="container-x max-w-2xl px-4">
        <h1 className="font-display text-3xl font-bold text-forest-950">{title}</h1>
        <p className="mt-5 text-forest-700 leading-relaxed">{content || 'Content coming soon.'}</p>
        <p className="mt-4 text-sm text-forest-500">© 2026 {s('eco_club_name', 'ECO CLUB')} | {s('college_name', 'College Name')}</p>
      </div>
    </div>
  )
}