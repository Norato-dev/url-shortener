'use client'

import { useState, useEffect } from 'react'

interface Analytics {
  slug: string
  originalUrl: string
  createdAt: string
  analytics: {
    totalClicks: number
    lastClickAt: string | null
  }
  byCountry: { country: string; _count: { country: number } }[]
  byDevice: { deviceType: string; _count: { deviceType: number } }[]
  recentClicks: { timestamp: string; deviceType: string | null; country: string | null }[]
}

const COUNTRY_FLAGS: Record<string, string> = {
  CO: '🇨🇴', US: '🇺🇸', MX: '🇲🇽', AR: '🇦🇷', ES: '🇪🇸',
  BR: '🇧🇷', CL: '🇨🇱', PE: '🇵🇪', VE: '🇻🇪', EC: '🇪🇨',
  Local: '🏠',
}

const COUNTRY_NAMES: Record<string, string> = {
  CO: 'Colombia', US: 'Estados Unidos', MX: 'México', AR: 'Argentina',
  ES: 'España', BR: 'Brasil', CL: 'Chile', PE: 'Perú', VE: 'Venezuela',
  EC: 'Ecuador', Local: 'Local',
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: '#7c3aed',
  desktop: '#a78bfa',
  tablet: '#c4b5f4',
}

export default function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    params.then(({ slug }) => {
      fetch(`/api/analytics/${slug}`)
        .then(res => res.json())
        .then(d => { setData(d); setLoading(false) })
    })
  }, [params])

  async function handleCopy() {
    if (!data) return
    await navigator.clipboard.writeText(`${window.location.origin}/${data.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: data?.recentClicks.filter(c => new Date(c.timestamp).getHours() === i).length || 0,
  }))
  const maxHourly = Math.max(...hourlyData.map(h => h.count), 1)
  const totalClicks = data?.analytics?.totalClicks || 0
  const deviceData = data?.byDevice || []
  const countryData = data?.byCountry || []
  const maxCountry = Math.max(...countryData.map(c => c._count.country), 1)

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
        <span style={{ fontFamily: 'var(--font-space-mono), monospace', color: '#7c3aed', fontSize: '14px', letterSpacing: '.02em' }}>
          // davidnorato.dev
        </span>
        <a href="/dashboard" className="text-sm px-4 py-2 rounded-lg"
          style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
          ← Dashboard
        </a>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 py-6">

        {loading ? (
          <div className="text-center py-20" style={{ color: '#a99bc0' }}>Cargando analytics...</div>
        ) : !data ? (
          <div className="text-center py-20" style={{ color: '#a99bc0' }}>No se encontró el link</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <span className="inline-block text-xs px-3 py-1 rounded-full mb-2"
                  style={{ backgroundColor: '#ede9f6', color: '#7c3aed' }}>
                  analytics
                </span>
                <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#2d1b5e' }}>/{data.slug}</h1>
                <a href={data.originalUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm hover:underline block truncate" style={{ color: '#a99bc0', maxWidth: '400px' }}>
                  {data.originalUrl}
                </a>
              </div>
              <button onClick={handleCopy}
                className="text-sm px-4 py-2 rounded-lg self-start"
                style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
                {copied ? '✓ Copiado' : 'Copiar link'}
              </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              {[
                { icon: '🔗', value: totalClicks, label: 'Total clicks', bg: '#ede9f6' },
                { icon: '👥', value: data.recentClicks.length, label: 'Registros', bg: '#dcfce7' },
                { icon: '📱', value: `${Math.round((deviceData.find(d => d.deviceType === 'mobile')?._count.deviceType || 0) / Math.max(totalClicks, 1) * 100)}%`, label: 'Desde móvil', bg: '#fce7f3' },
                { icon: '🌍', value: countryData.length, label: 'Países', bg: '#dbeafe' },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl p-4 md:p-5"
                  style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.07)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3"
                    style={{ backgroundColor: m.bg }}>
                    {m.icon}
                  </div>
                  <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: '#2d1b5e' }}>{m.value}</div>
                  <div className="text-xs" style={{ color: '#a99bc0' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Hourly chart + devices */}
            <div className="flex flex-col md:grid md:gap-4 gap-3 mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>

              {/* Hourly */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.07)' }}>
                <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#5b369e' }}>
                  Clicks por hora del día
                </p>
                <div className="flex items-end gap-0.5 md:gap-1" style={{ height: '80px' }}>
                  {hourlyData.map(({ hour, count }) => (
                    <div key={hour} className="flex-1 flex flex-col items-center">
                      <div className="w-full rounded-t" style={{
                        height: `${Math.round((count / maxHourly) * 70) + 4}px`,
                        backgroundColor: hour >= 8 && hour <= 18 ? '#7c3aed' : '#ede9f6',
                        minHeight: '4px',
                      }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {['0h', '6h', '12h', '18h', '23h'].map(l => (
                    <span key={l} style={{ fontSize: '10px', color: '#c4b5f4' }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.07)' }}>
                <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#5b369e' }}>
                  Dispositivos
                </p>
                <div className="flex flex-col gap-3">
                  {deviceData.length === 0 ? (
                    <p className="text-xs" style={{ color: '#a99bc0' }}>Sin datos aún</p>
                  ) : deviceData.map((d) => (
                    <div key={d.deviceType} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: DEVICE_COLORS[d.deviceType || 'desktop'] || '#c4b5f4' }} />
                      <span className="text-xs capitalize flex-1" style={{ color: '#5b369e' }}>
                        {d.deviceType || 'desktop'}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#ede9f6' }}>
                        <div className="h-1.5 rounded-full" style={{
                          width: `${Math.round((d._count.deviceType / Math.max(totalClicks, 1)) * 100)}%`,
                          backgroundColor: DEVICE_COLORS[d.deviceType || 'desktop'] || '#c4b5f4',
                        }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#2d1b5e' }}>
                        {d._count.deviceType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Countries + Recent clicks */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">

              {/* Countries */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.07)' }}>
                <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#5b369e' }}>
                  Por país
                </p>
                <div className="flex flex-col gap-3">
                  {countryData.length === 0 ? (
                    <p className="text-xs" style={{ color: '#a99bc0' }}>Sin datos aún</p>
                  ) : countryData.map((c) => (
                    <div key={c.country} className="flex items-center gap-2">
                      <span style={{ fontSize: '16px', width: '24px' }}>
                        {COUNTRY_FLAGS[c.country || ''] || '🌐'}
                      </span>
                      <span className="text-xs flex-1" style={{ color: '#5b369e' }}>
                        {COUNTRY_NAMES[c.country || ''] || c.country || 'Desconocido'}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#ede9f6' }}>
                        <div className="h-1.5 rounded-full" style={{
                          width: `${Math.round((c._count.country / maxCountry) * 100)}%`,
                          backgroundColor: '#7c3aed',
                        }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#2d1b5e' }}>
                        {c._count.country}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent clicks */}
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.07)' }}>
                <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#5b369e' }}>
                  Clicks recientes
                </p>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {['Hora', 'Dispositivo', 'País'].map(h => (
                    <span key={h} style={{ fontSize: '10px', color: '#a99bc0' }}>{h}</span>
                  ))}
                </div>
                <div className="flex flex-col">
                  {data.recentClicks.length === 0 ? (
                    <p className="text-xs" style={{ color: '#a99bc0' }}>Sin clicks aún</p>
                  ) : data.recentClicks.slice(0, 6).map((click, i) => (
                    <div key={i} className="grid grid-cols-3 gap-1 py-2 items-center"
                      style={{ borderBottom: i < 5 ? '1px solid #f5f3ff' : 'none' }}>
                      <span style={{ fontSize: '11px', color: '#5b369e', fontFamily: 'monospace' }}>
                        {new Date(click.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full inline-block" style={{
                        backgroundColor: click.deviceType === 'mobile' ? '#fce7f3' : '#ede9f6',
                        color: click.deviceType === 'mobile' ? '#9d174d' : '#5b369e',
                        fontSize: '10px',
                      }}>
                        {click.deviceType || 'desktop'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full inline-block"
                        style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '10px' }}>
                        {click.country || '?'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}