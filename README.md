# 🍔 Burger Real — Ecommerce Mobile-First

**Sabor Casero** — Aplicación Angular 22 para pedidos de hamburguesería vía WhatsApp.

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | v22.22.3, v24.15.0 o v26.0.0 |
| pnpm        | 11.x           |
| Angular CLI | 22.x           |

> **Importante:** Angular 22 requiere Node.js v22.22.3+. Verificá tu versión con `node --version`.

---

## Instalación y ejecución

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo (http://localhost:4200)
pnpm start

# Compilar para producción
pnpm build
```

---

## Configurar el número de WhatsApp

Editá `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  whatsappNumber: '56XXXXXXXXX',  // Reemplazá con el número real (sin + ni espacios)
  localName: 'Burger Real',
};
```

Formato: código de país + número sin espacios. Ejemplo Chile: `'56912345678'`

---

## Agregar o editar productos

Editá `src/app/core/data/menu.data.ts`. Estructura de cada producto:

```ts
{
  id: 17,
  name: 'Nombre del producto',
  description: 'Descripción corta',
  price: 5990,               // Precio en pesos (número entero)
  category: 'hamburguesas',  // 'hamburguesas' | 'acompañamientos' | 'bebestibles' | 'extras'
  image: 'images/foto.webp', // Opcional
}
```

---

## Reemplazar imágenes de productos

1. Copiá la imagen a `public/images/` (soporta `.webp`, `.jpg`, `.png`)
2. Referenciala en `menu.data.ts`:
   ```ts
   image: 'images/mi-hamburguesa.webp'
   ```

Si un producto no tiene imagen, se muestra un placeholder automáticamente.

---

## Agregar el logo

Copiá `logo-burger-real.webp` (con fondo transparente) a `public/images/`.
Se usa en el navbar y en el hero. Si no existe, la app muestra un emoji 🍔 como fallback.

---

## Estructura de carpetas

```
src/
  environments/
    environment.ts              ← Configuración (WhatsApp, nombre del local)
  app/
    core/
      data/menu.data.ts         ← Mock data de productos y categorías
      models/
        product.model.ts        ← Interface Product
        cart-item.model.ts      ← Interface CartItem
      services/
        cart.service.ts         ← Estado global del carrito (Angular signals)
        whatsapp.service.ts     ← Construcción y envío del pedido
    features/
      home/                     ← Página de inicio (hero, beneficios, categorías)
      menu/                     ← Página de menú con tabs por categoría
      cart/cart-drawer.component.ts ← Panel deslizante del carrito
    shared/components/
      navbar/                   ← Navbar fija con badge reactivo
      product-card/             ← Tarjeta de producto con controles de cantidad
  styles.css                    ← Variables de marca, animaciones, Tailwind v4
public/images/                  ← Assets (logo, fotos de productos)
```

---

## Stack tecnológico

- **Angular 22** — Standalone components, signals para estado reactivo
- **Tailwind CSS v4** — Variables CSS de marca (`--color-brand-*`, `--font-*`)
- **Angular CDK** — Focus trap accesible en el drawer del carrito
- **@lucide/angular** — Iconografía SVG
