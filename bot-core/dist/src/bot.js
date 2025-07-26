"use strict";
// DEPRECATED: Este archivo está siendo reemplazado por la nueva arquitectura modular
// Usar: import { MeetingBot } from './meeting-bot'; en su lugar
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
const meeting_bot_1 = require("./meeting-bot");
// Re-exportar para compatibilidad hacia atrás
var meeting_bot_2 = require("./meeting-bot");
Object.defineProperty(exports, "MeetingBot", { enumerable: true, get: function () { return meeting_bot_2.MeetingBot; } });
// Función principal actualizada para usar la nueva arquitectura
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
        console.log('🔄 Usando la nueva arquitectura modular del bot...');
        const bot = new meeting_bot_1.MeetingBot(config);
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
