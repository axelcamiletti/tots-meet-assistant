import { Page } from 'playwright';
import { BotConfig } from '../bot';

export class GoogleMeetBot {
  constructor(private page: Page, private config: BotConfig) {}

  private isValidMeetUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'meet.google.com' && urlObj.pathname.length > 1;
    } catch {
      return false;
    }
  }

  private randomDelay(baseMs: number): number {
    return baseMs + Math.random() * 1000;
  }

  // Implementación exacta basada en Vexa.ai que funciona
  async join(): Promise<void> {
    console.log('🔗 Navegando a Google Meet...');
    
    try {
      // Validar URL antes de navegar
      if (!this.isValidMeetUrl(this.config.meetingUrl)) {
        throw new Error(`URL de meeting inválida: ${this.config.meetingUrl}`);
      }

      console.log(`📍 Accediendo a: ${this.config.meetingUrl}`);
      
      // Navegación exacta como Vexa
      await this.page.goto(this.config.meetingUrl, { 
        waitUntil: 'networkidle'
      });
      await this.page.bringToFront();

      // Espera crítica de Vexa - permite que los elementos se estabilicen
      console.log('⏳ Esperando que los elementos de la página se estabilicen...');
      await this.page.waitForTimeout(5000); // 5 segundos fijos

      // Ejecutar la lógica de unión de Vexa
      await this.joinMeetingVexa();

      // Esperar admisión a la reunión
      await this.waitForMeetingAdmission();

      console.log('✅ Bot se unió exitosamente a la reunión');

    } catch (error) {
      console.error('❌ Error uniéndose a Google Meet:', error);
      throw error;
    }
  }

  // Implementación exacta de joinMeeting de Vexa.ai
  private async joinMeetingVexa(): Promise<void> {
    // Selectores exactos de Vexa que están probados y funcionan
    const enterNameField = 'input[type="text"][aria-label="Your name"]';
    const joinButton = '//button[.//span[text()="Ask to join"]]';
    const muteButton = '[aria-label*="Turn off microphone"]';
    const cameraOffButton = '[aria-label*="Turn off camera"]';

    // Enter name and join - implementación exacta de Vexa
    await this.page.waitForTimeout(this.randomDelay(1000));
    console.log('🔍 Intentando encontrar campo de entrada de nombre...');
    
    // Timeout extendido crítico - Vexa usa 120 segundos
    await this.page.waitForSelector(enterNameField, { timeout: 120000 });
    console.log('✅ Campo de entrada de nombre encontrado.');

    await this.page.waitForTimeout(this.randomDelay(1000));
    await this.page.fill(enterNameField, this.config.botName);

    // Mutear micrófono y cámara si están disponibles - exactamente como Vexa
    try {
      await this.page.waitForTimeout(this.randomDelay(500));
      await this.page.click(muteButton, { timeout: 200 });
      await this.page.waitForTimeout(200);
    } catch (e) {
      console.log('🎤 Micrófono ya muteado o no encontrado.');
    }
    
    try {
      await this.page.waitForTimeout(this.randomDelay(500));
      await this.page.click(cameraOffButton, { timeout: 200 });
      await this.page.waitForTimeout(200);
    } catch (e) {
      console.log('📹 Cámara ya desactivada o no encontrada.');
    }

    // Hacer clic en el botón de unirse usando XPath como Vexa
    await this.page.waitForSelector(joinButton, { timeout: 60000 });
    await this.page.click(joinButton);
    console.log(`🚀 ${this.config.botName} se unió a la reunión.`);
  }

  // Función de espera de admisión de Vexa
  private async waitForMeetingAdmission(): Promise<boolean> {
    const leaveButton = `//button[@aria-label="Leave call"]`;
    
    try {
      // Vexa espera hasta 5 minutos para ser admitido
      await this.page.waitForSelector(leaveButton, { timeout: 300000 });
      console.log('✅ Admitido exitosamente en la reunión');
      return true;
    } catch {
      throw new Error('Bot no fue admitido en la reunión dentro del tiempo límite');
    }
  }

  // Métodos adicionales para compatibilidad
  async getParticipants(): Promise<string[]> {
    try {
      const participantElements = await this.page.$$('div[data-participant-id]');
      const participants: string[] = [];
      
      for (const element of participantElements) {
        const nameElement = await element.$('.notranslate');
        if (nameElement) {
          const name = await nameElement.textContent();
          if (name && name.trim()) {
            participants.push(name.trim());
          }
        }
      }
      
      return participants;
    } catch (error) {
      console.log(`Error obteniendo participantes: ${error}`);
      return [];
    }
  }

  async isMeetingActive(): Promise<boolean> {
    try {
      const leaveButton = await this.page.$(`//button[@aria-label="Leave call"]`);
      return leaveButton !== null;
    } catch {
      return false;
    }
  }

  async leave(): Promise<void> {
    console.log('🚪 Saliendo de la reunión...');
    
    try {
      const leaveButton = `//button[@aria-label="Leave call"]`;
      const leaveButtonElement = await this.page.$(leaveButton);
      
      if (leaveButtonElement) {
        await leaveButtonElement.click();
        console.log('✅ Botón de salir clickeado');
        
        // Esperar por posible botón de confirmación
        await this.page.waitForTimeout(1000);
        
        const confirmButton = await this.page.$('//button[.//span[text()="Leave meeting"]] | //button[.//span[text()="Just leave the meeting"]]');
        if (confirmButton) {
          await confirmButton.click();
          console.log('✅ Confirmación de salida clickeada');
        }
        
        console.log('✅ Bot salió de la reunión exitosamente');
      } else {
        console.log('⚠️ Botón de salir no encontrado');
      }
    } catch (error) {
      console.error(`❌ Error saliendo de la reunión: ${error}`);
      throw error;
    }
  }
}
