import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNotice from '../../components/admin/AdminNotice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import TableSkeleton from '../../components/admin/TableSkeleton'
import Pagination from '../../components/Pagination'
import SafeImage from '../../components/SafeImage'
import { EmptyState, ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api, { getErrorMessage } from '../../lib/api'
import { formatJumlah } from '../../lib/format'
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from '../../components/Icons'

export default function AdminFarmersPage() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [notice, setNotice] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const farmers = useApiResource(
    () =>
      api.get('/api/admin/farmers', {
        params: {
          search: search || undefined,
          page,
          per_page: 15,
        },
      }),
    [search, page],
  )

  const items = farmers.data?.data ?? []
  const meta = farmers.data?.meta

  const handleSearch = (event) => {
    event.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      await api.delete(`/api/admin/farmers/${deleteTarget.id}`)
      setNotice(`Petani "${deleteTarget.nama}" berhasil dihapus.`)
      setDeleteTarget(null)
      farmers.reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Petani"
        description="Kelola profil petani desa yang tampil di halaman hasil tani dan profil petani."
        actions={
          <Link to="/admin/petani/baru" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Tambah Petani
          </Link>
        }
      />

      <div className="mt-5">
        {notice ? (
          <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </AdminNotice>
        ) : null}
      </div>

      <div className="admin-card mt-5 p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex gap-2" role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama petani atau kelompok..."
              aria-label="Cari petani"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone-500" aria-live="polite">
            {farmers.loading
              ? 'Memuat petani...'
              : `${formatJumlah(meta?.total ?? 0)} petani ditemukan`}
          </p>
          {search ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              Atur ulang pencarian
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        {farmers.loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : farmers.error ? (
          <div className="p-4">
            <ErrorState
              error={farmers.error}
              onRetry={farmers.reload}
              title="Gagal memuat daftar petani"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="search"
              title={search ? 'Petani tidak ditemukan' : 'Belum ada petani'}
              description={
                search
                  ? 'Tidak ada petani yang cocok dengan kata kunci. Coba kata kunci lain.'
                  : 'Tambahkan profil petani agar pembeli mengenal asal hasil panen desa.'
              }
              action={
                search ? (
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Atur ulang pencarian
                  </button>
                ) : (
                  <Link to="/admin/petani/baru" className="btn-primary">
                    <PlusIcon className="h-4 w-4" />
                    Tambah Petani
                  </Link>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="admin-th">Petani</th>
                  <th scope="col" className="admin-th">Kontak Internal</th>
                  <th scope="col" className="admin-th">Jumlah Hasil Tani</th>
                  <th scope="col" className="admin-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-stone-50/70">
                    <td className="admin-td">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={farmer.foto}
                          alt={`Foto ${farmer.nama}`}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                          fallbackClassName="bg-emerald-50 text-emerald-300"
                          iconClassName="h-5 w-5"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">{farmer.nama}</p>
                          <p className="truncate text-xs text-stone-500">
                            {farmer.kelompok ?? 'Tanpa kelompok'}
                          </p>
                          {farmer.lokasi_lahan ? (
                            <p className="truncate text-xs text-stone-400">
                              {farmer.lokasi_lahan}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      {farmer.kontak_internal ? (
                        <span className="font-mono text-xs text-stone-600">
                          {farmer.kontak_internal}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </td>
                    <td className="admin-td">
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <UsersIcon className="h-4 w-4 text-stone-400" />
                        {formatJumlah(farmer.jumlah_produk ?? 0)} hasil tani
                      </span>
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/petani/${farmer.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(farmer)
                            setDeleteError(null)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
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
        disabled={farmers.loading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus petani ini?"
        description={
          deleteTarget
            ? `Petani "${deleteTarget.nama}" akan dihapus permanen. Petani yang masih memiliki hasil tani tidak dapat dihapus.`
            : ''
        }
        confirmLabel="Ya, Hapus Petani"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      />
    </div>
  )
}
