import { useEffect, useState } from 'react'
import AdminNotice from '../../components/admin/AdminNotice'
import FormField from '../../components/admin/FormField'
import Modal from '../../components/admin/Modal'
import PageHeader from '../../components/admin/PageHeader'
import TableSkeleton from '../../components/admin/TableSkeleton'
import Pagination from '../../components/Pagination'
import { EmptyState, ErrorState } from '../../components/StateBlocks'
import { useApiResource } from '../../hooks/useApiResource'
import api, { getErrorMessage, getValidationErrors } from '../../lib/api'
import {
  downloadApiFile,
  leadStatusOptions,
  leadStatusStyles,
  todayStamp,
} from '../../lib/admin'
import { formatJumlah, formatTanggal } from '../../lib/format'
import {
  DownloadIcon,
  EyeIcon,
  SearchIcon,
  WhatsAppIcon,
} from '../../components/Icons'

const initialFilters = {
  search: '',
  status: '',
  dari: '',
  sampai: '',
  sort: 'terbaru',
}

function statusLabel(value) {
  return leadStatusOptions.find((option) => option.value === value)?.label ?? value
}

function LeadDetailModal({ leadId, onClose, onSaved }) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState({ status: 'baru', catatan_admin: '' })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!leadId) {
      return undefined
    }

    let active = true

    setState({ data: null, loading: true, error: null })
    setErrors({})
    setSaveError(null)
    setNotice(null)

    api
      .get(`/api/admin/leads/${leadId}`)
      .then((response) => {
        if (!active) {
          return
        }

        const data = response.data?.data ?? null
        setState({ data, loading: false, error: null })
        setForm({
          status: data?.status?.value ?? 'baru',
          catatan_admin: data?.catatan_admin ?? '',
        })
      })
      .catch((error) => {
        if (active) {
          setState({ data: null, loading: false, error })
        }
      })

    return () => {
      active = false
    }
  }, [leadId, reloadKey])

  const lead = state.data

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setSaveError(null)
    setNotice(null)

    try {
      const response = await api.patch(`/api/admin/leads/${leadId}`, {
        status: form.status,
        catatan_admin: form.catatan_admin.trim() === '' ? null : form.catatan_admin,
      })

      setState((previous) => ({ ...previous, data: response.data?.data ?? previous.data }))
      setNotice('Perubahan permintaan berhasil disimpan.')
      onSaved?.()
    } catch (error) {
      const validation = getValidationErrors(error)
      setErrors(validation)

      if (Object.keys(validation).length === 0) {
        setSaveError(getErrorMessage(error))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={Boolean(leadId)}
      onClose={saving ? () => {} : onClose}
      title="Detail Permintaan Informasi"
      description="Periksa permintaan informasi dan catat tindak lanjutnya."
      size="lg"
      closeOnBackdrop={!saving}
      footer={
        <>
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Tutup
          </button>
          <button type="submit" form="form-lead-detail" disabled={saving || state.loading} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </>
      }
    >
      {state.loading ? (
        <div className="space-y-3" aria-hidden="true">
          <div className="skeleton h-5 w-1/3" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      ) : state.error ? (
        <AdminNotice variant="error">
          {getErrorMessage(state.error)}{' '}
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="font-semibold underline underline-offset-2"
          >
            Coba lagi
          </button>
        </AdminNotice>
      ) : lead ? (
        <form id="form-lead-detail" onSubmit={handleSubmit} className="space-y-5" noValidate>
          {notice ? (
            <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
              {notice}
            </AdminNotice>
          ) : null}
          {saveError ? (
            <AdminNotice variant="error" onDismiss={() => setSaveError(null)}>
              {saveError}
            </AdminNotice>
          ) : null}

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-stone-500">{lead.kode_ref}</p>
                <p className="mt-1 font-bold text-stone-900">{lead.nama_pembeli}</p>
              </div>
              <span
                className={`badge ${
                  leadStatusStyles[lead.status?.value] ?? leadStatusStyles.baru
                }`}
              >
                {lead.status?.label ?? statusLabel(lead.status?.value)}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Hasil Tani
                </dt>
                <dd className="mt-0.5 text-stone-800">
                  {lead.produk?.nama ?? 'Hasil tani sudah dihapus'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Kebutuhan
                </dt>
                <dd className="mt-0.5 text-stone-800">{lead.kebutuhan || '-'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Tanggal Masuk
                </dt>
                <dd className="mt-0.5 text-stone-800">
                  {formatTanggal(lead.dibuat_pada, { withTime: true }) ?? '-'}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-stone-200 pt-3">
              <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                Catatan Pemohon
              </p>
              <p className="mt-1 text-sm whitespace-pre-line text-stone-700">
                {lead.catatan ? lead.catatan : 'Tidak ada catatan dari pemohon.'}
              </p>
            </div>
          </div>

          <FormField id="status" label="Status Tindak Lanjut" required error={errors.status}>
            <select
              id="status"
              value={form.status}
              onChange={handleChange('status')}
              className="field-input"
              aria-invalid={Boolean(errors.status)}
            >
              {leadStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="catatan_admin"
            label="Catatan Admin"
            hint="Catatan internal untuk tindak lanjut, tidak dilihat pemohon."
            error={errors.catatan_admin}
          >
            <textarea
              id="catatan_admin"
              rows={3}
              value={form.catatan_admin}
              onChange={handleChange('catatan_admin')}
              maxLength={1000}
              className="field-input resize-y"
              placeholder="Contoh: Sudah dihubungi via WhatsApp, menunggu konfirmasi."
              aria-invalid={Boolean(errors.catatan_admin)}
            />
          </FormField>
        </form>
      ) : null}
    </Modal>
  )
}

export default function AdminLeadsPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const [notice, setNotice] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(null)

  const queryParams = {
    search: filters.search || undefined,
    status: filters.status || undefined,
    dari: filters.dari || undefined,
    sampai: filters.sampai || undefined,
    sort: filters.sort,
    page,
    per_page: 15,
  }

  const leads = useApiResource(
    () => api.get('/api/admin/leads', { params: queryParams }),
    [filters, page],
  )

  const items = leads.data?.data ?? []
  const meta = leads.data?.meta

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }))
    setPage(1)
    setActionError(null)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    updateFilter('search', searchInput.trim())
  }

  const handleReset = () => {
    setSearchInput('')
    setFilters(initialFilters)
    setPage(1)
    setActionError(null)
    setExportError(null)
  }

  const handleStatusChange = async (lead, value) => {
    if (value === lead.status?.value) {
      return
    }

    setBusyId(lead.id)
    setActionError(null)
    setNotice(null)

    try {
      await api.patch(`/api/admin/leads/${lead.id}`, { status: value })
      setNotice(`Status permintaan ${lead.kode_ref} berhasil diperbarui.`)
      leads.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setBusyId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)

    try {
      await downloadApiFile('/api/admin/leads/export', `leads-${todayStamp()}.csv`, queryParams)
    } catch (error) {
      setExportError(getErrorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  const hasFilters =
    filters.search || filters.status || filters.dari || filters.sampai

  return (
    <div>
      <PageHeader
        title="Permintaan Informasi"
        description="Daftar permintaan informasi dari pengunjung melalui WhatsApp. Perbarui status setelah ditindak lanjuti."
        actions={
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary"
          >
            <DownloadIcon className="h-4 w-4" />
            {exporting ? 'Mengunduh...' : 'Unduh CSV'}
          </button>
        }
      />

      <div className="mt-5 space-y-3">
        {notice ? (
          <AdminNotice variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </AdminNotice>
        ) : null}
        {actionError ? (
          <AdminNotice variant="error" onDismiss={() => setActionError(null)}>
            {actionError}
          </AdminNotice>
        ) : null}
        {exportError ? (
          <AdminNotice variant="error" onDismiss={() => setExportError(null)}>
            Gagal mengunduh CSV. {exportError}
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
              placeholder="Cari kode permintaan atau nama pemohon..."
              aria-label="Cari permintaan"
              className="field-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            Cari
          </button>
        </form>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            aria-label="Filter status permintaan"
            className="field-input"
          >
            <option value="">Semua status</option>
            {leadStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div>
            <label htmlFor="lead-dari" className="sr-only">
              Dari tanggal
            </label>
            <input
              id="lead-dari"
              type="date"
              value={filters.dari}
              onChange={(event) => updateFilter('dari', event.target.value)}
              className="field-input"
              title="Dari tanggal"
            />
          </div>

          <div>
            <label htmlFor="lead-sampai" className="sr-only">
              Sampai tanggal
            </label>
            <input
              id="lead-sampai"
              type="date"
              value={filters.sampai}
              onChange={(event) => updateFilter('sampai', event.target.value)}
              className="field-input"
              title="Sampai tanggal"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            aria-label="Urutkan permintaan"
            className="field-input"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-stone-500" aria-live="polite">
            {leads.loading
              ? 'Memuat permintaan...'
              : `${formatJumlah(meta?.total ?? 0)} permintaan ditemukan`}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            >
              Atur ulang filter
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        {leads.loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : leads.error ? (
          <div className="p-4">
            <ErrorState
              error={leads.error}
              onRetry={leads.reload}
              title="Gagal memuat daftar permintaan"
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="search"
              title={hasFilters ? 'Permintaan tidak ditemukan' : 'Belum ada permintaan informasi'}
              description={
                hasFilters
                  ? 'Tidak ada permintaan yang cocok dengan filter. Coba ubah kata kunci atau atur ulang filter.'
                  : 'Permintaan akan muncul di sini setelah pengunjung mengirim permintaan informasi lewat WhatsApp.'
              }
              action={
                hasFilters ? (
                  <button type="button" onClick={handleReset} className="btn-secondary">
                    Atur ulang filter
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th scope="col" className="admin-th">Kode / Pemohon</th>
                  <th scope="col" className="admin-th">Hasil Tani</th>
                  <th scope="col" className="admin-th">Kebutuhan</th>
                  <th scope="col" className="admin-th">Status</th>
                  <th scope="col" className="admin-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {items.map((lead) => {
                  const isBusy = busyId === lead.id

                  return (
                    <tr key={lead.id} className="hover:bg-stone-50/70">
                      <td className="admin-td">
                        <p className="font-mono text-xs font-semibold text-stone-500">
                          {lead.kode_ref}
                        </p>
                        <p className="mt-0.5 font-semibold text-stone-900">{lead.nama_pembeli}</p>
                        <p className="text-xs text-stone-400">
                          {formatTanggal(lead.dibuat_pada, { withTime: true }) ?? '-'}
                        </p>
                      </td>
                      <td className="admin-td">
                        <p className="text-sm text-stone-800">
                          {lead.produk?.nama ?? 'Hasil tani dihapus'}
                        </p>
                        {lead.produk?.satuan ? (
                          <p className="text-xs text-stone-500">per {lead.produk.satuan}</p>
                        ) : null}
                      </td>
                      <td className="admin-td">
                        <p className="line-clamp-2 text-sm text-stone-700">
                          {lead.kebutuhan || '-'}
                        </p>
                      </td>
                      <td className="admin-td">
                        <div className="flex items-center gap-2">
                          <select
                            value={lead.status?.value ?? 'baru'}
                            onChange={(event) => handleStatusChange(lead, event.target.value)}
                            disabled={isBusy}
                            aria-label={`Ubah status permintaan ${lead.kode_ref}`}
                            className="field-input w-32 py-1.5 text-xs"
                          >
                            {leadStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {isBusy ? <span className="text-xs text-stone-400">...</span> : null}
                        </div>
                      </td>
                      <td className="admin-td">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setDetailId(lead.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        meta={meta}
        onPageChange={(nextPage) => {
          setPage(nextPage)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        disabled={leads.loading}
      />

      <LeadDetailModal
        leadId={detailId}
        onClose={() => setDetailId(null)}
        onSaved={leads.reload}
      />

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-500">
        <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#1f9d55]" />
        <p>
          Permintaan dibuat saat pengunjung mengirim pesan ke WhatsApp admin desa. Status di sini
          hanya catatan internal, tidak dikirim otomatis ke pemohon.
        </p>
      </div>
    </div>
  )
}
