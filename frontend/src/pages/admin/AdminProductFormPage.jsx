import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import AdminNotice from '../../components/admin/AdminNotice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
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
import { availabilityOptions, toFormData } from '../../lib/admin'
import {
  ImageIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/Icons'

const emptyForm = {
  nama: '',
  slug: '',
  category_id: '',
  farmer_id: '',
  satuan: 'kg',
  status_ketersediaan: 'tersedia',
  stok: '0',
  estimasi_panen: '',
  aktif: true,
  deskripsi: '',
  spesifikasi: '',
}

function productToForm(product) {
  return {
    nama: product.nama ?? '',
    slug: product.slug ?? '',
    category_id: product.kategori?.id ? String(product.kategori.id) : '',
    farmer_id: product.petani?.id ? String(product.petani.id) : '',
    satuan: product.satuan ?? 'kg',
    status_ketersediaan: product.status_ketersediaan?.value ?? 'tersedia',
    stok: String(product.stok ?? 0),
    estimasi_panen: product.estimasi_panen ?? '',
    aktif: Boolean(product.aktif),
    deskripsi: product.deskripsi ?? '',
    spesifikasi: product.spesifikasi ?? '',
  }
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice ?? null)
  const initializedFor = useRef(null)

  const categories = useApiResource(() => api.get('/api/admin/categories'), [])
  const farmers = useApiResource(
    () => api.get('/api/admin/farmers', { params: { per_page: 100 } }),
    [],
  )

  const productResource = useApiResource(
    () =>
      id
        ? api.get(`/api/admin/products/${id}`)
        : Promise.resolve({ data: { data: null } }),
    [id],
  )

  const product = productResource.data?.data ?? null

  useEffect(() => {
    if (!product) {
      return
    }

    if (initializedFor.current === product.id) {
      return
    }

    initializedFor.current = product.id
    setForm(productToForm(product))
  }, [product])

  useEffect(() => {
    setNotice(location.state?.notice ?? null)
  }, [location.state])

  const handleChange = (field) => (event) => {
    const value = field === 'aktif' ? event.target.checked : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setGeneralError(null)
    setNotice(null)

    const payload = {
      nama: form.nama,
      slug: form.slug.trim() === '' ? null : form.slug.trim(),
      category_id: form.category_id === '' ? null : Number(form.category_id),
      farmer_id: form.farmer_id === '' ? null : Number(form.farmer_id),
      satuan: form.satuan,
      deskripsi: form.deskripsi.trim() === '' ? null : form.deskripsi,
      spesifikasi: form.spesifikasi.trim() === '' ? null : form.spesifikasi,
      status_ketersediaan: form.status_ketersediaan,
      stok: form.stok === '' ? 0 : Number(form.stok),
      estimasi_panen: form.estimasi_panen === '' ? null : form.estimasi_panen,
      aktif: Boolean(form.aktif),
    }

    try {
      if (!isEdit) {
        const response = await api.post('/api/admin/products', payload)
        const newId = response.data?.data?.id

        navigate(`/admin/produk/${newId}`, {
          replace: true,
          state: {
            notice:
              'Hasil tani berhasil ditambahkan. Sekarang Anda dapat mengunggah foto.',
          },
        })

        return
      }

      await api.patch(`/api/admin/products/${id}`, payload)

      setNotice('Perubahan hasil tani berhasil disimpan.')
      productResource.reload()
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

  const [imageFile, setImageFile] = useState(null)
  const [imageAlt, setImageAlt] = useState('')
  const [imageError, setImageError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleteImageTarget, setDeleteImageTarget] = useState(null)
  const [deletingImage, setDeletingImage] = useState(false)
  const [deleteImageError, setDeleteImageError] = useState(null)

  const handleUploadImage = async (event) => {
    event.preventDefault()

    if (!imageFile) {
      setImageError('Pilih foto terlebih dahulu.')
      return
    }

    setUploading(true)
    setImageError(null)

    try {
      const formData = toFormData({
        foto: imageFile,
        alt_text: imageAlt.trim() === '' ? undefined : imageAlt.trim(),
      })

      await api.post(`/api/admin/products/${id}/images`, formData)
      setImageFile(null)
      setImageAlt('')
      productResource.reload()
    } catch (error) {
      const validation = getValidationErrors(error)
      setImageError(validation.foto ?? getErrorMessage(error))
    } finally {
      setUploading(false)
      event.target.reset?.()
    }
  }

  const handleDeleteImage = async () => {
    if (!deleteImageTarget) {
      return
    }

    setDeletingImage(true)
    setDeleteImageError(null)

    try {
      await api.delete(`/api/admin/products/${id}/images/${deleteImageTarget.id}`)
      setDeleteImageTarget(null)
      productResource.reload()
    } catch (error) {
      setDeleteImageError(getErrorMessage(error))
    } finally {
      setDeletingImage(false)
    }
  }

  if (isEdit && productResource.loading) {
    return <LoadingState label="Memuat data hasil tani..." />
  }

  if (isEdit && productResource.error) {
    if (isNotFoundError(productResource.error)) {
      return (
        <div className="admin-card p-6 text-center sm:p-10">
          <h1 className="text-xl font-bold text-stone-900">Hasil tani tidak ditemukan</h1>
          <p className="mt-2 text-sm text-stone-500">
            Hasil tani yang Anda cari mungkin sudah dihapus permanen atau tautannya salah.
          </p>
          <Link to="/admin/produk" className="btn-primary mt-5">
            Kembali ke Daftar Hasil Tani
          </Link>
        </div>
      )
    }

    return (
      <ErrorState
        error={productResource.error}
        onRetry={productResource.reload}
        title="Gagal memuat data hasil tani"
      />
    )
  }

  const images = Array.isArray(product?.gambar) ? product.gambar : []

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Hasil Tani' : 'Tambah Hasil Tani'}
        description={
          isEdit
            ? 'Perbarui informasi hasil tani, foto, dan ketersediaan panen.'
            : 'Isi informasi dasar hasil tani. Foto dapat ditambahkan setelah data tersimpan.'
        }
        backTo="/admin/produk"
        backLabel="Daftar Hasil Tani"
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
        {categories.error ? (
          <AdminNotice variant="error">
            Gagal memuat kategori. {getErrorMessage(categories.error)}{' '}
            <button
              type="button"
              onClick={categories.reload}
              className="font-semibold underline underline-offset-2"
            >
              Coba lagi
            </button>
          </AdminNotice>
        ) : null}
        {farmers.error ? (
          <AdminNotice variant="error">
            Gagal memuat daftar petani. {getErrorMessage(farmers.error)}{' '}
            <button
              type="button"
              onClick={farmers.reload}
              className="font-semibold underline underline-offset-2"
            >
              Coba lagi
            </button>
          </AdminNotice>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Informasi Hasil Tani</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Data ini tampil di halaman hasil tani dan detail hasil tani.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              id="nama"
              label="Nama Hasil Tani"
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
                placeholder="Contoh: Pisang Kepok"
                aria-invalid={Boolean(errors.nama)}
              />
            </FormField>

            <FormField
              id="slug"
              label="Slug URL"
              hint="Opsional. Kosongkan agar dibuat otomatis dari nama hasil tani."
              error={errors.slug}
              className="sm:col-span-2"
            >
              <input
                id="slug"
                type="text"
                value={form.slug}
                onChange={handleChange('slug')}
                maxLength={140}
                className="field-input"
                placeholder="pisang-kepok"
                aria-invalid={Boolean(errors.slug)}
              />
            </FormField>

            <FormField id="category_id" label="Kategori" required error={errors.category_id}>
              <select
                id="category_id"
                value={form.category_id}
                onChange={handleChange('category_id')}
                className="field-input"
                aria-invalid={Boolean(errors.category_id)}
                disabled={categories.loading}
              >
                <option value="">
                  {categories.loading ? 'Memuat kategori...' : 'Pilih kategori'}
                </option>
                {(categories.data?.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nama}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="farmer_id" label="Petani" required error={errors.farmer_id}>
              <select
                id="farmer_id"
                value={form.farmer_id}
                onChange={handleChange('farmer_id')}
                className="field-input"
                aria-invalid={Boolean(errors.farmer_id)}
                disabled={farmers.loading}
              >
                <option value="">
                  {farmers.loading ? 'Memuat petani...' : 'Pilih petani'}
                </option>
                {(farmers.data?.data ?? []).map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.nama}
                    {farmer.kelompok ? ` - ${farmer.kelompok}` : ''}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="satuan"
              label="Satuan"
              required
              hint="Contoh: kg, ikat, buah, liter."
              error={errors.satuan}
            >
              <input
                id="satuan"
                type="text"
                value={form.satuan}
                onChange={handleChange('satuan')}
                maxLength={30}
                className="field-input"
                placeholder="kg"
                aria-invalid={Boolean(errors.satuan)}
              />
            </FormField>

            <FormField
              id="deskripsi"
              label="Deskripsi"
              hint="Jelaskan keunggulan atau asal hasil tani secara singkat."
              error={errors.deskripsi}
              className="sm:col-span-2"
            >
              <textarea
                id="deskripsi"
                rows={4}
                value={form.deskripsi}
                onChange={handleChange('deskripsi')}
                maxLength={2000}
                className="field-input resize-y"
                placeholder="Pisang kepok manis dari kebun warga Dusun 1..."
                aria-invalid={Boolean(errors.deskripsi)}
              />
            </FormField>

            <FormField
              id="spesifikasi"
              label="Spesifikasi"
              hint="Opsional. Contoh: berat per sisir, cara penyimpanan, atau sertifikasi."
              error={errors.spesifikasi}
              className="sm:col-span-2"
            >
              <textarea
                id="spesifikasi"
                rows={3}
                value={form.spesifikasi}
                onChange={handleChange('spesifikasi')}
                maxLength={2000}
                className="field-input resize-y"
                aria-invalid={Boolean(errors.spesifikasi)}
              />
            </FormField>
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <h2 className="font-bold text-stone-900">Ketersediaan</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Perbarui status panen agar pengunjung tahu kondisi terkini.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              id="status_ketersediaan"
              label="Status Ketersediaan"
              required
              error={errors.status_ketersediaan}
            >
              <select
                id="status_ketersediaan"
                value={form.status_ketersediaan}
                onChange={handleChange('status_ketersediaan')}
                className="field-input"
              >
                {availabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="stok"
              label={`Stok Tersedia (${form.satuan || 'satuan'})`}
              hint="Isi 0 jika stok sedang habis."
              error={errors.stok}
            >
              <input
                id="stok"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={form.stok}
                onChange={handleChange('stok')}
                className="field-input"
                aria-invalid={Boolean(errors.stok)}
              />
            </FormField>

            <FormField
              id="estimasi_panen"
              label="Estimasi Panen Berikutnya"
              hint="Opsional, terutama untuk status akan panen."
              error={errors.estimasi_panen}
            >
              <input
                id="estimasi_panen"
                type="date"
                value={form.estimasi_panen}
                onChange={handleChange('estimasi_panen')}
                className="field-input"
                aria-invalid={Boolean(errors.estimasi_panen)}
              />
            </FormField>

            <label className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={handleChange('aktif')}
                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span className="text-sm">
                <span className="block font-semibold text-stone-900">
                  Tampilkan di halaman hasil tani
                </span>
                <span className="mt-0.5 block text-stone-500">
                  Hilangkan centang untuk menyembunyikan hasil tani tanpa menghapusnya.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/admin/produk" className="btn-secondary">
            Batal
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Hasil Tani'}
          </button>
        </div>
      </form>

      {isEdit ? (
        <div className="mt-8 space-y-4">
          <section className="admin-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ImageIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-stone-900">Foto Hasil Tani</h2>
                <p className="mt-0.5 text-sm text-stone-500">
                  Foto pertama menjadi gambar utama di halaman hasil tani. Gunakan JPG, PNG,
                  atau WEBP maksimal 5 MB.
                </p>
              </div>
            </div>

            {images.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                  >
                    <SafeImage
                      src={image.url}
                      alt={image.alt_text ?? `Foto ${product?.nama}`}
                      className="aspect-square w-full object-cover"
                      fallbackClassName="bg-stone-100 text-stone-300"
                      iconClassName="h-8 w-8"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteImageTarget(image)
                        setDeleteImageError(null)
                      }}
                      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50"
                      aria-label="Hapus foto"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    {image.alt_text ? (
                      <p className="truncate px-2 py-1.5 text-xs text-stone-500">
                        {image.alt_text}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                Belum ada foto. Unggah foto agar hasil tani lebih menarik bagi pengunjung.
              </p>
            )}

            <form onSubmit={handleUploadImage} className="mt-5 border-t border-stone-100 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="foto" label="Pilih Foto" required error={imageError}>
                  <input
                    id="foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                    className="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-emerald-700"
                  />
                </FormField>

                <FormField
                  id="alt_text"
                  label="Teks Alternatif"
                  hint="Opsional. Deskripsi singkat foto untuk pembaca layar."
                >
                  <input
                    id="alt_text"
                    type="text"
                    value={imageAlt}
                    onChange={(event) => setImageAlt(event.target.value)}
                    maxLength={150}
                    className="field-input"
                    placeholder="Foto pisang kepok di kebun"
                  />
                </FormField>
              </div>

              <button type="submit" disabled={uploading} className="btn-primary mt-4">
                <UploadIcon className="h-4 w-4" />
                {uploading ? 'Mengunggah...' : 'Unggah Foto'}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteImageTarget)}
        title="Hapus foto ini?"
        description="Foto akan dihapus dari hasil tani. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Foto"
        loading={deletingImage}
        error={deleteImageError}
        onConfirm={handleDeleteImage}
        onClose={() => {
          if (!deletingImage) {
            setDeleteImageTarget(null)
            setDeleteImageError(null)
          }
        }}
      />
    </div>
  )
}
