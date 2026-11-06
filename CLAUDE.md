# 🍔 Burger Real — Contexto del Proyecto para Claude

> Última revisión completa contra el código: **2026-11-05** (commit `7708a7e`).
> Si cambias algo de lo que describe este archivo, actualízalo en el mismo cambio.

## Qué es

Web mobile-first de pedidos para la hamburguesería **Burger Real** (Chile).
El cliente arma su pedido (burgers personalizables, acompañamientos, bebidas, combos),
completa sus datos y el pedido se envía como mensaje de **WhatsApp** al local.
No hay pagos en línea: transferencia (con datos bancarios mostrados) o efectivo.

- Repo: `github.com/DanielArellano97/burger-real-frontend`
- Hosting: **Netlify** (`netlify.toml`), build `pnpm run build` → `dist/burger-real-front/browser`

---

## Stack Tecnológico

- **Angular 22** — standalone components, signals, control flow (`@if`, `@for`), rutas lazy
- **TypeScript 6** — ⚠️ el `tsconfig.json` **no** tiene `"strict": true` ni `strictTemplates`
- **Tailwind CSS v4** — vía `@tailwindcss/postcss`; tokens de marca en `@theme` de `src/styles.css`
- **Angular CDK** — `Dialog` (todos los modales), `A11yModule` / `cdkTrapFocus`
- **@lucide/angular** — iconos como componentes standalone (`LucideX`, `LucidePlus`, …)
- **pnpm 11.5.2** (`packageManager`), Node 22 (mínimo v22.22.3)
- Tests: Vitest (`ng test`) — solo existe `app.spec.ts` y está desactualizado (ver Pendientes)
- Imágenes: **Cloudinary** (`res.cloudinary.com/zas3mkmm/...`)

> No se usa SpartanUI ni Angular Material.

### Backend
**Hoy no hay backend conectado.** No existe `HttpClient` ni `apiUrl`: todo el catálogo
(productos, ingredientes, combos, precios) vive en `src/app/core/data/*.data.ts` y los
servicios lo cargan con un `setTimeout` de 150 ms que simula red.
Existe un backend previo en **Java 21 / Spring Boot 3.5** (desconectado). Los modelos
`api-*.model.ts` y los comentarios de mapeo en `ingredients.data.ts` quedan como
referencia para una futura integración.

---

## Paleta de Colores y Tipografía

Definidos en `@theme` (`src/styles.css`) → disponibles como clases Tailwind (`bg-brand-dark`, `text-brand-orange`, `font-display`…).

```css
--color-brand-orange:    #F07800;   /* Naranja principal — CTAs, highlights */
--color-brand-orange-2:  #DC7814;   /* Naranja secundario */
--color-brand-dark:      #0F0F0F;   /* Fondo principal */
--color-brand-surface:   #1A1A1A;   /* Cards y superficies */
--color-brand-surface-2: #242424;   /* Hover */
--color-brand-white:     #F0F0F0;   /* Textos principales */
--color-brand-cream:     #F0DCC8;   /* Textos secundarios */
```
Bordes usan `#2A2A2A` inline; textos apagados `#888`.

Tipografías (Google Fonts en `index.html`): `Bebas Neue` (display), `Barlow Condensed` (headings), `Inter` (body).

---

## Arquitectura del Proyecto

```
src/
  environments/environment.ts      ← WhatsApp, nombre del local, datos bancarios
  app/
    app.config.ts                  ← Router (preload selectivo, input binding), animaciones async, DialogModule
    app.routes.ts                  ← '' (home), 'menu', 'confirmar-pedido' (guard), '**' → ''
    core/
      config/
        delivery.config.ts         ← Coordenada del local, radio máx., factor ruta, tramos de precio
      data/                        ← FUENTE DE VERDAD ACTUAL DEL CATÁLOGO
        ingredients.data.ts        ← Catálogo maestro de ingredientes (precios de extra, control)
        menu.data.ts               ← Productos en formato receta → MENU_DATA + CATEGORIES
        combos.data.ts             ← Combos; precio calculado desde componentes → COMBOS_DATA
      guards/cart.guard.ts         ← Bloquea /confirmar-pedido con carrito vacío → /menu
      models/
        product.model.ts           ← Product, Ingredient, IngredientMaster, RecipeLine, SizeVariant, IncludedProduct
        combo.model.ts             ← Combo, ComboDetalle
        cart-item.model.ts         ← CartItem (combo, variantes, promo)
        api-product.model.ts       ← (sin uso) contrato del backend antiguo
        api-combo.model.ts         ← (sin uso) contrato del backend antiguo
      services/
        cart.service.ts            ← Estado del carrito (signals) + persistencia localStorage
        producto.service.ts        ← Expone MENU_DATA y extrasCatalog
        combo.service.ts           ← Expone COMBOS_DATA
        notification.service.ts    ← Toast "modo ametralladora"
        whatsapp.service.ts        ← Arma el mensaje y abre wa.me (con fallback si hay popup bloqueado)
      strategies/selective-preload.strategy.ts ← menu a los 500 ms, confirmar-pedido a los 3 s
      utils/
        burger-of-the-week.ts      ← Rotación diaria de la promo (lunes–jueves)
        combo-pricing.ts           ← Precio de cada línea del combo y total
        combo-format.ts            ← Formato común de líneas de combo (modal, carrito, WhatsApp)
        delivery.ts                ← Haversine, cálculo de tramo, link Google Maps
        price.utils.ts             ← (sin uso) calculateUnitPrice
    features/
      home/                        ← Landing: hero, beneficios, accesos por categoría (?cat=)
      menu/                        ← Burger de la semana, carrusel de combos, tabs por categoría
      cart/cart-drawer.component.ts← Drawer global del carrito (editar, cantidades, vaciar)
      confirm-order/               ← Checkout: datos, retiro/delivery + GPS, pago, envío WhatsApp
    shared/components/
      navbar/  toast/  product-card/
      ingredient-modal/            ← Personalización de burgers y porción+extras de acompañamientos
      combo-modal/                 ← Selección de bebida (paso a paso) dentro de un combo
      combo-detail-modal/          ← Detalle informativo del combo
      burger-of-the-week-modal/    ← Confirmación de la promo
      image-lightbox/              ← Visor ampliado de imágenes (openImageLightbox)
      drink-selector-modal/        ← Hoy sin uso real (ningún producto pasa por esa rama)
```

---

## Datos del Catálogo (cómo se arman)

1. **`ingredients.data.ts`** — `IngredientMaster[]`: `extraPrice`, `canBeExtra`, `control` (`counter` 0..5 | `toggle` sí/no), `hidden`, `extraCategories` (dónde se ofrece como extra).
2. **`menu.data.ts`** — productos con `recipe: RecipeLine[]` (ids del catálogo maestro). `buildIngredients()` lo expande a `Ingredient[]` y **lanza error** si un id no existe.
   - Burgers (ids 1–10), acompañamientos (11 papas, 12 aritos, 13 deditos), bebestibles (21–25).
   - Todas las burgers `incluye` papas 100g (variante interna `504`, `internal: true`).
   - Burgers con `precioOferta` (candidatas a burger de la semana): 1, 3, 4, 9, 10.
3. **`combos.data.ts`** — `COMBOS_CONFIG` sin precio; `construirDetalles()` agrega las papas incluidas (a $0, `incluidoEnProducto`) y `calcularPrecioCombo()` fija `price`.
   - "Bebida a elección" = `productoId: 0` + `precioComboUnitario` + `opcionesDisponibles` generadas desde los bebestibles.

---

## Reglas de Negocio

> Mientras no haya backend, las reglas viven en `core/data`, `core/config` y `core/utils`.
> **Nunca hardcodear precios ni reglas dentro de componentes**: siempre en esos archivos.

### Ingredientes / personalización
- `isRequired: true` → no se puede bajar de la cantidad base (Pan, Medallón).
- `hidden: true` → está en la receta pero no se muestra en el modal (Pan Brioche).
- Extras disponibles = `extrasCatalog` (`canBeExtra`) filtrado por `extraCategories`; ej. Pepinillos (toggle, $0) solo en hamburguesas.
- `allowExtras: false` (aritos, deditos) → sin sección de extras.
- Bajar un ingrediente a 0 → **no** descuenta el precio base.
- Subir sobre `defaultQuantity` → suma `extraPrice` por unidad excedente.

### Acompañamientos
- Se agregan siempre vía `IngredientModal` (elección de porción + extras si aplica).
- Precio = `variant.extraPrice` si es > 0 (precio completo de esa porción), si no `product.price`. Ojo: en acompañamientos `extraPrice` significa **precio de la porción**, no un adicional.
- Variantes `internal: true` nunca se ofrecen al cliente.

### Combos
- Precio = suma de componentes usando `comboPrice` (producto o variante). La burger usa su precio normal (nunca `precioOferta`). Papas incluidas = $0.
- En carrito: un solo ítem `isCombo: true` (id de producto `combo.id + 90000`); nunca descomponer.
- Bebidas múltiples → `ComboModal` abierto en secuencia (uno por unidad), con botón "volver"; resultado en `selectedVariants[]`.

### Burger de la semana (promo diaria)
- Se resuelve en el front (`burgerDelDia`): rota **un día a la vez** entre burgers con `precioOferta`, en orden del menú. Lunes ancla: 2026-01-05.
- Solo **lunes a jueves** (`esDiaDeOferta`) se muestra el precio de oferta y botón Agregar; viernes–domingo se muestra la próxima burger con aviso "Lunes a Jueves".
- La línea del carrito lleva `isPromo` + `promoDate`; se separa de la burger de carta, no es personalizable y se descarta al reabrir otro día.
- En desarrollo se puede simular la fecha: `/menu?fecha=2026-10-26`.

### Carrito
- Persistido en `localStorage` (`burger-real-cart`).
- Misma burger con distinta personalización / distinta variante / promo vs carta → ítems separados.

### Checkout y delivery
- Nombre (solo letras, ≤80) y teléfono con prefijo fijo `+569` + 8 dígitos (se formatea al escribir).
- Formulario guardado en `sessionStorage` (`burger-real-checkout-form`).
- **Retiro** (sin costo) o **Delivery**:
  - Con GPS: distancia Haversine × `factorRuta` (1.25), redondeada hacia arriba a 0,1 km → tramo de `DELIVERY_CONFIG.tramos` (hasta 10 km). Fuera de cobertura bloquea el envío.
  - Sin GPS: dirección escrita obligatoria y delivery "por confirmar" (el total se muestra como provisional).
  - GPS: alta precisión y reintento en modo normal; mensajes guiados para iPhone.
- Pago: transferencia (copia datos bancarios) o efectivo (monto ≥ total, calcula vuelto).
- Envío: `window.open(wa.me)`; si el navegador bloquea el popup, se muestra enlace de respaldo y **no** se vacía el carrito. Al enviar: limpia carrito y formulario y vuelve a `/menu`.
- Notas del cliente se aplanan a una sola línea en el mensaje (evita inyectar secciones falsas).

---

## Convenciones de Código

### Signals (obligatorio)
Signals / `computed` / `effect` para todo el estado. **Sin Reactive Forms, sin `ngModel`, sin `BehaviorSubject`.**
Los inputs se manejan con `(input)` + `signal.set(...)`. RxJS solo donde lo exige Angular (router, preloading, `fromEvent`, `dialogRef.closed`).

### Componentes
- Standalone, inyección con `inject()` (los `constructor()` existentes son solo para `effect`).
- `@for` con `track` por id; `track $index` solo para arrays de strings.
  (Excepción actual a corregir: `combo-detail-modal` y `combo-modal` usan `track $index` sobre objetos.)
- `ChangeDetectionStrategy.OnPush` en componentes nuevos (ya lo usa `MenuComponent`).

### Modales (CDK Dialog)
Siempre `@angular/cdk/dialog`, nunca Material.

```ts
const ref = this.dialog.open<ResultType, DataType>(ComponentModal, {
  data: { ... },
  backdropClass: 'burger-dialog-backdrop',
  panelClass: 'burger-modal-pane',
  width: '420px',          // 380px para selectores simples
  maxWidth: '95vw',
  autoFocus: 'first-tabbable',
});
```

### Estilos
- Tailwind v4 para layout/spacing; valores exactos de marca pueden ir inline (`style=""`).
- **Sin fondos blancos** — solo oscuros y naranja.
- Mobile-first; `md:` / `lg:` solo para adaptar a desktop.
- Inputs con `font-size: 16px` en móvil (evita zoom de iOS; regla global en `styles.css`).
- Respetar `prefers-reduced-motion` (regla global ya existente).

### Imágenes
- URLs de Cloudinary con `w_600,f_auto,q_auto` en el catálogo; el hero semanal aplica `c_fill,g_auto,w_800,h_500` automáticamente.
- Si no hay `imageUrl`, la tarjeta muestra un ícono; la burger de la semana usa un fallback de Unsplash.

### Commits
Formato convencional en español: `feat(ámbito): descripción`, `fix(ámbito): descripción`.

---

## Seguridad / Netlify
- `netlify.toml` define redirect SPA, caché (HTML sin caché, JS/CSS inmutables) y cabeceras de seguridad con **CSP**.
- CSP actual: `img-src` permite Unsplash y Cloudinary; `connect-src 'self'`.
  ➜ **Si se conecta un backend o se agrega un dominio de imágenes/fuentes, hay que actualizar la CSP** o el navegador lo bloqueará en producción.
- `public/_redirects` duplica el redirect SPA (redundante con `netlify.toml`).
- `environment.ts` contiene número de WhatsApp real y datos bancarios (se muestran al cliente). No hay `environment.prod.ts` ni `fileReplacements`.

---

## Estado Actual del Proyecto

### ✅ Completado
- Home, menú con tabs por categoría (scroll-spy) y acceso directo `?cat=`
- Catálogo maestro de ingredientes + recetas + combos con precio calculado
- Personalización de burgers (contador y toggle, extras por categoría)
- Porciones de acompañamientos
- Combos con selección de bebidas paso a paso y modal informativo
- Burger de la semana con rotación diaria lunes–jueves
- Carrito drawer: editar personalización, cantidades, vaciar con confirmación, persistencia
- Toast "modo ametralladora"
- Checkout con validaciones, delivery por distancia con GPS, efectivo con vuelto, transferencia
- Mensaje de WhatsApp detallado + fallback de popup bloqueado
- Imágenes reales en Cloudinary + visor ampliado (lightbox)
- Deploy en Netlify con cabeceras de seguridad
- Guard de `/confirmar-pedido` y redirección si el carrito queda vacío

### 🔄 Pendiente / deuda técnica
- Definir integración con backend (catálogo, registrar la venta al enviar el pedido) — requiere actualizar CSP
- Activar `"strict": true` y `strictTemplates` en TypeScript
- Arreglar o reescribir `app.spec.ts` (espera un `h1` "Hello, burger-real-front" que no existe)
- Limpiar código sin uso: `api-*.model.ts` (o reutilizarlos al conectar backend), `price.utils.ts`, rama de variantes de `ProductCardComponent.add()` + `drink-selector-modal`
- Cambiar `track $index` sobre objetos en `combo-detail-modal` y `combo-modal`
- Vista desktop (hoy mobile-first)
- Bundle inicial ~467 kB (budget de warning: 500 kB) — vigilar al agregar dependencias

---

## Flujo Principal del Usuario

```
Home → Menú → [Agregar / Personalizar / Combo / Promo] → Carrito (drawer) → /confirmar-pedido → WhatsApp
```

### Burger
1. `"+ Agregar"` → receta original directa (`addOriginal`).
2. `"Personalizar"` → `IngredientModalComponent` → `CartService.addItem()` con snapshot de ingredientes.

### Combo
1. Ícono ℹ️ → `ComboDetailModalComponent` (informativo).
2. `"Agregar"` → por cada unidad de detalles con `requiereSeleccion` abre `ComboModalComponent` en secuencia.
3. Al terminar → `CartService.addCombo(combo, selectedVariants)`.

### Burger de la semana
`BurgerOfTheWeekModalComponent` confirma → `addItem(..., isPromo=true, promoDate)` con `precioOferta`.

---

## Notas para Claude

- **Verificar compilación al terminar**: `pnpm build` (o `ng build`). Debe compilar sin errores ni warnings.
- Cambios **quirúrgicos**: no tocar nada que no esté mencionado en el pedido.
- El usuario quiere explicaciones detalladas de cada cambio (qué, dónde y por qué), no solo el código.
- Para cambiar precios, productos o tramos de delivery: editar `core/data/*` o `core/config/delivery.config.ts`, no los componentes.
- Mantener este archivo actualizado cuando cambie la arquitectura, reglas o pendientes.
