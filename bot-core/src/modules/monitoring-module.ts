import { Page } from 'playwright';
import { MonitoringConfig } from '../types/bot.types';
import { EventEmitter } from 'events';

export abstract class MonitoringModule extends EventEmitter {
  protected isMonitoring: boolean = false;
  protected intervals: NodeJS.Timeout[] = [];
  protected config: MonitoringConfig;

  constructor(
    protected page: Page,
    config: Partial<MonitoringConfig> = {}
  ) {
    super();
    this.config = {
      participantCheckInterval: 30000,
      meetingStatusCheckInterval: 30000,
      transcriptionUpdateInterval: 60000,
      ...config
    };
  }

  abstract getParticipants(): Promise<string[]>;
  abstract isMeetingActive(): Promise<boolean>;

  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('👁️ Iniciando monitoreo de la reunión...');
    this.isMonitoring = true;

    // Monitorear participantes
    const participantInterval = setInterval(async () => {
      try {
        const participants = await this.getParticipants();
        this.emit('participantsUpdated', participants);
      } catch (error) {
        this.emit('error', { type: 'participants', error });
      }
    }, this.config.participantCheckInterval);

    // Monitorear estado de la reunión
    const statusInterval = setInterval(async () => {
      try {
        const isActive = await this.isMeetingActive();
        this.emit('meetingStatusChecked', isActive);
        
        if (!isActive) {
          this.emit('meetingEnded');
          this.stopMonitoring();
        }
      } catch (error) {
        this.emit('error', { type: 'meetingStatus', error });
      }
    }, this.config.meetingStatusCheckInterval);

    this.intervals.push(participantInterval, statusInterval);
    this.emit('monitoringStarted');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('⏹️ Deteniendo monitoreo...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isMonitoring = false;
    this.emit('monitoringStopped');
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  getMonitoringStats() {
    return {
      isMonitoring: this.isMonitoring,
      intervals: this.intervals.length,
      config: this.config
    };
  }
}
