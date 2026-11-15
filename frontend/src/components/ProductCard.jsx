import { Link } from 'react-router-dom'
import SafeImage from './SafeImage'
import StatusBadge from './StatusBadge'

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/produk/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <SafeImage
          src={product.gambar_utama}
          alt={`Foto ${product.nama}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3">
          <StatusBadge status={product.status_ketersediaan} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.kategori?.nama ? (
          <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
            {product.kategori.nama}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 font-semibold text-stone-900">{product.nama}</h3>

        {product.petani?.nama ? (
          <p className="mt-1 text-sm text-stone-500">{product.petani.nama}</p>
        ) : null}

        <div className="mt-auto pt-4">
          <p className="text-sm text-stone-500">
            Satuan: <span className="font-medium text-stone-700">{product.satuan}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
