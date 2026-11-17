import { sql, ensureSchema } from './_lib/db.js';
import { send, body, onlyMethods, handle, fail, cleanPiezas } from './_lib/http.js';
import { currentUser, requireUser } from './_lib/auth.js';

// POST: guarda la lista que se manda por WhatsApp (queda en el historial si hay cuenta).
// GET: mis consultas.
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const u = await requireUser(req);
    const rows = await sql`SELECT id, piezas, total, creado FROM consultas
      WHERE usuario_id = ${u.id} ORDER BY creado DESC LIMIT 30`;
    return send(res, 200, { consultas: rows });
  }

  await ensureSchema();
  const u = await currentUser(req);
  const piezas = cleanPiezas(body(req).piezas);
  if (!piezas.length) throw fail(400, 'La consulta está vacía');
  const total = piezas.reduce((s, p) => s + p.p, 0);
  const rows = await sql`INSERT INTO consultas (usuario_id, piezas, total)
    VALUES (${u?.id ?? null}, ${JSON.stringify(piezas)}::jsonb, ${total}) RETURNING id`;
  send(res, 201, { id: rows[0].id });
});
