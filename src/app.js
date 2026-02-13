import { CATALOG } from './catalog.js';

  customerType: '',
  customerData: {},
  cartItems: [],
  selectedSeller: '',

const toast = (text) => {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1200);
};


  persist();
  render();
};


render();
