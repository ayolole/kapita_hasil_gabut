import { useEffect, useState } from 'react'
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  ActivityIcon,
  CloseIcon,
  DashboardIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LeafIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  TagIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../Icons'

const navigation = [
  {
    group: 'Utama',
    items: [{ to: '/admin', label: 'Ringkasan', icon: DashboardIcon, end: true }],
  },
  {
    group: 'Hasil Tani',
    items: [
      { to: '/admin/produk', label: 'Hasil Tani', icon: PackageIcon },
      { to: '/admin/kategori', label: 'Kategori', icon: TagIcon },
      { to: '/admin/petani', label: 'Petani', icon: UsersIcon },
    ],
  },
  {
    group: 'Permintaan',
    items: [{ to: '/admin/lead', label: 'Permintaan Informasi', icon: WhatsAppIcon }],
  },
  {
    group: 'Situs',
    items: [
      { to: '/admin/pengaturan', label: 'Pengaturan Situs', icon: SettingsIcon },
      { to: '/admin/halaman', label: 'Halaman', icon: FileTextIcon },
      { to: '/admin/log-aktivitas', label: 'Log Aktivitas', icon: ActivityIcon },
    ],
  },
]

function navClass({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-emerald-700 text-white shadow-sm'
      : 'text-emerald-100/80 hover:bg-emerald-800/70 hover:text-white'
  }`
}

function SidebarContent({ onNavigate = null }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      await logout()
    } finally {
      setLoggingOut(false)
      navigate('/admin/login', { replace: true })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
          <LeafIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">Profil Hasil Tani</p>
          <p className="truncate text-xs text-emerald-300">Panel Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2" aria-label="Navigasi admin">
        {navigation.map((section) => (
          <div key={section.group}>
            <p className="px-3 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              {section.group}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={navClass}
                    onClick={onNavigate ?? undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-emerald-800/70 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-800/70 hover:text-white"
          >
            <ExternalLinkIcon className="h-5 w-5 shrink-0" />
            Lihat Situs Publik
          </a>
        </div>
      </nav>

      <div className="border-t border-emerald-800/70 p-3">
        <div className="rounded-xl bg-emerald-900/70 px-3 py-3">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-emerald-300">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-800/70 hover:text-white disabled:opacity-60"
        >
          <LogOutIcon className="h-5 w-5 shrink-0" />
          {loggingOut ? 'Keluar...' : 'Keluar'}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div role="status" className="flex flex-col items-center gap-3">
          <span
            className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700"
            aria-hidden="true"
          />
          <p className="text-sm text-stone-500">Memeriksa sesi admin...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-emerald-950 lg:flex">
        <SidebarContent />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <LeafIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-stone-900">Panel Admin</p>
            <p className="truncate text-xs text-stone-500">{user?.name}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 text-stone-700 transition hover:bg-stone-100"
          aria-expanded={menuOpen}
          aria-controls="menu-admin-mobile"
          aria-label={menuOpen ? 'Tutup menu admin' : 'Buka menu admin'}
        >
          {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-stone-950/50"
          />
          <div
            id="menu-admin-mobile"
            className="relative flex h-full w-72 max-w-[85%] flex-col bg-emerald-950 shadow-2xl"
          >
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
