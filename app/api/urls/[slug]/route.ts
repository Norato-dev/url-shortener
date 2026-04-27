import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"

//GET
export async function GET( request: NextRequest, { params }: { params: Promise<{ slug: string }> }){
    try {
        const { slug } = await params

        const url = await db.url.findUnique({
            where: { slug },
            include: { analytics: true }
        })

        if (!url) {
            return NextResponse.json(
                { error: "URL no encontrada" },
                { status: 404 }
            )
        }

        return NextResponse.json(url)
    } catch (error){
        console.error("Error al obtener URL:", error)
        return NextResponse.json(
            { error: "Error interno" },
            { status: 500 }
        )
    }
}

//DELETE
export async function Delete(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        await db.url.delete({ where: { slug }})
        await redis.del(slug)

        return NextResponse.json({
            message: "URL eliminada correctamente"
        })
    } catch (error) {
        console.error("Error al eliminar URL:", error)
        return NextResponse.json(
            { error: "Error al eliminar URL" },
            { status: 500 }
        )
    }
}

//PUT
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const { originalUrl, isActive } = await request.json()

        const url = await db.url.update({
            where: { slug },
            data: {
                originalUrl,
                isActive
            }
        })

        await redis.set(slug, originalUrl, { ex: 3600 }) // Actualizar cache por 1 hora

        return NextResponse.json(url)
    } catch (error) {
        console.error("Error al actualizar URL:", error)
        return NextResponse.json(
            { error: "Error al actualizar URL" },
            { status: 500 }
        )
    }
}