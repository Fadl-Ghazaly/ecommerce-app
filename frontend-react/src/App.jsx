import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductGrid from './components/ProductGrid';
import AIAssistantChat from './components/AIAssistantChat';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductDetailModal from './components/ProductDetailModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import LandingPage from './components/LandingPage';

import { productService, authService, cartService } from './services/apiLaravel';
import { aiService } from './services/apiGolang';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';

// Data produk awal (fallback jika API Laravel belum dinyalakan)
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphone Pro ANC Bluetooth 5.3',
    slug: 'wireless-headphone-pro-anc',
    category: 'Elektronik',
    category_id: 1,
    description: 'Headphone nirkabel peredam bising aktif bass mantap tahan 40 jam pemakaian nonstop.',
    price: 499000,
    stock: 25,
    rating: 4.9,
    sold: 142,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  {
    id: 2,
    name: 'Sepatu Running Ultralight Breathable',
    slug: 'sepatu-running-ultralight',
    category: 'Olahraga',
    category_id: 5,
    description: 'Sepatu lari sol empuk elastis nyaman dipakai marathon maupun jogging harian santai.',
    price: 389000,
    stock: 18,
    rating: 4.8,
    sold: 98,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  },
  {
    id: 3,
    name: 'Smartwatch AMOLED Display Heart Rate Monitor',
    slug: 'smartwatch-amoled-display',
    category: 'Elektronik',
    category_id: 1,
    description: 'Jam tangan pintar layar jernih anti air dengan pelacak detak jantung, SpO2, dan GPS.',
    price: 649000,
    stock: 12,
    rating: 4.7,
    sold: 76,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
  },
  {
    id: 4,
    name: 'Tas Ransel Laptop Oxford Water Resistant 15.6"',
    slug: 'tas-ransel-laptop-oxford',
    category: 'Fashion Pria',
    category_id: 2,
    description: 'Tas ransel kantor anti air dengan slot USB charging dan kompartemen laptop busa tebal.',
    price: 279000,
    stock: 30,
    rating: 4.9,
    sold: 210,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  },
  {
    id: 5,
    name: 'Mechanical Keyboard RGB Wireless 75% Layout',
    slug: 'mechanical-keyboard-rgb-wireless',
    category: 'Elektronik',
    category_id: 1,
    description: 'Keyboard mekanik switch tactile empuk dengan lampu RGB backlit dan baterai tahan lama.',
    price: 799000,
    stock: 15,
    rating: 4.9,
    sold: 64,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
  },
  {
    id: 6,
    name: 'Botol Minum Termos Stainless Steel 750ml',
    slug: 'botol-minum-termos-stainless',
    category: 'Perlengkapan Rumah',
    category_id: 4,
    description: 'Tumbler tahan dingin 24 jam dan panas 12 jam dengan material food grade vacuum insulated.',
    price: 135000,
    stock: 50,
    rating: 4.6,
    sold: 320,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
  },
  {
    id: 7,
    name: 'Jaket Hoodie Fleece Premium Unisex',
    slug: 'jaket-hoodie-fleece-premium',
    category: 'Fashion Pria',
    category_id: 2,
    description: 'Hoodie bahan cotton fleece tebal halus nyaman menghangatkan di segala cuaca.',
    price: 219000,
    stock: 22,
    rating: 4.7,
    sold: 115,
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
  },
  {
    id: 8,
    name: 'Mouse Gaming Wireless 16000 DPI Sensor Optik',
    slug: 'mouse-gaming-wireless-16000-dpi',
    category: 'Elektronik',
    category_id: 1,
    description: 'Mouse ringan ergonomis tanpa lag dengan sensor presisi tinggi untuk game kompetitif.',
    price: 320000,
    stock: 19,
    rating: 4.8,
    sold: 85,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
  },
];

// Helper untuk isolasi keranjang & wishlist per akun (atau tamu)
const getCartKey = (user) => (user?.id ? `shophub_cart_user_${user.id}` : 'shophub_cart_guest');
const getWishlistKey = (user) => (user?.id ? `shophub_wishlist_user_${user.id}` : 'shophub_wishlist_guest');

const loadUserCart = (user) => {
  try {
    const key = getCartKey(user);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const loadUserWishlist = (user) => {
  try {
    const key = getWishlistKey(user);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function App() {
  // Routing State: 'landing' (halaman depan awal) atau 'catalog' (halaman belanja utama)
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('shophub_user');
    return saved ? 'catalog' : 'landing';
  });
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Mulai dengan array kosong & loading=true agar skeleton langsung tampil
  // Data INITIAL_PRODUCTS hanya dipakai sebagai fallback jika API gagal
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Autentikasi Pengguna & Role
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('shophub_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && !parsed.role) {
        parsed.role = parsed.email?.toLowerCase().includes('admin') ? 'admin' : 'customer';
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // State Keranjang Belanja (Terisolasi per Akun / Guest)
  const [cart, setCart] = useState(() => loadUserCart(currentUser));

  // State Wishlist (Terisolasi per Akun / Guest)
  const [wishlist, setWishlist] = useState(() => loadUserWishlist(currentUser));
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // State Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  // State AI Assistant
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiHeadline, setAiHeadline] = useState(null);
  const [aiStatus, setAiStatus] = useState('online');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // State Pagination (12 produk per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Simpan keranjang ke localStorage sesuai akun/tamu setiap ada perubahan
  useEffect(() => {
    const key = getCartKey(currentUser);
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, currentUser?.id]);

  // Simpan wishlist ke localStorage sesuai akun/tamu setiap ada perubahan
  useEffect(() => {
    const key = getWishlistKey(currentUser);
    localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, currentUser?.id]);

  // Muat keranjang & wishlist ketika user berganti / login / logout
  useEffect(() => {
    const userCart = loadUserCart(currentUser);
    const userWishlist = loadUserWishlist(currentUser);
    setCart(userCart);
    setWishlist(userWishlist);

    // Jika user login, sinkronisasi dengan keranjang di server Laravel (khusus user ini)
    if (currentUser?.id) {
      cartService.getCart().then((res) => {
        const serverItems = res.data?.items || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        if (serverItems && serverItems.length > 0) {
          const normalized = serverItems.map((item) => ({
            id: item.product_id || item.product?.id || item.id,
            name: item.product?.name || item.name || 'Produk',
            price: item.product?.price || item.price || 0,
            image_url: item.product?.image_url || item.image_url || '',
            category: item.product?.category?.name || item.category || 'Elektronik',
            qty: item.quantity || item.qty || 1,
          }));
          setCart(normalized);
        }
      }).catch(() => {});
    }
  }, [currentUser?.id]);

  // Load produk dari API Laravel
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await productService.getAll({ per_page: 150 });

        // Ekstrak array produk dari berbagai struktur respons Laravel
        const fetchedProducts =
          Array.isArray(res.data?.data)     ? res.data.data     :  // paginate()
          Array.isArray(res.data?.products)  ? res.data.products :  // custom key
          Array.isArray(res.data)            ? res.data          :  // array langsung
          [];

        console.info(
          `[ShopHub] Respons API:`,
          `total=${fetchedProducts.length}`,
          `struktur=${Array.isArray(res.data?.data) ? 'paginate' : Array.isArray(res.data) ? 'array' : 'unknown'}`
        );

        if (fetchedProducts.length > 0) {
          // ✅ API berhasil — gunakan data dari Laravel, JANGAN timpa dengan INITIAL_PRODUCTS
          console.info(`[ShopHub] ✅ Berhasil memuat ${fetchedProducts.length} produk dari database Laravel.`);
          setAllProducts(fetchedProducts);
          setDisplayProducts(fetchedProducts);
        } else {
          // API merespon tapi kosong — fallback ke data lokal
          console.warn('[ShopHub] ⚠️ API merespon tapi produk kosong. Menggunakan katalog lokal sebagai fallback.');
          setAllProducts(INITIAL_PRODUCTS);
          setDisplayProducts(INITIAL_PRODUCTS);
        }
      } catch (err) {
        // API tidak bisa dihubungi — fallback ke data lokal
        console.warn('[ShopHub] ⚠️ Laravel backend offline/CORS error. Menggunakan katalog lokal.', err?.message);
        setAllProducts(INITIAL_PRODUCTS);
        setDisplayProducts(INITIAL_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check status Golang AI Service
    aiService.checkHealth().then((res) => {
      setAiStatus(res && res.status === 'ok' ? 'online' : 'standby');
    });

    // Listener saat sesi 401 Unauthorized terdeteksi oleh Axios Interceptor
    const handleUnauthorizedSession = () => {
      setCurrentUser(null);
      showToast('Sesi Anda telah berakhir. Anda kembali sebagai Guest.');
    };

    window.addEventListener('shophub_unauthorized', handleUnauthorizedSession);

    return () => {
      window.removeEventListener('shophub_unauthorized', handleUnauthorizedSession);
    };
  }, []);

  // Notifikasi Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Helper aman ekstraksi kategori
  const getCatString = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'object') return (cat.name || cat.title || cat.slug || '');
    return String(cat);
  };

  // Handler Auth & Routing
  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleExploreGuest = () => {
    setCurrentView('catalog');
    showToast('Selamat datang! Menjelajahi katalog ShopHub sebagai Tamu.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLanding = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (userData) => {
    const role = userData?.role || (userData?.email?.toLowerCase().includes('admin') ? 'admin' : 'customer');
    const userWithRole = { ...userData, role };

    setCurrentUser(userWithRole);
    localStorage.setItem('shophub_user', JSON.stringify(userWithRole));
    showToast(`Berhasil masuk sebagai ${userWithRole.name} (${role.toUpperCase()})!`);

    // Otomatis alihkan ke tampilan katalog produk
    setCurrentView('catalog');
  };

  const handleLogout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('shophub_token');
    localStorage.removeItem('shophub_user');
    setCurrentUser(null);
    setCart(loadUserCart(null));
    setWishlist(loadUserWishlist(null));
    showToast('Anda telah berhasil keluar dari akun.');
  };

  // Handler Tambah ke Keranjang
  const handleAddToCart = (product) => {
    const pId = product.id || product.product_id;
    setCart((prev) => {
      const existing = prev.find((item) => (item.id || item.product_id) === pId);
      if (existing) {
        return prev.map((item) =>
          (item.id || item.product_id) === pId
            ? { ...item, qty: (item.qty || item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

    // Jika login, sync ke Laravel API
    if (currentUser) {
      cartService.addItem(pId, 1).catch(() => {});
    }

    showToast(`"${product.name}" ditambahkan ke keranjang!`);
  };

  // Update kuantitas item keranjang
  const handleUpdateCartQty = (productId, newQty) => {
    setCart((prev) =>
      prev.map((item) =>
        (item.id || item.product_id) === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  // Hapus item keranjang
  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => (item.id || item.product_id) !== productId));
    showToast('Produk dihapus dari keranjang.');
  };

  // Kosongkan keranjang
  const handleClearCart = () => {
    setCart([]);
    if (currentUser) {
      cartService.clear().catch(() => {});
    }
    showToast('Keranjang belanja telah dikosongkan.');
  };

  // Handler Wishlist
  const handleToggleWishlist = (product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Silakan masuk akun untuk menyimpan ke Wishlist!');
      return;
    }

    const pId = product.id || product.product_id;
    if (wishlist.includes(pId)) {
      setWishlist(wishlist.filter((id) => id !== pId));
      showToast('Dihapus dari wishlist.');
    } else {
      setWishlist([...wishlist, pId]);
      showToast('Disimpan ke wishlist favorit! ❤️');
    }
  };

  // Hapus produk individual dari wishlist
  const handleRemoveWishlist = (productId) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast('Produk dihapus dari wishlist.');
  };

  // Kosongkan seluruh wishlist
  const handleClearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist telah dikosongkan.');
  };

  // Handler Kategori Navbar
  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setIsAiMode(false);
    setAiHeadline(null);
    setCurrentPage(1); // Reset ke halaman pertama

    if (category === 'Semua') {
      setDisplayProducts(allProducts);
    } else {
      const target = category.toLowerCase().trim();
      const filtered = allProducts.filter((p) => {
        const catStr = getCatString(p.category || p.category_name).toLowerCase().trim();
        return catStr === target || catStr.includes(target) || target.includes(catStr);
      });
      setDisplayProducts(filtered);
    }
  };

  // Handler Pencarian Navbar
  const handleSearchNavbar = (query) => {
    setCurrentPage(1); // Reset ke halaman pertama
    if (!query) {
      setDisplayProducts(allProducts);
      setIsAiMode(false);
      return;
    }

    const filtered = allProducts.filter((p) => {
      const pName = typeof p.name === 'string' ? p.name : (p.name?.name || '');
      const pCat = getCatString(p.category || p.category_name);
      const pDesc = typeof p.description === 'string' ? p.description : '';

      return (
        pName.toLowerCase().includes(query.toLowerCase()) ||
        pCat.toLowerCase().includes(query.toLowerCase()) ||
        pDesc.toLowerCase().includes(query.toLowerCase())
      );
    });

    setDisplayProducts(filtered);
    setIsAiMode(false);
    setActiveCategory('Semua');
    setAiHeadline(`Hasil pencarian: "${query}" (${filtered.length} produk)`);
  };

  // Sinkronisasi Hasil AI Chat ke Grid Utama
  const handleApplyAiProducts = (aiProducts, queryText, message) => {
    setIsAiMode(true);
    setAiHeadline(message || `Rekomendasi terbaik untuk: "${queryText}"`);
    setCurrentPage(1); // Reset ke halaman pertama
    
    const enriched = aiProducts.map((p) => {
      const original = allProducts.find((op) => op.id === (p.product_id || p.id));
      return {
        ...p,
        id: p.product_id || p.id,
        image_url: p.image_url || (original ? original.image_url : null),
        rating: original ? original.rating : 4.8,
        sold: original ? original.sold : 50,
      };
    });

    setDisplayProducts(enriched);

    const el = document.getElementById('product-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset filter kembali ke normal
  const handleResetFilter = () => {
    setIsAiMode(false);
    setAiHeadline(null);
    setActiveCategory('Semua');
    setCurrentPage(1); // Reset ke halaman pertama
    setDisplayProducts(allProducts);
  };

  // Handler Pindah Halaman Pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const el = document.getElementById('product-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Admin Handler: Tambah / Edit Produk
  const handleAdminProductSaved = (savedProduct, isNew) => {
    if (isNew) {
      setAllProducts([savedProduct, ...allProducts]);
      setDisplayProducts([savedProduct, ...displayProducts]);
    } else {
      setAllProducts(allProducts.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      setDisplayProducts(displayProducts.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
    }
  };

  // Admin Handler: Hapus Produk
  const handleAdminProductDeleted = (deletedId) => {
    setAllProducts(allProducts.filter((p) => p.id !== deletedId));
    setDisplayProducts(displayProducts.filter((p) => p.id !== deletedId));
  };

  const totalCartCount = cart.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);

  // VIEW 1: LANDING PAGE VIEW (Halaman Depan Futuristik)
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col relative font-sans text-slate-100">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce-subtle border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Landing Page Component */}
        <LandingPage
          onExploreGuest={handleExploreGuest}
          onOpenAuth={handleOpenAuthModal}
          featuredProducts={allProducts.slice(0, 3)}
        />

        {/* Modal Autentikasi (Dapat dibuka dari Landing Page) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // VIEW 2: CATALOG / MAIN E-COMMERCE SPA VIEW
  // Hitung Produk Terpaginasi (12 Produk per Halaman)
  const totalActiveProducts = displayProducts.length;
  const totalPages = Math.ceil(totalActiveProducts / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = displayProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce-subtle border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Navbar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onSearch={handleSearchNavbar}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        aiStatus={aiStatus}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('login')}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
        onNavigateLanding={handleNavigateLanding}
      />

      {/* 2. Hero Banner AI */}
      <main className="flex-1">
        <HeroBanner
          onOpenAiChat={() => setIsAiChatOpen(true)}
          onExploreClick={() => {
            const el = document.getElementById('product-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Seksi Grid Produk dengan Pagination 12 Produk per Halaman */}
        <div id="product-section">
          <ProductGrid
            products={paginatedProducts}
            totalProducts={totalActiveProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
            title={isAiMode ? "Hasil Rekomendasi AI" : (activeCategory === 'Semua' ? "Rekomendasi Untuk Anda" : `Kategori: ${activeCategory}`)}
            subtitle={isAiMode ? "Produk diurutkan berdasarkan skor Cosine Similarity tertinggi" : "Koleksi terkurasi dengan jaminan kualitas dan garansi resmi"}
            isAiResult={isAiMode}
            aiMessage={aiHeadline}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onOpenDetail={(product) => setSelectedProductDetail(product)}
            wishlistIds={wishlist}
            onResetFilter={isAiMode || activeCategory !== 'Semua' ? handleResetFilter : null}
          />
        </div>
      </main>

      {/* 4. Floating Action Button: AI Assistant Trigger */}
      {!isAiChatOpen && (
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center space-x-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          title="Buka ShopHub AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-700 rounded-full" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide">
            Tanya AI
          </span>
          <span className="hidden sm:inline text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
            Online
          </span>
        </button>
      )}

      {/* 5. Floating AI Chat Widget */}
      <AIAssistantChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onAddToCart={handleAddToCart}
        onApplyAiProductsToGrid={handleApplyAiProducts}
      />

      {/* 6. Modal Autentikasi (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 7. Drawer Keranjang Belanja */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onRequireLogin={() => {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
        }}
        onCheckoutSuccess={(order) => {
          showToast('Pesanan Anda berhasil diproses!');
        }}
      />

      {/* 8. Drawer Wishlist Favorit */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        allProducts={allProducts}
        onAddToCart={handleAddToCart}
        onRemoveWishlist={handleRemoveWishlist}
        onOpenProductDetail={(product) => {
          setSelectedProductDetail(product);
          setIsWishlistOpen(false);
        }}
        onClearWishlist={handleClearWishlist}
      />

      {/* 8. Modal Detail Produk & Ulasan Bintang */}
      <ProductDetailModal
        product={selectedProductDetail}
        isOpen={!!selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        currentUser={currentUser}
        onRequireLogin={() => {
          setSelectedProductDetail(null);
          setIsAuthModalOpen(true);
        }}
      />

      {/* 9. Dashboard Modal Admin (CRUD Produk + Transaksi) */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        products={allProducts}
        onProductCreatedOrUpdated={handleAdminProductSaved}
        onProductDeleted={handleAdminProductDeleted}
      />

      {/* 10. Footer ShopHub */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-extrabold text-base mb-3">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>ShopHub AI</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Platform e-commerce pintar generasi baru dengan mesin AI Vector Similarity Golang dan transaksi aman terpercaya.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Teknologi Stack</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Frontend: React.js + Tailwind CSS</li>
              <li>• Backend: Laravel 11 REST API</li>
              <li>• AI Service: Golang + Vector Engine</li>
              <li>• Payment: Midtrans Snap Gateway</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Layanan Pelanggan</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Bantuan & Pusat Resolusi</li>
              <li>• Kebijakan Pengembalian</li>
              <li>• Panduan Belanja & AI Prompts</li>
              <li>• Status Pengiriman Real-Time</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Keamanan & Garansi</h4>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold text-slate-300">100% Produk Original & Bergaransi</span>
            </div>
            <div className="flex items-center space-x-2 text-indigo-400">
              <Truck className="w-4 h-4" />
              <span className="font-semibold text-slate-300">Pengiriman Cepat Seluruh Indonesia</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800 text-center text-[11px] text-slate-500">
          &copy; {new Date().getFullYear()} ShopHub Inc. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}
