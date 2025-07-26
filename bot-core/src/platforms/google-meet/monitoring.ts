import { Page } from 'playwright';
import { MonitoringModule } from '../../modules/monitoring-module';
import { MonitoringConfig } from '../../types/bot.types';

export class GoogleMeetMonitoringModule extends MonitoringModule {
  constructor(page: Page, config: Partial<MonitoringConfig> = {}) {
    super(page, config);
  }

  async getParticipants(): Promise<string[]> {
    try {
      const participants = await this.page.$$eval(
        '[data-participant-id], [data-self-name], .participant-name, [data-requested-participant-id]',
        (elements: Element[]) => {
          return elements
            .map(el => el.textContent?.trim())
            .filter(name => name && name.length > 0) as string[];
        }
      );

      // Remover duplicados
      return [...new Set(participants)];
    } catch (error) {
      console.error('Error obteniendo participantes:', error);
      return [];
    }
  }

  async isMeetingActive(): Promise<boolean> {
    try {
      // Verificar si estamos en la página de Google Meet
      const currentUrl = this.page.url();
      if (!currentUrl.includes('meet.google.com')) {
        return false;
      }

      // Buscar indicadores de que la reunión está activa
      const meetingIndicators = await this.page.$$([
        '[data-call-ended="false"]',
        '.call-controls',
        '[data-tooltip*="microphone" i]',
        '[data-tooltip*="camera" i]',
        '[aria-label*="leave call" i]'
      ].join(', '));

      // Si encontramos al menos uno de estos indicadores, la reunión está activa
      if (meetingIndicators.length > 0) {
        return true;
      }

      // Verificar si hay un mensaje de "Meeting ended" o similar
      const endedMessages = await this.page.$$([
        'text="The meeting has ended"',
        'text="Meeting ended"',
        'text="Call ended"',
        '[data-call-ended="true"]'
      ].join(', '));

      return endedMessages.length === 0;
    } catch (error) {
      console.error('Error verificando estado de la reunión:', error);
      // En caso de error, asumir que la reunión sigue activa para evitar terminaciones prematuras
      return true;
    }
  }

  async getMeetingInfo() {
    try {
      const info = await this.page.evaluate(() => {
        // Intentar obtener información adicional de la reunión
        const meetingTitle = document.querySelector('[data-meeting-title], .meeting-title')?.textContent;
        const meetingCode = document.querySelector('[data-meeting-code], .meeting-code')?.textContent;
        const duration = document.querySelector('[data-call-duration], .call-duration')?.textContent;

        return {
          title: meetingTitle?.trim() || null,
          code: meetingCode?.trim() || null,
          duration: duration?.trim() || null,
          url: window.location.href
        };
      });

      return info;
    } catch (error) {
      console.error('Error obteniendo información de la reunión:', error);
      return null;
    }
  }

  async getNetworkQuality() {
    try {
      const quality = await this.page.evaluate(() => {
        // Buscar indicadores de calidad de red
        const qualityIndicator = document.querySelector('[data-network-quality], .network-quality, [aria-label*="network" i]');
        return qualityIndicator?.getAttribute('data-quality') || 
               qualityIndicator?.textContent?.trim() || 
               'unknown';
      });

      return quality;
    } catch (error) {
      console.error('Error obteniendo calidad de red:', error);
      return 'unknown';
    }
  }

  // Método específico para detectar si se perdió la conexión
  async isConnectionLost(): Promise<boolean> {
    try {
      const connectionIssues = await this.page.$$([
        'text="Reconnecting"',
        'text="Connection lost"',
        'text="Poor connection"',
        '[data-connection-lost="true"]'
      ].join(', '));

      return connectionIssues.length > 0;
    } catch (error) {
      return false;
    }
  }
}
