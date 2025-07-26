# TOTS Meet Assistant - Requerimientos del Proyecto

## 📋 Descripción General

TOTS Meet Assistant es un bot automatizado para Google Meet que proporciona transcripción en tiempo real, grabación de reuniones y generación de resúmenes inteligentes. El sistema utiliza automatización de navegador (Playwright) para integrarse directamente con Google Meet sin requerir APIs pagas o permisos especiales de administrador.

## ✅ Funcionalidades Implementadas y Funcionando

### 🤖 Bot Core (Completamente Funcional)
- **Conexión Automática a Google Meet**: 
  - Navegación automática a URLs de reuniones
  - Detección y manejo de salas de espera
  - Configuración automática de audio/video (silenciado por defecto)
  - Admisión automática cuando el host acepta
  - Tecnología stealth para evitar detección como bot

- **Sistema de Transcripción en Tiempo Real**:
  - Activación automática de subtítulos en Google Meet
  - Configuración automática de idioma español
  - Captura de transcripciones en tiempo real (cada 2 segundos)
  - Filtrado inteligente de elementos de UI y ruido
  - Detección automática de hablantes cuando está disponible
  - Sistema anti-duplicados con algoritmos de similitud
  - Manejo de texto acumulativo (actualización de transcripciones en progreso)
  - Persistencia y monitoreo continuo de subtítulos

- **Monitoreo de Reuniones**:
  - Detección de estado de reunión (activa/terminada)
  - Monitoreo de participantes
  - Reactivación automática de subtítulos si se desactivan
  - Verificación periódica de configuración de idioma

- **Sistema de Logs y Debugging**:
  - Logging detallado de todas las operaciones
  - Screenshots automáticos para debugging
  - Manejo robusto de errores
  - Estadísticas en tiempo real de transcripción

### 🔧 Arquitectura Técnica
- **Tecnologías**: Node.js, TypeScript, Playwright
- **Compatibilidad**: Windows (PowerShell), extensible a otros SO
- **Configuración**: Variables de entorno para URLs y configuración
- **Modularidad**: Código separado por responsabilidades (bot, transcripción, plataformas)

## 🎯 Funcionalidades a Desarrollar - Basadas en Feedback de Usuarios

### � Navegación Temporal con Video Sincronizado
**Qué debe hacer:**
- Agregar marcas de tiempo precisas (mm:ss) a cada línea de transcripción
- Permitir click en cualquier línea de transcripción para saltar a ese momento en el video
- Crear un índice navegable por timestamps
- Implementar buscador que muestre resultados con contexto temporal

**Estrategia de implementación:**
- Sincronizar timestamps del sistema de transcripción con inicio de grabación
- Desarrollar reproductor de video personalizado con API de control temporal
- Crear interfaz de transcripción interactiva con enlaces temporales
- Implementar motor de búsqueda que indexe contenido por tiempo

### 🌐 Sistema de Traducción Automática
**Qué debe hacer:**
- Detectar automáticamente segmentos en inglés dentro de transcripciones
- Traducir en tiempo real inglés → español manteniendo contexto
- Mostrar tanto texto original como traducción
- Conservar nombres propios y términos técnicos sin traducir

**Estrategia de implementación:**
- Integrar API de traducción (Google Translate, Azure Translator)
- Desarrollar detector de idioma por segmento de texto
- Crear sistema de caché para traducciones comunes
- Implementar post-procesamiento para preservar terminología específica

### 🎤 Comandos Vocales Interactivos
**Qué debe hacer:**
- Reconocer comando "Notetaker, anotá que [texto]" durante la reunión
- Marcar estas notas como destacadas en la transcripción final
- Proporcionar confirmación audible/visual del comando recibido
- Permitir comandos adicionales como "Notetaker, marca esto importante"

**Estrategia de implementación:**
- Implementar reconocimiento de voz local usando Web Speech API
- Crear sistema de detección de palabras clave "Notetaker"
- Desarrollar procesador de comandos con confirmación
- Integrar marcadores especiales en el flujo de transcripción

### 🧠 Memoria de Contexto Entre Reuniones
**Qué debe hacer:**
- Mantener historial de reuniones por proyecto/cliente
- Identificar continuidad de temas entre sesiones
- Recordar tareas pendientes y compromisos anteriores
- Proporcionar contexto relevante al inicio de nuevas reuniones

**Estrategia de implementación:**
- Crear base de datos de reuniones con metadatos de proyecto
- Desarrollar algoritmos de análisis de contenido para identificar temas recurrentes
- Implementar sistema de etiquetado automático de proyectos/clientes
- Crear motor de contexto que correlacione reuniones relacionadas

### � Mejora de Formato de Resúmenes
**Qué debe hacer:**
- Reorganizar estructura: Resumen General → Temas Clave → Próximos Pasos
- Hacer temas clave más concisos y en formato de lista simple
- Mejorar precisión de "próximos pasos" con asignación de responsables
- Eliminar formatos desplegables para lectura fluida

**Estrategia de implementación:**
- Rediseñar algoritmos de generación de resúmenes con nueva estructura
- Implementar detección de tareas y asignaciones con NLP
- Crear templates de formato optimizados para lectura rápida
- Desarrollar sistema de scoring para relevancia de temas

### 🔍 Filtrado Inteligente de Ruido
**Qué debe hacer:**
- Reducir significativamente ruido en highlights generados
- Identificar y filtrar contenido irrelevante (saludos, interrupciones técnicas)
- Mejorar detección de contenido accionable vs conversacional
- Mantener solo información verdaderamente útil para minutas

**Estrategia de implementación:**
- Desarrollar clasificador ML para identificar contenido relevante vs ruido
- Crear filtros basados en patrones de conversación (saludos, technical issues)
- Implementar análisis semántico para detectar contenido accionable
- Entrenar modelo con feedback de usuarios sobre calidad de highlights

### 🎯 Planificación Inteligente de Reuniones
**Qué debe hacer:**
- Sugerir agenda basada en historial de reuniones del proyecto
- Identificar tareas pendientes que necesitan seguimiento
- Recomendar participantes según el tema y histórico
- Detectar patrones de productividad y sugerir mejoras

**Estrategia de implementación:**
- Analizar patrones en reuniones anteriores para generar templates de agenda
- Crear sistema de seguimiento de tareas y compromisos
- Desarrollar algoritmo de recomendación de participantes
- Implementar dashboard de insights de productividad

### 📹 Grabación y Sincronización Mejorada
**Qué debe hacer:**
- Grabar audio, video y pantalla compartida de forma sincronizada
- Asegurar calidad de grabación optimizada para revisión posterior
- Crear archivos de video navegables temporalmente
- Permitir exportación en múltiples formatos

**Estrategia de implementación:**
- Mejorar configuración de grabación de Playwright para mayor calidad
- Implementar sincronización temporal precisa entre audio/video/transcripción
- Desarrollar sistema de post-procesamiento para optimizar archivos
- Crear exportador multi-formato con metadatos temporales

### 🎥 Sistema de Grabación de Reuniones
**Qué debe hacer:**
- Grabar automáticamente las reuniones a través del Bot usando Playwright
- Capturar audio y video de alta calidad durante la transcripción
- Generar archivos de grabación sincronizados con las transcripciones
- Proporcionar controles de inicio/parada de grabación desde el frontend
- Servir archivos grabados desde el backend para reproducción en dashboard
- Gestionar almacenamiento local con estructura organizada de archivos

**Workflow de Usuario:**
1. Usuario activa Chrome Extension en Google Meet
2. Extension envía invitación al Bot con URL de reunión
3. Bot se une automáticamente y comienza grabación + transcripción
4. Archivos se guardan localmente en servidor con timestamps sincronizados
5. Backend sirve archivos grabados como endpoints HTTP para frontend
6. Dashboard permite reproducir videos/audios directamente desde archivos locales

**Estrategia de implementación:**
- **Chrome Extension Integration**: Modificar extension para enviar URLs de reunión al backend
- **Bot Recording**: Usar Playwright para grabar audio/video durante participación en Meet
- **Local Storage System**: Almacenar archivos en estructura organizada en filesystem local
- **File Serving Backend**: Crear endpoints para servir archivos grabados como streaming HTTP
- **Frontend Player**: Integrar reproductor de video/audio en dashboard que consuma endpoints
- **Timestamp Synchronization**: Sincronizar perfectamente grabación con transcripción en tiempo real

**Arquitectura de Almacenamiento Local:**
```
📁 recordings/
  📁 2025-01-26/
    📁 meeting-abc123/
      🎥 recording.mp4     # Video completo de la reunión
      🎵 audio.mp3         # Audio extraído/optimizado
      📄 transcript.json   # Transcripción con timestamps
      📊 metadata.json     # Información de la reunión
```

**Características técnicas:**
- **Grabación Multi-formato**: Audio MP3 + Video MP4 simultáneos
- **Sincronización Precisa**: Timestamps exactos entre transcripción y grabación
- **Almacenamiento Local**: Filesystem del servidor, no base de datos
- **Serving de Archivos**: Endpoints HTTP para streaming de media files
- **Calidad Configurable**: Opciones de resolución y bitrate
- **Procesamiento Post-Grabación**: Compresión automática para optimizar tamaño
- **Frontend Integration**: Reproductor integrado en dashboard con controles temporales
- **Chrome Extension Workflow**: Invitación automática del bot desde Meet interface

**Endpoints de Backend:**
- `GET /api/recordings/:meetingId/video` - Servir archivo MP4
- `GET /api/recordings/:meetingId/audio` - Servir archivo MP3
- `GET /api/recordings/:meetingId/metadata` - Información de la grabación
- `POST /api/meetings/invite-bot` - Endpoint para Chrome Extension

## 🚀 Roadmap de Desarrollo

### Fase 2a - Sistema de Grabación y Mejoras Core (2-3 meses)
**Prioridad Alta - Funcionalidades Críticas para Adopción**
- **Implementar sistema de grabación completo**: Chrome Extension → Bot → Local Storage → Frontend Player
- **Chrome Extension Integration**: Modificar extension para invitar bot automáticamente
- **Local File Storage**: Sistema de almacenamiento en filesystem local con endpoints HTTP
- **Frontend Video Player**: Reproductor integrado en dashboard para archivos grabados
- Implementar marcas de tiempo sincronizadas en transcripción
- Desarrollar navegación bidireccional video ↔ transcripción
- Crear sistema de filtrado inteligente de ruido
- Mejorar algoritmos de generación de resúmenes y próximos pasos

### Fase 2b - Navegación Temporal y Optimización (1-2 meses)
**Funcionalidades de Usabilidad Avanzada**
- **Navegación Temporal**: Click en transcripción salta a momento exacto en video
- **Controles de Grabación**: Botones start/stop desde dashboard con estados en tiempo real
- Sistema de comandos vocales ("Notetaker, anotá...")
- Traducción automática inglés → español en tiempo real
- Búsqueda avanzada en transcripciones con timestamps
- Mejoras de formato según feedback (estructura reorganizada)

### Fase 2c - Memoria y Contexto (2-3 meses)
**Inteligencia Contextual**
- Base de datos de reuniones y proyectos
- Sistema de memoria entre reuniones
- Análisis de continuidad de temas
- Planificación inteligente con sugerencias de agenda

### Fase 3 - Optimización y Expansión (2-3 meses)
**Mejoras Avanzadas y Migración Cloud**
- **Migración a Cloud Storage**: AWS S3 o Google Cloud para almacenamiento escalable
- **Grabación multi-formato avanzada**: Pantalla compartida, múltiples calidades, streaming
- Dashboard de gestión avanzado de reuniones con analytics
- APIs para integraciones externas (Calendar, Slack, etc.)
- Sistema de post-procesamiento con IA para highlights automáticos

---

## 🎯 Próximos Pasos Inmediatos

1. **Implementar sistema de grabación local** - Modificar bot para capturar audio/video con Playwright
2. **Chrome Extension Integration** - Agregar funcionalidad para invitar bot desde Meet interface
3. **Backend File Serving** - Crear endpoints para servir archivos grabados como HTTP streams
4. **Frontend Video Player** - Integrar reproductor en dashboard que consuma endpoints locales
5. **Timestamp Synchronization** - Sincronizar perfectamente grabación con transcripción
6. **Local Storage Architecture** - Implementar estructura de archivos organizada en filesystem

**Decisiones Técnicas Confirmadas:**
- ✅ **Almacenamiento Local**: Filesystem local para MVP, migración a cloud en Fase 3
- ✅ **Serving Strategy**: Backend endpoints HTTP para streaming de archivos a frontend
- ✅ **Integration Workflow**: Chrome Extension → Backend API → Bot Invitation → Recording
- ✅ **File Organization**: Estructura por fecha/meeting con metadata JSON

El roadmap se enfoca primero en el sistema de grabación básico con almacenamiento local, validando la funcionalidad antes de migrar a soluciones cloud más complejas.
