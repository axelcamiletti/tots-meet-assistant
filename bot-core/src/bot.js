"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingBot = void 0;
const playwright_1 = require("playwright");
const google_meet_1 = require("./platforms/google-meet");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class MeetingBot {
    constructor(config) {
        this.config = config;
        this.browser = null;
        this.page = null;
        this.googleBot = null;
        this.session = null;
        console.log('🤖 TOTS Notetaker Bot inicializando...');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('🚀 Iniciando navegador...');
                // Configuración del navegador con stealth mejorado basado en Vexa
                this.browser = yield playwright_1.chromium.launch({
                    headless: (_a = this.config.headless) !== null && _a !== void 0 ? _a : true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-blink-features=AutomationControlled',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--use-fake-ui-for-media-stream',
                        '--use-fake-device-for-media-stream',
                        '--allow-running-insecure-content',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                        '--disable-dev-shm-usage',
                        '--disable-field-trial-config',
                        '--disable-ipc-flooding-protection',
                        '--disable-extensions-except',
                        '--disable-plugins-discovery',
                        '--disable-default-apps',
                        '--no-first-run',
                        '--no-default-browser-check',
                        '--disable-sync',
                        '--disable-component-update',
                        '--disable-client-side-phishing-detection'
                    ]
                });
                this.page = yield this.browser.newPage();
                // Configurar User-Agent realista - exacto como Vexa
                yield this.page.context().addInitScript(() => {
                    Object.defineProperty(navigator, 'userAgent', {
                        get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    });
                });
                // Configurar permisos de cámara y micrófono
                const context = this.page.context();
                yield context.grantPermissions(['microphone', 'camera'], { origin: 'https://meet.google.com' });
                // Script anti-detección avanzado basado en Vexa
                yield this.page.addInitScript(() => {
                    var _a, _b;
                    // Ocultar que es un navegador automatizado
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined,
                    });
                    // Simular plugins realistas
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [1, 2, 3, 4, 5],
                    });
                    // Simular idiomas realistas
                    Object.defineProperty(navigator, 'languages', {
                        get: () => ['en-US', 'en'],
                    });
                    // Ocultar propiedades de automatización
                    (_b = (_a = window.chrome) === null || _a === void 0 ? void 0 : _a.runtime) === null || _b === void 0 ? true : delete _b.onConnect;
                    // Simular comportamiento de usuario real
                    const originalQuery = window.navigator.permissions.query;
                    return originalQuery({ name: 'notifications' }).then((result) => {
                        const originalAddEventListener = result.addEventListener;
                        result.addEventListener = function (name, listener, options) {
                            if (name === 'change') {
                                // Simular que el usuario ha dado permisos
                                setTimeout(() => listener({ target: { state: 'granted' } }), 100);
                            }
                            return originalAddEventListener.call(result, name, listener, options);
                        };
                        return result;
                    });
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined,
                    });
                });
                console.log('✅ Navegador iniciado correctamente');
                // Detectar la plataforma de la URL
                if (this.config.meetingUrl.includes('meet.google.com')) {
                    yield this.joinGoogleMeet();
                }
                else {
                    throw new Error('Plataforma de meeting no soportada');
                }
            }
            catch (error) {
                console.error('❌ Error iniciando el bot:', error);
                yield this.cleanup();
                throw error;
            }
        });
    }
    joinGoogleMeet() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                throw new Error('Page no inicializada');
            console.log('🔗 Conectando a Google Meet...');
            this.googleBot = new google_meet_1.GoogleMeetBot(this.page, this.config);
            // Crear sesión de meeting
            this.session = {
                id: this.generateSessionId(),
                url: this.config.meetingUrl,
                startTime: new Date(),
                status: 'connecting',
                participants: [],
                transcription: []
            };
            console.log(`📝 Sesión creada: ${this.session.id}`);
            try {
                yield this.googleBot.join();
                this.session.status = 'joined';
                console.log('✅ Bot unido a la reunión exitosamente');
                // Comenzar a monitorear la reunión
                yield this.startMeetingMonitoring();
            }
            catch (error) {
                this.session.status = 'error';
                console.error('❌ Error uniéndose a Google Meet:', error);
                throw error;
            }
        });
    }
    startMeetingMonitoring() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.googleBot || !this.session)
                return;
            console.log('👁️ Iniciando monitoreo de la reunión...');
            // Monitorear participantes cada 30 segundos
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const participants = yield this.googleBot.getParticipants();
                    this.session.participants = participants;
                    console.log(`👥 Participantes actuales: ${participants.join(', ')}`);
                }
                catch (error) {
                    console.error('Error obteniendo participantes:', error);
                }
            }), 30000);
            // Monitorear si la reunión sigue activa
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const isActive = yield this.googleBot.isMeetingActive();
                    if (!isActive && this.session.status !== 'ended') {
                        console.log('📞 Reunión terminada');
                        yield this.endSession();
                    }
                }
                catch (error) {
                    console.error('Error verificando estado de la reunión:', error);
                }
            }), 10000);
            // Simular transcripción (por ahora solo logs)
            setInterval(() => {
                if (this.session && this.session.status === 'joined') {
                    const mockTranscript = `[${new Date().toISOString()}] Transcripción en progreso...`;
                    this.session.transcription.push(mockTranscript);
                    console.log('📝 ' + mockTranscript);
                }
            }, 60000);
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.session) {
                this.session.status = 'ended';
                this.session.endTime = new Date();
                console.log(`📋 Sesión finalizada: ${this.session.id}`);
                console.log(`⏱️ Duración: ${this.session.endTime.getTime() - this.session.startTime.getTime()}ms`);
            }
            yield this.cleanup();
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧹 Limpiando recursos...');
            try {
                if (this.page) {
                    yield this.page.close();
                    this.page = null;
                }
                if (this.browser) {
                    yield this.browser.close();
                    this.browser = null;
                }
                console.log('✅ Recursos liberados');
            }
            catch (error) {
                console.error('Error en cleanup:', error);
            }
        });
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getSession() {
        return this.session;
    }
    // Método para ser llamado desde la API
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return {
                status: ((_a = this.session) === null || _a === void 0 ? void 0 : _a.status) || 'not_started',
                session: this.session
            };
        });
    }
    // Método público para detener el bot
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.endSession();
        });
    }
}
exports.MeetingBot = MeetingBot;
// Función principal para testing directo
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/your-meeting-code';
        const botName = process.env.BOT_NAME || 'TOTS Notetaker';
        const config = {
            meetingUrl,
            botName,
            audioEnabled: false,
            videoEnabled: false,
            headless: false // Para debugging, cambiar a true en producción
        };
        const bot = new MeetingBot(config);
        try {
            yield bot.start();
            // Mantener el bot corriendo
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                console.log('\n👋 Señal de interrupción recibida, cerrando bot...');
                yield bot.endSession();
                process.exit(0);
            }));
            // Mantener el proceso vivo
            console.log('✅ Bot iniciado. Presiona Ctrl+C para detener.');
        }
        catch (error) {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        }
    });
}
// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}
