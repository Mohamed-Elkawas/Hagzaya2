import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../core/context/LanguageContext';
import { useNotificationStore } from '../hooks/usePlayerNotifications';
import { NotificationList } from './NotificationList';

function getUserFromToken(): { name: string; email?: string } | null {
  try {
    const token = localStorage.getItem('hagzaya_token');
    if (!token) return null;

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name || decoded.Username || "لاعب حجززايا";
    return { name };
  } catch (e) {
    console.error("Error decoding token:", e);
    return { name: "لاعب حجززايا" };
  }
}

export function PlayerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, toggleLanguage } = useLanguage();
  
  const { unreadCount, fetchNotifications } = useNotificationStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [userName, setUserName] = useState('لاعب حجززايا');

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserName(user.name);
    }
    
    // Fetch notifications initially
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hagzaya_token');
    localStorage.removeItem('hagzaya_role');
    window.location.href = '/';
  };

  const userInitial = userName ? userName.trim().charAt(0).toUpperCase() : 'M';
  const isAr = lang === 'ar';

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className={`min-h-screen bg-[#f6f8f7] ${isAr ? 'font-ar' : 'font-en'}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* ─── NAVBAR ─── */}
      <nav className="bg-white border-b border-[#e1e3e1] sticky top-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between mx-auto shadow-sm">
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
            <button 
              onClick={() => navigate('/dashboard')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${isActive('/dashboard') ? 'bg-[#e8f5e9] text-[#006b20]' : 'text-[#3e4a3c] hover:bg-[#f0f2f0]'}`}
            >
              <span className="material-symbols-outlined text-lg">home</span>
              <span>{t('nav.home')}</span>
            </button>
            <button 
              onClick={() => navigate('/fields')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${isActive('/fields') ? 'bg-[#e8f5e9] text-[#006b20]' : 'text-[#3e4a3c] hover:bg-[#f0f2f0]'}`}
            >
              <span className="material-symbols-outlined text-lg">stadium</span>
              <span>{t('nav.fields')}</span>
            </button>
            <button 
              onClick={() => navigate('/tournaments')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${isActive('/tournaments') ? 'bg-[#e8f5e9] text-[#006b20]' : 'text-[#3e4a3c] hover:bg-[#f0f2f0]'}`}
            >
              <span className="material-symbols-outlined text-lg">trophy</span>
              <span>{t('nav.tournaments')}</span>
            </button>
            <button 
              onClick={() => navigate('/my-bookings')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${isActive('/my-bookings') ? 'bg-[#e8f5e9] text-[#006b20]' : 'text-[#3e4a3c] hover:bg-[#f0f2f0]'}`}
            >
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
            <span>{isAr ? 'EN' : 'AR'}</span>
          </button>

          {/* Notifications Dropdown TRIGGER */}
          <div className="relative" ref={notificationsRef}>
            <button 
                onClick={() => {
                  setShowNotificationsMenu(!showNotificationsMenu);
                  setShowProfileMenu(false);
                }} 
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors relative ${showNotificationsMenu ? 'bg-[#e8f5e9] text-[#006b20]' : 'bg-[#f0f2f0] hover:bg-[#e1e3e1] text-[#3e4a3c]'}`}
            >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Menu Dropdown Overlay */}
            {showNotificationsMenu && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl rounded-2xl`}>
                    <NotificationList />
                </div>
            )}
          </div>

          {/* User Profile Dropdown TRIGGER */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotificationsMenu(false);
              }}
              className="w-10 h-10 rounded-full bg-[#006b20]/10 border border-[#006b20]/20 flex items-center justify-center text-[#006b20] font-bold text-sm cursor-pointer hover:bg-[#006b20]/20 transition-all"
            >
              {userInitial}
            </button>

            {/* Profile Menu Dropdown Overlay */}
            {showProfileMenu && (
              <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#e1e3e1] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                <div className="px-4 py-2 border-b border-[#e1e3e1] mb-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f2f0] flex items-center justify-center text-sm font-bold text-[#3e4a3c] shrink-0">
                    {userInitial}
                  </div>
                  <div className="text-xs font-semibold text-[#191c1c] truncate">
                    {userName}
                  </div>
                </div>

                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/player/profile'); }}
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

                <div className="h-px bg-[#e1e3e1] my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-start text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>{t('menu.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
