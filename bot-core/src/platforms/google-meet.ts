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
    console.log('🔗 [DEBUG] Navegando a Google Meet...');
    
    try {
      // Validar URL antes de navegar
      console.log('🔍 [DEBUG] Validando URL...');
      if (!this.isValidMeetUrl(this.config.meetingUrl)) {
        throw new Error(`URL de meeting inválida: ${this.config.meetingUrl}`);
      }
      console.log('✅ [DEBUG] URL válida');

      console.log(`📍 [DEBUG] Accediendo a: ${this.config.meetingUrl}`);
      
      // Verificar estado de la página antes de navegar
      console.log('🔍 [DEBUG] Verificando estado de la página...');
      console.log(`📊 [DEBUG] Página cerrada: ${this.page.isClosed()}`);
      console.log(`🌐 [DEBUG] URL actual: ${this.page.url()}`);
      
      // Navegación exacta como Vexa
      console.log('🚀 [DEBUG] Iniciando navegación...');
      const response = await this.page.goto(this.config.meetingUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 // Timeout más corto para debugging
      });
      
      console.log(`📡 [DEBUG] Respuesta HTTP: ${response?.status()}`);
      console.log(`🌐 [DEBUG] URL después de navegación: ${this.page.url()}`);
      
      await this.page.bringToFront();
      console.log('👁️ [DEBUG] Página traída al frente');

      // Tomar screenshot para debug
      await this.page.screenshot({ path: 'debug-after-navigation.png' });
      console.log('📸 [DEBUG] Screenshot guardado: debug-after-navigation.png');

      // Espera crítica de Vexa - permite que los elementos se estabilicen
      console.log('⏳ [DEBUG] Esperando que los elementos de la página se estabilicen...');
      await this.page.waitForTimeout(5000); // 5 segundos fijos
      console.log('✅ [DEBUG] Página estabilizada');

      // Verificar si la página sigue abierta
      console.log(`📊 [DEBUG] Página cerrada después de espera: ${this.page.isClosed()}`);

      // Ejecutar la lógica de unión de Vexa
      console.log('🔧 [DEBUG] Iniciando lógica de unión...');
      await this.joinMeetingVexa();

      // Esperar admisión a la reunión
      console.log('⏳ [DEBUG] Esperando admisión...');
      await this.waitForMeetingAdmission();

      console.log('✅ Bot se unió exitosamente a la reunión');

    } catch (error) {
      console.error('❌ Error uniéndose a Google Meet:', error);
      throw error;
    }
  }

  // Implementación exacta de joinMeeting de Vexa.ai
  private async joinMeetingVexa(): Promise<void> {
    console.log('🔧 [DEBUG] Iniciando joinMeetingVexa...');
    
    // Verificar estado de la página al inicio
    console.log(`📊 [DEBUG] Página cerrada al inicio de joinMeetingVexa: ${this.page.isClosed()}`);
    
    // Selectores que funcionan en inglés y español
    const enterNameField = 'input[type="text"][aria-label*="name"], input[type="text"][aria-label*="nombre"]';
    const joinButton = '//button[.//span[contains(text(),"Ask to join") or contains(text(),"Solicitar unirse") or contains(text(),"Pedir unirse")]]';
    const muteButton = '[aria-label*="Turn off microphone"], [aria-label*="Desactivar micrófono"]';
    const cameraOffButton = '[aria-label*="Turn off camera"], [aria-label*="Desactivar cámara"]';

    console.log('📝 [DEBUG] Selectores definidos');

    // Enter name and join - implementación exacta de Vexa
    const delay = this.randomDelay(1000);
    console.log(`⏰ [DEBUG] Esperando ${delay}ms antes de buscar campo de nombre...`);
    await this.page.waitForTimeout(delay);
    
    console.log('🔍 [DEBUG] Intentando encontrar campo de entrada de nombre...');
    console.log(`🎯 [DEBUG] Selector usado: ${enterNameField}`);
    
    // Verificar estado antes de waitForSelector
    console.log(`📊 [DEBUG] Página cerrada antes de waitForSelector: ${this.page.isClosed()}`);
    
    try {
      // Timeout extendido crítico - Vexa usa 120 segundos
      console.log('⏳ [DEBUG] Iniciando waitForSelector con timeout de 120 segundos...');
      await this.page.waitForSelector(enterNameField, { timeout: 120000 });
      console.log('✅ [DEBUG] Campo de entrada de nombre encontrado.');
    } catch (error) {
      console.error(`❌ [DEBUG] Error en waitForSelector: ${error}`);
      
      // Tomar screenshot para debug
      try {
        await this.page.screenshot({ path: 'debug-selector-error.png' });
        console.log('📸 [DEBUG] Screenshot de error guardado: debug-selector-error.png');
      } catch (screenshotError) {
        console.error(`❌ [DEBUG] Error tomando screenshot: ${screenshotError}`);
      }
      
      // Buscar todos los inputs disponibles para debug
      try {
        const allInputs = await this.page.$$('input');
        console.log(`🔍 [DEBUG] Encontrados ${allInputs.length} elementos input en la página`);
        
        for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
          const input = allInputs[i];
          const type = await input.getAttribute('type');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');
          console.log(`📝 [DEBUG] Input ${i + 1}: type="${type}", aria-label="${ariaLabel}", placeholder="${placeholder}"`);
        }
      } catch (inputError) {
        console.error(`❌ [DEBUG] Error listando inputs: ${inputError}`);
      }
      
      throw error;
    }

    console.log(`📊 [DEBUG] Página cerrada después de encontrar campo: ${this.page.isClosed()}`);

    const delay2 = this.randomDelay(1000);
    console.log(`⏰ [DEBUG] Esperando ${delay2}ms antes de llenar campo...`);
    await this.page.waitForTimeout(delay2);
    
    console.log(`✍️ [DEBUG] Llenando campo con nombre: "${this.config.botName}"`);
    await this.page.fill(enterNameField, this.config.botName);
    console.log('✅ [DEBUG] Campo de nombre llenado');

    // Mutear micrófono y cámara si están disponibles - exactamente como Vexa
    console.log('🎤 [DEBUG] Intentando mutear micrófono...');
    try {
      await this.page.waitForTimeout(this.randomDelay(500));
      await this.page.click(muteButton, { timeout: 200 });
      await this.page.waitForTimeout(200);
      console.log('✅ [DEBUG] Micrófono muteado');
    } catch (e) {
      console.log('🎤 [DEBUG] Micrófono ya muteado o no encontrado.');
    }
    
    console.log('📹 [DEBUG] Intentando desactivar cámara...');
    try {
      await this.page.waitForTimeout(this.randomDelay(500));
      await this.page.click(cameraOffButton, { timeout: 200 });
      await this.page.waitForTimeout(200);
      console.log('✅ [DEBUG] Cámara desactivada');
    } catch (e) {
      console.log('📹 [DEBUG] Cámara ya desactivada o no encontrada.');
    }

    // Hacer clic en el botón de unirse usando XPath como Vexa
    console.log('🚪 [DEBUG] Buscando botón de unirse...');
    console.log(`🎯 [DEBUG] Selector XPath usado: ${joinButton}`);
    
    try {
      await this.page.waitForSelector(joinButton, { timeout: 60000 });
      console.log('✅ [DEBUG] Botón de unirse encontrado');
      
      await this.page.click(joinButton);
      console.log(`🚀 [DEBUG] Clic en botón de unirse ejecutado - ${this.config.botName} intentando unirse...`);
    } catch (error) {
      console.error(`❌ [DEBUG] Error con botón de unirse: ${error}`);
      
      // Buscar botones alternativos
      try {
        const allButtons = await this.page.$$('button');
        console.log(`🔍 [DEBUG] Encontrados ${allButtons.length} botones en la página`);
        
        for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
          const button = allButtons[i];
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          console.log(`🔘 [DEBUG] Botón ${i + 1}: text="${text?.trim()}", aria-label="${ariaLabel}"`);
        }
      } catch (buttonError) {
        console.error(`❌ [DEBUG] Error listando botones: ${buttonError}`);
      }
      
      throw error;
    }
  }

  // Función de espera de admisión de Vexa
  private async waitForMeetingAdmission(): Promise<boolean> {
    console.log('⏳ [DEBUG] Iniciando espera de admisión...');
    const leaveButton = `//button[@aria-label="Leave call"]`;
    console.log(`🎯 [DEBUG] Buscando botón de salir: ${leaveButton}`);
    
    // Verificar estado de la página
    console.log(`📊 [DEBUG] Página cerrada al inicio de waitForMeetingAdmission: ${this.page.isClosed()}`);
    
    try {
      console.log('⏰ [DEBUG] Esperando hasta 5 minutos para ser admitido...');
      // Vexa espera hasta 5 minutos para ser admitido
      await this.page.waitForSelector(leaveButton, { timeout: 300000 });
      console.log('✅ [DEBUG] Botón de salir encontrado - Admitido exitosamente en la reunión');
      return true;
    } catch (error) {
      console.error(`❌ [DEBUG] Error en waitForMeetingAdmission: ${error}`);
      
      // Tomar screenshot final para debug
      try {
        await this.page.screenshot({ path: 'debug-admission-failed.png' });
        console.log('📸 [DEBUG] Screenshot de fallo de admisión guardado: debug-admission-failed.png');
      } catch (screenshotError) {
        console.error(`❌ [DEBUG] Error tomando screenshot final: ${screenshotError}`);
      }
      
      // Buscar indicadores de sala de espera o errores
      try {
        const waitingRoom = await this.page.$('text="Waiting for the meeting host"');
        if (waitingRoom) {
          console.log('⏰ [DEBUG] El bot está en sala de espera');
        }
        
        const errorMessages = await this.page.$$('text="can\'t join this video call"');
        if (errorMessages.length > 0) {
          console.log('❌ [DEBUG] Mensaje de error detectado: No se puede unir a la videollamada');
        }
        
        const currentUrl = this.page.url();
        console.log(`🌐 [DEBUG] URL actual durante error de admisión: ${currentUrl}`);
      } catch (debugError) {
        console.error(`❌ [DEBUG] Error en debugging de admisión: ${debugError}`);
      }
      
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
