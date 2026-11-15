import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSettings } from '../contexts/SettingsContext'
import { useVisitTracking } from '../hooks/useVisitTracking'
import { whatsappLink } from '../lib/format'
import {
  CloseIcon,
  LeafIcon,
  LockIcon,
  MenuIcon,
  WhatsAppIcon,
} from './Icons'

const navigation = [
  { label: 'Beranda', to: '/' },
  { label: 'Hasil Tani', to: '/hasil-tani' },
  { label: 'Profil Desa', to: '/#profil-desa', isAnchor: true },
]

const footerPages = [
  { label: 'Hasil Tani', to: '/hasil-tani' },
  { label: 'Potensi Pertanian', to: '/halaman/potensi-pertanian' },
  { label: 'Cerita Petani', to: '/halaman/cerita-petani' },
]

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

function navLinkClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-50 text-emerald-800'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`
}

function mobileNavLinkClass({ isActive }) {
  return `rounded-lg px-3 py-2.5 text-sm font-medium ${
    isActive ? 'bg-emerald-50 text-emerald-800' : 'text-stone-700 hover:bg-stone-100'
  }`
}

export default function Layout() {
  const { settings } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useVisitTracking()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  const namaDesa = settings?.nama_desa ?? 'Desa Banjar Agung'
  const tagline =
    settings?.tagline ??
    'Profil hasil pertanian warga Desa Banjar Agung, Kecamatan Jati Agung, Lampung Selatan.'
  const adminWhatsapp = whatsappLink(
    settings?.nomor_whatsapp,
    'Halo Admin Desa Banjar Agung, saya ingin bertanya tentang hasil tani desa.',
  )
  const socialLinks = settings?.media_sosial ?? {}

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke konten
      </a>

      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={`Logo ${namaDesa}`}
                className="h-10 w-10 rounded-full border border-stone-200 object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                <LeafIcon className="h-5 w-5" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-stone-900">{namaDesa}</span>
              <span className="block truncate text-[11px] font-medium tracking-wide text-emerald-700 uppercase">
                Profil Hasil Tani
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {navigation.map((item) =>
              item.isAnchor ? (
                <Link
                  key={item.to}
                  to={item.to}
                  className={navLinkClass({ isActive: false })}
                >
                  {item.label}
                </Link>
              ) : (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {adminWhatsapp ? (
              <a
                href={adminWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Hubungi Admin
              </a>
            ) : null}

            <Link to="/admin/login" className="btn-admin-login">
              <LockIcon className="h-4 w-4" />
              Login Admin
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 text-stone-700 transition hover:bg-stone-100 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div id="menu-mobile" className="border-t border-stone-200 bg-white md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label="Navigasi seluler">
              {navigation.map((item) =>
                item.isAnchor ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={mobileNavLinkClass({ isActive: false })}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={mobileNavLinkClass}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}

              {adminWhatsapp ? (
                <a
                  href={adminWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp mt-2"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Hubungi Admin via WhatsApp
                </a>
              ) : null}

              <Link to="/admin/login" className="btn-admin-login mt-2">
                <LockIcon className="h-4 w-4" />
                Login Admin
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="konten" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-emerald-950 text-emerald-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-emerald-100">
                <LeafIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">{namaDesa}</p>
                <p className="text-xs text-emerald-300">Profil Hasil Tani</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-200/80">{tagline}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-emerald-100 uppercase">
              Jelajahi
            </h2>
            <ul className="mt-4 space-y-2.5">
              {footerPages.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-emerald-200/80 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-emerald-100 uppercase">
              Hubungi Admin Desa
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-emerald-200/80">
              Warga tidak bertransaksi langsung dengan petani. Admin desa membantu
              memberikan informasi ketersediaan dan pengiriman hasil tani.
            </p>

            {adminWhatsapp ? (
              <a
                href={adminWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp Admin
              </a>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.facebook ? (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-300 hover:text-white"
                >
                  Facebook
                </a>
              ) : null}
              {socialLinks.instagram ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-300 hover:text-white"
                >
                  Instagram
                </a>
              ) : null}
              {socialLinks.youtube ? (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-300 hover:text-white"
                >
                  YouTube
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-emerald-300/70 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} Pemerintah {namaDesa}.</p>
            <div className="flex flex-wrap items-center gap-3">
              <p>Profil hasil tani warga desa.</p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 font-semibold text-emerald-300 transition hover:text-white"
              >
                <LockIcon className="h-3.5 w-3.5" />
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
