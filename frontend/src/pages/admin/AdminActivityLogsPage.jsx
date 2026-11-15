import { useState } from 'react'
import AdminNotice from '../../components/admin/AdminNotice'
import PageHeader from '../../components/admin/PageHeader'
import TableSkeleton from '../../components/admin/TableSkeleton'
import Pagination from '../../components/Pagination'
import { EmptyState, ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api from '../../lib/api'
import { actionStyles } from '../../lib/admin'
import { formatJumlah, formatTanggal } from '../../lib/format'
import { SearchIcon } from '../../components/Icons'

const initialFilters = {
  aksi: '',
  search: '',
  dari: '',
  sampai: '',
}

const actionLabels = {
  tambah: 'Tambah',
  ubah: 'Ubah',
  hapus: 'Hapus',
}

export default function AdminActivityLogsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const logs = useApiResource(
    () =>
      api.get('/api/admin/activity-logs', {
        params: {
          aksi: filters.aksi || undefined,
          search: filters.search || undefined,
          dari: filters.dari || undefined,
          sampai: filters.sampai || undefined,
          page,
          per_page: 20,
        },
      }),
    [filters, page],
  )

  const items = logs.data?.data ?? []
  const meta = logs.data?.meta

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setPage(1)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    updateFilter('search', searchInput.trim())
  }

  const handleReset = () => {
    setSearchInput('')
    setFilters(initialFilters)
    setPage(1)
  }

  const hasFilters = filters.aksi || filters.search || filters.dari || filters.sampai

  return (
    <div>
      <PageHeader
        title="Log Aktivitas"
        description="Riwayat perubahan data yang dilakukan admin desa."
      />

      <div className="admin-card mt-5 p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex gap-2" role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari deskripsi aktivitas..."
              aria-label="Cari aktivitas"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={filters.aksi}
            onChange={(event) => updateFilter('aksi', event.target.value)}
            aria-label="Filter jenis aksi"
            className="field-input"
          >
            <option value="">Semua aksi</option>
            <option value="tambah">Tambah</option>
            <option value="ubah">Ubah</option>
            <option value="hapus">Hapus</option>
          </select>

          <div>
            <label htmlFor="log-dari" className="sr-only">
              Dari tanggal
            </label>
            <input
              id="log-dari"
              type="date"
              value={filters.dari}
              onChange={(event) => updateFilter('dari', event.target.value)}
              className="field-input"
              title="Dari tanggal"
            />
          </div>

          <div>
            <label htmlFor="log-sampai" className="sr-only">
              Sampai tanggal
            </label>
            <input
              id="log-sampai"
              type="date"
              value={filters.sampai}
              onChange={(event) => updateFilter('sampai', event.target.value)}
              className="field-input"
              title="Sampai tanggal"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone-500" aria-live="polite">
            {logs.loading
              ? 'Memuat log aktivitas...'
              : `${formatJumlah(meta?.total ?? 0)} aktivitas ditemukan`}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              Atur ulang filter
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        {logs.loading ? (
          <TableSkeleton rows={8} columns={4} />
        ) : logs.error ? (
          <div className="p-4">
            <ErrorState
              error={logs.error}
              onRetry={logs.reload}
              title="Gagal memuat log aktivitas"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="search"
              title={hasFilters ? 'Aktivitas tidak ditemukan' : 'Belum ada aktivitas'}
              description={
                hasFilters
                  ? 'Tidak ada aktivitas yang cocok dengan filter. Coba ubah kata kunci atau atur ulang filter.'
                  : 'Log akan terisi otomatis setiap kali admin menambah, mengubah, atau menghapus data.'
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Atur ulang filter
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="admin-th">Waktu</th>
                  <th scope="col" className="admin-th">Aksi</th>
                  <th scope="col" className="admin-th">Deskripsi</th>
                  <th scope="col" className="admin-th">Pengguna</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70">
                    <td className="admin-td whitespace-nowrap text-stone-500">
                      {formatTanggal(log.dibuat_pada, { withTime: true }) ?? '-'}
                    </td>
                    <td className="admin-td">
                      <span
                        className={`badge ${
                          actionStyles[log.aksi] ?? 'bg-stone-200 text-stone-600 ring-stone-500/20'
                        }`}
                      >
                        {actionLabels[log.aksi] ?? log.aksi}
                      </span>
                    </td>
                    <td className="admin-td">
                      <p className="text-stone-800">{log.deskripsi}</p>
                      {log.subjek?.tipe ? (
                        <p className="text-xs text-stone-400">
                          {log.subjek.tipe}
                          {log.subjek.id ? ` #${log.subjek.id}` : ''}
                        </p>
                      ) : null}
                    </td>
                    <td className="admin-td">
                      <p className="text-stone-800">{log.pengguna?.name ?? 'Sistem'}</p>
                      {log.ip_address ? (
                        <p className="font-mono text-xs text-stone-400">{log.ip_address}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        meta={meta}
        onPageChange={(nextPage) => {
          setPage(nextPage)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        disabled={logs.loading}
      />

      <div className="mt-4">
        <AdminNotice variant="info">
          Log aktivitas hanya dapat dilihat. Data ini membantu menelusuri perubahan terakhir
          pada profil hasil tani desa.
        </AdminNotice>
      </div>
    </div>
  )
}
