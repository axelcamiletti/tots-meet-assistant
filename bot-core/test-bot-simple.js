/**
 * 🚀 Test del bot con Whisper (JavaScript)
 */

const { GoogleMeetBot } = require('./dist/src/platforms/google-meet-bot.js');

async function testBot() {
  console.log('🤖 Iniciando prueba del bot con Whisper...\n');

  const bot = new GoogleMeetBot({
    meetingUrl: process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey',
    headless: false,
    audioEnabled: true,
    videoEnabled: true
  });

  try {
    // 0. Inicializar el bot
    console.log('0. ⚙️ Iniciando bot...');
    await bot.start();
    console.log('✅ Bot iniciado exitosamente');

    // Esperar un poco
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 2. Mostrar estado detallado
    console.log('\n2. 📊 Estado detallado del bot:');
    const status = await bot.getDetailedStatus();
    console.log(JSON.stringify(status, null, 2));

    // 3. Iniciar grabación
    console.log('\n3. 🔴 Iniciando grabación...');
    await bot.toggleRecording(true);
    console.log('✅ Grabación iniciada');

    // 4. Verificar estado de grabación
    console.log('\n4. 📹 Verificando estado de grabación:');
    console.log('¿Grabando?', bot.isRecordingActive());
    console.log('Directorio:', bot.getRecordingDirectory());

    // 5. Simular reunión (15 segundos)
    console.log('\n5. ⏱️ Simulando reunión por 15 segundos...');
    for (let i = 15; i > 0; i--) {
      process.stdout.write(`\r⏳ ${i}s `);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n');

    // 6. Detener grabación
    console.log('6. ⏹️ Deteniendo grabación...');
    await bot.toggleRecording(false);
    console.log('✅ Grabación detenida');

    // 7. Esperar procesamiento Whisper
    console.log('\n7. 🔄 Esperando procesamiento Whisper (10s)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 8. Verificar transcripciones
    console.log('\n8. 📝 Verificando transcripciones...');
    const transcriptions = bot.getTranscriptions();
    console.log(`Encontradas: ${transcriptions.length} transcripciones`);

    // 9. Mostrar estadísticas
    console.log('\n9. 📊 Estadísticas finales:');
    const recordingStats = bot.getRecordingStats();
    console.log('Grabación:', recordingStats);
    
    const transcriptionStats = bot.getTranscriptionStats();
    console.log('Transcripción:', transcriptionStats);

    console.log('\n🎉 ¡Prueba completada!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    console.log('\n🧹 Limpiando...');
    await bot.cleanup();
  }
}

// Cargar variables de entorno
require('dotenv').config();

// Ejecutar
testBot().catch(console.error);
