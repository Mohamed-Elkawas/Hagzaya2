// في Vite نستخدم import.meta.env بدلاً من process.env
const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'https://upwind-schnapps-uncoated.ngrok-free.dev';

export const apiClient = {
  async post<T>(url: string, body: any): Promise<T> {
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    const finalUrl = `${BASE_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}ngrok-skip-browser-warning=true`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
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
    const finalUrl = `${BASE_URL}${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}ngrok-skip-browser-warning=true`;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
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
  }
};

export default apiClient;