import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../lib/api'

let lastTrackedKey = null

/**
 * Catat kunjungan halaman ke backend sekali per navigasi.
 * Kunjungan dianggap berasal dari QR bila URL memuat ?src=qr
 * (atau ?sumber=qr pada tautan QR lama).
 */
export function useVisitTracking() {
  const location = useLocation()

  useEffect(() => {
    if (!location.key || location.key === lastTrackedKey) {
      return
    }

    lastTrackedKey = location.key

    const params = new URLSearchParams(location.search)
    const source = (params.get('src') ?? params.get('sumber') ?? '').toLowerCase()
    const productMatch = location.pathname.match(/^\/produk\/([^/]+)$/)

    api
      .post('/api/track', {
        path: `${location.pathname}${location.search}`,
        sumber: source === 'qr' ? 'qr' : 'langsung',
        product_slug: productMatch ? decodeURIComponent(productMatch[1]) : null,
      })
      .catch(() => {
        // Pelacakan bersifat opsional; jangan ganggu pengalaman pengguna.
      })
  }, [location.key, location.pathname, location.search])
}
