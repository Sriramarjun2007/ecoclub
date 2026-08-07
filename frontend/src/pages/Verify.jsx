import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import { useSettings } from '../context/SettingsContext'

export default function Verify() {
  const { code: paramCode } = useParams()
  const { s } = useSettings()
  const [code, setCode] = useState(paramCode || '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const verify = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try { const r = await api.post('/certificates/verify/', { code }); setResult(r.data) }
    catch (err) { setError(err.response?.data?.detail || 'Certificate not found.') }
    finally { setLoading(false) }
  }

  return (
    <div className="pt-28">
      <section className="container-x max-w-2xl px-4">
        <SectionHeading eyebrow="Certificate Verification" title="Verify a Certificate" subtitle="Enter a certificate ID or digital verification code." />
        <form onSubmit={verify} className="glass rounded-3xl p-8 flex gap-3">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. ECO-CERT-2026-00124 or verification code" className="flex-1 px-4 py-3 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400" required />
          <button disabled={loading} className="px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-60">{loading ? '…' : 'Verify'}</button>
        </form>

        {error && <div className="mt-6 glass rounded-2xl p-6 text-center border-l-4 border-rose-400"><div className="text-4xl mb-2">❌</div><h3 className="font-bold text-rose-600">Certificate Not Found</h3><p className="text-sm text-forest-600 mt-1">{error}</p></div>}

        {result?.valid && (
          <div className="mt-6 glass rounded-3xl p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-display text-2xl font-bold text-emerald-700">Certificate Verified</h3>
            <p className="mt-1 text-sm text-forest-600">This is an authentic ECO CLUB certificate.</p>
            <div className="mt-6 text-left max-w-md mx-auto bg-emerald-50 rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-forest-500">Certificate ID</span><span className="font-mono font-semibold">{result.certificate.certificate_id}</span></div>
              <div className="flex justify-between"><span className="text-forest-500">Student</span><span className="font-semibold">{result.certificate.full_name}</span></div>
              <div className="flex justify-between"><span className="text-forest-500">Event</span><span className="font-semibold">{result.certificate.event_title}</span></div>
              <div className="flex justify-between"><span className="text-forest-500">Issued On</span><span className="font-semibold">{result.certificate.issued_on}</span></div>
              <div className="flex justify-between"><span className="text-forest-500">Organization</span><span className="font-semibold">{s('eco_club_name', 'ECO CLUB')}</span></div>
            </div>
            <p className="mt-4 text-xs text-forest-500">Issued by {s('college_name', 'College Name')} · {s('eco_club_name', 'ECO CLUB')}</p>
          </div>
        )}
      </section>
    </div>
  )
}