import React from 'react';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  CreditCard, 
  Cpu, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Compass, 
  ShoppingBag, 
  Zap, 
  Star, 
  CheckCircle2, 
  TrendingUp,
  Search,
  MessageSquare,
  Shield,
  Layers
} from 'lucide-react';

export default function LandingPage({ 
  onExploreGuest, 
  onOpenAuth,
  featuredProducts = []
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background Glow & Mesh Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40 blur-3xl -z-0">
        <div className="absolute top-[-100px] left-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
        <div className="absolute top-[-50px] right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-[200px] left-1/3 w-80 h-80 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-50"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 1. Header Landing Page */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo ShopHub */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ShopHub
                <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  AI 2.0
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                Smart Commerce
              </span>
            </div>
          </div>

          {/* Quick Actions (Masuk & Daftar) */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge Pengumuman */}
          <div className="inline-flex items-center space-x-2 bg-indigo-950/80 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span className="text-xs font-semibold text-indigo-200">
              Next-Gen E-Commerce Berbasis Vector AI & Semantik Golang
            </span>
          </div>

          {/* Headline Utama */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Belanja Lebih Cerdas dengan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Kecerdasan Buatan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Temukan barang yang benar-benar Anda butuhkan dalam hitungan detik. Didukung oleh 
            <strong className="text-indigo-300 font-semibold"> Golang Vector Recommendation Engine</strong>, 
            asisten belanja pintar 24/7, dan transaksi instan dengan garansi resmi.
          </p>

          {/* Tiga Tombol Utama CTA (Call-to-Action) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            {/* CTA 1: Masuk */}
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Akun</span>
            </button>

            {/* CTA 2: Daftar */}
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-purple-400/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </button>

            {/* CTA 3: Jelajahi Sebagai Tamu */}
            <button
              onClick={onExploreGuest}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm px-7 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-500 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform" />
              <span>Jelajahi Sebagai Tamu</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Metrics / Social Proof */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-left sm:text-center">
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <div className="text-2xl font-extrabold text-white">120+</div>
              <div className="text-xs text-slate-400 font-medium">Produk Terkurasi</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <div className="text-2xl font-extrabold text-indigo-400">6 Kategori</div>
              <div className="text-xs text-slate-400 font-medium">Lengkap & Variatif</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <div className="text-2xl font-extrabold text-purple-400">&lt; 50ms</div>
              <div className="text-xs text-slate-400 font-medium">Vector AI Match</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
              <div className="text-2xl font-extrabold text-emerald-400">100% Aman</div>
              <div className="text-xs text-slate-400 font-medium">Midtrans Payment</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Seksi Preview Interaktif: AI Chat Demo & Mini Catalog Showcase */}
      <section className="relative z-10 py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kombinasi AI Cerdas & Belanja Nyaman
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Lihat bagaimana asisten AI kami membantu Anda menemukan produk tepat tanpa harus scroll berjam-jam.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Kolom Kiri: AI Chat Assistant Interactive Mockup */}
            <div className="lg:col-span-6 bg-slate-950/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      ShopHub AI Assistant
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h4>
                    <p className="text-[11px] text-slate-400">Online & Siap Memberi Rekomendasi</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-800/50">
                  Vector Engine
                </span>
              </div>

              {/* Chat Simulation Content */}
              <div className="py-5 space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-xs shadow-md">
                    "Saya cari headphone bluetooth under 500rb yang ada peredam bising aktif dan baterai tahan lama."
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none p-3.5 max-w-[90%] text-xs shadow-md space-y-2.5">
                    <p>
                      Berdasarkan kemiripan semantik, ini rekomendasi terbaik yang cocok dengan kriteria Anda:
                    </p>
                    
                    {/* Mini Recommended Item Inside Chat */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" 
                          alt="Headphone" 
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-white text-[11px] truncate max-w-[150px]">
                            Wireless Headphone Pro ANC
                          </div>
                          <div className="text-indigo-400 font-extrabold text-xs">
                            Rp 499.000
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800/40">
                        Skor: 98% Cocok
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Dummy */}
              <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500">
                  Ketik apa saja yang ingin Anda cari...
                </div>
                <button 
                  onClick={onExploreGuest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Coba Sekarang
                </button>
              </div>
            </div>

            {/* Kolom Kanan: Mini Catalog Showcase Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Preview Produk</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Koleksi Terpopuler</h3>
                </div>
                <button
                  onClick={onExploreGuest}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  Lihat Semua (120) <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Contoh Produk Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Wireless Headphone Pro ANC',
                    category: 'Elektronik',
                    price: 'Rp 499.000',
                    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
                    rating: '4.9'
                  },
                  {
                    name: 'Sepatu Running Ultralight',
                    category: 'Olahraga',
                    price: 'Rp 389.000',
                    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
                    rating: '4.8'
                  },
                  {
                    name: 'Smartwatch AMOLED Display',
                    category: 'Gadget & Aksesoris',
                    price: 'Rp 649.000',
                    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
                    rating: '4.7'
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3 hover:border-indigo-500/50 hover:shadow-lg transition-all group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2 relative">
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-white truncate">{item.name}</h5>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-extrabold text-indigo-400">{item.price}</span>
                      <span className="text-[10px] flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {item.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Quick Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ingin belanja langsung tanpa mendaftar?</div>
                    <div className="text-[11px] text-slate-400">Gunakan mode Tamu dan nikmati seluruh fiturnya.</div>
                  </div>
                </div>
                <button
                  onClick={onExploreGuest}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Masuk Tamu
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Seksi 3 Fitur Unggulan Utama */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Arsitektur Modern
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Dibuat untuk Pengalaman Belanja Terbaik
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Integrasi teknologi modern menjamin kecepatan pencarian, akurasi rekomendasi, dan keamanan pembayaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1: Golang Vector Engine */}
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Golang Vector Similarity
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Mesin mikroservis Golang menghitung Cosine Similarity secara instan pada embedding teks produk, memberikan rekomendasi super cepat dan sangat akurat.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pencarian berbasis makna semantik</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Latency rendah &lt; 50ms</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Interactive AI Assistant */}
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-lg">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Asisten AI Belanja 24/7
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tanyakan apa pun seperti berbicara dengan konsultan profesional. Dapatkan rekomendasi berdasarkan budget, kebutuhan spesifik, dan preferensi gaya Anda.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Konsultasi interaktif real-time</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tombol quick prompt belanja</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Midtrans Payment */}
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 hover:border-pink-500/40 hover:bg-slate-900/90 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-lg">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Transaksi Aman Midtrans
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Checkout dengan seamless popup Midtrans Snap. Mendukung QRIS, GoPay, ShopeePay, Virtual Account Bank (BCA, Mandiri, BNI, BRI), dan kartu kredit.
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verifikasi pembayaran otomatis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Auto-update status stok & pesanan</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA Banner Bawah */}
      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-slate-900/90 rounded-3xl p-8 sm:p-12 border border-indigo-500/30 text-center shadow-2xl relative overflow-hidden">
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Siap Menikmati Pengalaman Belanja Masa Depan?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
                Bergabunglah bersama ribuan pengguna yang telah menemukan produk impian mereka dengan bantuan AI.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-indigo-900 font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Buat Akun Gratis
                </button>
                <button
                  onClick={onExploreGuest}
                  className="w-full sm:w-auto bg-indigo-600/40 hover:bg-indigo-600/60 text-white font-bold text-sm px-8 py-3.5 rounded-2xl border border-indigo-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Mulai Eksplorasi Tamu</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer Landing Page */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">ShopHub AI E-Commerce</span>
            <span>&bull;</span>
            <span>Next-Gen Smart Shopping</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} ShopHub Inc. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </footer>

    </div>
  );
}

