import crypto from 'node:crypto';
import { sql, ensureSchema } from './db.js';
import { fail } from './http.js';

const COOKIE = 'zircon_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw fail(503, 'Falta configurar SESSION_SECRET');
  return s;
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

export function setSession(res, userId) {
  const payload = b64(JSON.stringify({ uid: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function readCookie(req) {
  const raw = req.headers.cookie || '';
  const m = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  return m ? m.slice(COOKIE.length + 1) : null;
}

export function sessionUserId(req) {
  const token = readCookie(req);
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return exp > Date.now() / 1000 ? uid : null;
  } catch { return null; }
}

// Devuelve el usuario logueado o null (las cuentas son opcionales).
export async function currentUser(req) {
  const uid = sessionUserId(req);
  if (!uid) return null;
  await ensureSchema();
  const rows = await sql`SELECT id, nombre, email, telefono, creado FROM usuarios WHERE id = ${uid}`;
  return rows[0] || null;
}

export async function requireUser(req) {
  const u = await currentUser(req);
  if (!u) throw fail(401, 'Tenés que iniciar sesión');
  return u;
}

export function isAdmin(user) {
  const list = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
  return !!user && list.includes(user.email.toLowerCase());
}

export const publicUser = (u) => u && ({ id: u.id, nombre: u.nombre, email: u.email, telefono: u.telefono, admin: isAdmin(u) });
