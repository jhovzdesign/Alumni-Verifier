import {
  Alumni,
  AcademicRecord,
  AlumniCard,
  AlumniQRCode,
  VerificationLog,
  ActivityLog
} from '../types/alumni.js';

export interface SeedDataSchema {
  alumni: Alumni[];
  academic_records: AcademicRecord[];
  cards: AlumniCard[];
  qr_codes: AlumniQRCode[];
  verification_logs: VerificationLog[];
  activity_logs: ActivityLog[];
}

export const INITIAL_SEED_DATA: SeedDataSchema = {
  alumni: [
    {
      id: "alm-1",
      alumni_id: "PU-2024-00123",
      first_name: "Juan",
      middle_name: "Santos",
      last_name: "Dela Cruz",
      suffix: "",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      email: "j.delacruz@alumni.university.edu.ph",
      phone: "+63 917 555 0123",
      archived: false,
      created_at: "2024-06-15T08:00:00.000Z",
      updated_at: "2024-06-15T08:00:00.000Z"
    },
    {
      id: "alm-2",
      alumni_id: "PU-2018-00452",
      first_name: "Maria",
      middle_name: "Clara",
      last_name: "Santos",
      suffix: "",
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      email: "m.santos@alumni.university.edu.ph",
      phone: "+63 918 555 0452",
      archived: false,
      created_at: "2018-04-10T08:00:00.000Z",
      updated_at: "2023-04-10T08:00:00.000Z"
    },
    {
      id: "alm-3",
      alumni_id: "PU-2020-00891",
      first_name: "Roberto",
      middle_name: "Cruz",
      last_name: "Gomez",
      suffix: "Jr.",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      email: "r.gomez@alumni.university.edu.ph",
      phone: "+63 919 555 0891",
      archived: false,
      created_at: "2020-08-01T08:00:00.000Z",
      updated_at: "2025-01-15T08:00:00.000Z"
    },
    {
      id: "alm-4",
      alumni_id: "PU-2015-00033",
      first_name: "Elena",
      middle_name: "Reyes",
      last_name: "Valenzuela",
      suffix: "Ph.D.",
      photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      email: "e.valenzuela@alumni.university.edu.ph",
      phone: "+63 920 555 0033",
      archived: false,
      created_at: "2015-05-20T08:00:00.000Z",
      updated_at: "2024-02-10T08:00:00.000Z"
    },
    {
      id: "alm-5",
      alumni_id: "PU-2023-01928",
      first_name: "Carlo",
      middle_name: "David",
      last_name: "Mendoza",
      suffix: "",
      photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      email: "c.mendoza@alumni.university.edu.ph",
      phone: "+63 921 555 1928",
      archived: false,
      created_at: "2023-07-20T08:00:00.000Z",
      updated_at: "2023-07-20T08:00:00.000Z"
    }
  ],
  academic_records: [
    {
      id: "acad-1",
      alumni_id: "PU-2024-00123",
      degree_level: "BACHELORS",
      degree_program: "Bachelor of Science in Information Technology",
      college: "College of Computing and Information Technology",
      major: "Information Technology",
      graduation_year: 2024,
      campus: "Urdaneta Campus",
      created_at: "2024-06-15T08:00:00.000Z",
      updated_at: "2024-06-15T08:00:00.000Z"
    },
    {
      id: "acad-2",
      alumni_id: "PU-2024-00123",
      degree_level: "MASTERS",
      degree_program: "Master of Information Technology",
      college: "College of Graduate Studies",
      major: "Information Technology",
      graduation_year: 2026,
      campus: "Urdaneta Campus",
      created_at: "2026-03-20T08:00:00.000Z",
      updated_at: "2026-03-20T08:00:00.000Z"
    },
    {
      id: "acad-3",
      alumni_id: "PU-2018-00452",
      degree_level: "BACHELORS",
      degree_program: "Bachelor of Science in Nursing",
      college: "College of Health Sciences",
      major: "Nursing",
      graduation_year: 2018,
      campus: "Lingayen Campus",
      created_at: "2018-04-10T08:00:00.000Z",
      updated_at: "2018-04-10T08:00:00.000Z"
    },
    {
      id: "acad-4",
      alumni_id: "PU-2020-00891",
      degree_level: "BACHELORS",
      degree_program: "Bachelor of Science in Accountancy",
      college: "College of Business and Public Administration",
      major: "Accountancy",
      graduation_year: 2020,
      campus: "Dagupan Campus",
      created_at: "2020-08-01T08:00:00.000Z",
      updated_at: "2020-08-01T08:00:00.000Z"
    },
    {
      id: "acad-5",
      alumni_id: "PU-2015-00033",
      degree_level: "BACHELORS",
      degree_program: "Bachelor of Science in Biology",
      college: "College of Arts and Sciences",
      major: "Biology",
      graduation_year: 2015,
      campus: "Urdaneta Campus",
      created_at: "2015-05-20T08:00:00.000Z",
      updated_at: "2015-05-20T08:00:00.000Z"
    },
    {
      id: "acad-6",
      alumni_id: "PU-2015-00033",
      degree_level: "MASTERS",
      degree_program: "Master of Science in Molecular Biology",
      college: "College of Graduate Studies",
      major: "Molecular Biology",
      graduation_year: 2019,
      campus: "Urdaneta Campus",
      created_at: "2019-06-10T08:00:00.000Z",
      updated_at: "2019-06-10T08:00:00.000Z"
    },
    {
      id: "acad-7",
      alumni_id: "PU-2015-00033",
      degree_level: "DOCTORATE",
      degree_program: "Doctor of Philosophy in Biological Sciences",
      college: "College of Graduate Studies",
      major: "Biological Sciences",
      graduation_year: 2024,
      campus: "Urdaneta Campus",
      created_at: "2024-02-10T08:00:00.000Z",
      updated_at: "2024-02-10T08:00:00.000Z"
    },
    {
      id: "acad-8",
      alumni_id: "PU-2023-01928",
      degree_level: "BACHELORS",
      degree_program: "Bachelor of Science in Civil Engineering",
      college: "College of Engineering and Architecture",
      major: "Civil Engineering",
      graduation_year: 2023,
      campus: "San Carlos Campus",
      created_at: "2023-07-20T08:00:00.000Z",
      updated_at: "2023-07-20T08:00:00.000Z"
    }
  ],
  cards: [
    {
      id: "card-1",
      alumni_id: "PU-2024-00123",
      card_number: "AC-2024-00123",
      issue_date: "2024-06-15",
      expiration_date: "2029-06-15",
      status: "ACTIVE",
      created_at: "2024-06-15T08:00:00.000Z",
      updated_at: "2024-06-15T08:00:00.000Z"
    },
    {
      id: "card-2",
      alumni_id: "PU-2018-00452",
      card_number: "AC-2018-00452",
      issue_date: "2018-04-10",
      expiration_date: "2023-04-10",
      status: "EXPIRED",
      created_at: "2018-04-10T08:00:00.000Z",
      updated_at: "2023-04-11T08:00:00.000Z"
    },
    {
      id: "card-3",
      alumni_id: "PU-2020-00891",
      card_number: "AC-2020-00891",
      issue_date: "2020-08-01",
      expiration_date: "2025-08-01",
      status: "REVOKED",
      revocation_reason: "Card reported lost by holder and superseded by university security notice.",
      created_at: "2020-08-01T08:00:00.000Z",
      updated_at: "2025-01-15T08:00:00.000Z"
    },
    {
      id: "card-4",
      alumni_id: "PU-2015-00033",
      card_number: "AC-2024-00033",
      issue_date: "2024-01-10",
      expiration_date: "2030-01-10",
      status: "ACTIVE",
      created_at: "2024-01-10T08:00:00.000Z",
      updated_at: "2024-01-10T08:00:00.000Z"
    },
    {
      id: "card-5",
      alumni_id: "PU-2023-01928",
      card_number: "AC-2023-01928",
      issue_date: "2023-07-20",
      expiration_date: "2028-07-20",
      status: "ACTIVE",
      created_at: "2023-07-20T08:00:00.000Z",
      updated_at: "2023-07-20T08:00:00.000Z"
    }
  ],
  qr_codes: [
    {
      id: "qr-1",
      card_id: "card-1",
      qr_value: "PU-ALUMNI-2024-8X29P7",
      status: "ACTIVE",
      uploaded_at: "2024-06-15T08:00:00.000Z",
      updated_at: "2024-06-15T08:00:00.000Z"
    },
    {
      id: "qr-2",
      card_id: "card-2",
      qr_value: "PU-ALUMNI-2018-EX7710",
      status: "ACTIVE",
      uploaded_at: "2018-04-10T08:00:00.000Z",
      updated_at: "2018-04-10T08:00:00.000Z"
    },
    {
      id: "qr-3",
      card_id: "card-3",
      qr_value: "PU-ALUMNI-2020-RV9921",
      status: "ACTIVE",
      uploaded_at: "2020-08-01T08:00:00.000Z",
      updated_at: "2020-08-01T08:00:00.000Z"
    },
    {
      id: "qr-4",
      card_id: "card-4",
      qr_value: "PU-ALUMNI-2024-DOC482",
      status: "ACTIVE",
      uploaded_at: "2024-01-10T08:00:00.000Z",
      updated_at: "2024-01-10T08:00:00.000Z"
    },
    {
      id: "qr-5",
      card_id: "card-5",
      qr_value: "PU-ALUMNI-2023-ENG104",
      status: "ACTIVE",
      uploaded_at: "2023-07-20T08:00:00.000Z",
      updated_at: "2023-07-20T08:00:00.000Z"
    }
  ],
  verification_logs: [],
  activity_logs: []
};
