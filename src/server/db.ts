import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Alumni,
  AcademicRecord,
  AlumniCard,
  AlumniQRCode,
  VerificationLog,
  ActivityLog,
  AdminStats,
  PublicVerificationResponse,
  CardStatus,
  QRStatus,
  VerificationStatusResult
} from '../types/alumni.js';

interface DatabaseSchema {
  alumni: Alumni[];
  academic_records: AcademicRecord[];
  cards: AlumniCard[];
  qr_codes: AlumniQRCode[];
  verification_logs: VerificationLog[];
  activity_logs: ActivityLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data with high-fidelity records representing all scenarios
const SEED_ALUMNI: Alumni[] = [
  {
    id: 'alm-1',
    alumni_id: 'PU-2024-00123',
    first_name: 'Juan',
    middle_name: 'Santos',
    last_name: 'Dela Cruz',
    suffix: '',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    email: 'j.delacruz@alumni.university.edu.ph',
    phone: '+63 917 555 0123',
    archived: false,
    created_at: '2024-06-15T08:00:00.000Z',
    updated_at: '2024-06-15T08:00:00.000Z'
  },
  {
    id: 'alm-2',
    alumni_id: 'PU-2018-00452',
    first_name: 'Maria',
    middle_name: 'Clara',
    last_name: 'Santos',
    suffix: '',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    email: 'm.santos@alumni.university.edu.ph',
    phone: '+63 918 555 0452',
    archived: false,
    created_at: '2018-04-10T08:00:00.000Z',
    updated_at: '2023-04-10T08:00:00.000Z'
  },
  {
    id: 'alm-3',
    alumni_id: 'PU-2020-00891',
    first_name: 'Roberto',
    middle_name: 'Cruz',
    last_name: 'Gomez',
    suffix: 'Jr.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    email: 'r.gomez@alumni.university.edu.ph',
    phone: '+63 919 555 0891',
    archived: false,
    created_at: '2020-08-01T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z'
  },
  {
    id: 'alm-4',
    alumni_id: 'PU-2015-00033',
    first_name: 'Elena',
    middle_name: 'Reyes',
    last_name: 'Valenzuela',
    suffix: 'Ph.D.',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    email: 'e.valenzuela@alumni.university.edu.ph',
    phone: '+63 920 555 0033',
    archived: false,
    created_at: '2015-05-20T08:00:00.000Z',
    updated_at: '2024-02-10T08:00:00.000Z'
  },
  {
    id: 'alm-5',
    alumni_id: 'PU-2023-01928',
    first_name: 'Carlo',
    middle_name: 'David',
    last_name: 'Mendoza',
    suffix: '',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    email: 'c.mendoza@alumni.university.edu.ph',
    phone: '+63 921 555 1928',
    archived: false,
    created_at: '2023-07-20T08:00:00.000Z',
    updated_at: '2023-07-20T08:00:00.000Z'
  }
];

const SEED_ACADEMIC_RECORDS: AcademicRecord[] = [
  // Juan Dela Cruz: Bachelor's + Master's
  {
    id: 'acad-1',
    alumni_id: 'PU-2024-00123',
    degree_level: 'BACHELORS',
    degree_program: 'Bachelor of Science in Information Technology',
    college: 'College of Computing and Information Technology',
    major: 'Information Technology',
    graduation_year: 2024,
    campus: 'Urdaneta Campus',
    created_at: '2024-06-15T08:00:00.000Z',
    updated_at: '2024-06-15T08:00:00.000Z'
  },
  {
    id: 'acad-2',
    alumni_id: 'PU-2024-00123',
    degree_level: 'MASTERS',
    degree_program: 'Master of Information Technology',
    college: 'College of Graduate Studies',
    major: 'Information Technology',
    graduation_year: 2026,
    campus: 'Urdaneta Campus',
    created_at: '2026-03-20T08:00:00.000Z',
    updated_at: '2026-03-20T08:00:00.000Z'
  },
  // Maria Santos: Bachelor's
  {
    id: 'acad-3',
    alumni_id: 'PU-2018-00452',
    degree_level: 'BACHELORS',
    degree_program: 'Bachelor of Science in Nursing',
    college: 'College of Health Sciences',
    major: 'Nursing',
    graduation_year: 2018,
    campus: 'Lingayen Campus',
    created_at: '2018-04-10T08:00:00.000Z',
    updated_at: '2018-04-10T08:00:00.000Z'
  },
  // Roberto Gomez: Bachelor's
  {
    id: 'acad-4',
    alumni_id: 'PU-2020-00891',
    degree_level: 'BACHELORS',
    degree_program: 'Bachelor of Science in Accountancy',
    college: 'College of Business and Public Administration',
    major: 'Accountancy',
    graduation_year: 2020,
    campus: 'Dagupan Campus',
    created_at: '2020-08-01T08:00:00.000Z',
    updated_at: '2020-08-01T08:00:00.000Z'
  },
  // Dr. Elena Valenzuela: Bachelor's + Master's + Doctorate
  {
    id: 'acad-5',
    alumni_id: 'PU-2015-00033',
    degree_level: 'BACHELORS',
    degree_program: 'Bachelor of Science in Biology',
    college: 'College of Arts and Sciences',
    major: 'Biology',
    graduation_year: 2015,
    campus: 'Urdaneta Campus',
    created_at: '2015-05-20T08:00:00.000Z',
    updated_at: '2015-05-20T08:00:00.000Z'
  },
  {
    id: 'acad-6',
    alumni_id: 'PU-2015-00033',
    degree_level: 'MASTERS',
    degree_program: 'Master of Science in Molecular Biology',
    college: 'College of Graduate Studies',
    major: 'Molecular Biology',
    graduation_year: 2019,
    campus: 'Urdaneta Campus',
    created_at: '2019-06-10T08:00:00.000Z',
    updated_at: '2019-06-10T08:00:00.000Z'
  },
  {
    id: 'acad-7',
    alumni_id: 'PU-2015-00033',
    degree_level: 'DOCTORATE',
    degree_program: 'Doctor of Philosophy in Biological Sciences',
    college: 'College of Graduate Studies',
    major: 'Biological Sciences',
    graduation_year: 2024,
    campus: 'Urdaneta Campus',
    created_at: '2024-02-10T08:00:00.000Z',
    updated_at: '2024-02-10T08:00:00.000Z'
  },
  // Carlo Mendoza: Bachelor's Only
  {
    id: 'acad-8',
    alumni_id: 'PU-2023-01928',
    degree_level: 'BACHELORS',
    degree_program: 'Bachelor of Science in Civil Engineering',
    college: 'College of Engineering and Architecture',
    major: 'Civil Engineering',
    graduation_year: 2023,
    campus: 'San Carlos Campus',
    created_at: '2023-07-20T08:00:00.000Z',
    updated_at: '2023-07-20T08:00:00.000Z'
  }
];

const SEED_CARDS: AlumniCard[] = [
  {
    id: 'card-1',
    alumni_id: 'PU-2024-00123',
    card_number: 'AC-2024-00123',
    issue_date: '2024-06-15',
    expiration_date: '2029-06-15',
    status: 'ACTIVE',
    created_at: '2024-06-15T08:00:00.000Z',
    updated_at: '2024-06-15T08:00:00.000Z'
  },
  {
    id: 'card-2',
    alumni_id: 'PU-2018-00452',
    card_number: 'AC-2018-00452',
    issue_date: '2018-04-10',
    expiration_date: '2023-04-10', // Expired
    status: 'EXPIRED',
    created_at: '2018-04-10T08:00:00.000Z',
    updated_at: '2023-04-11T08:00:00.000Z'
  },
  {
    id: 'card-3',
    alumni_id: 'PU-2020-00891',
    card_number: 'AC-2020-00891',
    issue_date: '2020-08-01',
    expiration_date: '2025-08-01',
    status: 'REVOKED', // Revoked
    revocation_reason: 'Card reported lost by holder and superseded by university security notice.',
    created_at: '2020-08-01T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z'
  },
  {
    id: 'card-4',
    alumni_id: 'PU-2015-00033',
    card_number: 'AC-2024-00033',
    issue_date: '2024-01-10',
    expiration_date: '2030-01-10',
    status: 'ACTIVE',
    created_at: '2024-01-10T08:00:00.000Z',
    updated_at: '2024-01-10T08:00:00.000Z'
  },
  {
    id: 'card-5',
    alumni_id: 'PU-2023-01928',
    card_number: 'AC-2023-01928',
    issue_date: '2023-07-20',
    expiration_date: '2028-07-20',
    status: 'ACTIVE',
    created_at: '2023-07-20T08:00:00.000Z',
    updated_at: '2023-07-20T08:00:00.000Z'
  }
];

const SEED_QR_CODES: AlumniQRCode[] = [
  {
    id: 'qr-1',
    card_id: 'card-1',
    qr_value: 'PU-ALUMNI-2024-8X29P7',
    status: 'ACTIVE',
    uploaded_at: '2024-06-15T08:00:00.000Z',
    updated_at: '2024-06-15T08:00:00.000Z'
  },
  {
    id: 'qr-2',
    card_id: 'card-2',
    qr_value: 'PU-ALUMNI-2018-EX7710',
    status: 'ACTIVE',
    uploaded_at: '2018-04-10T08:00:00.000Z',
    updated_at: '2018-04-10T08:00:00.000Z'
  },
  {
    id: 'qr-3',
    card_id: 'card-3',
    qr_value: 'PU-ALUMNI-2020-RV9921',
    status: 'ACTIVE',
    uploaded_at: '2020-08-01T08:00:00.000Z',
    updated_at: '2020-08-01T08:00:00.000Z'
  },
  {
    id: 'qr-4',
    card_id: 'card-4',
    qr_value: 'PU-ALUMNI-2024-DOC482',
    status: 'ACTIVE',
    uploaded_at: '2024-01-10T08:00:00.000Z',
    updated_at: '2024-01-10T08:00:00.000Z'
  },
  {
    id: 'qr-5',
    card_id: 'card-5',
    qr_value: 'PU-ALUMNI-2023-ENG104',
    status: 'ACTIVE',
    uploaded_at: '2023-07-20T08:00:00.000Z',
    updated_at: '2023-07-20T08:00:00.000Z'
  }
];

const SEED_VERIFICATION_LOGS: VerificationLog[] = [
  {
    id: 'vlog-1',
    qr_id: 'qr-1',
    card_id: 'card-1',
    alumni_id: 'PU-2024-00123',
    verification_reference: 'VER-2026-8X29P7',
    result: 'VERIFIED',
    verified_at: '2026-09-30T10:15:30.000Z',
    ip_address: '120.28.175.44',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
    searched_token: 'PU-ALUMNI-2024-8X29P7'
  },
  {
    id: 'vlog-2',
    qr_id: null,
    card_id: null,
    alumni_id: null,
    verification_reference: 'VER-2026-9Z10Q3',
    result: 'NOT_FOUND',
    verified_at: '2026-09-30T11:22:15.000Z',
    ip_address: '112.198.88.12',
    user_agent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B)',
    searched_token: 'FAKE-QR-TOKEN-UNKNOWN'
  }
];

const SEED_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    admin_id: 'admin@university.edu.ph',
    action: 'SYSTEM INITIALIZATION',
    target_type: 'AUTH',
    target_id: 'SYSTEM',
    metadata: { note: 'Initial database bootstrap and official verification records verified.' },
    created_at: '2026-09-30T08:00:00.000Z'
  },
  {
    id: 'act-2',
    admin_id: 'admin@university.edu.ph',
    action: 'ADMIN REGISTERED ALUMNI',
    target_type: 'ALUMNI',
    target_id: 'PU-2024-00123',
    metadata: { name: 'Juan Santos Dela Cruz', program: 'BS Information Technology' },
    created_at: '2024-06-15T08:00:00.000Z'
  },
  {
    id: 'act-3',
    admin_id: 'admin@university.edu.ph',
    action: 'ADMIN REVOKED CARD',
    target_type: 'CARD',
    target_id: 'card-3',
    metadata: { card_number: 'AC-2020-00891', reason: 'Lost card reported' },
    created_at: '2025-01-15T08:00:00.000Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error loading database file, initializing with seeds:', err);
    }

    const initialData: DatabaseSchema = {
      alumni: SEED_ALUMNI,
      academic_records: SEED_ACADEMIC_RECORDS,
      cards: SEED_CARDS,
      qr_codes: SEED_QR_CODES,
      verification_logs: SEED_VERIFICATION_LOGS,
      activity_logs: SEED_ACTIVITY_LOGS
    };

    this.persist(initialData);
    return initialData;
  }

  private persist(customData?: DatabaseSchema) {
    try {
      const dataToSave = customData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Helper Methods ---
  public generateUniqueReference(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `VER-${year}-${code}`;
  }

  public normalizeQRValue(val: string): string {
    if (!val) return '';
    let cleaned = val.trim();
    // If it's a verification URL e.g. https://domain.edu/verify/TOKEN, extract token
    const urlMatch = cleaned.match(/\/verify\/([^\/\?#]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].trim();
    }
    return cleaned;
  }

  // --- PUBLIC LIVE VERIFICATION ---
  public verifyLiveToken(rawToken: string, ip: string, userAgent: string): PublicVerificationResponse {
    const token = this.normalizeQRValue(rawToken);
    const now = new Date();
    const verified_at = now.toISOString();
    const verification_reference = this.generateUniqueReference();

    if (!token) {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: null,
        card_id: null,
        alumni_id: null,
        verification_reference,
        result: 'NOT_FOUND',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: rawToken
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'NOT_FOUND',
        verification_reference,
        verified_at,
        message: 'This QR code is not registered in the official Alumni Database of Panpacific University.'
      };
    }

    // Step 1: Query live database for QR code
    // Check case-insensitive or exact match
    const qr = this.data.qr_codes.find(
      q => q.qr_value.toUpperCase() === token.toUpperCase()
    );

    if (!qr) {
      // NOT FOUND
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: null,
        card_id: null,
        alumni_id: null,
        verification_reference,
        result: 'NOT_FOUND',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'NOT_FOUND',
        verification_reference,
        verified_at,
        message: 'This QR code is not registered in the official Alumni Database of Panpacific University.'
      };
    }

    // Step 2: Check QR status
    if (qr.status === 'DISABLED') {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: qr.id,
        card_id: qr.card_id,
        alumni_id: null,
        verification_reference,
        result: 'DISABLED',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'DISABLED',
        verification_reference,
        verified_at,
        message: 'This QR code has been disabled by the university administration and is no longer valid.'
      };
    }

    // Step 3: Find associated Card
    const card = this.data.cards.find(c => c.id === qr.card_id);
    if (!card) {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: qr.id,
        card_id: null,
        alumni_id: null,
        verification_reference,
        result: 'NOT_FOUND',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'NOT_FOUND',
        verification_reference,
        verified_at,
        message: 'No associated alumni card record found for this QR code.'
      };
    }

    // Step 4: Find associated Alumnus
    const alumnus = this.data.alumni.find(
      a => a.alumni_id === card.alumni_id && !a.archived
    );

    if (!alumnus) {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: qr.id,
        card_id: card.id,
        alumni_id: null,
        verification_reference,
        result: 'NOT_FOUND',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'NOT_FOUND',
        verification_reference,
        verified_at,
        message: 'The alumni record associated with this card could not be located.'
      };
    }

    // Find academic records
    const academic_records = this.data.academic_records
      .filter(ar => ar.alumni_id === alumnus.alumni_id)
      .sort((a, b) => {
        const order = { BACHELORS: 1, MASTERS: 2, DOCTORATE: 3 };
        return order[a.degree_level] - order[b.degree_level];
      });

    // Step 5: Check Card Revocation
    if (card.status === 'REVOKED') {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: qr.id,
        card_id: card.id,
        alumni_id: alumnus.alumni_id,
        verification_reference,
        result: 'REVOKED',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'REVOKED',
        verification_reference,
        verified_at,
        message: 'This alumni card is no longer valid.',
        alumni: {
          alumni_id: alumnus.alumni_id,
          full_name: `${alumnus.first_name} ${alumnus.middle_name ? alumnus.middle_name + ' ' : ''}${alumnus.last_name}${alumnus.suffix ? ' ' + alumnus.suffix : ''}`,
          first_name: alumnus.first_name,
          middle_name: alumnus.middle_name,
          last_name: alumnus.last_name,
          suffix: alumnus.suffix,
          photo_url: alumnus.photo_url,
          academic_records: academic_records.map(ar => ({
            degree_level: ar.degree_level,
            degree_program: ar.degree_program,
            college: ar.college,
            major: ar.major,
            graduation_year: ar.graduation_year,
            campus: ar.campus
          })),
          card: {
            card_number: card.card_number,
            issue_date: card.issue_date,
            expiration_date: card.expiration_date,
            status: 'REVOKED',
            effective_status: 'REVOKED'
          },
          primary_campus: academic_records[0]?.campus || 'Main Campus'
        }
      };
    }

    // Step 6: Automatic Card Expiration
    // IF current date > expiration date
    const expDate = new Date(card.expiration_date + 'T23:59:59Z');
    const isExpired = card.status === 'EXPIRED' || now > expDate;

    if (isExpired) {
      const log: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: qr.id,
        card_id: card.id,
        alumni_id: alumnus.alumni_id,
        verification_reference,
        result: 'EXPIRED',
        verified_at,
        ip_address: ip,
        user_agent: userAgent,
        searched_token: token
      };
      this.data.verification_logs.unshift(log);
      this.persist();

      return {
        result: 'EXPIRED',
        verification_reference,
        verified_at,
        message: 'This individual is registered in the official Alumni Database, but the associated alumni card has expired.',
        alumni: {
          alumni_id: alumnus.alumni_id,
          full_name: `${alumnus.first_name} ${alumnus.middle_name ? alumnus.middle_name + ' ' : ''}${alumnus.last_name}${alumnus.suffix ? ' ' + alumnus.suffix : ''}`,
          first_name: alumnus.first_name,
          middle_name: alumnus.middle_name,
          last_name: alumnus.last_name,
          suffix: alumnus.suffix,
          photo_url: alumnus.photo_url,
          academic_records: academic_records.map(ar => ({
            degree_level: ar.degree_level,
            degree_program: ar.degree_program,
            college: ar.college,
            major: ar.major,
            graduation_year: ar.graduation_year,
            campus: ar.campus
          })),
          card: {
            card_number: card.card_number,
            issue_date: card.issue_date,
            expiration_date: card.expiration_date,
            status: card.status,
            effective_status: 'EXPIRED'
          },
          primary_campus: academic_records[0]?.campus || 'Main Campus'
        }
      };
    }

    // Step 7: ACTIVE & VALID VERIFICATION
    const log: VerificationLog = {
      id: 'vlog-' + Date.now(),
      qr_id: qr.id,
      card_id: card.id,
      alumni_id: alumnus.alumni_id,
      verification_reference,
      result: 'VERIFIED',
      verified_at,
      ip_address: ip,
      user_agent: userAgent,
      searched_token: token
    };
    this.data.verification_logs.unshift(log);
    this.persist();

    return {
      result: 'VERIFIED',
      verification_reference,
      verified_at,
      message: 'Alumni verified and card is currently active.',
      alumni: {
        alumni_id: alumnus.alumni_id,
        full_name: `${alumnus.first_name} ${alumnus.middle_name ? alumnus.middle_name + ' ' : ''}${alumnus.last_name}${alumnus.suffix ? ' ' + alumnus.suffix : ''}`,
        first_name: alumnus.first_name,
        middle_name: alumnus.middle_name,
        last_name: alumnus.last_name,
        suffix: alumnus.suffix,
        photo_url: alumnus.photo_url,
        academic_records: academic_records.map(ar => ({
          degree_level: ar.degree_level,
          degree_program: ar.degree_program,
          college: ar.college,
          major: ar.major,
          graduation_year: ar.graduation_year,
          campus: ar.campus
        })),
        card: {
          card_number: card.card_number,
          issue_date: card.issue_date,
          expiration_date: card.expiration_date,
          status: 'ACTIVE',
          effective_status: 'ACTIVE'
        },
        qr_status: qr.status,
        primary_campus: academic_records[0]?.campus || 'Main Campus'
      }
    };
  }

  // --- STATS ---
  public getStats(): AdminStats {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const activeAlumni = this.data.alumni.filter(a => !a.archived);
    const total_alumni = activeAlumni.length;

    let active_cards = 0;
    let expired_cards = 0;
    let revoked_cards = 0;

    for (const card of this.data.cards) {
      if (card.status === 'REVOKED') {
        revoked_cards++;
      } else {
        const expDate = new Date(card.expiration_date + 'T23:59:59Z');
        if (card.status === 'EXPIRED' || now > expDate) {
          expired_cards++;
        } else if (card.status === 'ACTIVE') {
          active_cards++;
        }
      }
    }

    const registered_qr_codes = this.data.qr_codes.length;
    const total_verifications = this.data.verification_logs.length;

    const today_verifications = this.data.verification_logs.filter(
      vl => vl.verified_at && vl.verified_at.startsWith(todayStr)
    ).length;

    const not_found_attempts = this.data.verification_logs.filter(
      vl => vl.result === 'NOT_FOUND'
    ).length;

    return {
      total_alumni,
      active_cards,
      expired_cards,
      revoked_cards,
      registered_qr_codes,
      total_verifications,
      today_verifications,
      not_found_attempts
    };
  }

  // --- UNIQUENESS CHECKS ---
  public isAlumniIdAvailable(alumniId: string, currentId?: string): boolean {
    const normalized = alumniId.trim().toUpperCase();
    return !this.data.alumni.some(
      a => a.alumni_id.toUpperCase() === normalized && (!currentId || a.id !== currentId)
    );
  }

  public isCardNumberAvailable(cardNumber: string, currentId?: string): boolean {
    const normalized = cardNumber.trim().toUpperCase();
    return !this.data.cards.some(
      c => c.card_number.toUpperCase() === normalized && (!currentId || c.id !== currentId)
    );
  }

  public isQRValueAvailable(qrValue: string, currentId?: string): boolean {
    const token = this.normalizeQRValue(qrValue).toUpperCase();
    return !this.data.qr_codes.some(
      q => q.qr_value.toUpperCase() === token && (!currentId || q.id !== currentId)
    );
  }

  // --- ALUMNI CRUD ---
  public getAlumniList(params: {
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
    const {
      query = '',
      program = '',
      degree_level = '',
      graduation_year = '',
      campus = '',
      card_status = '',
      qr_status = '',
      page = 1,
      limit = 10
    } = params;

    const now = new Date();

    let items = this.data.alumni.filter(a => !a.archived).map(alumnus => {
      const records = this.data.academic_records.filter(ar => ar.alumni_id === alumnus.alumni_id);
      // find primary / latest card
      const alumnusCards = this.data.cards
        .filter(c => c.alumni_id === alumnus.alumni_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latestCard = alumnusCards[0];

      let effectiveCardStatus: CardStatus = 'ACTIVE';
      let latestQR: AlumniQRCode | undefined;

      if (latestCard) {
        latestQR = this.data.qr_codes.find(q => q.card_id === latestCard.id);
        const expDate = new Date(latestCard.expiration_date + 'T23:59:59Z');
        if (latestCard.status === 'REVOKED') {
          effectiveCardStatus = 'REVOKED';
        } else if (latestCard.status === 'EXPIRED' || now > expDate) {
          effectiveCardStatus = 'EXPIRED';
        } else {
          effectiveCardStatus = 'ACTIVE';
        }
      }

      return {
        ...alumnus,
        full_name: `${alumnus.first_name} ${alumnus.middle_name ? alumnus.middle_name + ' ' : ''}${alumnus.last_name}${alumnus.suffix ? ' ' + alumnus.suffix : ''}`,
        academic_records: records,
        primary_program: records[0]?.degree_program || 'N/A',
        primary_graduation_year: records[0]?.graduation_year || 'N/A',
        primary_campus: records[0]?.campus || 'N/A',
        card: latestCard,
        effective_card_status: effectiveCardStatus,
        qr: latestQR
      };
    });

    // Apply Filters
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        item =>
          item.alumni_id.toLowerCase().includes(q) ||
          item.full_name.toLowerCase().includes(q) ||
          item.card?.card_number.toLowerCase().includes(q) ||
          item.qr?.qr_value.toLowerCase().includes(q) ||
          item.academic_records.some(r => r.degree_program.toLowerCase().includes(q))
      );
    }

    if (program) {
      items = items.filter(item =>
        item.academic_records.some(r => r.degree_program.toLowerCase().includes(program.toLowerCase()))
      );
    }

    if (degree_level) {
      items = items.filter(item =>
        item.academic_records.some(r => r.degree_level === degree_level)
      );
    }

    if (graduation_year) {
      items = items.filter(item =>
        item.academic_records.some(r => String(r.graduation_year) === String(graduation_year))
      );
    }

    if (campus) {
      items = items.filter(item =>
        item.academic_records.some(r => r.campus.toLowerCase().includes(campus.toLowerCase()))
      );
    }

    if (card_status) {
      items = items.filter(item => item.effective_card_status === card_status);
    }

    if (qr_status) {
      items = items.filter(item => item.qr?.status === qr_status);
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public getAlumnusDetail(alumni_id: string) {
    const alumnus = this.data.alumni.find(a => a.alumni_id === alumni_id && !a.archived);
    if (!alumnus) return null;

    const academic_records = this.data.academic_records.filter(ar => ar.alumni_id === alumni_id);
    const cards = this.data.cards.filter(c => c.alumni_id === alumni_id);
    const cardIds = cards.map(c => c.id);
    const qr_codes = this.data.qr_codes.filter(q => cardIds.includes(q.card_id));
    const verification_logs = this.data.verification_logs.filter(vl => vl.alumni_id === alumni_id);
    const activity_logs = this.data.activity_logs.filter(al => al.target_id === alumni_id || cardIds.includes(al.target_id));

    return {
      alumnus,
      academic_records,
      cards,
      qr_codes,
      verification_logs,
      activity_logs
    };
  }

  public createAlumnus(payload: {
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
    admin_id: string;
  }) {
    const now = new Date().toISOString();

    // Check unique Alumni ID
    if (!this.isAlumniIdAvailable(payload.alumni_id)) {
      throw new Error('Alumni ID already exists in the system.');
    }

    // Check unique Card Number
    if (!this.isCardNumberAvailable(payload.card.card_number)) {
      throw new Error('Card Number already exists in the system.');
    }

    // Check unique QR Value
    if (!this.isQRValueAvailable(payload.qr.qr_value)) {
      throw new Error('This QR code is already associated with another alumni card.');
    }

    const alumnusId = 'alm-' + Date.now();
    const newAlumnus: Alumni = {
      id: alumnusId,
      alumni_id: payload.alumni_id.trim(),
      first_name: payload.first_name.trim(),
      middle_name: payload.middle_name?.trim() || '',
      last_name: payload.last_name.trim(),
      suffix: payload.suffix?.trim() || '',
      photo_url: payload.photo_url || '',
      email: payload.email?.trim() || '',
      phone: payload.phone?.trim() || '',
      archived: false,
      created_at: now,
      updated_at: now
    };

    const newAcademicRecords: AcademicRecord[] = payload.academic_records.map((ar, idx) => ({
      id: `acad-${Date.now()}-${idx}`,
      alumni_id: payload.alumni_id.trim(),
      degree_level: ar.degree_level,
      degree_program: ar.degree_program.trim(),
      college: ar.college.trim(),
      major: ar.major.trim(),
      graduation_year: ar.graduation_year,
      campus: ar.campus.trim(),
      created_at: now,
      updated_at: now
    }));

    const cardId = 'card-' + Date.now();
    const newCard: AlumniCard = {
      id: cardId,
      alumni_id: payload.alumni_id.trim(),
      card_number: payload.card.card_number.trim(),
      issue_date: payload.card.issue_date,
      expiration_date: payload.card.expiration_date,
      status: payload.card.status,
      created_at: now,
      updated_at: now
    };

    const qrId = 'qr-' + Date.now();
    const newQR: AlumniQRCode = {
      id: qrId,
      card_id: cardId,
      qr_value: this.normalizeQRValue(payload.qr.qr_value),
      qr_image_url: payload.qr.qr_image_url || '',
      status: payload.qr.status || 'ACTIVE',
      uploaded_at: now,
      updated_at: now
    };

    this.data.alumni.unshift(newAlumnus);
    this.data.academic_records.push(...newAcademicRecords);
    this.data.cards.unshift(newCard);
    this.data.qr_codes.unshift(newQR);

    this.logActivity(
      payload.admin_id,
      'ADMIN CREATED ALUMNI',
      'ALUMNI',
      newAlumnus.alumni_id,
      {
        name: `${newAlumnus.first_name} ${newAlumnus.last_name}`,
        card_number: newCard.card_number,
        qr_value: newQR.qr_value
      }
    );

    this.persist();

    return {
      alumnus: newAlumnus,
      alumni_id: newAlumnus.alumni_id,
      academic_records: newAcademicRecords,
      card: newCard,
      qr: newQR
    };
  }

  public updateAlumnus(
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
      admin_id: string;
    }
  ) {
    const now = new Date().toISOString();
    const alumnus = this.data.alumni.find(a => a.alumni_id === alumni_id);
    if (!alumnus) {
      throw new Error('Alumni not found.');
    }

    if (payload.first_name !== undefined) alumnus.first_name = payload.first_name.trim();
    if (payload.middle_name !== undefined) alumnus.middle_name = payload.middle_name.trim();
    if (payload.last_name !== undefined) alumnus.last_name = payload.last_name.trim();
    if (payload.suffix !== undefined) alumnus.suffix = payload.suffix.trim();
    if (payload.photo_url !== undefined) alumnus.photo_url = payload.photo_url;
    if (payload.email !== undefined) alumnus.email = payload.email.trim();
    if (payload.phone !== undefined) alumnus.phone = payload.phone.trim();
    alumnus.updated_at = now;

    if (payload.academic_records) {
      // Replace existing academic records
      this.data.academic_records = this.data.academic_records.filter(ar => ar.alumni_id !== alumni_id);
      const newRecords: AcademicRecord[] = payload.academic_records.map((ar, idx) => ({
        id: `acad-${Date.now()}-${idx}`,
        alumni_id,
        degree_level: ar.degree_level,
        degree_program: ar.degree_program.trim(),
        college: ar.college.trim(),
        major: ar.major.trim(),
        graduation_year: ar.graduation_year,
        campus: ar.campus.trim(),
        created_at: now,
        updated_at: now
      }));
      this.data.academic_records.push(...newRecords);
    }

    this.logActivity(
      payload.admin_id,
      'ADMIN UPDATED ALUMNI',
      'ALUMNI',
      alumni_id,
      { updated_fields: Object.keys(payload).filter(k => k !== 'admin_id') }
    );

    this.persist();
    return alumnus;
  }

  public archiveAlumnus(alumni_id: string, admin_id: string) {
    const alumnus = this.data.alumni.find(a => a.alumni_id === alumni_id);
    if (!alumnus) {
      throw new Error('Alumni not found.');
    }
    alumnus.archived = true;
    alumnus.updated_at = new Date().toISOString();

    // Disable all associated QRs and mark cards as REVOKED
    const cards = this.data.cards.filter(c => c.alumni_id === alumni_id);
    for (const c of cards) {
      c.status = 'REVOKED';
      c.revocation_reason = 'Alumni record archived by university administration.';
      c.updated_at = new Date().toISOString();
      const qr = this.data.qr_codes.find(q => q.card_id === c.id);
      if (qr) {
        qr.status = 'DISABLED';
        qr.updated_at = new Date().toISOString();
      }
    }

    this.logActivity(
      admin_id,
      'ADMIN ARCHIVED RECORD',
      'ALUMNI',
      alumni_id,
      { note: 'Archived alumni and disabled associated cards and QR codes' }
    );

    this.persist();
    return { success: true };
  }

  // --- CARD REPLACEMENT & STATUS MANAGEMENT ---
  public replaceCard(
    alumni_id: string,
    payload: {
      card_number: string;
      issue_date: string;
      expiration_date: string;
      qr_value: string;
      qr_image_url?: string;
      disable_old_qr?: boolean;
      admin_id: string;
    }
  ) {
    const now = new Date().toISOString();
    const alumnus = this.data.alumni.find(a => a.alumni_id === alumni_id && !a.archived);
    if (!alumnus) throw new Error('Alumnus not found.');

    if (!this.isCardNumberAvailable(payload.card_number)) {
      throw new Error('Card Number already exists in the system.');
    }

    if (!this.isQRValueAvailable(payload.qr_value)) {
      throw new Error('This QR code is already associated with another alumni card.');
    }

    // Step 1: Manage old cards and QRs
    const existingCards = this.data.cards.filter(c => c.alumni_id === alumni_id);
    for (const oldCard of existingCards) {
      if (oldCard.status === 'ACTIVE') {
        oldCard.status = 'EXPIRED';
        oldCard.revocation_reason = `Superseded by newly issued Card #${payload.card_number}`;
        oldCard.updated_at = now;
      }

      if (payload.disable_old_qr !== false) {
        const oldQR = this.data.qr_codes.find(q => q.card_id === oldCard.id);
        if (oldQR && oldQR.status === 'ACTIVE') {
          oldQR.status = 'DISABLED';
          oldQR.updated_at = now;
        }
      }
    }

    // Step 2: Create new card
    const cardId = 'card-' + Date.now();
    const newCard: AlumniCard = {
      id: cardId,
      alumni_id,
      card_number: payload.card_number.trim(),
      issue_date: payload.issue_date,
      expiration_date: payload.expiration_date,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now
    };

    // Step 3: Create new QR
    const qrId = 'qr-' + Date.now();
    const newQR: AlumniQRCode = {
      id: qrId,
      card_id: cardId,
      qr_value: this.normalizeQRValue(payload.qr_value),
      qr_image_url: payload.qr_image_url || '',
      status: 'ACTIVE',
      uploaded_at: now,
      updated_at: now
    };

    this.data.cards.unshift(newCard);
    this.data.qr_codes.unshift(newQR);

    this.logActivity(
      payload.admin_id,
      'ADMIN REPLACED CARD',
      'CARD',
      newCard.id,
      {
        alumni_id,
        new_card_number: newCard.card_number,
        new_qr_value: newQR.qr_value,
        old_cards_updated: existingCards.length
      }
    );

    this.persist();
    return { card: newCard, qr: newQR };
  }

  public updateCardStatus(
    card_id: string,
    status: CardStatus,
    reason: string | undefined,
    admin_id: string
  ) {
    const card = this.data.cards.find(c => c.id === card_id);
    if (!card) throw new Error('Card not found.');

    const previousStatus = card.status;
    card.status = status;
    if (reason) card.revocation_reason = reason;
    card.updated_at = new Date().toISOString();

    this.logActivity(
      admin_id,
      'ADMIN CHANGED CARD STATUS',
      'CARD',
      card_id,
      {
        card_number: card.card_number,
        previous_status: previousStatus,
        new_status: status,
        reason
      }
    );

    this.persist();
    return card;
  }

  public updateQRStatus(qr_id: string, status: QRStatus, admin_id: string) {
    const qr = this.data.qr_codes.find(q => q.id === qr_id);
    if (!qr) throw new Error('QR Code not found.');

    const previousStatus = qr.status;
    qr.status = status;
    qr.updated_at = new Date().toISOString();

    this.logActivity(
      admin_id,
      status === 'DISABLED' ? 'ADMIN DISABLED QR' : 'ADMIN ENABLED QR',
      'QR',
      qr_id,
      {
        qr_value: qr.qr_value,
        previous_status: previousStatus,
        new_status: status
      }
    );

    this.persist();
    return qr;
  }

  // --- LOGS ---
  public getVerificationLogs(params: {
    query?: string;
    result?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const { query = '', result = '', date = '', page = 1, limit = 15 } = params;

    let items = [...this.data.verification_logs];

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        item =>
          item.verification_reference.toLowerCase().includes(q) ||
          item.searched_token.toLowerCase().includes(q) ||
          (item.alumni_id && item.alumni_id.toLowerCase().includes(q)) ||
          item.ip_address.toLowerCase().includes(q)
      );
    }

    if (result) {
      items = items.filter(item => item.result === result);
    }

    if (date) {
      items = items.filter(item => item.verified_at.startsWith(date));
    }

    // Attach card number and alumni full name for admin view
    const enriched = items.map(item => {
      let alumniName = 'N/A';
      let cardNumber = 'N/A';
      if (item.alumni_id) {
        const al = this.data.alumni.find(a => a.alumni_id === item.alumni_id);
        if (al) {
          alumniName = `${al.first_name} ${al.last_name}`;
        }
      }
      if (item.card_id) {
        const cd = this.data.cards.find(c => c.id === item.card_id);
        if (cd) {
          cardNumber = cd.card_number;
        }
      }
      return {
        ...item,
        alumni_name: alumniName,
        card_number: cardNumber
      };
    });

    const total = enriched.length;
    const startIndex = (page - 1) * limit;
    const paginated = enriched.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public getActivityLogs(params: {
    query?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const { query = '', action = '', page = 1, limit = 20 } = params;
    let items = [...this.data.activity_logs];

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        item =>
          item.action.toLowerCase().includes(q) ||
          item.admin_id.toLowerCase().includes(q) ||
          item.target_id.toLowerCase().includes(q)
      );
    }

    if (action) {
      items = items.filter(item => item.action === action);
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginated = items.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public logActivity(
    admin_id: string,
    action: string,
    target_type: 'ALUMNI' | 'CARD' | 'QR' | 'ACADEMIC_RECORD' | 'AUTH',
    target_id: string,
    metadata?: Record<string, any>
  ) {
    const log: ActivityLog = {
      id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      admin_id,
      action,
      target_type,
      target_id,
      metadata,
      created_at: new Date().toISOString()
    };
    this.data.activity_logs.unshift(log);
    this.persist();
    return log;
  }

  public getAllCards() {
    return this.data.cards.map(c => {
      const al = this.data.alumni.find(a => a.alumni_id === c.alumni_id);
      const qr = this.data.qr_codes.find(q => q.card_id === c.id);
      const now = new Date();
      const expDate = new Date(c.expiration_date + 'T23:59:59Z');
      let effectiveStatus: CardStatus = c.status;
      if (c.status === 'REVOKED') {
        effectiveStatus = 'REVOKED';
      } else if (c.status === 'EXPIRED' || now > expDate) {
        effectiveStatus = 'EXPIRED';
      }
      return {
        ...c,
        effective_status: effectiveStatus,
        alumni_name: al ? `${al.first_name} ${al.last_name}` : 'Unknown',
        qr_value: qr?.qr_value || 'None',
        qr_status: qr?.status || 'None'
      };
    });
  }

  public getAllQRCodes() {
    return this.data.qr_codes.map(q => {
      const card = this.data.cards.find(c => c.id === q.card_id);
      const al = card ? this.data.alumni.find(a => a.alumni_id === card.alumni_id) : null;
      return {
        ...q,
        card_number: card?.card_number || 'N/A',
        card_status: card?.status || 'N/A',
        alumni_id: al?.alumni_id || 'N/A',
        alumni_name: al ? `${al.first_name} ${al.last_name}` : 'N/A'
      };
    });
  }
}

export const db = new Database();
