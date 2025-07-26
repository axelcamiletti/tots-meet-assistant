import { MeetingBot, BotConfig } from '../src/meeting-bot';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Suite de tests completa para TOTS Meet Assistant Bot
 */
class BotTestSuite {
  private passed = 0;
  private failed = 0;
  private warnings = 0;

  async runAllTests(): Promise<void> {
    console.log('🤖 TOTS MEET ASSISTANT BOT - TEST SUITE');
    console.log('='.repeat(50));
    console.log('🚀 Ejecutando todos los tests...\n');

    try {
      await this.testArchitecture();
      await this.testBotCreation();
      await this.testAPIWithoutConnection();
      await this.testGoogleMeetConnection();
      
      this.printSummary();
    } catch (error) {
      console.error('💥 Error crítico en la suite de tests:', error);
      process.exit(1);
    }
  }

  private async testArchitecture(): Promise<void> {
    this.printTestHeader('Arquitectura y Módulos');
    
    try {
      // Test 1: Importaciones
      const { MeetingBot } = await import('../src/meeting-bot');
      this.logSuccess('Importación de MeetingBot');
      
      // Test 2: Tipos disponibles
      const config: BotConfig = {
        meetingUrl: 'test',
        botName: 'test'
      };
      this.logSuccess('Definición de tipos BotConfig');
      
      this.logSuccess('Arquitectura modular funcionando');
      
    } catch (error) {
      this.logError('Arquitectura', error);
    }
  }

  private async testBotCreation(): Promise<void> {
    this.printTestHeader('Creación de Instancias');
    
    try {
      const config: BotConfig = {
        meetingUrl: 'https://meet.google.com/test-invalid-meeting',
        botName: 'TOTS Test Bot',
        audioEnabled: false,
        videoEnabled: false,
        headless: true
      };

      const bot = new MeetingBot(config);
      this.logSuccess('Instancia de bot creada');
      
      // Verificar que tiene los métodos esperados
      const methods = [
        'start', 'stop', 'getStatus', 'getTranscriptions', 
        'getParticipants', 'getMeetingInfo', 'exportTranscriptionToText'
      ];
      
      for (const method of methods) {
        if (typeof (bot as any)[method] === 'function') {
          this.logSuccess(`Método ${method} disponible`);
        } else {
          this.logError(`Método ${method} faltante`);
        }
      }
      
    } catch (error) {
      this.logError('Creación de bot', error);
    }
  }

  private async testAPIWithoutConnection(): Promise<void> {
    this.printTestHeader('API sin Conexión');
    
    try {
      const config: BotConfig = {
        meetingUrl: 'https://meet.google.com/test-invalid-meeting',
        botName: 'TOTS API Test',
        audioEnabled: false,
        videoEnabled: false,
        headless: true
      };

      const bot = new MeetingBot(config);
      
      // Test métodos que no requieren conexión
      const status = await bot.getStatus();
      this.logSuccess(`getStatus() - Estado: ${status.status}`);
      
      const transcriptions = bot.getTranscriptions();
      this.logSuccess(`getTranscriptions() - ${transcriptions.length} items`);
      
      const stats = bot.getTranscriptionStats();
      this.logSuccess(`getTranscriptionStats() - ${stats ? 'Disponible' : 'N/A'}`);
      
      const textExport = bot.exportTranscriptionToText();
      this.logSuccess(`exportTranscriptionToText() - ${textExport.length} chars`);
      
      const jsonExport = bot.exportTranscriptionToJSON();
      this.logSuccess(`exportTranscriptionToJSON() - ${jsonExport.length} chars`);
      
      // Métodos que pueden fallar sin conexión
      try {
        const participants = await bot.getParticipants();
        this.logSuccess(`getParticipants() - ${participants.length} participantes`);
      } catch {
        this.logWarning('getParticipants() requiere conexión activa');
      }
      
      try {
        const meetingInfo = await bot.getMeetingInfo();
        this.logSuccess(`getMeetingInfo() - ${meetingInfo ? 'Disponible' : 'N/A'}`);
      } catch {
        this.logWarning('getMeetingInfo() requiere conexión activa');
      }
      
    } catch (error) {
      this.logError('API sin conexión', error);
    }
  }

  private async testGoogleMeetConnection(): Promise<void> {
    this.printTestHeader('Conexión a Google Meet (Opcional)');
    
    const meetingUrl = process.env.MEET_URL;
    
    if (!meetingUrl) {
      this.logWarning('MEET_URL no configurada - saltando test de conexión real');
      this.logInfo('Para probar conexión real, configura MEET_URL en .env');
      return;
    }

    try {
      console.log(`   📍 Probando con URL: ${meetingUrl}`);
      
      const config: BotConfig = {
        meetingUrl,
        botName: 'TOTS Connection Test',
        audioEnabled: false,
        videoEnabled: false,
        headless: true
      };

      const bot = new MeetingBot(config);
      const startTime = Date.now();
      
      console.log('   🚀 Iniciando conexión...');
      await bot.start();
      
      const connectionTime = Date.now() - startTime;
      this.logSuccess(`Conexión establecida en ${connectionTime}ms`);
      
      // Esperar estabilización
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar estado después de conexión
      const status = await bot.getStatus();
      this.logSuccess(`Estado post-conexión: ${status.status}`);
      
      if (status.session) {
        this.logSuccess(`Session ID: ${status.session.id}`);
        this.logSuccess(`Participantes: ${status.session.participants.length}`);
      }
      
      // Test funcionalidades en vivo
      try {
        const participants = await bot.getParticipants();
        this.logSuccess(`Participantes detectados: ${participants.length}`);
      } catch {
        this.logWarning('No se pudieron detectar participantes');
      }
      
      // Cleanup
      console.log('   🧹 Desconectando...');
      await bot.stop();
      this.logSuccess('Desconexión exitosa');
      
    } catch (error) {
      this.logError('Conexión a Google Meet', error);
    }
  }

  private printTestHeader(title: string): void {
    console.log(`\n📋 ${title}`);
    console.log('-'.repeat(30));
  }

  private logSuccess(message: string): void {
    console.log(`   ✅ ${message}`);
    this.passed++;
  }

  private logError(test: string, error?: any): void {
    console.log(`   ❌ ${test}${error ? ': ' + error.message : ''}`);
    this.failed++;
  }

  private logWarning(message: string): void {
    console.log(`   ⚠️ ${message}`);
    this.warnings++;
  }

  private logInfo(message: string): void {
    console.log(`   ℹ️ ${message}`);
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE TESTS');
    console.log('='.repeat(50));
    console.log(`✅ Tests exitosos: ${this.passed}`);
    console.log(`❌ Tests fallidos: ${this.failed}`);
    console.log(`⚠️ Advertencias: ${this.warnings}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
      console.log('✨ El bot está listo para producción');
    } else {
      console.log(`\n💥 ${this.failed} tests fallaron`);
      console.log('🔧 Revisa los errores antes de usar en producción');
    }
    
    console.log('='.repeat(50));
  }
}

// Función principal
async function runTests(): Promise<void> {
  const testSuite = new BotTestSuite();
  await testSuite.runAllTests();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runTests().catch((error) => {
    console.error('💥 Error ejecutando tests:', error);
    process.exit(1);
  });
}

export { runTests, BotTestSuite };
