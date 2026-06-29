'use client'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../core/context/LanguageContext'
import { fieldsApi } from '../../fields/api/fields.api'
import type { Field } from '../../fields/types/fields.types'

interface Tournament {
  id: number
  title: string
  prize: string
  teamsCount: string
  status: string
  progress: number
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  const wrapped = value as { data?: T[] }
  if (wrapped && Array.isArray(wrapped.data)) return wrapped.data
  return []
}

// ─── دالة مساعدة لفك بيانات الـ User من الـ JWT Token المخزن ───
function getUserFromToken(): { name: string; email?: string } | null {
  try {
    const token = localStorage.getItem('hagzaya_token')
    if (!token) return null

    // فك الجزء الثاني من الـ JWT (Payload)
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const decoded = JSON.parse(jsonPayload)
    // استخراج الاسم بناءً على مسميات الـ Claims الشائعة في .NET Core
    const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name || decoded.Username || "لاعب حجززايا"
    return { name }
  } catch (e) {
    console.error("Error decoding token:", e)
    return { name: "لاعب حجززايا" }
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { t, lang, toggleLanguage } = useLanguage()

  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userName, setUserName] = useState('لاعب حجززايا')

  // ── API state ─────────────────────────────────────────────────────────────
  const [popularFields, setPopularFields] = useState<Field[]>([])
  const [popularTournaments] = useState<Tournament[]>([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [tournamentsLoading, setTournamentsLoading] = useState(true)

  useEffect(() => {
    // جلب اسم المستخدم الحقيقي ديناميكياً عند تحميل الصفحة
    const user = getUserFromToken()
    if (user) {
      setUserName(user.name)
    }

    setFieldsLoading(true)
    fieldsApi.getPopularFields(4)
      .then((res) => setPopularFields(toArray<Field>(res)))
      .catch(() => setPopularFields([]))
      .finally(() => setFieldsLoading(false))

    setTournamentsLoading(false)
  }, [])

  const seedTournaments: Tournament[] = [
    {
      id: 1,
      title: 'October Weekend League',
      prize: 'EGP 15000',
      teamsCount: '2/12',
      status: 'مفتوحة',
      progress: 16.6,
    },
    {
      id: 2,
      title: 'hagzaya tour',
      prize: '500',
      teamsCount: '0/16',
      status: 'مفتوحة',
      progress: 0,
    },
  ]

  const displayedTournaments: Tournament[] =
    popularTournaments.length > 0 ? popularTournaments : seedTournaments

  const handleLogout = () => {
    localStorage.removeItem('hagzaya_token')
    localStorage.removeItem('hagzaya_role')
    window.location.href = '/'
  }

  // الحصول على أول حرف من الاسم لعرضه داخل الأفاتار
  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : 'M'

  return (
    <div className={`min-h-screen bg-[#f6f8f7] pb-16 ${lang === 'ar' ? 'font-ar' : 'font-en'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ─── 1. NAVBAR ─── */}
      <nav className="bg-white border-b border-[#e1e3e1] sticky top-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-[#006b20] rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">sports_soccer</span>
            </div>
            <span className="text-xl font-bold tracking-wider text-[#006b20] font-mono">HAGZAYA</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <button className="px-4 py-2 rounded-xl bg-[#e8f5e9] text-[#006b20] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">home</span>
              <span>{t('nav.home')}</span>
            </button>
            <button onClick={() => navigate('/fields')} className="px-4 py-2 rounded-xl text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-lg">stadium</span>
              <span>{t('nav.fields')}</span>
            </button>
            <button onClick={() => navigate('/tournaments')} className="px-4 py-2 rounded-xl text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-lg">trophy</span>
              <span>{t('nav.tournaments')}</span>
            </button>
            <button onClick={() => navigate('/my-bookings')} className="px-4 py-2 rounded-xl text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
              <span>{t('nav.bookings')}</span>
            </button>
          </div>
        </div>

        {/* Left Side: Language & Profile */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={toggleLanguage}
            className="text-sm font-semibold text-[#3e4a3c] flex items-center gap-1 hover:bg-[#f0f2f0] px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">translate</span>
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          <button className="w-8 h-8 flex items-center justify-center bg-[#f0f2f0] rounded-full hover:bg-[#e1e3e1] transition-colors relative">
            <span className="material-symbols-outlined text-xl text-[#3e4a3c]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#006b20] rounded-full"></span>
          </button>

          {/* User Profile Dropdown TRIGGER */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-[#006b20]/10 border border-[#006b20]/20 flex items-center justify-center text-[#006b20] font-bold text-sm cursor-pointer hover:bg-[#006b20]/20 transition-all"
            >
              {userInitial}
            </button>

            {/* Profile Menu Dropdown Overlay */}
            {showProfileMenu && (
              <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#e1e3e1] py-3 z-50 animate-fade-in`}>
                <div className="px-4 py-2 border-b border-[#e1e3e1] mb-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f2f0] flex items-center justify-center text-sm font-bold text-[#3e4a3c] shrink-0">
                    {userInitial}
                  </div>
                  {/* ✅ عرض اسم المستخدم الحقيقي هنا */}
                  <div className="text-xs font-semibold text-[#191c1c] truncate">
                    {userName}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/player/profile')}
                  className="w-full px-4 py-2.5 text-start text-sm font-medium text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-[#3e4a3c]/70">person</span>
                  <span>{t('menu.profile')}</span>
                </button>
                <button className="w-full px-4 py-2.5 text-start text-sm font-medium text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-lg text-[#3e4a3c]/70">star</span>
                  <span>{t('menu.favorites')}</span>
                </button>
                <button className="w-full px-4 py-2.5 text-start text-sm font-medium text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-lg text-[#3e4a3c]/70">trophy</span>
                  <span>{t('menu.myTournaments')}</span>
                </button>
                <button className="w-full px-4 py-2.5 text-start text-sm font-medium text-[#3e4a3c] hover:bg-[#f0f2f0] flex items-center gap-3 transition-colors">
                  <span className="material-symbols-outlined text-lg text-[#3e4a3c]/70">settings</span>
                  <span>{t('menu.settings')}</span>
                </button>
                <div className="h-[1px] bg-[#e1e3e1] my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-start text-sm font-semibold text-[#ba1a1a] hover:bg-rose-50 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>{t('menu.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION ─── */}
      <header className="relative min-h-[450px] bg-slate-800 flex flex-col items-center justify-center text-center px-4 py-12 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('/pngtree-golden-sunset-over-empty-soccer-arena-with-ball-on-center-spot-image_20161478.webp')" }}
        />
        <div className="absolute inset-0 bg-slate-950/60 z-0"></div>

        <div className="relative z-10 max-w-2xl space-y-4 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            {t('hero.title')}
          </h2>
          <p className="text-sm md:text-base text-slate-200/90 max-w-xl mx-auto font-medium leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="pt-6 max-w-xl mx-auto w-full">
            <div className="bg-white rounded-full p-2 flex items-center gap-2 shadow-2xl border border-white/20 focus-within:border-[#006b20] transition-all">
              <span className="material-symbols-outlined text-[#3e4a3c]/50 pe-3 ps-1 pointer-events-none shrink-0 transition-colors focus-within:text-[#006b20]">location_on</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-[#191c1c] placeholder-[#3e4a3c]/40 outline-none border-none px-2"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
              <button onClick={() => navigate(`/fields?search=${searchQuery}`)} className="bg-[#006b20] text-white px-8 h-12 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#005318] shadow-lg transition-all active:scale-[0.98] shrink-0">
                <span className="material-symbols-outlined text-lg">search</span>
                <span>{t('search.button')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 3. MAIN CONTENT CONTAINER ─── */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-10 space-y-12">
        {/* Quick Actions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#e1e3e1] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#e8f5e9] text-[#006b20] rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">groups</span>
              </div>
              <div className="text-start">
                <h3 className="font-bold text-[#191c1c] text-lg">{t('action.friendly.title')}</h3>
                <p className="text-xs text-[#3e4a3c] mt-0.5">{t('action.friendly.subtitle')}</p>
              </div>
            </div>
            <button onClick={() => navigate('/fields')} className="bg-[#006b20] hover:bg-[#005318] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors">{t('action.friendly.btn')}</button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#e1e3e1] shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#e8f5e9] text-[#006b20] rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">emoji_events</span>
              </div>
              <div className="text-start">
                <h3 className="font-bold text-[#191c1c] text-lg">{t('action.tournament.title')}</h3>
                <p className="text-xs text-[#3e4a3c] mt-0.5">{t('action.tournament.subtitle')}</p>
              </div>
            </div>
            <button onClick={() => navigate('/tournaments')} className="bg-[#006b20] hover:bg-[#005318] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors">{t('action.tournament.btn')}</button>
          </div>
        </section>

        {/* Popular Fields */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <h3 className="text-xl font-extrabold text-[#191c1c]">{t('section.fields.title')}</h3>
              <p className="text-xs text-[#3e4a3c] mt-0.5">{t('section.fields.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/fields')} className="text-xs font-bold text-[#3e4a3c] flex items-center gap-1 hover:underline">
              <span>{t('common.viewAll')}</span>
              <span className="material-symbols-outlined text-sm">{lang === 'ar' ? 'arrow_left' : 'arrow_right'}</span>
            </button>
          </div>

          {fieldsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm animate-pulse h-32" />
              ))}
            </div>
          ) : popularFields.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e1e3e1] p-12 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
              <div className="w-12 h-12 bg-[#f0f2f0] rounded-full flex items-center justify-center text-[#3e4a3c]/60">
                <span className="material-symbols-outlined text-2xl">location_off</span>
              </div>
              <h4 className="font-bold text-sm text-[#191c1c]">{t('section.fields.empty.title')}</h4>
              <p className="text-xs text-[#3e4a3c]/70 max-w-xs">{t('section.fields.empty.desc')}</p>
              <button onClick={() => navigate('/fields')} className="mt-2 bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#191c1c] px-4 py-2 rounded-xl text-xs font-bold transition-colors">{t('common.viewAll')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Array.isArray(popularFields) ? popularFields : (popularFields as any)?.data || [])?.map((field: any) => (
                <div
                  key={field.id}
                  onClick={() => navigate(`/fields/${field.id}`)}
                  className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 text-start">
                      <h4 className="font-extrabold text-base text-[#191c1c]">{field.name}</h4>
                      <p className="text-[11px] text-[#3e4a3c]/60 font-medium">{field.city}، {field.governorate}</p>
                    </div>
                    <p className="text-sm font-black text-[#006b20]">{field.pricePm || field.pricePerHour || 400} EGP/h</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Tournaments */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-start">
              <h3 className="text-xl font-extrabold text-[#191c1c]">{t('section.tournaments.title')}</h3>
              <p className="text-xs text-[#3e4a3c] mt-0.5">{t('section.tournaments.subtitle')}</p>
            </div>
            <button onClick={() => navigate('/tournaments')} className="text-xs font-bold text-[#3e4a3c] flex items-center gap-1 hover:underline">
              <span>{t('common.viewAll')}</span>
              <span className="material-symbols-outlined text-sm">{lang === 'ar' ? 'arrow_left' : 'arrow_right'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-white rounded-2xl border border-[#e1e3e1] p-5 shadow-sm flex flex-col justify-between space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 text-start">
                    <span className="bg-[#e8f5e9] text-[#006b20] text-[10px] font-bold px-2 py-0.5 rounded-full">{tournament.status}</span>
                    <h4 className="font-extrabold text-base text-[#191c1c] pt-1">{tournament.title}</h4>
                    <p className="text-[11px] text-[#3e4a3c]/60 font-medium">{t('common.teamsJoined')}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-[10px] font-bold text-[#3e4a3c]/50">{t('common.prizePool')}</p>
                    <p className="text-sm font-black text-[#006b20]">{tournament.prize}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#191c1c]">
                    <span>{tournament.teamsCount}</span>
                  </div>
                  <div className="w-full bg-[#f0f2f0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#006b20] h-full rounded-full transition-all duration-500" style={{ width: `${tournament.progress}%` }}></div>
                  </div>
                </div>

                <button onClick={() => navigate(`/tournaments/${tournament.id}`)} className="w-full bg-[#006b20] hover:bg-[#005318] text-white py-3 rounded-xl font-bold text-xs transition-colors shadow-sm active:scale-[0.99]">
                  {t('common.joinTournament')}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage