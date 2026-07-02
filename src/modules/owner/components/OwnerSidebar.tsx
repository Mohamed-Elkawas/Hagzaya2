import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Activity, 
    CalendarDays, 
    Trophy, 
    BadgeDollarSign, 
    LogOut, 
    Globe
} from 'lucide-react';
import { useLanguage } from '../../../core/context/LanguageContext';

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, path: '/owner/dashboard', ar: 'لوحة البيانات', en: 'Dashboard' },
    { id: 'fields', icon: Activity, path: '/owner/fields', ar: 'إدارة ملاعبي', en: 'Manage Fields' },
    { id: 'bookings', icon: CalendarDays, path: '/owner/bookings', ar: 'طلبات الحجز والعمليات', en: 'Bookings & Operations' },
    { id: 'tournaments', icon: Trophy, path: '/owner/tournaments', ar: 'البطولات', en: 'Tournaments' },
    { id: 'payments', icon: BadgeDollarSign, path: '/owner/tournaments/payments', ar: 'مدفوعات البطولات', en: 'Tournament Payments' },
];

export function OwnerSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const { lang, toggleLanguage, t } = useLanguage();

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen z-50">
            <div className="p-6 border-b border-slate-800 shrink-0">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2" dir="ltr">
                    <span className="text-indigo-400">Hagzaya</span> Owner
                </h2>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive 
                                    ? 'bg-indigo-600 text-white font-bold shadow-md' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-semibold'
                            }`}
                        >
                            <item.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{t(`owner.nav.${item.id}`)}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
                {/* Language Switcher */}
                <button 
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-all"
                >
                    <Globe size={20} className="shrink-0" />
                    <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold transition-all">
                    <LogOut size={20} className="shrink-0" />
                    <span>{t('owner.nav.logout')}</span>
                </button>
            </div>
        </aside>
    );
}
