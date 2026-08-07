import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import Loader, { EmptyState } from '../components/Loader'

const CATS = ['All', 'Environment', 'Climate', 'Sustainability', 'Campus', 'SDGs', 'Student Activities']

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [all, setAll] = useState([])

  useEffect(() => {
    api.get('/blog/?page_size=100').then(r => { const d = r.data.results || r.data; setAll(d); setPosts(d) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const apply = (c, query) => {
    let p = all
    if (c !== 'All') p = p.filter(x => x.category === c.toLowerCase())
    if (query) p = p.filter(x => (x.title + ' ' + (x.tags || '') + ' ' + (x.content || '')).toLowerCase().includes(query.toLowerCase()))
    setPosts(p)
  }

  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="News & Blog" title="ECO CLUB Journal" subtitle="Environment, climate, sustainability and student stories from campus." />
        <div className="flex flex-col md:flex-row gap-3 justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => <button key={c} onClick={() => { setCat(c); apply(c, q) }} className={`px-4 py-2 rounded-full text-sm font-medium transition ${cat === c ? 'bg-emerald-600 text-white' : 'bg-white text-forest-700 hover:bg-emerald-50'}`}>{c}</button>)}
          </div>
          <input value={q} onChange={e => { setQ(e.target.value); apply(cat, e.target.value) }} placeholder="Search articles…" className="px-4 py-2 rounded-full border border-emerald-200 max-w-xs w-full" />
        </div>
        {loading ? <Loader /> : posts.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map(p => (
              <Link key={p.id} to={`/blog/${p.slug || p.id}`} className="glass rounded-2xl overflow-hidden hover:shadow-lg transition group h-full">
                <div className="h-44 bg-gradient-to-br from-emerald-700 to-lime-600 overflow-hidden">
                  {p.cover_image ? <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full grid place-items-center text-5xl">📰</div>}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-600 font-semibold uppercase">{p.category}</span>
                    <span className="text-forest-400">·</span><span className="text-forest-500">{p.created_at?.slice(0, 10)}</span>
                  </div>
                  <h3 className="font-display font-semibold text-forest-950 mt-2 line-clamp-2">{p.title}</h3>
                  {p.excerpt && <p className="text-sm text-forest-600/80 mt-2 line-clamp-3">{p.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : <EmptyState title="No articles found" />}
      </section>
    </div>
  )
}