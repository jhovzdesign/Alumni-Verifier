import {
  PublicVerificationResponse,
  AdminStats,
  Alumni,
  AcademicRecord,
  AlumniCard,
  AlumniQRCode,
  CardStatus,
  QRStatus
} from '../types/alumni.js';

const ADMIN_TOKEN_KEY = 'verialumni_admin_token';

export const api = {
  // --- Admin Token Management ---
  getAdminToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  // --- PUBLIC VERIFICATION ---
  async verifyToken(token: string): Promise<PublicVerificationResponse> {
    const encoded = encodeURIComponent(token.trim());
    const res = await fetch(`/api/verify/${encoded}`);
    if (res.status === 429) {
      const err = await res.json();
      throw new Error(err.error || 'Too many verification attempts. Please try again later.');
    }
    if (!res.ok) {
      if (res.status === 500) {
        throw new Error('VERIFICATION TEMPORARILY UNAVAILABLE. We are unable to verify this QR code at the moment.');
      }
      throw new Error('Network error verifying QR code.');
    }
    return res.json();
  },

  // --- ADMIN AUTH ---
  async adminLogin(email: string, pass: string) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    if (data.token) {
      this.setAdminToken(data.token);
    }
    return data;
  },

  async adminLogout() {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } finally {
      this.clearAdminToken();
    }
  },

  async checkAdminSession() {
    const token = this.getAdminToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch('/api/admin/session', {
        headers: this.getAuthHeaders()
      });
      if (!res.ok) return { authenticated: false };
      return res.json();
    } catch {
      return { authenticated: false };
    }
  },

  // --- ADMIN STATS ---
  async getStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load dashboard statistics.');
    return res.json();
  },

  // --- CHECK UNIQUENESS ---
  async checkUnique(type: 'alumni_id' | 'card_number' | 'qr_value', value: string, currentId?: string): Promise<boolean> {
    const params = new URLSearchParams({ type, value, ...(currentId ? { currentId } : {}) });
    const res = await fetch(`/api/admin/check-unique?${params.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.available;
  },

  // --- ALUMNI DIRECTORY & CRUD ---
  async getAlumniList(params: {
    query?: string;
    program?: string;
    degree_level?: string;
    graduation_year?: string;
    campus?: string;
    card_status?: string;
    qr_status?: string;
    page?: number;
    limit?: number;
  }) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') urlParams.append(k, String(v));
    });

    const res = await fetch(`/api/admin/alumni?${urlParams.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load alumni directory.');
    return res.json();
  },

  async getAlumnusDetail(alumni_id: string) {
    const res = await fetch(`/api/admin/alumni/${encodeURIComponent(alumni_id)}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load alumnus details.');
    return res.json();
  },

  async createAlumnus(payload: {
    alumni_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    photo_url: string;
    email?: string;
    phone?: string;
    academic_records: Omit<AcademicRecord, 'id' | 'alumni_id' | 'created_at' | 'updated_at'>[];
    card: {
      card_number: string;
      issue_date: string;
      expiration_date: string;
      status: CardStatus;
    };
    qr: {
      qr_value: string;
      qr_image_url?: string;
      status: QRStatus;
    };
  }) {
    const res = await fetch('/api/admin/alumni', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create alumni record.');
    }
    return data;
  },

  async updateAlumnus(
    alumni_id: string,
    payload: {
      first_name?: string;
      middle_name?: string;
      last_name?: string;
      suffix?: string;
      photo_url?: string;
      email?: string;
      phone?: string;
      academic_records?: Omit<AcademicRecord, 'id' | 'alumni_id' | 'created_at' | 'updated_at'>[];
    }
  ) {
    const res = await fetch(`/api/admin/alumni/${encodeURIComponent(alumni_id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update alumni record.');
    return data;
  },

  async archiveAlumnus(alumni_id: string) {
    const res = await fetch(`/api/admin/alumni/${encodeURIComponent(alumni_id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to archive alumni record.');
    return data;
  },

  // --- CARDS & QR ---
  async getAllCards() {
    const res = await fetch('/api/admin/cards', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch cards');
    return res.json();
  },

  async getAllQRCodes() {
    const res = await fetch('/api/admin/qr-codes', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch QR codes');
    return res.json();
  },

  async replaceCard(
    alumni_id: string,
    payload: {
      card_number: string;
      issue_date: string;
      expiration_date: string;
      qr_value: string;
      qr_image_url?: string;
      disable_old_qr?: boolean;
    }
  ) {
    const res = await fetch(`/api/admin/alumni/${encodeURIComponent(alumni_id)}/replace-card`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to replace card.');
    return data;
  },

  async updateCardStatus(card_id: string, status: CardStatus, reason?: string) {
    const res = await fetch(`/api/admin/cards/${encodeURIComponent(card_id)}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update card status.');
    return data;
  },

  async updateQRStatus(qr_id: string, status: QRStatus) {
    const res = await fetch(`/api/admin/qr/${encodeURIComponent(qr_id)}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update QR status.');
    return data;
  },

  // --- LOGS ---
  async getVerificationLogs(params: {
    query?: string;
    result?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') urlParams.append(k, String(v));
    });

    const res = await fetch(`/api/admin/verification-logs?${urlParams.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load verification logs.');
    return res.json();
  },

  async getActivityLogs(params: {
    query?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') urlParams.append(k, String(v));
    });

    const res = await fetch(`/api/admin/activity-logs?${urlParams.toString()}`, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load activity logs.');
    return res.json();
  }
};
