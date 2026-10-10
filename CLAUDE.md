# 🍔 Burger Real — Contexto del Proyecto para Claude Code

## Stack Tecnológico

### Frontend
- **Angular 22** — standalone components, signals para estado reactivo
- **Tailwind CSS v4** — con variables de marca definidas en `styles.css`
- **SpartanUI** — componentes headless/accesibles
- **Angular CDK** — `Dialog`, `CdkTrapFocus`, `A11yModule`
- **Lucide Angular** — iconografía
- **TypeScript** estricto

### Backend
- **Java 21** con **Spring Boot 3.5**
- API REST en `http://localhost:8080`
- Sin autenticación por ahora

---

## Paleta de Colores de Marca

```css
--color-brand-orange:    #F07800;   /* Naranja principal — CTAs, highlights */
--color-brand-dark:      #0F0F0F;   /* Fondo principal */
--color-brand-surface:   #1A1A1A;   /* Cards y superficies */
--color-brand-surface-2: #242424;   /* Hover, bordes */
--color-brand-white:     #F0F0F0;   /* Textos principales */
--color-brand-cream:     #F0DCC8;   /* Textos secundarios */
```

Tipografías: `Bebas Neue` (display), `Barlow Condensed` (headings), `Inter` (body)

---

## Arquitectura del Proyecto

```
src/
  app/
    core/
      services/
        cart.service.ts          ← Estado global del carrito (signals)
        combo.service.ts         ← Carga combos desde el backend
        notification.service.ts  ← Sistema de toast notifications
        producto.service.ts      ← Carga productos desde el backend
        whatsapp.service.ts      ← Construcción del mensaje y envío
      models/
        api-combo.model.ts       ← Interfaces del backend para combos
        api-product.model.ts     ← Interfaces del backend para productos
        cart-item.model.ts       ← CartItem con soporte combo y variantes
        combo.model.ts           ← Modelo interno de combos
        product.model.ts         ← Modelo interno de productos
      guards/
        cart.guard.ts            ← Protege /confirmar-pedido si carrito vacío
      strategies/
        selective-preload.strategy.ts  ← Preloading estratégico de rutas
      data/
        menu.data.ts             ← Solo datos locales residuales (limpiar en refactor)
    features/
      home/
      menu/
      confirm-order/
    shared/
      components/
        burger-of-the-week-modal/
        cart-drawer/
        combo-detail-modal/
        combo-modal/
        drink-selector-modal/
        ingredient-modal/
        navbar/
        product-card/
        toast/
```

---

## Endpoints del Backend

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/productos` | Todos los productos (ordenados por id ASC) |
| GET | `/api/v1/combos` | Todos los combos disponibles |

**Nota:** El backend filtra automáticamente — los viernes, sábados y domingos manda `precioOferta: null` en todas las hamburguesas (lógica de burger de la semana).

---

## Reglas de Negocio Importantes

### ⚠️ Regla fundamental
**Nunca implementar lógica de negocio en el frontend.** Todo lo que sea una regla del negocio (precios, disponibilidad, descuentos, flags de personalización) debe venir del backend. El frontend solo mapea y renderiza.

### Ingredientes
- `permiteQuitar: false` + `permiteAgregar: false` → NO aparece en el modal de personalización (ej: Pan Brioche, Papas Fritas)
- `permiteQuitar: false` + `permiteAgregar: true` → Aparece en modal, botón `−` bloqueado en cantidad base (ej: Medallón de Carne)
- `permiteQuitar: true` + `permiteAgregar: true` → Aparece en modal, ambos botones habilitados
- `isRequired: true` en el modelo interno = `permiteQuitar: false` del backend

### Carrito
- Dos burgers con distinta personalización → ítems separados (comparación por `cartItemId`)
- Dos acompañamientos con distinta variante → ítems separados
- Combos → siempre un solo ítem con `isCombo: true`, nunca descomponer en productos individuales
- `selectedVariant` → para bebestibles individuales y combos con 1 bebida
- `selectedVariants[]` → para combos con múltiples bebidas elegidas

### Precios
- Bajar un ingrediente a 0 → NO descuenta el precio base
- Subir un ingrediente sobre `defaultQuantity` → suma `extraPrice` por unidad excedente
- `precioOferta` en burger de la semana → si viene `null`, ocultar botón y mostrar "Lunes a Jueves"

---

## Convenciones de Código

### Signals (obligatorio)
Usar signals para todo el estado reactivo. **No usar Reactive Forms ni BehaviorSubject.**

```ts
// ✅ Correcto
nombre = signal('');
isValid = computed(() => this.nombre().trim().length > 0);

// ❌ Incorrecto
nombreControl = new FormControl('');
```

### Componentes
- Todos los componentes son **standalone**
- Inyección con `inject()`, no constructor injection
- `@for` con `track` por ID siempre — nunca `track $index` para listas de objetos, solo para arrays de strings

```ts
// ✅ Correcto
@for (item of items; track item.id) { }
@for (text of strings; track $index) { }
```

### Modales (CDK Dialog)
Usar siempre `@angular/cdk/dialog` — nunca Angular Material Dialog.

```ts
const ref = this.dialog.open<ResultType, DataType>(ComponentModal, {
  backdropClass: 'burger-dialog-backdrop',
  panelClass: 'burger-modal-pane',
  width: '420px',
  maxWidth: '95vw',
});
```

### Estilos
- Tailwind v4 para layout y spacing
- Estilos de marca como `style=""` inline cuando sean valores exactos del sistema de diseño
- **Sin fondos blancos** en ninguna sección — todo en escala de oscuros y naranja
- Mobile-first siempre — breakpoints `md:` y `lg:` solo para adaptaciones desktop

---

## Estado Actual del Proyecto

### ✅ Completado
- Menú completo con categorías (Hamburguesas, Acompañamientos, Bebestibles)
- Sistema de personalización de ingredientes con modal
- Variantes de tamaño para acompañamientos (vienen del backend)
- Sistema de combos con selección de bebida (modal secuencial para múltiples bebidas)
- Carrito con drawer, edición, vaciar con confirmación
- Toast notifications inteligente (modo ametralladora)
- Pantalla de confirmación de pedido (`/confirmar-pedido`)
- Integración WhatsApp con formato detallado del pedido
- Datos bancarios para transferencia (en `environment.ts`)
- Burger de la semana con precio de oferta y bloqueo fin de semana
- Modal informativo de combos
- Animaciones de entrada/salida del drawer
- Preloading estratégico de rutas
- Scroll lock del body cuando el drawer está abierto
- Guard de ruta para `/confirmar-pedido`

### 🔄 Pendiente
- Registrar la venta en el backend al enviar el pedido por WhatsApp
- Refactor general (limpiar `menu.data.ts`, revisar `customizable` hardcodeado)
- Vista desktop (actualmente mobile-first, desktop pendiente de rediseño)
- Autenticación y seguridad de la API
- Imágenes reales de productos (actualmente Unsplash placeholders)

---

## Flujo Principal del Usuario

```
Home → Menú → [Agregar productos / Personalizar] → Carrito (Drawer) → /confirmar-pedido → WhatsApp
```

### Flujo de personalización burger
1. Botón `"+ Agregar"` → agrega receta original directo
2. Botón `"Personalizar"` → abre `IngredientModalComponent`
3. Modal muestra ingredientes incluidos + extras disponibles del catálogo
4. Al confirmar → `CartService.addItem()` con snapshot de ingredientes

### Flujo de combo
1. Ícono ℹ️ → abre `ComboDetailModalComponent` (solo informativo)
2. Botón `"Agregar"` → verifica si hay detalles con `requiereSeleccion: true`
3. Si hay → abre `ComboModalComponent` N veces según `cantidad` (secuencial)
4. Al confirmar todo → `CartService.addCombo()` con `selectedVariants[]`

---

## Variables de Entorno (`environment.ts`)

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  whatsappNumber: '56XXXXXXXXX',
  localName: 'Burger Real',
  bankDetails: {
    ownerName: 'Daniel Esteban Arellano González',
    rut: '19.417.074-2',
    bank: 'Mercado Pago',
    accountType: 'Cuenta Vista',
    accountNumber: '1024130786',
    email: 'danielarellanogonzalez97@gmail.com',
  },
};
```

---

## Notas para Claude Code

- **Siempre ejecutar `ng build` al finalizar** para verificar que no hay errores de compilación
- Los cambios deben ser **quirúrgicos** — no tocar nada que no esté mencionado en el prompt
- Las imágenes de productos usan Unsplash como placeholder — no crear lógica para imágenes reales
- El número de WhatsApp en `environment.ts` debe reemplazarse con el número real antes del lanzamiento
- Para el futuro endpoint `GET /api/productos?categoria=HAMBURGUESA`, solo hay que cambiar la URL en `ProductoService.loadProducts()`