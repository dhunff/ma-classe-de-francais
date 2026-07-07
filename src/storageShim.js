// Giả lập window.storage (API của Claude artifact) bằng localStorage
// để ứng dụng chạy được trên localhost / trình duyệt thật.
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key, shared = false) {
      const v = localStorage.getItem(`mcf-${shared ? 's' : 'p'}-${key}`)
      return v !== null ? { key, value: v, shared } : null
    },
    async set(key, value, shared = false) {
      localStorage.setItem(`mcf-${shared ? 's' : 'p'}-${key}`, value)
      return { key, value, shared }
    },
    async delete(key, shared = false) {
      localStorage.removeItem(`mcf-${shared ? 's' : 'p'}-${key}`)
      return { key, deleted: true, shared }
    },
    async list(prefix = '', shared = false) {
      const p = `mcf-${shared ? 's' : 'p'}-${prefix}`
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(p)) keys.push(k.slice(`mcf-${shared ? 's' : 'p'}-`.length))
      }
      return { keys, prefix, shared }
    },
  }
}
