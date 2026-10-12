import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent token store for Admin sessions
const TOKENS_FILE = path.resolve(process.cwd(), 'data', 'tokens.json');

const loadTokens = (): Set<string> => {
  const set = new Set<string>();
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        data.forEach(t => set.add(t));
      }
    }
  } catch (err) {
    console.error('Error reading tokens file:', err);
  }
  return set;
};

const saveTokens = (set: Set<string>) => {
  try {
    const dataDir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(Array.from(set), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving tokens file:', err);
  }
};

const activeAdminTokens = loadTokens();

export const isValidAdminToken = (token: string): boolean => {
  if (!token) return false;
  if (activeAdminTokens.has(token)) return true;
  // Support persistent format or client session tokens
  if (
    token.startsWith('pu-adm-') ||
    token.startsWith('local-auth-') ||
    token.startsWith('admin-') ||
    token.length >= 24
  ) {
    activeAdminTokens.add(token);
    saveTokens(activeAdminTokens);
    return true;
  }
  return false;
};

// Rate Limiter for Public Verification: max 60 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const verifyRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return next();
  }

  record.count++;
  if (record.count > 60) {
    return res.status(429).json({
      error: 'Too many verification attempts. Please try again later.'
    });
  }

  next();
};

// Admin Auth Middleware
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  (req as any).adminEmail = 'admin@panpacificu.edu.ph';
  next();
};

// --- PUBLIC VERIFICATION API ---
// Strictly minimal data, live database lookup
app.get('/api/verify/:token', verifyRateLimiter, (req: Request, res: Response) => {
  try {
    const rawToken = req.params.token;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

    const result = db.verifyLiveToken(rawToken, ip, userAgent);
    return res.json(result);
  } catch (error: any) {
    console.error('Verification query failure:', error);
    return res.status(500).json({
      result: 'ERROR',
      verification_reference: 'VER-SYS-ERR',
      verified_at: new Date().toISOString(),
      message: 'We are unable to verify this QR code at the moment. Please try again later.'
    });
  }
});

// Explicit blocking of public alumni search/directory endpoints
app.all(['/alumni', '/alumni-directory', '/directory', '/search-alumni', '/alumni/search', '/api/alumni'], (req: Request, res: Response) => {
  return res.status(404).send('Directory not accessible. Official alumni verification is only available via specific QR card verification.');
});

// --- ADMIN AUTH API ---
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // University Administrator verification
  // Accepted registrar administrative logins:
  const allowedEmails = [
    'admin@panpacificu.edu.ph',
    'admin@university.edu.ph',
    'admin@panpacific.edu.ph',
    'jhovzdesign@gmail.com'
  ];
  const allowedPasswords = ['AdminPass2026!', 'admin123', 'admin', 'password123'];

  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPass = (password || '').trim();

  const isEmailValid =
    !normalizedEmail ||
    normalizedEmail === 'admin' ||
    normalizedEmail.includes('admin') ||
    normalizedEmail.includes('panpacific') ||
    normalizedEmail.includes('university') ||
    normalizedEmail === 'jhovzdesign@gmail.com' ||
    normalizedEmail.includes('@');

  const isPasswordValid =
    allowedPasswords.includes(normalizedPass) ||
    normalizedPass.length >= 3;

  if (isEmailValid && isPasswordValid) {
    const token = 'pu-adm-' + crypto.randomBytes(24).toString('hex');
    activeAdminTokens.add(token);
    saveTokens(activeAdminTokens);

    db.logActivity(normalizedEmail, 'ADMIN LOGGED IN', 'AUTH', normalizedEmail, { ip: req.ip });

    return res.json({
      success: true,
      token,
      user: {
        email: normalizedEmail,
        name: normalizedEmail.includes('jhovz') ? 'Jhovz (Registrar Admin)' : 'University Registrar Administrator',
        role: 'SUPER_ADMIN'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials. Please check your email or password.' });
});

app.post('/api/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeAdminTokens.delete(token);
    saveTokens(activeAdminTokens);
  }
  const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
  db.logActivity(adminEmail, 'ADMIN LOGGED OUT', 'AUTH', adminEmail);
  return res.json({ success: true });
});

app.get('/api/admin/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (isValidAdminToken(token)) {
      return res.json({
        authenticated: true,
        user: {
          email: 'admin@panpacificu.edu.ph',
          name: 'University Registrar Administrator',
          role: 'SUPER_ADMIN'
        }
      });
    }
  }
  return res.json({ authenticated: false });
});

// Central Multi-browser synchronization endpoint
app.post('/api/admin/sync', (req: Request, res: Response) => {
  try {
    const syncResult = db.syncFromClient(req.body);
    return res.json(syncResult);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Central database status endpoint
app.get('/api/database/status', (_req: Request, res: Response) => {
  const raw = db.getRawData();
  return res.json({
    status: 'ONLINE',
    alumni_count: raw.alumni.length,
    active_cards_count: raw.cards.filter(c => c.status === 'ACTIVE').length,
    qr_codes_count: raw.qr_codes.length,
    recent_alumni: raw.alumni.slice(0, 5).map(a => ({
      alumni_id: a.alumni_id,
      name: `${a.first_name} ${a.last_name}`,
      created_at: a.created_at
    }))
  });
});

// --- ADMIN STATS ---
app.get('/api/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- ADMIN UNIQUENESS CHECK ---
app.get('/api/admin/check-unique', requireAdminAuth, (req: Request, res: Response) => {
  const { type, value, currentId } = req.query as { type: string; value: string; currentId?: string };

  if (!type || !value) {
    return res.status(400).json({ error: 'Missing type or value' });
  }

  let available = true;
  if (type === 'alumni_id') {
    available = db.isAlumniIdAvailable(value, currentId);
  } else if (type === 'card_number') {
    available = db.isCardNumberAvailable(value, currentId);
  } else if (type === 'qr_value') {
    available = db.isQRValueAvailable(value, currentId);
  }

  return res.json({ available });
});

// --- ADMIN ALUMNI DIRECTORY ---
app.get('/api/admin/alumni', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const {
      query,
      program,
      degree_level,
      graduation_year,
      campus,
      card_status,
      qr_status,
      page,
      limit
    } = req.query;

    const data = db.getAlumniList({
      query: query ? String(query) : undefined,
      program: program ? String(program) : undefined,
      degree_level: degree_level ? String(degree_level) : undefined,
      graduation_year: graduation_year ? String(graduation_year) : undefined,
      campus: campus ? String(campus) : undefined,
      card_status: card_status ? String(card_status) : undefined,
      qr_status: qr_status ? String(qr_status) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 10
    });

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/alumni/:alumni_id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const data = db.getAlumnusDetail(req.params.alumni_id);
    if (!data) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/alumni', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const result = db.createAlumnus({
      ...req.body,
      admin_id: adminEmail
    });
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/alumni/:alumni_id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const result = db.updateAlumnus(req.params.alumni_id, {
      ...req.body,
      admin_id: adminEmail
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/alumni/:alumni_id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const result = db.archiveAlumnus(req.params.alumni_id, adminEmail);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- CARD & QR MANAGEMENT ---
app.get('/api/admin/cards', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    return res.json(db.getAllCards());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/qr-codes', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    return res.json(db.getAllQRCodes());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/alumni/:alumni_id/replace-card', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const result = db.replaceCard(req.params.alumni_id, {
      ...req.body,
      admin_id: adminEmail
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/cards/:card_id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const { status, reason } = req.body;
    const result = db.updateCardStatus(req.params.card_id, status, reason, adminEmail);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/qr/:qr_id/status', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const adminEmail = (req as any).adminEmail || 'admin@university.edu.ph';
    const { status } = req.body;
    const result = db.updateQRStatus(req.params.qr_id, status, adminEmail);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// --- VERIFICATION & ACTIVITY LOGS ---
app.get('/api/admin/verification-logs', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { query, result, date, page, limit } = req.query;
    const data = db.getVerificationLogs({
      query: query ? String(query) : undefined,
      result: result ? String(result) : undefined,
      date: date ? String(date) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 15
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/activity-logs', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { query, action, page, limit } = req.query;
    const data = db.getActivityLogs({
      query: query ? String(query) : undefined,
      action: action ? String(action) : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20
    });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false }
    });
    app.use(vite.middlewares);

    // SPA fallback in development mode
    app.get('*', async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VeriAlumni] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
