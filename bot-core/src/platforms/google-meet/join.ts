/**
 * Google Meet - Lógica de unión a reuniones
 */

import { Page } from 'playwright';
import { BotConfig } from '../../types/bot.types';

export class GoogleMeetJoinModule {
  constructor(private page: Page, private config: BotConfig) {}

  async joinMeeting(): Promise<void> {
    return joinGoogleMeet(this.page, this.config.meetingUrl);
  }
}

export async function joinGoogleMeet(page: Page, meetingUrl: string): Promise<void> {
  console.log('🔗 Iniciando proceso de unión a Google Meet...');
  
  try {
    // 1. Navegar a la URL de la reunión
    console.log('🔗 Conectando a Google Meet...');
    await page.goto(meetingUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 2. Esperar a que cargue la página
    console.log('📄 Página cargada, esperando controles...');
    await page.waitForTimeout(3000);

    // 3. Configurar audio y video
    await configureAudioVideo(page);

    // 4. Configurar nombre
    await configureName(page);

    // 5. Unirse a la reunión
    await clickJoinButton(page);

    // 6. Esperar confirmación de que estamos en la reunión
    await waitForJoinConfirmation(page);

    console.log('✅ Unido a Google Meet exitosamente');

  } catch (error) {
    console.error('❌ Error uniéndose a Google Meet:', error);
    throw error;
  }
}

async function configureAudioVideo(page: Page): Promise<void> {
  console.log('🎛️ Configurando audio y video...');
  
  try {
    // Desactivar micrófono si está activo
    const micButton = page.locator('[data-is-muted="false"][aria-label*="micrófono"], [data-is-muted="false"][aria-label*="microphone"], button[aria-label*="Desactivar micrófono"], button[aria-label*="Turn off microphone"]');
    if (await micButton.isVisible({ timeout: 2000 })) {
      await micButton.click();
      console.log('🔇 Micrófono desactivado');
    }

    // Desactivar cámara si está activa
    const cameraButton = page.locator('[data-is-muted="false"][aria-label*="cámara"], [data-is-muted="false"][aria-label*="camera"], button[aria-label*="Desactivar cámara"], button[aria-label*="Turn off camera"]');
    if (await cameraButton.isVisible({ timeout: 2000 })) {
      await cameraButton.click();
      console.log('📹 Cámara desactivada');
    }

    console.log('✅ Audio y video configurados');
  } catch (error) {
    console.log('⚠️ No se pudieron configurar audio/video automáticamente');
  }
}

async function configureName(page: Page): Promise<void> {
  console.log('👤 Configurando nombre...');
  
  try {
    // Buscar campo de nombre
    const nameInput = page.locator('input[placeholder*="nombre"], input[placeholder*="name"], input[aria-label*="nombre"], input[aria-label*="name"]');
    
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('TOTS Bot Assistant');
      console.log('✅ Nombre configurado: TOTS Bot Assistant');
    } else {
      console.log('   ⚠️ No se encontró campo de nombre editable');
    }
  } catch (error) {
    console.log('   ⚠️ Error configurando nombre:', error instanceof Error ? error.message : String(error));
  }
}

async function clickJoinButton(page: Page): Promise<void> {
  console.log('🔘 Buscando botón para unirse...');
  
  try {
    // Lista de posibles selectores para el botón de unirse
    const joinButtonSelectors = [
      'button[aria-label*="Unirse ahora"]',
      'button[aria-label*="Join now"]', 
      'button[aria-label*="Solicitar unirse"]',
      'button[aria-label*="Ask to join"]',
      'button:has-text("Unirse ahora")',
      'button:has-text("Join now")',
      'button:has-text("Solicitar unirse")',
      'button:has-text("Ask to join")',
      '[data-mdc-dialog-action="ok"]',
      '[role="button"]:has-text("Unirse")',
      '[role="button"]:has-text("Join")'
    ];

    let buttonFound = false;
    
    for (const selector of joinButtonSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log(`✅ Botón de unirse presionado (${selector})`);
          buttonFound = true;
          break;
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }

    if (!buttonFound) {
      // Último intento: buscar cualquier botón que contenga texto relacionado
      const fallbackButton = page.locator('button').filter({ hasText: /unir|join|solicitar|ask/i });
      if (await fallbackButton.first().isVisible({ timeout: 2000 })) {
        await fallbackButton.first().click();
        console.log('✅ Botón de unirse encontrado (fallback)');
        buttonFound = true;
      }
    }

    if (!buttonFound) {
      throw new Error('No se encontró el botón para unirse a la reunión');
    }

    // Esperar un poco después de hacer clic
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('❌ Error haciendo clic en botón de unirse:', error);
    throw error;
  }
}

async function waitForJoinConfirmation(page: Page): Promise<void> {
  console.log('⏳ Esperando confirmación de unión...');
  
  try {
    // Esperar múltiples indicadores de que estamos en la reunión
    await Promise.race([
      /* // Opción 1: URL cambia para indicar que estamos en la reunión
      page.waitForFunction(() => {
        return window.location.href.includes('/meet.google.com/') && 
               !window.location.href.includes('authuser') &&
               document.querySelector('[data-meeting-title], [aria-label*="reunion"], [aria-label*="meeting"]');
      }, { timeout: 15000 }), */
      
      /* // Opción 2: Aparecen controles de la reunión
      page.waitForSelector([
        '[aria-label*="Activar micrófono"]',
        '[aria-label*="Turn on microphone"]',
        '[data-tooltip*="micrófono"]',
        '[data-tooltip*="microphone"]',
        '.wnPUne', // Clase de controles de Google Meet
        '[data-is-muted]'
      ].join(', '), { timeout: 15000 }), */
      
      // Opción 3: Aparece el área de participantes
      page.waitForSelector([
        '[aria-label*="Mostrar participantes"]',
        '[aria-label*="Show everyone"]',
        '[data-tab-id="1"]', // Tab de participantes
        '[aria-label*="People"]',
        '[aria-label*="Personas"]',
      ].join(', '), { timeout: 15000 }),
      
      // Opción 4: Aparece el botón de Leave
      page.waitForSelector([
        '[aria-label*="Salir de la llamada"]',
        '[aria-label*="Leave call"]',
      ].join(', '), { timeout: 15000 })
    ]);

    // Verificación adicional: comprobar que realmente estamos en la reunión
    const inMeeting = await page.evaluate(() => {
      // Buscar indicadores de que estamos en una reunión activa
      const meetingIndicators = [
        document.querySelector('[data-meeting-title]'),
        document.querySelector('[aria-label*="Salir de la llamada"]'),
        document.querySelector('[aria-label*="Leave call"]'),
        document.querySelector('[data-is-muted]'),
        document.querySelector('.wnPUne'), // Controles de Google Meet
        document.querySelector('[data-tab-id]') // Tabs de la reunión
      ];
      
      return meetingIndicators.some(indicator => indicator !== null);
    });

    if (inMeeting) {
      console.log('✅ Confirmación exitosa - estamos en la reunión');
    } else {
      console.log('⚠️ Confirmación parcial - verificando estado...');
      
      // Intentar una verificación adicional esperando un poco más
      await page.waitForTimeout(3000);
      
      const urlCheck = await page.url();
      if (urlCheck.includes('meet.google.com') && !urlCheck.includes('authuser')) {
        console.log('✅ Confirmación por URL - estamos en la reunión');
      } else {
        throw new Error('No se pudo confirmar la unión a la reunión');
      }
    }

    // Esperar un poco más para asegurar que la página esté completamente cargada
    await page.waitForTimeout(2000);
    console.log('✅ Unión confirmada y página estable');

  } catch (error) {
    console.error('❌ Error esperando confirmación de unión:', error);
    
    // Diagnóstico adicional
    const currentUrl = await page.url();
    console.log('URL actual:', currentUrl);
    
    const pageTitle = await page.title();
    console.log('Título de página:', pageTitle);
    
    throw new Error(`No se pudo confirmar la unión a la reunión. URL: ${currentUrl}`);
  }
}
