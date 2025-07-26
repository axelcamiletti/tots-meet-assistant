# Bot Core - Arquitectura Modular

Esta es la arquitectura refactorizada del bot de TOTS Meet Assistant, diseñada para ser escalable, mantenible y fácil de extender con nuevas funcionalidades.

## 🏗️ Estructura de la Arquitectura

```
src/
├── core/                     # Servicios base y gestión central
│   ├── base-bot.ts          # Clase base para todos los bots
│   ├── browser-manager.ts   # Gestión del navegador Playwright
│   └── session-manager.ts   # Gestión de sesiones de reuniones
├── modules/                  # Módulos funcionales reutilizables
│   ├── transcription-module.ts  # Funcionalidad base de transcripción
│   ├── recording-module.ts      # Funcionalidad base de grabación
│   └── monitoring-module.ts     # Monitoreo base de reuniones
├── platforms/               # Implementaciones específicas por plataforma
│   ├── google-meet-bot.ts   # Bot principal para Google Meet (orquestador)
│   └── google-meet/         # Módulos específicos de Google Meet
│       ├── join.ts          # Módulo de unión a reuniones
│       ├── transcription.ts # Módulo de transcripción específico
│       └── monitoring.ts    # Módulo de monitoreo específico
├── types/                   # Definiciones de tipos TypeScript
│   └── bot.types.ts         # Tipos compartidos
├── tests/                   # Test unificado
│   ├── test.ts             # Test principal único
│   └── README.md           # Documentación de testing
├── meeting-bot.ts           # Bot principal orquestador
└── index.ts                # Exportaciones públicas
```

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- Cada módulo tiene una responsabilidad específica
- Los servicios core manejan funcionalidades transversales
- Las implementaciones específicas están encapsuladas

### 2. **Composición sobre Herencia**
- Los bots se componen de módulos funcionales
- Facilita la reutilización y testing
- Permite agregar/remover funcionalidades dinámicamente

### 3. **Extensibilidad**
- Fácil agregar nuevas plataformas (Zoom, Teams, etc.)
- Módulos pueden ser extendidos o reemplazados
- Configuración flexible por módulo

### 4. **Event-Driven Architecture**
- Comunicación entre módulos via eventos
- Bajo acoplamiento entre componentes
- Fácil integración con sistemas externos

## 🧩 Componentes Principales

### Core Services

#### `BaseBot`
Clase abstracta que proporciona funcionalidad común a todos los bots:
- Gestión del ciclo de vida
- Configuración del navegador
- Manejo de eventos
- Cleanup de recursos

#### `BrowserManager`
Gestiona la configuración e inicialización de Playwright:
- Configuración stealth
- Permisos de medios
- User agents realistas

#### `SessionManager`
Gestiona las sesiones de reuniones:
- Creación y tracking de sesiones
- Actualización de estado
- Estadísticas de sesión

### Módulos Funcionales

#### `TranscriptionModule`
Funcionalidad base de transcripción:
- Interfaz común para todas las plataformas
- Gestión de entradas de transcripción
- Exportación en múltiples formatos

#### `RecordingModule`
Funcionalidad base de grabación:
- Control de grabación de audio/video
- Gestión de estados de grabación
- Configuración de calidad

#### `MonitoringModule`
Monitoreo de reuniones:
- Tracking de participantes
- Estado de conexión
- Detección de fin de reunión

### Implementaciones Específicas

#### `GoogleMeetBot` (Orquestador Principal)
Bot completo para Google Meet que **compone y orquesta** todos los módulos específicos:

```typescript
// Composición modular - no herencia monolítica
class GoogleMeetBot extends BaseBot {
  private joinModule: GoogleMeetJoinModule;           // ← Módulo de unión
  private transcriptionModule: GoogleMeetTranscriptionModule; // ← Módulo de transcripción  
  private monitoringModule: GoogleMeetMonitoringModule;       // ← Módulo de monitoreo
}
```

**Módulos Específicos de Google Meet:**
- **`GoogleMeetJoinModule`** (`platforms/google-meet/join.ts`)
  - Maneja la lógica específica de unión a Google Meet
  - Configuración de audio/video
  - Navegación y admisión a reuniones

- **`GoogleMeetTranscriptionModule`** (`platforms/google-meet/transcription.ts`)
  - Extiende `TranscriptionModule` base
  - Implementa captura específica de transcripciones de Google Meet
  - Manejo de eventos de transcripción en tiempo real

- **`GoogleMeetMonitoringModule`** (`platforms/google-meet/monitoring.ts`)
  - Extiende `MonitoringModule` base  
  - Monitoreo de participantes específico de Google Meet
  - Detección de estado de reunión y calidad de red

#### Uso del Bot Completo
```typescript
const bot = new GoogleMeetBot(config);
await bot.start();

// Usar funcionalidades específicas
bot.toggleTranscription(true);
const participants = await bot.getParticipants();
const stats = bot.getTranscriptionStats();
```

## 🚀 Uso

### Ejemplo Básico
```typescript
import { MeetingBot, BotConfig } from './src';

const config: BotConfig = {
  meetingUrl: 'https://meet.google.com/your-code',
  botName: 'TOTS Notetaker',
  audioEnabled: false,
  videoEnabled: false,
  headless: true
};

const bot = new MeetingBot(config);
await bot.start();
```

### Uso Avanzado con Eventos
```typescript
import { GoogleMeetBot } from './src';

const bot = new GoogleMeetBot(config);

// Configurar eventos
bot.on('transcriptionUpdate', (entry) => {
  console.log(`${entry.speaker}: ${entry.text}`);
});

bot.on('participantsUpdate', (participants) => {
  console.log(`Participantes: ${participants.join(', ')}`);
});

await bot.start();
```

## 🔧 Extendiendo la Arquitectura

### Agregar Nueva Plataforma (ej: Zoom)

1. **Crear módulos específicos:**
```typescript
// platforms/zoom/join.ts
export class ZoomJoinModule { ... }

// platforms/zoom/transcription.ts
export class ZoomTranscriptionModule extends TranscriptionModule { ... }
```

2. **Crear bot principal:**
```typescript
// platforms/zoom-bot.ts
export class ZoomBot extends BaseBot {
  async joinMeeting() { ... }
}
```

3. **Integrar en MeetingBot:**
```typescript
// meeting-bot.ts
if (this.config.meetingUrl.includes('zoom.us')) {
  await this.createZoomBot();
}
```

### Agregar Nueva Funcionalidad

1. **Crear módulo base:**
```typescript
// modules/ai-summary-module.ts
export abstract class AISummaryModule extends EventEmitter {
  abstract generateSummary(): Promise<string>;
}
```

2. **Implementar para plataforma:**
```typescript
// platforms/google-meet/ai-summary.ts
export class GoogleMeetAISummaryModule extends AISummaryModule {
  async generateSummary() { ... }
}
```

3. **Integrar en bot:**
```typescript
// platforms/google-meet-bot.ts
private aiSummaryModule: GoogleMeetAISummaryModule;
```

## 📊 Beneficios de esta Arquitectura

### ✅ Mantenibilidad
- Código organizado por responsabilidades
- Cambios aislados por módulo
- Fácil debugging y testing

### ✅ Escalabilidad
- Agregar plataformas sin modificar código existente
- Módulos independientes y reutilizables
- Configuración granular por funcionalidad

### ✅ Testabilidad
- Módulos pueden ser testeados independientemente
- Mocking fácil de dependencias
- Tests enfocados por funcionalidad

### ✅ Extensibilidad
- Nuevas funcionalidades sin breaking changes
- Plugins y módulos opcionales
- API consistente entre plataformas

## 🧹 Arquitectura Limpia

Esta documentación refleja la arquitectura **después del refactor y limpieza**:

- ✅ **Eliminado código duplicado**: Se removió `google-meet.ts` monolítico obsoleto
- ✅ **Tests unificados**: Solo `tests/test.ts` como test principal
- ✅ **Modularidad real**: Cada módulo tiene responsabilidad única
- ✅ **Sin archivos innecesarios**: Estructura limpia y mantenible

La arquitectura actual es **100% modular** con separación clara de responsabilidades.

## 🎯 Próximos Pasos

1. **Implementar RecordingModule para Google Meet**
2. **Agregar soporte para Microsoft Teams**
3. **Crear módulo de AI Summary**
4. **Implementar persistencia de datos**
5. **Agregar módulo de análisis de sentimientos**
6. **Crear dashboard de monitoreo en tiempo real**

Esta arquitectura está diseñada para crecer con las necesidades del proyecto, manteniendo la calidad del código y facilitando el desarrollo de nuevas funcionalidades.
