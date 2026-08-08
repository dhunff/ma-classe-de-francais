/* Lớp lưu trữ. window.storage do storageShim.js dựng (Supabase). */

async function load(key, fallback, shared = true) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function save(key, value, shared = true) {
  try { await window.storage.set(key, JSON.stringify(value), shared); return true; } catch { return false; }
}
async function del(key, shared = false) { try { await window.storage.delete(key, shared); } catch {} }


export { load, save, del };
