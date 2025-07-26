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
exports.GoogleMeetTranscriptionModule = void 0;
const transcription_module_1 = require("../../modules/transcription-module");
class GoogleMeetTranscriptionModule extends transcription_module_1.TranscriptionModule {
    constructor(page, config = {}) {
        super(page, config);
        this.lastProcessedIndex = 0;
    }
    startTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isActive)
                return;
            console.log('🎤 Iniciando transcripción de Google Meet...');
            try {
                // Activar subtítulos automáticos si están disponibles
                if (this.config.enableLiveCaption) {
                    yield this.enableLiveCaptions();
                }
                this.isActive = true;
                this.startTranscriptionLoop();
                console.log('✅ Transcripción iniciada exitosamente');
                this.emit('started');
            }
            catch (error) {
                console.error('❌ Error iniciando transcripción:', error);
                this.isActive = false;
                throw error;
            }
        });
    }
    stopTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isActive)
                return;
            console.log('⏹️ Deteniendo transcripción...');
            this.isActive = false;
            this.emit('stopped');
        });
    }
    enableLiveCaptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('🔍 Buscando controles de subtítulos...');
                // Buscar el botón de subtítulos con timeout más largo
                const captionButton = yield this.page.waitForSelector('[data-tooltip*="captions" i], [aria-label*="captions" i], [title*="captions" i]', { timeout: 10000 });
                if (captionButton) {
                    const isEnabled = (yield captionButton.getAttribute('data-is-muted')) === 'false';
                    if (!isEnabled) {
                        yield captionButton.click();
                        console.log('✅ Subtítulos activados');
                    }
                    else {
                        console.log('ℹ️ Subtítulos ya están activados');
                    }
                }
            }
            catch (error) {
                // Esto es normal si no hay conversación activa aún
                console.log('ℹ️ Subtítulos no disponibles por el momento (normal si no hay conversación activa)');
                console.log('   El bot los activará automáticamente cuando detecte audio');
            }
        });
    }
    startTranscriptionLoop() {
        const processTranscriptions = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.isActive)
                return;
            try {
                yield this.processNewTranscriptions();
            }
            catch (error) {
                console.error('Error procesando transcripciones:', error);
                this.emit('error', error);
            }
            // Continuar el loop si sigue activo
            if (this.isActive) {
                setTimeout(processTranscriptions, this.config.interval);
            }
        });
        processTranscriptions();
    }
    processNewTranscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            // Buscar elementos de transcripción en Google Meet
            const captionElements = yield this.page.$$eval('[data-caption-node], .captions-text, [jsname="tgaKEf"]', (elements) => {
                return elements.map((el, index) => {
                    var _a;
                    return ({
                        index,
                        text: ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                        timestamp: new Date().toISOString()
                    });
                });
            });
            // Procesar solo nuevos elementos
            const newElements = captionElements.slice(this.lastProcessedIndex);
            this.lastProcessedIndex = captionElements.length;
            for (const element of newElements) {
                if (element.text && element.text.length > 0) {
                    const entry = {
                        timestamp: new Date(),
                        speaker: this.detectSpeaker(element.text),
                        text: element.text,
                        confidence: 0.8 // Valor por defecto para Google Meet
                    };
                    this.addTranscriptionEntry(entry);
                    console.log(`📝 [${entry.speaker}]: ${entry.text}`);
                }
            }
        });
    }
    detectSpeaker(text) {
        // Lógica básica para detectar el hablante
        // Google Meet a veces incluye el nombre del hablante al principio
        const speakerMatch = text.match(/^([^:]+):\s*/);
        if (speakerMatch) {
            return speakerMatch[1].trim();
        }
        // Si no se puede detectar, usar un identificador genérico
        return 'Participante';
    }
    // Método específico para obtener transcripciones de Google Meet API si está disponible
    getGoogleMeetTranscriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Intentar obtener transcripciones usando la API interna de Google Meet
                const transcriptions = yield this.page.evaluate(() => {
                    // Esto es experimental y puede cambiar
                    const meetData = window.__meet_data__;
                    return (meetData === null || meetData === void 0 ? void 0 : meetData.transcriptions) || [];
                });
                return transcriptions.map((t) => ({
                    timestamp: new Date(t.timestamp),
                    speaker: t.speaker || 'Participante',
                    text: t.text,
                    confidence: t.confidence || 0.8
                }));
            }
            catch (error) {
                console.log('⚠️ No se pudo acceder a transcripciones nativas de Google Meet');
                return [];
            }
        });
    }
}
exports.GoogleMeetTranscriptionModule = GoogleMeetTranscriptionModule;
