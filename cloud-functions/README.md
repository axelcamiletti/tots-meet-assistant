# TOTS Meet Assistant - Cloud Functions

Backend serverless para el sistema de asistencia inteligente de reuniones de Google Meet.

## 🚀 Características

- **Transcripción en tiempo real** - Captura y almacena subtítulos de Meet
- **Resúmenes con IA** - Genera resúmenes inteligentes usando OpenAI GPT-4
- **Análisis avanzado** - Sentiment analysis, keywords y métricas de engagement
- **API RESTful** - Endpoints seguros con autenticación Firebase
- **Escalabilidad** - Cloud Functions con auto-scaling

## 📋 Funciones disponibles

### Core Functions
- `saveMeetingTranscript` - Guarda transcripciones desde la extensión Chrome
- `generateSummary` - Genera resúmenes inteligentes con OpenAI
- `getMeetings` - Lista reuniones del usuario con filtros y búsqueda
- `updateMeeting` - Actualiza metadatos de reuniones
- `analyzeMeeting` - Análisis avanzado (sentiment, keywords, métricas)

## 🛠️ Instalación y configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Ejecutar script de configuración interactiva
node setup.js

# O copiar manualmente
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Firebase
```bash
# Login en Firebase CLI
firebase login

# Inicializar proyecto (si es necesario)
firebase init functions
```

### 4. Variables de entorno requeridas
```env
FIREBASE_PROJECT_ID=your-project-id
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=development
```

## 🧪 Desarrollo y pruebas

### Emuladores locales
```bash
# Iniciar emuladores
npm run serve

# Las funciones estarán disponibles en:
# http://localhost:5001/your-project/us-central1/functionName
```

### Ejecutar pruebas
```bash
# Pruebas unitarias
node test.js

# Linting
npm run lint
```

## 📡 API Endpoints

### POST `/saveMeetingTranscript`
Guarda transcripción de reunión desde extensión Chrome.

**Headers:**
```
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Body:**
```json
{
  "meetingId": "meet-123",
  "meetingTitle": "Reunión de equipo",
  "transcript": "Transcripción completa...",
  "highlights": [
    {
      "type": "tarea",
      "text": "Revisar documentos",
      "timestamp": 1234567890
    }
  ],
  "meetingUrl": "https://meet.google.com/abc-def",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "meetingDocId": "doc-id-123",
  "message": "Transcripción guardada exitosamente"
}
```

### POST `/generateSummary`
Genera resumen inteligente con OpenAI.

**Body:**
```json
{
  "meetingDocId": "doc-id-123"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "Resumen ejecutivo de la reunión...",
  "keyPoints": ["Punto 1", "Punto 2"],
  "actionItems": ["Tarea 1", "Tarea 2"]
}
```

### GET `/getMeetings`
Lista reuniones del usuario autenticado.

**Query Parameters:**
- `limit` (default: 20) - Número de resultados por página
- `page` (default: 1) - Página actual
- `startDate` - Filtro por fecha inicio
- `endDate` - Filtro por fecha fin
- `searchText` - Búsqueda en título y transcripción

## 🗄️ Estructura de datos Firestore

### Collection: `meetings`
```json
{
  "meetingId": "string",
  "meetingTitle": "string",
  "transcript": "string",
  "highlights": [
    {
      "type": "nota|objetivo|tarea|pregunta",
      "text": "string",
      "timestamp": "number"
    }
  ],
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": ["string"],
  "analysis": {
    "sentiment": "positive|negative|neutral",
    "keywords": [{"word": "string", "count": "number"}],
    "metrics": {
      "wordCount": "number",
      "duration": "number",
      "engagementScore": "number"
    }
  },
  "userEmail": "string",
  "userId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "summaryGenerated": "boolean"
}
```

## 🚀 Despliegue

### Desarrollo
```bash
firebase deploy --only functions --project development
```

### Producción
```bash
# Configurar variables de entorno en Firebase
firebase functions:config:set openai.key="your-key" --project production

firebase deploy --only functions --project production
```

## 🔒 Seguridad

- **Autenticación Firebase** - Todos los endpoints requieren token válido
- **CORS configurado** - Solo dominios permitidos
- **Validación de datos** - Sanitización de inputs
- **Rate limiting** - Límites de requests por usuario

## 📊 Monitoreo

### Logs
```bash
firebase functions:log --project your-project
```

### Métricas
- Consultar Firebase Console > Functions
- Usar Cloud Monitoring para alertas

## 🛠️ Troubleshooting

### Error: "Token de autorización requerido"
- Verificar que el header Authorization esté presente
- Validar que el token Firebase sea válido

### Error: OpenAI API
- Verificar que OPENAI_API_KEY esté configurada
- Revisar límites de uso en OpenAI dashboard

### Timeout en funciones
- Aumentar timeout en firebase.json
- Optimizar consultas a Firestore

## 📝 Scripts disponibles

- `npm run serve` - Emuladores locales
- `npm run deploy` - Desplegar funciones
- `npm run logs` - Ver logs
- `npm run lint` - Linting
- `npm test` - Ejecutar pruebas

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Propiedad de TOTS - Todos los derechos reservados.
