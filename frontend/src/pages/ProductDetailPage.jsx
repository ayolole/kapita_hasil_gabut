import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import InquiryForm from '../components/InquiryForm'
import SafeImage from '../components/SafeImage'
import StatusBadge from '../components/StatusBadge'
import { ErrorState, LoadingState } from '../components/StateBlocks'
import { useSettings } from '../contexts/SettingsContext'
import { useApiResource } from '../hooks/useApiResource'
import api, { isNotFoundError } from '../lib/api'
import { formatJumlah, formatTanggalSingkat, whatsappLink } from '../lib/format'
import { AlertIcon, ChevronLeftIcon, MapPinIcon, WhatsAppIcon } from '../components/Icons'

export function ProductNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <AlertIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-stone-900">Hasil tani tidak ditemukan</h1>
      <p className="mt-2 text-sm text-stone-500">
        Hasil tani yang Anda cari mungkin sudah dihapus, tidak aktif, atau tautannya salah.
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

function FarmerCard({ farmer }) {
  return (
    <Link
      to={`/petani/${farmer.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
    >
      <SafeImage
        src={farmer.foto}
        alt={`Foto ${farmer.nama}`}
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
        fallbackClassName="bg-emerald-100 text-emerald-600"
        iconClassName="h-6 w-6"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          Petani Penanam
        </p>
        <p className="truncate font-semibold text-stone-900 group-hover:text-emerald-800">
          {farmer.nama}
        </p>
        {farmer.kelompok ? (
          <p className="truncate text-xs text-stone-500">{farmer.kelompok}</p>
        ) : null}
      </div>
      <span className="text-sm font-medium text-emerald-700 group-hover:underline">
        Lihat
      </span>
    </Link>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { settings } = useSettings()
  const [openOrder, setOpenOrder] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const { data, loading, error, reload } = useApiResource(
    () => api.get(`/api/products/${encodeURIComponent(slug)}`),
    [slug],
  )

  const product = data?.data

  useEffect(() => {
    setOpenOrder(false)
    setSelectedImage(0)
  }, [slug])

  if (loading) {
    return <LoadingState label="Memuat detail hasil tani..." />
  }

  if (error) {
    if (isNotFoundError(error)) {
      return <ProductNotFound />
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState error={error} onRetry={reload} title="Gagal memuat detail hasil tani" />
      </div>
    )
  }

  if (!product) {
    return <ProductNotFound />
  }

  const images = Array.isArray(product.gambar) ? product.gambar : []
  const aktifGambar = images.length ? images[selectedImage] ?? images[0] : null
  const ketersediaan = product.status_ketersediaan?.value
  const bisaPesan = ketersediaan !== 'habis'
  const adminWhatsapp = whatsappLink(
    settings?.nomor_whatsapp,
    `Halo Admin Desa Banjar Agung, saya ingin menanyakan hasil tani ${product.nama}.`,
  )

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
          <li>
            <Link to="/hasil-tani" className="hover:text-emerald-700">
              Hasil Tani
            </Link>
          </li>
          {product.kategori ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={`/hasil-tani?category=${product.kategori.slug}`}
                  className="hover:text-emerald-700"
                >
                  {product.kategori.nama}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li className="font-medium text-stone-700">{product.nama}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <SafeImage
              key={aktifGambar?.id ?? 'kosong'}
              src={aktifGambar?.url ?? product.gambar_utama}
              alt={aktifGambar?.alt_text ?? `Foto ${product.nama}`}
              className="aspect-square w-full object-cover"
              fallbackClassName="bg-stone-100 text-stone-300"
              iconClassName="h-20 w-20"
            />
          </div>

          {images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Tampilkan foto ${index + 1} dari ${product.nama}`}
                  aria-pressed={selectedImage === index}
                  className={`overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === index
                      ? 'border-emerald-600'
                      : 'border-transparent hover:border-emerald-300'
                  }`}
                >
                  <SafeImage
                    src={image.url}
                    alt={image.alt_text ?? `Foto ${index + 1} ${product.nama}`}
                    className="aspect-square w-full object-cover"
                    fallbackClassName="bg-stone-100 text-stone-300"
                    iconClassName="h-5 w-5"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          {product.kategori ? (
            <Link
              to={`/hasil-tani?category=${product.kategori.slug}`}
              className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase"
            >
              {product.kategori.nama}
            </Link>
          ) : null}

          <h1 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">{product.nama}</h1>

          <p className="mt-3 text-sm text-stone-500">
            Satuan: <span className="font-medium text-stone-700">{product.satuan}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <StatusBadge status={product.status_ketersediaan} />
            <span className="text-sm text-stone-500">Stok {formatJumlah(product.stok)}</span>
            {product.estimasi_panen ? (
              <span className="text-sm text-stone-500">
                Estimasi panen {formatTanggalSingkat(product.estimasi_panen)}
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setOpenOrder(true)}
              disabled={!bisaPesan}
              className="btn-whatsapp w-full sm:w-auto"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {bisaPesan ? 'Tanya via WhatsApp' : 'Stok Habis'}
            </button>

            {bisaPesan ? (
              <p className="mt-3 flex items-start gap-2 text-xs text-stone-500">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                Permintaan Anda dikirim ke admin desa untuk dijawab, bukan langsung ke petani.
              </p>
            ) : (
              <p className="mt-3 flex items-start gap-2 text-xs text-stone-500">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Stok hasil tani ini sedang habis.{' '}
                {adminWhatsapp ? (
                  <a
                    href={adminWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-700 underline underline-offset-2"
                  >
                    Tanyakan ketersediaan ke admin
                  </a>
                ) : null}
              </p>
            )}
          </div>

          {product.deskripsi ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-900">Deskripsi</h2>
              <p className="mt-2.5 leading-relaxed whitespace-pre-line text-sm text-stone-700">
                {product.deskripsi}
              </p>
            </section>
          ) : null}

          {product.spesifikasi ? (
            <section className="mt-6">
              <h2 className="text-lg font-bold text-stone-900">Spesifikasi</h2>
              <p className="mt-2.5 leading-relaxed whitespace-pre-line text-sm text-stone-700">
                {product.spesifikasi}
              </p>
            </section>
          ) : null}

          {product.petani ? (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-stone-900">Ditanam oleh</h2>
              <FarmerCard farmer={product.petani} />
            </section>
          ) : null}
        </div>
      </div>

      <InquiryForm product={product} open={openOrder} onClose={() => setOpenOrder(false)} />
    </div>
  )
}
