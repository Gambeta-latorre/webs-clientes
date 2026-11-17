import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const sql = url ? neon(url) : null;

let ready;
// Crea las tablas la primera vez que se usa la base (una vez por instancia).
export function ensureSchema() {
  if (!sql) return Promise.reject(Object.assign(new Error('Base de datos no configurada'), { status: 503 }));
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY, nombre TEXT NOT NULL, email TEXT NOT NULL UNIQUE, telefono TEXT,
      password_hash TEXT NOT NULL, creado TIMESTAMPTZ NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS favoritos (
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, producto_id TEXT NOT NULL,
      creado TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (usuario_id, producto_id))`;
    await sql`CREATE TABLE IF NOT EXISTS turnos (
      id SERIAL PRIMARY KEY, usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      nombre TEXT NOT NULL, telefono TEXT NOT NULL, email TEXT, servicio TEXT NOT NULL, zona TEXT,
      fecha DATE, franja TEXT, comentario TEXT, piezas JSONB NOT NULL DEFAULT '[]',
      estado TEXT NOT NULL DEFAULT 'pendiente', creado TIMESTAMPTZ NOT NULL DEFAULT now())`;
    await sql`CREATE TABLE IF NOT EXISTS consultas (
      id SERIAL PRIMARY KEY, usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      piezas JSONB NOT NULL, total INTEGER NOT NULL DEFAULT 0, creado TIMESTAMPTZ NOT NULL DEFAULT now())`;
  })().catch((e) => { ready = undefined; throw e; });
  return ready;
}
