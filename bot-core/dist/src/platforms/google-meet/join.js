"use strict";
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
class GoogleMeetJoinModule {
    constructor(page, config) {
        this.page = page;
        this.config = config;
    }
    joinMeeting() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔗 Conectando a Google Meet...');
            try {
                // Navegar a la URL de la reunión
                yield this.page.goto(this.config.meetingUrl, {
                    waitUntil: 'networkidle',
                    timeout: 30000
                });
                console.log('📄 Página cargada, esperando controles...');
                // Esperar a que la página esté lista
                yield this.page.waitForTimeout(3000);
                // Configurar audio y video antes de unirse
                yield this.configureAudioVideo();
                // Configurar nombre si es necesario
                yield this.configureName();
                // Esperar y hacer clic en "Join now" o "Unirse ahora"
                yield this.clickJoinButton();
                // Esperar confirmación de que se unió a la reunión
                yield this.waitForJoinConfirmation();
                console.log('✅ Unido a Google Meet exitosamente');
            }
            catch (error) {
                console.error('❌ Error uniéndose a Google Meet:', error);
                throw error;
            }
        });
    }
    configureAudioVideo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🎛️ Configurando audio y video...');
                // Selectores modernos para Google Meet (2024-2025)
                const micSelectors = [
                    '[data-is-muted]', // Selector moderno principal
                    'div[role="button"][aria-label*="microphone" i]',
                    'div[role="button"][aria-label*="micrófono" i]',
                    'button[aria-label*="microphone" i]',
                    'button[aria-label*="micrófono" i]',
                    '[jsname="BOHaEe"]', // Selector específico conocido
                    'div[data-tooltip*="Turn on microphone" i]',
                    'div[data-tooltip*="Turn off microphone" i]'
                ];
                const camSelectors = [
                    'div[role="button"][aria-label*="camera" i]',
                    'div[role="button"][aria-label*="cámara" i]',
                    'button[aria-label*="camera" i]',
                    'button[aria-label*="cámara" i]',
                    '[jsname="I5Fjmd"]', // Selector específico conocido
                    'div[data-tooltip*="Turn on camera" i]',
                    'div[data-tooltip*="Turn off camera" i]'
                ];
                // Intentar configurar micrófono
                if (!this.config.audioEnabled) {
                    yield this.toggleControl(micSelectors, false, 'micrófono');
                }
                // Intentar configurar cámara
                if (!this.config.videoEnabled) {
                    yield this.toggleControl(camSelectors, false, 'cámara');
                }
                console.log('✅ Audio y video configurados');
            }
            catch (error) {
                console.log('⚠️ No se pudieron configurar audio/video automáticamente:', error.message);
                console.log('   Continuando sin configuración automática...');
            }
        });
    }
    toggleControl(selectors, enable, controlName) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const selector of selectors) {
                try {
                    const elements = yield this.page.$$(selector);
                    for (const element of elements) {
                        // Verificar si es el control correcto
                        const ariaLabel = yield element.getAttribute('aria-label');
                        const dataTooltip = yield element.getAttribute('data-tooltip');
                        if ((ariaLabel === null || ariaLabel === void 0 ? void 0 : ariaLabel.toLowerCase().includes(controlName.toLowerCase())) ||
                            (dataTooltip === null || dataTooltip === void 0 ? void 0 : dataTooltip.toLowerCase().includes(controlName.toLowerCase()))) {
                            // Verificar estado actual
                            const isMuted = (yield element.getAttribute('data-is-muted')) === 'true' ||
                                (ariaLabel === null || ariaLabel === void 0 ? void 0 : ariaLabel.toLowerCase().includes('turn on')) ||
                                (dataTooltip === null || dataTooltip === void 0 ? void 0 : dataTooltip.toLowerCase().includes('turn on'));
                            const shouldClick = (enable && isMuted) || (!enable && !isMuted);
                            if (shouldClick) {
                                yield element.click();
                                console.log(`   ✓ ${controlName} ${enable ? 'activado' : 'desactivado'}`);
                                return;
                            }
                        }
                    }
                }
                catch (error) {
                    // Continuar con el siguiente selector
                    continue;
                }
            }
            console.log(`   ⚠️ No se pudo configurar ${controlName} automáticamente`);
        });
    }
    configureName() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('👤 Configurando nombre...');
                // Selectores para el campo de nombre
                const nameSelectors = [
                    'input[placeholder*="name" i]',
                    'input[placeholder*="nombre" i]',
                    'input[aria-label*="name" i]',
                    'input[aria-label*="nombre" i]',
                    '[jsname="YPqjbf"]', // Selector específico conocido
                    'input[type="text"]'
                ];
                for (const selector of nameSelectors) {
                    try {
                        const nameInput = yield this.page.$(selector);
                        if (nameInput) {
                            // Verificar si el campo está visible y es editable
                            const isVisible = yield nameInput.isVisible();
                            const isEditable = yield nameInput.isEditable();
                            if (isVisible && isEditable) {
                                yield nameInput.click({ clickCount: 3 }); // Seleccionar todo
                                yield nameInput.type(this.config.botName);
                                console.log(`   ✓ Nombre configurado: ${this.config.botName}`);
                                return;
                            }
                        }
                    }
                    catch (error) {
                        continue;
                    }
                }
                console.log('   ⚠️ No se encontró campo de nombre editable');
            }
            catch (error) {
                console.log('   ⚠️ Error configurando nombre:', error.message);
            }
        });
    }
    clickJoinButton() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔘 Buscando botón para unirse...');
            // Selectores modernos para el botón de unirse
            const joinSelectors = [
                'div[role="button"]:has-text("Join now")',
                'div[role="button"]:has-text("Unirse ahora")',
                'button:has-text("Join now")',
                'button:has-text("Unirse ahora")',
                'div[role="button"]:has-text("Ask to join")',
                'div[role="button"]:has-text("Pedir unirse")',
                'button:has-text("Ask to join")',
                'button:has-text("Pedir unirse")',
                '[data-promo-anchor-id="join"]',
                '[jsname="Qx7uuf"]', // Selector específico conocido
                'div[role="button"][aria-label*="join" i]',
                'button[aria-label*="join" i]',
                'div[role="button"][aria-label*="unirse" i]',
                'button[aria-label*="unirse" i]'
            ];
            // Esperar a que aparezca algún botón de unirse
            for (let attempt = 0; attempt < 3; attempt++) {
                for (const selector of joinSelectors) {
                    try {
                        const button = yield this.page.$(selector);
                        if (button) {
                            const isVisible = yield button.isVisible();
                            if (isVisible) {
                                yield button.click();
                                console.log('✅ Botón de unirse presionado');
                                yield this.page.waitForTimeout(2000); // Esperar a que se procese
                                return;
                            }
                        }
                    }
                    catch (error) {
                        // Continuar con el siguiente selector
                        continue;
                    }
                }
                // Si no encontramos nada, esperar un poco más
                console.log(`   ⏳ Intento ${attempt + 1}/3 - Esperando botón de unirse...`);
                yield this.page.waitForTimeout(3000);
            }
            // Si no se encuentra el botón, intentar con Enter o buscar por texto
            console.log('⚠️ No se encontró botón específico, intentando métodos alternativos...');
            try {
                // Método alternativo: buscar por texto
                yield this.page.click('text="Join now"', { timeout: 5000 });
                console.log('✅ Unido usando texto "Join now"');
                return;
            }
            catch (_a) { }
            try {
                yield this.page.click('text="Unirse ahora"', { timeout: 5000 });
                console.log('✅ Unido usando texto "Unirse ahora"');
                return;
            }
            catch (_b) { }
            // Último recurso: Enter
            console.log('⚠️ Intentando con Enter como último recurso...');
            yield this.page.keyboard.press('Enter');
            yield this.page.waitForTimeout(2000);
        });
    }
    waitForJoinConfirmation() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('⏳ Esperando confirmación de unión...');
            try {
                // Selectores modernos para confirmar que estamos en la reunión
                const confirmationSelectors = [
                    'div[role="button"][aria-label*="leave call" i]',
                    'div[role="button"][aria-label*="end call" i]',
                    'div[role="button"][aria-label*="salir" i]',
                    'button[aria-label*="leave call" i]',
                    'button[aria-label*="end call" i]',
                    'button[aria-label*="salir" i]',
                    '[data-tooltip*="leave call" i]',
                    '[data-tooltip*="end call" i]',
                    '[data-tooltip*="salir" i]',
                    '.call-controls',
                    '[data-call-ended="false"]',
                    '[jsname="CQylAd"]', // Selector específico del botón salir
                    'div[role="button"][data-tooltip*="Leave call"]',
                    'div[role="button"][data-tooltip*="Hang up"]'
                ];
                // Esperar con múltiples intentos
                let confirmed = false;
                for (let attempt = 0; attempt < 6; attempt++) { // 6 intentos = 30 segundos
                    for (const selector of confirmationSelectors) {
                        try {
                            const element = yield this.page.$(selector);
                            if (element) {
                                const isVisible = yield element.isVisible();
                                if (isVisible) {
                                    console.log(`✅ Confirmación de unión recibida (selector: ${selector})`);
                                    confirmed = true;
                                    break;
                                }
                            }
                        }
                        catch (error) {
                            // Continuar con el siguiente selector
                            continue;
                        }
                    }
                    if (confirmed)
                        break;
                    // Verificar si estamos en la URL correcta de la reunión
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('meet.google.com') && !currentUrl.includes('preview')) {
                        console.log('✅ Confirmación por URL - estamos en la reunión');
                        confirmed = true;
                        break;
                    }
                    console.log(`   ⏳ Intento ${attempt + 1}/6 - Esperando confirmación...`);
                    yield this.page.waitForTimeout(5000);
                }
                if (!confirmed) {
                    // Verificar si hay mensajes de error específicos
                    const errorMessages = yield this.page.$$eval('text=/meeting.*ended|reunion.*terminada|not.*found|no.*encontrada/i', elements => elements.map(el => el.textContent));
                    if (errorMessages.length > 0) {
                        throw new Error(`Meeting error: ${errorMessages[0]}`);
                    }
                    throw new Error('Could not confirm meeting join - timeout reached');
                }
                // Esperar un poco más para asegurar que la página esté estable
                yield this.page.waitForTimeout(3000);
                console.log('✅ Unión confirmada y página estable');
            }
            catch (error) {
                console.error('❌ No se pudo confirmar la unión a la reunión:', error.message);
                // Información de debug
                const currentUrl = this.page.url();
                console.log(`   Debug - URL actual: ${currentUrl}`);
                // Verificar si la página sigue activa
                try {
                    yield this.page.title();
                }
                catch (pageError) {
                    console.log('   Debug - La página se cerró o no responde');
                }
                throw new Error('Failed to confirm meeting join');
            }
        });
    }
    // Método para verificar si necesita permiso para unirse
    needsPermissionToJoin() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const permissionIndicators = yield this.page.$$([
                    'text="Waiting for the host"',
                    'text="Esperando al anfitrión"',
                    'text="Ask to join"',
                    'text="Pedir unirse"'
                ].join(', '));
                return permissionIndicators.length > 0;
            }
            catch (error) {
                return false;
            }
        });
    }
    // Método para manejar casos donde se necesita permiso
    handlePermissionRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.needsPermissionToJoin()) {
                console.log('🚪 Se requiere permiso para unirse, enviando solicitud...');
                try {
                    const askButton = yield this.page.waitForSelector('button:has-text("Ask to join"), button:has-text("Pedir unirse")', { timeout: 5000 });
                    if (askButton) {
                        yield askButton.click();
                        console.log('📨 Solicitud de unión enviada');
                    }
                }
                catch (error) {
                    console.log('⚠️ No se pudo enviar solicitud de unión automáticamente');
                }
            }
        });
    }
}
exports.GoogleMeetJoinModule = GoogleMeetJoinModule;
