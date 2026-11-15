import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, LoadingState } from '../components/StateBlocks'
import { useApiResource } from '../hooks/useApiResource'
import api from '../lib/api'
import { formatTanggalSingkat } from '../lib/format'

export default function StaticPage() {
  const { slug } = useParams()

  const { data, loading, error, reload } = useApiResource(
    () => api.get(`/api/pages/${encodeURIComponent(slug)}`),
    [slug],
  )

  if (loading) {
    return <LoadingState label="Memuat halaman..." />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState error={error} onRetry={reload} title="Gagal memuat halaman" />
      </div>
    )
  }

  const page = data?.data

  if (!page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Halaman tidak ditemukan"
          description="Halaman belum tersedia atau tautannya salah. Coba jelajahi hasil tani."
          action={
            <Link to="/hasil-tani" className="btn-primary">
              Ke Hasil Tani
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <div
        className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10"
      >
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{page.judul}</h1>
        {page.diperbarui_pada ? (
          <p className="mt-2 text-xs text-stone-400">
            Diperbarui {formatTanggalSingkat(page.diperbarui_pada)}
          </p>
        ) : null}

        {page.isi ? (
          <div
            className="prose-desa mt-6"
            // Konten HTML diambil dari halaman yang dikelola admin desa (bukan input pengguna).
            dangerouslySetInnerHTML={{ __html: page.isi }}
          />
        ) : (
          <EmptyState
            title="Halaman belum berisi"
            description="Isi halaman akan tampil setelah ditulis oleh admin desa."
          />
        )}
      </div>
    </article>
  )
}
