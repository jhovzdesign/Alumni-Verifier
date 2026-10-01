export type DegreeLevel = 'BACHELORS' | 'MASTERS' | 'DOCTORATE';
export type CardStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type QRStatus = 'ACTIVE' | 'DISABLED';
export type VerificationStatusResult = 'VERIFIED' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND' | 'DISABLED' | 'ERROR';

export interface AcademicRecord {
  id: string;
  alumni_id: string; // references Alumni.alumni_id
  degree_level: DegreeLevel;
  degree_program: string;
  college: string;
  major: string;
  graduation_year: number | string;
  campus: string;
  created_at: string;
  updated_at: string;
}

export interface AlumniCard {
  id: string;
  alumni_id: string; // references Alumni.alumni_id
  card_number: string;
  issue_date: string; // YYYY-MM-DD
  expiration_date: string; // YYYY-MM-DD
  status: CardStatus; // ACTIVE, EXPIRED, REVOKED
  revocation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AlumniQRCode {
  id: string;
  card_id: string; // references AlumniCard.id
  qr_value: string; // Unique token, e.g., PU-ALUMNI-2024-8X29P7
  qr_image_url?: string;
  status: QRStatus; // ACTIVE, DISABLED
  uploaded_at: string;
  updated_at: string;
}

export interface Alumni {
  id: string;
  alumni_id: string; // Unique public ID, e.g., PU-2024-00123
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string;
  photo_url: string;
  email?: string; // Private, never exposed in public verification
  phone?: string; // Private
  archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationLog {
  id: string;
  qr_id?: string | null;
  card_id?: string | null;
  alumni_id?: string | null;
  verification_reference: string; // Unique, e.g., VER-2026-8X29P7
  result: VerificationStatusResult;
  verified_at: string;
  ip_address: string;
  user_agent: string;
  searched_token: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: 'ALUMNI' | 'CARD' | 'QR' | 'ACADEMIC_RECORD' | 'AUTH';
  target_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Public verification response payload (Strictly minimized public data)
export interface PublicVerificationResponse {
  result: VerificationStatusResult;
  verification_reference: string;
  verified_at: string;
  message?: string;
  alumni?: {
    alumni_id: string;
    full_name: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    suffix?: string;
    photo_url: string;
    academic_records: {
      degree_level: DegreeLevel;
      degree_program: string;
      college: string;
      major: string;
      graduation_year: number | string;
      campus: string;
    }[];
    card: {
      card_number: string;
      issue_date: string;
      expiration_date: string;
      status: CardStatus;
      effective_status: CardStatus; // Computes dynamic expiration
    };
    qr_status?: QRStatus;
    primary_campus: string;
  };
}

export interface AdminStats {
  total_alumni: number;
  active_cards: number;
  expired_cards: number;
  revoked_cards: number;
  registered_qr_codes: number;
  total_verifications: number;
  today_verifications: number;
  not_found_attempts: number;
}
