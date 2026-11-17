# Zircon · Joyería corporal

Web de **Zircon Joyería Corporal** (Instagram [@zirconpiercingba](https://www.instagram.com/zirconpiercingba/), WhatsApp 11 5055-9609).

## Qué tiene

- **Catálogo completo** (386 piezas sacadas del *Catálogo minorista 2026-10-13*): foto, nombre, código, descripción y precio de lista.
  - 11 secciones: Tops y labrets · Argollas y clickers · Oro 14K · Barbells e industrial · Ombligo · Nostril · Push pin · Microdermal · Cadenas · Hangings · Accesorios y cuidado.
  - Subfiltros (por ejemplo, en Tops: Brillos y cristales / Ópalos y color / Metal liso / Colgantes y cadenas), buscador por nombre o código y orden por precio.
  - Ficha de cada pieza con link propio (`#pieza=top-lily`) para compartir.
- **Favoritos** (corazón) y **Mi consulta** (lista de piezas que se manda armada por WhatsApp con el total estimado).
- **Pedido de turno**: formulario que guarda el pedido en la base y abre WhatsApp con el resumen.
- **Cuenta opcional** (registro e inicio de sesión): guarda favoritos en cualquier dispositivo y muestra los turnos pedidos y las consultas enviadas.
- **Panel del local** (`/admin.html`): lista de turnos con estado (pendiente, confirmado, realizado, cancelado), botón para escribirle al cliente por WhatsApp, métricas y piezas más guardadas en favoritos.
- Guía de perforaciones por zona, cuidados, preguntas frecuentes, ubicación con mapa y botón flotante de WhatsApp.

## Cómo está hecho

- Sitio estático (`index.html`, `assets/`, `data/catalogo.json`, `img/`) + funciones de Vercel en `api/` (Node 20+).
- Base de datos: **Postgres de Vercel (Neon)**. Las tablas se crean solas la primera vez (ver `schema.sql`).
- Contraseñas con bcrypt; sesión en cookie firmada `HttpOnly` de 30 días.

## Puesta en marcha en Vercel

1. **Add New → Project** e importar el repo `webs-clientes`. En *Root Directory* elegir `zircon-piercing`. Framework: *Other*.
2. En el proyecto: **Storage → Create Database → Neon (Postgres)** y conectarla al proyecto. Eso crea la variable `DATABASE_URL`.
3. En **Settings → Environment Variables** agregar:
   - `SESSION_SECRET`: un texto largo y aleatorio (mínimo 32 caracteres). Por ejemplo, el resultado de `openssl rand -base64 48`.
   - `ADMIN_EMAILS`: los emails del equipo que pueden entrar al panel, separados por coma (ej. `zircon@gmail.com`).
4. **Redeploy**. Después, crear una cuenta en la web con uno de los emails de `ADMIN_EMAILS` y entrar a `/admin.html`.

Sin base configurada la web funciona igual (catálogo, favoritos en el navegador, consulta y turnos por WhatsApp); solo las cuentas y el registro de turnos quedan desactivados.

## Actualizar el catálogo

Los datos están en `data/catalogo.json` (un objeto por pieza: `id`, `n` nombre, `c` código, `p` precio, `d` descripción, `s` sección, `sub` subsección, `col` colores) y las fotos en `img/p/<id>.webp`. Para cambiar un precio alcanza con editar `p`.

## Para confirmar con el cliente

- Ubicación exacta dentro del Shopping Alto Avellaneda y horarios de atención (hoy la web dice "atendemos con turno, consultá horarios por WhatsApp").
- Si hay precios con descuento por efectivo o transferencia.
- Los tiempos de cicatrización de la guía son orientativos y generales; conviene que el piercer los revise.
