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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperTranscriptionModule = void 0;
const transcription_module_1 = require("./transcription-module");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class WhisperTranscriptionModule extends transcription_module_1.TranscriptionModule {
    constructor(page, config = {}) {
        super(page, config);
        this.audioFilePath = null;
        this.whisperConfig = Object.assign({ apiKey: config.apiKey || process.env.OPENAI_API_KEY || '', model: config.model || 'gpt-4o-transcribe', language: config.language || 'es', temperature: config.temperature || 0, prompt: config.prompt || 'Esta es una reunión de negocios en español. Por favor transcribe con precisión los nombres propios y términos técnicos.' }, config);
        if (!this.whisperConfig.apiKey) {
            throw new Error('OpenAI API key is required for Whisper transcription');
        }
    }
    startTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isActive)
                return;
            console.log('🎤 [WHISPER] Iniciando transcripción con Whisper...');
            try {
                this.isActive = true;
                this.emit('started');
                console.log('✅ [WHISPER] Transcripción iniciada - esperando archivo de audio...');
            }
            catch (error) {
                console.error('❌ [WHISPER] Error iniciando transcripción:', error);
                this.isActive = false;
                throw error;
            }
        });
    }
    stopTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isActive)
                return;
            console.log('⏹️ [WHISPER] Deteniendo transcripción...');
            this.isActive = false;
            this.emit('stopped');
        });
    }
    /**
     * Procesa un archivo de audio usando Whisper API
     */
    transcribeAudioFile(audioFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs_1.default.existsSync(audioFilePath)) {
                throw new Error(`Audio file not found: ${audioFilePath}`);
            }
            console.log(`🎵 [WHISPER] Procesando archivo de audio: ${audioFilePath}`);
            this.audioFilePath = audioFilePath;
            try {
                const transcriptionText = yield this.callWhisperAPI(audioFilePath);
                const transcriptionEntry = {
                    timestamp: new Date(),
                    speaker: 'Whisper Transcription', // Whisper no identifica hablantes por defecto
                    text: transcriptionText,
                    confidence: 0.95 // Whisper generalmente tiene alta confianza
                };
                this.addTranscriptionEntry(transcriptionEntry);
                console.log('✅ [WHISPER] Transcripción completada exitosamente');
                console.log(`📝 [WHISPER] Texto transcrito: ${transcriptionText.substring(0, 100)}...`);
                return [transcriptionEntry];
            }
            catch (error) {
                console.error('❌ [WHISPER] Error en transcripción:', error);
                this.emit('error', error);
                throw error;
            }
        });
    }
    /**
     * Llama a la API de Whisper de OpenAI
     */
    callWhisperAPI(audioFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('🌐 [WHISPER] Enviando audio a OpenAI Whisper API...');
            // Leer el archivo como buffer
            const audioBuffer = yield fs_1.default.promises.readFile(audioFilePath);
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const formData = new FormData();
            formData.append('file', audioBlob, path_1.default.basename(audioFilePath));
            formData.append('model', this.whisperConfig.model || 'gpt-4o-transcribe');
            if (this.whisperConfig.language) {
                formData.append('language', this.whisperConfig.language);
            }
            if (this.whisperConfig.prompt) {
                formData.append('prompt', this.whisperConfig.prompt);
            }
            formData.append('temperature', ((_a = this.whisperConfig.temperature) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
            formData.append('response_format', 'json');
            try {
                const response = yield fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.whisperConfig.apiKey}`
                    },
                    body: formData
                });
                if (!response.ok) {
                    const errorText = yield response.text();
                    throw new Error(`Whisper API error (${response.status}): ${errorText}`);
                }
                const result = yield response.json();
                console.log('✅ [WHISPER] Respuesta recibida de OpenAI');
                return result.text || '';
            }
            catch (error) {
                console.error('❌ [WHISPER] Error llamando a Whisper API:', error);
                throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    /**
     * Procesa transcripción con separación de hablantes básica
     * Nota: Whisper no identifica hablantes nativamente, pero podemos hacer post-procesamiento básico
     */
    processTranscriptionWithSpeakers(text) {
        console.log('👥 [WHISPER] Procesando separación básica de hablantes...');
        // Dividir por pausas largas o cambios de tono (aproximación básica)
        const segments = text.split(/[.!?]\s+/).filter(segment => segment.trim().length > 0);
        const entries = [];
        segments.forEach((segment, index) => {
            const speakerNumber = Math.floor(index / 3) + 1; // Cambiar hablante cada 3 segmentos (aproximación)
            entries.push({
                timestamp: new Date(Date.now() + (index * 5000)), // 5 segundos entre segmentos
                speaker: `Hablante ${speakerNumber}`,
                text: segment.trim(),
                confidence: 0.9
            });
        });
        console.log(`👥 [WHISPER] Creados ${entries.length} segmentos con ${Math.max(...entries.map(e => parseInt(e.speaker.split(' ')[1])))} hablantes aproximados`);
        return entries;
    }
    /**
     * Obtiene información sobre el archivo de audio procesado
     */
    getAudioFileInfo() {
        return {
            path: this.audioFilePath,
            processed: this.audioFilePath !== null && this.transcriptions.length > 0
        };
    }
    /**
     * Limpia el archivo de audio temporal después del procesamiento
     */
    cleanupAudioFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.audioFilePath && fs_1.default.existsSync(this.audioFilePath)) {
                try {
                    yield fs_1.default.promises.unlink(this.audioFilePath);
                    console.log(`🗑️ [WHISPER] Archivo de audio limpiado: ${this.audioFilePath}`);
                    this.audioFilePath = null;
                }
                catch (error) {
                    console.warn(`⚠️ [WHISPER] No se pudo limpiar archivo de audio: ${error}`);
                }
            }
        });
    }
}
exports.WhisperTranscriptionModule = WhisperTranscriptionModule;
