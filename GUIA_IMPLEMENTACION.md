# TOTS Meet Assistant - Guía Completa de Implementación

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Configuración del Entorno](#configuración-del-entorno)
5. [Implementación Paso a Paso](#implementación-paso-a-paso)
6. [API Endpoints](#api-endpoints)
7. [Uso del Sistema](#uso-del-sistema)
8. [Resolución de Problemas](#resolución-de-problemas)
9. [Próximos Pasos](#próximos-pasos)

---

## 🎯 Visión General

**TOTS Notetaker** es un bot automatizado que se une a reuniones de Google Meet como un participante real para transcribir automáticamente las conversaciones. Basado en la arquitectura de Vexa.ai, el sistema permite:

- ✅ **Bot real en Meet**: Aparece como participante en la lista
- ✅ **Transcripción en tiempo real**: Captura y transcribe audio automáticamente
- ✅ **API REST**: Control programático del bot
- ✅ **Escalable**: Múltiples bots simultáneos
- ✅ **Web Interface**: Dashboard para gestionar reuniones

### Caso de Uso
**Para empresas**: Un empleado puede agregar el bot TOTS a cualquier reunión de su empresa para generar automáticamente transcripciones y resúmenes sin necesidad de aprobación de IT.

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOTS Meet Assistant                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend Web  │    │   API Backend   │    │ Bot Containers  │
│   (Dashboard)   │◄──►│   (FastAPI)     │◄──►│  (Playwright)   │
│                 │    │                 │    │                 │
│ - Control panel │    │ - Bot manager   │    │ - Chrome browser│
│ - Transcripts   │    │ - Docker mgmt   │    │ - Audio capture │
│ - Meetings list │    │ - WebSocket     │    │ - Transcription │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                    ┌─────────────────┐        ┌─────────────────┐
                    │    Database     │        │  Google Meet    │
                    │  (PostgreSQL)   │        │   (Reunión)     │
                    │                 │        │                 │
                    │ - Meetings      │        │ - Bot participa │
                    │ - Transcripts   │        │ - Audio stream  │
                    │ - Users         │        │ - Video stream  │
                    └─────────────────┘        └─────────────────┘
```

### Flujo de Operación
1. **Usuario**: Solicita bot vía API/Web
2. **API**: Crea container Docker con bot
3. **Bot**: Se une a Google Meet usando Playwright
4. **Meet**: Anfitrión admite al bot
5. **Bot**: Captura audio y transcribe en tiempo real
6. **API**: Almacena transcripción en DB
7. **Usuario**: Ve transcripción en tiempo real

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.11+**: Lenguaje principal
- **FastAPI**: Framework web para API REST
- **SQLAlchemy**: ORM para base de datos
- **PostgreSQL**: Base de datos principal
- **Redis**: Cache y pub/sub para tiempo real
- **Docker**: Containerización de bots
- **WebSocket**: Comunicación en tiempo real

### Bot Core
- **Node.js 18+**: Runtime para el bot
- **TypeScript**: Lenguaje del bot
- **Playwright**: Automatización del navegador
- **Chromium**: Navegador para el bot
- **Web Audio API**: Captura de audio
- **Speech Recognition API**: Transcripción

### Frontend
- **Angular 17+**: Framework frontend principal
- **TypeScript**: Lenguaje del frontend
- **Angular Material**: Componentes UI
- **RxJS**: Manejo de datos reactivos
- **WebSocket Client**: Tiempo real
- **TailwindCSS**: Framework CSS (opcional)

### DevOps
- **Docker Compose**: Orquestación local
- **GitHub Actions**: CI/CD (futuro)
- **Nginx**: Reverse proxy (producción)

---

## 🔧 Configuración del Entorno

### Requisitos Previos
```bash
# Verificar instalaciones
node --version    # v18.0.0+
python --version  # 3.11.0+
docker --version  # 20.0.0+
git --version     # 2.0.0+
```

### Variables de Entorno
Crear archivo `.env` en la raíz:
```env
# API Configuration
API_HOST=localhost
API_PORT=8000
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tots_meet_db
REDIS_URL=redis://localhost:6379

# Bot Configuration
BOT_IMAGE=tots-meet-bot:latest
DEFAULT_BOT_NAME=TOTS Notetaker
DEFAULT_LANGUAGE=es

# Google Meet
GOOGLE_MEET_DOMAIN=meet.google.com

# Security
API_SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Transcription Service
TRANSCRIPTION_SERVICE=web-speech-api
# TRANSCRIPTION_SERVICE=whisper-local (futuro)
# TRANSCRIPTION_SERVICE=azure-speech (futuro)
```

---

## 📋 Implementación Paso a Paso

### Paso 1: Configurar Base de Datos
```bash
# 1. Instalar PostgreSQL
# Windows: Descargar desde postgresql.org
# Linux: sudo apt install postgresql postgresql-contrib
# macOS: brew install postgresql

# 2. Crear base de datos
createdb tots_meet_db

# 3. Instalar Redis
# Windows: Descargar desde redis.io
# Linux: sudo apt install redis-server
# macOS: brew install redis
```

### Paso 2: Backend API (FastAPI)
```bash
# 1. Crear entorno virtual
cd c:\repositories\tots-meet-assistant\api
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS

# 2. Instalar dependencias
pip install fastapi uvicorn sqlalchemy psycopg2-binary redis docker python-multipart

# 3. Crear estructura
mkdir -p app/{models,routers,services,utils}
touch app/{__init__.py,main.py,database.py,config.py}
```

### Paso 3: Bot Core (Node.js + Playwright)
```bash
# 1. Configurar proyecto Node.js
cd c:\repositories\tots-meet-assistant\bot-core
npm init -y

# 2. Instalar dependencias
npm install playwright @types/node typescript ts-node dotenv ws uuid
npm install -D @types/ws @types/uuid

# 3. Configurar TypeScript
npx tsc --init

# 4. Instalar navegadores
npx playwright install chromium
```

### Paso 4: Frontend Angular
```bash
# 1. Instalar Angular CLI globalmente
npm install -g @angular/cli

# 2. Crear aplicación Angular
cd c:\repositories\tots-meet-assistant
ng new frontend --routing --style=scss --standalone=false
cd frontend

# 3. Instalar dependencias adicionales
npm install @angular/material @angular/cdk @angular/animations
npm install rxjs socket.io-client
npm install -D tailwindcss postcss autoprefixer

# 4. Configurar TailwindCSS (opcional)
npx tailwindcss init

# 5. Configurar Angular Material
ng add @angular/material
```

### Paso 5: Docker Setup
```bash
# 1. Crear archivos Docker
touch docker-compose.yml
touch bot-core/Dockerfile
touch api/Dockerfile

# 2. Construir imágenes
docker-compose build

# 3. Iniciar servicios
docker-compose up -d
```

---

## 🔌 API Endpoints

### Autenticación
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password"
}
```

### Gestión de Bots
```http
# Crear bot para reunión
POST /bots
Content-Type: application/json
X-API-Key: your-api-key

{
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "bot_name": "TOTS Notetaker",
  "language": "es",
  "meeting_title": "Sprint Planning Q1"
}

# Respuesta
{
  "meeting_id": "abc-defg-hij",
  "internal_id": 123,
  "bot_container_id": "container_abc123",
  "status": "requested",
  "message": "Bot solicitado - será admitido en ~10 segundos",
  "meeting_url": "https://meet.google.com/abc-defg-hij",
  "estimated_join_time": "2025-01-15T10:30:00Z"
}
```

```http
# Obtener estado del bot
GET /bots/status
X-API-Key: your-api-key

# Respuesta
{
  "active_bots": [
    {
      "meeting_id": "abc-defg-hij",
      "status": "active",
      "joined_at": "2025-01-15T10:30:15Z",
      "participants_count": 5
    }
  ]
}
```

```http
# Detener bot
DELETE /bots/google_meet/abc-defg-hij
X-API-Key: your-api-key

# Respuesta
{
  "status": "stopped",
  "final_transcript_available": true,
  "meeting_duration": "00:45:30"
}
```

### Transcripciones
```http
# Obtener transcripción en tiempo real
GET /transcripts/google_meet/abc-defg-hij?live=true
X-API-Key: your-api-key

# Respuesta (Stream)
{
  "transcript_id": 456,
  "meeting_id": "abc-defg-hij",
  "segments": [
    {
      "timestamp": "2025-01-15T10:30:45Z",
      "speaker": "Juan Pérez",
      "text": "Buenos días a todos, comenzamos la reunión",
      "confidence": 0.95
    },
    {
      "timestamp": "2025-01-15T10:31:02Z", 
      "speaker": "María García",
      "text": "Perfecto, tenemos la agenda lista",
      "confidence": 0.92
    }
  ],
  "live": true
}
```

```http
# Descargar transcripción completa
GET /transcripts/google_meet/abc-defg-hij/export?format=pdf
X-API-Key: your-api-key

# Respuesta: Archivo PDF/DOCX/TXT
```

### Gestión de Reuniones
```http
# Listar reuniones
GET /meetings?limit=20&offset=0
X-API-Key: your-api-key

# Respuesta
{
  "meetings": [
    {
      "internal_id": 123,
      "native_meeting_id": "abc-defg-hij", 
      "title": "Sprint Planning Q1",
      "platform": "google_meet",
      "status": "completed",
      "start_time": "2025-01-15T10:30:00Z",
      "end_time": "2025-01-15T11:15:30Z",
      "participants": ["Juan Pérez", "María García", "TOTS Notetaker"],
      "transcript_available": true
    }
  ],
  "total": 15,
  "page": 1
}
```

---

## 🎮 Uso del Sistema

### Para Desarrolladores (API)
```python
import requests

# Configuración
API_BASE = "http://localhost:8000"
API_KEY = "your-api-key"
headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

# 1. Crear bot para reunión
meeting_data = {
    "platform": "google_meet",
    "native_meeting_id": "abc-defg-hij",  # De la URL de Meet
    "bot_name": "TOTS Notetaker - Proyecto Alpha",
    "language": "es"
}

response = requests.post(f"{API_BASE}/bots", json=meeting_data, headers=headers)
bot_info = response.json()
print(f"Bot creado: {bot_info['message']}")

# 2. Monitorear transcripción
import time
meeting_id = "abc-defg-hij"

while True:
    response = requests.get(f"{API_BASE}/transcripts/google_meet/{meeting_id}?live=true", headers=headers)
    transcript = response.json()
    
    for segment in transcript['segments']:
        print(f"[{segment['timestamp']}] {segment['speaker']}: {segment['text']}")
    
    time.sleep(5)  # Actualizar cada 5 segundos

# 3. Finalizar y descargar
requests.delete(f"{API_BASE}/bots/google_meet/{meeting_id}", headers=headers)
pdf_response = requests.get(f"{API_BASE}/transcripts/google_meet/{meeting_id}/export?format=pdf", headers=headers)

with open("reunion_transcript.pdf", "wb") as f:
    f.write(pdf_response.content)
```

### Para Usuarios Finales (Angular)
```typescript
// services/tots-meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TotsMeetingService {
  private apiBase = 'http://localhost:8000';
  private socket: Socket | null = null;
  private transcriptSubject = new Subject<any>();
  
  constructor(private http: HttpClient) {}
  
  createBot(meetingUrl: string, botName: string = 'TOTS Notetaker'): Observable<any> {
    const meetingId = this.extractMeetingId(meetingUrl);
    const headers = new HttpHeaders({
      'X-API-Key': 'your-api-key',
      'Content-Type': 'application/json'
    });
    
    const payload = {
      platform: 'google_meet',
      native_meeting_id: meetingId,
      bot_name: botName
    };
    
    return this.http.post(`${this.apiBase}/bots`, payload, { headers });
  }
  
  connectLiveTranscript(meetingId: string): Observable<any> {
    this.socket = io(`${this.apiBase}/ws/transcripts/${meetingId}`);
    
    this.socket.on('transcript', (data) => {
      this.transcriptSubject.next(data);
    });
    
    return this.transcriptSubject.asObservable();
  }
  
  disconnectTranscript(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  private extractMeetingId(url: string): string | null {
    const match = url.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
    return match ? match[1] : null;
  }
}

// components/meeting-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TotsMeetingService } from '../services/tots-meeting.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-meeting-dashboard',
  templateUrl: './meeting-dashboard.component.html',
  styleUrls: ['./meeting-dashboard.component.scss']
})
export class MeetingDashboardComponent implements OnInit, OnDestroy {
  meetingUrl: string = '';
  botName: string = 'TOTS Notetaker';
  transcripts: any[] = [];
  isConnected: boolean = false;
  private transcriptSubscription?: Subscription;
  
  constructor(private totsService: TotsMeetingService) {}
  
  ngOnInit(): void {}
  
  ngOnDestroy(): void {
    this.disconnectBot();
  }
  
  createBot(): void {
    if (!this.meetingUrl) return;
    
    this.totsService.createBot(this.meetingUrl, this.botName).subscribe({
      next: (result) => {
        console.log('Bot creado:', result.message);
        this.connectToTranscript();
      },
      error: (error) => {
        console.error('Error creando bot:', error);
      }
    });
  }
  
  private connectToTranscript(): void {
    const meetingId = this.totsService['extractMeetingId'](this.meetingUrl);
    if (!meetingId) return;
    
    this.transcriptSubscription = this.totsService.connectLiveTranscript(meetingId).subscribe({
      next: (transcript) => {
        this.transcripts.push(transcript);
        this.isConnected = true;
      },
      error: (error) => {
        console.error('Error en transcripción:', error);
      }
    });
  }
  
  disconnectBot(): void {
    if (this.transcriptSubscription) {
      this.transcriptSubscription.unsubscribe();
    }
    this.totsService.disconnectTranscript();
    this.isConnected = false;
  }
}
```

```html
<!-- meeting-dashboard.component.html -->
<div class="meeting-dashboard">
  <mat-card class="control-panel">
    <mat-card-header>
      <mat-card-title>TOTS Meeting Assistant</mat-card-title>
      <mat-card-subtitle>Control de Bot para Google Meet</mat-card-subtitle>
    </mat-card-header>
    
    <mat-card-content>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>URL de Google Meet</mat-label>
        <input matInput [(ngModel)]="meetingUrl" placeholder="https://meet.google.com/abc-defg-hij">
      </mat-form-field>
      
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Nombre del Bot</mat-label>
        <input matInput [(ngModel)]="botName" placeholder="TOTS Notetaker">
      </mat-form-field>
    </mat-card-content>
    
    <mat-card-actions>
      <button mat-raised-button color="primary" (click)="createBot()" [disabled]="isConnected">
        Crear Bot
      </button>
      <button mat-raised-button color="warn" (click)="disconnectBot()" [disabled]="!isConnected">
        Desconectar Bot
      </button>
    </mat-card-actions>
  </mat-card>
  
  <mat-card class="transcript-panel" *ngIf="isConnected">
    <mat-card-header>
      <mat-card-title>Transcripción en Tiempo Real</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <div class="transcript-container">
        <div *ngFor="let transcript of transcripts" class="transcript-item">
          <span class="speaker">{{ transcript.speaker }}:</span>
          <span class="text">{{ transcript.text }}</span>
          <span class="timestamp">{{ transcript.timestamp | date:'short' }}</span>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

---

## 🐛 Resolución de Problemas

### Bot no se une a la reunión
```bash
# Verificar logs del container
docker logs <container_id>

# Problemas comunes:
# 1. URL de reunión incorrecta
# 2. Navegador no instalado
# 3. Permisos de audio/video
# 4. Reunión privada/con contraseña
```

### Transcripción no funciona
```bash
# Verificar permisos de audio
# Chrome requiere HTTPS para Web Audio API en producción

# Verificar conexión WebSocket
# Firewalls pueden bloquear WebSocket connections
```

### Bot no es admitido automáticamente
```text
# Configuración requerida en Google Meet:
# - Permitir que cualquiera se una (no recomendado para producción)
# - O manualmente admitir al bot
# - O configurar dominio de confianza (requiere Google Workspace)
```

### Errores de Docker
```bash
# Limpiar containers
docker system prune -a

# Reconstruir imágenes
docker-compose build --no-cache

# Verificar recursos
docker stats
```

---

## 🚀 Próximos Pasos

### Fase 1: MVP (Mínimo Producto Viable)
- [ ] Backend API básico
- [ ] Bot que se una a Meet
- [ ] Transcripción básica con Web Speech API
- [ ] Frontend simple para control

### Fase 2: Mejoras Core
- [ ] Base de datos para persistir transcripciones
- [ ] Identificación de speakers
- [ ] Exportar transcripciones (PDF, DOCX)
- [ ] Interfaz web mejorada

### Fase 3: Funcionalidades Avanzadas
- [ ] Resúmenes automáticos con IA
- [ ] Detección de action items
- [ ] Integración con Slack/Teams
- [ ] Multi-idioma avanzado

### Fase 4: Producción
- [ ] Autenticación OAuth con Google
- [ ] Escalabilidad (Kubernetes)
- [ ] Monitoring y logging
- [ ] Backup y recuperación

### Fase 5: Enterprise
- [ ] SSO empresarial
- [ ] Compliance (GDPR, SOX)
- [ ] API versioning
- [ ] White-label solution

---

## 📁 Estructura Final del Proyecto

```
tots-meet-assistant/
├── api/                              # Backend FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # Aplicación principal
│   │   ├── config.py                 # Configuración
│   │   ├── database.py               # Conexión DB
│   │   ├── models/                   # Modelos SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── meeting.py
│   │   │   ├── transcript.py
│   │   │   └── user.py
│   │   ├── routers/                  # Endpoints API
│   │   │   ├── __init__.py
│   │   │   ├── bots.py
│   │   │   ├── transcripts.py
│   │   │   └── meetings.py
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── bot_manager.py
│   │   │   ├── docker_utils.py
│   │   │   └── transcription.py
│   │   └── utils/                    # Utilidades
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── bot-core/                         # Bot Node.js
│   ├── src/
│   │   ├── bot.ts                    # Entrada principal
│   │   ├── types.ts                  # Tipos TypeScript
│   │   ├── utils.ts                  # Utilidades
│   │   ├── platforms/
│   │   │   └── google.ts             # Lógica Google Meet
│   │   ├── transcription/
│   │   │   ├── webapi.ts             # Web Speech API
│   │   │   └── websocket.ts          # WebSocket client
│   │   └── config/
│   │       └── settings.ts           # Configuración bot
│   ├── dist/                         # JavaScript compilado
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
├── frontend/                         # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── meeting-dashboard/
│   │   │   │   ├── transcript-viewer/
│   │   │   │   └── bot-status/
│   │   │   ├── services/
│   │   │   │   ├── tots-meeting.service.ts
│   │   │   │   ├── websocket.service.ts
│   │   │   │   └── api.service.ts
│   │   │   ├── models/
│   │   │   │   ├── meeting.model.ts
│   │   │   │   └── transcript.model.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.module.ts
│   │   │   └── app-routing.module.ts
│   │   ├── assets/
│   │   ├── environments/
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── docs/                             # Documentación
│   ├── API.md                        # Documentación API
│   ├── DEPLOYMENT.md                 # Guía de despliegue
│   └── CONTRIBUTING.md               # Guía de contribución
├── scripts/                          # Scripts útiles
│   ├── setup.sh                      # Setup inicial
│   ├── build.sh                      # Build del proyecto
│   └── deploy.sh                     # Despliegue
├── tests/                            # Tests
│   ├── api/
│   ├── bot-core/
│   └── integration/
├── .env.example                      # Ejemplo de variables
├── .gitignore
├── docker-compose.yml                # Orquestación Docker
├── docker-compose.prod.yml           # Configuración producción
├── README.md                         # Documentación principal
└── ARCHITECTURE.md                   # Este archivo
```

---

## 🔗 Enlaces Útiles

- [Playwright Documentation](https://playwright.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Meet URL Structure](https://developers.google.com/meet)

---

*Última actualización: 24 de Julio, 2025*
*Versión: 1.0.0*
