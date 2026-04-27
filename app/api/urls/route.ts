import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { generateSlug, isValidUrl } from "@/lib/utils"

// POST /api/urls
export async function POST(request: NextRequest) {
    try{
        const { originalUrl, customSlug } = await request.json()

        if (!originalUrl || !isValidUrl(originalUrl)) {
            return NextResponse.json (
                { error: "URL inválida" },
                { status: 400 }
            )
        }

        const slug = customSlug || generateSlug()

        // Verificar si el slug personalizado ya existe
        const existing = await db.url.findUnique({ where: { slug } })
        if (existing){
            return NextResponse.json(
                { error: 'Ese slug ya existe, intenta otro'},
                { status: 409 }
            )
        }

        const url = await db.url.create({
            data: {
                slug,
                originalUrl,
                analytics: {
                    create: {}
                }
            }
        })

        await redis.set(slug, originalUrl, { ex: 3600}) // Cache por 1 hora

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

        const shortUrl = `${baseUrl}/${slug}`

        return NextResponse.json({ ...url, shortUrl}, { status: 201 })
    } catch (error) {
        console.error("Error al crear URL:", error)
        return NextResponse.json(
            { error: "Error al crear URL" },
            { status: 500 }
        )
    }
}

// GET /api/urls/:slug
export async function GET() {
    try{
        const urls = await db.url.findMany({
            orderBy: { createdAt: "desc" },
            include: { analytics: true }
        })
        return NextResponse.json(urls)
    } catch (error) {
        console.error("Error al obtener URLs:", error)
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        )
    }
}