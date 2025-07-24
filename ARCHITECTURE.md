tots-meet-assistant/
├── api/                          ← Backend API (como Vexa)
│   ├── main.py                   ← FastAPI server
│   ├── bot_manager.py            ← Gestión de bots
│   └── docker_utils.py           ← Manejo de containers
├── bot-core/                     ← El bot que se une a Meet
│   ├── src/
│   │   ├── platforms/
│   │   │   └── google.ts         ← Lógica de Google Meet
│   │   ├── transcription.js      ← Captura de audio
│   │   └── bot.js                ← Bot principal
│   ├── Dockerfile                ← Container del bot
│   └── package.json
├── frontend/                     ← Frontend Angular
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── meeting-dashboard/
│   │   │   └── transcript-viewer/
│   │   ├── services/
│   │   │   └── tots-meeting.service.ts
│   │   └── models/
│   ├── angular.json
│   └── package.json
└── docker-compose.yml            ← Orquestación
