/**
 * Test COMPLETO de transcripción en reunión REAL
 * Conecta a tu reunión de Google Meet y prueba grabación + transcripción
 */

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

import { GoogleMeetBot } from '../src/platforms/google-meet-bot';

async function testRealMeeting() {
  console.log('🎯 INICIANDO TEST EN REUNIÓN REAL');
  console.log('='.repeat(60));
  console.log('📺 Se abrirá un navegador y se conectará a tu reunión');
  console.log('🎤 Asegúrate de estar en la reunión y hablar algo');
  console.log('='.repeat(60));

  const bot = new GoogleMeetBot({
    meetingUrl: 'https://meet.google.com/dvw-akbq-qxv',
    botName: 'TOTS-Transcription-Bot',
    headless: false, // Ver el navegador
    audioEnabled: true,
    videoEnabled: false
  });

  try {
    console.log('');
    console.log('🚀 PASO 1: Iniciando bot y conectando a Google Meet...');
    console.log('⏳ Esto puede tomar unos segundos...');
    
    // Inicializar el bot primero
    await bot.start();
    console.log('✅ Bot iniciado exitosamente');
    console.log('✅ Navegador abierto y conectado a la reunión');
    
    // Esperar para estabilizar conexión
    console.log('⏳ Esperando 5 segundos para estabilizar conexión...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('');
    console.log('🔍 PASO 2: Verificando estado de la reunión...');
    
    const isMeetingActive = await bot.isMeetingActive();
    console.log(`📊 Reunión activa: ${isMeetingActive ? '✅ SÍ' : '❌ NO'}`);
    
    const participants = await bot.getParticipants();
    console.log(`👥 Participantes detectados: ${participants.length}`);
    if (participants.length > 0) {
      participants.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
    }
    
    console.log('');
    console.log('🔴 PASO 3: Iniciando grabación con micrófono...');
    console.log('⚠️  IMPORTANTE: Se solicitarán permisos para usar el micrófono');
    console.log('   👆 Acepta los permisos de micrófono en el navegador');
    console.log('   🎤 El bot capturará audio del micrófono del sistema');    await bot.toggleRecording(true);
    
    const isRecording = bot.isRecordingActive();
    if (isRecording) {
      console.log('✅ ¡Grabación iniciada exitosamente!');
      console.log('');
      console.log('🎤 PASO 4: Grabando audio por 15 segundos...');
      console.log('💬 HABLA ALGO EN LA REUNIÓN AHORA');
      console.log('📢 Prueba decir: "Hola, este es un test de transcripción"');
      
      // Countdown visual
      for (let i = 15; i > 0; i--) {
        console.log(`⏰ ${i} segundos restantes... ${i <= 5 ? '🔥' : '⏳'}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('');
      console.log('⏹️ PASO 5: Deteniendo grabación...');
      await bot.toggleRecording(false);
      console.log('✅ Grabación detenida');
      
      console.log('');
      console.log('🤖 PASO 6: Procesando con Whisper AI...');
      console.log('⏳ Esto puede tomar unos segundos...');
      
      // Esperar procesamiento
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      console.log('');
      console.log('📝 PASO 7: Obteniendo resultados...');
      
      const transcriptions = bot.getTranscriptions();
      const stats = bot.getTranscriptionStats();
      
      console.log('='.repeat(60));
      console.log('🎉 RESULTADOS DE LA TRANSCRIPCIÓN');
      console.log('='.repeat(60));
      
      if (transcriptions && transcriptions.length > 0) {
        console.log(`✅ Transcripciones obtenidas: ${transcriptions.length}`);
        console.log('');
        
        transcriptions.forEach((t, index) => {
          console.log(`📝 ${index + 1}. [${new Date(t.timestamp).toLocaleTimeString()}]`);
          console.log(`👤 Hablante: ${t.speaker}`);
          console.log(`💬 Texto: "${t.text}"`);
          if (t.confidence) {
            console.log(`🎯 Confianza: ${Math.round(t.confidence * 100)}%`);
          }
          console.log('─'.repeat(50));
        });
        
        console.log('');
        console.log('📊 ESTADÍSTICAS:');
        if (stats) {
          console.log(`📈 Total de transcripciones: ${stats.totalEntries || transcriptions.length}`);
          console.log(`🎤 Hablantes únicos: ${stats.uniqueSpeakers || new Set(transcriptions.map(t => t.speaker)).size}`);
          console.log(`👥 Hablantes: ${stats.speakers?.join(', ') || 'N/A'}`);
        }
        
        console.log('');
        console.log('📄 EXPORTACIÓN COMPLETA:');
        console.log('─'.repeat(50));
        const fullText = bot.exportTranscriptionToText();
        console.log(fullText);
        console.log('─'.repeat(50));
        
        console.log('');
        console.log('🎉 ¡TRANSCRIPCIÓN EXITOSA!');
        console.log('✅ El bot puede capturar audio real de Google Meet');
        console.log('✅ Whisper AI procesó el audio correctamente');
        console.log('✅ Sistema completamente funcional');
        
      } else {
        console.log('❌ No se obtuvieron transcripciones');
        console.log('');
        console.log('🔍 Posibles causas:');
        console.log('   • No hubo audio en la reunión');
        console.log('   • Los permisos de audio no se otorgaron');
        console.log('   • Error en el procesamiento de Whisper');
        console.log('   • Problema de conectividad');
        
        console.log('');
        console.log('🛠️ Para debuggear:');
        console.log('   1. Verifica que otorgaste permisos de audio');
        console.log('   2. Asegúrate de que hay audio en la reunión');
        console.log('   3. Revisa la configuración de OpenAI API Key');
      }
      
    } else {
      console.log('❌ No se pudo iniciar la grabación');
      console.log('🔍 Verifica que otorgaste los permisos de captura de pantalla');
    }
    
    console.log('');
    console.log('📂 ARCHIVOS GENERADOS:');
    const recordingDir = bot.getRecordingDirectory();
    console.log(`📁 Directorio: ${recordingDir}`);
    
  } catch (error) {
    console.error('');
    console.error('❌ ERROR EN LA PRUEBA:', error);
    console.error('');
    
    if (error instanceof Error) {
      if (error.message.includes('navigation')) {
        console.log('💡 Posible problema de navegación - verifica la URL de la reunión');
      } else if (error.message.includes('permission')) {
        console.log('💡 Problema de permisos - asegúrate de otorgar acceso a la pantalla/audio');
      } else if (error.message.includes('timeout')) {
        console.log('💡 Timeout - la reunión puede estar inactiva o tener problemas de conexión');
      }
    }
    
    throw error;
  } finally {
    console.log('');
    console.log('🔄 Cerrando navegador...');
    try {
      // Intentar cerrar limpiamente
      if (typeof (bot as any).cleanup === 'function') {
        await (bot as any).cleanup();
      }
    } catch (closeError) {
      console.log('⚠️ Error cerrando:', closeError);
    }
    console.log('✅ Test completado');
  }
}

export { testRealMeeting };
