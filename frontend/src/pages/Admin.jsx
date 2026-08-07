import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../lib/toast'
import Loader, { EmptyState } from '../components/Loader'
import { FiPlus, FiEdit2, FiTrash2, FiLogOut } from 'react-icons/fi'

const TABS = ['Overview', 'Students', 'Events', 'Registrations', 'Gallery', 'Team', 'SDGs', 'Announcements', 'Blog', 'Certificates', 'Messages', 'Impact', 'Settings']

export default function Admin() {
  const { user, authLoading, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')

  useEffect(() => {
    if (authLoading) return
    if (!user || !isAdmin()) navigate('/login')
  }, [authLoading, user])

  if (authLoading || !user || !isAdmin()) return <div className="pt-40 text-center">Checking access…</div>

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="container-x px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-forest-950">Admin Dashboard</h1>
            <p className="text-sm text-forest-600 mt-1">Manage the ECO CLUB platform · {user?.user?.full_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-4 py-2 rounded-lg bg-white border border-emerald-200 text-sm font-medium text-forest-700">View Site</a>
            <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium"><FiLogOut /> Logout</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white text-forest-700 hover:bg-emerald-50'}`}>{t}</button>)}
        </div>

        {tab === 'Overview' && <Overview onNav={setTab} />}
        {tab === 'Students' && <Students />}
        {tab === 'Events' && <Events />}
        {tab === 'Registrations' && <Registrations />}
        {tab === 'Gallery' && <Gallery />}
        {tab === 'Team' && <Team />}
        {tab === 'SDGs' && <SDGs />}
        {tab === 'Announcements' && <Announcements />}
        {tab === 'Blog' && <Blog />}
        {tab === 'Certificates' && <Certificates />}
        {tab === 'Messages' && <Messages />}
        {tab === 'Impact' && <Impact />}
        {tab === 'Settings' && <Settings />}
      </div>
    </div>
  )
}


function Overview({ onNav }) {
  const [impact, setImpact] = useState(null)
  useEffect(() => { api.get('/impact/').then(r => setImpact(r.data)).catch(() => {}) }, [])
  const cards = [
    ['Students', impact?.members, 'Students', () => onNav('Students')],
    ['Events', impact?.events, 'Events', () => onNav('Events')],
    ['Registrations', impact?.volunteers, 'Volunteers', () => onNav('Registrations')],
    ['Trees Planted', impact?.trees, 'Trees', () => onNav('Impact')],
  ]
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([l, v, u, go]) => <button key={l} onClick={go} className="glass rounded-2xl p-6 text-left hover:shadow-soft transition"><div className="text-xs uppercase text-forest-500 font-semibold">{l}</div><div className="text-3xl font-bold text-forest-950 mt-2">{v?.toLocaleString() || 0}</div><div className="text-xs text-forest-500 mt-1">{label}</div></button>)}
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-forest-950 mb-2">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[['Create Event', 'Events'], ['Manage Gallery', 'Gallery'], ['Team Members', 'Team'], ['Impact Stats', 'Impact'], ['Blog Posts', 'Blog'], ['Announcements', 'Announcements'], ['Website Settings', 'Settings'], ['Certificate / Participants', 'Certificates']].map(([l, t]) => (
            <button key={t} onClick={() => onNav(t)} className="text-left px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-forest-800 font-medium text-sm">{l} →</button>))}
        </div>
      </div>
    </div>
  )
}


function useList(url) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const reload = () => { setLoading(true); api.get(url).then(r => setData(r.data.results || r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(reload, [url])
  return { data, loading, reload }
}

function Modal({ open, onClose, title, children, onSave, saving, color = 'bg-emerald-600' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-display font-semibold">{title}</h3><button onClick={onClose} className="text-2xl text-gray-400">&times;</button></div>
        {children}
        <div className="flex gap-3 mt-5"><button onClick={onSave} disabled={saving} className={`flex-1 py-2.5 rounded-lg text-white font-semibold disabled:opacity-60 ${color}`}>{saving ? 'Saving…' : 'Save'}</button><button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button></div>
      </div>
    </div>
  )
}

/* ---------- Students ---------- */
function Students() {
  const { data, loading } = useList('/auth/memberships/')
  const [q, setQ] = useState('')
  const toast = useToast()
  const filtered = data.filter(m => (m.membership_id + ' ' + (m.profile?.register_number || '')).toLowerCase().includes(q.toLowerCase()))
  const setStatus = async (id, status) => { await api.patch(`/admin/memberships/${id}/`, { status }); toast('Updated') }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Students & Memberships</h3><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>
      {loading ? <Loader /> : filtered.length ? (
        <div className="overflow-auto"><table className="w-full text-sm"><thead className="text-left text-forest-500 text-xs uppercase"><tr><th className="py-2">Member</th><th>ID</th><th>Dept</th><th>Status</th><th>Points</th><th>Action</th></tr></thead><tbody>
          {filtered.map(m => <tr key={m.id} className="border-t border-emerald-50">
            <td className="py-2.5 font-medium text-forest-900">{m.profile?.user?.full_name || m.membership_id}</td>
            <td className="font-mono text-xs">{m.membership_id}</td>
            <td className="text-forest-600">{m.profile?.department}</td>
            <td><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : m.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>{m.status}</span></td>
            <td className="text-emerald-600 font-semibold">{m.eco_points}</td>
            <td className="flex gap-1.5">{m.status !== 'approved' && <button onClick={() => setStatus(m.id, 'approved')} className="px-2 py-1 rounded bg-emerald-600 text-white text-xs">Approve</button>}{m.status !== 'rejected' && <button onClick={() => setStatus(m.id, 'rejected')} className="px-2 py-1 rounded bg-rose-600 text-white text-xs">Reject</button>}</td>
          </tr>)}
        </tbody></table></div>
      ) : <EmptyState title="No memberships" />}
    </div>
  )
}

/* ---------- Events ---------- */
function Events() {
  const { data, loading, reload } = useList('/events/?page_size=100')
  const toast = useToast()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const openNew = () => { setForm({}); setModal(true) }
  const save = async () => {
    setSaving(true)
    try { await api.post('/events/', form); toast('Event created'); setModal(false); reload() }
    catch (e) { toast(Object.values(e.response?.data || {})[0]?.[0] || 'Error', 'error') }
    finally { setSaving(false) }
  }
  const del = async (id) => { if (confirm('Delete this event?')) { await api.delete(`/events/${id}/`); toast('Deleted'); reload() } }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Events</h3><button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> New Event</button></div>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(e => (
        <div key={e.id} className="flex items-center justify-between bg-white rounded-xl p-3">
          <div><div className="font-semibold text-forest-900">{e.title}</div><div className="text-xs text-forest-500">{e.date} · {e.venue} · {e.registrations_count}/{e.max_participants}</div></div>
          <div className="flex gap-2"><button onClick={() => { setForm(e); setModal(true) }} className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><FiEdit2 /></button><button onClick={() => del(e.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600"><FiTrash2 /></button></div>
        </div>))}</div> : <EmptyState title="No events yet" />}
      <Modal open={modal} onClose={() => setModal(false)} title="Create / Edit Event" onSave={save} saving={saving}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <Field label="Venue" value={form.venue} onChange={v => setForm(f => ({ ...f, venue: v }))} />
          <Field label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
          <Field label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
          <Field label="Start Time" type="time" value={form.start_time} onChange={v => setForm(f => ({ ...f, start_time: v }))} />
          <Field label="Max Participants" type="number" value={form.max_participants} onChange={v => setForm(f => ({ ...f, max_participants: v }))} />
        </div>
        <div className="mt-3"><label className="block text-xs font-medium text-forest-600 mb-1">Description</label><textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows="3" className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>
      </Modal>
    </div>
  )
}

/* ---------- Gallery ---------- */
function Gallery() {
  const { data, loading, reload } = useList('/gallery/?page_size=100')
  const toast = useToast()
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const upload = async () => {
    if (!file) return
    const fd = new FormData(); fd.append('image', file); fd.append('title', title)
    await api.post('/gallery/', fd); toast('Uploaded'); reload()
  }
  const del = async (id) => { if (confirm('Delete image?')) { await api.delete(`/gallery/${id}/`); toast('Deleted'); reload() } }
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">Photo Gallery</h3>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Caption" className="px-3 py-2 rounded-lg border border-emerald-200 text-sm" />
        <button onClick={upload} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> Upload</button>
      </div>
      {loading ? <Loader /> : data.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data.map(g => (
          <div key={g.id} className="relative group overflow-hidden rounded-xl">
            {g.image ? <img src={g.image} alt="" className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-emerald-100 grid place-items-center text-3xl">📷</div>}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition grid place-items-center"><button onClick={() => del(g.id)} className="p-2 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100"><FiTrash2 /></button></div>
            {g.title && <div className="absolute bottom-1 left-2 text-xs text-white drop-shadow">{g.title}</div>}
          </div>))}</div>
      ) : <EmptyState title="No images" message="Upload your first photo." />}
    </div>
  )
}

/* ---------- Team ---------- */
function Team() {
  const { data, loading, reload } = useList('/team/?page_size=100')
  const toast = useToast()
  const [form, setForm] = useState({}); const [modal, setModal] = useState(false)
  const save = async () => { try { await api.post('/team/', form); toast('Saved'); setModal(false); reload() } catch (e) { toast('Error', 'error') } }
  const del = async (id) => { if (confirm('Remove?')) { await api.delete(`/team/${id}/`); reload() } }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Team Members</h3><button onClick={() => { setForm({}); setModal(true) }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> Add</button></div>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(t => (
        <div key={t.id} className="flex items-center justify-between bg-white rounded-xl p-3"><div><div className="font-semibold">{t.name}</div><div className="text-xs text-forest-500">{t.role.replace('_',' ')} · {t.department}</div></div>
          <div className="flex gap-2"><button onClick={() => { setForm(t); setModal(true) }} className="p-2 rounded bg-emerald-50 text-emerald-700"><FiEdit2 /></button><button onClick={() => del(t.id)} className="p-2 rounded bg-rose-50 text-rose-600"><FiTrash2 /></button></div></div>))}</div> : <EmptyState title="No team members" />}
      <Modal open={modal} onClose={() => setModal(false)} title="Add / Edit Member" onSave={save}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Role" type="select" options={['faculty','student_coordinator','executive']} value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} />
          <Field label="Position / Designation" value={form.position} onChange={v => setForm(f => ({ ...f, position: v }))} />
          <Field label="Department" value={form.department} onChange={v => setForm(f => ({ ...f, department: v }))} />
          <Field label="Year" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} />
          <Field label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
        </div>
      </Modal>
    </div>
  )
}

/* ---------- SDGs ---------- */
function SDGs() {
  const { data, loading, reload } = useList('/sdgs/?page_size=20')
  const toast = useToast()
  const [form, setForm] = useState({}); const [modal, setModal] = useState(false)
  const save = async () => { try { await api.post('/sdgs/', form); toast('Saved'); setModal(false); reload() } catch (e) { toast('Error', 'error') } }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Sustainable Development Goals</h3><button onClick={() => { setForm({}); setModal(true) }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> Add SDG</button></div>
      {loading ? <Loader /> : data.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{data.map(s => (
        <div key={s.id} className="bg-white rounded-xl p-4"><div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg grid place-items-center text-white font-bold text-sm" style={{ background: s.color }}>{s.number}</span><div className="font-semibold text-sm">{s.name}</div></div><div className="text-xs text-forest-500 mt-1">{s.activities?.length} activities</div></div>))}</div> : <EmptyState title="No SDGs" />}
      <Modal open={modal} onClose={() => setModal(false)} title="Add SDG" onSave={save}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Number" type="number" value={form.number} onChange={v => setForm(f => ({ ...f, number: v }))} />
          <Field label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Field label="Color" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} />
          <Field label="Icon" value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} />
        </div>
        <div className="mt-3"><label className="block text-xs font-medium text-forest-600 mb-1">Contribution</label><textarea value={form.contribution || ''} onChange={e => setForm(f => ({ ...f, contribution: e.target.value }))} rows="2" className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>
      </Modal>
    </div>
  )
}

/* ---------- Announcements ---------- */
function Announcements() {
  const { data, loading, reload } = useList('/announcements/?page_size=50')
  const toast = useToast()
  const [form, setForm] = useState({}); const [modal, setModal] = useState(false)
  const save = async () => { await api.post('/announcements/', form); toast('Posted'); setModal(false); reload() }
  const del = async (id) => { if (confirm('Delete?')) { await api.delete(`/announcements/${id}/`); reload() } }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Announcements</h3><button onClick={() => { setForm({}); setModal(true) }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> Publish</button></div>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(a => (
        <div key={a.id} className="flex items-center justify-between bg-white rounded-xl p-3"><div><div className="font-semibold">{a.title}</div><div className="text-xs text-forest-500">{a.category}{a.is_pinned ? ' · pinned' : ''}</div></div><button onClick={() => del(a.id)} className="p-2 rounded bg-rose-50 text-rose-600"><FiTrash2 /></button></div>))}</div> : <EmptyState title="No announcements" />}
      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement" onSave={save}>
        <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
        <div className="mt-3"><label className="block text-xs font-medium text-forest-600 mb-1">Body</label><textarea value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows="3" className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>
      </Modal>
    </div>
  )
}

/* ---------- Blog ---------- */
function Blog() {
  const { data, loading, reload } = useList('/blog/?page_size=50')
  const toast = useToast()
  const [form, setForm] = useState({}); const [modal, setModal] = useState(false)
  const save = async () => { await api.post('/blog/', form); toast('Published'); setModal(false); reload() }
  const del = async (id) => { if (confirm('Delete post?')) { await api.delete(`/blog/${id}/`); reload() } }
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4"><h3 className="font-display font-semibold">Blog Posts</h3><button onClick={() => { setForm({}); setModal(true) }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold"><FiPlus /> New Post</button></div>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-3"><div><div className="font-semibold">{p.title}</div><div className="text-xs text-forest-500">{p.category} · {p.created_at?.slice(0,10)}</div></div><button onClick={() => del(p.id)} className="p-2 rounded bg-rose-50 text-rose-600"><FiTrash2 /></button></div>))}</div> : <EmptyState title="No posts" />}
      <Modal open={modal} onClose={() => setModal(false)} title="New Blog Post" onSave={save}>
        <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
        <div className="mt-3 grid grid-cols-2 gap-3"><Field label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} /><Field label="Author" value={form.author} onChange={v => setForm(f => ({ ...f, author: v }))} /></div>
        <div className="mt-3"><label className="block text-xs font-medium text-forest-600 mb-1">Content</label><textarea value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows="4" className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>
      </Modal>
    </div>
  )
}

/* ---------- Certificates ---------- */
function Certificates() {
  const { data, loading, reload } = useList('/participants/?page_size=100')
  const toast = useToast()
  const certify = async (id) => { await api.post(`/participants/${id}/certify/`); toast('Certificate generated!'); reload() }
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-2">Event Participants → Certificates</h3>
      <p className="text-xs text-forest-500 mb-4">Mark participants as attended and generate their certificates.</p>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(p => (
        <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-3">
          <div><div className="font-semibold">{p.full_name}</div><div className="text-xs text-forest-500">{p.event_title} · {p.register_number}{p.has_certificate ? ' · ✓ certified' : ''}</div></div>
          {!p.has_certificate ? <button onClick={() => certify(p.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold">Generate Certificate</button> : <span className="text-xs text-emerald-600 font-semibold">✓ Done</span>}
        </div>))}</div> : <EmptyState title="No participants recorded" />}
    </div>
  )
}

/* ---------- Messages ---------- */
function Messages() {
  const { data, loading } = useList('/contact/admin/?page_size=50')
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">Contact Messages</h3>
      {loading ? <Loader /> : data.length ? <div className="space-y-2">{data.map(m => (
        <div key={m.id} className="bg-white rounded-xl p-4"><div className="flex justify-between"><span className="font-semibold">{m.name} <span className="text-forest-400 text-xs font-normal">({m.email})</span></span><span className="text-xs text-forest-400">{m.created_at?.slice(0,10)}</span></div><div className="text-sm text-forest-700 mt-1 font-medium">{m.subject}</div><p className="text-sm text-forest-600 mt-1">{m.message}</p></div>))}</div> : <EmptyState title="No messages yet" />}
    </div>
  )
}

/* ---------- Impact ---------- */
function Impact() {
  const { data, loading, reload } = useList('/impact/admin/?page_size=20')
  const toast = useToast()
  const [form, setForm] = useState({})
  const save = async () => { await api.post('/impact/admin/', form); toast('Saved'); reload() }
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">Impact Statistics</h3>
      {loading ? <Loader /> : data.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{data.map(s => (
        <div key={s.id} className="bg-white rounded-xl p-4"><div className="text-xs uppercase text-forest-500 font-semibold">{s.metric}</div>
          <div className="flex items-center gap-2 mt-2">
            <input type="number" defaultValue={s.value} onChange={e => setForm(f => ({ ...f, [s.metric]: e.target.value }))} className="w-24 px-2 py-1.5 rounded-lg border border-emerald-200 text-sm" />
            <button onClick={() => api.patch(`/impact/admin/${s.id}/`, { value: parseInt(form[s.metric] ?? s.value) }).then(() => { toast('Updated'); reload() })} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm">Update</button>
          </div>
        </div>))}</div> : <EmptyState title="No stats yet" />}
    </div>
  )
}

/* ---------- Settings ---------- */
function Settings() {
  const { data, loading, reload } = useList('/settings/admin/?page_size=100')
  const toast = useToast()
  const [edits, setEdits] = useState({})
  const saveAll = async () => {
    for (const [id, value] of Object.entries(edits)) await api.patch(`/settings/admin/${id}/`, { value })
    toast('Settings saved'); reload()
  }
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-4">Website Settings</h3>
      {loading ? <Loader /> : <div className="grid sm:grid-cols-2 gap-3">
        {data.map(s => <div key={s.id} className="bg-white rounded-xl p-3"><div className="text-xs uppercase text-forest-500 font-semibold">{s.label}</div><input defaultValue={s.value} onChange={e => setEdits(f => ({ ...f, [s.id]: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200 text-sm" /></div>)}
      </div>}
      <button onClick={saveAll} className="mt-5 px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold">Save All Settings</button>
      <p className="mt-3 text-xs text-forest-500">Tip: Upload the college logo by uploading an image below — it will be used across the site.</p>
    </div>
  )
}

/* ---------- small shared components (scoped) ---------- */
function Field({ label, value, onChange, type = 'text', options }) {
  if (type === 'select') {
    return <div><label className="block text-xs font-medium text-forest-600 mb-1">{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm">{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
  }
  return <div><label className="block text-xs font-medium text-forest-600 mb-1">{label}</label>
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-emerald-200 text-sm outline-none" /></div>
}
