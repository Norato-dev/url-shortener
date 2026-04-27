import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { UAParser } from 'ua-parser-js'

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  // Parse device type
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const deviceType = device.type || 'desktop'

  const url = await db.url.findUnique({ where: { slug, isActive: true } })
  if (!url) notFound()

  // Log click with metadata
  await db.click.create({
    data: {
      urlId: url.id,
      ipAddress: ip,
      userAgent,
      deviceType,
    },
  })

  await db.analytics.update({
    where: { urlId: url.id },
    data: { totalClicks: { increment: 1 }, lastClickAt: new Date() },
  })

  // Cache in Redis
  const cached = await redis.get<string>(slug)
  if (!cached) {
    await redis.set(slug, url.originalUrl, { ex: 3600 })
  }

  redirect(url.originalUrl)
}