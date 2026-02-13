import { CATALOG } from './catalog.js';
import { loadState, saveState } from './storage.js';
import { buildOrderText, buildWhatsAppUrl } from './utils/whatsapp.js';

const SELLERS = [
  { id: 'v1', label: 'Vendedor 1', phone: '+54911XXXXXXXX' },
  { id: 'v2', label: 'Vendedor 2', phone: '+54911XXXXXXXX' },
  { id: 'v3', label: 'Vendedor 3', phone: '+54911XXXXXXXX' }
];

const SYSTEM_COLORS = {
  'Hexágono Interno': '#d7263d',
  'Hexágono Externo': '#2f9e44',
  'Cono Morse': '#7048e8',
  'Monopieza': '#1098ad',
  'Monopieza Basal': '#343a40',
  'Compresivo Multiunit': '#d63384'
};

const STEP_IDS = {
  intro: 1,
  customer: 2,
  categories: 3,
  products: 4,
  cart: 5,
  checkout: 6
};

const initialState = {
  step: STEP_IDS.intro,
  customerType: '',
  customerData: {},
  cartItems: [],
  selectedSeller: '',
  selectedCategory: '',
  selectedSystem: '',
  selectedDiameter: '',
  qtyDrafts: {},
  validationErrors: {}
};

const state = {
  ...initialState,
  ...loadState()
};

const app = document.getElementById('app');

const categoryList = CATALOG.filter((cat) => ['implantes', 'componentes-analogicos', 'componentes-digitales', 'herramental'].includes(cat.key));

const persist = () => saveState(state);

const toast = (text) => {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1200);
};

const normalizeText = (value) => (value || '').trim();

const getCurrentCategory = () => categoryList.find((cat) => cat.key === state.selectedCategory);
const getCurrentSystem = () => getCurrentCategory()?.systems?.find((sys) => sys.label === state.selectedSystem);

const ensureBootStep = () => {
  if (state.step === STEP_IDS.products && !state.selectedCategory) state.step = STEP_IDS.categories;
  if (state.step === STEP_IDS.customer && !state.customerType) state.step = STEP_IDS.intro;
};

const parseImplantMap = (system) => {
  const map = {};
  const add = (diameter, length, suffix = '') => {
    const cleanDiameter = normalizeDiameter(diameter);
    const cleanLength = normalizeLength(`${length}${suffix}`);
    const item = {
      id: ['implantes', normalizeSystemKey(system.label), cleanDiameter, cleanLength].join('|'),
      categoria: 'Implantes',
      sistema: system.label,
      diametro: cleanDiameter,
      largo: cleanLength,
      cantidad: 0
    };
    map[cleanDiameter] ??= [];
    map[cleanDiameter].push(item);
  };

  const visitNode = (node, trail = []) => {
    if (node.products) {
      node.products.forEach((product) => {
        const parsed = parseDiameterAndLength(product);
        if (parsed) {
          add(parsed.diameter, parsed.length);
          return;
        }

        const diameterFromTrail = [...trail].reverse().find((part) => /^Ø\s?\d/.test(part));
        if (diameterFromTrail) {
          add(diameterFromTrail, product);
        }
      });
    }
    if (node.groups) node.groups.forEach((group) => visitNode(group, [...trail, group.label]));
  };

  visitNode(system, []);
  return map;
};

const parseDiameterAndLength = (productLabel) => {
  const match = productLabel.match(/(Ø\s?[\d.,]+)\s*x\s*(.+)/i);
  if (!match) return null;
  return {
    diameter: match[1].replace(/\s+/g, ''),
    length: match[2].trim()
  };
};

const normalizeSystemKey = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const normalizeDiameter = (value) => (value || '').replace(/\s+/g, '');
const normalizeLength = (value) => (value || '').replace(/\s+/g, '');

const getImplantProductsForUI = () => {
  const system = getCurrentSystem();
  if (!system) return { diameters: [], productsByDiameter: {} };
  const productsByDiameter = parseImplantMap(system);
  const diameters = Object.keys(productsByDiameter).sort((a, b) => parseFloat(a.replace(/[Ø,]/g, '')) - parseFloat(b.replace(/[Ø,]/g, '')));
  if (!diameters.includes(state.selectedDiameter)) state.selectedDiameter = diameters[0] || '';
  return { diameters, productsByDiameter };
};

const upsertCartItem = (item) => {
  const idx = state.cartItems.findIndex((it) => it.id === item.id);
  if (item.cantidad <= 0) {
    if (idx >= 0) state.cartItems.splice(idx, 1);
    return;
  }
  if (idx >= 0) state.cartItems[idx] = item;
  else state.cartItems.push(item);
};

const commitProductQty = (product, qty) => {
  const safeQty = Number.isFinite(qty) ? Math.max(0, qty) : 0;
  upsertCartItem({ ...product, cantidad: safeQty });
  persist();
  renderCartBadge();
};

const getDraftQty = (productId) => {
  if (Object.hasOwn(state.qtyDrafts, productId)) return Number(state.qtyDrafts[productId]) || 0;
  return Number(state.cartItems.find((item) => item.id === productId)?.cantidad || 0);
};

const validateCustomer = () => {
  const errors = {};
  const d = state.customerData;
  const req = (field, label) => {
    if (!normalizeText(d[field])) errors[field] = `${label} es obligatorio.`;
  };

  req('nombre', 'Nombre');
  req('apellido', 'Apellido');

  if (state.customerType === 'cliente') {
    req('dni', 'DNI');
  }

  if (state.customerType === 'nuevo') {
    req('localidad', 'Localidad');
    req('provincia', 'Provincia');
    req('cuil', 'CUIL');
    req('matricula', 'Matrícula profesional');
    const cuil = (d.cuil || '').replace(/\D/g, '');
    if (cuil && cuil.length !== 11) errors.cuil = 'CUIL debe tener 11 dígitos.';
  }

  state.validationErrors = errors;
  return Object.keys(errors).length === 0;
};

const goToStep = (step) => {
  state.step = step;
  persist();
  render();
};

const createField = ({ name, label, type = 'text', required = true }) => {
  const value = state.customerData[name] || '';
  const error = state.validationErrors[name] || '';
  return `
    <div class="field-wrap">
      <label for="${name}">${label}${required ? ' *' : ''}</label>
      <input id="${name}" name="${name}" type="${type}" value="${value}" autocomplete="off" />
      ${error ? `<div class="error">${error}</div>` : ''}
    </div>
  `;
};

const renderIntro = () => `
  <section class="card">
    <h1>Formulario de pedidos</h1>
    <p class="small">¿Ya sos cliente de implantes dentales?</p>
    <button class="btn" data-action="set-type" data-value="cliente">Soy cliente</button>
    <button class="btn" data-action="set-type" data-value="nuevo">Soy nuevo</button>
  </section>
`;

const renderCustomer = () => {
  const shared = [
    createField({ name: 'nombre', label: 'Nombre' }),
    createField({ name: 'apellido', label: 'Apellido' })
  ];
  const extras = state.customerType === 'cliente'
    ? [createField({ name: 'dni', label: 'DNI' })]
    : [
        createField({ name: 'localidad', label: 'Localidad' }),
        createField({ name: 'provincia', label: 'Provincia' }),
        createField({ name: 'cuil', label: 'CUIL' }),
        createField({ name: 'matricula', label: 'Matrícula profesional' })
      ];

  return `
    <section class="card">
      <h2>Datos del ${state.customerType === 'cliente' ? 'cliente' : 'profesional'}</h2>
      ${[...shared, ...extras].join('')}
    </section>
    <div class="actions">
      <button class="btn-secondary" data-action="back-step">Atrás</button>
      <button class="btn" data-action="next-customer">Siguiente</button>
      <button class="btn-secondary" data-action="save">Guardar progreso</button>
    </div>
  `;
};

const renderCategories = () => `
  <section class="card">
    <h2>Categorías</h2>
    ${categoryList.map((category) => `<button class="btn" data-action="select-category" data-value="${category.key}">${category.label}</button>`).join('')}
  </section>
  <div class="actions">
    <button class="btn-secondary" data-action="go-customer">Atrás</button>
    <button class="btn-secondary" data-action="save">Guardar progreso</button>
  </div>
`;

const renderImplantSystems = (category) => `
  <section class="card">
    <h2>Sistemas de ${category.label}</h2>
    ${category.systems.map((system) => `<button class="btn system-btn" style="--system-color:${SYSTEM_COLORS[system.label] || '#185adb'}" data-action="select-system" data-value="${system.label}">${system.label}</button>`).join('')}
  </section>
`;

const renderImplantProducts = () => {
  const { diameters, productsByDiameter } = getImplantProductsForUI();
  const currentSystem = getCurrentSystem();
  if (!currentSystem) return '';

  const systemColor = SYSTEM_COLORS[currentSystem.label] || '#185adb';
  const products = productsByDiameter[state.selectedDiameter] || [];

  return `
    <div class="breadcrumb" style="--system-color:${systemColor}">Implantes / ${currentSystem.label} / ${state.selectedDiameter || 'Sin diámetro'}</div>
    <section class="card system-card" style="--system-color:${systemColor}">
      <h2>${currentSystem.label}</h2>
      <div class="diameter-tabs">
        ${diameters.map((diameter) => `<button class="${diameter === state.selectedDiameter ? 'tab active' : 'tab'}" data-action="select-diameter" data-value="${diameter}">${diameter}</button>`).join('')}
      </div>
      <div class="product-list">
        ${products.map((product) => {
          const qty = getDraftQty(product.id);
          return `
            <article class="product" style="--system-color:${systemColor}">
              <div>
                <strong>${product.diametro} · ${product.largo}</strong>
                <div class="small">ID: ${product.id}</div>
              </div>
              <div class="qty-row">
                <button data-action="change-qty" data-id="${product.id}" data-delta="-1">-</button>
                <input type="number" min="0" data-role="product-qty" data-id="${product.id}" value="${qty}" />
                <button data-action="change-qty" data-id="${product.id}" data-delta="1">+</button>
              </div>
              <button class="btn-secondary" data-action="commit-product" data-id="${product.id}">Agregar / actualizar</button>
            </article>
          `;
        }).join('') || '<p class="small">No hay productos disponibles para este diámetro.</p>'}
      </div>
    </section>
  `;
};

const renderProducts = () => {
  const category = getCurrentCategory();
  if (!category) return '';
  const isImplants = category.key === 'implantes';

  return `
    ${isImplants ? renderImplantSystems(category) : '<section class="card"><h2>Catálogo</h2><p class="small">Esta categoría está en preparación para carga completa.</p></section>'}
    ${isImplants && state.selectedSystem ? renderImplantProducts() : ''}
    <div class="actions">
      <button class="btn-secondary" data-action="back-products">Atrás</button>
      <button class="btn" data-action="go-cart">Ir al carrito (${state.cartItems.length})</button>
      <button class="btn-secondary" data-action="save">Guardar progreso</button>
    </div>
  `;
};

const renderCart = () => {
  const bySystem = state.cartItems.reduce((acc, item) => {
    acc[item.sistema] ??= [];
    acc[item.sistema].push(item);
    return acc;
  }, {});

  return `
    <section class="card">
      <h2>Carrito</h2>
      ${Object.entries(bySystem).map(([system, items]) => `
        <div class="cart-group" style="--system-color:${SYSTEM_COLORS[system] || '#185adb'}">
          <h3>${system}</h3>
          ${items.map((item) => `
            <div class="row cart-item">
              <div>
                <strong>${item.diametro} · ${item.largo}</strong>
                <div class="small">${item.categoria}</div>
              </div>
              <input type="number" min="0" data-role="cart-qty" data-id="${item.id}" value="${item.cantidad}" />
              <button class="btn-danger" data-action="remove-item" data-id="${item.id}">Quitar</button>
            </div>
          `).join('')}
        </div>
      `).join('') || '<p class="small">Aún no agregaste productos.</p>'}
      <button class="btn-danger" data-action="clear-cart" ${state.cartItems.length ? '' : 'disabled'}>Vaciar carrito</button>
    </section>
    <div class="actions">
      <button class="btn-secondary" data-action="back-from-cart">Atrás</button>
      <button class="btn" data-action="go-checkout" ${state.cartItems.length ? '' : 'disabled'}>Finalizar pedido</button>
      <button class="btn-secondary" data-action="save">Guardar progreso</button>
    </div>
  `;
};

const renderCheckout = () => {
  const preview = buildOrderText(state);
  return `
    <section class="card">
      <h2>Finalizar pedido</h2>
      <label for="seller">Elegir vendedor</label>
      <select id="seller" data-role="seller">
        <option value="">Seleccionar...</option>
        ${SELLERS.map((seller) => `<option value="${seller.id}" ${state.selectedSeller === seller.id ? 'selected' : ''}>${seller.label} (${seller.phone})</option>`).join('')}
      </select>
      <h3>Texto para WhatsApp</h3>
      <pre>${preview}</pre>
    </section>
    <div class="actions">
      <button class="btn-secondary" data-action="back-from-checkout">Atrás</button>
      <button class="btn" data-action="send-wa" ${state.selectedSeller ? '' : 'disabled'}>Generar WhatsApp</button>
      <button class="btn-secondary" data-action="save">Guardar progreso</button>
    </div>
  `;
};

const renderCartBadge = () => {
  const badge = document.querySelector('[data-role="floating-cart"]');
  if (badge) badge.textContent = `🛒 ${state.cartItems.length}`;
};

const render = () => {
  ensureBootStep();
  let content = '';
  if (state.step === STEP_IDS.intro) content = renderIntro();
  if (state.step === STEP_IDS.customer) content = renderCustomer();
  if (state.step === STEP_IDS.categories) content = renderCategories();
  if (state.step === STEP_IDS.products) content = renderProducts();
  if (state.step === STEP_IDS.cart) content = renderCart();
  if (state.step === STEP_IDS.checkout) content = renderCheckout();

  app.innerHTML = content;

  if ([STEP_IDS.categories, STEP_IDS.products, STEP_IDS.cart].includes(state.step)) {
    app.insertAdjacentHTML('beforeend', '<button class="cart-link" data-action="go-cart" data-role="floating-cart">🛒 0</button>');
    renderCartBadge();
  }
};

app.addEventListener('input', (event) => {
  const target = event.target;

  if (target.matches('input[name]')) {
    state.customerData[target.name] = target.value;
    persist();
    return;
  }

  if (target.matches('[data-role="product-qty"]')) {
    state.qtyDrafts[target.dataset.id] = Math.max(0, Number(target.value) || 0);
    persist();
    return;
  }

  if (target.matches('[data-role="cart-qty"]')) {
    const item = state.cartItems.find((cartItem) => cartItem.id === target.dataset.id);
    if (!item) return;
    upsertCartItem({ ...item, cantidad: Math.max(0, Number(target.value) || 0) });
    persist();
    renderCartBadge();
    return;
  }

  if (target.matches('[data-role="seller"]')) {
    state.selectedSeller = target.value;
    persist();
    render();
  }
});

app.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === 'set-type') {
    state.customerType = actionEl.dataset.value;
    state.validationErrors = {};
    goToStep(STEP_IDS.customer);
    return;
  }

  if (action === 'back-step') {
    goToStep(STEP_IDS.intro);
    return;
  }

  if (action === 'next-customer') {
    if (!validateCustomer()) {
      render();
      return;
    }
    goToStep(STEP_IDS.categories);
    return;
  }

  if (action === 'go-customer') {
    goToStep(STEP_IDS.customer);
    return;
  }

  if (action === 'select-category') {
    state.selectedCategory = actionEl.dataset.value;
    state.selectedSystem = '';
    state.selectedDiameter = '';
    goToStep(STEP_IDS.products);
    return;
  }

  if (action === 'select-system') {
    state.selectedSystem = actionEl.dataset.value;
    state.selectedDiameter = '';
    persist();
    render();
    return;
  }

  if (action === 'select-diameter') {
    state.selectedDiameter = actionEl.dataset.value;
    persist();
    render();
    return;
  }

  if (action === 'change-qty' || action === 'commit-product') {
    const { productsByDiameter } = getImplantProductsForUI();
    const product = Object.values(productsByDiameter).flat().find((item) => item.id === actionEl.dataset.id);
    if (!product) return;

    const qtyInput = app.querySelector(`[data-role="product-qty"][data-id="${product.id}"]`);
    const currentQty = Number(qtyInput?.value || 0);

    if (action === 'change-qty') {
      const nextQty = Math.max(0, currentQty + Number(actionEl.dataset.delta));
      if (qtyInput) qtyInput.value = String(nextQty);
      state.qtyDrafts[product.id] = nextQty;
      persist();
      return;
    }

    commitProductQty(product, currentQty);
    state.qtyDrafts[product.id] = currentQty;
    persist();
    toast('Carrito actualizado');
    return;
  }

  if (action === 'back-products') {
    if (state.selectedSystem) {
      state.selectedSystem = '';
      state.selectedDiameter = '';
      persist();
      render();
      return;
    }
    goToStep(STEP_IDS.categories);
    return;
  }

  if (action === 'go-cart') {
    goToStep(STEP_IDS.cart);
    return;
  }

  if (action === 'back-from-cart') {
    if (state.selectedCategory) {
      goToStep(STEP_IDS.products);
      return;
    }
    goToStep(STEP_IDS.categories);
    return;
  }

  if (action === 'remove-item') {
    state.cartItems = state.cartItems.filter((item) => item.id !== actionEl.dataset.id);
    persist();
    render();
    return;
  }

  if (action === 'clear-cart') {
    state.cartItems = [];
    persist();
    render();
    return;
  }

  if (action === 'go-checkout') {
    goToStep(STEP_IDS.checkout);
    return;
  }

  if (action === 'back-from-checkout') {
    goToStep(STEP_IDS.cart);
    return;
  }

  if (action === 'send-wa') {
    const seller = SELLERS.find((s) => s.id === state.selectedSeller);
    if (!seller) return;
    window.open(buildWhatsAppUrl(seller.phone, buildOrderText(state)), '_blank');
    return;
  }

  if (action === 'save') {
    persist();
    toast('Guardado');
    return;
  }
});

if (state.step !== STEP_IDS.intro && !state.customerType) state.step = STEP_IDS.intro;
render();
