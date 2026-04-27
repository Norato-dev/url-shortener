import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { UAParser } from "ua-parser-js"

async function getCountry(ip: string): Promise<string> {
  try {
    if(ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return 'Local'
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`)
    const data = await res.json()
    return data.countryCode || 'Desconocido'
  } catch (err) {
    console.error('Error obteniendo país:', err)
    return 'Desconocido'
  }
}

export default async function RedirectPage({params}: { params: Promise<{ slug: string }> }){
  const { slug } = await params
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'unknown'
  const ip =  headersList.get('x-forwarded-for')?.split(',')[0] || 
              headersList.get('x-real-ip') || 
              'unknown'
  
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const deviceType = device.type || 'desktop'

  const country = await getCountry(ip)

  const url = await db.url.findUnique(
    {
      where: {
        slug,
        isActive: true
      }
    }
  )

  if(!url) notFound()

  if (url.expiresAt && url.expiresAt < new Date()) {
  redirect('/expired')
}

  await db.click.create({
    data: {
      urlId: url.id,
      ipAddress: ip,
      userAgent,
      deviceType,
      country
    }
  })

  await db.analytics.update({
    where : { urlId: url.id},
    data: {
      totalClicks: { increment: 1 },
      lastClickAt: new Date()
    }
   })


  // Cachear en Redis
  const cached = await redis.get<string>(slug)
  if (!cached) {
    await redis.set(slug, url.originalUrl, { ex: 3600 }) // Cache por 1 hora
  }

  redirect(url.originalUrl)
}
