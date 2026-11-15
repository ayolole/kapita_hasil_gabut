import { Link } from 'react-router-dom'
import { LeafIcon } from '../components/Icons'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-7xl font-black tracking-tight text-emerald-700 sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-stone-500 sm:text-base">
        Halaman yang Anda tuju mungkin sudah dipindahkan atau tautannya salah. Mari kembali
        menjelajah hasil tani desa.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <LeafIcon className="h-4 w-4" />
          Ke Beranda
        </Link>
        <Link to="/hasil-tani" className="btn-secondary">
          Lihat Hasil Tani
        </Link>
      </div>
    </div>
  )
}
