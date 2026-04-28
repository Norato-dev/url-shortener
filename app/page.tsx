'use client'

import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'auto' | 'custom'>('auto')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShortUrl('')

    try {
      const res = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: url,
          ...(tab === 'custom' && customSlug ? { customSlug } : {}),
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Algo salió mal'); return }
      setShortUrl(data.shortUrl)
      setUrl('')
      setCustomSlug('')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0edf8' }}>

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
        <a href="/dashboard" className="text-sm px-4 py-2 rounded-lg"
          style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
          Ver mis URLs →
        </a>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col md:flex-row items-center px-6 md:px-8 py-10 md:py-0 max-w-6xl mx-auto w-full gap-10 md:gap-16">

        {/* Left: Text */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-medium mb-3" style={{ color: '#7c3aed' }}>
            // url shortener
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: '#2d1b5e' }}>
            Links cortos,<br />impacto grande.
          </h1>
          <p className="text-base md:text-lg mb-8" style={{ color: '#8b7aaa', lineHeight: 1.7 }}>
            Acorta cualquier URL en segundos.<br />
            Comparte, rastrea y analiza tus links.
          </p>

        </div>

        {/* Right: Form */}
        <div className="w-full md:max-w-md">
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(91,54,158,0.10)' }}>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ backgroundColor: '#f0edf8' }}>
              {(['auto', 'custom'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 text-sm rounded-md transition-all font-medium"
                  style={{
                    backgroundColor: tab === t ? 'white' : 'transparent',
                    color: tab === t ? '#5b369e' : '#a99bc0',
                    boxShadow: tab === t ? '0 1px 4px rgba(91,54,158,0.10)' : 'none',
                  }}>
                  {t === 'auto' ? 'Auto slug' : 'Custom slug'}
                </button>
              ))}
            </div>

            {/* URL Input */}
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5b369e' }}>
              URL original
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/url-muy-larga..."
              required
              className="w-full rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2"
              style={{ border: '1.5px solid #d4c9ee', color: '#3b1f6e', backgroundColor: '#faf8ff' }}
            />

            {/* Custom slug */}
            {tab === 'custom' && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#5b369e' }}>
                  Tu slug personalizado
                </label>
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1.5px solid #d4c9ee' }}>
                  <span className="px-3 py-2.5 text-xs shrink-0" style={{ backgroundColor: '#f0edf8', color: '#a99bc0' }}>
                    davidnorato.dev/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="mi-link"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none min-w-0"
                    style={{ color: '#3b1f6e', backgroundColor: '#faf8ff' }}
                  />
                </div>
              </div>
            )}

            {error && <p className="mb-3 text-sm" style={{ color: '#dc2626' }}>{error}</p>}

            {shortUrl && (
              <div className="mb-3 p-3 rounded-lg flex items-center justify-between gap-2" style={{ backgroundColor: '#ede9f6' }}>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium truncate hover:underline" style={{ color: '#5b369e' }}>
                  {shortUrl}
                </a>
                <button onClick={handleCopy}
                  className="text-xs px-3 py-1 rounded-md whitespace-nowrap shrink-0"
                  style={{ border: '1.5px solid #c4b5f4', color: '#5b369e', backgroundColor: 'white' }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit as any}
              disabled={loading || !url}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#7c3aed' }}>
              {loading ? 'Acortando...' : 'Acortar URL'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}