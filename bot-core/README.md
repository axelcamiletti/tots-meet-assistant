# TOTS Meet Assistant Bot

🤖 Bot inteligente para Google Meet que se une automáticamente a reuniones, detecta participantes y mantiene sesiones activas.

## 🚀 Características

- ✅ **Unión automática** a reuniones de Google Meet
- ✅ **Detección de participantes** en tiempo real
- ✅ **Transcripción** automática (preparado para cuando haya audio)
- ✅ **Monitoreo** continuo de la reunión
- ✅ **Keep-alive** para mantener sesiones activas
- ✅ **Arquitectura modular** y escalable

## 🛠️ Instalación

```bash
npm install
npm run build
```

## 📋 Configuración

Crear un archivo `.env`:

```env
MEET_URL=https://meet.google.com/xxx-xxxx-xxx
```

## 🧪 Testing

```bash
# Test completo con conexión real
npm test

# Test rápido (solo arquitectura)
npm run test:quick
```

## 🎯 Uso Básico

```typescript
import { MeetingBot, BotConfig } from './src/meeting-bot';

const config: BotConfig = {
  meetingUrl: 'https://meet.google.com/xxx-xxxx-xxx',
  botName: 'Mi Bot',
  audioEnabled: false,
  videoEnabled: false,
  headless: true
};

const bot = new MeetingBot(config);

// Iniciar el bot
await bot.start();

// El bot se mantiene activo automáticamente
// Obtener estado
const status = await bot.getStatus();
console.log(status);

// Detener cuando sea necesario
await bot.stop();
```

## 🏗️ Arquitectura

### Estructura Modular

```
src/
├── core/                 # Núcleo del sistema
│   ├── base-bot.ts      # Bot base abstracto
│   ├── browser-manager.ts  # Gestión de navegador
│   └── session-manager.ts  # Gestión de sesiones
├── platforms/           # Implementaciones por plataforma
│   └── google-meet/     # Específico para Google Meet
├── modules/             # Módulos reutilizables
│   ├── transcription/   # Transcripción de audio
│   ├── recording/       # Grabación de video/audio
│   └── monitoring/      # Monitoreo de reuniones
└── types/               # Definiciones TypeScript
```

### Flujo de Funcionamiento

1. **Inicialización** - Configura navegador y sesión
2. **Unión** - Se conecta automáticamente a Google Meet
3. **Configuración** - Desactiva audio/video, configura nombre
4. **Módulos** - Inicia transcripción y monitoreo
5. **Keep-alive** - Mantiene la sesión activa
6. **Cleanup** - Limpieza automática al finalizar

## 📊 Estado del Proyecto

- ✅ **Arquitectura**: Completa y probada
- ✅ **Conexión Google Meet**: Funcionando
- ✅ **Detección participantes**: Funcionando  
- ✅ **Mantenimiento sesión**: Funcionando
- ✅ **Testing**: Test único y completo
- 🔄 **Transcripción**: Preparada (activar cuando haya audio)
- 🔄 **Grabación**: Módulos listos para implementar

## 🔧 Scripts Disponibles

```bash
npm run build      # Compilar TypeScript
npm run dev        # Desarrollo con ts-node
npm test          # Test completo
npm run test:quick # Test rápido
```

## 📝 Ejemplo de Salida de Test

```
✅ Bot creado
✅ Estado: recording
📋 Session ID: session_xxx
👥 Participantes: 2
⏰ Bot funcionando - manteniendo activo por 60 segundos...
   [10s] Estado: recording | Transcripciones: 0
   [10s] Participantes detectados: 2
✅ TEST EXITOSO
🎉 El bot funciona correctamente
```

## 🤝 Contribución

El proyecto está estructurado de manera modular para facilitar:

- Agregar nuevas plataformas (Zoom, Teams, etc.)
- Implementar nuevas funcionalidades
- Crear tests específicos
- Mantener código limpio y escalable
