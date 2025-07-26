import { MeetingSession } from '../types/bot.types';

export class SessionManager {
  private currentSession: MeetingSession | null = null;

  createSession(meetingUrl: string): MeetingSession {
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

  getCurrentSession(): MeetingSession | null {
    return this.currentSession;
  }

  updateSessionStatus(status: MeetingSession['status']): void {
    if (this.currentSession) {
      this.currentSession.status = status;
      console.log(`📊 Estado de sesión actualizado: ${status}`);
    }
  }

  updateParticipants(participants: string[]): void {
    if (this.currentSession) {
      this.currentSession.participants = participants;
      console.log(`👥 Participantes actualizados: ${participants.join(', ')}`);
    }
  }

  addTranscriptionEntry(entry: any): void {
    if (this.currentSession) {
      this.currentSession.transcription.push(entry);
    }
  }

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.status = 'ended';
      this.currentSession.endTime = new Date();
      
      const duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
      console.log(`⏱️ Duración de la sesión: ${Math.round(duration / 1000)}s`);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionStats() {
    if (!this.currentSession) return null;

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
