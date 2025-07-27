"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingModule = void 0;
const events_1 = require("events");
class RecordingModule extends events_1.EventEmitter {
    constructor(page, config = {}) {
        super();
        this.page = page;
        this.isRecording = false;
        this.recordingStartTime = null;
        this.config = Object.assign({ enableVideo: true, enableAudio: true, quality: 'medium', format: 'mp4' }, config);
    }
    isRecordingActive() {
        return this.isRecording;
    }
    getRecordingDuration() {
        if (!this.recordingStartTime)
            return 0;
        return Date.now() - this.recordingStartTime.getTime();
    }
    getRecordingStats() {
        return {
            isRecording: this.isRecording,
            duration: this.getRecordingDuration(),
            startTime: this.recordingStartTime,
            config: this.config
        };
    }
    setRecordingState(isRecording) {
        this.isRecording = isRecording;
        if (isRecording && !this.recordingStartTime) {
            this.recordingStartTime = new Date();
            this.emit('recordingStarted', {
                timestamp: this.recordingStartTime,
                config: this.config
            });
        }
        else if (!isRecording && this.recordingStartTime) {
            const duration = this.getRecordingDuration();
            this.emit('recordingStopped', {
                duration,
                startTime: this.recordingStartTime
            });
            this.recordingStartTime = null;
        }
    }
}
exports.RecordingModule = RecordingModule;
