# TrofiApp 🏆

**TrofiApp** es una app Expo/React Native para la gestión y descubrimiento de ligas de fútbol amateur (ligas, torneos, equipos, jugadores, árbitros, sponsors, partidos "pickup", chat, notificaciones y panel superadmin).

Este documento es la referencia técnica del repositorio: stack, arquitectura, variables de entorno y flujo de despliegue. Para el pitch de producto/features de cara al usuario, ver el copy de la store.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Expo](https://expo.dev) 57 / React Native 0.86 / React 19
- **Navegación**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based, carpeta `app/`)
- **Data fetching / cache**: TanStack Query, con persistencia en AsyncStorage (`services/queryClient.ts`, `services/queryPersister.ts`)
- **Estado global**: Zustand
- **Formularios**: React Hook Form + Zod (`@hookform/resolvers`)
- **Estilos**: StyleSheet de React Native con sistema de theming propio (ver [Theming](#-theming))
- **Iconografía**: Lucide React Native
- **i18n**: i18next / react-i18next (`en`, `es` en `i18n/locales/`)
- **Observabilidad**: Sentry (`@sentry/react-native`)
- **Mapas**: react-native-maps (Google Maps)
- **Actualizaciones**: expo-updates (OTA vía EAS Update)

---

## 📁 Estructura del proyecto

```
app/            Rutas de Expo Router (file-based). Cada archivo/carpeta = una pantalla.
components/     UI presentacional, organizada por dominio (widgets, modales, headers).
features/       Lógica de dominio: schemas (Zod), services (llamadas a API), types.
context/        Contextos globales de React (ej. ThemeContext).
hooks/          Hooks compartidos (useDebounce, useMatchLiveUpdate, color scheme, etc.)
services/       Servicios transversales: cliente API, logger, métricas, ubicación, notificaciones.
constants/      Constantes compartidas (theme, layout/scaling).
i18n/           Configuración de i18next y locales (en/es).
.agents/        Configuración de MCP y skills para agentes de código (Claude/Antigravity).
```

### `components/<dominio>` vs `features/<dominio>`

El proyecto separa **presentación** de **lógica de dominio** dentro de cada dominio funcional (`leagues`, `matches`, `teams`, `tournaments`, `players`, `referees`, `sponsors`, `pickup`, `chat`, `notifications`, `superadmin`, `achievements`, `announcements`, `market`, `nearby`, `venues`, `discipline`):

- **`components/<dominio>/`**: componentes de UI — widgets, modales, headers. Ej. `components/leagues/StandingsWidget.tsx`.
- **`features/<dominio>/`**: capa de lógica, con subcarpetas fijas:
  - `schemas/` — validación con Zod
  - `services/` — llamadas a la API (usan `services/api.ts` como cliente base)
  - `types/` — tipos TypeScript del dominio

Al agregar una pantalla nueva de un dominio existente: la UI va en `components/<dominio>`, la validación/API/tipos van en `features/<dominio>`. Si es un dominio nuevo, replicar ambas carpetas con esta misma convención.

---

## 🎨 Theming

`context/ThemeContext.tsx` expone `ThemeProvider` + `useTheme()` (es el nodo con más fan-in del proyecto — casi todo componente lo consume). Maneja dos paletas definidas en `constants/theme.ts`:

- **Oscuro — "Neon Night"**: cian neón sobre fondos navy.
- **Claro — "Oceanic Pro"**: cian oceánico de alto contraste.

La preferencia del usuario se persiste en `AsyncStorage` y, si no hay nada guardado, sigue el `Appearance` del sistema. Cualquier componente nuevo debe consumir colores vía `useTheme()`, no hardcodear valores.

---

## 🌐 i18n

Locales disponibles en `i18n/locales/`: `en.json`, `es.json`. Configuración en `i18n/index.ts`.

---

## 🔑 Variables de entorno

No hay `.env.example` en el repo todavía — estas son las variables detectadas en uso:

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `services/api.ts` | Base URL del backend. Default: `http://localhost:8000/api` |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | `app.config.js` | API key de Google Maps (Android), expuesta al cliente |
| `GOOGLE_MAPS_API_KEY` | `app.config.js` | Fallback de la key de Google Maps si no está la `PUBLIC` |
| `EXPO_PUBLIC_SENTRY_DSN` | Inicialización de Sentry | DSN del proyecto en Sentry |
| `EXPO_PUBLIC_DEBUG_LOGS` | `services/logger.ts` | Activa logs verbosos en desarrollo |
| `EXPO_OS` | Runtime de Expo | Inyectada por el propio Expo, no se configura manualmente |

Definir en `.env` / `.env.local` (ya usados en el repo, no versionados).

---

## 🚀 Instalación y Uso

1. **Instalar dependencias**
   ```bash
   pnpm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npx expo start
   ```

3. **Ejecutar en dispositivos**
   - Presiona `a` para Android (requiere emulador o dispositivo conectado).
   - Presiona `i` para iOS (requiere macOS y Xcode).
   - Presiona `w` para la versión Web.

4. **Lint**
   ```bash
   pnpm lint
   ```

> **Testing**: el proyecto no tiene actualmente un framework de tests configurado (sin Jest/Testing Library en `package.json`).

---

## 🔄 Actualizaciones y Despliegues (EAS & Chunk Recovery)

El proyecto cuenta con integración nativa para actualizaciones **Over-The-Air (OTA)** y recuperación de errores en caliente para garantizar que los usuarios siempre tengan la versión más reciente sin interrupciones.

### 📲 Actualizaciones OTA (EAS Update)
Utilizamos **EAS Update** para enviar actualizaciones de JavaScript y assets en segundo plano.
- **Comando para publicar en pruebas (Preview):**
  ```bash
  eas update --branch preview --message "Descripción de los cambios"
  ```
- **Flujo de Usuario:**
  - Cuando se detecta un nuevo update en segundo plano, la app mostrará un banner premium en la parte inferior informando *"Instalando mejoras..."*.
  - Una vez descargado completamente, aparecerá un botón de **"Actualizar"** que reiniciará la app instantáneamente con el código nuevo utilizando `Updates.reloadAsync()`.

### 🌐 Soporte para PWA y Recuperación de Chunks (Web)
Para emular el comportamiento de actualización de Service Workers en entornos PWA y evitar caídas cuando se realiza un nuevo despliegue web (donde los archivos compilados anteriores se eliminan del servidor):
- El `ErrorBoundary` global captura fallos de tipo `ChunkLoadError` o `Failed to fetch dynamically imported module`.
- En lugar de mostrar una pantalla de error, la aplicación realiza un reintento automático refrescando la ventana (`window.location.reload()`), descargando la versión más reciente del servidor de manera transparente para el usuario y asegurando que la PWA esté siempre actualizada.

---

## 🤖 Skills y agentes de código

El repo tiene `.agents/skills/` con skills instaladas para agentes (Claude Code, Antigravity, etc.), gestionadas en `skills-lock.json`. Hay varias con foco en diseño/mobile que se solapan (`mobile-design`, `mobile-ios-design`, `react-native-design`, `expo-design-system`, `expo-ui`, `expo-native-ui`); todavía no hay un criterio documentado sobre cuál preferir en cada caso.
