import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const me = await login(form.username, form.password)
      toast('Welcome back!')
      const role = me.user?.role
      navigate(role === 'admin' || role === 'staff' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="pt-28 min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white grid place-items-center text-2xl mb-3">🌿</div>
          <h1 className="font-display text-2xl font-bold text-forest-950">Welcome Back</h1>
          <p className="text-sm text-forest-600 mt-1">Login to your ECO CLUB account</p>
        </div>
        {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-lg p-2.5 mb-4">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          <div><label className="block text-sm font-medium text-forest-800 mb-1">Username or Email</label>
            <input value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400" /></div>
          <div><label className="block text-sm font-medium text-forest-800 mb-1">Password</label>
            <input type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 outline-none focus:ring-2 focus:ring-emerald-400" /></div>
          <button disabled={loading} className="w-full py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <div className="mt-5 text-center text-sm text-forest-600 space-y-1">
          <p>New student? <Link to="/join" className="text-emerald-700 font-semibold">Join Eco Club</Link></p>
          <p><Link to="/contact" className="text-emerald-700 font-semibold">Forgot password?</Link> Contact the coordinator to reset.</p>
        </div>
      </div>
    </div>
  )
}