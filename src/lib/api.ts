export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) {
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const data = await res.json().catch(() => null)
      const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`
      throw new Error(msg)
    }
    throw new Error(await res.text())
  }
  return res.json()
}

