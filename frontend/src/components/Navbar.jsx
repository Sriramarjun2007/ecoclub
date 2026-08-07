import React, { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { FiMenu, FiX, FiFeather, FiUser, FiLogOut, FiLayout } from 'react-icons/fi'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/sdgs', label: 'SDGs' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/moments', label: 'Moments' },
  { to: '/team', label: 'Team' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

// Routes whose top section is a dark background (hero must stay transparent).
const DARK_TOP_ROUTES = ['/']

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { s } = useSettings()
  const { pathname } = useLocation()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // True when the bar is transparent over a dark area -> use light text.
  const light = !scrolled && DARK_TOP_ROUTES.includes(pathname)

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-2' : 'bg-transparent py-4'}`}>
      <div className="container-x flex items-center justify-between px-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 grid place-items-center text-white shadow-glow">
            <FiFeather size={20} />
          </div>
          <div className="leading-tight">
            <div className={`font-display font-bold text-lg ${light ? 'text-white' : 'text-forest-950'}`}>{s('college_name', 'Kalasalingam university')}</div>
            <div className={`text-xs font-semibold tracking-[0.25em] uppercase ${light ? 'text-emerald-300' : 'text-emerald-600'}`}>{s('eco_club_name', 'ECO CLUB')}</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) => `px-3 py-2 text-sm font-medium rounded-lg transition ${isActive
                ? (light ? 'text-emerald-700 bg-white shadow-sm' : 'text-emerald-700 bg-emerald-50')
                : (light ? 'text-emerald-50 hover:bg-white/10 hover:text-white' : 'text-forest-800 hover:bg-emerald-50/60')}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin() && (
                <Link to="/admin" className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${light ? 'text-emerald-50 hover:text-white' : 'text-forest-800 hover:text-emerald-700'}`}>
                  <FiLayout /> Admin
                </Link>
              )}
              <Link to="/dashboard" className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${light ? 'text-emerald-50 hover:text-white' : 'text-forest-800 hover:text-emerald-700'}`}>
                <FiUser /> Dashboard
              </Link>
              <button onClick={logout} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${light ? 'text-rose-300 hover:text-rose-200' : 'text-rose-600'}`}><FiLogOut /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`px-3 py-2 text-sm font-medium rounded-lg ${light ? 'text-emerald-50 hover:text-white' : 'text-forest-800 hover:text-emerald-700'}`}>Login</Link>
              <Link to="/join" className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-glow transition">Join Eco Club</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className={`lg:hidden p-2 ${light ? 'text-white' : 'text-forest-950'}`} onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white/95 backdrop-blur border-t border-emerald-100">
          <nav className="container-x px-4 py-4 flex flex-col">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                className="py-3 text-forest-900 font-medium border-b border-emerald-50">{l.label}</NavLink>
            ))}
            <div className="flex gap-3 pt-4">
              {user ? (
                <button onClick={() => { logout(); setOpen(false) }} className="flex-1 py-2.5 rounded-lg text-center font-semibold text-white bg-rose-600">Logout</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-lg text-center font-semibold text-emerald-700 bg-emerald-50">Login</Link>
                  <Link to="/join" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-lg text-center font-semibold text-white bg-emerald-600">Join Eco Club</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}