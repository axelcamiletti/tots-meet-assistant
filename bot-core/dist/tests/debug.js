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
exports.debugTest = debugTest;
const meeting_bot_1 = require("../src/meeting-bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Test de debugging visual - Para desarrollo y debugging
 * Ejecutar con: npm run test:debug
 */
function debugTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔍 TOTS DEBUG TEST');
        console.log('='.repeat(30));
        console.log('👀 Browser visible para debugging\n');
        const meetingUrl = process.env.MEET_URL;
        if (!meetingUrl) {
            console.log('❌ Error: MEET_URL no configurada en .env');
            console.log('   Configura MEET_URL=https://meet.google.com/xxx-xxxx-xxx');
            return;
        }
        const config = {
            meetingUrl,
            botName: 'TOTS Debug Bot',
            audioEnabled: false,
            videoEnabled: false,
            headless: false, // 👀 Browser visible
            slowMo: 500 // Movimientos lentos
        };
        console.log('🎯 Configuración de debug:');
        console.log(`   📍 URL: ${config.meetingUrl}`);
        console.log(`   🤖 Bot: ${config.botName}`);
        console.log(`   👁️ Visible: SÍ`);
        console.log(`   ⏱️ SlowMo: ${config.slowMo}ms\n`);
        const bot = new meeting_bot_1.MeetingBot(config);
        try {
            console.log('🚀 Iniciando debug con browser visible...');
            yield bot.start();
            console.log('✅ Bot iniciado - observa el browser');
            console.log('⏰ Manteniendo activo por 30 segundos para debugging...');
            // Mostrar estado cada 5 segundos
            for (let i = 0; i < 6; i++) {
                yield new Promise(resolve => setTimeout(resolve, 5000));
                const status = yield bot.getStatus();
                console.log(`   [${(i + 1) * 5}s] Estado: ${status.status}`);
            }
        }
        catch (error) {
            console.error('❌ Error en debug test:', error);
        }
        finally {
            console.log('\n🛑 Cerrando debug test...');
            yield bot.stop();
            console.log('✅ Debug test finalizado');
        }
    });
}
// Ejecutar si es llamado directamente
if (require.main === module) {
    debugTest().catch(console.error);
}
