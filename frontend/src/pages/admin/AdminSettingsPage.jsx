import { useEffect, useRef, useState } from 'react'
import AdminNotice from '../../components/admin/AdminNotice'
import FormField from '../../components/admin/FormField'
import PageHeader from '../../components/admin/PageHeader'
import SafeImage from '../../components/SafeImage'
import { ErrorState, LoadingState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api, {
  getErrorMessage,
  getValidationErrors,
  isNotFoundError,
} from '../../lib/api'
import { toFormData } from '../../lib/admin'
import {
  ImageIcon,
  InfoIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/Icons'

const emptyForm = {
  nama_desa: '',
  tagline: '',
  nomor_whatsapp: '',
  template_pesan: '',
  media_sosial: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
}

const templatePlaceholders = [
  { token: '{kode_ref}', description: 'Kode referensi permintaan' },
  { token: '{nama_produk}', description: 'Nama hasil tani yang ditanyakan' },
  { token: '{jumlah}', description: 'Jumlah (opsional, jarang dipakai)' },
  { token: '{satuan}', description: 'Satuan hasil tani, misalnya kg' },
  { token: '{kebutuhan}', description: 'Kebutuhan yang ditulis pemohon' },
  { token: '{nama_pembeli}', description: 'Nama pemohon' },
  { token: '{catatan}', description: 'Catatan dari pemohon' },
]

function settingsToForm(settings) {
  return {
    nama_desa: settings?.nama_desa ?? '',
    tagline: settings?.tagline ?? '',
    nomor_whatsapp: settings?.nomor_whatsapp ?? '',
    template_pesan: settings?.template_pesan ?? '',
    media_sosial: {
      facebook: settings?.media_sosial?.facebook ?? '',
      instagram: settings?.media_sosial?.instagram ?? '',
      youtube: settings?.media_sosial?.youtube ?? '',
    },
  }
}

export default function AdminSettingsPage() {
  const settingsResource = useApiResource(() => api.get('/api/admin/settings'), [])

  const [form, setForm] = useState(emptyForm)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [saving, setSaving] = useState(false)
  const initialized = useRef(false)
  const fileInputRef = useRef(null)

  const settings = settingsResource.data?.data ?? null
  const notFound = isNotFoundError(settingsResource.error)
  const loadError = settingsResource.error && !notFound ? settingsResource.error : null

  useEffect(() => {
    if (initialized.current || settingsResource.loading) {
      return
    }

    if (notFound) {
      initialized.current = true
      setForm(emptyForm)
      return
    }

    if (settings) {
      initialized.current = true
      setForm(settingsToForm(settings))
    }
  }, [settings, notFound, settingsResource.loading])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null)
      return undefined
    }

    const url = URL.createObjectURL(logoFile)
    setLogoPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [logoFile])

  const existingLogo = settings?.logo ?? null
  const showExistingLogo = Boolean(existingLogo) && !removeLogo
  const currentLogo = logoPreview ?? (showExistingLogo ? existingLogo : null)

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleSocialChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      media_sosial: { ...previous.media_sosial, [field]: event.target.value },
    }))
  }

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setLogoFile(file)

    if (file) {
      setRemoveLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setRemoveLogo(true)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setGeneralError(null)
    setNotice(null)

    const payload = {
      _method: 'PATCH',
      nama_desa: form.nama_desa,
      tagline: form.tagline,
      nomor_whatsapp: form.nomor_whatsapp,
      template_pesan: form.template_pesan,
      media_sosial: {
        facebook: form.media_sosial.facebook,
        instagram: form.media_sosial.instagram,
        youtube: form.media_sosial.youtube,
      },
      hapus_logo: removeLogo,
    }

    if (logoFile) {
      payload.logo = logoFile
    }

    try {
      await api.post('/api/admin/settings', toFormData(payload))
      setNotice('Pengaturan situs berhasil disimpan.')
      setLogoFile(null)
      setRemoveLogo(false)
      initialized.current = false
      settingsResource.reload()
    } catch (error) {
      const validation = getValidationErrors(error)
      setErrors(validation)

      if (Object.keys(validation).length === 0) {
        setGeneralError(getErrorMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  if (settingsResource.loading) {
    return <LoadingState label="Memuat pengaturan situs..." />
  }

  if (loadError) {
    return (
      <ErrorState
        error={loadError}
        onRetry={settingsResource.reload}
        title="Gagal memuat pengaturan situs"
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Pengaturan Situs"
        description="Atur identitas desa, nomor WhatsApp admin, logo, dan template pesan permintaan informasi."
      />

      <div className="mt-5 space-y-3">
        {notFound ? (
          <AdminNotice variant="info">
            Pengaturan situs belum tersedia. Isi formulir berikut lalu simpan untuk membuatnya.
          </AdminNotice>
        ) : null}
        {notice ? (
          <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </AdminNotice>
        ) : null}
        {generalError ? (
          <AdminNotice variant="error" onDismiss={() => setGeneralError(null)}>
            {generalError}
          </AdminNotice>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Identitas Desa</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Nama dan tagline tampil di header, footer, dan halaman utama.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              id="nama_desa"
              label="Nama Desa"
              required
              error={errors.nama_desa}
              className="sm:col-span-2"
            >
              <input
                id="nama_desa"
                type="text"
                value={form.nama_desa}
                onChange={handleChange('nama_desa')}
                maxLength={120}
                className="field-input"
                placeholder="Desa Banjar Agung"
                aria-invalid={Boolean(errors.nama_desa)}
              />
            </FormField>

            <FormField
              id="tagline"
              label="Tagline"
              hint="Kalimat singkat yang menggambarkan profil hasil tani desa."
              error={errors.tagline}
              className="sm:col-span-2"
            >
              <input
                id="tagline"
                type="text"
                value={form.tagline}
                onChange={handleChange('tagline')}
                maxLength={255}
                className="field-input"
                placeholder="Profil hasil pertanian warga desa."
                aria-invalid={Boolean(errors.tagline)}
              />
            </FormField>

            <FormField
              id="nomor_whatsapp"
              label="Nomor WhatsApp Admin Desa"
              required
              hint="Gunakan format 628xxxxxxxxxx. Pengunjung akan diarahkan ke nomor ini."
              error={errors.nomor_whatsapp}
              className="sm:col-span-2"
            >
              <input
                id="nomor_whatsapp"
                type="text"
                value={form.nomor_whatsapp}
                onChange={handleChange('nomor_whatsapp')}
                maxLength={20}
                inputMode="tel"
                className="field-input"
                placeholder="6281234567890"
                aria-invalid={Boolean(errors.nomor_whatsapp)}
              />
            </FormField>
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-stone-900">Logo Desa</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Opsional. Format JPG, PNG, atau WEBP maksimal 3 MB.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              {currentLogo ? (
                <SafeImage
                  src={currentLogo}
                  alt="Logo desa"
                  className="h-24 w-24 rounded-2xl border border-stone-200 bg-white object-contain p-2"
                  fallbackClassName="bg-stone-100 text-stone-300"
                  iconClassName="h-7 w-7"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-stone-400">
                  <ImageIcon className="h-7 w-7" />
                </div>
              )}

              {currentLogo ? (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Hapus logo
                </button>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <FormField id="logo" label="Pilih Logo" error={errors.logo}>
                <input
                  id="logo"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-700"
                />
              </FormField>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                <UploadIcon className="h-3.5 w-3.5" />
                {logoFile
                  ? `Logo baru dipilih: ${logoFile.name}`
                  : showExistingLogo
                    ? 'Pilih berkas baru untuk mengganti logo saat ini.'
                    : 'Belum ada logo terpilih.'}
              </p>
            </div>
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Media Sosial</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Opsional. Tautan akan ditampilkan di footer situs publik.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField id="facebook" label="Facebook" error={errors['media_sosial.facebook']}>
              <input
                id="facebook"
                type="url"
                value={form.media_sosial.facebook}
                onChange={handleSocialChange('facebook')}
                maxLength={255}
                className="field-input"
                placeholder="https://facebook.com/..."
                aria-invalid={Boolean(errors['media_sosial.facebook'])}
              />
            </FormField>

            <FormField id="instagram" label="Instagram" error={errors['media_sosial.instagram']}>
              <input
                id="instagram"
                type="url"
                value={form.media_sosial.instagram}
                onChange={handleSocialChange('instagram')}
                maxLength={255}
                className="field-input"
                placeholder="https://instagram.com/..."
                aria-invalid={Boolean(errors['media_sosial.instagram'])}
              />
            </FormField>

            <FormField
              id="youtube"
              label="YouTube"
              error={errors['media_sosial.youtube']}
              className="sm:col-span-2"
            >
              <input
                id="youtube"
                type="url"
                value={form.media_sosial.youtube}
                onChange={handleSocialChange('youtube')}
                maxLength={255}
                className="field-input"
                placeholder="https://youtube.com/..."
                aria-invalid={Boolean(errors['media_sosial.youtube'])}
              />
            </FormField>
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Template Pesan WhatsApp</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Pesan ini otomatis terisi saat pengunjung menekan tombol permintaan. Gunakan penanda di
            bawah agar data permintaan ikut terkirim.
          </p>

          <FormField
            id="template_pesan"
            label="Isi Template"
            required
            error={errors.template_pesan}
            className="mt-5"
          >
            <textarea
              id="template_pesan"
              rows={10}
              value={form.template_pesan}
              onChange={handleChange('template_pesan')}
              maxLength={2000}
              className="field-input resize-y font-mono text-xs"
              aria-invalid={Boolean(errors.template_pesan)}
            />
          </FormField>

          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-sky-900">
              <InfoIcon className="h-4 w-4" />
              Penanda yang tersedia
            </p>
            <ul className="mt-2 grid gap-1.5 text-xs text-sky-900 sm:grid-cols-2">
              {templatePlaceholders.map((item) => (
                <li key={item.token} className="flex flex-wrap items-center gap-1.5">
                  <code className="rounded bg-white px-1.5 py-0.5 font-mono font-semibold text-sky-800">
                    {item.token}
                  </code>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setForm(settingsToForm(settings))
              setLogoFile(null)
              setRemoveLogo(false)
              setErrors({})
              setGeneralError(null)
              setNotice(null)

              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            disabled={saving}
            className="btn-secondary"
          >
            Atur Ulang
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  )
}
