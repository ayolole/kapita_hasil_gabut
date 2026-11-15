import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import SafeImage from '../components/SafeImage'
import {
  EmptyState,
  ErrorState,
  FarmerGridSkeleton,
  LoadingState,
  ProductGridSkeleton,
} from '../components/StateBlocks'
import { useSettings } from '../contexts/SettingsContext'
import { useApiResource } from '../hooks/useApiResource'
import api from '../lib/api'
import { formatTanggalSingkat, whatsappLink } from '../lib/format'
import {
  ArrowRightIcon,
  LeafIcon,
  MapPinIcon,
  PackageIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../components/Icons'

function HeroStats({ products, farmers, categories }) {
  const stats = [
    { label: 'Hasil tani', value: products?.meta?.total ?? null },
    { label: 'Kategori', value: categories?.data?.length ?? null },
    { label: 'Petani', value: farmers?.data?.length ?? null },
  ].filter((stat) => stat.value !== null)

  if (stats.length === 0) {
    return null
  }

  return (
    <dl className="mt-8 flex flex-wrap gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm ring-1 ring-white/15"
        >
          <dt className="text-xs text-emerald-200">{stat.label}</dt>
          <dd className="text-lg font-bold text-white">{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function HeroHighlight({ product }) {
  return (
    <div className="relative rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm sm:p-6">
      <div className="overflow-hidden rounded-2xl bg-white/10">
        <SafeImage
          src={product?.gambar_utama}
          alt={product ? `Foto ${product.nama}` : 'Panen warga desa'}
          className="aspect-4/3 w-full object-cover"
          fallbackClassName="bg-emerald-700/40 text-emerald-200"
          iconClassName="h-16 w-16"
        />
      </div>

      {product ? (
        <Link
          to="/hasil-tani"
          className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-lg transition hover:bg-emerald-50"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">{product.nama}</p>
            <p className="mt-0.5 text-sm text-stone-500">
              {product.kategori?.nama ?? 'Hasil panen'}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-emerald-800">{product.satuan}</p>
            <p className="text-xs text-stone-400">per satuan</p>
          </div>
        </Link>
      ) : null}
    </div>
  )
}

function CategorySection({ categories }) {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-stone-900">Kategori Hasil Tani</h2>
      <p className="mt-1 text-sm text-stone-500">Pilih kategori untuk menyaring hasil tani.</p>

      {categories.loading ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton mt-3 h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={categories.reload} title="Gagal memuat kategori" />
      ) : categories.data?.data?.length ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.data.data.map((category) => (
            <Link
              key={category.id}
              to={`/hasil-tani?category=${category.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white">
                <PackageIcon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold text-stone-900">{category.nama}</p>
              <p className="mt-0.5 text-xs text-stone-500">
                {category.jumlah_produk ?? 0} hasil tani
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Kategori belum tersedia"
          description="Kategori Hasil Tani akan muncul setelah dikelola oleh admin desa."
        />
      )}
    </section>
  )
}

function LatestProductsSection({ products }) {
  const items = products.data?.data ?? []

  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Hasil Tani Terbaru</h2>
          <p className="mt-1 text-sm text-stone-500">Panen segar langsung dari kebun warga.</p>
        </div>
        <Link
          to="/hasil-tani"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Lihat semua
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5">
        {products.loading ? (
          <ProductGridSkeleton count={6} />
        ) : products.error ? (
          <ErrorState
            error={products.error}
            onRetry={products.reload}
            title="Gagal memuat hasil tani"
          />
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada hasil tani saat ini"
            description="Hasil panen akan segera tampil di sini setelah admin desa menambahkannya."
            action={
              <Link to="/hasil-tani" className="btn-secondary">
                Ke Hasil Tani
              </Link>
            }
          />
        )}
      </div>
    </section>
  )
}

function FarmersSection({ farmers }) {
  const items = farmers.data?.data ?? []

  return (
    <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-stone-900">Petani Kami</h2>
      <p className="mt-1 text-sm text-stone-500">
        Hasil panen dikerjakan langsung oleh warga Desa Banjar Agung.
      </p>

      <div className="mt-5">
        {farmers.loading ? (
          <FarmerGridSkeleton count={4} />
        ) : farmers.error ? (
          <ErrorState error={farmers.error} onRetry={farmers.reload} title="Gagal memuat daftar petani" />
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((farmer) => (
              <Link
                key={farmer.id}
                to={`/petani/${farmer.id}`}
                className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <SafeImage
                  src={farmer.foto}
                  alt={`Foto ${farmer.nama}`}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-100"
                  fallbackClassName="bg-emerald-100 text-emerald-600"
                  iconClassName="h-7 w-7"
                />
                <p className="mt-3 font-semibold text-stone-900 group-hover:text-emerald-800">
                  {farmer.nama}
                </p>
                {farmer.kelompok ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{farmer.kelompok}</p>
                ) : null}
                {typeof farmer.jumlah_produk === 'number' ? (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {farmer.jumlah_produk} hasil tani
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Profil petani belum tersedia"
            description="Daftar petani akan tampil di sini setelah dikelola oleh admin desa."
          />
        )}
      </div>
    </section>
  )
}

function VillageProfileSection({ profile }) {
  const { settings } = useSettings()
  const page = profile.data?.data
  const namaDesa = settings?.nama_desa ?? 'Desa Banjar Agung'
  const adminWhatsapp = whatsappLink(
    settings?.nomor_whatsapp,
    'Halo Admin Desa Banjar Agung, saya ingin bertanya tentang hasil tani desa.',
  )
  const socialLinks = Object.entries(settings?.media_sosial ?? {}).filter(([, value]) =>
    Boolean(value),
  )

  return (
    <section
      id="profil-desa"
      className="mx-auto mt-14 max-w-6xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Profil Desa</h2>
          <p className="mt-1 text-sm text-stone-500">
            Mengenal {namaDesa} dan potensi hasil tani warganya.
          </p>
        </div>
        <Link
          to="/hasil-tani"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Lihat hasil tani
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {profile.loading ? (
              <div className="space-y-3" aria-hidden="true">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-11/12" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ) : profile.error ? (
              <ErrorState
                error={profile.error}
                onRetry={profile.reload}
                title="Gagal memuat profil desa"
              />
            ) : page ? (
              <>
                <h3 className="text-xl font-bold text-stone-900 sm:text-2xl">{page.judul}</h3>
                {page.diperbarui_pada ? (
                  <p className="mt-1.5 text-xs text-stone-400">
                    Diperbarui {formatTanggalSingkat(page.diperbarui_pada)}
                  </p>
                ) : null}

                {page.isi ? (
                  <div
                    className="prose-desa mt-5"
                    // Konten HTML berasal dari halaman yang dikelola admin desa, bukan input pengguna.
                    dangerouslySetInnerHTML={{ __html: page.isi }}
                  />
                ) : (
                  <EmptyState
                    title="Halaman belum berisi"
                    description="Isi profil desa akan tampil setelah ditulis oleh admin desa."
                  />
                )}
              </>
            ) : (
              <EmptyState
                title="Profil desa belum tersedia"
                description="Profil desa akan tampil setelah admin desa menulis halamannya."
                action={
                  <Link to="/hasil-tani" className="btn-primary">
                    Ke Hasil Tani
                  </Link>
                }
              />
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-stone-900">Pertanyaan &amp; Informasi</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Pengunjung tidak bertransaksi langsung dengan petani. Admin desa membantu
              memberikan informasi ketersediaan dan pengiriman via WhatsApp.
            </p>

            {adminWhatsapp ? (
              <a
                href={adminWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp mt-4 w-full"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Chat Admin Desa
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-stone-900">Lokasi</h3>
            <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Desa Banjar Agung, Kecamatan Jati Agung, Kabupaten Lampung Selatan, Provinsi
              Lampung.
            </p>
          </div>

          {socialLinks.length ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-stone-900">Media Sosial</h3>
              <ul className="mt-3 space-y-2">
                {socialLinks.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={String(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { settings } = useSettings()
  const products = useApiResource(
    () => api.get('/api/products', { params: { per_page: 6, sort: 'terbaru' } }),
    [],
  )
  const categories = useApiResource(() => api.get('/api/categories'), [])
  const farmers = useApiResource(() => api.get('/api/farmers'), [])
  const profile = useApiResource(() => api.get('/api/pages/profil-desa'), [])

  const namaDesa = settings?.nama_desa ?? 'Desa Banjar Agung'
  const tagline =
    settings?.tagline ??
    'Temukan hasil panen segar dan bangun kemitraan langsung dengan warga Desa Banjar Agung.'

  return (
    <div className="pb-4">
      <section className="bg-emerald-900 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-100 uppercase ring-1 ring-emerald-600/40">
              <LeafIcon className="h-3.5 w-3.5" />
              Profil Hasil Tani
            </p>
            <h1 className="mt-5 text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
              Hasil tani segar dari {namaDesa}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-100/90 sm:text-lg">
              {tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/hasil-tani"
                className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow-sm transition hover:bg-lime-300"
              >
                <PackageIcon className="h-4 w-4" />
                Lihat Hasil Tani
              </Link>
              <Link
                to="/#profil-desa"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/60 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
              >
                <UsersIcon className="h-4 w-4" />
                Profil Desa
              </Link>
            </div>

            <HeroStats
              products={products.loading ? null : products.data}
              farmers={farmers.loading ? null : farmers.data}
              categories={categories.loading ? null : categories.data}
            />
          </div>

          <HeroHighlight product={products.data?.data?.[0]} />
        </div>
      </section>

      <VillageProfileSection profile={profile} />
      <CategorySection categories={categories} />
      <LatestProductsSection products={products} />
      <FarmersSection farmers={farmers} />
    </div>
  )
}
