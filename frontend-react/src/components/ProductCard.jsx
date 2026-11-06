import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Sparkles, Check } from 'lucide-react';

export default function ProductCard({ 
  product = {}, 
  onAddToCart, 
  onToggleWishlist, 
  onOpenDetail,
  isWishlisted = false,
  highlightAi = false 
}) {
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fallback image jika gambar produk tidak ada / gagal load
  const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';

  /**
   * Helper ekstraksi nama kategori secara aman (safe rendering)
   * Mengatasi variasi payload API: objek {id, name, slug}, string "Elektronik", atau null/undefined
   */
  const getCategoryName = (cat) => {
    if (!cat) return 'Umum';
    if (typeof cat === 'object') {
      return cat.name || cat.title || cat.slug || 'Umum';
    }
    if (typeof cat === 'string' && cat.trim() !== '') {
      return cat;
    }
    return 'Umum';
  };

  const categoryLabel = getCategoryName(product.category || product.category_name);

  // Format Rupiah aman
  const formatRupiah = (number) => {
    const numericValue = typeof number === 'number' ? number : Number(number) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  // Hitung persentase kecocokan jika ada score dari vector AI
  const matchPercentage = (typeof product.score === 'number' && !isNaN(product.score))
    ? Math.round(product.score * 100) 
    : null;

  // Nama produk aman
  const productName = typeof product.name === 'string' 
    ? product.name 
    : (product.name?.name || 'Produk ShopHub');

  // Deskripsi produk aman
  const productDescription = typeof product.description === 'string' 
    ? product.description 
    : '';

  // Rating bintang aman
  const productRating = typeof product.rating === 'number'
    ? product.rating.toFixed(1)
    : (4.5 + (((product.id || 1) % 5) * 0.1)).toFixed(1);

  return (
    <div 
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 ${
        highlightAi 
          ? 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-indigo-100' 
          : 'border-slate-200/90 hover:border-indigo-300'
      }`}
    >
      {/* Badge Rekomendasi AI (Jika Berasal dari AI Query) */}
      {matchPercentage !== null && (
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>{matchPercentage}% AI Match</span>
        </div>
      )}

      {/* Wishlist Button Top-Right */}
      <button
        onClick={() => onToggleWishlist && onToggleWishlist(product)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-md backdrop-blur-sm transition-all cursor-pointer"
        title="Simpan ke Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Image Thumbnail Container */}
      <div 
        onClick={() => onOpenDetail && onOpenDetail(product)}
        className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={imgError ? fallbackImage : (product.image_url || fallbackImage)}
          alt={productName}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill (Safe Rendering) */}
          <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
            {categoryLabel}
          </span>

          {/* Product Name */}
          <h3 
            onClick={() => onOpenDetail && onOpenDetail(product)}
            className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug cursor-pointer"
            title={productName}
          >
            {productName}
          </h3>

          {/* Short Description */}
          {productDescription && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {productDescription}
            </p>
          )}

          {/* Rating & Stock */}
          <div className="flex items-center space-x-2 mt-2 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700 ml-1">
                {productRating}
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">
              Terjual {product.sold || ((product.id || 1) * 12 + 45)}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Harga</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Beli</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
