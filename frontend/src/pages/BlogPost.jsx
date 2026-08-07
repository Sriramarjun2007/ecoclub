import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import Loader from '../components/Loader'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  useEffect(() => { api.get(`/blog/${slug}/`).then(r => setPost(r.data)).catch(() => setPost(false)) }, [slug])
  if (post === null) return <div className="pt-28"><Loader /></div>
  if (post === false) return <div className="pt-28 text-center text-forest-700">Article not found.</div>
  return (
    <div className="pt-28">
      <article className="container-x max-w-3xl px-4">
        <div className="text-xs text-emerald-700 font-semibold uppercase tracking-widest">{post.category}</div>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-forest-950 leading-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-forest-600">
          <span>✍️ {post.author || 'ECO CLUB Media Team'}</span>
          <span>·</span><span>{post.created_at?.slice(0, 10)}</span>
        </div>
        {post.cover_image && <div className="mt-6 rounded-2xl overflow-hidden"><img src={post.cover_image} alt={post.title} className="w-full" /></div>}
        <div className="mt-8 text-forest-800 leading-relaxed whitespace-pre-wrap">{post.content}</div>
        {post.tags && <div className="mt-8 flex flex-wrap gap-2">{post.tags.split(',').map(t => <span key={t} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm">#{t.trim()}</span>)}</div>}
      </article>
    </div>
  )
}