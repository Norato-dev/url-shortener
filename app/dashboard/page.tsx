'use client'

import { useState, useEffect } from 'react'

interface UrlItem {
  id: number
  slug: string
  originalUrl: string
  createdAt: string
  isActive: boolean
  analytics: {
    totalClicks: number
    lastClickAt: string | null
  } | null
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  async function fetchUrls() {
    try {
      const res = await fetch('/api/urls')
      const data = await res.json()
      setUrls(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(slug: string) {
    setDeletingSlug(slug)
    try {
      await fetch(`/api/urls/${slug}`, { method: 'DELETE' })
      setUrls((prev) => prev.filter((u) => u.slug !== slug))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingSlug(null)
    }
  }

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  useEffect(() => { fetchUrls() }, [])

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0edf8' }}>

      {/* Dot pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #c4b5f4 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: 0.35,
      }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5">
        <span style={{
          fontFamily: 'var(--font-space-mono), monospace',
          color: '#7c3aed', fontSize: '14px', letterSpacing: '.02em',
        }}>
          // davidnorato.dev
        </span>
        <a href="/" className="text-sm px-4 py-2 rounded-lg"
          style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
          ← Crear link
        </a>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 py-6">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1" style={{ color: '#7c3aed' }}>// mis links</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#2d1b5e' }}>Dashboard</h1>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Total links', value: urls.length },
            { label: 'Total clicks', value: urls.reduce((acc, u) => acc + (u.analytics?.totalClicks || 0), 0) },
            { label: 'Links activos', value: urls.filter(u => u.isActive).length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 md:p-5"
              style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
              <p className="text-xs mb-1" style={{ color: '#a99bc0' }}>{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: '#2d1b5e' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* URL List - Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium border-b"
            style={{ color: '#a99bc0', borderColor: '#ede9f6', backgroundColor: '#faf8ff' }}>
            <span className="col-span-4">URL original</span>
            <span className="col-span-3">Link corto</span>
            <span className="col-span-2 text-center">Clicks</span>
            <span className="col-span-2 text-center">Creado</span>
            <span className="col-span-1"></span>
          </div>

          {loading && (
            <div className="py-16 text-center" style={{ color: '#a99bc0' }}>Cargando...</div>
          )}

          {!loading && urls.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium mb-1" style={{ color: '#5b369e' }}>No tienes links aún</p>
              <a href="/" className="text-sm underline" style={{ color: '#a99bc0' }}>Crea tu primer link</a>
            </div>
          )}

          {urls.map((url) => (
            <div key={url.id}
              className="grid grid-cols-12 px-6 py-4 items-center border-b last:border-b-0 hover:bg-purple-50 transition-colors"
              style={{ borderColor: '#ede9f6' }}>
              <div className="col-span-4 pr-4">
                <a href={url.originalUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm truncate block hover:underline" style={{ color: '#3b1f6e' }}
                  title={url.originalUrl}>
                  {url.originalUrl}
                </a>
              </div>
              <div className="col-span-3 pr-4">
                <div className="flex items-center gap-2">
                  <a href={`/${url.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline truncate" style={{ color: '#7c3aed' }}>
                    /{url.slug}
                  </a>
                  <button onClick={() => handleCopy(url.slug)}
                    className="text-xs px-2 py-0.5 rounded shrink-0 transition-colors"
                    style={{
                      border: `1px solid ${copiedSlug === url.slug ? '#a78bfa' : '#d4c9ee'}`,
                      color: copiedSlug === url.slug ? '#7c3aed' : '#a99bc0',
                      backgroundColor: copiedSlug === url.slug ? '#ede9f6' : 'transparent',
                    }}>
                    {copiedSlug === url.slug ? '✓ copiado' : 'copiar'}
                  </button>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <a href={`/analytics/${url.slug}`} className="hover:underline">
                  <span className="text-sm font-semibold" style={{ color: '#5b369e' }}>
                    {url.analytics?.totalClicks || 0}
                  </span>
                  <span className="text-xs ml-1" style={{ color: '#a99bc0' }}>clicks</span>
                </a>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-xs" style={{ color: '#a99bc0' }}>
                  {new Date(url.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => handleDelete(url.slug)}
                  disabled={deletingSlug === url.slug}
                  className="text-xs px-2 py-1 rounded transition-colors disabled:opacity-40"
                  style={{ color: '#dc2626', border: '1px solid #fecaca' }}>
                  {deletingSlug === url.slug ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* URL List - Mobile cards */}
        <div className="md:hidden flex flex-col gap-3">
          {loading && (
            <div className="text-center py-10" style={{ color: '#a99bc0' }}>Cargando...</div>
          )}

          {!loading && urls.length === 0 && (
            <div className="text-center py-10">
              <p className="font-medium mb-1" style={{ color: '#5b369e' }}>No tienes links aún</p>
              <a href="/" className="text-sm underline" style={{ color: '#a99bc0' }}>Crea tu primer link</a>
            </div>
          )}

          {urls.map((url) => (
            <div key={url.id} className="bg-white rounded-xl p-4"
              style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>

              {/* Original URL */}
              <a href={url.originalUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm block truncate mb-2 hover:underline" style={{ color: '#3b1f6e' }}>
                {url.originalUrl}
              </a>

              {/* Short URL + copy */}
              <div className="flex items-center justify-between mb-3">
                <a href={`/${url.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline" style={{ color: '#7c3aed' }}>
                  /{url.slug}
                </a>
                <button onClick={() => handleCopy(url.slug)}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    border: `1px solid ${copiedSlug === url.slug ? '#a78bfa' : '#d4c9ee'}`,
                    color: copiedSlug === url.slug ? '#7c3aed' : '#a99bc0',
                    backgroundColor: copiedSlug === url.slug ? '#ede9f6' : 'transparent',
                  }}>
                  {copiedSlug === url.slug ? '✓ copiado' : 'copiar'}
                </button>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid #ede9f6' }}>
                <a href={`/analytics/${url.slug}`} className="flex items-center gap-1 hover:underline">
                  <span className="text-sm font-semibold" style={{ color: '#5b369e' }}>
                    {url.analytics?.totalClicks || 0}
                  </span>
                  <span className="text-xs" style={{ color: '#a99bc0' }}>clicks</span>
                </a>
                <span className="text-xs" style={{ color: '#a99bc0' }}>
                  {new Date(url.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </span>
                <button onClick={() => handleDelete(url.slug)}
                  disabled={deletingSlug === url.slug}
                  className="text-xs px-2 py-1 rounded disabled:opacity-40"
                  style={{ color: '#dc2626', border: '1px solid #fecaca' }}>
                  {deletingSlug === url.slug ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}