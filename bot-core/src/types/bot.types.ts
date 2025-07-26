export interface BotConfig {
  meetingUrl: string;
  botName: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  headless?: boolean;
  slowMo?: number;
}

export interface MeetingSession {
  id: string;
  url: string;
  startTime: Date;
  endTime?: Date;
  status: 'connecting' | 'joined' | 'recording' | 'ended' | 'error';
  participants: string[];
  transcription: TranscriptionEntry[];
}

export interface TranscriptionEntry {
  timestamp: Date;
  speaker: string;
  text: string;
  confidence?: number;
}

export interface TranscriptionConfig {
  enableAutomatic?: boolean;
  enableLiveCaption?: boolean;
  language?: string;
  interval?: number;
}

export interface RecordingConfig {
  enableVideo?: boolean;
  enableAudio?: boolean;
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp4' | 'webm';
}

export interface MonitoringConfig {
  participantCheckInterval?: number;
  meetingStatusCheckInterval?: number;
  transcriptionUpdateInterval?: number;
}
