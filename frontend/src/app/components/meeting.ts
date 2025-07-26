import { Component, input, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Meeting, Transcription } from '../services/api.service';

@Component({
  selector: 'app-meeting',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './meeting.html',
})
export class MeetingComponent {
  private readonly apiService = inject(ApiService);

  // Inputs
  selectedMeeting = input<Meeting | null>(null);

  // Signals
  transcriptions = signal<Transcription[]>([]);
  transcriptionsLoading = signal(false);

  async loadTranscriptions(meetingId: string) {
    this.transcriptionsLoading.set(true);

    try {
      const response = await this.apiService.getMeetingTranscriptions(meetingId).toPromise();
      if (response && response.data) {
        const sortedTranscriptions = response.data.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        this.transcriptions.set(sortedTranscriptions);
      }
    } catch (error) {
      console.error('Error loading transcriptions:', error);
      this.transcriptions.set([]);
    } finally {
      this.transcriptionsLoading.set(false);
    }
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Genera un color consistente para cada participante basado en su nombre
  getSpeakerColor(speakerName: string): string {
    // Array de colores atractivos y distinguibles
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#8B5CF6', // Violet
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
      '#14B8A6', // Teal
      '#A855F7', // Purple
      '#F43F5E', // Rose
      '#22C55E', // Green
      '#3B82F6', // Blue (duplicate for more speakers)
      '#8B5CF6'  // Violet (duplicate)
    ];

    // Genera un hash simple del nombre para asegurar consistencia
    let hash = 0;
    for (let i = 0; i < speakerName.length; i++) {
      const char = speakerName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convierte a 32bit integer
    }

    // Usa el hash para seleccionar un color del array
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  }

  // Obtiene la lista de participantes únicos
  getUniqueSpeakers(): string[] {
    const speakers = this.transcriptions().map(t => t.speaker_name);
    return [...new Set(speakers)];
  }
}
