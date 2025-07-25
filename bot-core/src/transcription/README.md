# Sistema de Transcripción para Google Meet

Este módulo implementa la captura automática de transcripciones en reuniones de Google Meet utilizando Playwright y técnicas avanzadas de web scraping.

## Características

- ✅ **Transcripción automática**: Captura subtítulos automáticos de Google Meet
- ✅ **Detección de hablantes**: Intenta identificar quién está hablando
- ✅ **Tiempo real**: Procesamiento continuo durante la reunión
- ✅ **Multi-idioma**: Soporte para español e inglés
- ✅ **Exportación**: Genera transcripciones en formato texto
- ✅ **Estadísticas**: Resúmenes y métricas de la transcripción
- ✅ **Control dinámico**: Pausar/reanudar transcripción en tiempo real

## Uso Básico

### Integración en el Bot Principal

```typescript
import { MeetingBot } from './bot';

const bot = new MeetingBot({
  meetingUrl: 'https://meet.google.com/abc-defg-hij',
  botName: 'TOTS Transcription Bot',
  headless: false
});

await bot.start();

// Obtener transcripciones en tiempo real
setInterval(() => {
  const transcriptions = bot.getTranscriptions();
  console.log(`Total: ${transcriptions.length} transcripciones`);
}, 30000);
```

### Uso Directo del Sistema de Transcripción

```typescript
import { GoogleMeetTranscription } from './transcription/google-meet-transcription';

const transcription = new GoogleMeetTranscription(page, {
  enableAutomatic: true,
  enableLiveCaption: true,
  language: 'es-ES',
  interval: 2000
});

await transcription.startTranscription();

// Obtener transcripciones
const entries = transcription.getTranscriptions();
```

## Scripts de Prueba

### 1. Bot Completo con Transcripción
```bash
npm run test-transcription
```

### 2. Modo Solo Escucha
```bash
npm run listen-only
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en el directorio `bot-core`:

```env
MEET_URL=https://meet.google.com/your-meeting-code
BOT_NAME=TOTS Transcription Bot
```

### Opciones de Transcripción

```typescript
interface TranscriptionOptions {
  enableAutomatic?: boolean;    // Habilitar transcripción automática
  enableLiveCaption?: boolean;  // Habilitar subtítulos en vivo
  language?: string;            // Idioma (es-ES, en-US, etc.)
  interval?: number;            // Intervalo de polling en ms
}
```

## API del Sistema de Transcripción

### Métodos Principales

#### `startTranscription(): Promise<void>`
Inicia la captura de transcripciones habilitando subtítulos automáticos.

#### `stopTranscription(): Promise<void>`
Detiene la captura de transcripciones.

#### `getTranscriptions(): TranscriptionEntry[]`
Obtiene todas las transcripciones capturadas.

#### `getTranscriptionSummary()`
Obtiene un resumen con estadísticas de la transcripción.

#### `exportToText(): string`
Exporta las transcripciones a formato de texto legible.

### Estructura de Datos

```typescript
interface TranscriptionEntry {
  timestamp: Date;      // Momento de la transcripción
  speaker: string;      // Nombre del hablante
  text: string;         // Texto transcrito
  language?: string;    // Idioma detectado
}
```

## Métodos del Bot Principal

### `getTranscriptions(): TranscriptionEntry[]`
Obtiene todas las transcripciones de la sesión actual.

### `getTranscriptionSummary()`
Obtiene resumen con:
- Total de entradas
- Lista de hablantes
- Duración de la reunión
- Tiempo de inicio y fin

### `getTranscriptionStats()`
Obtiene estadísticas en tiempo real:
- Estado de grabación
- Número de entradas
- Hablantes únicos
- Promedio de palabras por entrada

### `exportTranscriptionToText(): string`
Exporta toda la transcripción a formato texto.

### `toggleTranscription(enable: boolean): Promise<void>`
Habilita o deshabilita la transcripción dinámicamente.

## Funcionamiento Técnico

### Detección de Subtítulos

El sistema utiliza múltiples estrategias para detectar transcripciones:

1. **Subtítulos automáticos de Google Meet**: Busca elementos con clases específicas
2. **Live Captions**: Detecta subtítulos habilitados manualmente
3. **Método alternativo**: Análisis de texto en elementos DOM
4. **Filtrado inteligente**: Elimina contenido UI y detecta texto conversacional

### Selectores CSS Utilizados

```typescript
const transcriptionSelectors = [
  '.a4cQT',                           // Subtítulos principales
  '.iTTPOb',                          // Contenedor de texto
  '[data-is-persistent-caption="true"]', // Subtítulos persistentes
  '.captions-text',                   // Texto de subtítulos
  '.live-caption-chip'                // Chip de subtítulos en vivo
];
```

### Anti-Detección

- User-Agent realista
- Permisos de cámara y micrófono
- Simulación de comportamiento humano
- Delays aleatorios entre acciones

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **Dependiente de Google Meet**: Solo funciona si Google Meet tiene subtítulos disponibles
2. **Idioma**: Mejor funcionamiento en español e inglés
3. **Calidad de audio**: La precisión depende de la calidad del audio original
4. **Detección de hablantes**: Limitada a la información proporcionada por Google Meet

### Consideraciones Éticas y Legales

⚠️ **IMPORTANTE**: 
- Obtén consentimiento de todos los participantes antes de grabar o transcribir
- Cumple con las leyes locales de privacidad y grabación
- Respeta las políticas de la organización
- Informa claramente que se está realizando transcripción

### Requisitos del Sistema

- Node.js 16+ 
- Chromium (instalado automáticamente por Playwright)
- Conexión estable a internet
- Permisos de cámara/micrófono en el navegador

## Troubleshooting

### Problema: No se detectan transcripciones

**Soluciones:**
1. Verificar que Google Meet tenga subtítulos habilitados
2. Cambiar el idioma de la reunión
3. Verificar que hay conversación activa
4. Revisar los logs de debug

### Problema: Transcripciones duplicadas

**Soluciones:**
1. Ajustar el intervalo de polling
2. Verificar la lógica de deduplicación
3. Limpiar cache del navegador

### Problema: Bot detectado por Google

**Soluciones:**
1. Verificar configuración anti-detección
2. Usar delays más realistas
3. Cambiar User-Agent
4. Revisar permisos del navegador

## Debug y Logs

El sistema genera logs detallados con prefijo `[TRANSCRIPTION]`:

```
🎤 [TRANSCRIPTION] Iniciando captura de transcripciones...
📝 [TRANSCRIPTION] Habilitando subtítulos automáticos...
✅ [TRANSCRIPTION] Subtítulos automáticos habilitados
🔄 [TRANSCRIPTION] Iniciando polling cada 2000ms
📝 [TRANSCRIPTION] 2024-01-15T10:30:45.123Z: [Juan Pérez] Hola, buenos días a todos
```

### Screenshots de Debug

El sistema guarda screenshots automáticamente:
- `debug-after-navigation.png`: Después de navegar a Meet
- `debug-selector-error.png`: Si hay errores de selectores
- `debug-admission-failed.png`: Si falla la admisión

## Roadmap

### Próximas Características

- [ ] Integración con APIs de transcripción externa (Whisper, Google Speech-to-Text)
- [ ] Detección de emociones en el texto
- [ ] Resúmenes automáticos con IA
- [ ] Exportación a múltiples formatos (JSON, SRT, VTT)
- [ ] Traducciones automáticas
- [ ] Integración con sistemas de videoconferencia adicionales

### Mejoras Técnicas

- [ ] Mejor detección de hablantes usando análisis de audio
- [ ] Optimización de performance
- [ ] Reducción de falsos positivos
- [ ] Cache inteligente de transcripciones
- [ ] Compresión de datos históricos

## Contribuir

Para contribuir al desarrollo:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa tests
4. Documenta los cambios
5. Envía un Pull Request

## Licencia

Ver archivo LICENSE en el directorio raíz del proyecto.
