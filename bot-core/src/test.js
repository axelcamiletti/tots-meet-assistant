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
const bot_1 = require("./bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function testBot() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            meetingUrl: process.env.MEET_URL || 'https://meet.google.com/xwq-opgb-req',
            botName: process.env.BOT_NAME || 'TOTS Notetaker',
            headless: false, // Para ver qué pasa
            audioEnabled: false,
            videoEnabled: false
        };
        console.log('🤖 Iniciando prueba del bot con transcripción...');
        console.log(`📍 URL de reunión: ${config.meetingUrl}`);
        console.log(`👤 Nombre del bot: ${config.botName}`);
        const bot = new bot_1.MeetingBot(config);
        try {
            // Iniciar el bot (incluye navegador + unirse + transcripción)
            yield bot.start();
            console.log('✅ Bot iniciado y conectado a la reunión');
            // Mostrar estado del bot cada 15 segundos
            const statusInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const status = yield bot.getStatus();
                const transcriptions = bot.getTranscriptions();
                const stats = bot.getTranscriptionStats();
                console.log('\n📊 === ESTADO DEL BOT ===');
                console.log(`Estado: ${status.status}`);
                console.log(`Sesión: ${(_a = status.session) === null || _a === void 0 ? void 0 : _a.id}`);
                console.log(`Transcripción activa: ${(stats === null || stats === void 0 ? void 0 : stats.isRecording) ? '✅ SÍ' : '❌ NO'}`);
                console.log(`Total transcripciones: ${transcriptions.length}`);
                // Mostrar últimas 2 transcripciones si hay
                if (transcriptions.length > 0) {
                    console.log('📝 Últimas transcripciones:');
                    const recent = transcriptions.slice(-2);
                    recent.forEach(t => {
                        console.log(`  [${t.timestamp.toLocaleTimeString()}] ${t.speaker}: ${t.text}`);
                    });
                }
                else {
                    console.log('📝 Esperando transcripciones...');
                }
                console.log('========================\n');
            }), 15000);
            // Manejo de cierre con Ctrl+C
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                console.log('\n👋 Cerrando bot...');
                clearInterval(statusInterval);
                // Mostrar resumen final
                const finalTranscriptions = bot.getTranscriptions();
                const summary = bot.getTranscriptionSummary();
                if (finalTranscriptions.length > 0) {
                    console.log('\n📄 === TRANSCRIPCIÓN FINAL ===');
                    console.log(`Total entradas: ${(summary === null || summary === void 0 ? void 0 : summary.totalEntries) || 0}`);
                    console.log(`Hablantes: ${(summary === null || summary === void 0 ? void 0 : summary.speakers.join(', ')) || 'N/A'}`);
                    const exportText = bot.exportTranscriptionToText();
                    console.log(exportText);
                    console.log('=============================\n');
                }
                else {
                    console.log('❌ No se capturaron transcripciones');
                }
                yield bot.stop();
                process.exit(0);
            }));
            console.log('✅ Bot activo. Las transcripciones aparecerán automáticamente.');
            console.log('🎤 Asegúrate de que haya conversación en la reunión.');
            console.log('⏹️ Presiona Ctrl+C para detener.');
            // Mantener el proceso vivo
            setInterval(() => {
                // Solo para mantener el proceso activo
            }, 1000);
        }
        catch (error) {
            console.error('❌ Error en la prueba:', error);
            // Mostrar información de debug
            console.log('\n🔍 Información de debug:');
            console.log('- Revisar que la URL de la reunión sea correcta');
            console.log('- Verificar que la reunión esté activa');
            console.log('- Comprobar que hay conversación para transcribir');
            console.log('- Ver screenshots: debug-*.png');
            process.exit(1);
        }
    });
}
// Ejecutar test si es llamado directamente
if (require.main === module) {
    testBot().catch(console.error);
}
