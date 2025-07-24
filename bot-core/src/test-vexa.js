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
            meetingUrl: process.env.MEET_URL || 'https://meet.google.com/ekm-ncfn-xft',
            botName: process.env.BOT_NAME || 'TOTS Notetaker',
            headless: false, // Para ver qué pasa
            audioEnabled: false,
            videoEnabled: false
        };
        console.log('🤖 Iniciando prueba del bot...');
        console.log(`📍 URL de reunión: ${config.meetingUrl}`);
        console.log(`👤 Nombre del bot: ${config.botName}`);
        const bot = new bot_1.MeetingBot(config);
        try {
            // Iniciar el navegador
            yield bot.start();
            console.log('✅ Navegador iniciado');
            // Unirse a Google Meet
            yield bot.joinGoogleMeet();
            console.log('✅ Bot se unió a la reunión');
            // Mantener el bot activo por 2 minutos para verificar
            console.log('⏱️ Manteniendo bot activo por 2 minutos...');
            yield new Promise(resolve => setTimeout(resolve, 120000));
        }
        catch (error) {
            console.error('❌ Error en la prueba:', error);
        }
        finally {
            // Limpiar recursos
            try {
                yield bot.stop();
                console.log('🧹 Recursos limpiados');
            }
            catch (error) {
                console.error('Error limpiando recursos:', error);
            }
        }
    });
}
// Ejecutar test si es llamado directamente
if (require.main === module) {
    testBot().catch(console.error);
}
