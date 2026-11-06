# 🍔 Burger Real — Pedidos online

**Sabor Casero.** Web mobile-first para pedir en **Burger Real**: el cliente arma su pedido
(burgers personalizables, acompañamientos, bebidas y combos), elige retiro o delivery,
y el pedido llega al local como un **mensaje de WhatsApp** listo para confirmar.

> **Estado:** MVP en producción sobre Netlify. Es un frontend estático: el menú vive en
> el propio proyecto, ordenado igual que una base de datos para conectar un backend más
> adelante sin reescribir la app.

---

## ✨ Funcionalidades

| | |
|---|---|
| 🍔 **Personalización** | Quitar ingredientes (sin descuento), sumar porciones extra y agregar extras del catálogo (contador o sí/no). |
| 🍟 **Porciones** | Precio base + adicional por tamaño (ej. Papas 150g / 250g / 300g). |
| 🥤 **Combos** | Precio calculado desde sus componentes; elección de bebidas paso a paso, con "Atrás". |
| ⭐ **Burger de la semana** | Rota a diario de lunes a jueves con precio de oferta. |
| 🛒 **Carrito persistente** | Sobrevive a recargas; los precios se recalculan siempre desde el menú vigente. |
| 🛵 **Delivery por distancia** | GPS → distancia estimada → precio por tramos (hasta 10 km). Sin GPS: dirección escrita y delivery por confirmar. |
| 💳 **Pago** | Transferencia (datos copiables) o efectivo con cálculo de vuelto. |
| 🕕 **Horario** | Pedidos solo de 18:00 a 22:00 (hora de Chile). Fuera de horario el menú se ve, pero no se puede pedir. |
| 🚫 **Agotados** | Un producto marcado como no disponible se muestra "Agotado" y arrastra a sus combos. |
| 📲 **WhatsApp** | Mensaje detallado con cliente, pedido, entrega, pago y total. |

---

## 🧱 Stack

- **Angular 22**: standalone components, signals, control flow, rutas lazy, `NgOptimizedImage`.
- **TypeScript 6** en modo estricto (`strict` + `strictTemplates`).
- **Tailwind CSS v4**: tokens de marca en `src/styles.css`.
- **Angular CDK**: diálogos y foco accesible.
- **@lucide/angular**: íconos.
- **Cloudinary**: imágenes optimizadas (formato, calidad y tamaño automáticos).
- **Vitest**: tests unitarios (`ng test`).
- **pnpm 11** y **Netlify** (hosting + cabeceras de seguridad).

---

## 🚀 Empezar

### Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 22.22.3+ (o 24.15+ / 26+) |
| pnpm | 11.x (`corepack enable` lo activa) |

### Comandos

```bash
pnpm install        # instalar dependencias
pnpm start          # desarrollo en http://localhost:4200
pnpm build          # build de producción → dist/burger-real-front/browser
pnpm test           # tests en modo observador
pnpm test:ci        # tests una sola vez (para CI o antes de publicar)
```

### Probar promo y horario en desarrollo

Solo en `pnpm start` se puede simular la fecha y la hora con parámetros en la URL:

```
http://localhost:4200/menu?fecha=2026-11-05&hora=19:30
```

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura hexagonal** (puertos y adaptadores), la misma que
usará el backend:

```
            ┌──────────────────────── ui/ ─────────────────────────┐
            │  pages · layout · components  (Angular, solo vista)  │
            └───────────────────────────┬──────────────────────────┘
                                        │ usa
            ┌──────────────────── application/ ────────────────────┐
            │  CatalogService · CartService · OrderService · Clock │
            └───────────────────────────┬──────────────────────────┘
                                        │ usa
            ┌────────────────────── domain/ ───────────────────────┐
            │  modelos y reglas puras (precios, carrito, promo,    │
            │  delivery, horario, mensaje) + PUERTOS:              │
            │  CatalogRepository · CartStorage · OrderSender       │
            └───────────────────────────▲──────────────────────────┘
                                        │ implementan
            ┌─────────────────── infrastructure/ ──────────────────┐
            │  LocalCatalogRepository (tablas) · LocalCartStorage  │
            │  WhatsappOrderSender · loader de Cloudinary          │
            └──────────────────────────────────────────────────────┘
```

- **`domain/`** no conoce Angular: es TypeScript puro y testeable.
- **`app.config.ts`** decide qué adaptador implementa cada puerto. Para conectar el
  backend se crea un `HttpCatalogRepository` y se cambia **una línea**.
- **Nomenclatura:** código en inglés; registros de base de datos en español
  (igual que el backend).

```
src/
├── environments/environment.ts     WhatsApp, nombre del local, datos bancarios
├── styles.css                      tokens de marca, animaciones, Tailwind
└── app/
    ├── app.config.ts               puertos → adaptadores, carga del catálogo
    ├── app.routes.ts               /, /menu, /confirmar-pedido
    ├── config/                     horario y tramos de delivery (editables)
    ├── domain/                     catalog · cart · promo · delivery · schedule · order
    ├── application/                servicios Angular (estado y casos de uso)
    ├── infrastructure/
    │   ├── catalog/                catalog.records (contrato API/BD) · catalog.mapper
    │   │   └── local/tables/       ← EL MENÚ: productos, porciones, combos…
    │   ├── storage/                carrito en localStorage
    │   ├── whatsapp/               envío del pedido
    │   └── images/                 loader de Cloudinary
    ├── routing/                    guard del checkout y precarga de rutas
    ├── testing/                    fixtures para tests
    └── ui/                         pages · layout · components
```

---

## 🛠️ Tareas comunes

### Cambiar el número de WhatsApp o los datos bancarios
`src/environments/environment.ts` → `whatsappNumber` (código de país sin `+`, ej. `56912345678`)
y `bankDetails`.

### Editar el menú
Todo está en `src/app/infrastructure/catalog/local/tables/`, una tabla por archivo:

| Archivo | Qué contiene |
|---|---|
| `productos.table.ts` | Nombre, descripción, categoría, precio base, precio de oferta, precio en combo, foto, disponible. |
| `porciones.table.ts` | Tamaños por producto. **Precio final = precio base + `precioAdicional`.** |
| `ingredientes.table.ts` | Catálogo maestro: precio como extra, tipo de control, en qué categorías se ofrece. |
| `producto-ingredientes.table.ts` | Receta de cada producto (cantidad y si es obligatorio). |
| `producto-incluye.table.ts` | Lo que trae un producto dentro (ej. papas 100g de cada burger). |
| `combos.table.ts` / `combo-detalles.table.ts` | Combos y sus componentes. El precio se calcula solo. |

Si un id no existe (por ejemplo, un ingrediente en una receta), la app **falla al
arrancar** con un mensaje claro, en vez de mostrar un menú incompleto.

### Marcar algo como agotado
`disponible: false` en `productos.table.ts` o `combos.table.ts`.

### Cambiar horario o delivery
- `src/app/config/business-hours.config.ts`: apertura, cierre, días y zona horaria.
- `src/app/config/delivery.config.ts`: ubicación del local, radio máximo y tramos de precio.

### Fotos de productos
Las fotos van en **Cloudinary**. En la tabla se guarda solo el **id público**
(ej. `v1793550658/Cheeseburger.png`). El loader genera la URL óptima según dónde se
muestre la foto (tamaño exacto, AVIF/WebP y recorte inteligente).

---

## 🔒 Seguridad

- **Cabeceras** (`netlify.toml`): CSP estricta (solo scripts propios, imágenes de
  Cloudinary, fuentes de Google), HSTS, `X-Frame-Options: DENY`, `nosniff` y
  `Permissions-Policy` (solo geolocalización).
- **Carrito sin precios**: el navegador guarda solo ids y cantidades. Los precios se
  recalculan desde el menú, así que editar el `localStorage` no cambia lo que se cobra.
- **Entradas validadas** (nombre, teléfono, montos) y textos libres aplanados a una
  línea en el mensaje, para que no se puedan simular secciones como "TOTAL".
- **Sin secretos en el frontend**: todo lo que está en `environment.ts` es público por
  naturaleza. Nunca guardes ahí claves de APIs.
- ⚠️ El cliente puede editar el texto en WhatsApp antes de enviarlo: **verifica siempre
  el total contra el menú** al confirmar un pedido.

---

## ☁️ Despliegue

Netlify compila con `pnpm run build` y publica `dist/burger-real-front/browser`
(configurado en `netlify.toml`, Node 22 y pnpm 11.5.2). Cada push a la rama
configurada genera un deploy; las ramas generan *Deploy Previews* para probar antes.

Antes de publicar: `pnpm test:ci`, `pnpm build` y el
[checklist de pruebas en celulares](docs/CHECKLIST-PRUEBAS.md).

---

## 🗺️ Próximos pasos

1. **Backend (lectura):** `HttpCatalogRepository` que consuma `GET /api/catalogo` con la
   forma de `catalog.records.ts`, reutilizando `catalog.mapper.ts`. Agregar el dominio
   de la API al `connect-src` de la CSP.
2. **Registrar pedidos** en el backend al enviarlos por WhatsApp (nuevo adaptador de
   `OrderSender`).
3. Mover cálculos (precios, delivery, horario) al backend de forma incremental.
4. Vista optimizada para escritorio.

---

Hecho con 🧡 para **Burger Real**.
