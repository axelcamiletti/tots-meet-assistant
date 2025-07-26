import { MeetingBot, BotConfig } from '../src/meeting-bot';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test de debugging específico para investigar el problema de unión
 */
async function debugConnectionIssue(): Promise<void> {
  console.log('🔍 DEBUGGING CONEXIÓN GOOGLE MEET');
  console.log('='.repeat(50));

  const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
  
  const config: BotConfig = {
    meetingUrl,
    botName: 'TOTS Debug Connection Bot',
    audioEnabled: false,
    videoEnabled: false,
    headless: false, // Queremos ver qué pasa
    slowMo: 1000     // Lento para observar
  };

  console.log('🎯 Configuración de debug:');
  console.log(`   📍 URL: ${config.meetingUrl}`);
  console.log(`   👁️ Visible: SÍ`);
  console.log(`   ⏱️ SlowMo: ${config.slowMo}ms\n`);

  const bot = new MeetingBot(config);

  try {
    console.log('🚀 Iniciando proceso de debugging...');
    
    // Iniciar el bot y capturar el error específico
    await bot.start();
    
    console.log('✅ Bot iniciado exitosamente - esto es inesperado');
    
    // Si llegamos aquí, el bot se conectó
    const status = await bot.getStatus();
    console.log(`📊 Estado: ${status.status}`);
    
    if (status.session) {
      console.log(`📋 Session ID: ${status.session.id}`);
      console.log(`👥 Participantes: ${status.session.participants.length}`);
    }
    
    // Mantener activo para observar
    console.log('⏰ Manteniendo activo por 15 segundos para observar...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error: any) {
    console.error('\n❌ ERROR CAPTURADO:');
    console.error('='.repeat(30));
    console.error(error?.message || error);
    console.error('\n📋 Tipo de error:', error?.constructor?.name || 'Unknown');
    
    // Información adicional de debugging
    try {
      const status = await bot.getStatus();
      console.log('\n🔍 Estado del bot después del error:');
      console.log(`   Status: ${status.status}`);
      console.log(`   Session: ${status.session ? 'Existe' : 'Null'}`);
      
      if (status.session) {
        console.log(`   Session ID: ${status.session.id}`);
        console.log(`   Session Status: ${status.session.status}`);
      }
    } catch (statusError) {
      console.log('⚠️ No se pudo obtener estado del bot');
    }
    
  } finally {
    console.log('\n🛑 Finalizando debug test...');
    try {
      await bot.stop();
      console.log('✅ Bot detenido correctamente');
    } catch (stopError: any) {
      console.log('⚠️ Error deteniendo bot:', stopError?.message || stopError);
    }
  }
}

// Función para debug manual de la página
async function debugPageManually(): Promise<void> {
  console.log('\n🔧 DEBUG MANUAL DE PÁGINA');
  console.log('='.repeat(50));
  
  const { chromium } = require('playwright');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
    
    console.log(`📍 Navegando a: ${meetingUrl}`);
    await page.goto(meetingUrl, { waitUntil: 'networkidle' });
    
    console.log('📄 Página cargada');
    await page.waitForTimeout(3000);
    
    // Inspeccionar elementos disponibles
    console.log('\n🔍 Inspeccionando elementos disponibles...');
    
    // Verificar si estamos en una página de error
    const pageTitle = await page.title();
    console.log(`📋 Título de página: "${pageTitle}"`);
    
    const currentUrl = page.url();
    console.log(`🔗 URL actual: ${currentUrl}`);
    
    // Buscar mensajes de error comunes
    const errorMessages = await page.$$eval('*', (elements: any[]) => {
      const texts: string[] = [];
      elements.forEach((el: any) => {
        const text = el.textContent?.trim();
        if (text && (
          text.includes('expired') || 
          text.includes('not found') || 
          text.includes('invalid') ||
          text.includes('ended') ||
          text.includes('expirado') ||
          text.includes('no encontrada') ||
          text.includes('terminada')
        )) {
          texts.push(text);
        }
      });
      return texts.slice(0, 5); // Solo los primeros 5
    });
    
    if (errorMessages.length > 0) {
      console.log('\n⚠️ Mensajes de error encontrados:');
      errorMessages.forEach((msg: string) => console.log(`   - ${msg}`));
    }
    
    // Buscar botones de unión
    const joinButtons = await page.$$eval('*', (elements: any[]) => {
      const buttons: any[] = [];
      elements.forEach((el: any) => {
        const text = el.textContent?.trim().toLowerCase();
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase();
        const role = el.getAttribute('role');
        
        if ((role === 'button' || el.tagName === 'BUTTON') && (
          text?.includes('join') || 
          text?.includes('unirse') ||
          ariaLabel?.includes('join') ||
          ariaLabel?.includes('unirse')
        )) {
          buttons.push({
            tag: el.tagName,
            text: text?.substring(0, 50),
            ariaLabel: ariaLabel?.substring(0, 50),
            role: role
          });
        }
      });
      return buttons.slice(0, 10); // Solo los primeros 10
    });
    
    if (joinButtons.length > 0) {
      console.log('\n🔘 Botones de unión encontrados:');
      joinButtons.forEach((btn: any, i: number) => {
        console.log(`   ${i + 1}. ${btn.tag} - "${btn.text}" - aria-label: "${btn.ariaLabel}"`);
      });
    } else {
      console.log('\n❌ No se encontraron botones de unión');
    }
    
    console.log('\n⏰ Página abierta por 30 segundos para inspección manual...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Error en debug manual:', error);
  } finally {
    await browser.close();
  }
}

// Ejecutar
async function runDebug(): Promise<void> {
  console.log('🚀 Iniciando debugging completo...\n');
  
  // Primero el debug del bot
  await debugConnectionIssue();
  
  // Luego el debug manual de la página
  await debugPageManually();
  
  console.log('\n✅ Debugging completado');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runDebug().catch(console.error);
}

export { debugConnectionIssue, debugPageManually };
