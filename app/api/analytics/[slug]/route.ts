import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const url = await db.url.findUnique({
            where: { slug },
            include: {
                analytics: true,
                clicks: {
                    orderBy: { timestamp: "desc" },
                    take: 100 // Limitar a las últimas 100 visitas
                }
            }
        })

        if (!url) {
            return NextResponse.json(
                { error: "URL no encontrada" },
                { status: 404 }
            )
        }

        const byCountry = await db.click.groupBy({
            by: ["country"],
            where: { urlId: url.id },
            _count: { country: true },
            orderBy: { _count: { country: "desc" } },

        })

        const byDevice = await db.click.groupBy({
            by: ["deviceType"],
            where: { urlId: url.id },
            _count: { deviceType: true },
            orderBy: { _count: { deviceType: "desc" } },
        })

        return NextResponse.json({
            slug: url.slug,
            originalUrl: url.originalUrl,
            createdAt: url.createdAt,
            analytics: url.analytics,
            byCountry,
            byDevice,
            recentClicks: url.clicks
        })
    } catch (error) {
        console.error("Error al obtener analíticas:", error)
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        )
    }
}