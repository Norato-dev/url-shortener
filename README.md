<div align="center">

# 🔗 URL Shortener

**Links cortos, impacto grande.**

Acorta cualquier URL en segundos. Comparte, rastrea y analiza tus links con un dashboard moderno y rápido.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)

</div>

---

## ✨ Características

- ⚡ **Acortado instantáneo** con slugs de 6 caracteres generados con `nanoid`.
- 🎨 **Slugs personalizados** opcionales para enlaces tipo marca.
- 🚀 **Cache con Redis (Upstash)** para redirecciones ultra rápidas, con fallback a la base de datos.
- 📊 **Analíticas por enlace**: clicks totales, último click, agrupación por país y por tipo de dispositivo.
- 🗄️ **PostgreSQL serverless** (Neon) gestionado con Prisma ORM.
- 🎯 **App Router de Next.js 16** y React 19, con Server Components donde importa y Client Components donde aporta.
- 💅 **UI minimalista** con Tailwind CSS 4 y tipografía Space Mono.

---

## 🛠️ Stack

| Capa | Tecnología |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Base de datos | PostgreSQL ([Neon serverless](https://neon.tech/)) |
| ORM | [Prisma 5](https://www.prisma.io/) |
| Cache | [Upstash Redis](https://upstash.com/) |
| IDs | [nanoid](https://github.com/ai/nanoid) |
| Charts | [Recharts](https://recharts.org/) |
| User Agent | [ua-parser-js](https://github.com/faisalman/ua-parser-js) |

---

## 📁 Estructura del proyecto

```
url-shortener/
├── app/
│   ├── layout.tsx              # Layout raíz + fuente Space Mono
│   ├── page.tsx                # Landing + formulario de acortado
│   ├── globals.css             # Estilos globales (Tailwind)
│   ├── [slug]/
│   │   └── page.tsx            # Redirección dinámica (Redis → DB)
│   └── api/
│       ├── urls/
│       │   ├── route.ts        # POST crear · GET listar
│       │   └── [slug]/route.ts # GET · PUT · DELETE por slug
│       └── analytics/
│           └── [slug]/route.ts # Analíticas por slug
├── lib/
│   ├── db.ts                   # Singleton de Prisma Client
│   ├── redis.ts                # Cliente Upstash Redis
│   └── utils.ts                # generateSlug · isValidUrl
├── prisma/
│   ├── schema.prisma           # Modelos: Url · Analytics · Click
│   └── migrations/
└── public/
```

---

## 🧬 Modelo de datos

```prisma
model Url {
  id          Int        @id @default(autoincrement())
  slug        String     @unique @db.VarChar(10)
  originalUrl String     @db.Text
  createdAt   DateTime   @default(now())
  expiresAt   DateTime?
  isActive    Boolean    @default(true)
  analytics   Analytics?
  clicks      Click[]
}

model Analytics {
  id          Int       @id @default(autoincrement())
  urlId       Int       @unique
  totalClicks Int       @default(0)
  lastClickAt DateTime?
  url         Url       @relation(fields: [urlId], references: [id], onDelete: Cascade)
}

model Click {
  id         Int      @id @default(autoincrement())
  urlId      Int
  timestamp  DateTime @default(now())
  ipAddress  String?
  userAgent  String?  @db.Text
  country    String?
  deviceType String?
  url        Url      @relation(fields: [urlId], references: [id], onDelete: Cascade)
}
```

---

## 🔌 API

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/api/urls` | Crea una URL corta. Body: `{ originalUrl, customSlug? }` |
| `GET` | `/api/urls` | Lista todas las URLs con sus analíticas |
| `GET` | `/api/urls/:slug` | Obtiene una URL por slug |
| `PUT` | `/api/urls/:slug` | Actualiza `originalUrl` o `isActive` |
| `DELETE` | `/api/urls/:slug` | Elimina una URL e invalida la cache |
| `GET` | `/api/analytics/:slug` | Analíticas: totales, por país, por dispositivo, últimos clicks |
| `GET` | `/:slug` | Redirección al destino (cache-first) |

### Ejemplo

```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://nextjs.org/docs","customSlug":"docs"}'
```

```json
{
  "id": 1,
  "slug": "docs",
  "originalUrl": "https://nextjs.org/docs",
  "shortUrl": "http://localhost:3000/docs"
}
```

---

## 🚀 Empezar

### 1. Clonar e instalar

```bash
git clone https://github.com/TU-USUARIO/url-shortener.git
cd url-shortener
npm install
```

### 2. Variables de entorno

Crea un archivo `.env` en la raíz:

```env
# PostgreSQL (Neon, Supabase o local)
DATABASE_URL="postgresql://user:password@host:5432/url_shortener"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxx"

# URL base pública (para construir el shortUrl)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Migraciones

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Levantar el dev server

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

---

## ⚙️ Cómo funciona la redirección

```
GET /:slug
   │
   ├─► Redis.get(slug) ──► HIT  → incrementar analytics → 302 redirect
   │
   └─► Redis MISS
         │
         ├─► db.url.findUnique({ slug, isActive: true })
         │     │
         │     ├─► null → 404 notFound()
         │     │
         │     └─► incrementar analytics
         │         Redis.set(slug, originalUrl, ex: 3600)
         │         302 redirect
```

---

## 🗺️ Roadmap

- [ ] Dashboard `/dashboard` con tabla de URLs y métricas
- [ ] Página de analíticas por slug con gráficos (Recharts)
- [ ] Captura real de IP, país y device en cada click
- [ ] Expiración automática de URLs (`expiresAt`)
- [ ] QR code por enlace
- [ ] Autenticación de usuarios

---

## 📄 Licencia

MIT © [davidnorato.dev](https://davidnorato.dev)
