/**
 * 🚀 Test completo del bot con Whisper
 * Este script prueba el flujo completo: Bot → Grabación → Whisper
 */

import { GoogleMeetBot } from './src/platforms/google-meet-bot.js';

async function testBotWithWhisper() {
  console.log('🤖 Iniciando prueba completa del bot con Whisper...\n');

  const bot = new GoogleMeetBot({
    meetingUrl: process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey',
    headless: false, // Mostrar navegador para ver el proceso
    audioEnabled: true,
    videoEnabled: true
  });

  try {
    // 1. Conectar a la reunión
    console.log('1. 🔗 Conectando a Google Meet...');
    await bot.joinMeeting();
    console.log('✅ Conectado exitosamente');

    // Esperar un poco para que cargue completamente
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 2. Iniciar grabación
    console.log('\n2. 🔴 Iniciando grabación...');
    await bot.toggleRecording(true);
    console.log('✅ Grabación iniciada');

    // 3. Simular actividad en la reunión (30 segundos)
    console.log('\n3. ⏱️ Simulando reunión por 30 segundos...');
    for (let i = 30; i > 0; i--) {
      process.stdout.write(`\r⏳ Tiempo restante: ${i} segundos`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n✅ Tiempo de grabación completado');

    // 4. Detener grabación (esto debería activar Whisper automáticamente)
    console.log('\n4. ⏹️ Deteniendo grabación y procesando con Whisper...');
    await bot.toggleRecording(false);
    console.log('✅ Grabación detenida, procesando con Whisper...');

    // 5. Esperar a que termine el procesamiento de Whisper
    console.log('\n5. 🔄 Esperando procesamiento de Whisper...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos para Whisper

    // 6. Obtener transcripciones
    console.log('\n6. 📝 Obteniendo transcripciones...');
    const transcriptions = bot.getTranscriptions();
    console.log('Transcripciones encontradas:', transcriptions.length);
    
    if (transcriptions.length > 0) {
      console.log('\n📄 Primera transcripción:');
      console.log(transcriptions[0]);
    }

    // 7. Obtener estadísticas de grabación
    console.log('\n7. 📊 Estadísticas de grabación:');
    const recordingStats = bot.getRecordingStats();
    console.log(recordingStats);

    // 8. Exportar transcripción
    if (transcriptions.length > 0) {
      console.log('\n8. 💾 Exportando transcripción...');
      const textExport = bot.exportTranscriptionToText();
      console.log('Exportación en texto:');
      console.log(textExport);
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    console.error('Stack:', error.stack);
  } finally {
    // 9. Limpiar recursos
    console.log('\n9. 🧹 Limpiando recursos...');
    await bot.cleanup();
    console.log('✅ Recursos limpiados');
  }
}

// Ejecutar prueba
testBotWithWhisper().catch(console.error);
