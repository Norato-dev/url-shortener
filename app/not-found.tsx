import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#f0edf8' }}>

      {/* Dot pattern */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #c4b5f4 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: 0.35,
      }} />

      <div className="relative z-10 text-center">
        <span style={{
          fontFamily: 'var(--font-space-mono), monospace',
          color: '#7c3aed',
          fontSize: '14px',
          letterSpacing: '.02em',
        }}>
          // davidnorato.dev
        </span>

        <div className="mt-8 mb-2">
          <span className="text-8xl font-bold" style={{ color: '#ede9f6' }}>404</span>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#2d1b5e' }}>
          Link no encontrado
        </h1>
        <p className="text-sm mb-8" style={{ color: '#a99bc0' }}>
          Este link no existe o fue eliminado.
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/"
            className="text-sm px-5 py-2.5 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#7c3aed' }}>
            Crear nuevo link
          </Link>
          <Link href="/dashboard"
            className="text-sm px-5 py-2.5 rounded-lg font-medium"
            style={{ color: '#5b369e', border: '1.5px solid #c4b5f4', backgroundColor: 'white' }}>
            Ver mis links
          </Link>
        </div>
      </div>
    </main>
  )
}