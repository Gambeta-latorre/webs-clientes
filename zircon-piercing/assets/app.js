/* Zircon · catálogo, favoritos, consulta, cuentas y turnos */
(() => {
  'use strict';

  const WA_NUMBER = '5491150559609';
  const PAGE = 24;
  const LS_FAVS = 'zircon_favs';
  const LS_BAG = 'zircon_bag';

  const SECTIONS = [
    { id: 'tops', nombre: 'Tops y labrets', intro: 'Tops de rosca interna en titanio grado implante, con su base labret. Para lóbulo, cartílago, nostril y labio.' },
    { id: 'argollas', nombre: 'Argollas y clickers', intro: 'Clickers con bisagra, captive bead y retainers. Ideales para septum, daith, hélix, rook y lóbulo.' },
    { id: 'oro', nombre: 'Oro 14K', intro: 'Oro sólido de 14K, no bañado: tops, push pin, clickers, cadenas y gemas, con pin de titanio donde corresponde.' },
    { id: 'barbells', nombre: 'Barbells e industrial', intro: 'Barbells rectos, curvos y circulares, nipple e industrial, con conectores y accesorios frontales.' },
    { id: 'navel', nombre: 'Ombligo', intro: 'Bananas y navels de titanio, desde los básicos hasta los floating con piedras.' },
    { id: 'nostril', nombre: 'Nostril', intro: 'Nostrils y nose rings para aleta nasal, en titanio y oro 14K.' },
    { id: 'push-pin', nombre: 'Push pin', intro: 'Sistema a presión, sin rosca: el pin queda firme dentro de la base y es muy fácil de cambiar.' },
    { id: 'microdermal', nombre: 'Microdermal', intro: 'Tops para microdermal con base de anclaje, en titanio grado implante.' },
    { id: 'cadenas', nombre: 'Cadenas', intro: 'Cadenas de titanio y oro para unir perforaciones.' },
    { id: 'hangings', nombre: 'Hangings', intro: 'Pesos colgantes para lóbulo dilatado, en alpaca y bronce, con piedras naturales.' },
    { id: 'accesorios', nombre: 'Accesorios y cuidado', intro: 'Discos de silicona, loción para el cuidado, almohada para dormir sin presionar y piezas especiales.' },
  ];
  const SUB_ORDER = ['Brillos y cristales', 'Ópalos y color', 'Metal liso', 'Colgantes y cadenas'];

  const ZONES = [
    { nombre: 'Lóbulo', heal: '6 a 8 semanas', desc: 'El clásico y el más amable para empezar. Admite tops, argollas y hasta varias perforaciones en línea.', links: [['Tops', 'tops'], ['Argollas', 'argollas']] },
    { nombre: 'Hélix', heal: '6 a 12 meses', desc: 'Borde superior del cartílago. Se empieza con top y labret; la argolla llega cuando cicatriza.', links: [['Tops', 'tops'], ['Clickers', 'argollas']] },
    { nombre: 'Tragus', heal: '6 a 12 meses', desc: 'El cartílago que cubre la entrada del oído. Un top chico con brillo es el favorito.', links: [['Tops con brillo', 'tops', 'Brillos y cristales']] },
    { nombre: 'Conch', heal: '6 a 12 meses', desc: 'El centro de la oreja: lugar ideal para tops grandes, clusters y diseños llamativos.', links: [['Tops', 'tops'], ['Oro 14K', 'oro']] },
    { nombre: 'Daith', heal: '6 a 12 meses', desc: 'El pliegue interno sobre el canal auditivo. Se usa argolla o clicker.', links: [['Clickers', 'argollas']] },
    { nombre: 'Rook', heal: '6 a 12 meses', desc: 'El pliegue superior interno. Va con barbell curvo o clicker chico.', links: [['Barbells', 'barbells'], ['Clickers', 'argollas']] },
    { nombre: 'Industrial', heal: '6 a 12 meses', desc: 'Dos perforaciones en el cartílago unidas por una barra.', links: [['Industrial', 'barbells', 'Industrial']] },
    { nombre: 'Nostril', heal: '4 a 6 meses', desc: 'Aleta de la nariz. Se empieza con top o nostril y después se puede pasar a argolla.', links: [['Nostril', 'nostril'], ['Tops', 'tops']] },
    { nombre: 'Septum', heal: '2 a 3 meses', desc: 'Atraviesa la zona blanda entre las fosas nasales. Clickers y argollas de todo estilo.', links: [['Clickers', 'argollas', 'Clickers']] },
    { nombre: 'Labio', heal: '2 a 3 meses', desc: 'Medusa, monroe o labret: siempre con top y base plana para cuidar dientes y encías.', links: [['Tops', 'tops'], ['Push pin', 'push-pin']] },
    { nombre: 'Ombligo', heal: '6 a 12 meses', desc: 'Bananas y navels con piedras o colgantes, a medida de tu anatomía.', links: [['Ombligo', 'navel']] },
    { nombre: 'Pezón', heal: '6 a 12 meses', desc: 'Barbells rectos con esferas, discos o accesorios frontales.', links: [['Nipple', 'barbells', 'Nipple']] },
    { nombre: 'Microdermal', heal: '1 a 3 meses', desc: 'Una sola perforación con base de anclaje bajo la piel: el top queda “flotando”.', links: [['Microdermal', 'microdermal']] },
  ];

  // ---------- utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = new Intl.NumberFormat('es-AR');
  const money = (n) => '$ ' + fmt.format(n);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const img = (p) => `img/p/${p.id}.webp`;
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const openWa = (text) => window.open(waLink(text), '_blank', 'noopener');
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  };
  const dateAR = (s) => {
    if (!s) return '';
    const d = new Date(String(s).length === 10 ? s + 'T12:00:00' : s);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  let toastTimer;
  function toast(msg, ic = 'i-check') {
    const t = $('#toast');
    t.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  async function api(path, { method = 'GET', body, keepalive } = {}) {
    const res = await fetch('/api/' + path, {
      method, credentials: 'same-origin', keepalive,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch { /* sin cuerpo */ }
    if (!res.ok) throw Object.assign(new Error(data.error || 'No pudimos conectar con el servidor. Probá de nuevo.'), { status: res.status });
    return data;
  }

  // ---------- estado ----------
  const state = {
    items: [], byId: new Map(),
    section: 'todo', sub: '', q: '', sort: 'cat', shown: PAGE,
    favs: new Set(store.get(LS_FAVS, [])),
    bag: store.get(LS_BAG, []),
    user: null,
  };

  // ---------- catálogo ----------
  async function loadCatalog() {
    const res = await fetch('data/catalogo.json');
    state.items = (await res.json()).map((p, i) => ({ ...p, i, key: norm(`${p.n} ${p.c} ${p.sub} ${p.d}`) }));
    state.items.forEach((p) => state.byId.set(p.id, p));
    state.bag = state.bag.filter((id) => state.byId.has(id));
    const st = $('[data-stat="piezas"]');
    if (st) st.textContent = state.items.length;
  }

  function sectionItems(sec) {
    if (sec === 'todo') return state.items;
    if (sec === 'favoritos') return state.items.filter((p) => state.favs.has(p.id));
    return state.items.filter((p) => p.s === sec);
  }

  function renderChips() {
    const chips = [{ id: 'todo', nombre: 'Todo' }, ...SECTIONS];
    if (state.favs.size) chips.push({ id: 'favoritos', nombre: 'Mis favoritos', fav: true });
    $('#sections').innerHTML = chips.map((c) => `
      <button class="chip" role="tab" data-sec="${c.id}" aria-selected="${state.section === c.id}">
        ${c.fav ? icon('i-heart-f') : ''}${esc(c.nombre)} <small>${sectionItems(c.id).length}</small>
      </button>`).join('');
  }

  function renderIntro() {
    const s = SECTIONS.find((x) => x.id === state.section);
    const intro = $('#sectionIntro');
    if (s) intro.innerHTML = `<b>${esc(s.nombre)}</b>${esc(s.intro)}`;
    else if (state.section === 'favoritos') intro.innerHTML = `<b>Mis favoritos</b>${state.user ? 'Guardados en tu cuenta.' : 'Guardados en este navegador. Creá una cuenta para tenerlos en cualquier dispositivo.'}`;
    else intro.innerHTML = '<b>Todo el catálogo</b>Recorré todas las piezas o elegí una sección.';

    const subs = [...new Set(sectionItems(state.section).map((p) => p.sub).filter(Boolean))];
    subs.sort((a, b) => (SUB_ORDER.indexOf(a) + 1 || 99) - (SUB_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
    const box = $('#subs');
    if (state.section === 'todo' || state.section === 'favoritos' || subs.length < 2) { box.innerHTML = ''; return; }
    box.innerHTML = [['', 'Todas'], ...subs.map((s) => [s, s])]
      .map(([v, l]) => `<button class="subchip" data-sub="${esc(v)}" aria-pressed="${state.sub === v}">${esc(l)}</button>`).join('');
  }

  function filtered() {
    let list = sectionItems(state.section);
    if (state.sub) list = list.filter((p) => p.sub === state.sub);
    if (state.q) {
      const words = norm(state.q).split(/\s+/).filter(Boolean);
      list = list.filter((p) => words.every((w) => p.key.includes(w)));
    }
    const sorters = { asc: (a, b) => a.p - b.p, desc: (a, b) => b.p - a.p, az: (a, b) => a.n.localeCompare(b.n, 'es'), cat: (a, b) => a.i - b.i };
    return [...list].sort(sorters[state.sort] || sorters.cat);
  }

  function cardHTML(p, idx) {
    const fav = state.favs.has(p.id), inBag = state.bag.includes(p.id);
    const label = p.sub || SECTIONS.find((s) => s.id === p.s)?.nombre || '';
    return `<article class="card" style="animation-delay:${Math.min(idx % PAGE, 12) * 30}ms">
      <button class="card-img" data-open="${p.id}" aria-label="Ver ${esc(p.n)}"><img src="${img(p)}" alt="${esc(p.n)}" loading="lazy" width="355" height="195"></button>
      <div class="card-body">
        <p class="card-sub">${esc(label)}</p>
        <h3><button data-open="${p.id}">${esc(p.n)}</button></h3>
        <p class="code">${esc(p.c)}</p>
        <div class="card-foot">
          <span class="price"><small>Precio de lista</small>${money(p.p)}</span>
          <button class="mini fav ${fav ? 'on' : ''}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${fav ? 'Quitar de' : 'Agregar a'} favoritos">${icon(fav ? 'i-heart-f' : 'i-heart')}</button>
          <button class="mini add ${inBag ? 'on' : ''}" data-bag="${p.id}" aria-pressed="${inBag}" aria-label="${inBag ? 'Quitar de' : 'Agregar a'} mi consulta">${icon(inBag ? 'i-check' : 'i-plus')}</button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = filtered();
    const grid = $('#grid');
    if (!list.length) {
      grid.innerHTML = state.section === 'favoritos' && !state.q
        ? `<div class="empty"><b>Todavía no hay favoritos</b>Tocá el ${icon('i-heart')} de cualquier joya para guardarla acá.</div>`
        : `<div class="empty"><b>No encontramos piezas</b>Probá con otra palabra, otro código o mirá todo el catálogo.<br><br><button class="btn btn-outline btn-sm" data-reset>Ver todo</button></div>`;
    } else {
      grid.innerHTML = list.slice(0, state.shown).map(cardHTML).join('');
    }
    $('#results').textContent = list.length ? `${list.length} ${list.length === 1 ? 'pieza' : 'piezas'}${state.q ? ` para “${state.q}”` : ''}` : '';
    const more = $('#more');
    more.hidden = list.length <= state.shown;
    more.textContent = `Ver más piezas (${list.length - state.shown})`;
  }

  function renderCatalog() { renderChips(); renderIntro(); renderGrid(); }

  function goSection(sec, sub = '', scroll = true) {
    state.section = sec; state.sub = sub; state.shown = PAGE;
    if (scroll) { state.q = ''; $('#q').value = ''; }
    renderCatalog();
    const chip = $(`.chip[data-sec="${sec}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (scroll) $('#catalogo').scrollIntoView({ behavior: 'smooth' });
  }

  // ---------- favoritos y consulta ----------
  function updateCounts() {
    const set = (k, n) => {
      const b = $(`[data-count="${k}"]`);
      if (+b.textContent !== n && n) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      b.textContent = n; b.hidden = !n;
    };
    set('favs', state.favs.size);
    set('bag', state.bag.length);
  }

  function syncButtons(id) {
    const fav = state.favs.has(id), inBag = state.bag.includes(id);
    $$(`[data-fav="${id}"]`).forEach((b) => {
      b.classList.toggle('on', fav); b.setAttribute('aria-pressed', fav);
      if (b.classList.contains('mini')) b.innerHTML = icon(fav ? 'i-heart-f' : 'i-heart');
      else b.innerHTML = `${icon(fav ? 'i-heart-f' : 'i-heart')} ${fav ? 'En favoritos' : 'Guardar'}`;
    });
    $$(`[data-bag="${id}"]`).forEach((b) => {
      b.classList.toggle('on', inBag); b.setAttribute('aria-pressed', inBag);
      if (b.classList.contains('mini')) b.innerHTML = icon(inBag ? 'i-check' : 'i-plus');
      else b.innerHTML = `${icon(inBag ? 'i-check' : 'i-bag')} ${inBag ? 'En tu consulta' : 'Sumar a consulta'}`;
    });
  }

  function toggleFav(id) {
    const p = state.byId.get(id); if (!p) return;
    const on = !state.favs.has(id);
    on ? state.favs.add(id) : state.favs.delete(id);
    store.set(LS_FAVS, [...state.favs]);
    syncButtons(id); updateCounts(); renderChips();
    if (state.section === 'favoritos') renderGrid();
    toast(on ? `${p.n} guardado en favoritos` : 'Quitado de favoritos', on ? 'i-heart-f' : 'i-check');
    if (state.user) {
      api('favoritos', { method: on ? 'POST' : 'DELETE', body: { id } }).catch(() => toast('No pudimos guardar el favorito en tu cuenta', 'i-close'));
    }
  }

  function toggleBag(id) {
    const p = state.byId.get(id); if (!p) return;
    const on = !state.bag.includes(id);
    state.bag = on ? [...state.bag, id] : state.bag.filter((x) => x !== id);
    store.set(LS_BAG, state.bag);
    syncButtons(id); updateCounts(); renderBookingPieces();
    if ($('#drawer').classList.contains('open')) renderDrawer();
    toast(on ? `${p.n} sumado a tu consulta` : 'Quitado de tu consulta', on ? 'i-bag' : 'i-check');
  }

  function bagItems() { return state.bag.map((id) => state.byId.get(id)).filter(Boolean); }
  const piezasPayload = () => bagItems().map(({ id, n, c, p }) => ({ id, n, c, p }));

  function renderDrawer() {
    const items = bagItems();
    const body = $('#drawerBody'), foot = $('#drawerFoot');
    if (!items.length) {
      body.innerHTML = `<div class="drawer-empty">${icon('i-bag')}<b>Tu consulta está vacía</b>Sumá piezas con el botón ${icon('i-plus')} y mandanos la lista por WhatsApp para consultar stock, medidas y colocación.</div>`;
      foot.innerHTML = `<button class="btn btn-outline btn-block" data-close-drawer data-goto="catalogo">Ir al catálogo</button>`;
      return;
    }
    body.innerHTML = items.map((p) => `
      <div class="line">
        <img src="${img(p)}" alt="" loading="lazy">
        <div><b>${esc(p.n)}</b><small>${esc(p.c)}</small><div class="lp">${money(p.p)}</div></div>
        <button class="icon-btn" data-bag-remove="${p.id}" aria-label="Quitar ${esc(p.n)}">${icon('i-trash')}</button>
      </div>`).join('');
    const total = items.reduce((s, p) => s + p.p, 0);
    foot.innerHTML = `
      <div class="total"><span>Total estimado</span><b>${money(total)}</b></div>
      <p class="drawer-note">Precio de las piezas. La colocación y el downsize se cotizan aparte.</p>
      <button class="btn btn-gold btn-block" data-send-bag>${icon('i-wa')} Enviar consulta por WhatsApp</button>
      <button class="btn btn-outline btn-block" data-close-drawer data-goto="turnos">Pedir turno con estas piezas</button>
      <button class="link-btn" data-clear-bag>Vaciar consulta</button>`;
  }

  function sendBag() {
    const items = bagItems(); if (!items.length) return;
    const total = items.reduce((s, p) => s + p.p, 0);
    const lines = items.map((p) => `• ${p.n} (${p.c}) — ${money(p.p)}`).join('\n');
    const who = state.user ? `\n\nSoy ${state.user.nombre}.` : '';
    openWa(`¡Hola Zircon! Quiero consultar por estas piezas:\n\n${lines}\n\nTotal estimado: ${money(total)}${who}`);
    api('consultas', { method: 'POST', body: { piezas: piezasPayload() }, keepalive: true }).catch(() => {});
  }

  let lastFocus;
  function openDrawer() {
    lastFocus = document.activeElement;
    renderDrawer();
    $('#scrim').hidden = false;
    const d = $('#drawer');
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => d.querySelector('button')?.focus(), 50);
  }
  function closeDrawer() {
    const d = $('#drawer');
    if (!d.classList.contains('open')) return;
    d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
    $('#scrim').hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  // ---------- modal de producto ----------
  function openProduct(id, push = true) {
    const p = state.byId.get(id); if (!p) return;
    const sec = SECTIONS.find((s) => s.id === p.s);
    const fav = state.favs.has(p.id), inBag = state.bag.includes(p.id);
    const desc = p.d.replace(/Colou?r(es)?:.*$/i, '').trim();
    const rel = state.items.filter((x) => x.id !== p.id && x.s === p.s && x.sub === p.sub)
      .sort((a, b) => Math.abs(a.i - p.i) - Math.abs(b.i - p.i)).slice(0, 4);
    $('#pmBody').innerHTML = `
      <div class="pm-img"><img src="${img(p)}" alt="${esc(p.n)}" width="355" height="195"></div>
      <div class="pm-info">
        <p class="pm-crumb">${esc(sec?.nombre || '')}${p.sub ? ' · ' + esc(p.sub) : ''}</p>
        <h2 id="pmTitle">${esc(p.n)}</h2>
        <p class="pm-code">Código ${esc(p.c)}</p>
        ${desc ? `<p class="pm-desc">${esc(desc)}</p>` : ''}
        ${p.col ? `<p class="pm-colors"><b>Colores:</b> ${esc(p.col)}</p>` : ''}
        <p class="pm-price"><small>Precio de lista</small>${money(p.p)}</p>
        <p class="pm-note">Valor de la pieza. Si querés perforarte, la colocación y el downsize se suman aparte.</p>
        <div class="pm-actions">
          <a class="btn btn-gold" href="${waLink(`¡Hola Zircon! Quería consultar por ${p.n} (código ${p.c}, ${money(p.p)}).`)}" target="_blank" rel="noopener">${icon('i-wa')} Consultar por WhatsApp</a>
          <div class="pm-actions-row">
            <button class="btn btn-outline btn-sm ${inBag ? 'on' : ''}" data-bag="${p.id}">${icon(inBag ? 'i-check' : 'i-bag')} ${inBag ? 'En tu consulta' : 'Sumar a consulta'}</button>
            <button class="btn btn-outline btn-sm ${fav ? 'on' : ''}" data-fav="${p.id}">${icon(fav ? 'i-heart-f' : 'i-heart')} ${fav ? 'En favoritos' : 'Guardar'}</button>
          </div>
        </div>
      </div>
      ${rel.length ? `<div class="pm-related"><h3>También te puede gustar</h3><div class="pm-rel">
        ${rel.map((r) => `<button data-open="${r.id}"><img src="${img(r)}" alt="" loading="lazy"><span>${esc(r.n)}<br><b>${money(r.p)}</b></span></button>`).join('')}
      </div></div>` : ''}`;
    const m = $('#productModal');
    if (!m.open) m.showModal();
    m.scrollTop = 0;
    if (push) history.replaceState(null, '', `#pieza=${encodeURIComponent(p.id)}`);
  }

  // ---------- cuentas ----------
  function setUser(u) {
    state.user = u;
    const av = $('.account-btn .avatar');
    av.hidden = !u;
    av.textContent = u ? u.nombre.trim()[0].toUpperCase() : '';
    $('.account-btn').setAttribute('aria-label', u ? `Mi cuenta (${u.nombre})` : 'Ingresar o crear cuenta');
    prefillBooking();
  }

  async function mergeFavsWithServer() {
    try {
      const { ids } = await api('favoritos', { method: 'POST', body: { ids: [...state.favs] } });
      state.favs = new Set(ids);
      store.set(LS_FAVS, ids);
      updateCounts(); renderCatalog();
    } catch { /* se reintenta en la próxima carga */ }
  }

  async function checkSession() {
    try {
      const { user } = await api('auth/me');
      if (user) { setUser(user); await mergeFavsWithServer(); }
    } catch { /* sitio sin API (vista previa estática) */ }
  }

  const PERKS = `<div class="acc-perks">
    <div>${icon('i-heart')} Tus favoritos en cualquier dispositivo</div>
    <div>${icon('i-check')} El estado de tus pedidos de turno</div>
    <div>${icon('i-bag')} El historial de consultas que nos mandaste</div>
  </div>`;

  function renderAuth(tab = 'login') {
    $('#accountBody').innerHTML = `<div class="acc">
      <h2>${tab === 'login' ? 'Hola de nuevo' : 'Creá tu cuenta'}</h2>
      <p class="acc-sub">La cuenta es opcional: podés ver el catálogo, consultar y pedir turno sin registrarte.</p>
      <div class="tabs" role="tablist">
        <button role="tab" data-tab="login" aria-selected="${tab === 'login'}">Ingresar</button>
        <button role="tab" data-tab="register" aria-selected="${tab === 'register'}">Crear cuenta</button>
      </div>
      <form id="authForm" data-mode="${tab}" novalidate>
        ${tab === 'register' ? `<label class="field"><span>Nombre</span><input name="nombre" autocomplete="name" required maxlength="80"></label>` : ''}
        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" required maxlength="160"></label>
        ${tab === 'register' ? `<label class="field"><span>WhatsApp <i>(opcional)</i></span><input name="telefono" type="tel" autocomplete="tel" maxlength="40"></label>` : ''}
        <label class="field"><span>Contraseña</span><input name="password" type="password" autocomplete="${tab === 'login' ? 'current-password' : 'new-password'}" required minlength="${tab === 'login' ? 1 : 8}" maxlength="200" ${tab === 'register' ? 'placeholder="Mínimo 8 caracteres"' : ''}></label>
        <p class="acc-msg" id="authMsg" role="alert"></p>
        <button class="btn btn-dark btn-block" type="submit">${tab === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
      </form>
      ${tab === 'login' ? `<p class="acc-sub" style="margin:16px 0 0;font-size:12.5px">¿Te olvidaste la contraseña? <a href="${waLink('Hola Zircon, olvidé la contraseña de mi cuenta en la web.')}" target="_blank" rel="noopener">Escribinos</a> y te ayudamos.</p>` : ''}
      ${PERKS}
    </div>`;
    setTimeout(() => $('#authForm input')?.focus(), 30);
  }

  async function renderProfile() {
    const u = state.user;
    $('#accountBody').innerHTML = `<div class="acc">
      <div class="acc-head">
        <div class="acc-avatar">${esc(u.nombre.trim()[0].toUpperCase())}</div>
        <div><h2>Hola, ${esc(u.nombre.split(' ')[0])}</h2><p>${esc(u.email)}</p></div>
      </div>
      <div class="acc-stats">
        <button data-acc="favs"><b>${state.favs.size}</b><span>Favoritos</span></button>
        <button data-acc="bag"><b>${state.bag.length}</b><span>En consulta</span></button>
        <button data-acc="turno"><b>${icon('i-plus')}</b><span>Pedir turno</span></button>
      </div>
      <div class="acc-section"><h3>Mis turnos</h3><div class="acc-list" id="accTurnos"><p class="acc-empty">Cargando…</p></div></div>
      <div class="acc-section"><h3>Mis consultas</h3><div class="acc-list" id="accConsultas"><p class="acc-empty">Cargando…</p></div></div>
      <div class="acc-section"><h3>Mis datos</h3>
        <form id="profileForm" class="acc-list" novalidate>
          <div class="field-row">
            <label class="field"><span>Nombre</span><input name="nombre" value="${esc(u.nombre)}" maxlength="80"></label>
            <label class="field"><span>WhatsApp</span><input name="telefono" type="tel" value="${esc(u.telefono || '')}" maxlength="40"></label>
          </div>
          <button class="btn btn-outline btn-sm" type="submit">Guardar cambios</button>
        </form>
      </div>
      <div class="acc-foot">
        ${u.admin ? '<a class="btn btn-dark btn-sm" href="admin.html">Panel del local</a>' : '<span></span>'}
        <button class="link-btn" data-logout>Cerrar sesión</button>
      </div>
    </div>`;
    try {
      const [{ turnos }, { consultas }] = await Promise.all([api('turnos'), api('consultas')]);
      $('#accTurnos').innerHTML = turnos.length ? turnos.map((t) => `
        <div class="acc-row"><div class="acc-row-top"><b>${esc(t.servicio)}${t.zona ? ' · ' + esc(t.zona) : ''}</b><span class="pill ${esc(t.estado)}">${esc(t.estado)}</span></div>
        <small>${t.fecha ? 'Para el ' + dateAR(t.fecha) + ' · ' : ''}${esc(t.franja || '')} · pedido el ${dateAR(t.creado)}</small></div>`).join('')
        : '<p class="acc-empty">Todavía no pediste turnos.</p>';
      $('#accConsultas').innerHTML = consultas.length ? consultas.map((c) => `
        <div class="acc-row"><div class="acc-row-top"><b>${c.piezas.length} ${c.piezas.length === 1 ? 'pieza' : 'piezas'} · ${money(c.total)}</b><small>${dateAR(c.creado)}</small></div>
        <small>${c.piezas.map((p) => esc(p.n)).join(', ')}</small></div>`).join('')
        : '<p class="acc-empty">Cuando mandes una consulta por WhatsApp va a quedar acá.</p>';
    } catch {
      $('#accTurnos').innerHTML = $('#accConsultas').innerHTML = '<p class="acc-empty">No pudimos cargar esta información ahora.</p>';
    }
  }

  function openAccount(tab) {
    state.user ? renderProfile() : renderAuth(tab);
    const m = $('#accountModal');
    if (!m.open) m.showModal();
  }

  async function submitAuth(form) {
    const mode = form.dataset.mode;
    const data = Object.fromEntries(new FormData(form));
    const msg = $('#authMsg');
    msg.className = 'acc-msg'; msg.textContent = '';
    if (mode === 'register' && (data.password || '').length < 8) { msg.className = 'acc-msg err'; msg.textContent = 'La contraseña tiene que tener al menos 8 caracteres.'; return; }
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const { user } = await api(mode === 'login' ? 'auth/login' : 'auth/register', { method: 'POST', body: data });
      setUser(user);
      await mergeFavsWithServer();
      toast(mode === 'login' ? `¡Hola, ${user.nombre.split(' ')[0]}!` : '¡Listo! Tu cuenta está creada');
      renderProfile();
    } catch (e) {
      msg.className = 'acc-msg err'; msg.textContent = e.message;
    } finally { btn.disabled = false; }
  }

  // ---------- turnos ----------
  function prefillBooking() {
    const f = $('#bookingForm'); if (!f || !state.user) return;
    if (!f.nombre.value) f.nombre.value = state.user.nombre || '';
    if (!f.telefono.value) f.telefono.value = state.user.telefono || '';
  }

  function renderBookingPieces() {
    const box = $('#bookingPieces');
    const items = bagItems();
    box.hidden = !items.length;
    box.innerHTML = items.length ? `<b>Piezas de tu consulta:</b> ${items.map((p) => esc(p.n)).join(', ')}. Las sumamos al pedido.` : '';
  }

  function setupBooking() {
    const f = $('#bookingForm');
    $('#zonaSelect').insertAdjacentHTML('beforeend', ZONES.map((z) => `<option>${esc(z.nombre)}</option>`).join('') + '<option>Otra</option>');
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    $('#fecha').min = today.toISOString().slice(0, 10);
    renderBookingPieces();

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const note = $('#bookingNote');
      let bad = false;
      [['nombre', (d.nombre || '').trim().length >= 2], ['telefono', (d.telefono || '').replace(/\D/g, '').length >= 8]].forEach(([k, ok]) => {
        f[k].setAttribute('aria-invalid', !ok); if (!ok) bad = true;
      });
      if (bad) { note.className = 'form-note err'; note.textContent = 'Revisá tu nombre y un teléfono de contacto.'; f.querySelector('[aria-invalid=true]').focus(); return; }

      const piezas = piezasPayload();
      const lines = [
        '¡Hola Zircon! Quiero pedir un turno.',
        '',
        `• Nombre: ${d.nombre.trim()}`,
        `• Teléfono: ${d.telefono.trim()}`,
        `• Servicio: ${d.servicio}`,
        d.zona ? `• Zona: ${d.zona}` : null,
        d.fecha ? `• Fecha preferida: ${dateAR(d.fecha)}` : null,
        `• Horario: ${d.franja}`,
        piezas.length ? `• Piezas: ${piezas.map((p) => `${p.n} (${p.c})`).join(', ')}` : null,
        d.comentario?.trim() ? `• Comentario: ${d.comentario.trim()}` : null,
      ].filter((l) => l !== null);
      openWa(lines.join('\n'));

      note.className = 'form-note'; note.textContent = 'Enviando…';
      api('turnos', { method: 'POST', body: { ...d, piezas }, keepalive: true })
        .then(() => {
          note.className = 'form-note ok';
          note.textContent = state.user ? '¡Pedido registrado! Lo vas a ver en “Mi cuenta”. Te confirmamos por WhatsApp.' : '¡Pedido registrado! Te confirmamos por WhatsApp.';
          toast('Pedido de turno enviado');
        })
        .catch(() => { note.className = 'form-note'; note.textContent = 'Te abrimos WhatsApp con el pedido: envialo y te confirmamos por ahí.'; });
    });
  }

  // ---------- secciones estáticas ----------
  function renderZones() {
    $('#zones').innerHTML = ZONES.map((z) => `
      <article class="zone reveal">
        <div class="zone-top"><h3>${esc(z.nombre)}</h3><span class="zone-heal">${esc(z.heal)}</span></div>
        <p>${esc(z.desc)}</p>
        <div class="zone-links">${z.links.map(([l, s, sub]) => `<button data-go="${s}" data-sub="${esc(sub || '')}">${esc(l)} →</button>`).join('')}</div>
      </article>`).join('');
  }

  function renderCare() {
    const pick = ['LBL', 'ADE-2020', 'MSG-125'].map((c) => state.items.find((p) => p.c === c)).filter(Boolean);
    $('#careItems').innerHTML = pick.map((p) => `
      <button class="care-item" data-open="${p.id}"><img src="${img(p)}" alt="" loading="lazy"><span><b>${esc(p.n)}</b><small>${money(p.p)}</small></span></button>`).join('')
      + `<button class="btn btn-ghost-light btn-sm" data-go="accesorios" style="margin-top:6px">Ver accesorios</button>`;
  }

  function setupReveal() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el) => io.observe(el));

    const links = $$('.nav a');
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });
  }

  // ---------- eventos ----------
  function closeNav() { $('#nav').classList.remove('open'); $('.nav-toggle').setAttribute('aria-expanded', 'false'); }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('button, a'); if (!t) {
        if (e.target.matches('dialog')) e.target.close();
        return;
      }
      const d = t.dataset;
      if (d.open) { e.preventDefault(); openProduct(d.open); return; }
      if (d.fav) { toggleFav(d.fav); return; }
      if (d.bag) { toggleBag(d.bag); return; }
      if (d.bagRemove) { toggleBag(d.bagRemove); return; }
      if (d.sec) { goSection(d.sec, '', false); return; }
      if (d.sub !== undefined && t.classList.contains('subchip')) { state.sub = d.sub; state.shown = PAGE; renderIntro(); renderGrid(); return; }
      if (d.go) { e.preventDefault(); $('#productModal').close(); goSection(d.go, d.sub || ''); return; }
      if (d.reset !== undefined) { state.q = ''; $('#q').value = ''; goSection('todo', '', false); return; }
      if (d.close !== undefined) { t.closest('dialog').close(); return; }
      if (d.closeDrawer !== undefined) { closeDrawer(); if (d.goto) $('#' + d.goto).scrollIntoView({ behavior: 'smooth' }); return; }
      if (d.sendBag !== undefined) { sendBag(); return; }
      if (d.clearBag !== undefined) { const ids = state.bag; state.bag = []; store.set(LS_BAG, []); ids.forEach(syncButtons); updateCounts(); renderDrawer(); renderBookingPieces(); return; }
      if (d.tab) { renderAuth(d.tab); return; }
      if (d.logout !== undefined) {
        api('auth/logout', { method: 'POST' }).finally(() => { setUser(null); $('#accountModal').close(); toast('Sesión cerrada'); });
        return;
      }
      if (d.acc) {
        $('#accountModal').close();
        if (d.acc === 'favs') goSection('favoritos');
        else if (d.acc === 'bag') openDrawer();
        else $('#turnos').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      switch (d.action) {
        case 'search': $('#catalogo').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#q').focus({ preventScroll: true }), 450); return;
        case 'favs':
          if (!state.favs.size) { toast('Tocá el corazón de una joya para guardarla', 'i-heart'); goSection('todo'); }
          else goSection('favoritos');
          return;
        case 'bag': openDrawer(); return;
        case 'account': openAccount(); return;
      }
      if (t.classList.contains('nav-toggle')) {
        const open = $('#nav').classList.toggle('open');
        t.setAttribute('aria-expanded', open); return;
      }
      if (t.closest('#nav')) closeNav();
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'authForm') { e.preventDefault(); submitAuth(e.target); }
      if (e.target.id === 'profileForm') {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target));
        api('auth/me', { method: 'PATCH', body }).then(({ user }) => { setUser(user); toast('Datos guardados'); renderProfile(); })
          .catch((err) => toast(err.message, 'i-close'));
      }
    });

    let qTimer;
    $('#q').addEventListener('input', (e) => {
      clearTimeout(qTimer);
      qTimer = setTimeout(() => {
        state.q = e.target.value.trim(); state.shown = PAGE;
        if (state.q && state.section !== 'todo' && !filtered().length) { state.section = 'todo'; state.sub = ''; renderChips(); renderIntro(); }
        renderGrid();
      }, 160);
    });
    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; state.shown = PAGE; renderGrid(); });
    $('#more').addEventListener('click', () => { state.shown += PAGE * 2; renderGrid(); });

    $('#scrim').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeNav(); } });
    $('#productModal').addEventListener('close', () => {
      if (location.hash.startsWith('#pieza=')) history.replaceState(null, '', location.pathname + location.search);
    });

    const header = $('.header');
    const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    addEventListener('hashchange', () => {
      const m = location.hash.match(/^#pieza=(.+)$/);
      if (m) openProduct(decodeURIComponent(m[1]), false);
    });
  }

  // ---------- inicio ----------
  async function init() {
    $('#year').textContent = new Date().getFullYear();
    renderZones();
    setupReveal();
    bindEvents();
    setupBooking();
    updateCounts();
    try {
      await loadCatalog();
    } catch {
      $('#grid').innerHTML = '<div class="empty"><b>No pudimos cargar el catálogo</b>Recargá la página o escribinos por WhatsApp.</div>';
      return;
    }
    renderCatalog();
    renderCare();
    renderBookingPieces();
    updateCounts();
    const m = location.hash.match(/^#pieza=(.+)$/);
    if (m) openProduct(decodeURIComponent(m[1]), false);
    checkSession();
  }

  init();
})();
