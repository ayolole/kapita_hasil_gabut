import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../components/Pagination'
import ProductCard from '../components/ProductCard'
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/StateBlocks'
import { useApiResource } from '../hooks/useApiResource'
import api from '../lib/api'
import { SearchIcon } from '../components/Icons'

const availabilityOptions = [
  { value: '', label: 'Semua ketersediaan' },
  { value: 'tersedia', label: 'Tersedia' },
  { value: 'terbatas', label: 'Terbatas' },
  { value: 'habis', label: 'Habis' },
  { value: 'akan_panen', label: 'Akan panen' },
]

const sortOptions = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'nama', label: 'Nama A-Z' },
]

export default function HasilTaniPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchValue = searchParams.get('search') ?? ''
  const categoryValue = searchParams.get('category') ?? ''
  const statusValue = searchParams.get('status') ?? ''
  const sortValue = searchParams.get('sort') || 'terbaru'
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)

  const [searchInput, setSearchInput] = useState(searchValue)

  useEffect(() => {
    setSearchInput(searchValue)
  }, [searchValue])

  const categories = useApiResource(() => api.get('/api/categories'), [])

  const products = useApiResource(
    () =>
      api.get('/api/products', {
        params: {
          search: searchValue || undefined,
          category: categoryValue || undefined,
          status: statusValue || undefined,
          sort: sortValue,
          page,
          per_page: 12,
        },
      }),
    [searchValue, categoryValue, statusValue, sortValue, page],
  )

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined || value === '') {
        next.delete(key)
      } else {
        next.set(String(key), String(value))
      }
    }

    setSearchParams(next)
  }

  const changeFilter = (key, value) => {
    updateParams({ [key]: value, page: null })
  }

  const handleSubmitSearch = (event) => {
    event.preventDefault()
    updateParams({ search: searchInput.trim(), page: null })
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const handleChangePage = (nextPage) => {
    updateParams({ page: nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasFilters = Boolean(
    searchValue || categoryValue || statusValue || sortValue !== 'terbaru' || page > 1,
  )
  const activeCategory = categories.data?.data?.find((category) => category.slug === categoryValue)
  const items = products.data?.data ?? []
  const meta = products.data?.meta

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Profil Hasil Tani</h1>
        <p className="mt-2 max-w-xl text-sm text-stone-500 sm:text-base">
          Hasil panen dari petani warga Desa Banjar Agung. Tanyakan ketersediaan dan
          pengirimannya langsung ke admin desa.
        </p>
      </header>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={handleSubmitSearch} className="flex gap-2" role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              name="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama hasil tani atau deskripsi..."
              aria-label="Cari hasil tani"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={categoryValue}
            onChange={(event) => changeFilter('category', event.target.value)}
            aria-label="Filter kategori"
            className="field-input"
          >
            <option value="">Semua kategori</option>
            {(categories.data?.data ?? []).map((category) => (
              <option key={category.id} value={category.slug}>
                {category.nama}
                {typeof category.jumlah_produk === 'number' ? ` (${category.jumlah_produk})` : ''}
              </option>
            ))}
          </select>

          <select
            value={statusValue}
            onChange={(event) => changeFilter('status', event.target.value)}
            aria-label="Filter ketersediaan"
            className="field-input"
          >
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortValue}
            onChange={(event) => changeFilter('sort', event.target.value)}
            aria-label="Urutkan hasil tani"
            className="field-input"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Hapus semua filter
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-stone-500" aria-live="polite">
          {products.loading ? (
            'Memuat hasil tani...'
          ) : (
            <>
              {meta?.total ?? 0} hasil tani{' '}
              {activeCategory ? (
                <span>
                  pada kategori <strong className="text-stone-700">{activeCategory.nama}</strong>
                </span>
              ) : null}
            </>
          )}
        </p>
      </div>

      <div className="mt-4">
        {products.loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.error ? (
          <ErrorState
            error={products.error}
            onRetry={products.reload}
            title="Gagal memuat hasil tani"
          />
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="search"
            title="Hasil tani tidak ditemukan"
            description={
              searchValue || categoryValue || statusValue
                ? 'Tidak ada hasil tani yang cocok dengan filter Anda. Coba ubah kata kunci atau hapus filter.'
                : 'Belum ada hasil tani yang dipublikasikan. Data akan tampil setelah admin desa menambahkannya.'
            }
            action={
              hasFilters ? (
                <button type="button" onClick={handleReset} className="btn-secondary">
                  Hapus semua filter
                </button>
              ) : null
            }
          />
        )}
      </div>

      <Pagination meta={meta} onPageChange={handleChangePage} disabled={products.loading} />
    </div>
  )
}
