import { sql, ensureSchema } from './_lib/db.js';
import { send, body, onlyMethods, handle, fail, clean, cleanPiezas } from './_lib/http.js';
import { currentUser, requireUser } from './_lib/auth.js';

const SERVICIOS = ['Perforación', 'Cambio de joya', 'Downsize', 'Control / consulta'];
const FRANJAS = ['Mañana', 'Tarde', 'Indistinto'];

// POST: pedir turno (con o sin cuenta). GET: mis turnos (con cuenta).
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'POST'])) return;

  if (req.method === 'GET') {
    const u = await requireUser(req);
    const rows = await sql`SELECT id, servicio, zona, to_char(fecha, 'YYYY-MM-DD') AS fecha, franja, comentario, piezas, estado, creado
      FROM turnos WHERE usuario_id = ${u.id} ORDER BY creado DESC LIMIT 50`;
    return send(res, 200, { turnos: rows });
  }

  await ensureSchema();
  const u = await currentUser(req);
  const b = body(req);
  const nombre = clean(b.nombre, 80) || u?.nombre || '';
  const telefono = clean(b.telefono, 40) || u?.telefono || '';
  const servicio = SERVICIOS.includes(b.servicio) ? b.servicio : null;
  const zona = clean(b.zona, 60) || null;
  const franja = FRANJAS.includes(b.franja) ? b.franja : 'Indistinto';
  const comentario = clean(b.comentario, 600) || null;
  const piezas = cleanPiezas(b.piezas);
  let fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || '') ? b.fecha : null;
  if (fecha && fecha < new Date(Date.now() - 864e5).toISOString().slice(0, 10)) fecha = null;

  if (nombre.length < 2) throw fail(400, 'Ingresá tu nombre');
  if (telefono.replace(/\D/g, '').length < 8) throw fail(400, 'Ingresá un teléfono válido');
  if (!servicio) throw fail(400, 'Elegí qué servicio necesitás');

  const rows = await sql`INSERT INTO turnos
      (usuario_id, nombre, telefono, email, servicio, zona, fecha, franja, comentario, piezas)
    VALUES (${u?.id ?? null}, ${nombre}, ${telefono}, ${u?.email ?? null}, ${servicio}, ${zona},
      ${fecha}, ${franja}, ${comentario}, ${JSON.stringify(piezas)}::jsonb)
    RETURNING id, creado`;
  send(res, 201, { turno: rows[0] });
});
