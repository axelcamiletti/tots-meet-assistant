/**
 * Test específico para verificar que el micrófono funciona en Playwright
 */

import dotenv from 'dotenv';
dotenv.config();

import { GoogleMeetBot } from '../src/platforms/google-meet-bot';

async function testMicrophone() {
  console.log('🎤 INICIANDO TEST DE MICRÓFONO');
  console.log('='.repeat(50));

  const bot = new GoogleMeetBot({
    meetingUrl: 'https://meet.google.com/dvw-akbq-qxv',
    botName: 'Test-Microphone-Bot',
    headless: false,
    audioEnabled: true,
    videoEnabled: false
  });

  try {
    console.log('🚀 Iniciando bot...');
    await bot.start();
    
    console.log('✅ Bot unido exitosamente');
    console.log('🎤 Probando grabación de micrófono...');
    
    // Intentar iniciar grabación para probar el micrófono
    try {
      await bot.toggleRecording(true);
      console.log('✅ Grabación iniciada exitosamente');
      
      // Esperar un poco para capturar algo de audio
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Detener grabación
      await bot.toggleRecording(false);
      console.log('✅ Grabación detenida');
      
      console.log('✅ Test de micrófono completado exitosamente');
      
    } catch (recordingError) {
      console.error('❌ Error en grabación:', recordingError);
    }

  } catch (error) {
    console.error('❌ ERROR EN TEST:', error);
  } finally {
    console.log('🔄 Test completado');
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testMicrophone().catch(error => {
    console.error('💥 TEST FALLÓ:', error);
    process.exit(1);
  });
}

export { testMicrophone };
