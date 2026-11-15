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
import { availabilityOptions, availabilityStyles } from '../../lib/admin'
import { formatJumlah } from '../../lib/format'
import {
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/Icons'

const initialFilters = {
  search: '',
  category: '',
  status: '',
  aktif: '',
  trashed: '',
  sort: 'terbaru',
}

export default function AdminProductsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [notice, setNotice] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const categories = useApiResource(() => api.get('/api/admin/categories'), [])

  const products = useApiResource(
    () =>
      api.get('/api/admin/products', {
        params: {
          search: filters.search || undefined,
          category: filters.category || undefined,
          status: filters.status || undefined,
          aktif: filters.aktif === '' ? undefined : filters.aktif,
          trashed: filters.trashed || undefined,
          sort: filters.sort,
          page,
          per_page: 15,
        },
      }),
    [filters, page],
  )

  const items = products.data?.data ?? []
  const meta = products.data?.meta

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setPage(1)
    setActionError(null)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    updateFilter('search', searchInput.trim())
  }

  const handleReset = () => {
    setSearchInput('')
    setFilters(initialFilters)
    setPage(1)
    setActionError(null)
  }

  const handleAvailabilityChange = async (product, value) => {
    if (value === product.status_ketersediaan?.value) {
      return
    }

    setBusyId(product.id)
    setActionError(null)
    setNotice(null)

    try {
      await api.patch(`/api/admin/products/${product.id}/availability`, {
        status_ketersediaan: value,
      })
      setNotice(`Ketersediaan "${product.nama}" berhasil diperbarui.`)
      products.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const handleRestore = async (product) => {
    setBusyId(product.id)
    setActionError(null)
    setNotice(null)

    try {
      await api.post(`/api/admin/products/${product.id}/restore`)
      setNotice(`Hasil tani "${product.nama}" berhasil dipulihkan.`)
      products.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const openDelete = (product) => {
    setDeleteTarget(product)
    setDeleteError(null)
  }

  const closeDelete = () => {
    if (deleting) {
      return
    }

    setDeleteTarget(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      await api.delete(`/api/admin/products/${deleteTarget.id}`)
      setNotice(`Hasil tani "${deleteTarget.nama}" berhasil dihapus dari daftar publik.`)
      setDeleteTarget(null)
      products.reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hasil Tani"
        description="Kelola hasil panen yang tampil di halaman hasil tani, termasuk ketersediaan panen."
        actions={
          <Link to="/admin/produk/baru" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Tambah Hasil Tani
          </Link>
        }
      />

      <div className="mt-5 space-y-3">
        {notice ? (
          <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </AdminNotice>
        ) : null}
        {actionError ? (
          <AdminNotice variant="error" onDismiss={() => setActionError(null)}>
            {actionError}
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
              placeholder="Cari nama atau deskripsi hasil tani..."
              aria-label="Cari hasil tani"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
            aria-label="Filter kategori"
            className="field-input"
          >
            <option value="">Semua kategori</option>
            {(categories.data?.data ?? []).map((category) => (
              <option key={category.id} value={category.slug}>
                {category.nama}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            aria-label="Filter ketersediaan"
            className="field-input"
          >
            <option value="">Semua ketersediaan</option>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.aktif}
            onChange={(event) => updateFilter('aktif', event.target.value)}
            aria-label="Filter status aktif"
            className="field-input"
          >
            <option value="">Aktif &amp; nonaktif</option>
            <option value="1">Hanya aktif</option>
            <option value="0">Hanya nonaktif</option>
          </select>

          <select
            value={filters.trashed}
            onChange={(event) => updateFilter('trashed', event.target.value)}
            aria-label="Filter hasil tani terhapus"
            className="field-input"
          >
            <option value="">Tanpa hasil tani terhapus</option>
            <option value="only">Hanya hasil tani terhapus</option>
          </select>

          <select
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            aria-label="Urutkan hasil tani"
            className="field-input"
          >
            <option value="terbaru">Terbaru</option>
            <option value="nama">Nama A-Z</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone-500" aria-live="polite">
            {products.loading
              ? 'Memuat hasil tani...'
              : `${formatJumlah(meta?.total ?? 0)} hasil tani ditemukan`}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Atur ulang filter
          </button>
        </div>
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        {products.loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : products.error ? (
          <div className="p-4">
            <ErrorState
              error={products.error}
              onRetry={products.reload}
              title="Gagal memuat daftar hasil tani"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={filters.trashed ? 'Tidak ada hasil tani terhapus' : 'Belum ada hasil tani'}
              description={
                filters.search || filters.category || filters.status
                  ? 'Tidak ada hasil tani yang cocok dengan filter. Coba ubah kata kunci atau atur ulang filter.'
                  : 'Tambahkan hasil tani pertama agar pengunjung dapat melihat hasil panen desa.'
              }
              action={
                filters.search || filters.category || filters.status ? (
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Atur ulang filter
                  </button>
                ) : (
                  <Link to="/admin/produk/baru" className="btn-primary">
                    <PlusIcon className="h-4 w-4" />
                    Tambah Hasil Tani
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
                  <th scope="col" className="admin-th">Hasil Tani</th>
                  <th scope="col" className="admin-th">Kategori / Petani</th>
                  <th scope="col" className="admin-th">Ketersediaan</th>
                  <th scope="col" className="admin-th">Status</th>
                  <th scope="col" className="admin-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((product) => {
                  const isTrashed = Boolean(product.dihapus_pada)
                  const isBusy = busyId === product.id

                  return (
                    <tr key={product.id} className="hover:bg-stone-50/70">
                      <td className="admin-td">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={product.gambar_utama}
                            alt={`Foto ${product.nama}`}
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                            fallbackClassName="bg-stone-100 text-stone-300"
                            iconClassName="h-5 w-5"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-stone-900">{product.nama}</p>
                            <p className="truncate text-xs text-stone-400">/{product.slug}</p>
                            {isTrashed ? (
                              <span className="badge mt-1 bg-red-100 text-red-700 ring-red-600/20">
                                Terhapus
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="admin-td">
                        <p className="text-sm text-stone-700">
                          {product.kategori?.nama ?? '-'}
                        </p>
                        <p className="text-xs text-stone-500">{product.petani?.nama ?? '-'}</p>
                      </td>
                      <td className="admin-td">
                        {isTrashed ? (
                          <span
                            className={`badge ${
                              availabilityStyles[product.status_ketersediaan?.value] ??
                              availabilityStyles.tersedia
                            }`}
                          >
                            {product.status_ketersediaan?.label}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={product.status_ketersediaan?.value}
                              onChange={(event) =>
                                handleAvailabilityChange(product, event.target.value)
                              }
                              disabled={isBusy}
                              aria-label={`Ubah ketersediaan ${product.nama}`}
                              className="field-input w-32 py-1.5 text-xs"
                            >
                              {availabilityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {isBusy ? (
                              <span className="text-xs text-stone-400">...</span>
                            ) : null}
                          </div>
                        )}
                      </td>
                      <td className="admin-td">
                        {product.aktif ? (
                          <span className="badge bg-emerald-100 text-emerald-800 ring-emerald-600/20">
                            Aktif
                          </span>
                        ) : (
                          <span className="badge bg-stone-200 text-stone-600 ring-stone-500/20">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="admin-td">
                        <div className="flex items-center justify-end gap-1.5">
                          {isTrashed ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(product)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <RefreshIcon className="h-3.5 w-3.5" />
                              Pulihkan
                            </button>
                          ) : (
                            <>
                              <Link
                                to={`/admin/produk/${product.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => openDelete(product)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
        disabled={products.loading}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus hasil tani ini?"
        description={
          deleteTarget
            ? `Hasil tani "${deleteTarget.nama}" akan dihapus dari daftar publik. Data tetap tersimpan dan dapat dipulihkan kapan saja.`
            : ''
        }
        confirmLabel="Ya, Hapus Hasil Tani"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={closeDelete}
      />
    </div>
  )
}
