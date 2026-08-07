import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from 'react-icons/fa'

export default function Footer() {
  const { s } = useSettings()

  const socials = [
    { icon: FaFacebookF, url: s('facebook') },
    { icon: FaInstagram, url: s('instagram') },
    { icon: FaTwitter, url: s('twitter') },
    { icon: FaLinkedinIn, url: s('linkedin') },
    { icon: FaYoutube, url: s('youtube') },
  ]

  const quickLinks = [
    ['About', '/about'],
    ['Events', '/events'],
    ['Gallery', '/gallery'],
    ['Join Us', '/join'],
    ['Contact', '/contact'],
    ['Privacy Policy', '/privacy'],
    ['Terms', '/terms'],
  ]

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">

      {/* ========================================
          MAIN FOOTER
      ========================================= */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">

          {/* ========================================
              CLUB INFORMATION
          ========================================= */}
          <div>

            <div className="mb-5">

              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
                {s('college_name', 'Kalasalingam University')}
              </p>

              <h2 className="text-3xl font-bold tracking-tight">
                {s('eco_club_name', 'ECO CLUB')}
              </h2>

            </div>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              “
              {s(
                'footer_text',
                'Creating awareness. Inspiring action. Building a sustainable future.'
              )}
              ”
            </p>

            {/* ========================================
                SOCIAL MEDIA
            ========================================= */}
            <div className="mt-7 flex items-center gap-3">

              {socials
                .filter((x) => x.url)
                .map((S, i) => (
                  <a
                    key={i}
                    href={S.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                    aria-label="Social Media"
                  >
                    <S.icon size={15} />
                  </a>
                ))}

            </div>

          </div>


          {/* ========================================
              QUICK LINKS
          ========================================= */}
          <div>

            <h3 className="mb-6 text-lg font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3">

              {quickLinks.map(([label, to]) => (
                <li key={to}>

                  <Link
                    to={to}
                    className="group inline-flex items-center text-sm text-slate-400 transition-colors duration-300 hover:text-emerald-400"
                  >

                    <span className="mr-2 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>

                    {label}

                  </Link>

                </li>
              ))}

            </ul>

          </div>


          {/* ========================================
              GET IN TOUCH
          ========================================= */}
          <div>

            <h3 className="mb-6 text-lg font-semibold">
              Get in Touch
            </h3>

            <div className="space-y-4 text-sm text-slate-400">

              {/* ADDRESS */}
              {s('address') && (
                <p className="leading-6">
                  {s('address')}
                </p>
              )}

              {/* EMAIL */}
              {s('email') && (
                <a
                  href={`mailto:${s('email')}`}
                  className="block transition-colors duration-300 hover:text-emerald-400"
                >
                  {s('email')}
                </a>
              )}

              {/* PHONE */}
              {s('phone') && (
                <a
                  href={`tel:${s('phone')}`}
                  className="block transition-colors duration-300 hover:text-emerald-400"
                >
                  {s('phone')}
                </a>
              )}


              {/* ========================================
                  WHATSAPP GROUP
              ========================================= */}
              <a
                href="https://chat.whatsapp.com/IIGNa9dAbJmLdOHOykc3Qj"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/20"
              >

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform duration-300 group-hover:scale-110">
                  <FaWhatsapp size={19} />
                </span>

                <span>

                  <span className="block font-semibold text-emerald-400">
                    Join WhatsApp Group
                  </span>

                  <span className="block text-xs text-slate-500">
                    Stay updated with ECO CLUB
                  </span>

                </span>

              </a>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================
          BOTTOM FOOTER
      ========================================= */}
      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center md:flex-row md:px-8 md:text-left">

          <p className="text-sm text-slate-500">

            © 2026{' '}

            <span className="font-medium text-slate-300">
              {s('eco_club_name', 'ECO CLUB')}
            </span>

            {' | '}

            {s(
              'college_name',
              'Kalasalingam University'
            )}

            . All Rights Reserved.

          </p>

          <p className="text-xs text-slate-600">
            Building a Sustainable Future 🌱
          </p>

        </div>

      </div>

    </footer>
  )
}