"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionModule = void 0;
const events_1 = require("events");
class TranscriptionModule extends events_1.EventEmitter {
    constructor(page, config = {}) {
        super();
        this.page = page;
        this.isActive = false;
        this.transcriptions = [];
        this.config = Object.assign({ enableAutomatic: true, enableLiveCaption: true, language: 'es-ES', interval: 2000 }, config);
    }
    isTranscribing() {
        return this.isActive;
    }
    getTranscriptions() {
        return [...this.transcriptions];
    }
    getStats() {
        const speakers = new Set(this.transcriptions.map(t => t.speaker));
        return {
            totalEntries: this.transcriptions.length,
            uniqueSpeakers: speakers.size,
            speakers: Array.from(speakers)
        };
    }
    getTranscriptionSummary() {
        const stats = this.getStats();
        const totalWords = this.transcriptions.reduce((count, entry) => count + entry.text.split(' ').length, 0);
        return Object.assign(Object.assign({}, stats), { totalWords, averageWordsPerEntry: Math.round(totalWords / (stats.totalEntries || 1)) });
    }
    exportToText() {
        return this.transcriptions
            .map(entry => `[${entry.timestamp.toISOString()}] ${entry.speaker}: ${entry.text}`)
            .join('\n');
    }
    exportToJSON() {
        return JSON.stringify(this.transcriptions, null, 2);
    }
    clear() {
        this.transcriptions = [];
        this.emit('cleared');
    }
    addTranscriptionEntry(entry) {
        this.transcriptions.push(entry);
        this.emit('transcriptionAdded', entry);
    }
}
exports.TranscriptionModule = TranscriptionModule;
