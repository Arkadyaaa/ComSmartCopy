// Shared constants and utilities for Learning Materials components

export const COLORS = {
  brand: '#5585b5',
  brandHover: '#5585b5',
  dark: '#222',
  text: '#222',
  textMuted: '#555',
  card: '#fff',
  divider: '#e0e0e0',
};

// Storage helpers (web localStorage fallback)
export const loadStorage = (key, defaultValue) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    }
  } catch (_) {}
  return defaultValue;
};

export const saveStorage = (key, value) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (_) {}
};

