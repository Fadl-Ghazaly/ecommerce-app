import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ShoppingCart, 
  ChevronRight, 
  MessageSquare, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { aiService } from '../services/apiGolang';

export default function AIAssistantChat({ 
  isOpen, 
  onClose, 
  onAddToCart, 
  onApplyAiProductsToGrid 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Halo! Saya ShopHub AI Shopping Assistant. 🛍️ Ada yang bisa saya bantu carikan hari ini?',
      products: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('online');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick Suggestion Chips sesuai spesifikasi
  const quickChips = [
    'Rekomendasi headset terbaik',
    'Sepatu running di bawah 500rb',
    'Produk diskon hari ini',
    'Tas laptop untuk kerja',
    'Cara checkout & pembayaran'
  ];

  // Auto-scroll ke bawah saat ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Cek status service Golang
  useEffect(() => {
    aiService.checkHealth().then((res) => {
      if (res && res.status === 'ok') {
        setAiStatus('online');
      } else {
        setAiStatus('standby');
      }
    });
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMessageId = 'msg-' + Date.now();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Tambahkan pesan user ke state chat
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: text,
        timestamp: timeNow,
      }
    ];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    // Kasus khusus untuk pertanyaan prosedural (FAQ)
    if (text.toLowerCase().includes('checkout') || text.toLowerCase().includes('pembayaran')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'ai-' + Date.now(),
            sender: 'ai',
            text: 'Untuk checkout & pembayaran di ShopHub sangat mudah! 💳\n\n1. Masukkan produk incaran Anda ke Keranjang Belanja.\n2. Klik ikon Keranjang di kanan atas lalu tekan "Checkout".\n3. Pilih metode pembayaran via Midtrans Snap (Transfer Bank, QRIS, GoPay, Kartu Kredit).\n4. Selesaikan pembayaran dan resi otomatis diproses!',
            products: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      // Panggil Endpoint Golang AI Service (POST /api/recommend)
      const result = await aiService.getRecommendations(text, 4);

      const aiReply = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: result.ai_message || `Berikut adalah produk yang paling cocok untuk "${text}":`,
        products: result.products || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);

      // Jika ada produk dan callback disediakan, kita sinkronkan juga ke halaman utama
      if (result.products && result.products.length > 0 && onApplyAiProductsToGrid) {
        onApplyAiProductsToGrid(result.products, text, result.ai_message);
      }
    } catch (err) {
      console.warn('Fallback: Menggunakan rekomendasi offline karena server Golang belum merespon');
      
      // Fallback ramah jika backend Go sedang offline/belum dinyalakan
      const mockAiProducts = [
        {
          product_id: 1,
          id: 1,
          name: 'Wireless Headphone Pro ANC Bluetooth 5.3',
          category: 'Elektronik',
          description: 'Headphone nirkabel peredam bising aktif bass mantap tahan 40 jam.',
          price: 499000,
          score: 0.94,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80'
        },
        {
          product_id: 2,
          id: 2,
          name: 'TWS Gaming Earbuds Low Latency',
          category: 'Elektronik',
          description: 'Earbuds gaming bluetooth latency rendah dengan mikrofon jernih.',
          price: 249000,
          score: 0.88,
          image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80'
        }
      ];

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: `Berikut adalah rekomendasi produk berdasarkan pencarian Anda: "${text}".`,
          products: mockAiProducts,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

      if (onApplyAiProductsToGrid) {
        onApplyAiProductsToGrid(mockAiProducts, text, 'Rekomendasi AI Assistant (Demo Mode)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Riwayat percakapan telah direset. Mau mencari produk apa sekarang? 😊',
        products: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[620px] h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slide-up">
      
      {/* Header AI Chat */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                aiStatus === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} 
              title={aiStatus === 'online' ? 'Golang AI Service: Online' : 'Golang AI Service: Standby'}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5 text-white">
              ShopHub AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h3>
            <p className="text-[11px] text-indigo-200/80 font-medium">
              {aiStatus === 'online' ? 'Vector Similarity Engine Siap' : 'Siap Menjawab & Merekomendasi'}
            </p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Bersihkan Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Tutup Widget"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Area Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Avatar Mini */}
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400 font-semibold px-1">
              {msg.sender === 'ai' && (
                <>
                  <Bot className="w-3 h-3 text-indigo-600" />
                  <span>ShopHub AI</span>
                </>
              )}
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble Text */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>

            {/* Rekomendasi Produk Mini Card di dalam Chat Bubble AI */}
            {msg.products && msg.products.length > 0 && (
              <div className="w-full mt-3 space-y-2 max-w-[95%]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                  Produk Rekomendasi ({msg.products.length}):
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {msg.products.map((p, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80'}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                            {p.name}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs font-extrabold text-indigo-600">
                              {formatRupiah(p.price)}
                            </span>
                            {p.score && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                {Math.round(p.score * 100)}% Match
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddToCart && onAddToCart(p)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl transition-colors shrink-0 cursor-pointer"
                        title="Tambahkan ke Keranjang"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-indigo-600 bg-white border border-indigo-100 px-3.5 py-2 rounded-2xl w-fit shadow-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">AI sedang menghitung similarity skor...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips (Spesifikasi Kunci) */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1.5 whitespace-nowrap">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={loading}
              className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Text Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tanyakan produk, spesifikasi, atau budget..."
          disabled={loading}
          className="flex-1 bg-slate-100 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-200"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-2xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

