import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Layout from './components/Layout'
import { AuthProvider } from './contexts/AuthContext'
import { SettingsProvider } from './contexts/SettingsContext'
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminFarmerFormPage from './pages/admin/AdminFarmerFormPage'
import AdminFarmersPage from './pages/admin/AdminFarmersPage'
import AdminLeadsPage from './pages/admin/AdminLeadsPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminPagesPage from './pages/admin/AdminPagesPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import HasilTaniPage from './pages/HasilTaniPage'
import FarmerProfilePage from './pages/FarmerProfilePage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StaticPage from './pages/StaticPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="hasil-tani" element={<HasilTaniPage />} />
              <Route path="katalog" element={<Navigate to="/hasil-tani" replace />} />
              <Route path="produk/:slug" element={<ProductDetailPage />} />
              <Route path="petani/:id" element={<FarmerProfilePage />} />
              <Route path="profil-desa" element={<Navigate to="/#profil-desa" replace />} />
              <Route path="halaman/:slug" element={<StaticPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="admin/login" element={<AdminLoginPage />} />

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="produk" element={<AdminProductsPage />} />
              <Route path="produk/baru" element={<AdminProductFormPage />} />
              <Route path="produk/:id" element={<AdminProductFormPage />} />
              <Route path="kategori" element={<AdminCategoriesPage />} />
              <Route path="petani" element={<AdminFarmersPage />} />
              <Route path="petani/baru" element={<AdminFarmerFormPage />} />
              <Route path="petani/:id" element={<AdminFarmerFormPage />} />
              <Route path="lead" element={<AdminLeadsPage />} />
              <Route path="pengaturan" element={<AdminSettingsPage />} />
              <Route path="halaman" element={<AdminPagesPage />} />
              <Route path="log-aktivitas" element={<AdminActivityLogsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
