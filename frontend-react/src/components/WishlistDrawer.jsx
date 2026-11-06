import React, { useState } from 'react';
import {
  X,
  Heart,
  HeartOff,
  ShoppingCart,
  Trash2,
  Eye,
  Star,
  Package,
  Sparkles
} from 'lucide-react';

export default function WishlistDrawer({
  isOpen = false,
  onClose,
  wishlistIds = [],
  allProducts = [],
  onAddToCart,
  onRemoveWishlist,
  onOpenProductDetail,
  onClearWishlist
}) {
  const [addedIds, setAddedIds] = useState([]);

  // Dapatkan detail produk yang ada di wishlist
  const wishlistProducts = allProducts.filter((p) =>
    wishlistIds.includes(p.id || p.product_id)
  );

  const handleAddToCart = (product) => {
    if (onAddToCart) onAddToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((p) => {
      if (onAddToCart) onAddToCart(p);
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Rp -';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCatName = (cat) => {
    if (!cat) return 'Produk';
    if (typeof cat === 'object') return cat.name || cat.title || 'Produk';
    return cat;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-rose-50 to-pink-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">Wishlist Favorit</h2>
              <p className="text-xs text-slate-500">
                {wishlistProducts.length} produk tersimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/70 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {wishlistProducts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center py-20">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <HeartOff className="w-10 h-10 text-rose-300" />
              </div>
              <p className="font-bold text-slate-700 text-base mb-1">Wishlist Masih Kosong</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tekan ikon ❤️ pada produk untuk menyimpannya ke sini.
              </p>
              <button
                onClick={onClose}
                className="mt-6 inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Jelajahi Produk</span>
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {wishlistProducts.map((product) => {
                const pId = product.id || product.product_id;
                const isAdded = addedIds.includes(pId);
                return (
                  <div
                    key={pId}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex gap-3 p-3 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 cursor-pointer"
                      onClick={() => {
                        if (onOpenProductDetail) onOpenProductDetail(product);
                        onClose();
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-0.5 truncate">
                            {getCatName(product.category)}
                          </p>
                          <p
                            className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => {
                              if (onOpenProductDetail) onOpenProductDetail(product);
                              onClose();
                            }}
                          >
                            {product.name}
                          </p>
                        </div>
                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveWishlist && onRemoveWishlist(pId)}
                          className="shrink-0 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus dari Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price + Rating */}
                      <div className="flex items-center gap-3 mt-1 mb-2">
                        <span className="text-sm font-extrabold text-indigo-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.rating && (
                          <span className="flex items-center space-x-0.5 text-[11px] text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{Number(product.rating).toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 flex items-center justify-center space-x-1.5 text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isAdded ? 'Ditambahkan!' : 'Keranjang'}</span>
                        </button>
                        <button
                          onClick={() => {
                            if (onOpenProductDetail) onOpenProductDetail(product);
                            onClose();
                          }}
                          className="flex items-center space-x-1.5 text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {wishlistProducts.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50 space-y-2">
            <button
              onClick={handleAddAllToCart}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah Semua ke Keranjang</span>
            </button>
            <button
              onClick={() => {
                if (onClearWishlist) onClearWishlist();
              }}
              className="w-full flex items-center justify-center space-x-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer border border-rose-200"
            >
              <HeartOff className="w-3.5 h-3.5" />
              <span>Hapus Semua Wishlist</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

