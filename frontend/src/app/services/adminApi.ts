import { fetchApi } from './api';

// ── Types ────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'learner';
  preferred_language: string;
  created_at: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
}

export interface PlatformSettings {
  platform: {
    name: string;
    version: string;
    api_prefix: string;
  };
  database: {
    server: string;
    port: number;
    name: string;
  };
  auth: {
    algorithm: string;
    access_token_expire_minutes: number;
    refresh_token_expire_days: number;
  };
  ai_service: {
    provider: string;
    base_url: string;
    model: string;
    status: 'online' | 'offline';
    available_models: string[];
  };
  cors_origins: string[];
}

// ── Admin User API ───────────────────────────────────

export const adminUserAPI = {
  async listUsers(params: { skip?: number; limit?: number; search?: string } = {}): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params.skip) query.set('skip', String(params.skip));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return await fetchApi(`/users/${qs ? `?${qs}` : ''}`);
  },

  async updateUser(userId: string, data: { role?: string; full_name?: string }): Promise<AdminUser> {
    return await fetchApi(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    await fetchApi(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ── Settings API ─────────────────────────────────────

export const settingsAPI = {
  async getSettings(): Promise<PlatformSettings> {
    return await fetchApi('/settings');
  },
};
