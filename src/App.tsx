import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './core/context/LanguageContext'

// ─── Auth & Dashboard Pages ──────────────────────────────────────────────────
import { LoginPage } from './modules/auth/pages/LoginPage'
import { RegisterPage } from './modules/auth/pages/RegisterPage'
import { VerifyOtpPage } from './modules/auth/pages/VerifyOtpPage'
import { DashboardPage } from './modules/dashboard/pages/DashboardPage'
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './modules/auth/pages/ResetPasswordPage'

// ─── Tournament Module Pages ──────────────────────────────────────────────────
import { TournamentExplore } from './modules/tournaments/pages/TournamentExplore'
import { TournamentDetails } from './modules/tournaments/pages/TournamentDetails'
import { CreateTournament } from './modules/tournaments/pages/CreateTournament'

// ─── Fields Module Pages ─────────────────────────────────────────────────────
import { FieldsPage } from './modules/fields/pages/FieldsPage'
import { FieldDetailsPage } from './modules/fields/pages/FieldDetailsPage'
import { CreateFieldPage } from './modules/fields/pages/CreateFieldPage'
import { OwnerFieldsPage } from './modules/fields/pages/OwnerFieldsPage'
import { OwnerDashboardPage } from './modules/dashboard/pages/OwnerDashboardPage'

// ─── Booking Module Pages (المسارات المفصلة الجديدة خطوة بخطوة) ──────────────
import { DateSelectionPage } from './modules/booking/pages/Dateselectionpage'
import { TimeSlotsPage } from './modules/booking/pages/Timeslotspage'
import { PaymentMethodsPage } from './modules/booking/pages/Paymentmethodspage'
import { ReceiptUploadPage } from './modules/booking/pages/Receiptuploadpage'
import { BookingSuccessPage } from './modules/booking/pages/Bookingsuccesspage'
import { MyBookingsPage } from './modules/booking/pages/Mybookingspage'
import { BookingProvider } from './modules/booking/hooks/useBookingFlow'

// ─── Player Profile & Settings Pages ─────────────────────────────────────────
import { PlayerProfilePage } from './modules/player/pages/PlayerProfilePage'
import { NotificationSettingsPage } from './modules/player/pages/NotificationSettingsPage'
import { SecuritySettingsPage } from './modules/player/pages/SecuritySettingsPage'
import { NotificationList } from './modules/player/components/NotificationList'

// ─── Admin Module Pages ──────────────────────────────────────────────────────
import { AdminDashboard } from './modules/admin/pages/AdminDashboard'
import AdminLayout from './modules/admin/components/AdminLayout'
import AdminFieldsPage from './modules/admin/fields/pages/AdminFieldsPage'
import AdminUsersPage from './modules/admin/users/pages/AdminUsersPage'
import AdminTournamentsPage from './modules/admin/tournaments/pages/AdminTournamentsPage'
import AdminUserDetailsPage from './modules/admin/users/pages/AdminUserDetailsPage'

function App() {
  return (
    <LanguageProvider defaultLang="ar">
      <BrowserRouter>
        <Routes>
          {/* 🔐 Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ⚽ Player Core Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 🗺️ Player Fields Routes */}
          <Route path="/fields" element={<FieldsPage />} />
          <Route path="/fields/:id" element={<FieldDetailsPage />} />

          {/* 💳 Booking & Payment Routes (التنقل التتابعي الجديد) */}
          <Route path="/booking/*" element={
            <BookingProvider>
              <Routes>
                <Route path="date/:id" element={<DateSelectionPage />} />
                <Route path="slots/:id" element={<TimeSlotsPage onNext={function (): void {
                  throw new Error('Function not implemented.')
                }} onBack={function (): void {
                  throw new Error('Function not implemented.')
                }} fieldId={0} />} />
                <Route path="payment" element={<PaymentMethodsPage onNext={function (): void {
                  throw new Error('Function not implemented.')
                }} onBack={function (): void {
                  throw new Error('Function not implemented.')
                }} />} />
                <Route path="receipt" element={<ReceiptUploadPage onNext={function (): void {
                  throw new Error('Function not implemented.')
                }} onBack={function (): void {
                  throw new Error('Function not implemented.')
                }} />} />
                <Route path="success" element={<BookingSuccessPage onClose={function (): void {
                  throw new Error('Function not implemented.')
                }} />} />
              </Routes>
            </BookingProvider>
          } />

          {/* 🛡️ Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="fields" element={<AdminFieldsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:userId" element={<AdminUserDetailsPage />} />
            <Route path="tournaments" element={<AdminTournamentsPage />} />
          </Route>

          {/* My Bookings stays outside wizard flow */}
          <Route path="/my-bookings" element={<MyBookingsPage />} />

          {/* 👤 Player Profile & Settings Routes */}
          <Route path="/player/profile" element={<PlayerProfilePage />} />
          <Route path="/player/settings/notifications" element={<NotificationSettingsPage />} />
          <Route path="/player/settings/security" element={<SecuritySettingsPage />} />
          <Route path="/player/notifications" element={
            <div className="min-h-screen bg-[#f6f8f7] pb-16 pt-12 px-4 md:px-8">
              <div className="max-w-2xl mx-auto">
                <NotificationList />
              </div>
            </div>
          } />

          {/* 💼 Owner Management Routes */}
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/fields" element={<OwnerFieldsPage />} />
          <Route path="/owner/fields/create" element={<CreateFieldPage />} />

          {/* 🏆 Tournament Module Routes */}
          <Route path="/tournaments" element={<TournamentExplore />} />
          <Route path="/tournaments/create" element={<CreateTournament />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />

          {/* 🔄 Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App