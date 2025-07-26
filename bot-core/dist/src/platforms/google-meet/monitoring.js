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
exports.GoogleMeetMonitoringModule = void 0;
const monitoring_module_1 = require("../../modules/monitoring-module");
class GoogleMeetMonitoringModule extends monitoring_module_1.MonitoringModule {
    constructor(page, config = {}) {
        super(page, config);
    }
    getParticipants() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const participants = yield this.page.$$eval('[data-participant-id], [data-self-name], .participant-name, [data-requested-participant-id]', (elements) => {
                    return elements
                        .map(el => { var _a; return (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim(); })
                        .filter(name => name && name.length > 0);
                });
                // Remover duplicados
                return [...new Set(participants)];
            }
            catch (error) {
                console.error('Error obteniendo participantes:', error);
                return [];
            }
        });
    }
    isMeetingActive() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verificar si estamos en la página de Google Meet
                const currentUrl = this.page.url();
                if (!currentUrl.includes('meet.google.com')) {
                    return false;
                }
                // Buscar indicadores de que la reunión está activa
                const meetingIndicators = yield this.page.$$([
                    '[data-call-ended="false"]',
                    '.call-controls',
                    '[data-tooltip*="microphone" i]',
                    '[data-tooltip*="camera" i]',
                    '[aria-label*="leave call" i]'
                ].join(', '));
                // Si encontramos al menos uno de estos indicadores, la reunión está activa
                if (meetingIndicators.length > 0) {
                    return true;
                }
                // Verificar si hay un mensaje de "Meeting ended" o similar
                const endedMessages = yield this.page.$$([
                    'text="The meeting has ended"',
                    'text="Meeting ended"',
                    'text="Call ended"',
                    '[data-call-ended="true"]'
                ].join(', '));
                return endedMessages.length === 0;
            }
            catch (error) {
                console.error('Error verificando estado de la reunión:', error);
                // En caso de error, asumir que la reunión sigue activa para evitar terminaciones prematuras
                return true;
            }
        });
    }
    getMeetingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield this.page.evaluate(() => {
                    var _a, _b, _c;
                    // Intentar obtener información adicional de la reunión
                    const meetingTitle = (_a = document.querySelector('[data-meeting-title], .meeting-title')) === null || _a === void 0 ? void 0 : _a.textContent;
                    const meetingCode = (_b = document.querySelector('[data-meeting-code], .meeting-code')) === null || _b === void 0 ? void 0 : _b.textContent;
                    const duration = (_c = document.querySelector('[data-call-duration], .call-duration')) === null || _c === void 0 ? void 0 : _c.textContent;
                    return {
                        title: (meetingTitle === null || meetingTitle === void 0 ? void 0 : meetingTitle.trim()) || null,
                        code: (meetingCode === null || meetingCode === void 0 ? void 0 : meetingCode.trim()) || null,
                        duration: (duration === null || duration === void 0 ? void 0 : duration.trim()) || null,
                        url: window.location.href
                    };
                });
                return info;
            }
            catch (error) {
                console.error('Error obteniendo información de la reunión:', error);
                return null;
            }
        });
    }
    getNetworkQuality() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quality = yield this.page.evaluate(() => {
                    var _a;
                    // Buscar indicadores de calidad de red
                    const qualityIndicator = document.querySelector('[data-network-quality], .network-quality, [aria-label*="network" i]');
                    return (qualityIndicator === null || qualityIndicator === void 0 ? void 0 : qualityIndicator.getAttribute('data-quality')) ||
                        ((_a = qualityIndicator === null || qualityIndicator === void 0 ? void 0 : qualityIndicator.textContent) === null || _a === void 0 ? void 0 : _a.trim()) ||
                        'unknown';
                });
                return quality;
            }
            catch (error) {
                console.error('Error obteniendo calidad de red:', error);
                return 'unknown';
            }
        });
    }
    // Método específico para detectar si se perdió la conexión
    isConnectionLost() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connectionIssues = yield this.page.$$([
                    'text="Reconnecting"',
                    'text="Connection lost"',
                    'text="Poor connection"',
                    '[data-connection-lost="true"]'
                ].join(', '));
                return connectionIssues.length > 0;
            }
            catch (error) {
                return false;
            }
        });
    }
}
exports.GoogleMeetMonitoringModule = GoogleMeetMonitoringModule;
