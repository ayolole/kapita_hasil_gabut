import { useState } from 'react'
import AdminNotice from '../../components/admin/AdminNotice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import FormField from '../../components/admin/FormField'
import Modal from '../../components/admin/Modal'
import PageHeader from '../../components/admin/PageHeader'
import TableSkeleton from '../../components/admin/TableSkeleton'
import { EmptyState, ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api, { getErrorMessage, getValidationErrors } from '../../lib/api'
import { formatJumlah } from '../../lib/format'
import { PencilIcon, PlusIcon, TagIcon, TrashIcon } from '../../components/Icons'

const emptyForm = { nama: '', slug: '' }

export default function AdminCategoriesPage() {
  const categories = useApiResource(() => api.get('/api/admin/categories'), [])

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

  const items = categories.data?.data ?? []

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setForm({ nama: category.nama ?? '', slug: category.slug ?? '' })
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
      nama: form.nama,
      slug: form.slug.trim() === '' ? null : form.slug.trim(),
    }

    try {
      if (editing) {
        await api.patch(`/api/admin/categories/${editing.id}`, payload)
        setNotice(`Kategori "${form.nama}" berhasil diperbarui.`)
      } else {
        await api.post('/api/admin/categories', payload)
        setNotice(`Kategori "${form.nama}" berhasil ditambahkan.`)
      }

      setDialogOpen(false)
      categories.reload()
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
      await api.delete(`/api/admin/categories/${deleteTarget.id}`)
      setNotice(`Kategori "${deleteTarget.nama}" berhasil dihapus.`)
      setDeleteTarget(null)
      categories.reload()
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Kategori"
        description="Kelompokkan hasil tani agar pengunjung mudah menemukan yang dicari."
        actions={
          <button type="button" onClick={openCreate} className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Tambah Kategori
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

      <div className="admin-card mt-4 overflow-hidden">
        {categories.loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : categories.error ? (
          <div className="p-4">
            <ErrorState
              error={categories.error}
              onRetry={categories.reload}
              title="Gagal memuat kategori"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="package"
              title="Belum ada kategori"
              description="Tambahkan kategori pertama, misalnya Buah, Sayur, atau Beras."
              action={
                <button type="button" onClick={openCreate} className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Tambah Kategori
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="admin-th">Nama Kategori</th>
                  <th scope="col" className="admin-th">Slug</th>
                  <th scope="col" className="admin-th">Jumlah Hasil Tani</th>
                  <th scope="col" className="admin-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((category) => (
                  <tr key={category.id} className="hover:bg-stone-50/70">
                    <td className="admin-td">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <TagIcon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-stone-900">{category.nama}</span>
                      </div>
                    </td>
                    <td className="admin-td">
                      <span className="font-mono text-xs text-stone-500">/{category.slug}</span>
                    </td>
                    <td className="admin-td">
                      {formatJumlah(category.jumlah_produk ?? 0)} hasil tani
                    </td>
                    <td className="admin-td">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(category)
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
        title={editing ? 'Edit Kategori' : 'Tambah Kategori'}
        description="Nama kategori akan tampil di filter halaman hasil tani."
        footer={
          <>
            <button type="button" onClick={closeDialog} disabled={saving} className="btn-secondary">
              Batal
            </button>
            <button type="submit" form="form-kategori" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan Kategori'}
            </button>
          </>
        }
      >
        {formError ? (
          <AdminNotice variant="error" className="mb-4">
            {formError}
          </AdminNotice>
        ) : null}

        <form id="form-kategori" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField id="nama" label="Nama Kategori" required error={errors.nama}>
            <input
              id="nama"
              type="text"
              value={form.nama}
              onChange={handleChange('nama')}
              maxLength={80}
              autoFocus
              className="field-input"
              placeholder="Contoh: Buah"
              aria-invalid={Boolean(errors.nama)}
            />
          </FormField>

          <FormField
            id="slug"
            label="Slug URL"
            hint="Opsional. Kosongkan agar dibuat otomatis dari nama kategori."
            error={errors.slug}
          >
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={handleChange('slug')}
              maxLength={100}
              className="field-input"
              placeholder="buah"
              aria-invalid={Boolean(errors.slug)}
            />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus kategori ini?"
        description={
          deleteTarget
            ? `Kategori "${deleteTarget.nama}" akan dihapus. Kategori yang masih dipakai hasil tani tidak dapat dihapus.`
            : ''
        }
        confirmLabel="Ya, Hapus Kategori"
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
