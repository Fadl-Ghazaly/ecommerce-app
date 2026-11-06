import axios from 'axios';

/**
 * Axios instance untuk komunikasi ke Golang AI & Vector Search Service (Port 8080)
 */
const apiGolang = axios.create({
  baseURL: import.meta.env.VITE_GOLANG_AI_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/**
 * Kumpulan fungsi AI & Vector Service
 */
export const aiService = {
  /**
   * Mengirim query pencarian / rekomendasi user ke AI Golang Engine
   * @param {string} query - Kalimat permintaan user (contoh: "headset gaming bass mantap")
   * @param {number} limit - Jumlah produk rekomendasi (default 4)
   * @returns {Promise<Object>} Respon dari AI mencakup ai_message dan daftar produk dengan cosine similarity score
   */
  getRecommendations: async (query, limit = 4) => {
    try {
      const response = await apiGolang.post('/recommend', { query, limit });
      return response.data;
    } catch (error) {
      console.error('[AI Golang Service] Gagal mendapatkan rekomendasi:', error);
      throw error;
    }
  },

  /**
   * Mengambil produk populer atau top-rated dari AI Service
   */
  getPopularRecommendations: async (limit = 4) => {
    try {
      const response = await apiGolang.get('/recommend/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      console.warn('[AI Golang Service] Gagal mengambil rekomendasi populer:', error);
      return null;
    }
  },

  /**
   * Ping status service AI Golang
   */
  checkHealth: async () => {
    try {
      const rawBase = (import.meta.env.VITE_GOLANG_AI_URL || 'http://localhost:8080').replace(/\/api$/, '');
      const response = await axios.get(`${rawBase}/health`, { timeout: 3000 });
      return response.data;
    } catch {
      return { status: 'offline' };
    }
  }
};

export default apiGolang;

