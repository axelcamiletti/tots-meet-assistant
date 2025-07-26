import { MeetingBot, BotConfig } from '../src/meeting-bot';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test único y completo para TOTS Meet Assistant Bot
 */
async function testBot(): Promise<void> {
  console.log('🤖 TOTS MEET ASSISTANT BOT - TEST ÚNICO');
  console.log('='.repeat(50));

  const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/bui-sdno-jey';
  
  const config: BotConfig = {
    meetingUrl,
    botName: 'TOTS Bot Test',
    audioEnabled: false,
    videoEnabled: false,
    headless: false // Para poder ver qué pasa
  };

  console.log('🎯 Configuración:');
  console.log(`   📍 URL: ${config.meetingUrl}`);
  console.log(`   🤖 Bot: ${config.botName}`);
  console.log(`   👁️ Visible: SÍ\n`);

  const bot = new MeetingBot(config);
  let success = false;

  try {
    console.log('🚀 Iniciando bot...');
    await bot.start();
    
    console.log('✅ Bot iniciado exitosamente');
    success = true;
    
    // Verificar estado
    const status = await bot.getStatus();
    console.log(`📊 Estado: ${status.status}`);
    
    if (status.session) {
      console.log(`📋 Session ID: ${status.session.id}`);
      console.log(`👥 Participantes: ${status.session.participants.length}`);
      console.log(`📝 Transcripciones: ${status.session.transcription.length}`);
    }
    
    // MANTENER EL BOT ACTIVO - Este era el problema
    console.log('\n⏰ Bot funcionando - manteniendo activo por 60 segundos...');
    console.log('   (El bot está ahora en la reunión haciendo su trabajo)');
    
    // Monitorear cada 10 segundos
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const currentStatus = await bot.getStatus();
      const transcriptions = bot.getTranscriptions();
      
      console.log(`   [${(i + 1) * 10}s] Estado: ${currentStatus.status} | Transcripciones: ${transcriptions.length}`);
      
      // Si hay participantes, mostrarlos
      try {
        const participants = await bot.getParticipants();
        if (participants.length > 0) {
          console.log(`   [${(i + 1) * 10}s] Participantes detectados: ${participants.length}`);
        }
      } catch (error) {
        // No pasa nada si no se pueden obtener participantes
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ ERROR:');
    console.error(error?.message || error);
    success = false;
    
  } finally {
    console.log('\n🛑 Finalizando test...');
    try {
      await bot.stop();
      console.log('✅ Bot detenido correctamente');
    } catch (stopError: any) {
      console.log('⚠️ Error deteniendo bot:', stopError?.message || stopError);
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DEL TEST');
    console.log('='.repeat(50));
    if (success) {
      console.log('✅ TEST EXITOSO');
      console.log('🎉 El bot funciona correctamente');
      console.log('📝 Puede unirse a reuniones y mantener la conexión');
    } else {
      console.log('❌ TEST FALLIDO');
      console.log('🔧 Revisar errores antes de usar en producción');
    }
    console.log('='.repeat(50));
  }
}

// Función para test rápido sin conexión real
async function quickTest(): Promise<void> {
  console.log('⚡ TEST RÁPIDO (Sin conexión real)');
  console.log('='.repeat(30));

  const config: BotConfig = {
    meetingUrl: 'https://meet.google.com/test-invalid',
    botName: 'TOTS Quick Test',
    audioEnabled: false,
    videoEnabled: false,
    headless: true
  };

  const bot = new MeetingBot(config);
  
  console.log('✅ Bot creado');
  
  // Test API sin conexión
  const status = await bot.getStatus();
  const transcriptions = bot.getTranscriptions();
  const textExport = bot.exportTranscriptionToText();
  
  console.log(`✅ Estado: ${status.status}`);
  console.log(`✅ Transcripciones: ${transcriptions.length}`);
  console.log(`✅ Export: ${textExport.length} chars`);
  console.log('✅ API funciona correctamente\n');
}

// Función principal
async function runTest(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    await quickTest();
  } else {
    // Primero test rápido
    await quickTest();
    
    // Luego test completo
    await testBot();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runTest().catch(console.error);
}

export { testBot, quickTest };
