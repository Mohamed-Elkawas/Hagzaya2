import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('hagzaya_token');
    localStorage.removeItem('hagzaya_role');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Overview' },
    { path: '/admin/owners', icon: 'storefront', label: 'Owners' },
    { path: '/admin/fields', icon: 'stadium', label: 'Fields' },
    { path: '/admin/users', icon: 'group', label: 'Users' },
    { path: '/admin/tournaments', icon: 'emoji_events', label: 'Tournaments & Reports' },
    { path: '/admin/operations', icon: 'receipt_long', label: 'Operations' },
    { path: '/admin/governance', icon: 'policy', label: 'Governance' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-sans" dir="ltr">
      {/* ── Sidebar ───────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-[#006b20] font-black text-xl tracking-tight">
            <span className="material-symbols-outlined text-2xl">sports_soccer</span>
            HAGZAYA
          </div>
          <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">ADMIN</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Command Center</p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  isActive
                    ? 'bg-[#f0fdf4] text-[#006b20]'
                    : 'text-gray-600 hover:bg-gray-50 font-semibold'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link to="/admin/settings" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <Link to="/admin/support" className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined">help</span>
            Support
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
          <h1 className="text-lg font-black text-gray-900">
             {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard Overview'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined">language</span>
            </button>
            <div className="relative">
              <button className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">Admin Super User</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">System Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#006b20] to-green-400 flex items-center justify-center text-white shadow-sm border-2 border-white">
                <span className="material-symbols-outlined text-sm">shield_person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto relative">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
