"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
class SessionManager {
    constructor() {
        this.currentSession = null;
    }
    createSession(meetingUrl) {
        this.currentSession = {
            id: this.generateSessionId(),
            url: meetingUrl,
            startTime: new Date(),
            status: 'connecting',
            participants: [],
            transcription: []
        };
        console.log(`📝 Sesión creada: ${this.currentSession.id}`);
        return this.currentSession;
    }
    getCurrentSession() {
        return this.currentSession;
    }
    updateSessionStatus(status) {
        if (this.currentSession) {
            this.currentSession.status = status;
            console.log(`📊 Estado de sesión actualizado: ${status}`);
        }
    }
    updateParticipants(participants) {
        if (this.currentSession) {
            this.currentSession.participants = participants;
            console.log(`👥 Participantes actualizados: ${participants.join(', ')}`);
        }
    }
    addTranscriptionEntry(entry) {
        if (this.currentSession) {
            this.currentSession.transcription.push(entry);
        }
    }
    endSession() {
        if (this.currentSession) {
            this.currentSession.status = 'ended';
            this.currentSession.endTime = new Date();
            const duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
            console.log(`⏱️ Duración de la sesión: ${Math.round(duration / 1000)}s`);
        }
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getSessionStats() {
        if (!this.currentSession)
            return null;
        return {
            duration: this.currentSession.endTime
                ? this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()
                : Date.now() - this.currentSession.startTime.getTime(),
            participantCount: this.currentSession.participants.length,
            transcriptionEntries: this.currentSession.transcription.length,
            status: this.currentSession.status
        };
    }
}
exports.SessionManager = SessionManager;
