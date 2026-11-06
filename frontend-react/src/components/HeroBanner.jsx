import React from 'react';
import { Sparkles, ArrowRight, Bot, Zap, ShieldCheck, Cpu } from 'lucide-react';

export default function HeroBanner({ onOpenAiChat, onExploreClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl border border-indigo-900/40">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Heading & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          {/* Badge Fitur AI */}
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span className="text-xs font-semibold text-indigo-200 tracking-wide uppercase">
              Powered by Golang Vector Search & Cosine Similarity
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Belanja Lebih Cerdas dengan <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-200">
              Rekomendasi AI Real-Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Temukan barang yang tepat tanpa ribet mencari manual. Asisten AI ShopHub memahami kebutuhan spesifik Anda mulai dari spesifikasi produk, rentang harga, hingga preferensi gaya belanja.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <button
              onClick={onOpenAiChat}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span>Tanya AI Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-3.5 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer"
            >
              <span>Jelajahi Katalog</span>
            </button>
          </div>

          {/* Feature Micro-Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-indigo-900/60 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pencarian Cepat</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Embedding Vektor</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Midtrans Secure</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Live Interaction Card Showcase */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-sm lg:max-w-none bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 shadow-2xl">
            
            {/* Header Mini Widget Preview */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ShopHub AI Prompt Live</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online & Siap Merekomendasikan
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                v1.0 Go-Engine
              </span>
            </div>

            {/* Simulated Chat Bubble User */}
            <div className="mt-4 space-y-3">
              <div className="bg-indigo-600/30 border border-indigo-500/30 rounded-2xl p-3 text-xs text-indigo-100 ml-6">
                <p className="font-medium">"Rekomendasi headset bluetooth terbaik dengan bass mantap untuk kerja & santai!"</p>
              </div>

              {/* Simulated AI Response */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 mr-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assistant:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Berikut rekomendasi teratas dengan tingkat kemiripan <strong className="text-emerald-400">92% Cosine Match</strong>:
                </p>

                {/* Mini Result Pill */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80"
                    alt="Wireless Headphone"
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-xs truncate">Wireless Headphone Pro ANC</p>
                    <p className="text-indigo-400 font-extrabold text-xs">Rp 499.000</p>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold px-2 py-1 rounded-md">
                    Top Match
                  </span>
                </div>
              </div>
            </div>

            {/* Quick interactive hint */}
            <button
              onClick={onOpenAiChat}
              className="mt-4 w-full py-2 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-800/80 rounded-xl text-center text-xs font-semibold text-indigo-300 hover:text-white transition-all cursor-pointer"
            >
              Klik untuk coba query Anda sendiri &rarr;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

