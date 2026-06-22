import { useEffect, useState } from 'react'
import { API_BASE } from '../services/apiBase'

type Ann = { title: string; body: string; url?: string; updated_at: number }

// Admin Hub /announce endpoint'inden gelen tek aktif duyuruyu üstte ince bir
// bant olarak gösterir. Kullanıcı kapatınca o updated_at için bir daha gösterilmez.
export default function AnnounceBanner() {
  const [ann, setAnn] = useState<Ann | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE}/announce`, { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        if (!alive || !j || !j.title) return
        const seen = localStorage.getItem('hooder_ann_seen')
        if (seen && Number(seen) === j.updated_at) return
        setAnn(j)
      } catch { /* sessiz */ }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000) // 5 dk'da bir tazele
    return () => { alive = false; clearInterval(id) }
  }, [])

  if (!ann) return null

  const dismiss = () => {
    localStorage.setItem('hooder_ann_seen', String(ann.updated_at))
    setAnn(null)
  }

  return (
    <div
      style={{
        position: 'fixed', top: 'calc(env(safe-area-inset-top) + 8px)',
        left: 12, right: 12, zIndex: 4000,
        background: 'rgba(20,22,30,0.92)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14,
        padding: '10px 12px', color: '#fff', display: 'flex', gap: 10,
        alignItems: 'flex-start', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
      onClick={() => { if (ann.url) window.open(ann.url, '_blank') }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{ann.title}</div>
        {ann.body && <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>{ann.body}</div>}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)',
          fontSize: 20, lineHeight: 1, padding: 0, cursor: 'pointer',
        }}
        aria-label="kapat"
      >×</button>
    </div>
  )
}
