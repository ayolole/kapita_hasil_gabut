import { useEffect, useState } from 'react'
import api, { getErrorMessage, getValidationErrors } from '../lib/api'
import {
  CheckCircleIcon,
  CloseIcon,
  CopyIcon,
  WhatsAppIcon,
} from './Icons'

const emptyForm = {
  nama_pembeli: '',
  kebutuhan: '',
  catatan: '',
}

export default function InquiryForm({ product, open, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setForm(emptyForm)
    setErrors({})
    setGeneralError(null)
    setSubmitting(false)
    setResult(null)
    setCopied(false)
  }, [open, product?.slug])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !product) {
    return null
  }

  const handleInputChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGeneralError(null)

    try {
      const response = await api.post('/api/leads', {
        product_slug: product.slug,
        nama_pembeli: form.nama_pembeli,
        kebutuhan: form.kebutuhan,
        catatan: form.catatan.trim() === '' ? null : form.catatan.trim(),
      })

      setResult(response.data)
    } catch (error) {
      const validation = getValidationErrors(error)
      setErrors(validation)

      if (Object.keys(validation).length === 0) {
        setGeneralError(getErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyMessage = async () => {
    if (!result?.whatsapp?.pesan) {
      return
    }

    try {
      await navigator.clipboard.writeText(result.whatsapp.pesan)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard tersedia secara opsional; abaikan kegagalan.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup formulir permintaan informasi"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-stone-950/50 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-inquiry"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
          <div>
            <h2 id="judul-inquiry" className="font-semibold text-stone-900">
              {result ? 'Permintaan Siap Dikirim' : 'Tanya via WhatsApp'}
            </h2>
            <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">{product.nama}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="Tutup"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="px-5 py-6">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
              <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">
                  Permintaan informasi berhasil dibuat dengan kode {result.data?.kode_ref}.
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Pesan akan dikirim ke <strong>admin desa</strong>, bukan langsung ke petani.
                  Lanjutkan ke WhatsApp untuk mengirimkannya.
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Hasil tani</dt>
                <dd className="text-right font-medium text-stone-800">{product.nama}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Kebutuhan</dt>
                <dd className="text-right font-medium text-stone-800">
                  {result.data?.kebutuhan ?? '-'}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="field-label">Isi pesan WhatsApp</p>
              <pre className="max-h-40 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-4 font-sans text-sm whitespace-pre-wrap text-stone-700">
                {result.whatsapp?.pesan}
              </pre>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {result.whatsapp?.url ? (
                <a
                  href={result.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Buka WhatsApp
                </a>
              ) : null}
              <div className="flex gap-2.5">
                <button type="button" onClick={handleCopyMessage} className="btn-secondary flex-1">
                  <CopyIcon className="h-4 w-4" />
                  {copied ? 'Tersalin!' : 'Salin pesan'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-6" noValidate>
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              Permintaan diteruskan ke admin desa melalui WhatsApp. Admin akan membalas untuk
              memberi informasi ketersediaan, jumlah, dan pengiriman.
            </p>

            <div className="mt-5">
              <label htmlFor="nama_pembeli" className="field-label">
                Nama Anda <span className="text-red-500">*</span>
              </label>
              <input
                id="nama_pembeli"
                name="nama_pembeli"
                type="text"
                autoComplete="name"
                autoFocus
                maxLength={100}
                value={form.nama_pembeli}
                onChange={handleInputChange('nama_pembeli')}
                aria-invalid={Boolean(errors.nama_pembeli)}
                aria-describedby={errors.nama_pembeli ? 'error-nama' : undefined}
                className="field-input"
                placeholder="Contoh: Budi Santoso"
              />
              {errors.nama_pembeli ? (
                <p id="error-nama" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.nama_pembeli}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label htmlFor="kebutuhan" className="field-label">
                Kebutuhan Anda <span className="text-red-500">*</span>
              </label>
              <textarea
                id="kebutuhan"
                name="kebutuhan"
                rows={3}
                maxLength={500}
                value={form.kebutuhan}
                onChange={handleInputChange('kebutuhan')}
                aria-invalid={Boolean(errors.kebutuhan)}
                aria-describedby={errors.kebutuhan ? 'error-kebutuhan' : undefined}
                className="field-input resize-none"
                placeholder={`Contoh: butuh 20 ${product.satuan} untuk warung, kira-kira siap kapan?`}
              />
              {errors.kebutuhan ? (
                <p id="error-kebutuhan" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.kebutuhan}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-stone-500">
                  Tuliskan perkiraan jumlah dan waktu yang Anda butuhkan.
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="catatan" className="field-label">
                Catatan tambahan <span className="font-normal text-stone-400">(opsional)</span>
              </label>
              <textarea
                id="catatan"
                name="catatan"
                rows={3}
                maxLength={500}
                value={form.catatan}
                onChange={handleInputChange('catatan')}
                aria-invalid={Boolean(errors.catatan)}
                aria-describedby={errors.catatan ? 'error-catatan' : undefined}
                className="field-input resize-none"
                placeholder="Contoh: ambil sendiri di desa, atau minta diantar"
              />
              {errors.catatan ? (
                <p id="error-catatan" className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.catatan}
                </p>
              ) : null}
            </div>

            {generalError ? (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {generalError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="btn-secondary sm:w-auto">
                Batal
              </button>
              <button type="submit" disabled={submitting} className="btn-primary sm:w-auto">
                {submitting ? 'Mengirim...' : 'Buat Permintaan WhatsApp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
