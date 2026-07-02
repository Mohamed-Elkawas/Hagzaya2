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
import { OwnerTournamentsTab } from './modules/tournaments/pages/OwnerTournamentsTab'
import { OwnerTournamentPaymentsPage } from './modules/tournaments/pages/OwnerTournamentPaymentsPage'
import TournamentJoinPage from './modules/tournaments/pages/TournamentJoinPage'

// ─── Fields Module Pages ─────────────────────────────────────────────────────
import { FieldsPage } from './modules/fields/pages/FieldsPage'
import { FieldDetailsPage } from './modules/fields/pages/FieldDetailsPage'
import { OwnerFieldsPage } from './modules/fields/pages/OwnerFieldsPage'
import { CreateFieldPage } from './modules/fields/pages/CreateFieldPage'
import { OwnerLayout } from './modules/owner/components/OwnerLayout'
import { OwnerDashboardPage } from './modules/owner/pages/OwnerDashboardPage'
import { OwnerBookingsPage } from './modules/owner/pages/OwnerBookingsPage'

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
import { PlayerLayout } from './modules/player/components/PlayerLayout'

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

          {/* ⚽ Player Routes with Global Navbar */}
          <Route element={<PlayerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fields" element={<FieldsPage />} />
            <Route path="/fields/:id" element={<FieldDetailsPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            
            {/* 🏆 Tournament Player Routes */}
            <Route path="/tournaments" element={<TournamentExplore />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/tournaments/:id/join" element={<TournamentJoinPage />} />

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
          </Route>

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

          {/* 💼 Owner Management Routes (Wrapped in OwnerLayout for Sidebar persistence) */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="bookings" element={<OwnerBookingsPage />} />
            <Route path="fields" element={<OwnerFieldsPage />} />
            <Route path="fields/create" element={<CreateFieldPage />} />
            
            {/* 🏆 Owner Tournament Management Routes */}
            <Route path="tournaments" element={<OwnerTournamentsTab />} />
            <Route path="tournaments/payments" element={<OwnerTournamentPaymentsPage />} />
          </Route>

          {/* 🏆 Tournament Module Owner Route */}
          <Route path="/tournaments/create" element={<CreateTournament />} />

          {/* 🔄 Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App