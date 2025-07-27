"use strict";
/**
 * Google Meet - Lógica de unión a reuniones
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMeetJoinModule = void 0;
exports.joinGoogleMeet = joinGoogleMeet;
class GoogleMeetJoinModule {
    constructor(page, config) {
        this.page = page;
        this.config = config;
    }
    joinMeeting() {
        return __awaiter(this, void 0, void 0, function* () {
            return joinGoogleMeet(this.page, this.config.meetingUrl);
        });
    }
}
exports.GoogleMeetJoinModule = GoogleMeetJoinModule;
function joinGoogleMeet(page, meetingUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔗 Iniciando proceso de unión a Google Meet...');
        try {
            // 1. Navegar a la URL de la reunión
            console.log('🔗 Conectando a Google Meet...');
            yield page.goto(meetingUrl, {
                waitUntil: 'networkidle',
                timeout: 30000
            });
            // 2. Esperar a que cargue la página
            console.log('📄 Página cargada, esperando controles...');
            yield page.waitForTimeout(3000);
            // 3. Configurar audio y video
            yield configureAudioVideo(page);
            // 4. Configurar nombre si es necesario
            yield configureName(page);
            // 5. Unirse a la reunión
            yield clickJoinButton(page);
            // 6. Esperar confirmación de que estamos en la reunión
            yield waitForJoinConfirmation(page);
            console.log('✅ Unido a Google Meet exitosamente');
        }
        catch (error) {
            console.error('❌ Error uniéndose a Google Meet:', error);
            throw error;
        }
    });
}
function configureAudioVideo(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🎛️ Configurando audio y video...');
        try {
            // Desactivar micrófono si está activo
            const micButton = page.locator('[data-is-muted="false"][aria-label*="micrófono"], [data-is-muted="false"][aria-label*="microphone"], button[aria-label*="Desactivar micrófono"], button[aria-label*="Turn off microphone"]');
            if (yield micButton.isVisible({ timeout: 2000 })) {
                yield micButton.click();
                console.log('🔇 Micrófono desactivado');
            }
            // Desactivar cámara si está activa
            const cameraButton = page.locator('[data-is-muted="false"][aria-label*="cámara"], [data-is-muted="false"][aria-label*="camera"], button[aria-label*="Desactivar cámara"], button[aria-label*="Turn off camera"]');
            if (yield cameraButton.isVisible({ timeout: 2000 })) {
                yield cameraButton.click();
                console.log('📹 Cámara desactivada');
            }
            console.log('✅ Audio y video configurados');
        }
        catch (error) {
            console.log('⚠️ No se pudieron configurar audio/video automáticamente');
        }
    });
}
function configureName(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('👤 Configurando nombre...');
        try {
            // Buscar campo de nombre
            const nameInput = page.locator('input[placeholder*="nombre"], input[placeholder*="name"], input[aria-label*="nombre"], input[aria-label*="name"]');
            if (yield nameInput.isVisible({ timeout: 3000 })) {
                yield nameInput.fill('TOTS Bot Assistant');
                console.log('✅ Nombre configurado: TOTS Bot Assistant');
            }
            else {
                console.log('   ⚠️ No se encontró campo de nombre editable');
            }
        }
        catch (error) {
            console.log('   ⚠️ Error configurando nombre:', error instanceof Error ? error.message : String(error));
        }
    });
}
function clickJoinButton(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔘 Buscando botón para unirse...');
        try {
            // Lista de posibles selectores para el botón de unirse
            const joinButtonSelectors = [
                'button[aria-label*="Unirse ahora"]',
                'button[aria-label*="Join now"]',
                'button[aria-label*="Solicitar unirse"]',
                'button[aria-label*="Ask to join"]',
                'button:has-text("Unirse ahora")',
                'button:has-text("Join now")',
                'button:has-text("Solicitar unirse")',
                'button:has-text("Ask to join")',
                '[data-mdc-dialog-action="ok"]',
                'button[jsname="Qx7uuf"]', // Selector específico de Google Meet
                '.uArJ5e', // Clase del botón de unirse
                '[role="button"]:has-text("Unirse")',
                '[role="button"]:has-text("Join")'
            ];
            let buttonFound = false;
            for (const selector of joinButtonSelectors) {
                try {
                    const button = page.locator(selector);
                    if (yield button.isVisible({ timeout: 2000 })) {
                        yield button.click();
                        console.log(`✅ Botón de unirse presionado (${selector})`);
                        buttonFound = true;
                        break;
                    }
                }
                catch (e) {
                    // Continuar con el siguiente selector
                }
            }
            if (!buttonFound) {
                // Último intento: buscar cualquier botón que contenga texto relacionado
                const fallbackButton = page.locator('button').filter({ hasText: /unir|join|solicitar|ask/i });
                if (yield fallbackButton.first().isVisible({ timeout: 2000 })) {
                    yield fallbackButton.first().click();
                    console.log('✅ Botón de unirse encontrado (fallback)');
                    buttonFound = true;
                }
            }
            if (!buttonFound) {
                throw new Error('No se encontró el botón para unirse a la reunión');
            }
            // Esperar un poco después de hacer clic
            yield page.waitForTimeout(2000);
        }
        catch (error) {
            console.error('❌ Error haciendo clic en botón de unirse:', error);
            throw error;
        }
    });
}
function waitForJoinConfirmation(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('⏳ Esperando confirmación de unión...');
        try {
            // Usar selectores CSS en lugar de JavaScript dinámico para evitar Trusted Types
            yield Promise.race([
                // Opción 1: Aparecen controles de la reunión
                page.waitForSelector([
                    '[aria-label*="Activar micrófono"]',
                    '[aria-label*="Turn on microphone"]',
                    '[aria-label*="Desactivar micrófono"]',
                    '[aria-label*="Turn off microphone"]',
                    '[data-tooltip*="micrófono"]',
                    '[data-tooltip*="microphone"]',
                    '[data-is-muted]',
                    '.wnPUne', // Clase de controles de Google Meet
                    'button[aria-label*="microphone"]',
                    'button[aria-label*="micrófono"]'
                ].join(', '), { timeout: 20000 }),
                // Opción 2: Aparece el área de participantes o título de reunión
                page.waitForSelector([
                    '[aria-label*="Mostrar participantes"]',
                    '[aria-label*="Show everyone"]',
                    '[data-tab-id="1"]', // Tab de participantes
                    '[data-meeting-title]',
                    '.uGOf1d', // Área de participantes
                    '[aria-label*="reunion"]',
                    '[aria-label*="meeting"]'
                ].join(', '), { timeout: 20000 }),
                // Opción 3: Botón de salir de la llamada
                page.waitForSelector([
                    '[aria-label*="Salir de la llamada"]',
                    '[aria-label*="Leave call"]',
                    '[aria-label*="Finalizar llamada"]',
                    '[aria-label*="End call"]',
                    'button[data-tooltip*="Salir"]',
                    'button[data-tooltip*="Leave"]'
                ].join(', '), { timeout: 20000 })
            ]);
            // Verificación adicional usando selectores CSS simples
            const meetingElements = yield page.locator([
                '[data-meeting-title]',
                '[aria-label*="Salir de la llamada"]',
                '[aria-label*="Leave call"]',
                '[data-is-muted]',
                '.wnPUne',
                '[data-tab-id]'
            ].join(', ')).count();
            if (meetingElements > 0) {
                console.log('✅ Confirmación exitosa - estamos en la reunión');
            }
            else {
                console.log('⚠️ Confirmación parcial - verificando estado...');
                // Intentar una verificación adicional esperando un poco más
                yield page.waitForTimeout(3000);
                const urlCheck = yield page.url();
                if (urlCheck.includes('meet.google.com') && !urlCheck.includes('authuser')) {
                    console.log('✅ Confirmación por URL - estamos en la reunión');
                }
                else {
                    throw new Error('No se pudo confirmar la unión a la reunión');
                }
            }
            // Esperar un poco más para asegurar que la página esté completamente cargada
            yield page.waitForTimeout(2000);
            console.log('✅ Unión confirmada y página estable');
        }
        catch (error) {
            console.error('❌ Error esperando confirmación de unión:', error);
            // Diagnóstico adicional
            const currentUrl = yield page.url();
            console.log('URL actual:', currentUrl);
            const pageTitle = yield page.title();
            console.log('Título de página:', pageTitle);
            throw new Error(`No se pudo confirmar la unión a la reunión. URL: ${currentUrl}`);
        }
    });
}
