// في Vite نستخدم import.meta.env بدلاً من process.env
// الرابط الأساسي للسيرفر فقط بدون مسار الـ swagger
const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'https://hagzaya.runasp.net';

export const apiClient = {
  async post<T>(url: string, body: any): Promise<T> {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    const finalUrl = `${BASE_URL}${cleanUrl}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('hagzaya_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw { response: { data } };
    }

    return data as T;
  },

  async get<T>(url: string): Promise<T> {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    const finalUrl = `${BASE_URL}${cleanUrl}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('hagzaya_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('hagzaya_token');
      window.location.href = '/';
    }

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw { response: { data } };
    }

    return data as T;
  },

  async delete(url: string): Promise<void> {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    const finalUrl = `${BASE_URL}${cleanUrl}`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('hagzaya_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(finalUrl, {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('hagzaya_token');
      window.location.href = '/';
    }

    if (!response.ok) {
      const text = await response.text();
      throw { response: { data: text } };
    }
  }
};

export default apiClient;