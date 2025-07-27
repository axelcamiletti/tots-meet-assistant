import { Page } from 'playwright';
import { TranscriptionModule } from './transcription-module';
import { TranscriptionEntry, TranscriptionConfig } from '../types/bot.types';
import fs from 'fs';
import path from 'path';

export interface WhisperConfig extends TranscriptionConfig {
  apiKey: string;
  model?: 'whisper-1' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';
  language?: string;
  prompt?: string;
  temperature?: number;
}

export class WhisperTranscriptionModule extends TranscriptionModule {
  private whisperConfig: WhisperConfig;
  private audioFilePath: string | null = null;

  constructor(page: Page, config: Partial<WhisperConfig> = {}) {
    super(page, config);
    this.whisperConfig = {
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
      model: config.model || 'gpt-4o-transcribe',
      language: config.language || 'es',
      temperature: config.temperature || 0,
      prompt: config.prompt || 'Esta es una reunión de negocios en español. Por favor transcribe con precisión los nombres propios y términos técnicos.',
      ...config
    };

    if (!this.whisperConfig.apiKey) {
      throw new Error('OpenAI API key is required for Whisper transcription');
    }
  }

  async startTranscription(): Promise<void> {
    if (this.isActive) return;

    console.log('🎤 [WHISPER] Iniciando transcripción con Whisper...');
    
    try {
      this.isActive = true;
      this.emit('started');
      console.log('✅ [WHISPER] Transcripción iniciada - esperando archivo de audio...');
    } catch (error) {
      console.error('❌ [WHISPER] Error iniciando transcripción:', error);
      this.isActive = false;
      throw error;
    }
  }

  async stopTranscription(): Promise<void> {
    if (!this.isActive) return;

    console.log('⏹️ [WHISPER] Deteniendo transcripción...');
    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Procesa un archivo de audio usando Whisper API
   */
  async transcribeAudioFile(audioFilePath: string): Promise<TranscriptionEntry[]> {
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`🎵 [WHISPER] Procesando archivo de audio: ${audioFilePath}`);
    this.audioFilePath = audioFilePath;

    try {
      const transcriptionText = await this.callWhisperAPI(audioFilePath);
      const transcriptionEntry: TranscriptionEntry = {
        timestamp: new Date(),
        speaker: 'Whisper Transcription', // Whisper no identifica hablantes por defecto
        text: transcriptionText,
        confidence: 0.95 // Whisper generalmente tiene alta confianza
      };

      this.addTranscriptionEntry(transcriptionEntry);
      
      console.log('✅ [WHISPER] Transcripción completada exitosamente');
      console.log(`📝 [WHISPER] Texto transcrito: ${transcriptionText.substring(0, 100)}...`);
      
      return [transcriptionEntry];
    } catch (error) {
      console.error('❌ [WHISPER] Error en transcripción:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Llama a la API de Whisper de OpenAI
   */
  private async callWhisperAPI(audioFilePath: string): Promise<string> {
    console.log('🌐 [WHISPER] Enviando audio a OpenAI Whisper API...');

    // Leer el archivo como buffer
    const audioBuffer = await fs.promises.readFile(audioFilePath);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, path.basename(audioFilePath));
    formData.append('model', this.whisperConfig.model || 'gpt-4o-transcribe');
    
    if (this.whisperConfig.language) {
      formData.append('language', this.whisperConfig.language);
    }
    
    if (this.whisperConfig.prompt) {
      formData.append('prompt', this.whisperConfig.prompt);
    }
    
    formData.append('temperature', this.whisperConfig.temperature?.toString() || '0');
    formData.append('response_format', 'json');

    try {
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.whisperConfig.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [WHISPER] Respuesta recibida de OpenAI');
      
      return result.text || '';
    } catch (error) {
      console.error('❌ [WHISPER] Error llamando a Whisper API:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Procesa transcripción con separación de hablantes básica
   * Nota: Whisper no identifica hablantes nativamente, pero podemos hacer post-procesamiento básico
   */
  private processTranscriptionWithSpeakers(text: string): TranscriptionEntry[] {
    console.log('👥 [WHISPER] Procesando separación básica de hablantes...');
    
    // Dividir por pausas largas o cambios de tono (aproximación básica)
    const segments = text.split(/[.!?]\s+/).filter(segment => segment.trim().length > 0);
    const entries: TranscriptionEntry[] = [];
    
    segments.forEach((segment, index) => {
      const speakerNumber = Math.floor(index / 3) + 1; // Cambiar hablante cada 3 segmentos (aproximación)
      
      entries.push({
        timestamp: new Date(Date.now() + (index * 5000)), // 5 segundos entre segmentos
        speaker: `Hablante ${speakerNumber}`,
        text: segment.trim(),
        confidence: 0.9
      });
    });

    console.log(`👥 [WHISPER] Creados ${entries.length} segmentos con ${Math.max(...entries.map(e => parseInt(e.speaker.split(' ')[1])))} hablantes aproximados`);
    
    return entries;
  }

  /**
   * Obtiene información sobre el archivo de audio procesado
   */
  getAudioFileInfo(): { path: string | null; processed: boolean } {
    return {
      path: this.audioFilePath,
      processed: this.audioFilePath !== null && this.transcriptions.length > 0
    };
  }

  /**
   * Limpia el archivo de audio temporal después del procesamiento
   */
  async cleanupAudioFile(): Promise<void> {
    if (this.audioFilePath && fs.existsSync(this.audioFilePath)) {
      try {
        await fs.promises.unlink(this.audioFilePath);
        console.log(`🗑️ [WHISPER] Archivo de audio limpiado: ${this.audioFilePath}`);
        this.audioFilePath = null;
      } catch (error) {
        console.warn(`⚠️ [WHISPER] No se pudo limpiar archivo de audio: ${error}`);
      }
    }
  }
}
