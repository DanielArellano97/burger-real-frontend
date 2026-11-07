# 🍔 Burger Real — Contexto del Proyecto para Claude

> Revisado contra el código: **2026-11-06**. Si un cambio contradice este archivo,
> actualízalo en el mismo commit.

## Qué es y estrategia

Web mobile-first de pedidos para **Burger Real** (Chile).
Sitio: **https://burgerreal.netlify.app** (definida en `config/site.config.ts` + `index.html`). El cliente arma su pedido y lo
envía como **mensaje de WhatsApp**. Pago por transferencia o efectivo (sin pasarela).

**Estrategia acordada (MVP → backend incremental):**
1. **Hoy:** frontend estático en Netlify; el menú vive "en duro" en tablas locales.
2. El front se mantiene **limpio y con forma de base de datos**, para que conectar el
   backend sea cambiar un adaptador, no reescribir la app.
3. Cuando los pedidos lo justifiquen, el backend (Java 21 / Spring Boot, **arquitectura
   hexagonal**) se construye en pasos pequeños:
   leer catálogo → registrar pedidos → mover cálculos.
4. El backend antiguo (con sobreingeniería) **no se reutiliza tal cual**: este front es la
   referencia del modelo de datos.
5. El diseño visual se considera terminado: **no cambiar estilos** salvo que se pida.

---

## Stack

- **Angular 22**: standalone, signals, control flow, rutas lazy, `NgOptimizedImage`.
- **TypeScript 6** con `strict` + `strictTemplates`.
- **Tailwind CSS v4** (`@tailwindcss/postcss`); tokens en `@theme` de `src/styles.css`.
- **Angular CDK**: `Dialog` y `A11yModule`. **@lucide/angular** para íconos.
- **Cloudinary** para imágenes (loader propio). **Vitest** vía `ng test`.
- **pnpm 11.5.2**, Node 22.22.3+. Hosting **Netlify** (`netlify.toml`).
- No se usa: SpartanUI, Angular Material, `@angular/animations` (animaciones en CSS),
  Reactive Forms, `HttpClient` (aún).

---

## Arquitectura hexagonal (`src/app`)

```
domain/          TS puro, sin Angular. Modelos, reglas y PUERTOS.
  catalog/       catalog.models · pricing · combo-format · catalog.repository (puerto)
  cart/          cart.models (StoredCartLine / CartItem) · cart-lines · cart.storage (puerto)
  order/         order.models · order-message (texto WhatsApp) · order.sender (puerto)
  promo/         burger-of-the-week          delivery/  delivery (Haversine, tramos)
  schedule/      business-hours              shared/    money (formatPrice)
application/     Servicios Angular: CatalogService, CartService, OrderService,
                 ClockService, StoreStatusService, NotificationService
infrastructure/  Adaptadores
  catalog/       catalog.records (contrato BD/API, en español) · catalog.mapper
    local/       LocalCatalogRepository + tables/*.table.ts  ← EL MENÚ
  storage/       LocalCartStorage (localStorage, clave burger-real-cart-v2)
  whatsapp/      WhatsappOrderSender (wa.me + fallback si se bloquea el popup)
  images/        cloudinary-image.loader (IMAGE_LOADER + cloudinaryUrl)
config/          business-hours.config · delivery.config (editables)
routing/         cart.guard · selective-preload.strategy
ui/              pages/ (home, menu, confirm-order) · layout/ (navbar, cart-drawer, toast)
                 components/ (modales, product-card, image-lightbox, store-closed-banner)
                 shared/categories.ts
testing/         catalog.fixture (catálogo real para tests)
```

**Reglas de dependencias:**
- `domain` no importa nada de Angular ni de otras capas.
- `ui` usa `application` (y funciones puras de `domain`). **Nunca** importa las tablas
  ni `catalog.records`.
- Solo `LocalCatalogRepository` lee las tablas. Todo lo demás pide el catálogo a
  `CatalogService`.
- `app.config.ts` une cada puerto con su adaptador. El catálogo se carga con
  `provideAppInitializer` antes de mostrar la app.
- **Nomenclatura:** código en inglés. Registros de BD (`*Record`, tablas) en español,
  como en el backend. Textos de UI en español.

### Conectar el backend (cuando toque)
Crear `HttpCatalogRepository extends CatalogRepository` que haga
`http.get<CatalogRecords>()` y llame a `mapCatalog()`. Registrar `provideHttpClient()`,
cambiar el provider en `app.config.ts` y **agregar el dominio a `connect-src` de la CSP**
en `netlify.toml`.

---

## Modelo de datos (tablas en `infrastructure/catalog/local/tables/`)

| Tabla | Notas |
|---|---|
| `productos` | `categoria` HAMBURGUESA/ACOMPANAMIENTO/BEBESTIBLE · `precio` = porción base · `precioOferta` (promo) · `precioCombo` · `disponible` · `imagen` (id público Cloudinary) · `nombreCorto` (selector de bebidas) |
| `porciones` | **precio final = `productos.precio` + `precioAdicional`** · `precioCombo` absoluto · `interna` (nunca se ofrece, ej. papas 100g) |
| `ingredientes` | `precioExtra` · `permiteExtra` · `tipoControl` CONTADOR/SI_NO · `oculto` · `categoriasExtra` |
| `producto_ingredientes` | receta: `cantidad`, `obligatorio` |
| `producto_incluye` | lo que trae un producto (papas 100g de cada burger) |
| `combos` | sin precio: se calcula · `disponible` |
| `combo_detalles` | `productoId` fijo, o `null` + `categoriaSeleccion` + `precioUnitario` (bebida a elección) |

`catalog.mapper` falla al arrancar si hay ids inexistentes (mejor que un menú incompleto).

---

## Reglas de negocio

> Mientras no haya backend viven en `domain/` y `config/`. **Nunca en componentes.**

- **Personalización:** quitar no descuenta; cada unidad sobre la receta suma
  `extraPrice`; máximo 5 por ingrediente; los obligatorios no bajan de la base; los
  ocultos (pan) no se muestran.
- **Extras:** catálogo maestro filtrado por `categories` y `allowsExtras`
  (Pepinillos: sí/no, gratis, solo burgers).
- **Porciones:** base + adicional. La UI muestra el **precio final** de cada porción.
- **Combos:** precio = Σ `unitPrice × quantity`. La burger usa su precio normal (nunca la
  oferta), las papas incluidas valen $0 y la porción usa `comboPrice`. Las elecciones
  se hacen paso a paso.
  Un combo queda agotado si falta un componente fijo o no quedan opciones.
- **Burger de la semana:** rota a diario entre burgers con `offerPrice`, solo de lunes a
  jueves (fin de semana muestra la del próximo lunes). Ancla: 2026-01-05. Es una línea
  `promoDate` aparte, no personalizable y vence al cambiar el día.
- **Carrito:** guarda **solo referencias** (`StoredCartLine`: ids, porción, cantidades
  que difieren de la receta, elecciones, `promoDate`). `items` se reconstruye desde el
  catálogo vigente: precios siempre actuales y se descarta lo inválido o agotado.
  Las líneas iguales se unen.
- **Horario:** 18:00–22:00, `America/Santiago`, todos los días. Fuera de horario el menú
  se ve, pero se desactiva agregar (UI + `CartService`) y enviar.
- **Delivery:** Haversine × 1.25, redondeo hacia arriba a 0,1 km, tramos hasta 10 km.
  Sin GPS: dirección obligatoria y delivery "por confirmar".
- **Checkout:** nombre (letras, ≤80), teléfono `+569` + 8 dígitos. Efectivo ≥ total.
  El formulario se guarda en `sessionStorage`. Si el popup se bloquea → enlace de
  respaldo y el carrito no se vacía.
- **Mensaje:** textos libres aplanados a una línea (anti-inyección). La promo se marca
  "(Burger de la semana)".
- **Desarrollo:** `?fecha=YYYY-MM-DD&hora=HH:mm` simula el reloj (solo con `isDevMode`).

---

## Convenciones de código

- Signals / `computed` / `effect` para el estado. Inputs con `(input)` + `signal.set`.
  RxJS solo donde Angular lo exige.
- Standalone, `inject()`, `readonly` en lo que no se reasigna. `OnPush` en componentes
  nuevos.
- `@for` con `track` por id. `track $index` solo cuando los elementos se repiten
  (ej. bebidas elegidas) o son strings.
- Modales con `@angular/cdk/dialog`: `backdropClass: 'burger-dialog-backdrop'`,
  `panelClass: 'burger-modal-pane'`, `maxWidth: '95vw'`, `autoFocus: 'first-tabbable'`.
- Imágenes de productos con `ngSrc` + `width/height` + `loaderParams.aspectRatio`. Hero
  con `priority`. En modo dev la directiva valida la configuración; no ignorar sus avisos.
- Estilos: Tailwind para layout; colores de marca inline cuando son exactos; sin fondos
  blancos; mobile-first; inputs a 16px en móvil (evita zoom iOS).
- Precios: siempre `formatPrice()` de `domain/shared/money`.

---

## Flujo de trabajo con Claude

- **Explicar en detalle** cada cambio: qué, dónde y por qué (el usuario quiere entender,
  no solo copiar).
- Cambios **quirúrgicos**: no tocar lo que no se pidió. Todo debe seguir funcionando
  igual que antes.
- **Un commit por punto/tarea**, en español:
  `tipo(ámbito): resumen` + cuerpo con el detalle
  (`feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `style`, `security`, `chore`).
- Antes de terminar: `pnpm build` (sin errores ni warnings) y `pnpm test:ci`.
- Si se cambian precios o tablas: comparar el catálogo antes y después.
- El repo usa **CRLF** en Windows (`core.autocrlf`); no convertir finales de línea.
- Checklist manual antes de publicar: `docs/CHECKLIST-PRUEBAS.md`.

---

## Pendientes

- [ ] Confirmar en producción las URLs de Cloudinary con `c_fill,g_auto,ar_*` (fotos
      recortadas bien) y la vista previa al compartir el link.
- [ ] Si se compra dominio propio: cambiar `SITE_URL` (`config/site.config.ts`) y
      `og:url` / `canonical` de `index.html`, y redirigir el `.netlify.app` desde Netlify.
- [ ] Backend: lectura del catálogo (`HttpCatalogRepository`).
- [ ] Backend: registrar pedidos al enviarlos.
- [ ] Vista desktop.
- [ ] Identificadores en español que quedan dentro de `confirm-order.component.ts`
      (`deliveryPendiente`, `mapaUrl`…): renombrar cuando se toque ese componente.
