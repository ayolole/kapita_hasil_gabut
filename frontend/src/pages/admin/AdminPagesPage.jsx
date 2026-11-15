import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNotice from '../../components/admin/AdminNotice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import FormField from '../../components/admin/FormField'
import Modal from '../../components/admin/Modal'
import PageHeader from '../../components/admin/PageHeader'
import TableSkeleton from '../../components/admin/TableSkeleton'
import { EmptyState, ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api, { getErrorMessage, getValidationErrors } from '../../lib/api'
import { formatTanggal } from '../../lib/format'
import {
  ExternalLinkIcon,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/Icons'

const emptyForm = { judul: '', slug: '', isi: '' }

export default function AdminPagesPage() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const pages = useApiResource(
    () => api.get('/api/admin/pages', { params: { search: search || undefined } }),
    [search],
  )

  const [notice, setNotice] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const items = pages.data?.data ?? []

  const handleSearch = (event) => {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleReset = () => {
    setSearchInput('')
    setSearch('')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (page) => {
    setEditing(page)
    setForm({ judul: page.judul ?? '', slug: page.slug ?? '', isi: page.isi ?? '' })
    setErrors({})
    setFormError(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    if (saving) {
      return
    }

    setDialogOpen(false)
  }

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError(null)

    const payload = {
      judul: form.judul,
      slug: form.slug.trim() === '' ? null : form.slug.trim(),
      isi: form.isi,
    }

    try {
      if (editing) {
        await api.patch(`/api/admin/pages/${editing.id}`, payload)
        setNotice(`Halaman "${form.judul}" berhasil diperbarui.`)
      } else {
        await api.post('/api/admin/pages', payload)
        setNotice(`Halaman "${form.judul}" berhasil ditambahkan.`)
      }

      setDialogOpen(false)
      pages.reload()
    } catch (error) {
      const validation = getValidationErrors(error)
      setErrors(validation)

      if (Object.keys(validation).length === 0) {
        setFormError(getErrorMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      await api.delete(`/api/admin/pages/${deleteTarget.id}`)
      setNotice(`Halaman "${deleteTarget.judul}" berhasil dihapus.`)
      setDeleteTarget(null)
      pages.reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Halaman"
        description="Kelola halaman statis seperti Potensi Pertanian dan Cerita Petani."
        actions={
          <button type="button" onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Tambah Halaman
          </button>
        }
      />

      <div className="mt-5">
        {notice ? (
          <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </AdminNotice>
        ) : null}
      </div>

      <div className="admin-card mt-5 p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex gap-2" role="search">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari judul atau slug halaman..."
              aria-label="Cari halaman"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        {search ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              Atur ulang pencarian
            </button>
          </div>
        ) : null}
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        {pages.loading ? (
          <TableSkeleton rows={4} columns={3} />
        ) : pages.error ? (
          <div className="p-4">
            <ErrorState
              error={pages.error}
              onRetry={pages.reload}
              title="Gagal memuat daftar halaman"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="search"
              title={search ? 'Halaman tidak ditemukan' : 'Belum ada halaman'}
              description={
                search
                  ? 'Tidak ada halaman yang cocok dengan kata kunci. Coba kata kunci lain.'
                  : 'Tambahkan halaman statis untuk menampilkan informasi tambahan tentang desa.'
              }
              action={
                search ? (
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Atur ulang pencarian
                  </button>
                ) : (
                  <button type="button" onClick={openCreate} className="btn-primary">
                    <PlusIcon className="h-4 w-4" />
                    Tambah Halaman
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="admin-th">Judul</th>
                  <th scope="col" className="admin-th">Slug</th>
                  <th scope="col" className="admin-th">Diperbarui</th>
                  <th scope="col" className="admin-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((page) => (
                  <tr key={page.id} className="hover:bg-stone-50/70">
                    <td className="admin-td">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <FileTextIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-stone-900">{page.judul}</p>
                          <p className="truncate text-xs text-stone-400">
                            {String(page.isi ?? '').slice(0, 80)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="admin-td">
                      <span className="font-mono text-xs text-stone-500">/{page.slug}</span>
                    </td>
                    <td className="admin-td whitespace-nowrap text-stone-500">
                      {formatTanggal(page.diperbarui_pada) ?? '-'}
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/halaman/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                          Lihat
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(page)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(page)
                            setDeleteError(null)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? 'Edit Halaman' : 'Tambah Halaman'}
        description="Isi halaman ditampilkan apa adanya di situs publik."
        size="lg"
        footer={
          <>
            <button type="button" onClick={closeDialog} disabled={saving} className="btn-secondary">
              Batal
            </button>
            <button type="submit" form="form-halaman" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan Halaman'}
            </button>
          </>
        }
      >
        {formError ? (
          <AdminNotice variant="error" className="mb-4">
            {formError}
          </AdminNotice>
        ) : null}

        <form id="form-halaman" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField id="judul" label="Judul Halaman" required error={errors.judul}>
            <input
              id="judul"
              type="text"
              value={form.judul}
              onChange={handleChange('judul')}
              maxLength={150}
              autoFocus
              className="field-input"
              placeholder="Contoh: Potensi Pertanian"
              aria-invalid={Boolean(errors.judul)}
            />
          </FormField>

          <FormField
            id="slug"
            label="Slug URL"
            hint="Opsional. Kosongkan agar dibuat otomatis dari judul halaman."
            error={errors.slug}
          >
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={handleChange('slug')}
              maxLength={100}
              className="field-input"
              placeholder="potensi-pertanian"
              aria-invalid={Boolean(errors.slug)}
            />
          </FormField>

          <FormField
            id="isi"
            label="Isi Halaman"
            required
            hint="Tulis paragraf dengan pemisah baris kosong. Mendukung penulisan sederhana."
            error={errors.isi}
          >
            <textarea
              id="isi"
              rows={12}
              value={form.isi}
              onChange={handleChange('isi')}
              maxLength={50000}
              className="field-input resize-y"
              placeholder="Tulis isi halaman di sini..."
              aria-invalid={Boolean(errors.isi)}
            />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus halaman ini?"
        description={
          deleteTarget
            ? `Halaman "${deleteTarget.judul}" akan dihapus dari situs publik. Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Ya, Hapus Halaman"
        loading={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      />
    </div>
  )
}
