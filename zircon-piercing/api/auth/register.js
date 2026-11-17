import bcrypt from 'bcryptjs';
import { sql, ensureSchema } from '../_lib/db.js';
import { send, body, onlyMethods, handle, fail, clean } from '../_lib/http.js';
import { setSession, publicUser } from '../_lib/auth.js';

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return;
  const b = body(req);
  const nombre = clean(b.nombre, 80);
  const email = clean(b.email, 160).toLowerCase();
  const telefono = clean(b.telefono, 40) || null;
  const password = typeof b.password === 'string' ? b.password : '';

  if (nombre.length < 2) throw fail(400, 'Ingresá tu nombre');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'El email no parece válido');
  if (password.length < 8) throw fail(400, 'La contraseña tiene que tener al menos 8 caracteres');
  if (password.length > 200) throw fail(400, 'La contraseña es demasiado larga');

  await ensureSchema();
  const hash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO usuarios (nombre, email, telefono, password_hash)
    VALUES (${nombre}, ${email}, ${telefono}, ${hash})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, nombre, email, telefono`;
  if (!rows.length) throw fail(409, 'Ya existe una cuenta con ese email. Probá iniciar sesión.');

  setSession(res, rows[0].id);
  send(res, 201, { user: publicUser(rows[0]) });
});
