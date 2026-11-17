import bcrypt from 'bcryptjs';
import { sql, ensureSchema } from '../_lib/db.js';
import { send, body, onlyMethods, handle, fail, clean } from '../_lib/http.js';
import { setSession, publicUser } from '../_lib/auth.js';

// Hash de relleno para que un email inexistente tarde lo mismo que uno real.
const DUMMY = bcrypt.hashSync('zircon-relleno', 10);

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return;
  const b = body(req);
  const email = clean(b.email, 160).toLowerCase();
  const password = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
  if (!email || !password) throw fail(400, 'Completá email y contraseña');

  await ensureSchema();
  const rows = await sql`SELECT id, nombre, email, telefono, password_hash FROM usuarios WHERE email = ${email}`;
  const ok = await bcrypt.compare(password, rows[0]?.password_hash || DUMMY);
  if (!rows.length || !ok) throw fail(401, 'Email o contraseña incorrectos');

  setSession(res, rows[0].id);
  send(res, 200, { user: publicUser(rows[0]) });
});
