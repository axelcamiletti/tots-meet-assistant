import { MeetingBot } from './bot';
import * as dotenv from 'dotenv';

dotenv.config();

async function testBot() {
  const config = {
    meetingUrl: process.env.MEET_URL || 'https://meet.google.com/xwq-opgb-req',
    botName: process.env.BOT_NAME || 'TOTS Notetaker',
    headless: false, // Para ver qué pasa
    audioEnabled: false,
    videoEnabled: false
  };

  console.log('🤖 Iniciando prueba del bot con transcripción...');
  console.log(`📍 URL de reunión: ${config.meetingUrl}`);
  console.log(`👤 Nombre del bot: ${config.botName}`);

  const bot = new MeetingBot(config);

  try {
    // Iniciar el bot (incluye navegador + unirse + transcripción)
    await bot.start();
    console.log('✅ Bot iniciado y conectado a la reunión');

    // Mostrar estado del bot cada 15 segundos
    const statusInterval = setInterval(async () => {
      const status = await bot.getStatus();
      const transcriptions = bot.getTranscriptions();
      const stats = bot.getTranscriptionStats();
      
      console.log('\n📊 === ESTADO DEL BOT ===');
      console.log(`Estado: ${status.status}`);
      console.log(`Sesión: ${status.session?.id}`);
      console.log(`Transcripción activa: ${stats?.isRecording ? '✅ SÍ' : '❌ NO'}`);
      console.log(`Total transcripciones: ${transcriptions.length}`);
      
      // Mostrar últimas 2 transcripciones si hay
      if (transcriptions.length > 0) {
        console.log('📝 Últimas transcripciones:');
        const recent = transcriptions.slice(-2);
        recent.forEach(t => {
          console.log(`  [${t.timestamp.toLocaleTimeString()}] ${t.speaker}: ${t.text}`);
        });
      } else {
        console.log('📝 Esperando transcripciones...');
      }
      console.log('========================\n');
    }, 15000);

    // Manejo de cierre con Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\n👋 Cerrando bot...');
      clearInterval(statusInterval);
      
      // Mostrar resumen final
      const finalTranscriptions = bot.getTranscriptions();
      const summary = bot.getTranscriptionSummary();
      
      if (finalTranscriptions.length > 0) {
        console.log('\n📄 === TRANSCRIPCIÓN FINAL ===');
        console.log(`Total entradas: ${summary?.totalEntries || 0}`);
        console.log(`Hablantes: ${summary?.speakers.join(', ') || 'N/A'}`);
        
        const exportText = bot.exportTranscriptionToText();
        console.log(exportText);
        console.log('=============================\n');
      } else {
        console.log('❌ No se capturaron transcripciones');
      }
      
      await bot.stop();
      process.exit(0);
    });

    console.log('✅ Bot activo. Las transcripciones aparecerán automáticamente.');
    console.log('🎤 Asegúrate de que haya conversación en la reunión.');
    console.log('⏹️ Presiona Ctrl+C para detener.');

    // Mantener el proceso vivo
    setInterval(() => {
      // Solo para mantener el proceso activo
    }, 1000);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    
    // Mostrar información de debug
    console.log('\n🔍 Información de debug:');
    console.log('- Revisar que la URL de la reunión sea correcta');
    console.log('- Verificar que la reunión esté activa');
    console.log('- Comprobar que hay conversación para transcribir');
    console.log('- Ver screenshots: debug-*.png');
    
    process.exit(1);
  }
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testBot().catch(console.error);
}
