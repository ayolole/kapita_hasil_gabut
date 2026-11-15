import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AdminNotice from '../../components/admin/AdminNotice'
import { LeafIcon, LockIcon, MailIcon } from '../../components/Icons'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { getErrorMessage, getValidationErrors } from '../../lib/api'

export default function AdminLoginPage() {
  const { user, loading, login } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fromPath = location.state?.from?.pathname
  const redirectTo =
    typeof fromPath === 'string' && fromPath.startsWith('/admin') ? fromPath : '/admin'

  useEffect(() => {
    setGeneralError(null)
  }, [form.email, form.password])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div role="status" className="flex flex-col items-center gap-3">
          <span
            className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700"
            aria-hidden="true"
          />
          <p className="text-sm text-stone-500">Memeriksa sesi...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleChange = (field) => (event) => {
    const value = field === 'remember' ? event.target.checked : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGeneralError(null)

    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const validation = getValidationErrors(error)
      setErrors(validation)

      if (Object.keys(validation).length === 0) {
        setGeneralError(getErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const namaDesa = settings?.nama_desa ?? 'Desa Banjar Agung'

  return (
    <div className="grid min-h-screen bg-stone-100 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-10 text-emerald-50 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <LeafIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold">{namaDesa}</p>
            <p className="text-xs text-emerald-300">Profil Hasil Tani Desa</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl leading-tight font-bold text-white">
            Panel Admin Profil Hasil Tani
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-emerald-100/80">
            Kelola hasil tani, kategori, petani, permintaan informasi, dan halaman profil desa dalam
            satu tempat. Dirancang sederhana agar mudah digunakan perangkat desa.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-emerald-100/90">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
              Perbarui ketersediaan panen dengan satu pilihan.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
              Tindak lanjuti permintaan informasi tanpa kehilangan catatan.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
              Tampilkan profil hasil tani desa kepada pengunjung.
            </li>
          </ul>
        </div>

        <p className="text-xs text-emerald-300/70">
          &copy; {new Date().getFullYear()} Pemerintah {namaDesa}
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <LeafIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-stone-900">{namaDesa}</p>
              <p className="text-xs text-stone-500">Panel Admin Profil Hasil Tani</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-stone-900">Masuk ke Panel Admin</h2>
            <p className="mt-1.5 text-sm text-stone-500">
              Gunakan akun admin desa yang sudah diberikan.
            </p>

            {generalError ? (
              <AdminNotice variant="error" className="mt-4">
                {generalError}
              </AdminNotice>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="field-label">
                  Email Admin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    value={form.email}
                    onChange={handleChange('email')}
                    aria-invalid={Boolean(errors.email)}
                    className="field-input pl-10"
                    placeholder="admin@contoh.desa.id"
                  />
                </div>
                {errors.email ? (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange('password')}
                    aria-invalid={Boolean(errors.password)}
                    className="field-input pl-10"
                    placeholder="Masukkan kata sandi"
                  />
                </div>
                {errors.password ? (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password}</p>
                ) : null}
              </div>

              <label className="flex items-center gap-2.5 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange('remember')}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                />
                Ingat saya di perangkat ini
              </label>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-stone-500">
            <Link to="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Kembali ke situs publik
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
