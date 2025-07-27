"use strict";
/**
 * Test específico para verificar que el micrófono funciona en Playwright
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMicrophone = testMicrophone;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const google_meet_bot_1 = require("../src/platforms/google-meet-bot");
function testMicrophone() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🎤 INICIANDO TEST DE MICRÓFONO');
        console.log('='.repeat(50));
        const bot = new google_meet_bot_1.GoogleMeetBot({
            meetingUrl: 'https://meet.google.com/dvw-akbq-qxv',
            botName: 'Test-Microphone-Bot',
            headless: false,
            audioEnabled: true,
            videoEnabled: false
        });
        try {
            console.log('🚀 Iniciando bot...');
            yield bot.start();
            console.log('✅ Bot unido exitosamente');
            console.log('🎤 Probando grabación de micrófono...');
            // Intentar iniciar grabación para probar el micrófono
            try {
                yield bot.toggleRecording(true);
                console.log('✅ Grabación iniciada exitosamente');
                // Esperar un poco para capturar algo de audio
                yield new Promise(resolve => setTimeout(resolve, 3000));
                // Detener grabación
                yield bot.toggleRecording(false);
                console.log('✅ Grabación detenida');
                console.log('✅ Test de micrófono completado exitosamente');
            }
            catch (recordingError) {
                console.error('❌ Error en grabación:', recordingError);
            }
        }
        catch (error) {
            console.error('❌ ERROR EN TEST:', error);
        }
        finally {
            console.log('🔄 Test completado');
        }
    });
}
// Ejecutar test si se llama directamente
if (require.main === module) {
    testMicrophone().catch(error => {
        console.error('💥 TEST FALLÓ:', error);
        process.exit(1);
    });
}
