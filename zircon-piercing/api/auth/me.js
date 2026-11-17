import { sql } from '../_lib/db.js';
import { send, body, onlyMethods, handle, fail, clean } from '../_lib/http.js';
import { currentUser, requireUser, publicUser } from '../_lib/auth.js';

// GET: quién está logueado (user: null si nadie). PATCH: actualizar nombre/teléfono.
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'PATCH'])) return;
  if (req.method === 'GET') {
    let user = null;
    try { user = await currentUser(req); } catch (e) { if (e.status !== 503) throw e; }
    return send(res, 200, { user: publicUser(user) });
  }
  const u = await requireUser(req);
  const b = body(req);
  const nombre = clean(b.nombre, 80) || u.nombre;
  const telefono = b.telefono === undefined ? u.telefono : (clean(b.telefono, 40) || null);
  if (nombre.length < 2) throw fail(400, 'Ingresá tu nombre');
  const rows = await sql`UPDATE usuarios SET nombre = ${nombre}, telefono = ${telefono} WHERE id = ${u.id}
    RETURNING id, nombre, email, telefono`;
  send(res, 200, { user: publicUser(rows[0]) });
});
