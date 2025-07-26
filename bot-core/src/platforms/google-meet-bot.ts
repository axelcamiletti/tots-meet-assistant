import { Page } from 'playwright';
import { BaseBot } from '../core/base-bot';
import { BotConfig } from '../types/bot.types';
import { GoogleMeetJoinModule } from './google-meet/join';
import { GoogleMeetTranscriptionModule } from './google-meet/transcription';
import { GoogleMeetMonitoringModule } from './google-meet/monitoring';

export class GoogleMeetBot extends BaseBot {
  private joinModule: GoogleMeetJoinModule | null = null;
  private transcriptionModule: GoogleMeetTranscriptionModule | null = null;
  private monitoringModule: GoogleMeetMonitoringModule | null = null;

  constructor(config: BotConfig) {
    super(config);
  }

  async joinMeeting(): Promise<void> {
    if (!this.page) throw new Error('Page no inicializada');

    console.log('🔗 Iniciando proceso de unión a Google Meet...');
    
    // Crear módulo de unión
    this.joinModule = new GoogleMeetJoinModule(this.page, this.config);
    
    try {
      // Unirse a la reunión
      await this.joinModule.joinMeeting();
      
      // Actualizar estado de la sesión
      this.sessionManager.updateSessionStatus('joined');
      
      // Inicializar módulos adicionales
      await this.initializeModules();
      
      // Mantener la sesión activa
      this.startSessionKeepAlive();
      
      console.log('✅ Google Meet Bot unido exitosamente');
      this.emit('joined');
      
    } catch (error) {
      this.sessionManager.updateSessionStatus('error');
      console.error('❌ Error uniéndose a Google Meet:', error);
      this.emit('joinError', error);
      throw error;
    }
  }

  private async initializeModules(): Promise<void> {
    if (!this.page) return;

    console.log('🔧 Inicializando módulos del bot...');

    // Inicializar transcripción
    await this.initializeTranscription();

    // Inicializar monitoreo
    await this.initializeMonitoring();

    console.log('✅ Módulos inicializados');
  }

  private async initializeTranscription(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('🎤 Inicializando módulo de transcripción...');
      
      this.transcriptionModule = new GoogleMeetTranscriptionModule(this.page, {
        enableAutomatic: true,
        enableLiveCaption: true,
        language: 'es-ES',
        interval: 2000
      });

      // Configurar eventos
      this.transcriptionModule.on('transcriptionAdded', (entry) => {
        this.sessionManager.addTranscriptionEntry(entry);
        this.emit('transcriptionUpdate', entry);
      });

      this.transcriptionModule.on('error', (error) => {
        console.error('Error en transcripción:', error);
        this.emit('transcriptionError', error);
      });

      // Iniciar transcripción
      await this.transcriptionModule.startTranscription();
      this.sessionManager.updateSessionStatus('recording');
      
      console.log('✅ Módulo de transcripción iniciado');
    } catch (error) {
      console.error('❌ Error inicializando transcripción:', error);
      // No lanzar error para que el bot pueda continuar sin transcripción
    }
  }

  private async initializeMonitoring(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('👁️ Inicializando módulo de monitoreo...');
      
      this.monitoringModule = new GoogleMeetMonitoringModule(this.page, {
        participantCheckInterval: 30000,
        meetingStatusCheckInterval: 30000
      });

      // Configurar eventos
      this.monitoringModule.on('participantsUpdated', (participants) => {
        this.sessionManager.updateParticipants(participants);
        this.emit('participantsUpdate', participants);
      });

      this.monitoringModule.on('meetingEnded', () => {
        console.log('📞 Reunión terminada detectada por monitoreo');
        this.endSession();
      });

      this.monitoringModule.on('error', (error) => {
        console.error('Error en monitoreo:', error.error);
        this.emit('monitoringError', error);
      });

      // Iniciar monitoreo
      this.monitoringModule.startMonitoring();
      
      console.log('✅ Módulo de monitoreo iniciado');
    } catch (error) {
      console.error('❌ Error inicializando monitoreo:', error);
    }
  }

  // Métodos públicos para transcripción
  async toggleTranscription(enable: boolean): Promise<void> {
    if (!this.transcriptionModule) {
      console.log('⚠️ Módulo de transcripción no inicializado');
      return;
    }

    if (enable && !this.transcriptionModule.isTranscribing()) {
      await this.transcriptionModule.startTranscription();
      this.sessionManager.updateSessionStatus('recording');
      console.log('✅ Transcripción habilitada');
    } else if (!enable && this.transcriptionModule.isTranscribing()) {
      await this.transcriptionModule.stopTranscription();
      this.sessionManager.updateSessionStatus('joined');
      console.log('⏸️ Transcripción pausada');
    }
  }

  getTranscriptions() {
    return this.transcriptionModule?.getTranscriptions() || [];
  }

  getTranscriptionStats() {
    return this.transcriptionModule?.getStats() || null;
  }

  getTranscriptionSummary() {
    return this.transcriptionModule?.getTranscriptionSummary() || null;
  }

  exportTranscriptionToText(): string {
    return this.transcriptionModule?.exportToText() || 'No hay transcripciones disponibles';
  }

  exportTranscriptionToJSON(): string {
    return this.transcriptionModule?.exportToJSON() || '[]';
  }

  // Métodos públicos para monitoreo
  async getParticipants(): Promise<string[]> {
    return this.monitoringModule?.getParticipants() || [];
  }

  async isMeetingActive(): Promise<boolean> {
    return this.monitoringModule?.isMeetingActive() || false;
  }

  async getMeetingInfo() {
    return this.monitoringModule?.getMeetingInfo() || null;
  }

  async getNetworkQuality() {
    return this.monitoringModule?.getNetworkQuality() || 'unknown';
  }

  // Mantener la sesión activa
  private startSessionKeepAlive(): void {
    if (!this.page) return;

    console.log('🔄 Iniciando keep-alive para mantener la sesión activa...');
    
    // Verificar cada 30 segundos que la página sigue activa
    const keepAliveInterval = setInterval(async () => {
      try {
        if (!this.isActive() || !this.page) {
          clearInterval(keepAliveInterval);
          return;
        }

        // Verificar que la página no se haya cerrado
        const isConnected = await this.page.evaluate(() => {
          return document.readyState === 'complete' && !document.hidden;
        });

        if (!isConnected) {
          console.log('⚠️ Página desconectada, intentando reconectar...');
          clearInterval(keepAliveInterval);
          this.emit('connectionLost');
          return;
        }

        // Verificar que estamos en la reunión
        const currentUrl = this.page.url();
        if (!currentUrl.includes('meet.google.com')) {
          console.log('⚠️ Ya no estamos en Google Meet');
          clearInterval(keepAliveInterval);
          this.emit('leftMeeting');
          return;
        }

        // Pequeña actividad para mantener la sesión viva
        await this.page.evaluate(() => {
          // Mover un poco el mouse virtualmente
          document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: Math.random() * 10,
            clientY: Math.random() * 10
          }));
        });

      } catch (error) {
        console.log('⚠️ Error en keep-alive:', error);
      }
    }, 30000); // Cada 30 segundos

    console.log('✅ Keep-alive iniciado');
  }

  // Cleanup mejorado
  protected async cleanup(): Promise<void> {
    console.log('🧹 Limpiando recursos de Google Meet Bot...');
    
    try {
      // Detener transcripción
      if (this.transcriptionModule && this.transcriptionModule.isTranscribing()) {
        await this.transcriptionModule.stopTranscription();
        console.log('✅ Transcripción detenida');
      }

      // Detener monitoreo
      if (this.monitoringModule && this.monitoringModule.isMonitoringActive()) {
        this.monitoringModule.stopMonitoring();
        console.log('✅ Monitoreo detenido');
      }

      // Cleanup del bot base
      await super.cleanup();
      
    } catch (error) {
      console.error('Error en cleanup de Google Meet Bot:', error);
    }
  }

  // Información completa del estado del bot
  async getDetailedStatus() {
    const baseStatus = await this.getStatus();
    
    return {
      ...baseStatus,
      modules: {
        transcription: {
          active: this.transcriptionModule?.isTranscribing() || false,
          stats: this.transcriptionModule?.getStats() || null
        },
        monitoring: {
          active: this.monitoringModule?.isMonitoringActive() || false,
          stats: this.monitoringModule?.getMonitoringStats() || null
        }
      },
      meetingInfo: await this.getMeetingInfo(),
      networkQuality: await this.getNetworkQuality()
    };
  }
}
