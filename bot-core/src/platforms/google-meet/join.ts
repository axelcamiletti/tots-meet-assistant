import { Page } from 'playwright';
import { BotConfig } from '../../types/bot.types';

export class GoogleMeetJoinModule {
  constructor(
    private page: Page,
    private config: BotConfig
  ) {}

  async joinMeeting(): Promise<void> {
    console.log('🔗 Conectando a Google Meet...');
    
    try {
      // Navegar a la URL de la reunión
      await this.page.goto(this.config.meetingUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      console.log('📄 Página cargada, esperando controles...');

      // Esperar a que la página esté lista
      await this.page.waitForTimeout(3000);

      // Configurar audio y video antes de unirse
      await this.configureAudioVideo();

      // Configurar nombre si es necesario
      await this.configureName();

      // Esperar y hacer clic en "Join now" o "Unirse ahora"
      await this.clickJoinButton();

      // Esperar confirmación de que se unió a la reunión
      await this.waitForJoinConfirmation();

      console.log('✅ Unido a Google Meet exitosamente');
    } catch (error) {
      console.error('❌ Error uniéndose a Google Meet:', error);
      throw error;
    }
  }

  private async configureAudioVideo(): Promise<void> {
    try {
      console.log('🎛️ Configurando audio y video...');

      // Selectores modernos para Google Meet (2024-2025)
      const micSelectors = [
        '[data-is-muted]', // Selector moderno principal
        'div[role="button"][aria-label*="microphone" i]',
        'div[role="button"][aria-label*="micrófono" i]',
        'button[aria-label*="microphone" i]',
        'button[aria-label*="micrófono" i]',
        '[jsname="BOHaEe"]', // Selector específico conocido
        'div[data-tooltip*="Turn on microphone" i]',
        'div[data-tooltip*="Turn off microphone" i]'
      ];

      const camSelectors = [
        'div[role="button"][aria-label*="camera" i]',
        'div[role="button"][aria-label*="cámara" i]', 
        'button[aria-label*="camera" i]',
        'button[aria-label*="cámara" i]',
        '[jsname="I5Fjmd"]', // Selector específico conocido
        'div[data-tooltip*="Turn on camera" i]',
        'div[data-tooltip*="Turn off camera" i]'
      ];

      // Intentar configurar micrófono
      if (!this.config.audioEnabled) {
        await this.toggleControl(micSelectors, false, 'micrófono');
      }

      // Intentar configurar cámara
      if (!this.config.videoEnabled) {
        await this.toggleControl(camSelectors, false, 'cámara');
      }

      console.log('✅ Audio y video configurados');
    } catch (error) {
      console.log('⚠️ No se pudieron configurar audio/video automáticamente:', (error as Error).message);
      console.log('   Continuando sin configuración automática...');
    }
  }

  private async toggleControl(selectors: string[], enable: boolean, controlName: string): Promise<void> {
    for (const selector of selectors) {
      try {
        const elements = await this.page.$$(selector);
        
        for (const element of elements) {
          // Verificar si es el control correcto
          const ariaLabel = await element.getAttribute('aria-label');
          const dataTooltip = await element.getAttribute('data-tooltip');
          
          if (ariaLabel?.toLowerCase().includes(controlName.toLowerCase()) || 
              dataTooltip?.toLowerCase().includes(controlName.toLowerCase())) {
            
            // Verificar estado actual
            const isMuted = await element.getAttribute('data-is-muted') === 'true' ||
                           ariaLabel?.toLowerCase().includes('turn on') ||
                           dataTooltip?.toLowerCase().includes('turn on');
            
            const shouldClick = (enable && isMuted) || (!enable && !isMuted);
            
            if (shouldClick) {
              await element.click();
              console.log(`   ✓ ${controlName} ${enable ? 'activado' : 'desactivado'}`);
              return;
            }
          }
        }
      } catch (error) {
        // Continuar con el siguiente selector
        continue;
      }
    }
    
    console.log(`   ⚠️ No se pudo configurar ${controlName} automáticamente`);
  }

  private async configureName(): Promise<void> {
    try {
      console.log('👤 Configurando nombre...');

      // Selectores para el campo de nombre
      const nameSelectors = [
        'input[placeholder*="name" i]',
        'input[placeholder*="nombre" i]',
        'input[aria-label*="name" i]',
        'input[aria-label*="nombre" i]',
        '[jsname="YPqjbf"]', // Selector específico conocido
        'input[type="text"]'
      ];

      for (const selector of nameSelectors) {
        try {
          const nameInput = await this.page.$(selector);
          if (nameInput) {
            // Verificar si el campo está visible y es editable
            const isVisible = await nameInput.isVisible();
            const isEditable = await nameInput.isEditable();
            
            if (isVisible && isEditable) {
              await nameInput.click({ clickCount: 3 }); // Seleccionar todo
              await nameInput.type(this.config.botName);
              console.log(`   ✓ Nombre configurado: ${this.config.botName}`);
              return;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log('   ⚠️ No se encontró campo de nombre editable');
    } catch (error) {
      console.log('   ⚠️ Error configurando nombre:', (error as Error).message);
    }
  }

  private async clickJoinButton(): Promise<void> {
    console.log('🔘 Buscando botón para unirse...');

    // Selectores modernos para el botón de unirse
    const joinSelectors = [
      'div[role="button"]:has-text("Join now")',
      'div[role="button"]:has-text("Unirse ahora")', 
      'button:has-text("Join now")',
      'button:has-text("Unirse ahora")',
      'div[role="button"]:has-text("Ask to join")',
      'div[role="button"]:has-text("Pedir unirse")',
      'button:has-text("Ask to join")',
      'button:has-text("Pedir unirse")',
      '[data-promo-anchor-id="join"]',
      '[jsname="Qx7uuf"]', // Selector específico conocido
      'div[role="button"][aria-label*="join" i]',
      'button[aria-label*="join" i]',
      'div[role="button"][aria-label*="unirse" i]',
      'button[aria-label*="unirse" i]'
    ];

    // Esperar a que aparezca algún botón de unirse
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const selector of joinSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            const isVisible = await button.isVisible();
            if (isVisible) {
              await button.click();
              console.log('✅ Botón de unirse presionado');
              await this.page.waitForTimeout(2000); // Esperar a que se procese
              return;
            }
          }
        } catch (error) {
          // Continuar con el siguiente selector
          continue;
        }
      }
      
      // Si no encontramos nada, esperar un poco más
      console.log(`   ⏳ Intento ${attempt + 1}/3 - Esperando botón de unirse...`);
      await this.page.waitForTimeout(3000);
    }

    // Si no se encuentra el botón, intentar con Enter o buscar por texto
    console.log('⚠️ No se encontró botón específico, intentando métodos alternativos...');
    
    try {
      // Método alternativo: buscar por texto
      await this.page.click('text="Join now"', { timeout: 5000 });
      console.log('✅ Unido usando texto "Join now"');
      return;
    } catch {}

    try {
      await this.page.click('text="Unirse ahora"', { timeout: 5000 });
      console.log('✅ Unido usando texto "Unirse ahora"');
      return;
    } catch {}

    // Último recurso: Enter
    console.log('⚠️ Intentando con Enter como último recurso...');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  private async waitForJoinConfirmation(): Promise<void> {
    console.log('⏳ Esperando confirmación de unión...');

    try {
      // Selectores modernos para confirmar que estamos en la reunión
      const confirmationSelectors = [
        'div[role="button"][aria-label*="leave call" i]',
        'div[role="button"][aria-label*="end call" i]',
        'div[role="button"][aria-label*="salir" i]',
        'button[aria-label*="leave call" i]',
        'button[aria-label*="end call" i]',
        'button[aria-label*="salir" i]',
        '[data-tooltip*="leave call" i]',
        '[data-tooltip*="end call" i]',
        '[data-tooltip*="salir" i]',
        '.call-controls',
        '[data-call-ended="false"]',
        '[jsname="CQylAd"]', // Selector específico del botón salir
        'div[role="button"][data-tooltip*="Leave call"]',
        'div[role="button"][data-tooltip*="Hang up"]'
      ];

      // Esperar con múltiples intentos
      let confirmed = false;
      for (let attempt = 0; attempt < 6; attempt++) { // 6 intentos = 30 segundos
        for (const selector of confirmationSelectors) {
          try {
            const element = await this.page.$(selector);
            if (element) {
              const isVisible = await element.isVisible();
              if (isVisible) {
                console.log(`✅ Confirmación de unión recibida (selector: ${selector})`);
                confirmed = true;
                break;
              }
            }
          } catch (error) {
            // Continuar con el siguiente selector
            continue;
          }
        }
        
        if (confirmed) break;
        
        // Verificar si estamos en la URL correcta de la reunión
        const currentUrl = this.page.url();
        if (currentUrl.includes('meet.google.com') && !currentUrl.includes('preview')) {
          console.log('✅ Confirmación por URL - estamos en la reunión');
          confirmed = true;
          break;
        }
        
        console.log(`   ⏳ Intento ${attempt + 1}/6 - Esperando confirmación...`);
        await this.page.waitForTimeout(5000);
      }

      if (!confirmed) {
        // Verificar si hay mensajes de error específicos
        const errorMessages = await this.page.$$eval('text=/meeting.*ended|reunion.*terminada|not.*found|no.*encontrada/i', 
          elements => elements.map(el => el.textContent));
        
        if (errorMessages.length > 0) {
          throw new Error(`Meeting error: ${errorMessages[0]}`);
        }
        
        throw new Error('Could not confirm meeting join - timeout reached');
      }

      // Esperar un poco más para asegurar que la página esté estable
      await this.page.waitForTimeout(3000);
      console.log('✅ Unión confirmada y página estable');

    } catch (error) {
      console.error('❌ No se pudo confirmar la unión a la reunión:', (error as Error).message);
      
      // Información de debug
      const currentUrl = this.page.url();
      console.log(`   Debug - URL actual: ${currentUrl}`);
      
      // Verificar si la página sigue activa
      try {
        await this.page.title();
      } catch (pageError) {
        console.log('   Debug - La página se cerró o no responde');
      }
      
      throw new Error('Failed to confirm meeting join');
    }
  }

  // Método para verificar si necesita permiso para unirse
  async needsPermissionToJoin(): Promise<boolean> {
    try {
      const permissionIndicators = await this.page.$$([
        'text="Waiting for the host"',
        'text="Esperando al anfitrión"',
        'text="Ask to join"',
        'text="Pedir unirse"'
      ].join(', '));

      return permissionIndicators.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Método para manejar casos donde se necesita permiso
  async handlePermissionRequest(): Promise<void> {
    if (await this.needsPermissionToJoin()) {
      console.log('🚪 Se requiere permiso para unirse, enviando solicitud...');
      
      try {
        const askButton = await this.page.waitForSelector(
          'button:has-text("Ask to join"), button:has-text("Pedir unirse")',
          { timeout: 5000 }
        );
        
        if (askButton) {
          await askButton.click();
          console.log('📨 Solicitud de unión enviada');
        }
      } catch (error) {
        console.log('⚠️ No se pudo enviar solicitud de unión automáticamente');
      }
    }
  }
}
