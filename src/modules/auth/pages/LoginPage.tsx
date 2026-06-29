'use client'

import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#f6f8f7]">
      {/* ── Atmospheric Background Blobs ────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none">
        <div
          className="bg-blob"
          style={{
            top: '-10%',
            left: '-5%',
            width: '24rem',
            height: '24rem',
            background: 'rgba(0, 107, 32, 0.05)',
          }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: '10%',
            right: '0%',
            width: '31rem',
            height: '31rem',
            background: 'rgba(212, 229, 235, 0.2)',
          }}
        />
        <div
          className="bg-blob"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60rem',
            height: '60rem',
            background: 'rgba(232, 245, 233, 0.3)',
          }}
        />
      </div>

      {/* ── Login Card ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}

export default LoginPage
