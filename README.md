# TrofiApp 🏆

**TrofiApp** es la plataforma definitiva para la gestión y descubrimiento de ligas de fútbol amateur, diseñada con una estética **Premium** y una experiencia de usuario fluida y dinámica. Esta aplicación permite a los jugadores mantenerse conectados con sus equipos, descubrir nuevas competiciones y seguir su rendimiento profesional como nunca antes.

---

## ✨ Características Principales

### 🏠 Dashboard de Inicio (Home)
- **Resumen Semanal**: Visualiza tus próximos partidos críticos en tarjetas de alto impacto.
- **KPIs en tiempo real**: Monitorea tu **Win Rate** y **Goles por Partido** con gráficos de tendencia.
- **Comunidad**: Lista rápida de jugadores destacados con acceso a sus perfiles.

### ⚽ Gestión de Ligas
- **Descubrimiento Inteligente**: Encuentra ligas cercanas basadas en tu ubicación.
- **Formatos de Juego**: Filtra por Soccer 11, Soccer 7 o Fútbol Sala.
- **Detalle de Competencia**: Acceso a tablas de posiciones, calendarios y estadísticas de la liga.

### 🛡️ Gestión de Equipos
- **Mis Equipos**: Panel dedicado para gestionar tus equipos activos.
- **Roster Management**: Administra la alineación y los miembros de tu equipo.
- **Acción Rápida**: Botón Flotante (FAB) para crear o unirte a nuevos equipos de forma instantánea.

### 👤 Perfil del Jugador (Ultimate Card)
- **Tarjeta Ultimate**: Una representación visual estilo "FIFA Card" con tu rating y estadísticas detalladas (PAC, SHO, PAS, DRI, DEF, PHY).
- **Historial de Partidos**: Registro detallado de tus últimos encuentros con calificaciones de desempeño.
- **Tendencia de Rendimiento**: Gráfico interactivo que muestra tu evolución en los últimos 10 juegos.

### 🔍 Explorar y Buscar
- **Motor de Búsqueda**: Encuentra ligas, equipos o jugadores específicos.
- **Sugerencias de IA**: Ligas en tendencia y equipos recomendados para ti.

---

## 🎨 Sistema de Diseño "Premium"

TrofiApp utiliza un sistema de diseño propio enfocado en la **identidad visual** y la **legibilidad**:

- **Modo Oscuro (Neon Night)**: Estética inspirada en interfaces futuristas con colores cian neón sobre fondos navy profundos.
- **Modo Claro (Oceanic Pro)**: Optimizado para alta legibilidad con un color **Cian Oceánico** de alto contraste y sombras suaves que dan profundidad a las tarjetas.
- **Tipografía Moderna**: Uso de fuentes robustas y pesos variables para una jerarquía de información clara.
- **Micro-interacciones**: Gradientes dinámicos y sombras reactivas que mejoran la sensación táctil de la interfaz.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Expo](https://expo.dev) / React Native
- **Navegación**: [Expo Router](https://docs.expo.dev/router/introduction) (Basada en archivos)
- **Estilos**: StyleSheet de React Native con sistema de temas dinámico.
- **Iconografía**: [Lucide React Native](https://lucide.dev)
- **Componentes Visuales**: Expo Linear Gradient para acabados premium.

---

## 🚀 Instalación y Uso

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npx expo start
   ```

3. **Ejecutar en dispositivos**
   - Presiona `a` para Android (requiere emulador o dispositivo conectado).
   - Presiona `i` para iOS (requiere macOS y Xcode).
   - Presiona `w` para la versión Web.

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

**TrofiApp** - *Lleva tu liga amateur al siguiente nivel.* 🚀
