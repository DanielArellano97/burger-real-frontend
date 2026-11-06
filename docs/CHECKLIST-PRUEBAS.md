# ✅ Checklist de pruebas antes de publicar

Recórrelo en **un iPhone (Safari)** y **un Android (Chrome)** sobre el sitio publicado
en Netlify (o en el *Deploy Preview* de la rama). Marca cada punto con `[x]`.

> **Tip para probar fuera de horario:** el horario solo se puede simular en desarrollo
> (`pnpm start` → `http://localhost:4200/menu?hora=19:30&fecha=2026-11-05`).
> En el sitio publicado, prueba entre **18:00 y 22:00**.

---

## 1. Primera impresión

- [ ] El link compartido por WhatsApp muestra **foto, título y descripción** (vista previa).
- [ ] El ícono de la pestaña es el **logo de Burger Real**.
- [ ] "Agregar a pantalla de inicio" muestra el logo (iPhone y Android).
- [ ] El home carga rápido y el botón lleva al menú.
- [ ] Las fotos del menú se ven **nítidas** (no pixeladas) y sin saltos al cargar.

## 2. Menú

- [ ] Las pestañas (Hamburguesas / Acompañamientos / Bebestibles) siguen el scroll.
- [ ] Desde el home, cada categoría lleva directo a su sección (`?cat=`).
- [ ] Tocar una foto la abre en grande; se cierra bien.
- [ ] **Burger de la semana**: de lunes a jueves muestra precio de oferta y "+ Agregar";
      de viernes a domingo muestra "Lunes a Jueves".

## 3. Hamburguesas

- [ ] "+ Agregar" suma la receta original; el contador `− 1 +` funciona.
- [ ] "Personalizar": quitar ingredientes **no baja** el precio.
- [ ] Subir un ingrediente sobre la receta suma su precio extra.
- [ ] Extras (ej. Palta) suman su precio; Pepinillos es un interruptor sí/no y gratis.
- [ ] Al quitar casi todo aparece el aviso "hamburguesa muy solita".
- [ ] Dos burgers con distinta personalización quedan como **líneas separadas**.

## 4. Acompañamientos y bebidas

- [ ] Papas: 150g $1.990 · 250g $2.990 · 300g $3.990.
- [ ] Aritos y deditos: precio correcto por porción.
- [ ] Bebidas: "Agregar" y contador `− 1 +`.

## 5. Combos

- [ ] El ícono **i** muestra qué incluye cada combo (con papas incluidas).
- [ ] Combo de 1 bebida: pide elegir la bebida.
- [ ] Combo de 2 bebidas (Doble Bacon / Real Real): pide **paso 1 de 2 y 2 de 2**,
      y el botón "Atrás" recuerda la elección anterior.
- [ ] El carrito muestra las bebidas elegidas (ej. "Coca-Cola ×2").

## 6. Carrito

- [ ] El ícono del carrito muestra la cantidad y "rebota" al agregar.
- [ ] Editar (lápiz) una burger o acompañamiento abre el modal con lo elegido.
- [ ] Sumar / restar / eliminar línea / "Vaciar carrito" (con confirmación).
- [ ] **Cerrar el navegador y volver**: el carrito sigue ahí, con los mismos precios.

## 7. Confirmar pedido

- [ ] Nombre con números o símbolos raros → no deja continuar.
- [ ] Teléfono: el `+569` queda fijo; pegar `+56 9 1234 5678` se formatea solo.
- [ ] En iPhone, al tocar los campos **no hace zoom**.
- [ ] **Retiro**: total = productos.
- [ ] **Delivery con GPS**: pide permiso, muestra km y precio del tramo,
      y el link "Ver mapa" abre la ruta en Google Maps.
- [ ] **Delivery sin GPS**: obliga a escribir la dirección; el total dice
      "por confirmar".
- [ ] Más de 10 km: avisa "fuera del radio de reparto" y no deja enviar.
- [ ] **Efectivo**: el monto se formatea ($20.000) y calcula el vuelto; un monto
      menor al total no deja enviar.
- [ ] **Transferencia**: "Copiar datos" copia todo al portapapeles.

## 8. Envío por WhatsApp

- [ ] Abre WhatsApp con el mensaje completo hacia el número del local.
- [ ] El mensaje coincide con el carrito: cantidades, personalizaciones, combos,
      bebidas elegidas, delivery, pago y **total correcto**.
- [ ] Después de enviar, el carrito queda vacío y vuelve al menú.
- [ ] Si el navegador bloquea WhatsApp, aparece el **enlace de respaldo** y el carrito
      **no** se borra.

## 9. Horario (18:00 a 22:00, hora de Chile)

- [ ] Fuera de horario: el menú se ve, aparece "Estamos cerrados" y **no se puede
      agregar** nada.
- [ ] Fuera de horario: en "Confirmar pedido" el botón de enviar está desactivado.
- [ ] A las 18:00 se habilita todo sin recargar (máx. 30 segundos de espera).

## 10. Agotados (si marcaste alguno con `disponible: false`)

- [ ] El producto muestra "Agotado" y no tiene botones para agregar.
- [ ] Los combos que lo incluyen aparecen "Agotado".
- [ ] Una bebida agotada no aparece al elegir bebida en un combo.

---

**Si algo falla:** anota el celular, el navegador y los pasos para repetirlo.
