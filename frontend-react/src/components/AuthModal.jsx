import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/apiLaravel';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'customer', // Selalu 'customer' untuk registrasi
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync mode tab ketika modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPassword(false);
      // Pastikan role selalu customer saat register
      setFormData((prev) => ({ ...prev, role: 'customer' }));
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        // Register API call (Hanya role customer)
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation || formData.password,
          role: 'customer', // Dipaksakan hanya customer
        };
        const res = await authService.register(payload);
        const userData = res.data?.user;
        const authToken = res.data?.access_token || res.data?.token;

        const completeUser = {
          ...userData,
          role: 'customer', // Mutlak customer
        };

        if (authToken) {
          localStorage.setItem('shophub_token', authToken);
          localStorage.setItem('shophub_user', JSON.stringify(completeUser));
        }

        setSuccessMsg('Registrasi berhasil! Selamat datang di ShopHub.');
        setTimeout(() => {
          onLoginSuccess && onLoginSuccess(completeUser);
          onClose();
        }, 800);
      } else {
        // Login API call
        const res = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        const userData = res.data?.user;
        const authToken = res.data?.access_token || res.data?.token;

        // Validasi role admin/customer
        const completeUser = {
          ...userData,
          role: userData?.role || (formData.email.toLowerCase().includes('admin') ? 'admin' : 'customer'),
        };

        if (authToken) {
          localStorage.setItem('shophub_token', authToken);
          localStorage.setItem('shophub_user', JSON.stringify(completeUser));
        }

        setSuccessMsg(`Selamat datang kembali, ${completeUser.name}!`);
        setTimeout(() => {
          onLoginSuccess && onLoginSuccess(completeUser);
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error('[Auth Error]', err);

      // Fallback demo login jika Laravel backend offline
      if (!err.response) {
        const isEmailAdmin = !isRegister && formData.email.toLowerCase().includes('admin');
        const demoUser = {
          id: isEmailAdmin ? 1 : 99,
          name: formData.name || (isEmailAdmin ? 'Admin ShopHub' : 'Customer ShopHub'),
          email: formData.email,
          role: isEmailAdmin ? 'admin' : 'customer',
        };
        const demoToken = 'shophub-demo-token-' + Date.now();

        localStorage.setItem('shophub_token', demoToken);
        localStorage.setItem('shophub_user', JSON.stringify(demoUser));

        setSuccessMsg(`Mode Demo Aktif: Masuk sebagai ${demoUser.role.toUpperCase()}`);
        setTimeout(() => {
          onLoginSuccess && onLoginSuccess(demoUser);
          onClose();
        }, 800);
        return;
      }

      const resError = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0];
      setErrorMsg(resError || 'Terjadi kesalahan saat memproses autentikasi. Silakan periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Helper (Khusus Login)
  const setDemoAccount = (role) => {
    setIsRegister(false); // Otomatis pindah ke tab Login
    setErrorMsg(null);
    setSuccessMsg(null);

    if (role === 'admin') {
      setFormData({
        name: 'Admin ShopHub',
        email: 'admin@shophub.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'admin',
      });
    } else {
      setFormData({
        name: 'Budi Santoso',
        email: 'customer@shophub.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'customer',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Container dengan text-slate-900 tegas agar tidak terpengaruh tema dark background */}
      <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up relative">
        
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {isRegister ? 'Buat Akun Baru' : 'Masuk ke ShopHub'}
          </h3>
          <p className="text-xs text-indigo-200/80 mt-1">
            {isRegister 
              ? 'Daftar sebagai Customer untuk menikmati belanja dengan rekomendasi AI' 
              : 'Akses keranjang, status pesanan Midtrans, & ulasan produk'}
          </p>
        </div>

        {/* Tab Toggle Login / Register */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isRegister
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 flex items-start space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nama Lengkap (Hanya saat Register) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Input Password dengan Tombol Show/Hide */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {!isRegister && (
                  <span className="text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    Lupa password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keterangan Role Otomatis untuk Register (Tanpa Pilihan Admin) */}
            {isRegister && (
              <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center space-x-2 text-indigo-800">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Akun didaftarkan sebagai <strong>Customer ShopHub</strong> (Belanja, Cart & Midtrans).
                </span>
              </div>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isRegister ? 'Daftar Sekarang' : 'Masuk ke Akun'}</span>
            </button>
          </form>

          {/* Quick Demo Login Chips (Hanya untuk Login Testing) */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Akun Cepat untuk Masuk (Login Testing)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('customer')}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer text-center"
              >
                Isi Customer Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('admin')}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer text-center"
              >
                Isi Admin Demo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
