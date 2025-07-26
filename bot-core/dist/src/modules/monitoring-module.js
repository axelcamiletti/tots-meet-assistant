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
exports.MonitoringModule = void 0;
const events_1 = require("events");
class MonitoringModule extends events_1.EventEmitter {
    constructor(page, config = {}) {
        super();
        this.page = page;
        this.isMonitoring = false;
        this.intervals = [];
        this.config = Object.assign({ participantCheckInterval: 30000, meetingStatusCheckInterval: 30000, transcriptionUpdateInterval: 60000 }, config);
    }
    startMonitoring() {
        if (this.isMonitoring)
            return;
        console.log('👁️ Iniciando monitoreo de la reunión...');
        this.isMonitoring = true;
        // Monitorear participantes
        const participantInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const participants = yield this.getParticipants();
                this.emit('participantsUpdated', participants);
            }
            catch (error) {
                this.emit('error', { type: 'participants', error });
            }
        }), this.config.participantCheckInterval);
        // Monitorear estado de la reunión
        const statusInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                const isActive = yield this.isMeetingActive();
                this.emit('meetingStatusChecked', isActive);
                if (!isActive) {
                    this.emit('meetingEnded');
                    this.stopMonitoring();
                }
            }
            catch (error) {
                this.emit('error', { type: 'meetingStatus', error });
            }
        }), this.config.meetingStatusCheckInterval);
        this.intervals.push(participantInterval, statusInterval);
        this.emit('monitoringStarted');
    }
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        console.log('⏹️ Deteniendo monitoreo...');
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        this.isMonitoring = false;
        this.emit('monitoringStopped');
    }
    isMonitoringActive() {
        return this.isMonitoring;
    }
    getMonitoringStats() {
        return {
            isMonitoring: this.isMonitoring,
            intervals: this.intervals.length,
            config: this.config
        };
    }
}
exports.MonitoringModule = MonitoringModule;
