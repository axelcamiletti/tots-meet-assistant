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
exports.GoogleMeetBot = void 0;
class GoogleMeetBot {
    constructor(page, config) {
        this.page = page;
        this.config = config;
    }
    isValidMeetUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'meet.google.com' && urlObj.pathname.length > 1;
        }
        catch (_a) {
            return false;
        }
    }
    randomDelay(baseMs) {
        return baseMs + Math.random() * 1000;
    }
    // Implementación exacta basada en Vexa.ai que funciona
    join() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔗 [DEBUG] Navegando a Google Meet...');
            try {
                // Validar URL antes de navegar
                console.log('🔍 [DEBUG] Validando URL...');
                if (!this.isValidMeetUrl(this.config.meetingUrl)) {
                    throw new Error(`URL de meeting inválida: ${this.config.meetingUrl}`);
                }
                console.log('✅ [DEBUG] URL válida');
                console.log(`📍 [DEBUG] Accediendo a: ${this.config.meetingUrl}`);
                // Verificar estado de la página antes de navegar
                console.log('🔍 [DEBUG] Verificando estado de la página...');
                console.log(`📊 [DEBUG] Página cerrada: ${this.page.isClosed()}`);
                console.log(`🌐 [DEBUG] URL actual: ${this.page.url()}`);
                // Navegación exacta como Vexa
                console.log('🚀 [DEBUG] Iniciando navegación...');
                const response = yield this.page.goto(this.config.meetingUrl, {
                    waitUntil: 'networkidle',
                    timeout: 60000 // Timeout más corto para debugging
                });
                console.log(`📡 [DEBUG] Respuesta HTTP: ${response === null || response === void 0 ? void 0 : response.status()}`);
                console.log(`🌐 [DEBUG] URL después de navegación: ${this.page.url()}`);
                yield this.page.bringToFront();
                console.log('👁️ [DEBUG] Página traída al frente');
                // Tomar screenshot para debug
                yield this.page.screenshot({ path: 'debug-after-navigation.png' });
                console.log('📸 [DEBUG] Screenshot guardado: debug-after-navigation.png');
                // Espera crítica de Vexa - permite que los elementos se estabilicen
                console.log('⏳ [DEBUG] Esperando que los elementos de la página se estabilicen...');
                yield this.page.waitForTimeout(5000); // 5 segundos fijos
                console.log('✅ [DEBUG] Página estabilizada');
                // Verificar si la página sigue abierta
                console.log(`📊 [DEBUG] Página cerrada después de espera: ${this.page.isClosed()}`);
                // Ejecutar la lógica de unión de Tots
                console.log('🔧 [DEBUG] Iniciando lógica de unión...');
                yield this.joinMeetingTots();
                // Esperar admisión a la reunión
                console.log('⏳ [DEBUG] Esperando admisión...');
                yield this.waitForMeetingAdmission();
                console.log('✅ Bot se unió exitosamente a la reunión');
            }
            catch (error) {
                console.error('❌ Error uniéndose a Google Meet:', error);
                throw error;
            }
        });
    }
    // Implementación exacta de joinMeeting de Vexa.ai
    joinMeetingTots() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔧 [DEBUG] Iniciando joinMeetingTots...');
            // Verificar estado de la página al inicio
            console.log(`📊 [DEBUG] Página cerrada al inicio de joinMeetingTots: ${this.page.isClosed()}`);
            // Selectores que funcionan en inglés y español
            const enterNameField = 'input[type="text"][aria-label*="name"], input[type="text"][aria-label*="nombre"]';
            const joinButton = '//button[.//span[contains(text(),"Ask to join") or contains(text(),"Solicitar unirse") or contains(text(),"Pedir unirse")]]';
            const muteButton = '[aria-label*="Turn off microphone"], [aria-label*="Desactivar micrófono"]';
            const cameraOffButton = '[aria-label*="Turn off camera"], [aria-label*="Desactivar cámara"]';
            console.log('📝 [DEBUG] Selectores definidos');
            // Enter name and join - implementación exacta de Vexa
            const delay = this.randomDelay(1000);
            console.log(`⏰ [DEBUG] Esperando ${delay}ms antes de buscar campo de nombre...`);
            yield this.page.waitForTimeout(delay);
            console.log('🔍 [DEBUG] Intentando encontrar campo de entrada de nombre...');
            console.log(`🎯 [DEBUG] Selector usado: ${enterNameField}`);
            // Verificar estado antes de waitForSelector
            console.log(`📊 [DEBUG] Página cerrada antes de waitForSelector: ${this.page.isClosed()}`);
            try {
                // Timeout extendido crítico - Vexa usa 120 segundos
                console.log('⏳ [DEBUG] Iniciando waitForSelector con timeout de 120 segundos...');
                yield this.page.waitForSelector(enterNameField, { timeout: 120000 });
                console.log('✅ [DEBUG] Campo de entrada de nombre encontrado.');
            }
            catch (error) {
                console.error(`❌ [DEBUG] Error en waitForSelector: ${error}`);
                // Tomar screenshot para debug
                try {
                    yield this.page.screenshot({ path: 'debug-selector-error.png' });
                    console.log('📸 [DEBUG] Screenshot de error guardado: debug-selector-error.png');
                }
                catch (screenshotError) {
                    console.error(`❌ [DEBUG] Error tomando screenshot: ${screenshotError}`);
                }
                // Buscar todos los inputs disponibles para debug
                try {
                    const allInputs = yield this.page.$$('input');
                    console.log(`🔍 [DEBUG] Encontrados ${allInputs.length} elementos input en la página`);
                    for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
                        const input = allInputs[i];
                        const type = yield input.getAttribute('type');
                        const ariaLabel = yield input.getAttribute('aria-label');
                        const placeholder = yield input.getAttribute('placeholder');
                        console.log(`📝 [DEBUG] Input ${i + 1}: type="${type}", aria-label="${ariaLabel}", placeholder="${placeholder}"`);
                    }
                }
                catch (inputError) {
                    console.error(`❌ [DEBUG] Error listando inputs: ${inputError}`);
                }
                throw error;
            }
            console.log(`📊 [DEBUG] Página cerrada después de encontrar campo: ${this.page.isClosed()}`);
            const delay2 = this.randomDelay(1000);
            console.log(`⏰ [DEBUG] Esperando ${delay2}ms antes de llenar campo...`);
            yield this.page.waitForTimeout(delay2);
            console.log(`✍️ [DEBUG] Llenando campo con nombre: "${this.config.botName}"`);
            yield this.page.fill(enterNameField, this.config.botName);
            console.log('✅ [DEBUG] Campo de nombre llenado');
            // Mutear micrófono y cámara si están disponibles - exactamente como Vexa
            console.log('🎤 [DEBUG] Intentando mutear micrófono...');
            try {
                yield this.page.waitForTimeout(this.randomDelay(500));
                yield this.page.click(muteButton, { timeout: 200 });
                yield this.page.waitForTimeout(200);
                console.log('✅ [DEBUG] Micrófono muteado');
            }
            catch (e) {
                console.log('🎤 [DEBUG] Micrófono ya muteado o no encontrado.');
            }
            console.log('📹 [DEBUG] Intentando desactivar cámara...');
            try {
                yield this.page.waitForTimeout(this.randomDelay(500));
                yield this.page.click(cameraOffButton, { timeout: 200 });
                yield this.page.waitForTimeout(200);
                console.log('✅ [DEBUG] Cámara desactivada');
            }
            catch (e) {
                console.log('📹 [DEBUG] Cámara ya desactivada o no encontrada.');
            }
            // Hacer clic en el botón de unirse usando XPath como Vexa
            console.log('🚪 [DEBUG] Buscando botón de unirse...');
            console.log(`🎯 [DEBUG] Selector XPath usado: ${joinButton}`);
            try {
                yield this.page.waitForSelector(joinButton, { timeout: 60000 });
                console.log('✅ [DEBUG] Botón de unirse encontrado');
                yield this.page.click(joinButton);
                console.log(`🚀 [DEBUG] Clic en botón de unirse ejecutado - ${this.config.botName} intentando unirse...`);
                // Esperar un momento después del clic y verificar estado
                yield this.page.waitForTimeout(3000);
                console.log(`📊 [DEBUG] Estado de página después del clic de unirse: cerrada=${this.page.isClosed()}`);
                console.log(`🌐 [DEBUG] URL después del clic de unirse: ${this.page.url()}`);
                // Tomar screenshot después del clic para ver qué pasó
                try {
                    yield this.page.screenshot({ path: 'debug-after-join-click.png' });
                    console.log('📸 [DEBUG] Screenshot después del clic guardado: debug-after-join-click.png');
                }
                catch (screenshotError) {
                    console.error(`❌ [DEBUG] Error tomando screenshot después del clic: ${screenshotError}`);
                }
            }
            catch (error) {
                console.error(`❌ [DEBUG] Error con botón de unirse: ${error}`);
                // Buscar botones alternativos
                try {
                    const allButtons = yield this.page.$$('button');
                    console.log(`🔍 [DEBUG] Encontrados ${allButtons.length} botones en la página`);
                    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                        const button = allButtons[i];
                        const text = yield button.textContent();
                        const ariaLabel = yield button.getAttribute('aria-label');
                        console.log(`🔘 [DEBUG] Botón ${i + 1}: text="${text === null || text === void 0 ? void 0 : text.trim()}", aria-label="${ariaLabel}"`);
                    }
                }
                catch (buttonError) {
                    console.error(`❌ [DEBUG] Error listando botones: ${buttonError}`);
                }
                throw error;
            }
        });
    }
    // Función de espera de admisión de Vexa
    waitForMeetingAdmission() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('⏳ [DEBUG] Iniciando espera de admisión...');
            const leaveButton = `button[aria-label="Leave call"]`;
            console.log(`🎯 [DEBUG] Buscando botón de salir: ${leaveButton}`);
            // Verificar estado de la página
            console.log(`📊 [DEBUG] Página cerrada al inicio de waitForMeetingAdmission: ${this.page.isClosed()}`);
            // Búsqueda activa en loop en lugar de waitForSelector pasivo
            const maxAttempts = 300; // 5 minutos (300 intentos de 1 segundo cada uno)
            console.log(`⏰ [DEBUG] Iniciando búsqueda activa por ${maxAttempts} segundos...`);
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`🔍 [DEBUG] Intento ${attempt}/${maxAttempts} - Buscando botón Leave call...`);
                    // Verificar si la página sigue abierta
                    if (this.page.isClosed()) {
                        console.error('❌ [DEBUG] La página se cerró durante la búsqueda');
                        throw new Error('Página cerrada durante búsqueda de admisión');
                    }
                    // Buscar el botón con múltiples selectores
                    const leaveButtonElement = yield this.page.$(`button[aria-label="Leave call"]`);
                    if (leaveButtonElement) {
                        console.log('✅ [DEBUG] ¡Botón de salir encontrado! - Admitido exitosamente en la reunión');
                        return true;
                    }
                    // También buscar por el texto del icono
                    const leaveByIcon = yield this.page.$(`button:has(i[aria-hidden="true"]:text("call_end"))`);
                    if (leaveByIcon) {
                        console.log('✅ [DEBUG] ¡Botón de salir encontrado por icono! - Admitido exitosamente en la reunión');
                        return true;
                    }
                    // Buscar por jsname específico del HTML que proporcionaste
                    const leaveByJsname = yield this.page.$(`button[jsname="CQylAd"]`);
                    if (leaveByJsname) {
                        console.log('✅ [DEBUG] ¡Botón de salir encontrado por jsname! - Admitido exitosamente en la reunión');
                        return true;
                    }
                    // También buscar botones alternativos con "Leave"
                    const leaveButtonAlt = yield this.page.$(`button[aria-label*="Leave"]`);
                    if (leaveButtonAlt) {
                        const ariaLabel = yield leaveButtonAlt.getAttribute('aria-label');
                        console.log(`✅ [DEBUG] ¡Botón de salir alternativo encontrado! aria-label: "${ariaLabel}"`);
                        return true;
                    }
                    // Debug: mostrar todos los botones cada 30 intentos
                    if (attempt % 30 === 0) {
                        console.log(`🔍 [DEBUG] Intento ${attempt} - Listando todos los botones disponibles:`);
                        try {
                            const allButtons = yield this.page.$$('button');
                            console.log(`📊 [DEBUG] Total de botones encontrados: ${allButtons.length}`);
                            for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
                                const button = allButtons[i];
                                const text = yield button.textContent();
                                const ariaLabel = yield button.getAttribute('aria-label');
                                const isVisible = yield button.isVisible();
                                console.log(`🔘 [DEBUG] Botón ${i + 1}: text="${text === null || text === void 0 ? void 0 : text.trim()}", aria-label="${ariaLabel}", visible=${isVisible}`);
                            }
                        }
                        catch (debugError) {
                            console.error(`❌ [DEBUG] Error listando botones: ${debugError}`);
                        }
                    }
                    // Esperar 1 segundo antes del siguiente intento
                    yield this.page.waitForTimeout(1000);
                }
                catch (searchError) {
                    console.error(`❌ [DEBUG] Error en intento ${attempt}: ${searchError}`);
                    if (attempt >= maxAttempts) {
                        throw searchError;
                    }
                    // Esperar un poco más en caso de error
                    yield this.page.waitForTimeout(2000);
                }
            }
            // Si llegamos aquí, no se encontró el botón después de todos los intentos
            console.error(`❌ [DEBUG] No se encontró el botón Leave call después de ${maxAttempts} intentos`);
            // Tomar screenshot final para debug
            try {
                yield this.page.screenshot({ path: 'debug-admission-failed.png' });
                console.log('📸 [DEBUG] Screenshot de fallo de admisión guardado: debug-admission-failed.png');
            }
            catch (screenshotError) {
                console.error(`❌ [DEBUG] Error tomando screenshot final: ${screenshotError}`);
            }
            // Buscar indicadores de sala de espera o errores
            try {
                const waitingRoom = yield this.page.$('text="Waiting for the meeting host"');
                if (waitingRoom) {
                    console.log('⏰ [DEBUG] El bot está en sala de espera');
                }
                const errorMessages = yield this.page.$$('text="can\'t join this video call"');
                if (errorMessages.length > 0) {
                    console.log('❌ [DEBUG] Mensaje de error detectado: No se puede unir a la videollamada');
                }
                const currentUrl = this.page.url();
                console.log(`🌐 [DEBUG] URL actual durante error de admisión: ${currentUrl}`);
            }
            catch (debugError) {
                console.error(`❌ [DEBUG] Error en debugging de admisión: ${debugError}`);
            }
            throw new Error('Bot no fue admitido en la reunión dentro del tiempo límite');
        });
    }
    // Métodos adicionales para compatibilidad
    getParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const participantElements = yield this.page.$$('div[data-participant-id]');
                const participants = [];
                for (const element of participantElements) {
                    const nameElement = yield element.$('.notranslate');
                    if (nameElement) {
                        const name = yield nameElement.textContent();
                        if (name && name.trim()) {
                            participants.push(name.trim());
                        }
                    }
                }
                return participants;
            }
            catch (error) {
                console.log(`Error obteniendo participantes: ${error}`);
                return [];
            }
        });
    }
    isMeetingActive() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 [MEETING] Verificando si la reunión está activa...');
                // Verificar si la página sigue abierta
                if (this.page.isClosed()) {
                    console.log('❌ [MEETING] Página cerrada - reunión terminada');
                    return false;
                }
                // Verificar múltiples indicadores de que la reunión está activa
                const activeIndicators = [
                    '//button[@aria-label="Leave call"]',
                    '//button[@aria-label="Salir de la llamada"]',
                    '[aria-label="Leave call"]',
                    '[aria-label="Salir de la llamada"]',
                    '[data-tooltip="Leave call"]',
                    '[data-tooltip="Salir de la llamada"]'
                ];
                for (const selector of activeIndicators) {
                    try {
                        const element = yield this.page.$(selector);
                        if (element) {
                            console.log(`✅ [MEETING] Reunión activa - indicador encontrado: ${selector}`);
                            return true;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                // Si no encontramos indicadores, verificar si estamos en una página de error o redirección
                const currentUrl = this.page.url();
                console.log(`🌐 [MEETING] URL actual: ${currentUrl}`);
                if (!currentUrl.includes('meet.google.com')) {
                    console.log('❌ [MEETING] No estamos en Google Meet - reunión terminada');
                    return false;
                }
                // Verificar si hay mensajes de error o reunión terminada
                const errorSelectors = [
                    'text="The meeting has ended"',
                    'text="La reunión ha terminado"',
                    'text="You left the meeting"',
                    'text="Saliste de la reunión"',
                    '[role="dialog"]:has-text("ended")',
                    '[role="dialog"]:has-text("terminado")'
                ];
                for (const selector of errorSelectors) {
                    try {
                        const errorElement = yield this.page.$(selector);
                        if (errorElement) {
                            console.log(`❌ [MEETING] Reunión terminada - mensaje encontrado: ${selector}`);
                            return false;
                        }
                    }
                    catch (e) {
                        continue;
                    }
                }
                console.log('⚠️ [MEETING] No se pudo determinar el estado de la reunión - asumiendo activa');
                return true; // Ser conservador y asumir que está activa si no podemos determinar
            }
            catch (error) {
                console.log(`⚠️ [MEETING] Error verificando estado de reunión: ${error}`);
                return true; // Ser conservador en caso de error
            }
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚪 Saliendo de la reunión...');
            try {
                const leaveButton = `//button[@aria-label="Leave call"]`;
                const leaveButtonElement = yield this.page.$(leaveButton);
                if (leaveButtonElement) {
                    yield leaveButtonElement.click();
                    console.log('✅ Botón de salir clickeado');
                    // Esperar por posible botón de confirmación
                    yield this.page.waitForTimeout(1000);
                    const confirmButton = yield this.page.$('//button[.//span[text()="Leave meeting"]] | //button[.//span[text()="Just leave the meeting"]]');
                    if (confirmButton) {
                        yield confirmButton.click();
                        console.log('✅ Confirmación de salida clickeada');
                    }
                    console.log('✅ Bot salió de la reunión exitosamente');
                }
                else {
                    console.log('⚠️ Botón de salir no encontrado');
                }
            }
            catch (error) {
                console.error(`❌ Error saliendo de la reunión: ${error}`);
                throw error;
            }
        });
    }
}
exports.GoogleMeetBot = GoogleMeetBot;
