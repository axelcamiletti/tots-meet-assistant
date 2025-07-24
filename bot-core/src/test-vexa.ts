import { MeetingBot } from './bot';
import * as dotenv from 'dotenv';

dotenv.config();

async function testBot() {
  const config = {
    meetingUrl: process.env.MEET_URL || 'https://meet.google.com/ekm-ncfn-xft',
    botName: process.env.BOT_NAME || 'TOTS Notetaker',
    headless: false, // Para ver qué pasa
    audioEnabled: false,
    videoEnabled: false
  };

  console.log('🤖 Iniciando prueba del bot...');
  console.log(`📍 URL de reunión: ${config.meetingUrl}`);
  console.log(`👤 Nombre del bot: ${config.botName}`);

  const bot = new MeetingBot(config);

  try {
    // Iniciar el navegador
    await bot.start();
    console.log('✅ Navegador iniciado');

    // Unirse a Google Meet
    await bot.joinGoogleMeet();
    console.log('✅ Bot se unió a la reunión');

    // Mantener el bot activo por 2 minutos para verificar
    console.log('⏱️ Manteniendo bot activo por 2 minutos...');
    await new Promise(resolve => setTimeout(resolve, 120000));

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    // Limpiar recursos
    try {
      await bot.stop();
      console.log('🧹 Recursos limpiados');
    } catch (error) {
      console.error('Error limpiando recursos:', error);
    }
  }
}

// Ejecutar test si es llamado directamente
if (require.main === module) {
  testBot().catch(console.error);
}
