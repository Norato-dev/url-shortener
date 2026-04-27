'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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
  recentClicks: { timestamp: string }[]
}

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5f4', '#ede9f6', '#5b369e']

export default function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    params.then(({ slug }) => {
      setSlug(slug)
      fetch(`/api/analytics/${slug}`)
        .then(res => res.json())
        .then(data => { setData(data); setLoading(false) })
    })
  }, [params])

  // Group clicks by hour for bar chart
  const clicksByHour = data?.recentClicks.reduce((acc: Record<string, number>, click) => {
    const hour = new Date(click.timestamp).getHours()
    const label = `${hour}:00`
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  const hourlyData = Object.entries(clicksByHour || {}).map(([hour, count]) => ({ hour, count }))

  const deviceData = data?.byDevice.map(d => ({
    name: d.deviceType || 'desktop',
    value: d._count.deviceType,
  })) || []

  const countryData = data?.byCountry.map(c => ({
    name: c.country || 'Desconocido',
    value: c._count.country,
  })) || []

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0edf8' }}>

      {/* Dot pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #c4b5f4 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: 0.35,
      }} />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <span style={{
          fontFamily: 'var(--font-space-mono), monospace',
          color: '#7c3aed', fontSize: '15px', letterSpacing: '.02em',
        }}>
          // davidnorato.dev
        </span>
        <a href="/dashboard" className="text-sm px-4 py-2 rounded-lg"
          style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
          ← Dashboard
        </a>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-8 py-8">

        {loading ? (
          <div className="text-center py-20" style={{ color: '#a99bc0' }}>Cargando analytics...</div>
        ) : !data ? (
          <div className="text-center py-20" style={{ color: '#a99bc0' }}>No se encontró el link</div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-1" style={{ color: '#7c3aed' }}>// analytics</p>
              <h1 className="text-3xl font-bold mb-1" style={{ color: '#2d1b5e' }}>/{data.slug}</h1>
              <a href={data.originalUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm hover:underline truncate block" style={{ color: '#a99bc0', maxWidth: '500px' }}>
                {data.originalUrl}
              </a>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total clicks', value: data.analytics?.totalClicks || 0 },
                { label: 'Último click', value: data.analytics?.lastClickAt ? new Date(data.analytics.lastClickAt).toLocaleDateString('es-CO') : 'Nunca' },
                { label: 'Creado', value: new Date(data.createdAt).toLocaleDateString('es-CO') },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-5" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
                  <p className="text-sm mb-1" style={{ color: '#a99bc0' }}>{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: '#2d1b5e' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">

              {/* Clicks by hour */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
                <h2 className="text-sm font-medium mb-4" style={{ color: '#5b369e' }}>Clicks por hora</h2>
                {hourlyData.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#a99bc0' }}>Sin datos aún</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData}>
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#a99bc0' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#a99bc0' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #ede9f6', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* By device */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
                <h2 className="text-sm font-medium mb-4" style={{ color: '#5b369e' }}>Por dispositivo</h2>
                {deviceData.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#a99bc0' }}>Sin datos aún</p>
                ) : (
                  <div className="flex items-center gap-6">
                    <PieChart width={160} height={160}>
                      <Pie data={deviceData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                        {deviceData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                    <div className="flex flex-col gap-2">
                      {deviceData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm capitalize" style={{ color: '#5b369e' }}>{d.name}</span>
                          <span className="text-sm font-medium" style={{ color: '#2d1b5e' }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* By country */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(91,54,158,0.08)' }}>
              <h2 className="text-sm font-medium mb-4" style={{ color: '#5b369e' }}>Por país</h2>
              {countryData.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#a99bc0' }}>Sin datos aún</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {countryData.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-sm w-24 truncate" style={{ color: '#5b369e' }}>{c.name}</span>
                      <div className="flex-1 rounded-full h-2" style={{ backgroundColor: '#ede9f6' }}>
                        <div className="h-2 rounded-full" style={{
                          backgroundColor: COLORS[i % COLORS.length],
                          width: `${(c.value / (data.analytics?.totalClicks || 1)) * 100}%`
                        }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#2d1b5e' }}>{c.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}