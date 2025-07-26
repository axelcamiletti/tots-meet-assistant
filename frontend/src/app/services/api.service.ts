import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meeting {
  id: string;
  title: string;
  meet_url: string;
  meet_id?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Transcription {
  id: string;
  meeting_id: string;
  speaker_name: string;
  text: string;
  timestamp: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Health check
  healthCheck(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/health`);
  }

  // Test database connection
  testDatabase(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/test-db`);
  }

  // Meetings
  getMeetings(page: number = 1, limit: number = 20): Observable<PaginatedResponse<Meeting[]>> {
    return this.http.get<PaginatedResponse<Meeting[]>>(`${this.baseUrl}/meetings?page=${page}&limit=${limit}`);
  }

  getMeeting(id: string): Observable<ApiResponse<Meeting & { transcriptions: Transcription[] }>> {
    return this.http.get<ApiResponse<Meeting & { transcriptions: Transcription[] }>>(`${this.baseUrl}/meetings/${id}`);
  }

  createMeeting(meeting: Partial<Meeting>): Observable<ApiResponse<Meeting>> {
    return this.http.post<ApiResponse<Meeting>>(`${this.baseUrl}/meetings`, meeting);
  }

  updateMeetingStatus(id: string, status: Meeting['status']): Observable<ApiResponse<Meeting>> {
    return this.http.put<ApiResponse<Meeting>>(`${this.baseUrl}/meetings/${id}/status`, { status });
  }

  // Transcriptions
  getTranscriptions(page: number = 1, limit: number = 50, meetingId?: string): Observable<PaginatedResponse<Transcription[]>> {
    let url = `${this.baseUrl}/transcriptions?page=${page}&limit=${limit}`;
    if (meetingId) {
      url += `&meetingId=${meetingId}`;
    }
    return this.http.get<PaginatedResponse<Transcription[]>>(url);
  }

  getMeetingTranscriptions(meetingId: string): Observable<ApiResponse<Transcription[]>> {
    return this.http.get<ApiResponse<Transcription[]>>(`${this.baseUrl}/transcriptions/meeting/${meetingId}`);
  }

  createTranscription(transcription: Partial<Transcription>): Observable<ApiResponse<Transcription>> {
    return this.http.post<ApiResponse<Transcription>>(`${this.baseUrl}/transcriptions`, transcription);
  }

  deleteTranscription(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/transcriptions/${id}`);
  }
}
