import { sql } from './_lib/db.js';
import { send, body, onlyMethods, handle, fail } from './_lib/http.js';
import { requireUser, isAdmin } from './_lib/auth.js';

const ESTADOS = ['pendiente', 'confirmado', 'realizado', 'cancelado'];

// Panel del local: solo para los emails listados en ADMIN_EMAILS.
export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['GET', 'PATCH'])) return;
  const u = await requireUser(req);
  if (!isAdmin(u)) throw fail(403, 'Esta sección es solo para el equipo de Zircon');

  if (req.method === 'PATCH') {
    const { id, estado } = body(req);
    if (!Number.isInteger(id) || !ESTADOS.includes(estado)) throw fail(400, 'Datos inválidos');
    await sql`UPDATE turnos SET estado = ${estado} WHERE id = ${id}`;
  }

  const [turnos, stats, populares] = await Promise.all([
    sql`SELECT t.id, t.nombre, t.telefono, t.email, t.servicio, t.zona, to_char(t.fecha, 'YYYY-MM-DD') AS fecha, t.franja, t.comentario,
          t.piezas, t.estado, t.creado
        FROM turnos t ORDER BY (t.estado = 'pendiente') DESC, t.creado DESC LIMIT 300`,
    sql`SELECT
          (SELECT count(*)::int FROM usuarios) AS usuarios,
          (SELECT count(*)::int FROM turnos WHERE estado = 'pendiente') AS pendientes,
          (SELECT count(*)::int FROM turnos WHERE creado > now() - interval '30 days') AS turnos_mes,
          (SELECT count(*)::int FROM consultas WHERE creado > now() - interval '30 days') AS consultas_mes`,
    sql`SELECT producto_id, count(*)::int AS veces FROM favoritos GROUP BY producto_id ORDER BY veces DESC LIMIT 10`,
  ]);
  send(res, 200, { turnos, stats: stats[0], populares });
});
