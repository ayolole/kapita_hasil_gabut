import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SafeImage from '../components/SafeImage'
import { EmptyState, ErrorState, LoadingState } from '../components/StateBlocks'
import { useApiResource } from '../hooks/useApiResource'
import api, { isNotFoundError } from '../lib/api'
import { MapPinIcon, UsersIcon } from '../components/Icons'

export default function FarmerProfilePage() {
  const { id } = useParams()

  const { data, loading, error, reload } = useApiResource(
    () => api.get(`/api/farmers/${encodeURIComponent(id)}`),
    [id],
  )

  if (loading) {
    return <LoadingState label="Memuat profil petani..." />
  }

  if (error) {
    if (isNotFoundError(error)) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <UsersIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-stone-900">Petani tidak ditemukan</h1>
          <p className="mt-2 text-sm text-stone-500">
            Profil petani yang Anda cari mungkin sudah dihapus atau tautannya salah.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/hasil-tani" className="btn-primary">
              Ke Hasil Tani
            </Link>
            <Link to="/" className="btn-secondary">
              Ke Beranda
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState error={error} onRetry={reload} title="Gagal memuat profil petani" />
      </div>
    )
  }

  const farmer = data?.data

  if (!farmer) {
    return (
      <EmptyState
        title="Petani tidak ditemukan"
        description="Profil petani tidak tersedia atau sudah dihapus."
        className="mx-4 my-10"
      />
    )
  }

  const products = Array.isArray(farmer.produk) ? farmer.produk : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-stone-500">
          <li>
            <Link to="/" className="hover:text-emerald-700">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-stone-700">{farmer.nama}</li>
        </ol>
      </nav>

      <header className="mt-6 overflow-hidden rounded-3xl bg-emerald-900 text-emerald-50">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
          <SafeImage
            src={farmer.foto}
            alt={`Foto ${farmer.nama}`}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-emerald-800 sm:h-28 sm:w-28"
            fallbackClassName="bg-emerald-800 text-emerald-300"
            iconClassName="h-10 w-10"
          />

          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">
              Profil Petani
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{farmer.nama}</h1>

            {farmer.kelompok ? (
              <p className="mt-2 text-sm text-emerald-100">{farmer.kelompok}</p>
            ) : null}

            {farmer.lokasi_lahan ? (
              <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-emerald-200">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {farmer.lokasi_lahan}
              </p>
            ) : null}

            {typeof farmer.jumlah_produk === 'number' ? (
              <p className="mt-3 inline-flex rounded-full bg-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-600/40">
                {farmer.jumlah_produk} hasil tani
              </p>
            ) : null}
          </div>
        </div>
      </header>

      {farmer.cerita ? (
        <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-stone-900">Cerita Petani</h2>
          <p className="mt-3 leading-relaxed whitespace-pre-line text-sm text-stone-700">
            {farmer.cerita}
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Hasil Tani {products.length > 0 ? `(${products.length})` : ''}</h2>
            <p className="mt-1 text-sm text-stone-500">Hasil panen yang sedang dipasarkan.</p>
          </div>
          <Link
            to="/hasil-tani"
            className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Semua hasil tani
          </Link>
        </div>

        <div className="mt-5">
          {products.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada hasil tani"
              description="Petani ini belum memiliki hasil tani yang dipublikasikan saat ini."
              action={
                <Link to="/hasil-tani" className="btn-secondary">
                  Lihat hasil tani lain
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}
