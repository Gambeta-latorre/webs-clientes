/* Panel del local: turnos pedidos desde la web */
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$ ' + new Intl.NumberFormat('es-AR').format(n);
  const date = (s, time) => {
    if (!s) return '';
    const d = new Date(String(s).length === 10 ? s + 'T12:00:00' : s);
    return d.toLocaleString('es-AR', time ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const ESTADOS = ['pendiente', 'confirmado', 'realizado', 'cancelado'];
  let data, filtro = 'pendiente';

  async function api(method = 'GET', body) {
    const res = await fetch('/api/admin', { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(j.error || 'Error'), { status: res.status });
    return j;
  }

  function waLink(t) {
    const tel = t.telefono.replace(/\D/g, '');
    const num = tel.startsWith('54') ? tel : '549' + tel.replace(/^0/, '').replace(/^(\d{2,4})15/, '$1');
    const msg = `¡Hola ${t.nombre.split(' ')[0]}! Te escribimos de Zircon por tu pedido de turno (${t.servicio}${t.zona ? ', ' + t.zona : ''}).`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  function render() {
    const { stats, turnos, populares } = data;
    const list = filtro === 'todos' ? turnos : turnos.filter((t) => t.estado === filtro);
    $('#app').innerHTML = `
      <h1>Turnos y actividad</h1>
      <div class="kpis">
        <div class="kpi"><b>${stats.pendientes}</b><span>Turnos pendientes</span></div>
        <div class="kpi"><b>${stats.turnos_mes}</b><span>Turnos (30 días)</span></div>
        <div class="kpi"><b>${stats.consultas_mes}</b><span>Consultas (30 días)</span></div>
        <div class="kpi"><b>${stats.usuarios}</b><span>Cuentas creadas</span></div>
      </div>
      ${populares.length ? `<p class="eyebrow dark">Lo más guardado en favoritos</p><div class="pop-list">${populares.map((p) => `<span>${esc(p.producto_id.replace(/-/g, ' '))} · ${p.veces}</span>`).join('')}</div>` : ''}
      <div class="filters">${['pendiente', 'confirmado', 'realizado', 'cancelado', 'todos'].map((f) => `<button class="subchip" data-f="${f}" aria-pressed="${f === filtro}">${f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div>
      <div class="t">${list.length ? list.map((t) => `
        <div class="tr">
          <div><h3>${esc(t.nombre)}</h3><small>Pedido ${date(t.creado, true)}</small>
            <p><a href="${waLink(t)}" target="_blank" rel="noopener">${esc(t.telefono)}</a>${t.email ? ' · ' + esc(t.email) : ''}</p></div>
          <div><p><b>${esc(t.servicio)}</b>${t.zona ? ' · ' + esc(t.zona) : ''}</p>
            <small>${t.fecha ? 'Prefiere ' + date(t.fecha) + ' · ' : ''}${esc(t.franja || '')}</small>
            ${t.piezas?.length ? `<p>Piezas: ${t.piezas.map((p) => `${esc(p.n)} (${esc(p.c)}, ${money(p.p)})`).join(', ')}</p>` : ''}
            ${t.comentario ? `<p>“${esc(t.comentario)}”</p>` : ''}</div>
          <select data-id="${t.id}" aria-label="Estado">${ESTADOS.map((e) => `<option ${e === t.estado ? 'selected' : ''}>${e}</option>`).join('')}</select>
        </div>`).join('') : '<p class="msg">No hay turnos en este estado.</p>'}</div>`;
  }

  async function load() {
    try { data = await api(); render(); }
    catch (e) {
      $('#app').innerHTML = e.status === 401
        ? '<div class="msg"><b>Iniciá sesión</b>Entrá a la web con tu cuenta (botón de usuario arriba a la derecha) y volvé a esta página.<br><br><a class="btn btn-dark btn-sm" href="./">Ir a la web</a></div>'
        : `<div class="msg"><b>Sin acceso</b>${esc(e.message)}</div>`;
    }
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]'); if (b) { filtro = b.dataset.f; render(); }
  });
  document.addEventListener('change', async (e) => {
    const s = e.target.closest('select[data-id]'); if (!s) return;
    try { data = await api('PATCH', { id: +s.dataset.id, estado: s.value }); render(); }
    catch (err) { alert(err.message); }
  });
  load();
})();
