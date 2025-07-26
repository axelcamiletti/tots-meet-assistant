import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Meeting, Transcription } from '../services/api.service';
import { MeetingComponent } from './meeting';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, MeetingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  @ViewChild('meetingComponent') meetingComponent!: MeetingComponent;

  // Signals para el estado
  backendStatus = signal<'connected' | 'disconnected'>('disconnected');
  databaseStatus = signal<'connected' | 'disconnected'>('disconnected');

  meetings = signal<Meeting[]>([]);
  selectedMeeting = signal<Meeting | null>(null);
  totalTranscriptionsCount = signal(0);

  loading = signal(false);  // Computed values
  totalMeetings = computed(() => this.meetings().length);
  totalTranscriptions = computed(() => this.totalTranscriptionsCount());
  activeMeetings = computed(() =>
    this.meetings().filter(m => m.status === 'active').length
  );

  ngOnInit() {
    this.checkBackendStatus();
    this.loadMeetings();
  }

  async checkBackendStatus() {
    try {
      // Check backend
      await this.apiService.healthCheck().toPromise();
      this.backendStatus.set('connected');

      // Check database
      await this.apiService.testDatabase().toPromise();
      this.databaseStatus.set('connected');
    } catch (error) {
      console.error('Error checking backend status:', error);
    }
  }

  async loadMeetings() {
    this.loading.set(true);
    try {
      const response = await this.apiService.getMeetings().toPromise();
      if (response && response.data) {
        this.meetings.set(response.data);

        // Count total transcriptions
        let totalTranscriptions = 0;
        for (const meeting of response.data) {
          try {
            const transcriptionsResponse = await this.apiService.getMeetingTranscriptions(meeting.id).toPromise();
            if (transcriptionsResponse && transcriptionsResponse.data) {
              totalTranscriptions += transcriptionsResponse.data.length;
            }
          } catch (error) {
            // Ignore errors for individual meetings
          }
        }
        this.totalTranscriptionsCount.set(totalTranscriptions);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async selectMeeting(meeting: Meeting) {
    this.selectedMeeting.set(meeting);

    // Load transcriptions in the MeetingComponent
    if (this.meetingComponent) {
      await this.meetingComponent.loadTranscriptions(meeting.id);
    }
  }  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }
}
