import React from 'react';
import { useLoginForm } from '../hooks/useLoginForm';
import { Link } from 'react-router-dom';

export function LoginForm() {
  const {
    formState,
    errors,
    isLoading,
    serverError,
    setField,
    setRole,
    setLoginMethod,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm();

  // اللغة مؤقتاً للتوضيح
  const lang = 'ar';
  const isRtl = lang === 'ar';

  return (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-8 w-full max-w-md mx-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
          تسجيل الدخول
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          أهلاً بك مجدداً في نظام حجزاية
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ترويسة اختيار نوع الحساب - 3 أزرار متناسقة */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('player')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              formState.role === 'player'
                ? 'border-[#006b20] bg-[#e8f5e9] text-[#006b20] font-bold'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1 text-inherit">sports_soccer</span>
            <span className="text-[10px] font-bold">لاعب</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('owner')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              formState.role === 'owner'
                ? 'border-[#006b20] bg-[#e8f5e9] text-[#006b20] font-bold'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1 text-inherit">stadium</span>
            <span className="text-[10px] font-bold">مالك ملعب</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
              formState.role.toLowerCase() === 'admin'
                ? 'border-[#006b20] bg-[#e8f5e9] text-[#006b20] font-bold'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl mb-1 text-inherit">admin_panel_settings</span>
            <span className="text-[10px] font-bold">مسؤول</span>
          </button>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold border border-red-100 text-center">
            {serverError}
          </div>
        )}

        {/* طريقة تسجيل الدخول */}
        {formState.role.toLowerCase() !== 'admin' && (
          <div className="flex bg-gray-50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                formState.loginMethod === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              رقم الجوال
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                formState.loginMethod === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              البريد الإلكتروني
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {formState.loginMethod === 'phone' ? 'رقم الجوال' : 'البريد الإلكتروني'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="material-symbols-outlined text-gray-400">
                  {formState.loginMethod === 'phone' ? 'phone_iphone' : 'mail'}
                </span>
              </span>
              <input
                type={formState.loginMethod === 'phone' ? 'tel' : 'email'}
                value={formState.identifier}
                onChange={(e) => setField('identifier', e.target.value)}
                className={`w-full bg-gray-50 border ${
                  errors.identifier ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#006b20]'
                } text-gray-900 text-sm rounded-xl focus:ring-[#006b20] focus:outline-none block w-full pl-3 pr-10 py-3 font-semibold transition-colors`}
                placeholder={formState.loginMethod === 'phone' ? '01xxxxxxxxx' : 'example@email.com'}
                dir="ltr"
              />
            </div>
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.identifier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="material-symbols-outlined text-gray-400">lock</span>
              </span>
              <input
                type={formState.showPassword ? 'text' : 'password'}
                value={formState.password}
                onChange={(e) => setField('password', e.target.value)}
                className={`w-full bg-gray-50 border ${
                  errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#006b20]'
                } text-gray-900 text-sm rounded-xl focus:ring-[#006b20] focus:outline-none block w-full pl-10 pr-10 py-3 font-semibold transition-colors`}
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-sm">
                  {formState.showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-[#006b20] hover:text-[#004d17] transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-[#006b20] hover:bg-[#004d17] focus:ring-4 focus:outline-none focus:ring-green-300 font-black rounded-xl text-sm px-5 py-3.5 text-center transition-colors disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-green-900/20"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              جاري الدخول...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </button>

        <p className="text-sm font-semibold text-gray-500 text-center mt-6">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="font-bold text-[#006b20] hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </form>
    </div>
  );
}