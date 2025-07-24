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
            console.log('🔗 Navegando a Google Meet...');
            try {
                // Validar URL antes de navegar
                if (!this.isValidMeetUrl(this.config.meetingUrl)) {
                    throw new Error(`URL de meeting inválida: ${this.config.meetingUrl}`);
                }
                console.log(`📍 Accediendo a: ${this.config.meetingUrl}`);
                // Navegación exacta como Vexa
                yield this.page.goto(this.config.meetingUrl, {
                    waitUntil: 'networkidle'
                });
                yield this.page.bringToFront();
                // Espera crítica de Vexa - permite que los elementos se estabilicen
                console.log('⏳ Esperando que los elementos de la página se estabilicen...');
                yield this.page.waitForTimeout(5000); // 5 segundos fijos
                // Ejecutar la lógica de unión de Vexa
                yield this.joinMeetingVexa();
                // Esperar admisión a la reunión
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
    joinMeetingVexa() {
        return __awaiter(this, void 0, void 0, function* () {
            // Selectores exactos de Vexa que están probados y funcionan
            const enterNameField = 'input[type="text"][aria-label="Your name"]';
            const joinButton = '//button[.//span[text()="Ask to join"]]';
            const muteButton = '[aria-label*="Turn off microphone"]';
            const cameraOffButton = '[aria-label*="Turn off camera"]';
            // Enter name and join - implementación exacta de Vexa
            yield this.page.waitForTimeout(this.randomDelay(1000));
            console.log('🔍 Intentando encontrar campo de entrada de nombre...');
            // Timeout extendido crítico - Vexa usa 120 segundos
            yield this.page.waitForSelector(enterNameField, { timeout: 120000 });
            console.log('✅ Campo de entrada de nombre encontrado.');
            yield this.page.waitForTimeout(this.randomDelay(1000));
            yield this.page.fill(enterNameField, this.config.botName);
            // Mutear micrófono y cámara si están disponibles - exactamente como Vexa
            try {
                yield this.page.waitForTimeout(this.randomDelay(500));
                yield this.page.click(muteButton, { timeout: 200 });
                yield this.page.waitForTimeout(200);
            }
            catch (e) {
                console.log('🎤 Micrófono ya muteado o no encontrado.');
            }
            try {
                yield this.page.waitForTimeout(this.randomDelay(500));
                yield this.page.click(cameraOffButton, { timeout: 200 });
                yield this.page.waitForTimeout(200);
            }
            catch (e) {
                console.log('📹 Cámara ya desactivada o no encontrada.');
            }
            // Hacer clic en el botón de unirse usando XPath como Vexa
            yield this.page.waitForSelector(joinButton, { timeout: 60000 });
            yield this.page.click(joinButton);
            console.log(`🚀 ${this.config.botName} se unió a la reunión.`);
        });
    }
    // Función de espera de admisión de Vexa
    waitForMeetingAdmission() {
        return __awaiter(this, void 0, void 0, function* () {
            const leaveButton = `//button[@aria-label="Leave call"]`;
            try {
                // Vexa espera hasta 5 minutos para ser admitido
                yield this.page.waitForSelector(leaveButton, { timeout: 300000 });
                console.log('✅ Admitido exitosamente en la reunión');
                return true;
            }
            catch (_a) {
                throw new Error('Bot no fue admitido en la reunión dentro del tiempo límite');
            }
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
                const leaveButton = yield this.page.$(`//button[@aria-label="Leave call"]`);
                return leaveButton !== null;
            }
            catch (_a) {
                return false;
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
