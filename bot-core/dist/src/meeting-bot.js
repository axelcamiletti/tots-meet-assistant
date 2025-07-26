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
const google_meet_bot_1 = require("./platforms/google-meet-bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class MeetingBot {
    constructor(config) {
        this.config = config;
        this.platformBot = null;
        console.log('🤖 TOTS Notetaker Bot inicializando...');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🚀 Iniciando bot...');
                // Detectar la plataforma de la URL y crear el bot correspondiente
                if (this.config.meetingUrl.includes('meet.google.com')) {
                    yield this.createGoogleMeetBot();
                }
                else {
                    throw new Error('Plataforma de meeting no soportada');
                }
                console.log('✅ Bot iniciado correctamente');
            }
            catch (error) {
                console.error('❌ Error iniciando el bot:', error);
                yield this.cleanup();
                throw error;
            }
        });
    }
    createGoogleMeetBot() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🎯 Creando bot para Google Meet...');
            this.platformBot = new google_meet_bot_1.GoogleMeetBot(this.config);
            // Configurar eventos
            this.setupEventHandlers();
            // Iniciar el bot
            yield this.platformBot.start();
        });
    }
    setupEventHandlers() {
        if (!this.platformBot)
            return;
        this.platformBot.on('sessionCreated', (session) => {
            console.log(`📝 Sesión creada: ${session.id}`);
        });
        this.platformBot.on('joined', () => {
            console.log('✅ Bot unido a la reunión exitosamente');
        });
        this.platformBot.on('sessionEnded', (session) => {
            console.log(`📋 Sesión finalizada: ${session.id}`);
            this.printSessionSummary(session);
        });
        this.platformBot.on('transcriptionUpdate', (entry) => {
            console.log(`📝 [${entry.speaker}]: ${entry.text}`);
        });
        this.platformBot.on('participantsUpdate', (participants) => {
            console.log(`👥 Participantes actuales: ${participants.join(', ')}`);
        });
        this.platformBot.on('error', (error) => {
            console.error('❌ Error del bot:', error);
        });
    }
    printSessionSummary(session) {
        if (!session.endTime)
            return;
        const duration = session.endTime.getTime() - session.startTime.getTime();
        console.log('\n📊 RESUMEN DE LA SESIÓN');
        console.log('========================');
        console.log(`ID: ${session.id}`);
        console.log(`Duración: ${Math.round(duration / 1000)}s`);
        console.log(`Participantes: ${session.participants.length}`);
        console.log(`Transcripciones: ${session.transcription.length}`);
        console.log('========================\n');
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platformBot) {
                yield this.platformBot.stop();
            }
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧹 Limpiando recursos del MeetingBot...');
            if (this.platformBot) {
                yield this.platformBot.stop();
                this.platformBot = null;
            }
            console.log('✅ Recursos del MeetingBot liberados');
        });
    }
    // Métodos de acceso público
    getSession() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getSession()) || null;
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getStatus()) || { status: 'not_started', session: null };
        });
    }
    getDetailedStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platformBot && 'getDetailedStatus' in this.platformBot) {
                return yield this.platformBot.getDetailedStatus();
            }
            return this.getStatus();
        });
    }
    // Métodos de transcripción
    getTranscriptions() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getTranscriptions()) || [];
    }
    getTranscriptionStats() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getTranscriptionStats()) || null;
    }
    getTranscriptionSummary() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getTranscriptionSummary()) || null;
    }
    exportTranscriptionToText() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.exportTranscriptionToText()) || 'No hay transcripciones disponibles';
    }
    exportTranscriptionToJSON() {
        var _a;
        return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.exportTranscriptionToJSON()) || '[]';
    }
    toggleTranscription(enable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platformBot && 'toggleTranscription' in this.platformBot) {
                yield this.platformBot.toggleTranscription(enable);
            }
        });
    }
    // Métodos de monitoreo
    getParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.getParticipants()) || [];
        });
    }
    isMeetingActive() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.platformBot) === null || _a === void 0 ? void 0 : _a.isMeetingActive()) || false;
        });
    }
    getMeetingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platformBot && 'getMeetingInfo' in this.platformBot) {
                return yield this.platformBot.getMeetingInfo();
            }
            return null;
        });
    }
    getNetworkQuality() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.platformBot && 'getNetworkQuality' in this.platformBot) {
                return yield this.platformBot.getNetworkQuality();
            }
            return 'unknown';
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
                yield bot.stop();
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
