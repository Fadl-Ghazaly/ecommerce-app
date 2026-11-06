import axios from 'axios';

/**
 * Axios instance untuk komunikasi ke Laravel 11 Backend API (Port 8000)
 */
const apiLaravel = axios.create({
  baseURL: import.meta.env.VITE_LARAVEL_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 20000, // Toleransi 20 detik untuk cold start MySQL / Laravel
});

// Flag pencegah log error 401 berulang
let isHandlingUnauthorized = false;

// Interceptor Request: Menyematkan Bearer Token jika tersimpan di localStorage
apiLaravel.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shophub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Menangani status 401 Unauthorized secara mulus
apiLaravel.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('shophub_token');

      // 1. Bersihkan token dan data sesi pengguna dari localStorage
      localStorage.removeItem('shophub_token');
      localStorage.removeItem('shophub_user');

      // 2. Beri peringatan tunggal jika sebelumnya user memiliki token aktif
      if (hadToken && !isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        console.warn('[ShopHub Auth] Sesi login telah berakhir atau token tidak valid. Mengembalikan ke mode Guest.');

        // 3. Emit custom event ke sistem agar UI langsung kembali ke status Guest secara mulus
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shophub_unauthorized'));
        }

        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1500);
      }

      // Hindari bubbling error yang membuat console merah berulang jika hanya pengecekan auth
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (isAuthCheck) {
        return Promise.resolve({ data: { user: null, guest: true } });
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Service Autentikasi (Sanctum / JWT)
 */
export const authService = {
  login: (credentials) => apiLaravel.post('/auth/login', credentials),
  register: (userData) => apiLaravel.post('/auth/register', userData),
  me: () => apiLaravel.get('/auth/me'),
  logout: () => apiLaravel.post('/auth/logout'),
};

/**
 * Service Produk & Kategori
 */
export const productService = {
  getAll: (params = {}) => apiLaravel.get('/products', { params }),
  getBySlug: (idOrSlug) => apiLaravel.get(`/products/${idOrSlug}`),
  getCategories: () => apiLaravel.get('/categories'),
  
  // Ulasan Produk
  getReviews: (productId) => apiLaravel.get(`/products/${productId}/reviews`),
  addReview: (reviewData) => apiLaravel.post('/reviews', reviewData),

  // Admin Management
  create: (data) => apiLaravel.post('/products', data),
  update: (id, data) => apiLaravel.put(`/products/${id}`, data),
  delete: (id) => apiLaravel.delete(`/products/${id}`),
};

/**
 * Service Keranjang Belanja
 */
export const cartService = {
  getCart: () => apiLaravel.get('/cart'),
  addItem: (productId, quantity = 1) => apiLaravel.post('/cart', { product_id: productId, quantity }),
  updateQuantity: (itemId, quantity) => apiLaravel.put(`/cart/${itemId}`, { quantity }),
  removeItem: (itemId) => apiLaravel.delete(`/cart/${itemId}`),
  clear: () => apiLaravel.delete('/cart/clear'),
};

/**
 * Service Pesanan & Midtrans Payment
 */
export const orderService = {
  checkout: (data = {}) => apiLaravel.post('/orders/checkout', data),
  getMyOrders: () => apiLaravel.get('/orders'),
  getOrderById: (id) => apiLaravel.get(`/orders/${id}`),

  // Admin Order Management
  getAdminOrders: () => apiLaravel.get('/admin/orders'),
  updateStatus: (id, paymentStatus) => apiLaravel.patch(`/admin/orders/${id}/status`, { payment_status: paymentStatus }),
};

export default apiLaravel;
