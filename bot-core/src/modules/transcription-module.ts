import { Page } from 'playwright';
import { TranscriptionEntry, TranscriptionConfig } from '../types/bot.types';
import { EventEmitter } from 'events';

export abstract class TranscriptionModule extends EventEmitter {
  protected isActive: boolean = false;
  protected transcriptions: TranscriptionEntry[] = [];
  protected config: TranscriptionConfig;

  constructor(
    protected page: Page,
    config: Partial<TranscriptionConfig> = {}
  ) {
    super();
    this.config = {
      enableAutomatic: true,
      enableLiveCaption: true,
      language: 'es-ES',
      interval: 2000,
      ...config
    };
  }

  abstract startTranscription(): Promise<void>;
  abstract stopTranscription(): Promise<void>;
  
  isTranscribing(): boolean {
    return this.isActive;
  }

  getTranscriptions(): TranscriptionEntry[] {
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
    const totalWords = this.transcriptions.reduce((count, entry) => 
      count + entry.text.split(' ').length, 0
    );

    return {
      ...stats,
      totalWords,
      averageWordsPerEntry: Math.round(totalWords / (stats.totalEntries || 1))
    };
  }

  exportToText(): string {
    return this.transcriptions
      .map(entry => `[${entry.timestamp.toISOString()}] ${entry.speaker}: ${entry.text}`)
      .join('\n');
  }

  exportToJSON(): string {
    return JSON.stringify(this.transcriptions, null, 2);
  }

  clear(): void {
    this.transcriptions = [];
    this.emit('cleared');
  }

  protected addTranscriptionEntry(entry: TranscriptionEntry): void {
    this.transcriptions.push(entry);
    this.emit('transcriptionAdded', entry);
  }
}
