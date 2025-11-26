const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('scentid_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('scentid_token', token);
    } else {
      localStorage.removeItem('scentid_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('scentid_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'An error occurred');
    }

    return data;
  }

  async signup(email, password, name) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  async scan(vocVector, deviceId = null, temperature = null, humidity = null) {
    return this.request('/scans/', {
      method: 'POST',
      body: JSON.stringify({
        voc_vector: vocVector,
        device_id: deviceId,
        temperature,
        humidity,
      }),
    });
  }

  async getScanHistory(limit = 50, offset = 0) {
    return this.request(`/scans/history?limit=${limit}&offset=${offset}`);
  }

  async getScan(scanId) {
    return this.request(`/scans/${scanId}`);
  }

  async deleteScan(scanId) {
    return this.request(`/scans/${scanId}`, { method: 'DELETE' });
  }

  async getFragrances(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/fragrances/?${query}`);
  }

  async getFragrance(fragranceId) {
    return this.request(`/fragrances/${fragranceId}`);
  }

  async getSimilarFragrances(fragranceId, limit = 5) {
    return this.request(`/fragrances/${fragranceId}/similar?limit=${limit}`);
  }

  async getPopularFragrances(limit = 10) {
    return this.request(`/fragrances/popular?limit=${limit}`);
  }

  async getBrands() {
    return this.request('/fragrances/brands');
  }

  async getFavorites() {
    return this.request('/favorites/');
  }

  async addFavorite(fragranceId) {
    return this.request(`/favorites/${fragranceId}`, { method: 'POST' });
  }

  async removeFavorite(fragranceId) {
    return this.request(`/favorites/${fragranceId}`, { method: 'DELETE' });
  }

  async submitFeedback(scanId, fragranceId, isCorrect, correctFragranceName = null, notes = null) {
    return this.request('/feedback/', {
      method: 'POST',
      body: JSON.stringify({
        scan_id: scanId,
        fragrance_id: fragranceId,
        is_correct: isCorrect,
        correct_fragrance_name: correctFragranceName,
        notes,
      }),
    });
  }

  async simulateSensorData() {
    return this.request('/sensor/simulate');
  }
}

export const api = new ApiClient();
export default api;
