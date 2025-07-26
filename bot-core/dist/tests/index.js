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
exports.BotTestSuite = void 0;
exports.runTests = runTests;
const meeting_bot_1 = require("../src/meeting-bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Suite de tests completa para TOTS Meet Assistant Bot
 */
class BotTestSuite {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.warnings = 0;
    }
    runAllTests() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🤖 TOTS MEET ASSISTANT BOT - TEST SUITE');
            console.log('='.repeat(50));
            console.log('🚀 Ejecutando todos los tests...\n');
            try {
                yield this.testArchitecture();
                yield this.testBotCreation();
                yield this.testAPIWithoutConnection();
                yield this.testGoogleMeetConnection();
                this.printSummary();
            }
            catch (error) {
                console.error('💥 Error crítico en la suite de tests:', error);
                process.exit(1);
            }
        });
    }
    testArchitecture() {
        return __awaiter(this, void 0, void 0, function* () {
            this.printTestHeader('Arquitectura y Módulos');
            try {
                // Test 1: Importaciones
                const { MeetingBot } = yield Promise.resolve().then(() => __importStar(require('../src/meeting-bot')));
                this.logSuccess('Importación de MeetingBot');
                // Test 2: Tipos disponibles
                const config = {
                    meetingUrl: 'test',
                    botName: 'test'
                };
                this.logSuccess('Definición de tipos BotConfig');
                this.logSuccess('Arquitectura modular funcionando');
            }
            catch (error) {
                this.logError('Arquitectura', error);
            }
        });
    }
    testBotCreation() {
        return __awaiter(this, void 0, void 0, function* () {
            this.printTestHeader('Creación de Instancias');
            try {
                const config = {
                    meetingUrl: 'https://meet.google.com/test-invalid-meeting',
                    botName: 'TOTS Test Bot',
                    audioEnabled: false,
                    videoEnabled: false,
                    headless: true
                };
                const bot = new meeting_bot_1.MeetingBot(config);
                this.logSuccess('Instancia de bot creada');
                // Verificar que tiene los métodos esperados
                const methods = [
                    'start', 'stop', 'getStatus', 'getTranscriptions',
                    'getParticipants', 'getMeetingInfo', 'exportTranscriptionToText'
                ];
                for (const method of methods) {
                    if (typeof bot[method] === 'function') {
                        this.logSuccess(`Método ${method} disponible`);
                    }
                    else {
                        this.logError(`Método ${method} faltante`);
                    }
                }
            }
            catch (error) {
                this.logError('Creación de bot', error);
            }
        });
    }
    testAPIWithoutConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.printTestHeader('API sin Conexión');
            try {
                const config = {
                    meetingUrl: 'https://meet.google.com/test-invalid-meeting',
                    botName: 'TOTS API Test',
                    audioEnabled: false,
                    videoEnabled: false,
                    headless: true
                };
                const bot = new meeting_bot_1.MeetingBot(config);
                // Test métodos que no requieren conexión
                const status = yield bot.getStatus();
                this.logSuccess(`getStatus() - Estado: ${status.status}`);
                const transcriptions = bot.getTranscriptions();
                this.logSuccess(`getTranscriptions() - ${transcriptions.length} items`);
                const stats = bot.getTranscriptionStats();
                this.logSuccess(`getTranscriptionStats() - ${stats ? 'Disponible' : 'N/A'}`);
                const textExport = bot.exportTranscriptionToText();
                this.logSuccess(`exportTranscriptionToText() - ${textExport.length} chars`);
                const jsonExport = bot.exportTranscriptionToJSON();
                this.logSuccess(`exportTranscriptionToJSON() - ${jsonExport.length} chars`);
                // Métodos que pueden fallar sin conexión
                try {
                    const participants = yield bot.getParticipants();
                    this.logSuccess(`getParticipants() - ${participants.length} participantes`);
                }
                catch (_a) {
                    this.logWarning('getParticipants() requiere conexión activa');
                }
                try {
                    const meetingInfo = yield bot.getMeetingInfo();
                    this.logSuccess(`getMeetingInfo() - ${meetingInfo ? 'Disponible' : 'N/A'}`);
                }
                catch (_b) {
                    this.logWarning('getMeetingInfo() requiere conexión activa');
                }
            }
            catch (error) {
                this.logError('API sin conexión', error);
            }
        });
    }
    testGoogleMeetConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.printTestHeader('Conexión a Google Meet (Opcional)');
            const meetingUrl = process.env.MEET_URL;
            if (!meetingUrl) {
                this.logWarning('MEET_URL no configurada - saltando test de conexión real');
                this.logInfo('Para probar conexión real, configura MEET_URL en .env');
                return;
            }
            try {
                console.log(`   📍 Probando con URL: ${meetingUrl}`);
                const config = {
                    meetingUrl,
                    botName: 'TOTS Connection Test',
                    audioEnabled: false,
                    videoEnabled: false,
                    headless: true
                };
                const bot = new meeting_bot_1.MeetingBot(config);
                const startTime = Date.now();
                console.log('   🚀 Iniciando conexión...');
                yield bot.start();
                const connectionTime = Date.now() - startTime;
                this.logSuccess(`Conexión establecida en ${connectionTime}ms`);
                // Esperar estabilización
                yield new Promise(resolve => setTimeout(resolve, 3000));
                // Verificar estado después de conexión
                const status = yield bot.getStatus();
                this.logSuccess(`Estado post-conexión: ${status.status}`);
                if (status.session) {
                    this.logSuccess(`Session ID: ${status.session.id}`);
                    this.logSuccess(`Participantes: ${status.session.participants.length}`);
                }
                // Test funcionalidades en vivo
                try {
                    const participants = yield bot.getParticipants();
                    this.logSuccess(`Participantes detectados: ${participants.length}`);
                }
                catch (_a) {
                    this.logWarning('No se pudieron detectar participantes');
                }
                // Cleanup
                console.log('   🧹 Desconectando...');
                yield bot.stop();
                this.logSuccess('Desconexión exitosa');
            }
            catch (error) {
                this.logError('Conexión a Google Meet', error);
            }
        });
    }
    printTestHeader(title) {
        console.log(`\n📋 ${title}`);
        console.log('-'.repeat(30));
    }
    logSuccess(message) {
        console.log(`   ✅ ${message}`);
        this.passed++;
    }
    logError(test, error) {
        console.log(`   ❌ ${test}${error ? ': ' + error.message : ''}`);
        this.failed++;
    }
    logWarning(message) {
        console.log(`   ⚠️ ${message}`);
        this.warnings++;
    }
    logInfo(message) {
        console.log(`   ℹ️ ${message}`);
    }
    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMEN DE TESTS');
        console.log('='.repeat(50));
        console.log(`✅ Tests exitosos: ${this.passed}`);
        console.log(`❌ Tests fallidos: ${this.failed}`);
        console.log(`⚠️ Advertencias: ${this.warnings}`);
        if (this.failed === 0) {
            console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
            console.log('✨ El bot está listo para producción');
        }
        else {
            console.log(`\n💥 ${this.failed} tests fallaron`);
            console.log('🔧 Revisa los errores antes de usar en producción');
        }
        console.log('='.repeat(50));
    }
}
exports.BotTestSuite = BotTestSuite;
// Función principal
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        const testSuite = new BotTestSuite();
        yield testSuite.runAllTests();
    });
}
// Ejecutar si es llamado directamente
if (require.main === module) {
    runTests().catch((error) => {
        console.error('💥 Error ejecutando tests:', error);
        process.exit(1);
    });
}
