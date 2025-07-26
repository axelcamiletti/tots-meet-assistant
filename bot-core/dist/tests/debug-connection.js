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
exports.debugConnectionIssue = debugConnectionIssue;
exports.debugPageManually = debugPageManually;
const meeting_bot_1 = require("../src/meeting-bot");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * Test de debugging específico para investigar el problema de unión
 */
function debugConnectionIssue() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log('🔍 DEBUGGING CONEXIÓN GOOGLE MEET');
        console.log('='.repeat(50));
        const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
        const config = {
            meetingUrl,
            botName: 'TOTS Debug Connection Bot',
            audioEnabled: false,
            videoEnabled: false,
            headless: false, // Queremos ver qué pasa
            slowMo: 1000 // Lento para observar
        };
        console.log('🎯 Configuración de debug:');
        console.log(`   📍 URL: ${config.meetingUrl}`);
        console.log(`   👁️ Visible: SÍ`);
        console.log(`   ⏱️ SlowMo: ${config.slowMo}ms\n`);
        const bot = new meeting_bot_1.MeetingBot(config);
        try {
            console.log('🚀 Iniciando proceso de debugging...');
            // Iniciar el bot y capturar el error específico
            yield bot.start();
            console.log('✅ Bot iniciado exitosamente - esto es inesperado');
            // Si llegamos aquí, el bot se conectó
            const status = yield bot.getStatus();
            console.log(`📊 Estado: ${status.status}`);
            if (status.session) {
                console.log(`📋 Session ID: ${status.session.id}`);
                console.log(`👥 Participantes: ${status.session.participants.length}`);
            }
            // Mantener activo para observar
            console.log('⏰ Manteniendo activo por 15 segundos para observar...');
            yield new Promise(resolve => setTimeout(resolve, 15000));
        }
        catch (error) {
            console.error('\n❌ ERROR CAPTURADO:');
            console.error('='.repeat(30));
            console.error((error === null || error === void 0 ? void 0 : error.message) || error);
            console.error('\n📋 Tipo de error:', ((_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown');
            // Información adicional de debugging
            try {
                const status = yield bot.getStatus();
                console.log('\n🔍 Estado del bot después del error:');
                console.log(`   Status: ${status.status}`);
                console.log(`   Session: ${status.session ? 'Existe' : 'Null'}`);
                if (status.session) {
                    console.log(`   Session ID: ${status.session.id}`);
                    console.log(`   Session Status: ${status.session.status}`);
                }
            }
            catch (statusError) {
                console.log('⚠️ No se pudo obtener estado del bot');
            }
        }
        finally {
            console.log('\n🛑 Finalizando debug test...');
            try {
                yield bot.stop();
                console.log('✅ Bot detenido correctamente');
            }
            catch (stopError) {
                console.log('⚠️ Error deteniendo bot:', (stopError === null || stopError === void 0 ? void 0 : stopError.message) || stopError);
            }
        }
    });
}
// Función para debug manual de la página
function debugPageManually() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('\n🔧 DEBUG MANUAL DE PÁGINA');
        console.log('='.repeat(50));
        const { chromium } = require('playwright');
        const browser = yield chromium.launch({
            headless: false,
            slowMo: 1000
        });
        const page = yield browser.newPage();
        try {
            const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
            console.log(`📍 Navegando a: ${meetingUrl}`);
            yield page.goto(meetingUrl, { waitUntil: 'networkidle' });
            console.log('📄 Página cargada');
            yield page.waitForTimeout(3000);
            // Inspeccionar elementos disponibles
            console.log('\n🔍 Inspeccionando elementos disponibles...');
            // Verificar si estamos en una página de error
            const pageTitle = yield page.title();
            console.log(`📋 Título de página: "${pageTitle}"`);
            const currentUrl = page.url();
            console.log(`🔗 URL actual: ${currentUrl}`);
            // Buscar mensajes de error comunes
            const errorMessages = yield page.$$eval('*', (elements) => {
                const texts = [];
                elements.forEach((el) => {
                    var _a;
                    const text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                    if (text && (text.includes('expired') ||
                        text.includes('not found') ||
                        text.includes('invalid') ||
                        text.includes('ended') ||
                        text.includes('expirado') ||
                        text.includes('no encontrada') ||
                        text.includes('terminada'))) {
                        texts.push(text);
                    }
                });
                return texts.slice(0, 5); // Solo los primeros 5
            });
            if (errorMessages.length > 0) {
                console.log('\n⚠️ Mensajes de error encontrados:');
                errorMessages.forEach((msg) => console.log(`   - ${msg}`));
            }
            // Buscar botones de unión
            const joinButtons = yield page.$$eval('*', (elements) => {
                const buttons = [];
                elements.forEach((el) => {
                    var _a, _b;
                    const text = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
                    const ariaLabel = (_b = el.getAttribute('aria-label')) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                    const role = el.getAttribute('role');
                    if ((role === 'button' || el.tagName === 'BUTTON') && ((text === null || text === void 0 ? void 0 : text.includes('join')) ||
                        (text === null || text === void 0 ? void 0 : text.includes('unirse')) ||
                        (ariaLabel === null || ariaLabel === void 0 ? void 0 : ariaLabel.includes('join')) ||
                        (ariaLabel === null || ariaLabel === void 0 ? void 0 : ariaLabel.includes('unirse')))) {
                        buttons.push({
                            tag: el.tagName,
                            text: text === null || text === void 0 ? void 0 : text.substring(0, 50),
                            ariaLabel: ariaLabel === null || ariaLabel === void 0 ? void 0 : ariaLabel.substring(0, 50),
                            role: role
                        });
                    }
                });
                return buttons.slice(0, 10); // Solo los primeros 10
            });
            if (joinButtons.length > 0) {
                console.log('\n🔘 Botones de unión encontrados:');
                joinButtons.forEach((btn, i) => {
                    console.log(`   ${i + 1}. ${btn.tag} - "${btn.text}" - aria-label: "${btn.ariaLabel}"`);
                });
            }
            else {
                console.log('\n❌ No se encontraron botones de unión');
            }
            console.log('\n⏰ Página abierta por 30 segundos para inspección manual...');
            yield page.waitForTimeout(30000);
        }
        catch (error) {
            console.error('❌ Error en debug manual:', error);
        }
        finally {
            yield browser.close();
        }
    });
}
// Ejecutar
function runDebug() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Iniciando debugging completo...\n');
        // Primero el debug del bot
        yield debugConnectionIssue();
        // Luego el debug manual de la página
        yield debugPageManually();
        console.log('\n✅ Debugging completado');
    });
}
// Ejecutar si es llamado directamente
if (require.main === module) {
    runDebug().catch(console.error);
}
