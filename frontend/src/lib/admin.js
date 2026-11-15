import api from './api'

export const availabilityOptions = [
  { value: 'tersedia', label: 'Tersedia' },
  { value: 'terbatas', label: 'Terbatas' },
  { value: 'habis', label: 'Habis' },
  { value: 'akan_panen', label: 'Akan panen' },
]

export const leadStatusOptions = [
  { value: 'baru', label: 'Baru' },
  { value: 'dihubungi', label: 'Dihubungi' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'batal', label: 'Batal' },
]

export const availabilityStyles = {
  tersedia: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  terbatas: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  habis: 'bg-stone-200 text-stone-600 ring-stone-500/20',
  akan_panen: 'bg-sky-100 text-sky-800 ring-sky-600/20',
}

export const leadStatusStyles = {
  baru: 'bg-sky-100 text-sky-800 ring-sky-600/20',
  dihubungi: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  selesai: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  batal: 'bg-stone-200 text-stone-600 ring-stone-500/20',
}

export const actionStyles = {
  tambah: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  ubah: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  hapus: 'bg-red-100 text-red-700 ring-red-600/20',
}

/**
 * Ubah objek menjadi FormData, termasuk objek bersarang dan berkas.
 * Nilai null/undefined dilewati agar validasi "sometimes" di backend tetap bekerja.
 */
export function toFormData(values) {
  const formData = new FormData()

  const append = (key, value) => {
    if (value === null || value === undefined) {
      return
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)

      return
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => append(`${key}[${index}]`, item))

      return
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) =>
        append(`${key}[${nestedKey}]`, nestedValue),
      )

      return
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')

      return
    }

    formData.append(key, String(value))
  }

  Object.entries(values).forEach(([key, value]) => append(key, value))

  return formData
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function downloadApiFile(url, filename, params) {
  const response = await api.get(url, {
    params,
    responseType: 'blob',
  })

  downloadBlob(response.data, filename)

  return response
}

export function todayStamp() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')

  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}`
}
