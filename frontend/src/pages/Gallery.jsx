import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import Loader, { EmptyState } from '../components/Loader'

const CATS = ['All', 'Tree Plantation', 'Clean Campus', 'Awareness Campaigns', 'Workshops', 'Seminars', 'Competitions', 'Community Outreach', 'Celebrations', 'Volunteers', 'Other']

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/gallery/?page_size=60').then(r => setImages(r.data.results || r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = cat === 'All' ? images : images.filter(i => (i.category_name || 'Other') === cat)

  return (
    <div className="pt-28">
      <section className="container-x px-4">
        <SectionHeading eyebrow="Gallery" title="Photo Gallery" subtitle="A visual record of our plantations, drives, campaigns and celebrations." />
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATS.map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${cat === c ? 'bg-emerald-600 text-white' : 'bg-white text-forest-700 hover:bg-emerald-50'}`}>{c}</button>)}
        </div>
        {loading ? <Loader /> : filtered.length ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {filtered.map(img => (
              <button key={img.id} onClick={() => setLightbox(img)} className="mb-4 block w-full break-inside-avoid group relative overflow-hidden rounded-2xl">
                {img.image ? <img src={img.image} alt={img.title || img.caption} className="w-full group-hover:scale-105 transition duration-700" />
                  : <div className="w-full h-48 bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-4xl">📷</div>}
                {(img.title || img.caption) && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition grid items-end"><div className="text-white text-sm p-3 font-medium opacity-0 group-hover:opacity-100">{img.title || img.caption}</div></div>}
              </button>
            ))}
          </div>
        ) : <EmptyState title="No photos in this category" />}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/90 grid place-items-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white text-3xl">&times;</button>
          <div onClick={e => e.stopPropagation()} className="max-w-4xl w-full">
            {lightbox.image ? <img src={lightbox.image} alt={lightbox.title} className="w-full max-h-[80vh] object-contain rounded-xl" /> : <div className="h-64 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-6xl">📷</div>}
            {(lightbox.title || lightbox.caption) && <p className="text-center text-white mt-3 font-medium">{lightbox.title || lightbox.caption}</p>}
          </div>
        </div>
      )}
    </div>
  )
}