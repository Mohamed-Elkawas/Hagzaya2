'use client'

import RegisterWizard from '../components/RegisterWizard'

export function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f8faf9]">
      {/* ── Atmospheric Background ───────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none">
        <div
          className="bg-blob"
          style={{
            bottom: '-10%',
            right: '-10%',
            width: '50%',
            height: '50%',
            background: 'rgba(0, 107, 32, 0.05)',
          }}
        />
        <div
          className="bg-blob"
          style={{
            top: '-10%',
            left: '-10%',
            width: '40%',
            height: '40%',
            background: 'rgba(0, 110, 33, 0.04)',
          }}
        />
      </div>

      {/* ── Register Wizard Card ─────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-lg">
        <RegisterWizard />
      </div>

      {/* ── System Footer ────────────────────────────────────────────────────── */}
      <footer className="absolute bottom-4 left-0 right-0 text-center space-y-1">
        <p className="text-xs text-[#3e4a3c]/60">© 2024 Hagzaya Smart Systems</p>
        <div className="flex justify-center gap-4 text-xs text-[#3e4a3c]/50">
          <a href="#" className="hover:text-[#006b20] transition-colors">
            سياسة الخصوصية
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#006b20] transition-colors">
            الشروط والأحكام
          </a>
        </div>
      </footer>
    </main>
  )
}

export default RegisterPage
