# CLAUDE.md

Guía técnica para agentes de código (Claude Code, Antigravity, etc.) trabajando en TrofiApp. Para contexto de producto y setup ver [README.md](README.md).

## Qué es esto

App Expo/React Native para gestión de ligas amateur de fútbol: ligas, torneos, equipos, jugadores, árbitros, sponsors, partidos "pickup", chat, notificaciones y panel superadmin.

## Stack

Expo Router (file-based, `app/`) · TanStack Query con persistencia en AsyncStorage · Zustand · React Hook Form + Zod · i18next (`en`/`es`) · Sentry · react-native-maps · expo-updates (OTA). Ver detalle de versiones en [package.json](package.json).

## Arquitectura: `components/` vs `features/`

Cada dominio funcional (`leagues`, `matches`, `teams`, `tournaments`, `players`, `referees`, `sponsors`, `pickup`, `chat`, `notifications`, `superadmin`, `achievements`, `announcements`, `market`, `nearby`, `venues`, `discipline`, `auth`, `share`) se divide en dos carpetas paralelas:

- **`components/<dominio>/`** — UI presentacional: widgets, modales, headers. Sin lógica de fetching ni validación.
- **`features/<dominio>/`** — lógica de dominio. Subcarpetas usadas según necesidad (no todas existen en todos los dominios):
  - `schemas/` — validación con Zod
  - `services/` — llamadas a la API, siempre sobre el cliente base `services/api.ts`
  - `types/` — tipos TypeScript del dominio
  - `store/` — estado global con Zustand (hoy solo existe en `auth`, para `authStore`)
  - `hooks/` — hooks específicos del dominio (hoy solo en `chat`)

**Regla al agregar código nuevo**: UI → `components/<dominio>`; validación/API/tipos/estado → `features/<dominio>` en la subcarpeta que corresponda. Si el dominio es nuevo, crear ambas carpetas replicando el patrón. No mezclar llamadas a `fetch`/`api` directamente dentro de componentes de `components/`.

Carpetas transversales:

- `app/` — solo rutas (Expo Router). Un archivo/carpeta = una pantalla. Grupos `(auth)` y `(tabs)` controlan navegación condicional.
- `context/` — contextos de React globales (hoy: `ThemeContext`).
- `hooks/` — hooks compartidos entre dominios (`useDebounce`, `useMatchLiveUpdate`, color scheme).
- `services/` — servicios transversales no atados a un dominio: `api.ts` (cliente HTTP), `logger.ts`, `metrics.ts`, `locationService.ts`, `notifications.ts`, `queryClient.ts`, `queryPersister.ts`.
- `constants/` — `theme.ts` (paletas) y `layout.ts` (helpers de escalado).

Alias de import: `@/*` apunta a la raíz del repo (ver `tsconfig.json`). Preferir `@/features/...` / `@/components/...` sobre paths relativos largos.

## Cliente API y auth

`services/api.ts` es el único punto de entrada HTTP: implementa silent refresh de tokens (cola de requests fallidos mientras se refresca). Usa `EXPO_PUBLIC_API_URL` como base (default `http://localhost:8000/api`). El estado de sesión vive en `features/auth/store/authStore.ts` (Zustand) y se inicializa en `app/_layout.tsx` (`initialize()`), que decide el flujo `(auth)` → `onboarding` → `(tabs)` según `isAuthenticated` y la flag `has_seen_onboarding` en AsyncStorage.

## Theming

`context/ThemeContext.tsx` expone `ThemeProvider` + `useTheme()` — es el nodo con más fan-in del proyecto (casi todo componente lo consume). Dos paletas en `constants/theme.ts`:

- Oscuro — **"Neon Night"** (cian neón sobre navy)
- Claro — **"Oceanic Pro"** (cian oceánico de alto contraste)

Persistencia en AsyncStorage; si no hay preferencia guardada, sigue `Appearance` del sistema. **Todo componente nuevo debe consumir colores vía `useTheme()`**, nunca hardcodear hex/rgb.

## Escalado responsive

`constants/layout.ts` expone `scale()` (basado en ancho, para paddings/márgenes horizontales e íconos) y `verticalScale()` (basado en alto, para alturas de cards y márgenes verticales), calculados contra un baseline de iPhone 11/12/13/14 (375×812). Usarlos en vez de valores fijos en `StyleSheet` cuando el tamaño deba adaptarse entre dispositivos.

## i18n

`i18next` + `react-i18next`, configurado en `i18n/index.ts`. Locales en `i18n/locales/` (`en.json`, `es.json`). El idioma guardado se carga en `app/_layout.tsx` vía `loadSavedLanguage()`.

## Variables de entorno

Ver [.env.example](.env.example) para la lista completa con descripciones. Copiar a `.env` (o `.env.local` para overrides no versionados).

> Nota: `app/_layout.tsx` tiene un DSN de Sentry hardcodeado como fallback si `EXPO_PUBLIC_SENTRY_DSN` no está definida. Preferir siempre setear la env var explícitamente en vez de depender del fallback.

## Comandos

```bash
pnpm install        # instalar dependencias
npx expo start      # dev server (a/i/w para Android/iOS/Web)
pnpm lint           # eslint (eslint-config-expo)
```

No hay framework de testing configurado (sin Jest/Testing Library en `package.json`). No asumir que existen tests ni intentar correrlos.

## Despliegue / OTA

Detalle completo en el README, sección "Actualizaciones y Despliegues". Resumen: `eas update --branch preview` publica JS/assets; el cliente aplica un "update gate" en el arranque (`useUpdateGate` en `app/_layout.tsx`) que fuerza descargar y aplicar la última versión antes de mostrar la app (con timeout de 5s), en vez de esperar a que el usuario toque un botón.

## Skills de agentes

`.agents/skills/` contiene skills instaladas (ver `skills-lock.json`), varias con foco en diseño/mobile que se solapan: `mobile-design`, `mobile-ios-design`, `react-native-design`, `expo-design-system`, `expo-ui`, `expo-native-ui`. Sin un criterio único documentado todavía sobre cuál preferir — ante la duda, usar la más específica al contexto (ej. `mobile-ios-design` para pantallas puramente iOS/HIG) y evitar aplicar dos skills de diseño en simultáneo sobre el mismo componente.

## Convenciones generales

- No introducir un framework de estado nuevo (Redux, MobX, etc.) — el estándar es Zustand + TanStack Query.
- No hardcodear colores ni tamaños fijos que deberían venir de `useTheme()` / `constants/layout.ts`.
- Todo request HTTP nuevo pasa por `services/api.ts`, no por `fetch` directo.
- Nombres de dominio en `components/` y `features/` deben coincidir (mismo string) para mantener la trazabilidad UI ↔ lógica.
