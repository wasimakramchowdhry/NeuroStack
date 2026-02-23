// API Service connecting to FastAPI Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Custom fetch wrapper to handle JSON and throw errors consistently
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Get token from authStore (we have to import carefully to avoid circular deps if they exist, but normally it's fine)
  // Or we expect the token to be passed if needed, but our authStore persists to localStorage 'auth-storage'
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.accessToken) {
        headers.set('Authorization', `Bearer ${state.accessToken}`);
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const data = await response.json();
      errorDetail = data.detail || errorDetail;
    } catch {
      // Not JSON
    }
    throw new Error(errorDetail);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  preferred_language: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  full_name?: string;
  preferred_language?: string;
}

// Auth API
export const authAPI = {
  async register(data: RegisterData) {
    const user = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { user };
  },

  async login(data: LoginData) {
    const formData = new URLSearchParams();
    formData.append('username', data.email); // OAuth2 requires username field
    formData.append('password', data.password);

    const res = await fetchApi('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Do not stringify formData, it handles it automatically
      body: formData,
      // Include credentials to handle HttpOnly refresh cookie
      credentials: 'include',
    });

    // In our backend, login returns { access_token, token_type }
    // We then need to fetch the user profile
    const token = res.access_token;

    // Fetch profile using the new token
    const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user profile after login');
    }

    const user = await userResponse.json();

    return {
      access_token: token,
      token_type: res.token_type,
      user: user,
    };
  },

  async refresh() {
    // Calling refresh endpoint, which reads HttpOnly refresh_token cookie
    const res = await fetchApi('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return res;
  },

  async logout() {
    return await fetchApi('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  },
};

// User API
export const userAPI = {
  async getProfile() {
    return await fetchApi('/users/me');
  },

  async updateProfile(data: UpdateProfileData) {
    return await fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Health check
export const healthAPI = {
  async check() {
    return await fetchApi('/health');
  },
};
