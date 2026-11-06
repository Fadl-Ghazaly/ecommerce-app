import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Bot,
  LogOut,
  Shield,
  LogIn,
  ArrowLeft
} from 'lucide-react';

export default function Navbar({ 
  cartCount = 0, 
  wishlistCount = 0, 
  onSearch, 
  onOpenAiChat, 
  aiStatus = 'online',
  activeCategory = 'Semua',
  onSelectCategory,
  currentUser = null,
  onOpenAuthModal,
  onLogout,
  onOpenCart,
  onOpenWishlist,
  onOpenAdminDashboard,
  onNavigateLanding
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      {/* Top Banner Promo Kecil */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-indigo-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/30 text-indigo-200 font-semibold px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase border border-indigo-400/20">
              NEW
            </span>
            <span>ShopHub AI Assistant 2.0 kini aktif dengan pencarian semantik & rekomendasi instan!</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-slate-300">
            <button 
              onClick={onOpenAiChat}
              className="flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="font-medium text-amber-200">Coba Tanya AI</span>
            </button>
            <span>|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Bantuan & FAQ</span>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateLanding) onNavigateLanding();
              }} 
              className="flex items-center space-x-2.5 group text-left cursor-pointer"
              title="Klik untuk kembali ke Landing Page"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                  ShopHub
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md border border-indigo-200">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Smart E-Commerce
                </span>
              </div>
            </button>

            {/* Tombol Cepat Kembali ke Landing Page */}
            {onNavigateLanding && (
              <button
                onClick={onNavigateLanding}
                className="hidden xl:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer ml-1"
                title="Kembali ke Landing Page Utama"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Landing Page</span>
              </button>
            )}
          </div>

          {/* Search Input Bar (Desktop) */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk impianmu, kategori, atau tanyakan pada AI..."
                className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 text-sm pl-11 pr-24 py-2.5 rounded-full border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm hover:shadow transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Action Icons & Profiles */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Tombol AI Trigger Mini */}
            <button
              onClick={onOpenAiChat}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
              title="Buka AI Shopping Assistant"
            >
              <Bot className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">AI Assistant</span>
              <span className={`w-2 h-2 rounded-full ${aiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Quick Access Admin Panel Button (Khusus Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminDashboard}
                className="hidden sm:flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Buka Dashboard Admin"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button 
              onClick={onOpenWishlist}
              className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                wishlistCount > 0 
                  ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
              title="Wishlist Favorit"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in shadow-sm shadow-indigo-500/50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block" />

            {/* User Profile / Auth Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase">
                      {currentUser.role || 'Customer'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu User */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          onOpenAdminDashboard();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Dibawah Navbar) */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk atau tanya AI..."
              className="w-full bg-slate-100 text-slate-800 text-sm pl-10 pr-20 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Navigasi Kategori Bar */}
      <nav className="bg-slate-50 border-t border-slate-200/70 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-10 text-xs font-semibold text-slate-600">
            {['Semua', 'Elektronik', 'Fashion Pria', 'Fashion Wanita', 'Perlengkapan Rumah', 'Gadget & Aksesoris', 'Olahraga'].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`transition-colors py-1 cursor-pointer border-b-2 ${
                  activeCategory === cat
                    ? 'text-indigo-600 border-indigo-600 font-bold'
                    : 'border-transparent hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-slide-up">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Kategori</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {['Semua', 'Elektronik', 'Fashion Pria', 'Fashion Wanita', 'Perlengkapan Rumah', 'Olahraga'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory && onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  activeCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            {currentUser && (
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl mb-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold uppercase">{currentUser.role || 'Customer'}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            )}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdminDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}
            {onNavigateLanding && (
              <button
                onClick={() => {
                  onNavigateLanding();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Landing Page</span>
              </button>
            )}
            <button
              onClick={() => {
                if (onOpenWishlist) onOpenWishlist();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>Wishlist Favorit Saya</span>
              </div>
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            </button>
            <button
              onClick={() => {
                onOpenAiChat();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow-md"
            >
              <Bot className="w-4 h-4" />
              <span>Buka Asisten Rekomendasi AI</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
