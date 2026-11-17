-- Tablas de la web de Zircon. Las funciones de /api las crean solas la primera vez,
-- este archivo queda como referencia (o para correrlo a mano en la consola de Neon).

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  telefono      TEXT,
  password_hash TEXT NOT NULL,
  creado        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id TEXT NOT NULL,
  creado      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, producto_id)
);

CREATE TABLE IF NOT EXISTS turnos (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre      TEXT NOT NULL,
  telefono    TEXT NOT NULL,
  email       TEXT,
  servicio    TEXT NOT NULL,
  zona        TEXT,
  fecha       DATE,
  franja      TEXT,
  comentario  TEXT,
  piezas      JSONB NOT NULL DEFAULT '[]',
  estado      TEXT NOT NULL DEFAULT 'pendiente',
  creado      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultas (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  piezas      JSONB NOT NULL,
  total       INTEGER NOT NULL DEFAULT 0,
  creado      TIMESTAMPTZ NOT NULL DEFAULT now()
);
