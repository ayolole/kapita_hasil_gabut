import axios from 'axios'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
})

function readCookie(name) {
  const prefix = `${name}=`
  const found = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))

  return found ? found.slice(prefix.length) : null
}

let csrfPromise = null

function fetchCsrfCookie() {
  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true })
      .finally(() => {})
  }

  return csrfPromise
}

/**
 * Pastikan cookie CSRF tersedia sebelum mengirim request berstatus mengubah data.
 */
export function ensureCsrfCookie(force = false) {
  if (force) {
    csrfPromise = null
  }

  if (!force && readCookie('XSRF-TOKEN')) {
    return Promise.resolve()
  }

  return fetchCsrfCookie().catch(() => {
    csrfPromise = null
  })
}

api.interceptors.request.use(async (config) => {
  const mutating = ['post', 'put', 'patch', 'delete'].includes(
    (config.method ?? 'get').toLowerCase(),
  )

  if (mutating) {
    await ensureCsrfCookie()
  }

  return config
})

api.interceptors.response.use(undefined, async (error) => {
  const config = error?.config
  const status = error?.response?.status
  const url = String(config?.url ?? '')

  // Sesi berakhir di area admin: beri tahu AuthContext agar pengguna diarahkan ke login.
  if (status === 401 && !url.includes('/api/login') && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('katalog:unauthorized'))
  }

  // Sesi/lifetime CSRF berakhir: paksa perbarui token lalu kirim ulang satu kali.
  if (status === 419 && config && !config._csrfRetried) {
    config._csrfRetried = true
    await ensureCsrfCookie(true)

    return api.request(config)
  }

  throw error
})

/**
 * Ambil pesan kesalahan yang ramah untuk ditampilkan ke pengguna.
 */
export function getErrorMessage(error) {
  const response = error?.response

  if (response?.status === 401) {
    return 'Sesi Anda sudah berakhir. Silakan login kembali.'
  }

  if (response?.status === 429) {
    return (
      response.data?.message ??
      'Terlalu banyak percobaan. Silakan tunggu sebentar lalu coba lagi.'
    )
  }

  const validationErrors = response?.data?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    const firstMessage = Object.values(validationErrors).flat().filter(Boolean)[0]

    if (firstMessage) {
      return firstMessage
    }
  }

  if (response?.data?.message) {
    return response.data.message
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Permintaan memakan waktu terlalu lama. Periksa koneksi lalu coba lagi.'
  }

  if (!response) {
    return 'Tidak dapat terhubung ke server katalog. Periksa koneksi internet Anda.'
  }

  return 'Terjadi kesalahan saat memuat data. Silakan coba lagi.'
}

/**
 * Ubah respons validasi 422 menjadi peta { nama_field: pesan }.
 */
export function getValidationErrors(error) {
  const errors = error?.response?.data?.errors

  if (!errors || typeof errors !== 'object') {
    return {}
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : String(messages),
    ]),
  )
}

export function isNotFoundError(error) {
  return error?.response?.status === 404
}

export default api
