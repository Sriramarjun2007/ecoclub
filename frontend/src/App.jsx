import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loader from './components/Loader'
import { ToastProvider } from './lib/toast'


// ========================================
// LAZY LOADED PAGES
// ========================================

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const SDGs = lazy(() => import('./pages/SDGs'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Moments = lazy(() => import('./pages/Moments'))
const Team = lazy(() => import('./pages/Team'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Join = lazy(() => import('./pages/Join'))
const Login = lazy(() => import('./pages/Login'))
const Contact = lazy(() => import('./pages/Contact'))
const Verify = lazy(() => import('./pages/Verify'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const StaticPage = lazy(() => import('./pages/StaticPage'))


// ========================================
// PAGE TRANSITION
// ========================================

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      {children}
    </motion.div>
  )
}


// ========================================
// SCROLL TO TOP
// ========================================

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  return null
}


// ========================================
// APP
// ========================================

export default function App() {
  const location = useLocation()

  return (
    <ToastProvider>

      {/* ========================================
          SCROLL TO TOP ON EVERY PAGE CHANGE
      ======================================== */}
      <ScrollToTop />


      {/* ========================================
          NAVBAR
      ======================================== */}
      <Navbar />


      {/* ========================================
          MAIN CONTENT
      ======================================== */}
      <main>

        <AnimatePresence mode="wait">

          <Suspense
            fallback={
              <div className="min-h-screen grid place-items-center">
                <Loader />
              </div>
            }
          >

            <Routes
              location={location}
              key={location.pathname}
            >

              {/* HOME */}
              <Route
                path="/"
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />


              {/* ABOUT */}
              <Route
                path="/about"
                element={
                  <PageTransition>
                    <About />
                  </PageTransition>
                }
              />


              {/* SDGs */}
              <Route
                path="/sdgs"
                element={
                  <PageTransition>
                    <SDGs />
                  </PageTransition>
                }
              />


              {/* EVENTS */}
              <Route
                path="/events"
                element={
                  <PageTransition>
                    <Events />
                  </PageTransition>
                }
              />


              {/* EVENT DETAIL */}
              <Route
                path="/events/:slug"
                element={
                  <PageTransition>
                    <EventDetail />
                  </PageTransition>
                }
              />


              {/* GALLERY */}
              <Route
                path="/gallery"
                element={
                  <PageTransition>
                    <Gallery />
                  </PageTransition>
                }
              />


              {/* MOMENTS */}
              <Route
                path="/moments"
                element={
                  <PageTransition>
                    <Moments />
                  </PageTransition>
                }
              />


              {/* TEAM */}
              <Route
                path="/team"
                element={
                  <PageTransition>
                    <Team />
                  </PageTransition>
                }
              />


              {/* BLOG */}
              <Route
                path="/blog"
                element={
                  <PageTransition>
                    <Blog />
                  </PageTransition>
                }
              />


              {/* BLOG POST */}
              <Route
                path="/blog/:slug"
                element={
                  <PageTransition>
                    <BlogPost />
                  </PageTransition>
                }
              />


              {/* JOIN */}
              <Route
                path="/join"
                element={
                  <PageTransition>
                    <Join />
                  </PageTransition>
                }
              />


              {/* LOGIN */}
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <Login />
                  </PageTransition>
                }
              />


              {/* CONTACT */}
              <Route
                path="/contact"
                element={
                  <PageTransition>
                    <Contact />
                  </PageTransition>
                }
              />


              {/* VERIFY */}
              <Route
                path="/verify/:code"
                element={
                  <PageTransition>
                    <Verify />
                  </PageTransition>
                }
              />


              {/* DASHBOARD */}
              <Route
                path="/dashboard"
                element={
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                }
              />


              {/* ADMIN */}
              <Route
                path="/admin"
                element={
                  <PageTransition>
                    <Admin />
                  </PageTransition>
                }
              />


              {/* PRIVACY POLICY */}
              <Route
                path="/privacy"
                element={
                  <PageTransition>
                    <StaticPage title="Privacy Policy" />
                  </PageTransition>
                }
              />


              {/* TERMS */}
              <Route
                path="/terms"
                element={
                  <PageTransition>
                    <StaticPage title="Terms of Service" />
                  </PageTransition>
                }
              />


              {/* 404 */}
              <Route
                path="*"
                element={
                  <PageTransition>
                    <StaticPage title="Page Not Found" />
                  </PageTransition>
                }
              />

            </Routes>

          </Suspense>

        </AnimatePresence>

      </main>


      {/* ========================================
          FOOTER
      ======================================== */}
      <Footer />

    </ToastProvider>
  )
}