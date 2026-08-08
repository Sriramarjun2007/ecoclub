
import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import { SectionHeading } from '../components/Reveal'
import Loader, { EmptyState } from '../components/Loader'

const CATS = [
  'All',
  'Tree Plantation',
  'Clean Campus',
  'Awareness Campaigns',
  'Workshops',
  'Seminars',
  'Competitions',
  'Community Outreach',
  'Celebrations',
  'Volunteers',
  'Other',
]

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setLoading(true)

    api
      .get('/gallery/?page_size=60')
      .then((r) => {
        setImages(r.data?.results || r.data || [])
      })
      .catch((err) => {
        console.error('Gallery API error:', err)
        setImages([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filtered =
    cat === 'All'
      ? images
      : images.filter(
          (i) => (i.category_name || 'Other') === cat
        )

  return (
    <div className="pt-28 md:pt-32">
      {/* PAGE HEADER */}
      <section className="section bg-cream">
        <div className="container-x">
          <SectionHeading
            eyebrow="Gallery"
            title="Our Activities"
            subtitle="Explore moments and activities from our ECO CLUB."
          />

          {/* CATEGORY FILTERS */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  cat === c
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-forest-700 hover:bg-emerald-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section bg-white">
        <div className="container-x">
          {loading ? (
            <Loader />
          ) : filtered.length ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setLightbox(img)}
                  className="mb-4 block w-full break-inside-avoid group relative overflow-hidden rounded-2xl text-left"
                >
                  {img.image ? (
                    <img
                      src={img.image}
                      alt={
                        img.title ||
                        img.caption ||
                        'Eco Club activity'
                      }
                      className="w-full group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-6xl">
                      📷
                    </div>
                  )}

                  {(img.title || img.caption) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                      <span className="text-white font-medium">
                        {img.title || img.caption}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No gallery images"
              message="There are no activities available in this category yet."
            />
          )}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] bg-black/90 grid place-items-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 text-white text-3xl z-10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            &times;
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full"
          >
            {lightbox.image ? (
              <img
                src={lightbox.image}
                alt={lightbox.title || 'Gallery image'}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            ) : (
              <div className="h-64 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-6xl">
                📷
              </div>
            )}

            {(lightbox.title || lightbox.caption) && (
              <p className="text-center text-white mt-3 font-medium">
                {lightbox.title || lightbox.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
