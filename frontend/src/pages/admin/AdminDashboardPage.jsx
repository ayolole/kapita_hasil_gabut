import { Link } from 'react-router-dom'
import AdminNotice from '../../components/admin/AdminNotice'
import PageHeader from '../../components/admin/PageHeader'
import { ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api from '../../lib/api'
import { leadStatusOptions, leadStatusStyles } from '../../lib/admin'
import { formatJumlah, formatTanggal } from '../../lib/format'
import {
  ActivityIcon,
  ArrowRightIcon,
  ClockIcon,
  EyeIcon,
  PackageIcon,
  PlusIcon,
  TagIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../../components/Icons'

function StatCard({ label, value, hint, icon: Icon, to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-stone-500">{hint}</p> : null}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="admin-card p-4 transition hover:border-emerald-300 hover:shadow-md sm:p-5"
      >
        {content}
      </Link>
    )
  }

  return <div className="admin-card p-4 sm:p-5">{content}</div>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="admin-card p-5">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton mt-3 h-7 w-1/3" />
            <div className="skeleton mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="admin-card p-5">
            <div className="skeleton h-5 w-1/3" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className="skeleton h-12 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionCard({ title, description, action, children }) {
  return (
    <section className="admin-card">
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-stone-900">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-stone-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function statusLabel(value) {
  return leadStatusOptions.find((option) => option.value === value)?.label ?? value
}

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useApiResource(
    () => api.get('/api/admin/stats'),
    [],
  )

  const stats = data?.data
  const produk = stats?.produk
  const leads = stats?.leads
  const kunjungan = stats?.kunjungan
  const leadTerbaru = Array.isArray(stats?.lead_terbaru) ? stats.lead_terbaru : []
  const produkTerpopuler = Array.isArray(stats?.produk_terpopuler)
    ? stats.produk_terpopuler
    : []
  const aktivitasTerbaru = Array.isArray(stats?.aktivitas_terbaru)
    ? stats.aktivitas_terbaru
    : []

  return (
    <div>
      <PageHeader
        title="Ringkasan"
        description="Pantau kondisi hasil tani dan permintaan informasi yang masuk."
        actions={
          <>
            <Link to="/admin/produk/baru" className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Tambah Hasil Tani
            </Link>
            <Link to="/admin/lead" className="btn-secondary">
              <WhatsAppIcon className="h-4 w-4" />
              Lihat Permintaan
            </Link>
          </>
        }
      />

      {loading ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : error ? (
        <div className="mt-6">
          <ErrorState
            error={error}
            onRetry={reload}
            title="Gagal memuat ringkasan dashboard"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {produk?.habis > 0 || produk?.akan_panen > 0 ? (
            <AdminNotice variant="info">
              Perhatian stok: <strong>{produk?.habis ?? 0} hasil tani habis</strong> dan{' '}
              <strong>{produk?.akan_panen ?? 0} hasil tani akan panen</strong>. Perbarui
              ketersediaannya agar pengunjung mendapat informasi yang benar.
            </AdminNotice>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Hasil Tani Aktif"
              value={formatJumlah(produk?.aktif ?? 0)}
              hint={`dari ${formatJumlah(produk?.total ?? 0)} hasil tani`}
              icon={PackageIcon}
              to="/admin/produk"
            />
            <StatCard
              label="Permintaan Baru"
              value={formatJumlah(leads?.baru ?? 0)}
              hint={`${formatJumlah(leads?.bulan_ini ?? 0)} permintaan bulan ini`}
              icon={WhatsAppIcon}
              to="/admin/lead"
            />
            <StatCard
              label="Petani"
              value={formatJumlah(stats?.petani ?? 0)}
              hint="Profil petani terdaftar"
              icon={UsersIcon}
              to="/admin/petani"
            />
            <StatCard
              label="Kategori"
              value={formatJumlah(stats?.kategori ?? 0)}
              hint="Kelompok hasil tani"
              icon={TagIcon}
              to="/admin/kategori"
            />
            <StatCard
              label="Kunjungan"
              value={formatJumlah(kunjungan?.total ?? 0)}
              hint="Total kunjungan halaman"
              icon={EyeIcon}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard
              title="Permintaan Terbaru"
              description="Permintaan informasi yang baru masuk."
              action={
                <Link
                  to="/admin/lead"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Semua
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              }
            >
              {leadTerbaru.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  Belum ada permintaan masuk. Permintaan akan tampil di sini setelah pengunjung mengirim
                  pesan.
                </p>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {leadTerbaru.map((lead) => (
                    <li key={lead.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-900">
                          {lead.nama_pembeli}
                        </p>
                        <p className="truncate text-sm text-stone-500">
                          {lead.produk?.nama ?? 'Hasil tani dihapus'} &middot;{' '}
                          {lead.kebutuhan || '-'}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-400">
                          {lead.kode_ref} &middot; {formatTanggal(lead.dibuat_pada, { withTime: true })}
                        </p>
                      </div>
                      <span
                        className={`badge shrink-0 ${
                          leadStatusStyles[lead.status?.value] ?? leadStatusStyles.baru
                        }`}
                      >
                        {lead.status?.label ?? statusLabel(lead.status?.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Hasil Tani Terpopuler"
              description="Berdasarkan jumlah kunjungan halaman hasil tani."
              action={
                <Link
                  to="/admin/produk"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Semua
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              }
            >
              {produkTerpopuler.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">
                  Belum ada data kunjungan hasil tani.
                </p>
              ) : (
                <ol className="space-y-3">
                  {produkTerpopuler.map((item, index) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                        {index + 1}
                      </span>
                      <Link
                        to={`/admin/produk/${item.id}`}
                        className="min-w-0 flex-1 truncate font-medium text-stone-800 hover:text-emerald-700"
                      >
                        {item.nama}
                      </Link>
                      <span className="shrink-0 text-sm text-stone-500">
                        {formatJumlah(item.jumlah_kunjungan)} kunjungan
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Aktivitas Terbaru"
            description="Perubahan terakhir yang dilakukan admin."
            action={
              <Link
                to="/admin/log-aktivitas"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Semua log
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            }
          >
            {aktivitasTerbaru.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-500">
                Belum ada aktivitas tercatat.
              </p>
            ) : (
              <ul className="space-y-3">
                {aktivitasTerbaru.map((log) => (
                  <li key={log.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                      <ActivityIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-stone-700">{log.deskripsi}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {formatTanggal(log.dibuat_pada, { withTime: true })}
                        {log.pengguna?.name ? <span>&middot; {log.pengguna.name}</span> : null}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
