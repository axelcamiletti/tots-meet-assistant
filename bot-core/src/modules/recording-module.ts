import { Page } from 'playwright';
import { RecordingConfig } from '../types/bot.types';
import { EventEmitter } from 'events';

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
  abstract stopRecording(): Promise<string>; // Returns file path
  abstract pauseRecording(): Promise<void>;
  abstract resumeRecording(): Promise<void>;

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
      this.emit('recordingStarted');
    } else if (!isRecording && this.recordingStartTime) {
      this.emit('recordingStopped', {
        duration: this.getRecordingDuration(),
        startTime: this.recordingStartTime
      });
      this.recordingStartTime = null;
    }
  }
}
