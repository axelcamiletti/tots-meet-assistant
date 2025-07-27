import { Page } from 'playwright';
import { BaseBot } from '../core/base-bot';
import { BotConfig } from '../types/bot.types';
import { GoogleMeetJoinModule } from './google-meet/join';
import { WhisperTranscriptionModule } from '../modules/whisper-transcription-module';
import { GoogleMeetRecordingModule } from './google-meet/recording';
import { GoogleMeetMonitoringModule } from './google-meet/monitoring';

export class GoogleMeetBot extends BaseBot {
  private joinModule: GoogleMeetJoinModule | null = null;
  private transcriptionModule: WhisperTranscriptionModule | null = null;
  private recordingModule: GoogleMeetRecordingModule | null = null;
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

    // Inicializar grabación y transcripción con Whisper
    await this.initializeRecordingAndTranscription();

    // Inicializar monitoreo
    await this.initializeMonitoring();

    console.log('✅ Módulos inicializados');
  }

  private async initializeRecordingAndTranscription(): Promise<void> {
    if (!this.page) return;

    try {
      console.log('� Inicializando grabación y transcripción con Whisper...');
      
      // Inicializar módulo de grabación
      this.recordingModule = new GoogleMeetRecordingModule(this.page, {
        enableVideo: true,
        enableAudio: true,
        quality: 'medium',
        format: 'mp4'
      });

      // Inicializar módulo de transcripción Whisper
      this.transcriptionModule = new WhisperTranscriptionModule(this.page, {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o-transcribe',
        language: 'es',
        prompt: 'Esta es una reunión de negocios en español. Por favor transcribe con precisión los nombres propios y términos técnicos.'
      });

      // Configurar eventos de grabación
      this.recordingModule.on('recordingStarted', (info: any) => {
        console.log('🎬 Grabación iniciada:', info);
        this.emit('recordingStarted', info);
      });

      this.recordingModule.on('recordingStopped', (info: any) => {
        console.log('⏹️ Grabación detenida:', info);
        this.emit('recordingStopped', info);
      });

      this.recordingModule.on('recordingCompleted', async (result: any) => {
        console.log('✅ Grabación completada:', result);
        
        // Procesar audio con Whisper si existe
        if (result.audioPath && result.success) {
          try {
            console.log('🎵 Procesando audio con Whisper...');
            await this.transcriptionModule?.transcribeAudioFile(result.audioPath);
            
            // Cleanup del archivo de audio después del procesamiento
            await this.transcriptionModule?.cleanupAudioFile();
            
            this.emit('transcriptionCompleted', this.transcriptionModule?.getTranscriptions());
          } catch (error) {
            console.error('❌ Error procesando audio con Whisper:', error);
            this.emit('transcriptionError', error);
          }
        }
        
        this.emit('recordingCompleted', result);
      });

      // Configurar eventos de transcripción
      this.transcriptionModule.on('transcriptionAdded', (entry: any) => {
        this.sessionManager.addTranscriptionEntry(entry);
        this.emit('transcriptionUpdate', entry);
      });

      this.transcriptionModule.on('error', (error: any) => {
        console.error('Error en transcripción Whisper:', error);
        this.emit('transcriptionError', error);
      });

      // Iniciar grabación automáticamente
      await this.recordingModule.startRecording();
      await this.transcriptionModule.startTranscription();
      
      this.sessionManager.updateSessionStatus('recording');
      
      console.log('✅ Grabación y transcripción iniciadas');
    } catch (error) {
      console.error('❌ Error inicializando grabación y transcripción:', error);
      // No lanzar error para que el bot pueda continuar
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

  // Métodos públicos para grabación y transcripción
  async toggleRecording(enable: boolean): Promise<void> {
    if (!this.recordingModule) {
      console.log('⚠️ Módulo de grabación no inicializado');
      return;
    }

    if (enable && !this.recordingModule.isRecordingActive()) {
      await this.recordingModule.startRecording();
      this.sessionManager.updateSessionStatus('recording');
      console.log('✅ Grabación habilitada');
    } else if (!enable && this.recordingModule.isRecordingActive()) {
      const result = await this.recordingModule.stopRecording();
      this.sessionManager.updateSessionStatus('joined');
      
      // Procesar audio con Whisper automáticamente
      if (result.audioPath && result.success && this.transcriptionModule) {
        try {
          await this.transcriptionModule.transcribeAudioFile(result.audioPath);
          console.log('✅ Audio procesado con Whisper');
        } catch (error) {
          console.error('❌ Error procesando audio:', error);
        }
      }
      
      console.log('⏸️ Grabación detenida');
    }
  }

  async toggleTranscription(enable: boolean): Promise<void> {
    console.log('ℹ️ Transcripción está integrada con grabación. Use toggleRecording() en su lugar.');
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

  // Métodos para el módulo de grabación
  getRecordingStats() {
    return this.recordingModule?.getRecordingStats() || null;
  }

  isRecordingActive(): boolean {
    return this.recordingModule?.isRecordingActive() || false;
  }

  getRecordingDirectory(): string {
    return this.recordingModule?.getRecordingDirectory() || '';
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
      // Detener grabación si está activa
      if (this.recordingModule && this.recordingModule.isRecordingActive()) {
        await this.recordingModule.stopRecording();
        console.log('✅ Grabación detenida');
      }

      // Detener monitoreo
      if (this.monitoringModule && this.monitoringModule.isMonitoringActive()) {
        this.monitoringModule.stopMonitoring();
        console.log('✅ Monitoreo detenido');
      }

      // Cleanup de módulos
      // Los módulos se limpian automáticamente al detener sus procesos

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
        recording: {
          active: this.recordingModule?.isRecordingActive() || false,
          stats: this.recordingModule?.getRecordingStats() || null,
          directory: this.recordingModule?.getRecordingDirectory() || null
        },
        transcription: {
          active: false, // Whisper procesa post-reunión
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
