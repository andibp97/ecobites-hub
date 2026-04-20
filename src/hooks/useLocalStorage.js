export const lsGet = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
};

export const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};