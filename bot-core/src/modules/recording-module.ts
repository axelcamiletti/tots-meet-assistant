import { Page } from 'playwright';
import { RecordingConfig } from '../types/bot.types';
import { EventEmitter } from 'events';

export interface RecordingResult {
  videoPath?: string;
  audioPath?: string;
  duration: number;
  success: boolean;
}

export abstract class RecordingModule extends EventEmitter {
  protected isRecording: boolean = false;
  protected recordingStartTime: Date | null = null;
  protected config: RecordingConfig;

  constructor(
    protected page: Page,
    config: Partial<RecordingConfig> = {}
  ) {
    super();
    this.config = {
      enableVideo: true,
      enableAudio: true,
      quality: 'medium',
      format: 'mp4',
      ...config
    };
  }

  abstract startRecording(): Promise<void>;
  abstract stopRecording(): Promise<RecordingResult>;
  abstract pauseRecording(): Promise<void>;
  abstract resumeRecording(): Promise<void>;

  // Nuevos métodos para grabación separada
  abstract startVideoRecording(): Promise<void>;
  abstract startAudioRecording(): Promise<void>;
  abstract stopVideoRecording(): Promise<string>; // Returns video file path
  abstract stopAudioRecording(): Promise<string>; // Returns audio file path

  isRecordingActive(): boolean {
    return this.isRecording;
  }

  getRecordingDuration(): number {
    if (!this.recordingStartTime) return 0;
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

  protected setRecordingState(isRecording: boolean): void {
    this.isRecording = isRecording;
    
    if (isRecording && !this.recordingStartTime) {
      this.recordingStartTime = new Date();
      this.emit('recordingStarted', {
        timestamp: this.recordingStartTime,
        config: this.config
      });
    } else if (!isRecording && this.recordingStartTime) {
      const duration = this.getRecordingDuration();
      this.emit('recordingStopped', {
        duration,
        startTime: this.recordingStartTime
      });
      this.recordingStartTime = null;
    }
  }

  // Método para limpiar archivos temporales
  abstract cleanupTempFiles(): Promise<void>;
}
