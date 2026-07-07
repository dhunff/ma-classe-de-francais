import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
const TABLE = 'kv_store'
const fullKey = (key, shared) => (shared ? 's:' : 'p:') + key

window.storage = {
  async get(key, shared = false) {
    const { data, error } = await supabase.from(TABLE).select('value').eq('key', fullKey(key, shared)).maybeSingle()
    if (error) throw error
    return data ? { key, value: data.value, shared } : null
  },
  async set(key, value, shared = false) {
    const { error } = await supabase.from(TABLE).upsert({ key: fullKey(key, shared), value }, { onConflict: 'key' })
    if (error) throw error
    return { key, value, shared }
  },
  async delete(key, shared = false) {
    const { error } = await supabase.from(TABLE).delete().eq('key', fullKey(key, shared))
    if (error) throw error
    return { key, deleted: true, shared }
  },
  async list(prefix = '', shared = false) {
    const { data, error } = await supabase.from(TABLE).select('key').like('key', fullKey(prefix, shared) + '%')
    if (error) throw error
    return { keys: (data || []).map(r => r.key.slice(2)), prefix, shared }
  },
}
