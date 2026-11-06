import React from 'react';
import ProductCard from './ProductCard';
import { 
  Sparkles, 
  PackageOpen, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export default function ProductGrid({ 
  products = [], 
  loading = false, 
  title = "Rekomendasi Untuk Anda", 
  subtitle = "Produk pilihan terbaik disesuaikan dengan preferensi Anda",
  isAiResult = false,
  aiMessage = null,
  onAddToCart,
  onToggleWishlist,
  onOpenDetail,
  wishlistIds = [],
  onResetFilter,
  // Props Pagination
  currentPage = 1,
  totalPages = 1,
  totalProducts = 0,
  itemsPerPage = 12,
  onPageChange
}) {
  // Hitung rentang index yang sedang ditampilkan
  const currentTotal = totalProducts > 0 ? totalProducts : products.length;
  const startItem = currentTotal > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, currentTotal);

  // Helper untuk membuat daftar nomor halaman cerdas
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Seksi Grid */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {isAiResult && (
              <span className="flex items-center space-x-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Ranked</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
            {!loading && currentTotal > 0 && (
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center space-x-1">
                <span>{currentTotal} Produk</span>
                {totalPages > 1 && (
                  <span className="text-indigo-400 font-normal">
                    &bull; Hal {currentPage}/{totalPages}
                  </span>
                )}
              </span>
            )}
          </div>
          
          {/* Pesan Khusus dari AI Engine jika ada */}
          {aiMessage && (
            <div className="mt-3 inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 text-indigo-900 px-3.5 py-2 rounded-xl text-xs font-medium animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}
        </div>

        {/* Action / Reset Button jika sedang mode filter/AI */}
        {isAiResult && onResetFilter && (
          <button
            onClick={onResetFilter}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tampilkan Semua Produk</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
              <div className="aspect-square bg-slate-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-200 rounded w-full" />
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div className="h-6 bg-slate-200 rounded w-1/2" />
                <div className="h-8 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto my-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tidak ada produk ditemukan</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Coba kata kunci lain atau tanyakan kepada Asisten AI kami untuk menemukan barang sejenis.
          </p>
          {onResetFilter && (
            <button
              onClick={onResetFilter}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      )}

      {/* Actual Product Grid (4 Kolom x 3 Baris = 12 Produk per Halaman) */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard
              key={item.id || item.product_id}
              product={item}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onOpenDetail={onOpenDetail}
              isWishlisted={wishlistIds.includes(item.id || item.product_id)}
              highlightAi={isAiResult}
            />
          ))}
        </div>
      )}

      {/* Navigasi Pagination Elegan */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Informasi Pagination */}
          <div className="text-xs sm:text-sm text-slate-500 font-medium order-2 sm:order-1">
            Menampilkan <span className="font-bold text-slate-800">{startItem}</span> - <span className="font-bold text-slate-800">{endItem}</span> dari <span className="font-bold text-indigo-600">{currentTotal}</span> produk (12 per halaman)
          </div>

          {/* Tombol Kontrol Halaman */}
          <div className="inline-flex items-center space-x-1 sm:space-x-1.5 order-1 sm:order-2">
            
            {/* Tombol Halaman Pertama (<<) */}
            {currentPage > 2 && (
              <button
                onClick={() => handlePageClick(1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )}

            {/* Tombol Sebelumnya (<) */}
            <button
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                currentPage === 1
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Nomor-nomor Halaman */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((num, idx) => {
                if (num === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                      ...
                    </span>
                  );
                }

                const isActive = num === currentPage;
                return (
                  <button
                    key={num}
                    onClick={() => handlePageClick(num)}
                    className={`min-w-[36px] h-9 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 border border-indigo-600 scale-105'
                        : 'border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Tombol Selanjutnya (>) */}
            <button
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                currentPage === totalPages
                  ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer shadow-2xs'
              }`}
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Tombol Halaman Terakhir (>>) */}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => handlePageClick(totalPages)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      )}
    </section>
  );
}
