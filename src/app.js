import { CATALOG } from './catalog.js';
import { clearState, loadState, saveState } from './storage.js';
import { buildOrderText, buildWhatsAppUrl } from './utils/whatsapp.js';

const SELLERS = [
  { id: 'v1', label: 'Vendedor 1', phone: '+54911XXXXXXXX' },
  { id: 'v2', label: 'Vendedor 2', phone: '+54911XXXXXXXX' },
  { id: 'v3', label: 'Vendedor 3', phone: '+54911XXXXXXXX' }
];

const initialState = {
  step: 1,
  customerType: '',
  customerData: {},
  cartItems: [],
  selectedSeller: '',
  navPath: [],
  catalogSearch: '',
  qtyDrafts: {}
};

let state = { ...initialState };
const saved = loadState();
let showResume = !!saved;
const app = document.getElementById('app');

const persist = () => saveState(state);
const toast = (text) => {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1200);
};

const dispatch = (type, payload = {}) => {
  switch (type) {
    case 'LOAD': state = { ...state, ...payload }; break;
    case 'SET_STEP': state.step = payload; break;
    case 'SET_TYPE': state.customerType = payload; break;
    case 'SET_DATA': state.customerData = { ...state.customerData, ...payload }; break;
    case 'SET_PATH': state.navPath = payload; state.catalogSearch = ''; break;
    case 'SET_SEARCH': state.catalogSearch = payload; break;
    case 'SET_QTY': state.qtyDrafts[payload.id] = payload.qty; break;
    case 'SET_SELLER': state.selectedSeller = payload; break;
    case 'ADD_CART': {
      const item = payload;
      const idx = state.cartItems.findIndex((x) => x.id === item.id);
      if (item.cantidad <= 0) {
        if (idx >= 0) state.cartItems.splice(idx, 1);
      } else if (idx >= 0) {
        state.cartItems[idx] = item;
      } else state.cartItems.push(item);
      break;
    }
    case 'UPDATE_CART_QTY': {
      const it = state.cartItems.find((x) => x.id === payload.id);
      if (it) it.cantidad = payload.qty;
      state.cartItems = state.cartItems.filter((x) => x.cantidad > 0);
      break;
    }
    case 'CLEAR_CART': state.cartItems = []; break;
  }
  persist();
  render();
};

const field = (name, label, value, error = '', type = 'text') => `
  <label>${label}</label>
  <input type="${type}" name="${name}" value="${value || ''}" />
  ${error ? `<div class="error">${error}</div>` : ''}
`;

function validateCustomer() {
  const e = {};
  const d = state.customerData;
  const req = (k, l) => { if (!d[k]?.trim()) e[k] = `${l} es obligatorio.`; };
  req('nombre', 'Nombre'); req('apellido', 'Apellido');
  if (state.customerType === 'cliente') req('dni', 'DNI');
  if (state.customerType === 'nuevo') {
    req('localidad', 'Localidad'); req('provincia', 'Provincia'); req('cuit', 'CUIT/CUIL'); req('matricula', 'Matrícula profesional');
    const norm = (d.cuit || '').replace(/\D/g, '');
    if (norm && ![10, 11].includes(norm.length)) e.cuit = 'CUIT/CUIL debe tener 10 u 11 dígitos.';
  }
  return e;
}

function flattenProducts(node, categoryLabel, systemLabel, trail = []) {
  const rows = [];
  if (node.products) {
    node.products.forEach((name) => {
      const subgrupo = trail.join(' > ');
      const id = [categoryLabel, systemLabel, subgrupo, name].filter(Boolean).join('|');
      rows.push({ id, categoria: categoryLabel, sistema: systemLabel, subgrupo, nombre: name });
    });
  }
  if (node.groups) node.groups.forEach((g) => rows.push(...flattenProducts(g, categoryLabel, systemLabel, [...trail, g.label])));
  return rows;
}

function getCurrentNode() {
  if (!state.navPath.length) return null;
  let node = CATALOG.find((c) => c.key === state.navPath[0]);
  for (let i = 1; i < state.navPath.length; i += 1) {
    const label = state.navPath[i];
    const pool = [...(node?.systems || []), ...(node?.groups || [])];
    node = pool.find((x) => x.label === label);
  }
  return node;
}

function topButtons() {
  return `<button class="btn-secondary" data-action="go-cart">Carrito (${state.cartItems.length})</button>`;
}

function render() {
  if (showResume) {
    app.innerHTML = `<div class="modal"><div class="card"><h2>Pedido guardado</h2><p>¿Querés continuar el pedido existente?</p>
      <button class="btn" data-action="resume">Continuar pedido</button>
      <button class="btn-secondary" data-action="new">Empezar nuevo</button>
    </div></div>`;
    bind(); return;
  }
  if (state.step === 1) {
    app.innerHTML = `<div class="card"><h1>¿Ya sos cliente?</h1>
      <button class="btn" data-action="type" data-value="cliente">Soy cliente</button>
      <button class="btn" data-action="type" data-value="nuevo">Soy nuevo</button>
    </div>`;
  }
  if (state.step === 2) {
    const errors = state.validationErrors || {};
    const d = state.customerData;
    const extra = state.customerType === 'cliente'
      ? field('dni', 'DNI *', d.dni, errors.dni)
      : [field('localidad', 'Localidad *', d.localidad, errors.localidad), field('provincia', 'Provincia *', d.provincia, errors.provincia), field('cuit', 'CUIT/CUIL *', d.cuit, errors.cuit), field('matricula', 'Matrícula profesional *', d.matricula, errors.matricula)].join('');
    app.innerHTML = `<div class="card"><h2>Datos del cliente</h2>
      ${field('nombre', 'Nombre *', d.nombre, errors.nombre)}
      ${field('apellido', 'Apellido *', d.apellido, errors.apellido)}
      ${extra}
    </div>
    <div class="actions"><button class="btn-secondary" data-action="back">Atrás</button><button class="btn" data-action="next-customer">Siguiente</button><button class="btn-secondary" data-action="save">Guardar</button></div>`;
  }
  if (state.step === 3) {
    app.innerHTML = `<div class="card"><h2>Categorías</h2>
      <button class="btn" data-action="open-cat" data-value="implantes">Implantes</button>
      <button class="btn" data-action="open-cat" data-value="componentes-analogicos">Componentes protésicos analógicos</button>
      <button class="btn" data-action="open-cat" data-value="componentes-digitales">Componentes digitales</button>
      <button class="btn" data-action="open-cat" data-value="herramental">Instrumental</button>
    </div><div class="actions"><button class="btn-secondary" data-action="back">Atrás</button><button class="btn" data-action="go-checkout">Finalizar pedido</button><button class="btn-secondary" data-action="save">Guardar</button></div>`;
  }
  if (state.step === 4) {
    const node = getCurrentNode();
    const breadcrumb = state.navPath.map((x) => CATALOG.find((c) => c.key === x)?.label || x).join(' > ');
    if (!node) { dispatch('SET_STEP', 3); return; }
    let body = '';
    if (node.key === 'componentes-digitales') body = '<div class="card"><h3>Próximamente</h3><p>Esta categoría está preparada para completarse luego.</p></div>';
    else if (node.systems || node.groups) {
      const children = [...(node.systems || []), ...(node.groups || [])];
      body = `<div class="card">${children.map((child) => `<button class="btn" data-action="push-path" data-value="${child.label}">${child.label}</button>`).join('')}</div>`;
    }
    if (node.products) {
      const rootCat = CATALOG.find((c) => c.key === state.navPath[0]);
      const system = state.navPath[1] || node.label;
      const list = flattenProducts(node, rootCat.label, system, []).filter((p) => `${p.subgrupo} ${p.nombre}`.toLowerCase().includes(state.catalogSearch.toLowerCase()));
      body = `<div class="card"><input placeholder="Buscar en esta lista" value="${state.catalogSearch}" data-role="search" />${list.map((p) => {
        const inCart = state.cartItems.find((x) => x.id === p.id);
        const qty = state.qtyDrafts[p.id] ?? inCart?.cantidad ?? 0;
        return `<div class="product"><div><strong>${p.nombre}</strong></div><div class="small">${[p.categoria,p.sistema,p.subgrupo].filter(Boolean).join(' > ')}</div>
          <div class="qty"><button data-action="qty-minus" data-id="${p.id}">-</button><input type="number" min="0" value="${qty}" data-role="qty" data-id="${p.id}" /><button data-action="qty-plus" data-id="${p.id}">+</button></div>
          <button class="btn-secondary" data-action="add-item" data-id="${p.id}">Agregar/Actualizar</button></div>`;
      }).join('') || '<p>Sin resultados.</p>'}</div>`;
    }
    app.innerHTML = `<div class="breadcrumb">${breadcrumb}</div>${topButtons()}${body}<div class="actions"><button class="btn-secondary" data-action="nav-back">Atrás</button><button class="btn-secondary" data-action="save">Guardar</button></div>`;
  }
  if (state.step === 5) {
    const grouped = {};
    state.cartItems.forEach((item) => {
      grouped[item.categoria] ??= {};
      grouped[item.categoria][item.sistema] ??= [];
      grouped[item.categoria][item.sistema].push(item);
    });
    app.innerHTML = `<div class="card"><h2>Carrito</h2>${Object.entries(grouped).map(([cat, systems]) => `<h3>${cat}</h3>${Object.entries(systems).map(([sys, items]) => `<div class="small">${sys}</div>${items.map((it) => `<div class="row"><span>${it.subgrupo ? `${it.subgrupo} - ` : ''}${it.nombre}</span><input type="number" min="0" value="${it.cantidad}" data-role="cart-qty" data-id="${it.id}" /></div>`).join('')}`).join('')}`).join('') || '<p>Carrito vacío.</p>'}
    <button class="btn-danger" data-action="clear-cart">Vaciar carrito</button></div>
    <div class="actions"><button class="btn-secondary" data-action="cart-back">Atrás</button><button class="btn" data-action="go-checkout" ${state.cartItems.length ? '' : 'disabled'}>Finalizar pedido</button><button class="btn-secondary" data-action="save">Guardar</button></div>`;
  }
  if (state.step === 6) {
    const text = buildOrderText(state);
    app.innerHTML = `<div class="card"><h2>Elegí vendedor</h2>${SELLERS.map((s) => `<label class="row"><input type="radio" name="seller" value="${s.id}" ${state.selectedSeller === s.id ? 'checked' : ''}/> ${s.label} – WhatsApp: ${s.phone}</label>`).join('')}
      <h3>Previsualización</h3><pre>${text}</pre></div>
      <div class="actions"><button class="btn-secondary" data-action="back-to-cart">Atrás</button><button class="btn" data-action="send-wa" ${state.selectedSeller ? '' : 'disabled'}>Enviar por WhatsApp</button><button class="btn-secondary" data-action="save">Guardar</button></div>`;
  }
  if ([3,4].includes(state.step)) app.innerHTML += `<button class="cart-link" data-action="go-cart">🛒 ${state.cartItems.length}</button>`;
  bind();
}

function bind() {
  app.querySelectorAll('[data-action="resume"]').forEach((el) => el.onclick = () => { state = { ...state, ...saved, step: saved.step || 3 }; showResume = false; render(); });
  app.querySelectorAll('[data-action="new"]').forEach((el) => el.onclick = () => {
    if (confirm('¿Seguro que querés borrar el pedido guardado y empezar de cero?')) { clearState(); state = { ...initialState }; showResume = false; render(); }
  });
  app.querySelectorAll('[data-action="type"]').forEach((el) => el.onclick = () => dispatch('SET_TYPE', el.dataset.value) || dispatch('SET_STEP', 2));
  app.querySelectorAll('input[name], input[data-role="cart-qty"]').forEach((el) => el.oninput = () => {
    if (el.dataset.role === 'cart-qty') dispatch('UPDATE_CART_QTY', { id: el.dataset.id, qty: Number(el.value) || 0 });
    else dispatch('SET_DATA', { [el.name]: el.value });
  });
  app.querySelectorAll('[data-action="back"]').forEach((el) => el.onclick = () => dispatch('SET_STEP', state.step - 1));
  app.querySelectorAll('[data-action="next-customer"]').forEach((el) => el.onclick = () => {
    const errs = validateCustomer();
    state.validationErrors = errs;
    if (Object.keys(errs).length) return render();
    dispatch('SET_STEP', 3);
  });
  app.querySelectorAll('[data-action="open-cat"]').forEach((el) => el.onclick = () => dispatch('SET_PATH', [el.dataset.value]) || dispatch('SET_STEP', 4));
  app.querySelectorAll('[data-action="push-path"]').forEach((el) => el.onclick = () => dispatch('SET_PATH', [...state.navPath, el.dataset.value]));
  app.querySelectorAll('[data-action="nav-back"]').forEach((el) => el.onclick = () => {
    if (state.navPath.length <= 1) dispatch('SET_STEP', 3);
    else dispatch('SET_PATH', state.navPath.slice(0, -1));
  });
  app.querySelectorAll('[data-action="go-cart"]').forEach((el) => el.onclick = () => dispatch('SET_STEP', 5));
  app.querySelectorAll('[data-action="cart-back"]').forEach((el) => el.onclick = () => dispatch('SET_STEP', 3));
  app.querySelectorAll('[data-action="back-to-cart"]').forEach((el) => el.onclick = () => dispatch('SET_STEP', 5));
  app.querySelectorAll('[data-action="go-checkout"]').forEach((el) => el.onclick = () => dispatch('SET_STEP', 6));
  app.querySelectorAll('[data-action="clear-cart"]').forEach((el) => el.onclick = () => confirm('¿Vaciar carrito completo?') && dispatch('CLEAR_CART'));
  app.querySelectorAll('[data-action="save"]').forEach((el) => el.onclick = () => { persist(); toast('Guardado'); });
  app.querySelectorAll('[data-role="search"]').forEach((el) => el.oninput = () => dispatch('SET_SEARCH', el.value));
  app.querySelectorAll('[data-action="qty-plus"]').forEach((el) => el.onclick = () => dispatch('SET_QTY', { id: el.dataset.id, qty: Number(state.qtyDrafts[el.dataset.id] || 0) + 1 }));
  app.querySelectorAll('[data-action="qty-minus"]').forEach((el) => el.onclick = () => dispatch('SET_QTY', { id: el.dataset.id, qty: Math.max(0, Number(state.qtyDrafts[el.dataset.id] || 0) - 1) }));
  app.querySelectorAll('[data-role="qty"]').forEach((el) => el.oninput = () => dispatch('SET_QTY', { id: el.dataset.id, qty: Math.max(0, Number(el.value) || 0) }));
  app.querySelectorAll('[data-action="add-item"]').forEach((el) => el.onclick = () => {
    const node = getCurrentNode();
    const cat = CATALOG.find((c) => c.key === state.navPath[0]);
    const all = flattenProducts(node, cat.label, state.navPath[1] || node.label, []);
    const base = all.find((p) => p.id === el.dataset.id);
    if (!base) return;
    dispatch('ADD_CART', { ...base, cantidad: Number(state.qtyDrafts[base.id] || 0) });
    toast('Carrito actualizado');
  });
  app.querySelectorAll('input[name="seller"]').forEach((el) => el.onchange = () => dispatch('SET_SELLER', el.value));
  app.querySelectorAll('[data-action="send-wa"]').forEach((el) => el.onclick = () => {
    const seller = SELLERS.find((s) => s.id === state.selectedSeller);
    window.open(buildWhatsAppUrl(seller.phone, buildOrderText(state)), '_blank');
  });
}

render();
