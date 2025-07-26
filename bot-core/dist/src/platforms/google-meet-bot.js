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
const transcription_1 = require("./google-meet/transcription");
const monitoring_1 = require("./google-meet/monitoring");
class GoogleMeetBot extends base_bot_1.BaseBot {
    constructor(config) {
        super(config);
        this.joinModule = null;
        this.transcriptionModule = null;
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
            // Inicializar transcripción
            yield this.initializeTranscription();
            // Inicializar monitoreo
            yield this.initializeMonitoring();
            console.log('✅ Módulos inicializados');
        });
    }
    initializeTranscription() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            try {
                console.log('🎤 Inicializando módulo de transcripción...');
                this.transcriptionModule = new transcription_1.GoogleMeetTranscriptionModule(this.page, {
                    enableAutomatic: true,
                    enableLiveCaption: true,
                    language: 'es-ES',
                    interval: 2000
                });
                // Configurar eventos
                this.transcriptionModule.on('transcriptionAdded', (entry) => {
                    this.sessionManager.addTranscriptionEntry(entry);
                    this.emit('transcriptionUpdate', entry);
                });
                this.transcriptionModule.on('error', (error) => {
                    console.error('Error en transcripción:', error);
                    this.emit('transcriptionError', error);
                });
                // Iniciar transcripción
                yield this.transcriptionModule.startTranscription();
                this.sessionManager.updateSessionStatus('recording');
                console.log('✅ Módulo de transcripción iniciado');
            }
            catch (error) {
                console.error('❌ Error inicializando transcripción:', error);
                // No lanzar error para que el bot pueda continuar sin transcripción
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
    // Métodos públicos para transcripción
    toggleTranscription(enable) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.transcriptionModule) {
                console.log('⚠️ Módulo de transcripción no inicializado');
                return;
            }
            if (enable && !this.transcriptionModule.isTranscribing()) {
                yield this.transcriptionModule.startTranscription();
                this.sessionManager.updateSessionStatus('recording');
                console.log('✅ Transcripción habilitada');
            }
            else if (!enable && this.transcriptionModule.isTranscribing()) {
                yield this.transcriptionModule.stopTranscription();
                this.sessionManager.updateSessionStatus('joined');
                console.log('⏸️ Transcripción pausada');
            }
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
                // Detener transcripción
                if (this.transcriptionModule && this.transcriptionModule.isTranscribing()) {
                    yield this.transcriptionModule.stopTranscription();
                    console.log('✅ Transcripción detenida');
                }
                // Detener monitoreo
                if (this.monitoringModule && this.monitoringModule.isMonitoringActive()) {
                    this.monitoringModule.stopMonitoring();
                    console.log('✅ Monitoreo detenido');
                }
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
            var _a, _b, _c, _d;
            const baseStatus = yield this.getStatus();
            return Object.assign(Object.assign({}, baseStatus), { modules: {
                    transcription: {
                        active: ((_a = this.transcriptionModule) === null || _a === void 0 ? void 0 : _a.isTranscribing()) || false,
                        stats: ((_b = this.transcriptionModule) === null || _b === void 0 ? void 0 : _b.getStats()) || null
                    },
                    monitoring: {
                        active: ((_c = this.monitoringModule) === null || _c === void 0 ? void 0 : _c.isMonitoringActive()) || false,
                        stats: ((_d = this.monitoringModule) === null || _d === void 0 ? void 0 : _d.getMonitoringStats()) || null
                    }
                }, meetingInfo: yield this.getMeetingInfo(), networkQuality: yield this.getNetworkQuality() });
        });
    }
}
exports.GoogleMeetBot = GoogleMeetBot;
