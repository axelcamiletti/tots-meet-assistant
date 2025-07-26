import { Page } from 'playwright';
import { TranscriptionModule } from '../../modules/transcription-module';
import { TranscriptionEntry, TranscriptionConfig } from '../../types/bot.types';

export class GoogleMeetTranscriptionModule extends TranscriptionModule {
  private lastProcessedIndex: number = 0;

  constructor(page: Page, config: Partial<TranscriptionConfig> = {}) {
    super(page, config);
  }

  async startTranscription(): Promise<void> {
    if (this.isActive) return;

    console.log('🎤 Iniciando transcripción de Google Meet...');

    try {
      // Activar subtítulos automáticos si están disponibles
      if (this.config.enableLiveCaption) {
        await this.enableLiveCaptions();
      }

      this.isActive = true;
      this.startTranscriptionLoop();
      
      console.log('✅ Transcripción iniciada exitosamente');
      this.emit('started');
    } catch (error) {
      console.error('❌ Error iniciando transcripción:', error);
      this.isActive = false;
      throw error;
    }
  }

  async stopTranscription(): Promise<void> {
    if (!this.isActive) return;

    console.log('⏹️ Deteniendo transcripción...');
    this.isActive = false;
    this.emit('stopped');
  }

  private async enableLiveCaptions(): Promise<void> {
    try {
      console.log('🔍 Buscando controles de subtítulos...');
      
      // Buscar el botón de subtítulos con timeout más largo
      const captionButton = await this.page.waitForSelector(
        '[data-tooltip*="captions" i], [aria-label*="captions" i], [title*="captions" i]',
        { timeout: 10000 }
      );

      if (captionButton) {
        const isEnabled = await captionButton.getAttribute('data-is-muted') === 'false';
        if (!isEnabled) {
          await captionButton.click();
          console.log('✅ Subtítulos activados');
        } else {
          console.log('ℹ️ Subtítulos ya están activados');
        }
      }
    } catch (error) {
      // Esto es normal si no hay conversación activa aún
      console.log('ℹ️ Subtítulos no disponibles por el momento (normal si no hay conversación activa)');
      console.log('   El bot los activará automáticamente cuando detecte audio');
    }
  }

  private startTranscriptionLoop(): void {
    const processTranscriptions = async () => {
      if (!this.isActive) return;

      try {
        await this.processNewTranscriptions();
      } catch (error) {
        console.error('Error procesando transcripciones:', error);
        this.emit('error', error);
      }

      // Continuar el loop si sigue activo
      if (this.isActive) {
        setTimeout(processTranscriptions, this.config.interval);
      }
    };

    processTranscriptions();
  }

  private async processNewTranscriptions(): Promise<void> {
    // Buscar elementos de transcripción en Google Meet
    const captionElements = await this.page.$$eval(
      '[data-caption-node], .captions-text, [jsname="tgaKEf"]',
      (elements) => {
        return elements.map((el, index) => ({
          index,
          text: el.textContent?.trim() || '',
          timestamp: new Date().toISOString()
        }));
      }
    );

    // Procesar solo nuevos elementos
    const newElements = captionElements.slice(this.lastProcessedIndex);
    this.lastProcessedIndex = captionElements.length;

    for (const element of newElements) {
      if (element.text && element.text.length > 0) {
        const entry: TranscriptionEntry = {
          timestamp: new Date(),
          speaker: this.detectSpeaker(element.text),
          text: element.text,
          confidence: 0.8 // Valor por defecto para Google Meet
        };

        this.addTranscriptionEntry(entry);
        console.log(`📝 [${entry.speaker}]: ${entry.text}`);
      }
    }
  }

  private detectSpeaker(text: string): string {
    // Lógica básica para detectar el hablante
    // Google Meet a veces incluye el nombre del hablante al principio
    const speakerMatch = text.match(/^([^:]+):\s*/);
    if (speakerMatch) {
      return speakerMatch[1].trim();
    }

    // Si no se puede detectar, usar un identificador genérico
    return 'Participante';
  }

  // Método específico para obtener transcripciones de Google Meet API si está disponible
  async getGoogleMeetTranscriptions(): Promise<TranscriptionEntry[]> {
    try {
      // Intentar obtener transcripciones usando la API interna de Google Meet
      const transcriptions = await this.page.evaluate(() => {
        // Esto es experimental y puede cambiar
        const meetData = (window as any).__meet_data__;
        return meetData?.transcriptions || [];
      });

      return transcriptions.map((t: any) => ({
        timestamp: new Date(t.timestamp),
        speaker: t.speaker || 'Participante',
        text: t.text,
        confidence: t.confidence || 0.8
      }));
    } catch (error) {
      console.log('⚠️ No se pudo acceder a transcripciones nativas de Google Meet');
      return [];
    }
  }
}
