// Utilidades comunes para las funciones de /api.
export function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

export function onlyMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  send(res, 405, { error: 'Método no permitido' });
  return false;
}

// Envuelve un handler: errores con .status se devuelven tal cual, el resto como 500.
export function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      const status = e.status || 500;
      if (status === 500) console.error(e);
      send(res, status, { error: status === 500 ? 'Error inesperado. Probá de nuevo en un rato.' : e.message });
    }
  };
}

export function fail(status, message) {
  return Object.assign(new Error(message), { status });
}

export const clean = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Lista de piezas que manda el navegador: solo nos quedamos con campos conocidos.
export function cleanPiezas(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 40).map((p) => ({
    id: clean(p?.id, 80),
    n: clean(p?.n, 120),
    c: clean(p?.c, 80),
    p: Number.isFinite(+p?.p) ? Math.round(+p.p) : 0,
  })).filter((p) => p.id);
}
