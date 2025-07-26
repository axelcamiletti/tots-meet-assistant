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
exports.testBot = testBot;
exports.quickTest = quickTest;
const meeting_bot_1 = require("../src/meeting-bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Test único y completo para TOTS Meet Assistant Bot
 */
function testBot() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🤖 TOTS MEET ASSISTANT BOT - TEST ÚNICO');
        console.log('='.repeat(50));
        const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
        const config = {
            meetingUrl,
            botName: 'TOTS Bot Test',
            audioEnabled: false,
            videoEnabled: false,
            headless: false // Para poder ver qué pasa
        };
        console.log('🎯 Configuración:');
        console.log(`   📍 URL: ${config.meetingUrl}`);
        console.log(`   🤖 Bot: ${config.botName}`);
        console.log(`   👁️ Visible: SÍ\n`);
        const bot = new meeting_bot_1.MeetingBot(config);
        let success = false;
        try {
            console.log('🚀 Iniciando bot...');
            yield bot.start();
            console.log('✅ Bot iniciado exitosamente');
            success = true;
            // Verificar estado
            const status = yield bot.getStatus();
            console.log(`📊 Estado: ${status.status}`);
            if (status.session) {
                console.log(`📋 Session ID: ${status.session.id}`);
                console.log(`👥 Participantes: ${status.session.participants.length}`);
                console.log(`📝 Transcripciones: ${status.session.transcription.length}`);
            }
            // MANTENER EL BOT ACTIVO - Este era el problema
            console.log('\n⏰ Bot funcionando - manteniendo activo por 60 segundos...');
            console.log('   (El bot está ahora en la reunión haciendo su trabajo)');
            // Monitorear cada 10 segundos
            for (let i = 0; i < 6; i++) {
                yield new Promise(resolve => setTimeout(resolve, 10000));
                const currentStatus = yield bot.getStatus();
                const transcriptions = bot.getTranscriptions();
                console.log(`   [${(i + 1) * 10}s] Estado: ${currentStatus.status} | Transcripciones: ${transcriptions.length}`);
                // Si hay participantes, mostrarlos
                try {
                    const participants = yield bot.getParticipants();
                    if (participants.length > 0) {
                        console.log(`   [${(i + 1) * 10}s] Participantes detectados: ${participants.length}`);
                    }
                }
                catch (error) {
                    // No pasa nada si no se pueden obtener participantes
                }
            }
        }
        catch (error) {
            console.error('\n❌ ERROR:');
            console.error((error === null || error === void 0 ? void 0 : error.message) || error);
            success = false;
        }
        finally {
            console.log('\n🛑 Finalizando test...');
            try {
                yield bot.stop();
                console.log('✅ Bot detenido correctamente');
            }
            catch (stopError) {
                console.log('⚠️ Error deteniendo bot:', (stopError === null || stopError === void 0 ? void 0 : stopError.message) || stopError);
            }
            // Resumen final
            console.log('\n' + '='.repeat(50));
            console.log('📊 RESUMEN DEL TEST');
            console.log('='.repeat(50));
            if (success) {
                console.log('✅ TEST EXITOSO');
                console.log('🎉 El bot funciona correctamente');
                console.log('📝 Puede unirse a reuniones y mantener la conexión');
            }
            else {
                console.log('❌ TEST FALLIDO');
                console.log('🔧 Revisar errores antes de usar en producción');
            }
            console.log('='.repeat(50));
        }
    });
}
// Función para test rápido sin conexión real
function quickTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⚡ TEST RÁPIDO (Sin conexión real)');
        console.log('='.repeat(30));
        const config = {
            meetingUrl: 'https://meet.google.com/test-invalid',
            botName: 'TOTS Quick Test',
            audioEnabled: false,
            videoEnabled: false,
            headless: true
        };
        const bot = new meeting_bot_1.MeetingBot(config);
        console.log('✅ Bot creado');
        // Test API sin conexión
        const status = yield bot.getStatus();
        const transcriptions = bot.getTranscriptions();
        const textExport = bot.exportTranscriptionToText();
        console.log(`✅ Estado: ${status.status}`);
        console.log(`✅ Transcripciones: ${transcriptions.length}`);
        console.log(`✅ Export: ${textExport.length} chars`);
        console.log('✅ API funciona correctamente\n');
    });
}
// Función principal
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.includes('--quick')) {
            yield quickTest();
        }
        else {
            // Primero test rápido
            yield quickTest();
            // Luego test completo
            yield testBot();
        }
    });
}
// Ejecutar si es llamado directamente
if (require.main === module) {
    runTest().catch(console.error);
}
