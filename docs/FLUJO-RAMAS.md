# 🌿 Flujo de ramas y publicación

Cómo llevar un cambio desde tu computador hasta los clientes, sin romper el sitio.

```
feature/…  ──PR──►  dev  ──PR──►  master  ──►  Netlify (producción)
 (trabajo)        (pruebas)      (clientes)       burgerreal.netlify.app
```

| Rama | Para qué | Dónde se ve |
|---|---|---|
| `master` | Lo que usan los clientes. **Nunca se hace commit directo.** | https://burgerreal.netlify.app |
| `dev` | Base de todo cambio y lugar de prueba antes de publicar. **Nunca se hace commit directo.** | https://dev--burgerreal.netlify.app *(si los Branch deploys están activos)* |
| `feature/…`, `fix/…`, `docs/…` | Una rama por cambio. Nace desde `dev` y se borra al terminar. | Deploy Preview del Pull Request |

**Nombres de rama:** `feature/` para algo nuevo, `fix/` para corregir un error, `docs/` para documentación,
`perf/` para rendimiento. Ejemplos: `feature/salsas-extra`, `fix/precio-aritos`.

---

## 1. Hacer un cambio

```bash
git checkout dev
git pull origin dev                      # partir siempre desde lo último
git checkout -b feature/nombre-del-cambio
```

Trabaja y haz **un commit por punto**, con el formato `tipo(ámbito): resumen` (ver `CLAUDE.md`).
Antes de subir, verifica:

```bash
pnpm test:ci
pnpm build
```

Sube la rama:

```bash
git push -u origin feature/nombre-del-cambio
```

## 2. Llevarlo a `dev`

1. En GitHub: **Pull requests → New pull request**, con **base: `dev`** ← **compare: `feature/nombre-del-cambio`**.
2. Espera el **Deploy Preview** de Netlify (aparece como un check en el PR) y prueba ahí.
3. Merge con **"Create a merge commit"**.
4. Botón **"Delete branch"** (los commits ya quedaron en `dev`).

> ⚠️ Nunca uses **"Squash and merge"**, porque junta todos los commits en uno y se pierde el registro de cada punto.
> Tampoco **"Rebase and merge"**, porque cambia los identificadores de los commits.

## 3. Publicar: `dev` → `master`

Cuando `dev` está probado (en su sitio de pruebas o con `pnpm start`):

1. **New pull request**, con **base: `master`** ← **compare: `dev`**, y un título como *"Release v1.1.0: …"*.
2. Merge con **"Create a merge commit"**. Netlify publica `master` automáticamente en 1-2 minutos.
3. Abre https://burgerreal.netlify.app/menu y confirma que todo se ve bien.

## 4. Volver a alinear `dev` con `master`

El merge del paso 3 crea un commit que solo queda en `master`. Para que `dev` no quede "1 commit atrás":

```bash
git fetch origin
git checkout dev
git pull origin dev
git merge origin/master        # solo avanza, no hay conflictos
git push origin dev
```

## 5. Marcar la versión

En GitHub: **Releases → Draft a new release**, con el **tag** nuevo sobre `master`, un título y el resumen
de cambios. O desde la terminal:

```bash
git checkout master
git pull origin master
git tag -a v1.1.0 -m "Descripción corta de la versión"
git push origin v1.1.0
```

**Cómo numerar** (`vMAYOR.MENOR.PARCHE`):
- **PARCHE** (`v1.0.1`): corrección de un error o ajuste de textos, precios o fotos.
- **MENOR** (`v1.1.0`): algo nuevo para el cliente (ej. salsas extra, otro método de pago).
- **MAYOR** (`v2.0.0`): un cambio grande de funcionamiento (ej. conectar el backend).

Versiones publicadas: `v1.0.0` (lanzamiento del MVP).

---

## Arreglo urgente en producción (hotfix)

Si algo falla en el sitio de los clientes y no puede esperar a pasar por `dev`:

```bash
git checkout master
git pull origin master
git checkout -b fix/descripcion-del-error
# … arreglar, commit, pnpm test:ci && pnpm build …
git push -u origin fix/descripcion-del-error
```

1. PR **`fix/…` → `master`** y merge.
2. PR **`master` → `dev`** (o el paso 4), para que `dev` también tenga el arreglo.
3. Tag de parche (`v1.0.1`).

## Cambios rápidos desde el celular (GitHub web)

Para cambios mínimos, como marcar un producto agotado:
1. En GitHub, cambia a la rama `dev`, abre el archivo y toca el lápiz ✏️.
2. Al guardar, elige **"Create a new branch for this commit and start a pull request"**.
3. Sigue con los pasos 2 a 5.

Si es urgente (ej. algo se agotó en pleno servicio), puedes hacerlo como hotfix sobre `master`
y después alinear `dev` (paso 4).

---

## Configuración de Netlify (referencia)

**Site configuration → Build & deploy → Continuous deployment → Branches and deploy contexts:**
- **Production branch:** `master`
- **Branch deploys:** "Let me add individual branches" → `dev`
- **Deploy Previews:** "Any pull request against your production branch / branch deploy branches"
