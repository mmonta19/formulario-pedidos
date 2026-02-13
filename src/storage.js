const STORAGE_KEY = 'pedido_formulario_v1';

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = (state) => {
  const payload = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearState = () => localStorage.removeItem(STORAGE_KEY);
export { STORAGE_KEY };
