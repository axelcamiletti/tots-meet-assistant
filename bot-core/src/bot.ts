// DEPRECATED: Este archivo está siendo reemplazado por la nueva arquitectura modular
// Usar: import { MeetingBot } from './meeting-bot'; en su lugar

import { MeetingBot, BotConfig, MeetingSession } from './meeting-bot';

// Re-exportar para compatibilidad hacia atrás
export { MeetingBot, BotConfig, MeetingSession } from './meeting-bot';

// Función principal actualizada para usar la nueva arquitectura
async function main() {
  const meetingUrl = process.env.MEET_URL || 'https://meet.google.com/your-meeting-code';
  const botName = process.env.BOT_NAME || 'TOTS Notetaker';

  const config: BotConfig = {
    meetingUrl,
    botName,
    audioEnabled: false,
    videoEnabled: false,
    headless: false // Para debugging, cambiar a true en producción
  };

  console.log('🔄 Usando la nueva arquitectura modular del bot...');
  const bot = new MeetingBot(config);

  try {
    await bot.start();
    
    // Mantener el bot corriendo
    process.on('SIGINT', async () => {
      console.log('\n👋 Señal de interrupción recibida, cerrando bot...');
      await bot.stop();
      process.exit(0);
    });

    // Mantener el proceso vivo
    console.log('✅ Bot iniciado. Presiona Ctrl+C para detener.');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}
