import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  Lock
} from 'lucide-react';
import { orderService } from '../services/apiLaravel';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onUpdateQty, 
  onRemoveItem, 
  onClearCart,
  currentUser = null,
  onRequireLogin,
  onCheckoutSuccess
}) {
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  if (!isOpen) return null;

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (item.price * (item.qty || item.quantity || 1)), 
    0
  );

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  /**
   * Handler Proses Checkout & Integrasi Midtrans Snap Popup
   */
  const handleCheckout = async () => {
    // 1. Jika belum login (Guest), arahkan ke Login Modal
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (cartItems.length === 0) return;

    setLoadingCheckout(true);

    try {
      // 2. Panggil API Checkout Laravel
      const res = await orderService.checkout();
      const snapToken = res.data?.snap_token;
      const orderData = res.data?.order;

      // 3. Jika window.snap dari Midtrans JS SDK tersedia
      if (window.snap && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: function (result) {
            console.log('[Midtrans Payment Success]', result);
            alert(`Pembayaran Berhasil! No. Order: ${result.order_id}`);
            onClearCart && onClearCart();
            onCheckoutSuccess && onCheckoutSuccess(orderData || result);
            onClose();
          },
          onPending: function (result) {
            console.log('[Midtrans Payment Pending]', result);
            alert(`Menunggu Pembayaran. Silakan selesaikan transaksi Anda.`);
            onClearCart && onClearCart();
            onCheckoutSuccess && onCheckoutSuccess(orderData || result);
            onClose();
          },
          onError: function (result) {
            console.error('[Midtrans Payment Error]', result);
            alert('Pembayaran gagal atau dibatalkan.');
          },
          onClose: function () {
            console.log('[Midtrans Snap Closed]');
          }
        });
      } else {
        // Fallback Simulasi jika Snap SDK sedang offline atau sandbox token mode
        console.warn('Midtrans Snap SDK offline atau server key mode simulasi');
        alert(`Pesanan #${orderData?.order_number || 'ORD-DEMO'} berhasil dibuat! Total: ${formatRupiah(totalPrice)}`);
        onClearCart && onClearCart();
        onCheckoutSuccess && onCheckoutSuccess(orderData);
        onClose();
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      // Fallback demo checkout jika Laravel backend belum dinyalakan
      alert(`[Demo Mode] Transaksi checkout berhasil disimulasikan! Total: ${formatRupiah(totalPrice)}`);
      onClearCart && onClearCart();
      onClose();
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-up relative">
        
        {/* Header Drawer */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Keranjang Belanja</h3>
              <p className="text-xs text-slate-500 font-medium">
                {totalQuantity} produk terpilih
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Keranjang Anda Masih Kosong</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Temukan berbagai produk favorit atau gunakan AI Assistant untuk rekomendasi instan!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <>
              {/* Opsi Kosongkan Keranjang */}
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Pesanan
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
                >
                  Kosongkan Semua
                </button>
              </div>

              {cartItems.map((item) => {
                const qty = item.qty || item.quantity || 1;
                const pId = item.id || item.product_id;

                return (
                  <div
                    key={pId}
                    className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-3 hover:border-indigo-200 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-xs font-extrabold text-indigo-600 mt-0.5">
                        {formatRupiah(item.price)}
                      </p>

                      {/* Qty Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => onUpdateQty && onUpdateQty(pId, Math.max(1, qty - 1))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-6 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty && onUpdateQty(pId, qty + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Delete Item */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => onRemoveItem && onRemoveItem(pId)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-800">
                        {formatRupiah(item.price * qty)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Item</span>
                <span className="font-semibold text-slate-800">{totalQuantity} barang</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-emerald-600">Gratis (Promo AI)</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="text-indigo-600 text-base">{formatRupiah(totalPrice)}</span>
              </div>
            </div>

            {/* Tombol Checkout Midtrans */}
            {currentUser ? (
              <button
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat Token Midtrans...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar Sekarang (Midtrans Snap)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onRequireLogin}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Masuk Akun untuk Melanjutkan Checkout</span>
              </button>
            )}

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Transaksi dienkripsi aman melalui Midtrans Payment Gateway</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

