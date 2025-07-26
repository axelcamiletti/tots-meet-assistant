import { MeetingBot, BotConfig } from '../src/meeting-bot';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Test de debugging visual - Para desarrollo y debugging
 * Ejecutar con: npm run test:debug
 */
async function debugTest(): Promise<void> {
  console.log('🔍 TOTS DEBUG TEST');
  console.log('='.repeat(30));
  console.log('👀 Browser visible para debugging\n');

  const meetingUrl = process.env.MEET_URL;
  
  if (!meetingUrl) {
    console.log('❌ Error: MEET_URL no configurada en .env');
    console.log('   Configura MEET_URL=https://meet.google.com/xxx-xxxx-xxx');
    return;
  }

  const config: BotConfig = {
    meetingUrl,
    botName: 'TOTS Debug Bot',
    audioEnabled: false,
    videoEnabled: false,
    headless: false, // 👀 Browser visible
    slowMo: 500     // Movimientos lentos
  };

  console.log('🎯 Configuración de debug:');
  console.log(`   📍 URL: ${config.meetingUrl}`);
  console.log(`   🤖 Bot: ${config.botName}`);
  console.log(`   👁️ Visible: SÍ`);
  console.log(`   ⏱️ SlowMo: ${config.slowMo}ms\n`);

  const bot = new MeetingBot(config);

  try {
    console.log('🚀 Iniciando debug con browser visible...');
    await bot.start();
    
    console.log('✅ Bot iniciado - observa el browser');
    console.log('⏰ Manteniendo activo por 30 segundos para debugging...');
    
    // Mostrar estado cada 5 segundos
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const status = await bot.getStatus();
      console.log(`   [${(i + 1) * 5}s] Estado: ${status.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error en debug test:', error);
  } finally {
    console.log('\n🛑 Cerrando debug test...');
    await bot.stop();
    console.log('✅ Debug test finalizado');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugTest().catch(console.error);
}

export { debugTest };
