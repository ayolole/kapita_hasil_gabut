const jumlahFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 2,
})

export function formatJumlah(value) {
  const number = Number(value ?? 0)

  return Number.isFinite(number) ? jumlahFormatter.format(number) : '0'
}

export function formatTanggal(value, { withTime = false } = {}) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

export function formatTanggalSingkat(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function normalizeWhatsappNumber(value) {
  const digits = String(value ?? '').replace(/\D+/g, '')

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  if (digits.startsWith('8')) {
    return `62${digits}`
  }

  return digits
}

export function whatsappLink(number, message = '') {
  const normalized = normalizeWhatsappNumber(number)

  if (!normalized) {
    return null
  }

  const query = message ? `?text=${encodeURIComponent(message)}` : ''

  return `https://wa.me/${normalized}${query}`
}

export function initialOf(value, fallback = '?') {
  const text = String(value ?? '').trim()

  return text ? text.charAt(0).toUpperCase() : fallback
}
