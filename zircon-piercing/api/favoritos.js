import { sql } from './_lib/db.js';
import { send, body, onlyMethods, handle, clean } from './_lib/http.js';
import { requireUser } from './_lib/auth.js';

// GET: ids favoritos. POST {ids:[]}: suma varios (al iniciar sesión se fusionan los del navegador).
// DELETE {id}: quita uno.
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'POST', 'DELETE'])) return;
  const u = await requireUser(req);
  const b = body(req);

  if (req.method === 'POST') {
    const ids = [...new Set((Array.isArray(b.ids) ? b.ids : [b.id]).map((x) => clean(x, 80)).filter(Boolean))].slice(0, 400);
    if (ids.length) {
      await sql`INSERT INTO favoritos (usuario_id, producto_id)
        SELECT ${u.id}, unnest(${ids}::text[]) ON CONFLICT DO NOTHING`;
    }
  } else if (req.method === 'DELETE') {
    const id = clean(b.id || req.query?.id, 80);
    if (id) await sql`DELETE FROM favoritos WHERE usuario_id = ${u.id} AND producto_id = ${id}`;
  }

  const rows = await sql`SELECT producto_id FROM favoritos WHERE usuario_id = ${u.id} ORDER BY creado DESC`;
  send(res, 200, { ids: rows.map((r) => r.producto_id) });
});
