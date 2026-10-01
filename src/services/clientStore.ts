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
import { INITIAL_SEED_DATA, SeedDataSchema } from './seedData.js';

const STORAGE_KEY = 'verialumni_local_db_v1';

class ClientDatabaseStore {
  private getDb(): SeedDataSchema {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading local database store:', e);
    }
    this.saveDb(INITIAL_SEED_DATA);
    return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
  }

  private saveDb(data: SeedDataSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving local database store:', e);
    }
  }

  public verifyLiveToken(rawToken: string): PublicVerificationResponse {
    const db = this.getDb();
    const token = (rawToken || '').trim();
    const now = new Date();
    const refCode = 'VER-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Find QR record
    const qrRecord = db.qr_codes.find(q => q.qr_value.toUpperCase() === token.toUpperCase());

    if (!qrRecord) {
      const notFoundLog: VerificationLog = {
        id: 'vlog-' + Date.now(),
        qr_id: null,
        card_id: null,
        alumni_id: null,
        verification_reference: refCode,
        result: 'NOT_FOUND',
        verified_at: now.toISOString(),
        ip_address: 'client-offline',
        user_agent: navigator.userAgent,
        searched_token: token
      };
      db.verification_logs.unshift(notFoundLog);
      this.saveDb(db);

      return {
        result: 'NOT_FOUND',
        verification_reference: refCode,
        verified_at: now.toISOString(),
        message: 'No official Panpacific University alumni record matches this QR token.'
      };
    }

    const card = db.cards.find(c => c.id === qrRecord.card_id);
    if (!card) {
      return {
        result: 'NOT_FOUND',
        verification_reference: refCode,
        verified_at: now.toISOString(),
        message: 'Card record not found.'
      };
    }

    const alumnus = db.alumni.find(a => a.alumni_id === card.alumni_id);
    if (!alumnus || alumnus.archived) {
      return {
        result: 'REVOKED',
        verification_reference: refCode,
        verified_at: now.toISOString(),
        message: 'Alumni record is not active in the university registry.'
      };
    }

    const academicRecords = db.academic_records.filter(ar => ar.alumni_id === alumnus.alumni_id);

    let resultStatus: VerificationStatusResult = 'VERIFIED';
    let effectiveCardStatus: CardStatus = card.status;
    let statusMessage = 'Authentic Panpacific University Alumni Credential';

    if (qrRecord.status === 'DISABLED') {
      resultStatus = 'DISABLED';
      statusMessage = 'This QR credential has been disabled by the university administration.';
    } else if (card.status === 'REVOKED') {
      resultStatus = 'REVOKED';
      effectiveCardStatus = 'REVOKED';
      statusMessage = card.revocation_reason || 'This alumni card has been revoked by university authorities.';
    } else if (card.status === 'EXPIRED' || new Date(card.expiration_date) < now) {
      resultStatus = 'EXPIRED';
      effectiveCardStatus = 'EXPIRED';
      statusMessage = 'Card validity period has lapsed. Alumnus remains a graduate in good standing.';
    }

    // Log the verification
    const log: VerificationLog = {
      id: 'vlog-' + Date.now(),
      qr_id: qrRecord.id,
      card_id: card.id,
      alumni_id: alumnus.alumni_id,
      verification_reference: refCode,
      result: resultStatus,
      verified_at: now.toISOString(),
      ip_address: 'client-offline',
      user_agent: navigator.userAgent,
      searched_token: token
    };
    db.verification_logs.unshift(log);
    this.saveDb(db);

    const fullName = [alumnus.first_name, alumnus.middle_name, alumnus.last_name, alumnus.suffix]
      .filter(Boolean)
      .join(' ');

    const primaryCampus = academicRecords[0]?.campus || 'Panpacific University';

    return {
      result: resultStatus,
      verification_reference: refCode,
      verified_at: now.toISOString(),
      message: statusMessage,
      alumni: {
        alumni_id: alumnus.alumni_id,
        full_name: fullName,
        first_name: alumnus.first_name,
        middle_name: alumnus.middle_name,
        last_name: alumnus.last_name,
        suffix: alumnus.suffix,
        photo_url: alumnus.photo_url,
        academic_records: academicRecords.map(ar => ({
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
          effective_status: effectiveCardStatus
        },
        qr_status: qrRecord.status,
        primary_campus: primaryCampus
      }
    };
  }

  public getStats(): AdminStats {
    const db = this.getDb();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const totalAlumni = db.alumni.filter(a => !a.archived).length;
    const activeCards = db.cards.filter(c => c.status === 'ACTIVE' && new Date(c.expiration_date) >= now).length;
    const expiredCards = db.cards.filter(c => c.status === 'EXPIRED' || new Date(c.expiration_date) < now).length;
    const revokedCards = db.cards.filter(c => c.status === 'REVOKED').length;
    const registeredQRs = db.qr_codes.length;
    const totalVerifications = db.verification_logs.length;
    const todayVerifications = db.verification_logs.filter(v => v.verified_at.startsWith(todayStr)).length;
    const notFoundAttempts = db.verification_logs.filter(v => v.result === 'NOT_FOUND').length;

    return {
      total_alumni: totalAlumni,
      active_cards: activeCards,
      expired_cards: expiredCards,
      revoked_cards: revokedCards,
      registered_qr_codes: registeredQRs,
      total_verifications: totalVerifications,
      today_verifications: todayVerifications,
      not_found_attempts: notFoundAttempts
    };
  }

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
    const db = this.getDb();
    let records = db.alumni.filter(a => !a.archived);

    if (params.query) {
      const q = params.query.toLowerCase();
      records = records.filter(a =>
        a.alumni_id.toLowerCase().includes(q) ||
        a.first_name.toLowerCase().includes(q) ||
        a.last_name.toLowerCase().includes(q) ||
        (a.email ? a.email.toLowerCase().includes(q) : false)
      );
    }

    const populated = records.map(alumnus => {
      const academic = db.academic_records.filter(ar => ar.alumni_id === alumnus.alumni_id);
      const card = db.cards.find(c => c.alumni_id === alumnus.alumni_id);
      const qr = card ? db.qr_codes.find(q => q.card_id === card.id) : undefined;
      return {
        ...alumnus,
        academic_records: academic,
        active_card: card,
        active_qr: qr
      };
    });

    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: populated.slice(start, start + limit),
      pagination: {
        total: populated.length,
        page,
        limit,
        totalPages: Math.ceil(populated.length / limit)
      }
    };
  }

  public getAlumniById(id: string) {
    const db = this.getDb();
    const alumnus = db.alumni.find(a => a.id === id || a.alumni_id === id);
    if (!alumnus) return null;

    const academic = db.academic_records.filter(ar => ar.alumni_id === alumnus.alumni_id);
    const card = db.cards.find(c => c.alumni_id === alumnus.alumni_id);
    const qr = card ? db.qr_codes.find(q => q.card_id === card.id) : undefined;
    const verifications = db.verification_logs.filter(v => v.alumni_id === alumnus.alumni_id);

    return {
      ...alumnus,
      academic_records: academic,
      active_card: card,
      active_qr: qr,
      verification_history: verifications
    };
  }

  public checkUnique(type: 'alumni_id' | 'card_number' | 'qr_value', value: string, currentId?: string): boolean {
    const db = this.getDb();
    const v = value.trim().toUpperCase();

    if (type === 'alumni_id') {
      return !db.alumni.some(a => a.alumni_id.toUpperCase() === v && a.id !== currentId);
    } else if (type === 'card_number') {
      return !db.cards.some(c => c.card_number.toUpperCase() === v && c.id !== currentId);
    } else if (type === 'qr_value') {
      return !db.qr_codes.some(q => q.qr_value.toUpperCase() === v && q.id !== currentId);
    }
    return true;
  }

  public createAlumni(payload: any) {
    const db = this.getDb();
    const now = new Date().toISOString();
    const almId = 'alm-' + Date.now();

    const newAlumnus: Alumni = {
      id: almId,
      alumni_id: payload.alumni_id,
      first_name: payload.first_name,
      middle_name: payload.middle_name || '',
      last_name: payload.last_name,
      suffix: payload.suffix || '',
      photo_url: payload.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      email: payload.email,
      phone: payload.phone || '',
      archived: false,
      created_at: now,
      updated_at: now
    };
    db.alumni.unshift(newAlumnus);

    // Academic records
    if (payload.academic_records && Array.isArray(payload.academic_records)) {
      payload.academic_records.forEach((ar: any, idx: number) => {
        db.academic_records.push({
          id: `acad-${Date.now()}-${idx}`,
          alumni_id: newAlumnus.alumni_id,
          degree_level: ar.degree_level,
          degree_program: ar.degree_program,
          college: ar.college,
          major: ar.major || '',
          graduation_year: parseInt(ar.graduation_year, 10),
          campus: ar.campus,
          created_at: now,
          updated_at: now
        });
      });
    }

    // Card & QR
    const cardId = 'card-' + Date.now();
    const cardNumber = payload.card?.card_number || payload.card_number || `AC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const issueDate = payload.card?.issue_date || payload.issue_date || now.slice(0, 10);
    const expDate = payload.card?.expiration_date || payload.expiration_date || new Date(Date.now() + 5 * 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const cardStatus = payload.card?.status || payload.status || 'ACTIVE';

    const newCard: AlumniCard = {
      id: cardId,
      alumni_id: newAlumnus.alumni_id,
      card_number: cardNumber,
      issue_date: issueDate,
      expiration_date: expDate,
      status: cardStatus,
      created_at: now,
      updated_at: now
    };
    db.cards.unshift(newCard);

    const qrId = 'qr-' + Date.now();
    const qrValue = payload.qr?.qr_value || payload.qr_value || `PU-ALUMNI-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrStatus = payload.qr?.status || payload.qr_status || 'ACTIVE';
    const qrImageUrl = payload.qr?.qr_image_url || payload.qr_image_url || '';

    const newQR: AlumniQRCode = {
      id: qrId,
      card_id: cardId,
      qr_value: qrValue,
      qr_image_url: qrImageUrl,
      status: qrStatus,
      uploaded_at: now,
      updated_at: now
    };
    db.qr_codes.unshift(newQR);

    this.saveDb(db);
    const detail = this.getAlumniById(almId);

    return {
      alumnus: newAlumnus,
      alumni_id: newAlumnus.alumni_id,
      detail,
      card: newCard,
      qr: newQR
    };
  }

  public updateCardStatus(cardId: string, status: CardStatus, notes?: string) {
    const db = this.getDb();
    const card = db.cards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.status = status;
    card.updated_at = new Date().toISOString();
    if (status === 'REVOKED') {
      card.revocation_reason = notes || 'Revoked by administration';
      const qr = db.qr_codes.find(q => q.card_id === card.id);
      if (qr) {
        qr.status = 'DISABLED';
        qr.updated_at = new Date().toISOString();
      }
    }
    this.saveDb(db);
    return card;
  }

  public renewCard(cardId: string, newExpDate: string, notes?: string) {
    const db = this.getDb();
    const card = db.cards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');

    card.status = 'ACTIVE';
    card.expiration_date = newExpDate;
    card.updated_at = new Date().toISOString();

    const qr = db.qr_codes.find(q => q.card_id === card.id);
    if (qr) {
      qr.status = 'ACTIVE';
      qr.updated_at = new Date().toISOString();
    }

    this.saveDb(db);
    return card;
  }

  public updateQRStatus(qrId: string, status: QRStatus) {
    const db = this.getDb();
    const qr = db.qr_codes.find(q => q.id === qrId);
    if (!qr) throw new Error('QR record not found');

    qr.status = status;
    qr.updated_at = new Date().toISOString();
    this.saveDb(db);
    return qr;
  }

  public getCards(params: any) {
    const db = this.getDb();
    const cards = db.cards.map(c => {
      const alumnus = db.alumni.find(a => a.alumni_id === c.alumni_id);
      const qr = db.qr_codes.find(q => q.card_id === c.id);
      return {
        ...c,
        alumnus,
        qr
      };
    });
    return { data: cards, pagination: { total: cards.length, page: 1, limit: 50, totalPages: 1 } };
  }

  public getQRCodes(params: any) {
    const db = this.getDb();
    const qrs = db.qr_codes.map(q => {
      const card = db.cards.find(c => c.id === q.card_id);
      const alumnus = card ? db.alumni.find(a => a.alumni_id === card.alumni_id) : undefined;
      return {
        ...q,
        card,
        alumnus
      };
    });
    return { data: qrs, pagination: { total: qrs.length, page: 1, limit: 50, totalPages: 1 } };
  }

  public getVerificationLogs(params: any) {
    const db = this.getDb();
    const logs = db.verification_logs.map(v => {
      const alumnus = v.alumni_id ? db.alumni.find(a => a.alumni_id === v.alumni_id) : undefined;
      const card = v.card_id ? db.cards.find(c => c.id === v.card_id) : undefined;
      return {
        ...v,
        alumnus,
        card
      };
    });
    return { data: logs, pagination: { total: logs.length, page: 1, limit: 50, totalPages: 1 } };
  }

  public getActivityLogs(params: any) {
    const db = this.getDb();
    return { data: db.activity_logs || [], pagination: { total: (db.activity_logs || []).length, page: 1, limit: 50, totalPages: 1 } };
  }
}

export const clientStore = new ClientDatabaseStore();
