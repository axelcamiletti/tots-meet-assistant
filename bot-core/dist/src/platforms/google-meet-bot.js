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
const base_bot_1 = require("../core/base-bot");
const join_1 = require("./google-meet/join");
const whisper_transcription_module_1 = require("../modules/whisper-transcription-module");
const recording_1 = require("./google-meet/recording");
const monitoring_1 = require("./google-meet/monitoring");
class GoogleMeetBot extends base_bot_1.BaseBot {
    constructor(config) {
        super(config);
        this.joinModule = null;
        this.transcriptionModule = null;
        this.recordingModule = null;
        this.monitoringModule = null;
    }
    joinMeeting() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                throw new Error('Page no inicializada');
            console.log('🔗 Iniciando proceso de unión a Google Meet...');
            // Crear módulo de unión
            this.joinModule = new join_1.GoogleMeetJoinModule(this.page, this.config);
            try {
                // Unirse a la reunión
                yield this.joinModule.joinMeeting();
                // Actualizar estado de la sesión
                this.sessionManager.updateSessionStatus('joined');
                // Inicializar módulos adicionales
                yield this.initializeModules();
                // Mantener la sesión activa
                this.startSessionKeepAlive();
                console.log('✅ Google Meet Bot unido exitosamente');
                this.emit('joined');
            }
            catch (error) {
                this.sessionManager.updateSessionStatus('error');
                console.error('❌ Error uniéndose a Google Meet:', error);
                this.emit('joinError', error);
                throw error;
            }
        });
    }
    initializeModules() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            console.log('🔧 Inicializando módulos del bot...');
            // Inicializar grabación y transcripción con Whisper
            yield this.initializeRecordingAndTranscription();
            // Inicializar monitoreo
            yield this.initializeMonitoring();
            console.log('✅ Módulos inicializados');
        });
    }
    initializeRecordingAndTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            try {
                console.log('� Inicializando grabación y transcripción con Whisper...');
                // Inicializar módulo de grabación
                this.recordingModule = new recording_1.GoogleMeetRecordingModule(this.page, {
                    enableVideo: true,
                    enableAudio: true,
                    quality: 'medium',
                    format: 'mp4'
                });
                // Inicializar módulo de transcripción Whisper
                this.transcriptionModule = new whisper_transcription_module_1.WhisperTranscriptionModule(this.page, {
                    apiKey: process.env.OPENAI_API_KEY || '',
                    model: 'gpt-4o-transcribe',
                    language: 'es',
                    prompt: 'Esta es una reunión de negocios en español. Por favor transcribe con precisión los nombres propios y términos técnicos.'
                });
                // Configurar eventos de grabación
                this.recordingModule.on('recordingStarted', (info) => {
                    console.log('🎬 Grabación iniciada:', info);
                    this.emit('recordingStarted', info);
                });
                this.recordingModule.on('recordingStopped', (info) => {
                    console.log('⏹️ Grabación detenida:', info);
                    this.emit('recordingStopped', info);
                });
                this.recordingModule.on('recordingCompleted', (result) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    console.log('✅ Grabación completada:', result);
                    // Procesar audio con Whisper si existe
                    if (result.audioPath && result.success) {
                        try {
                            console.log('🎵 Procesando audio con Whisper...');
                            yield ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.transcribeAudioFile(result.audioPath));
                            // Cleanup del archivo de audio después del procesamiento
                            yield ((_b = this.transcriptionModule) === null || _b === void 0 ? void 0 : _b.cleanupAudioFile());
                            this.emit('transcriptionCompleted', (_c = this.transcriptionModule) === null || _c === void 0 ? void 0 : _c.getTranscriptions());
                        }
                        catch (error) {
                            console.error('❌ Error procesando audio con Whisper:', error);
                            this.emit('transcriptionError', error);
                        }
                    }
                    this.emit('recordingCompleted', result);
                }));
                // Configurar eventos de transcripción
                this.transcriptionModule.on('transcriptionAdded', (entry) => {
                    this.sessionManager.addTranscriptionEntry(entry);
                    this.emit('transcriptionUpdate', entry);
                });
                this.transcriptionModule.on('error', (error) => {
                    console.error('Error en transcripción Whisper:', error);
                    this.emit('transcriptionError', error);
                });
                // Iniciar grabación automáticamente
                yield this.recordingModule.startRecording();
                yield this.transcriptionModule.startTranscription();
                this.sessionManager.updateSessionStatus('recording');
                console.log('✅ Grabación y transcripción iniciadas');
            }
            catch (error) {
                console.error('❌ Error inicializando grabación y transcripción:', error);
                // No lanzar error para que el bot pueda continuar
            }
        });
    }
    initializeMonitoring() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            try {
                console.log('👁️ Inicializando módulo de monitoreo...');
                this.monitoringModule = new monitoring_1.GoogleMeetMonitoringModule(this.page, {
                    participantCheckInterval: 30000,
                    meetingStatusCheckInterval: 30000
                });
                // Configurar eventos
                this.monitoringModule.on('participantsUpdated', (participants) => {
                    this.sessionManager.updateParticipants(participants);
                    this.emit('participantsUpdate', participants);
                });
                this.monitoringModule.on('meetingEnded', () => {
                    console.log('📞 Reunión terminada detectada por monitoreo');
                    this.endSession();
                });
                this.monitoringModule.on('error', (error) => {
                    console.error('Error en monitoreo:', error.error);
                    this.emit('monitoringError', error);
                });
                // Iniciar monitoreo
                this.monitoringModule.startMonitoring();
                console.log('✅ Módulo de monitoreo iniciado');
            }
            catch (error) {
                console.error('❌ Error inicializando monitoreo:', error);
            }
        });
    }
    // Métodos públicos para grabación y transcripción
    toggleRecording(enable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.recordingModule) {
                console.log('⚠️ Módulo de grabación no inicializado');
                return;
            }
            if (enable && !this.recordingModule.isRecordingActive()) {
                yield this.recordingModule.startRecording();
                this.sessionManager.updateSessionStatus('recording');
                console.log('✅ Grabación habilitada');
            }
            else if (!enable && this.recordingModule.isRecordingActive()) {
                const result = yield this.recordingModule.stopRecording();
                this.sessionManager.updateSessionStatus('joined');
                // Procesar audio con Whisper automáticamente
                if (result.audioPath && result.success && this.transcriptionModule) {
                    try {
                        yield this.transcriptionModule.transcribeAudioFile(result.audioPath);
                        console.log('✅ Audio procesado con Whisper');
                    }
                    catch (error) {
                        console.error('❌ Error procesando audio:', error);
                    }
                }
                console.log('⏸️ Grabación detenida');
            }
        });
    }
    toggleTranscription(enable) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('ℹ️ Transcripción está integrada con grabación. Use toggleRecording() en su lugar.');
        });
    }
    getTranscriptions() {
        var _a;
        return ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.getTranscriptions()) || [];
    }
    getTranscriptionStats() {
        var _a;
        return ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.getStats()) || null;
    }
    getTranscriptionSummary() {
        var _a;
        return ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.getTranscriptionSummary()) || null;
    }
    exportTranscriptionToText() {
        var _a;
        return ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.exportToText()) || 'No hay transcripciones disponibles';
    }
    exportTranscriptionToJSON() {
        var _a;
        return ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.exportToJSON()) || '[]';
    }
    // Métodos para el módulo de grabación
    getRecordingStats() {
        var _a;
        return ((_a = this.recordingModule) === null || _a === void 0 ? void 0 : _a.getRecordingStats()) || null;
    }
    isRecordingActive() {
        var _a;
        return ((_a = this.recordingModule) === null || _a === void 0 ? void 0 : _a.isRecordingActive()) || false;
    }
    getRecordingDirectory() {
        var _a;
        return ((_a = this.recordingModule) === null || _a === void 0 ? void 0 : _a.getRecordingDirectory()) || '';
    }
    // Métodos públicos para monitoreo
    getParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.monitoringModule) === null || _a === void 0 ? void 0 : _a.getParticipants()) || [];
        });
    }
    isMeetingActive() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.monitoringModule) === null || _a === void 0 ? void 0 : _a.isMeetingActive()) || false;
        });
    }
    getMeetingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.monitoringModule) === null || _a === void 0 ? void 0 : _a.getMeetingInfo()) || null;
        });
    }
    getNetworkQuality() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return ((_a = this.monitoringModule) === null || _a === void 0 ? void 0 : _a.getNetworkQuality()) || 'unknown';
        });
    }
    // Mantener la sesión activa
    startSessionKeepAlive() {
        if (!this.page)
            return;
        console.log('🔄 Iniciando keep-alive para mantener la sesión activa...');
        // Verificar cada 30 segundos que la página sigue activa
        const keepAliveInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isActive() || !this.page) {
                    clearInterval(keepAliveInterval);
                    return;
                }
                // Verificar que la página no se haya cerrado
                const isConnected = yield this.page.evaluate(() => {
                    return document.readyState === 'complete' && !document.hidden;
                });
                if (!isConnected) {
                    console.log('⚠️ Página desconectada, intentando reconectar...');
                    clearInterval(keepAliveInterval);
                    this.emit('connectionLost');
                    return;
                }
                // Verificar que estamos en la reunión
                const currentUrl = this.page.url();
                if (!currentUrl.includes('meet.google.com')) {
                    console.log('⚠️ Ya no estamos en Google Meet');
                    clearInterval(keepAliveInterval);
                    this.emit('leftMeeting');
                    return;
                }
                // Pequeña actividad para mantener la sesión viva
                yield this.page.evaluate(() => {
                    // Mover un poco el mouse virtualmente
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        clientX: Math.random() * 10,
                        clientY: Math.random() * 10
                    }));
                });
            }
            catch (error) {
                console.log('⚠️ Error en keep-alive:', error);
            }
        }), 30000); // Cada 30 segundos
        console.log('✅ Keep-alive iniciado');
    }
    // Cleanup mejorado
    cleanup() {
        const _super = Object.create(null, {
            cleanup: { get: () => super.cleanup }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🧹 Limpiando recursos de Google Meet Bot...');
            try {
                // Detener grabación si está activa
                if (this.recordingModule && this.recordingModule.isRecordingActive()) {
                    yield this.recordingModule.stopRecording();
                    console.log('✅ Grabación detenida');
                }
                // Detener monitoreo
                if (this.monitoringModule && this.monitoringModule.isMonitoringActive()) {
                    this.monitoringModule.stopMonitoring();
                    console.log('✅ Monitoreo detenido');
                }
                // Cleanup de módulos
                // Los módulos se limpian automáticamente al detener sus procesos
                // Cleanup del bot base
                yield _super.cleanup.call(this);
            }
            catch (error) {
                console.error('Error en cleanup de Google Meet Bot:', error);
            }
        });
    }
    // Información completa del estado del bot
    getDetailedStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const baseStatus = yield this.getStatus();
            return Object.assign(Object.assign({}, baseStatus), { modules: {
                    recording: {
                        active: ((_a = this.recordingModule) === null || _a === void 0 ? void 0 : _a.isRecordingActive()) || false,
                        stats: ((_b = this.recordingModule) === null || _b === void 0 ? void 0 : _b.getRecordingStats()) || null,
                        directory: ((_c = this.recordingModule) === null || _c === void 0 ? void 0 : _c.getRecordingDirectory()) || null
                    },
                    transcription: {
                        active: false, // Whisper procesa post-reunión
                        stats: ((_d = this.transcriptionModule) === null || _d === void 0 ? void 0 : _d.getStats()) || null
                    },
                    monitoring: {
                        active: ((_e = this.monitoringModule) === null || _e === void 0 ? void 0 : _e.isMonitoringActive()) || false,
                        stats: ((_f = this.monitoringModule) === null || _f === void 0 ? void 0 : _f.getMonitoringStats()) || null
                    }
                }, meetingInfo: yield this.getMeetingInfo(), networkQuality: yield this.getNetworkQuality() });
        });
    }
}
exports.GoogleMeetBot = GoogleMeetBot;
