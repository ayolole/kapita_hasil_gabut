import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
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
  SaveIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/Icons'

const emptyForm = {
  nama: '',
  kelompok: '',
  cerita: '',
  lokasi_lahan: '',
  kontak_internal: '',
}

export default function AdminFarmerFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [notice, setNotice] = useState(location.state?.notice ?? null)
  const [saving, setSaving] = useState(false)
  const initializedFor = useRef(null)
  const fileInputRef = useRef(null)

  const farmerResource = useApiResource(
    () =>
      id
        ? api.get(`/api/admin/farmers/${id}`)
        : Promise.resolve({ data: { data: null } }),
    [id],
  )

  const farmer = farmerResource.data?.data ?? null

  useEffect(() => {
    if (!farmer || initializedFor.current === farmer.id) {
      return
    }

    initializedFor.current = farmer.id
    setForm({
      nama: farmer.nama ?? '',
      kelompok: farmer.kelompok ?? '',
      cerita: farmer.cerita ?? '',
      lokasi_lahan: farmer.lokasi_lahan ?? '',
      kontak_internal: farmer.kontak_internal ?? '',
    })
  }, [farmer])

  useEffect(() => {
    setNotice(location.state?.notice ?? null)
  }, [location.state])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null)
      return undefined
    }

    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const existingPhoto = farmer?.foto ?? null
  const showExistingPhoto = Boolean(existingPhoto) && !removePhoto
  const currentPhoto = photoPreview ?? (showExistingPhoto ? existingPhoto : null)

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setPhotoFile(file)

    if (file) {
      setRemovePhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoFile(null)
    setRemovePhoto(true)

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
      nama: form.nama,
      kelompok: form.kelompok.trim() === '' ? '' : form.kelompok,
      cerita: form.cerita.trim() === '' ? '' : form.cerita,
      lokasi_lahan: form.lokasi_lahan.trim() === '' ? '' : form.lokasi_lahan,
      kontak_internal: form.kontak_internal.trim() === '' ? '' : form.kontak_internal,
    }

    if (photoFile) {
      payload.foto = photoFile
    }

    if (isEdit) {
      payload._method = 'PATCH'
      payload.hapus_foto = removePhoto
    }

    try {
      if (isEdit) {
        await api.post(`/api/admin/farmers/${id}`, toFormData(payload))
        setNotice('Data petani berhasil diperbarui.')
        setPhotoFile(null)
        setRemovePhoto(false)
        farmerResource.reload()
      } else {
        const response = await api.post('/api/admin/farmers', toFormData(payload))
        const newId = response.data?.data?.id

        navigate(`/admin/petani/${newId}`, {
          replace: true,
          state: { notice: 'Petani berhasil ditambahkan. Anda dapat menambahkan hasil tani untuk petani ini.' },
        })
      }
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

  if (isEdit && farmerResource.loading) {
    return <LoadingState label="Memuat data petani..." />
  }

  if (isEdit && farmerResource.error) {
    if (isNotFoundError(farmerResource.error)) {
      return (
        <div className="admin-card p-6 text-center sm:p-10">
          <h1 className="text-xl font-bold text-stone-900">Petani tidak ditemukan</h1>
          <p className="mt-2 text-sm text-stone-500">
            Petani yang Anda cari mungkin sudah dihapus atau tautannya salah.
          </p>
          <Link to="/admin/petani" className="btn-primary mt-5">
            Kembali ke Daftar Petani
          </Link>
        </div>
      )
    }

    return (
      <ErrorState
        error={farmerResource.error}
        onRetry={farmerResource.reload}
        title="Gagal memuat data petani"
      />
    )
  }

  const products = Array.isArray(farmer?.produk) ? farmer.produk : []

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Petani' : 'Tambah Petani'}
        description={
          isEdit
            ? 'Perbarui profil petani, foto, dan informasi lahan.'
            : 'Isi profil petani. Foto dapat ditambahkan sekarang atau setelah data tersimpan.'
        }
        backTo="/admin/petani"
        backLabel="Daftar Petani"
      />

      <div className="mt-5 space-y-3">
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
          <h2 className="font-bold text-stone-900">Profil Petani</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Informasi ini tampil di halaman profil petani pada situs publik.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              id="nama"
              label="Nama Petani"
              required
              error={errors.nama}
              className="sm:col-span-2"
            >
              <input
                id="nama"
                type="text"
                value={form.nama}
                onChange={handleChange('nama')}
                maxLength={120}
                className="field-input"
                placeholder="Contoh: Pak Sukardi"
                aria-invalid={Boolean(errors.nama)}
              />
            </FormField>

            <FormField
              id="kelompok"
              label="Kelompok Tani"
              hint="Opsional. Contoh: Kelompok Tani Sido Makmur."
              error={errors.kelompok}
            >
              <input
                id="kelompok"
                type="text"
                value={form.kelompok}
                onChange={handleChange('kelompok')}
                maxLength={120}
                className="field-input"
                placeholder="Kelompok Tani Sido Makmur"
                aria-invalid={Boolean(errors.kelompok)}
              />
            </FormField>

            <FormField
              id="lokasi_lahan"
              label="Lokasi Lahan"
              hint="Opsional. Contoh: Dusun 1, RT 02."
              error={errors.lokasi_lahan}
            >
              <input
                id="lokasi_lahan"
                type="text"
                value={form.lokasi_lahan}
                onChange={handleChange('lokasi_lahan')}
                maxLength={255}
                className="field-input"
                placeholder="Dusun 1, RT 02"
                aria-invalid={Boolean(errors.lokasi_lahan)}
              />
            </FormField>

            <FormField
              id="kontak_internal"
              label="Kontak Internal"
              hint="Hanya terlihat oleh admin. Tidak ditampilkan di situs publik."
              error={errors.kontak_internal}
              className="sm:col-span-2"
            >
              <input
                id="kontak_internal"
                type="text"
                value={form.kontak_internal}
                onChange={handleChange('kontak_internal')}
                maxLength={30}
                className="field-input"
                placeholder="08xx xxxx xxxx"
                aria-invalid={Boolean(errors.kontak_internal)}
              />
            </FormField>

            <FormField
              id="cerita"
              label="Cerita Petani"
              hint="Opsional. Ceritakan pengalaman atau keunikan petani."
              error={errors.cerita}
              className="sm:col-span-2"
            >
              <textarea
                id="cerita"
                rows={5}
                value={form.cerita}
                onChange={handleChange('cerita')}
                maxLength={5000}
                className="field-input resize-y"
                placeholder="Pak Sukardi sudah bertani pisang sejak 20 tahun lalu..."
                aria-invalid={Boolean(errors.cerita)}
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
              <h2 className="font-bold text-stone-900">Foto Petani</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                Gunakan foto wajah atau aktivitas bertani. Format JPG, PNG, atau WEBP maksimal
                5 MB.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              {currentPhoto ? (
                <SafeImage
                  src={currentPhoto}
                  alt={`Foto ${form.nama || 'petani'}`}
                  className="h-32 w-32 rounded-2xl object-cover"
                  fallbackClassName="bg-stone-100 text-stone-300"
                  iconClassName="h-8 w-8"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 text-stone-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}

              {currentPhoto ? (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  Hapus foto
                </button>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <FormField id="foto" label="Pilih Foto" error={errors.foto}>
                <input
                  id="foto"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-700"
                />
              </FormField>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                <UploadIcon className="h-3.5 w-3.5" />
                {photoFile
                  ? `Foto baru dipilih: ${photoFile.name}`
                  : showExistingPhoto
                    ? 'Pilih berkas baru untuk mengganti foto saat ini.'
                    : 'Belum ada foto terpilih.'}
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/admin/petani" className="btn-secondary">
            Batal
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Petani'}
          </button>
        </div>
      </form>

      {isEdit ? (
        <section className="admin-card mt-8 p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Hasil Tani Petani Ini</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Daftar hasil tani yang dikelola oleh petani ini.
          </p>

          {products.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
              Petani ini belum memiliki hasil tani. Tambahkan melalui menu Hasil Tani.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/admin/produk/${product.id}`}
                      className="truncate font-semibold text-stone-900 hover:text-emerald-700"
                    >
                      {product.nama}
                    </Link>
                    <p className="text-xs text-stone-500">
                      {product.kategori?.nama ?? 'Tanpa kategori'} &middot;{' '}
                      {product.status_ketersediaan?.label ?? '-'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  )
}
