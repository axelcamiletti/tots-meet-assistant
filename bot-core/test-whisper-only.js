/**
 * Test Whisper con archivo de audio real
 */

const { WhisperTranscriptionModule } = require('./dist/src/modules/whisper-transcription-module.js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

async function testWhisperWithRealAudio() {
  console.log('🎵 Probando Whisper con archivo de audio de prueba...\n');

  try {
    // 1. Crear módulo de transcripción
    const whisperModule = new WhisperTranscriptionModule({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'whisper-1',
      language: 'es',
      prompt: 'Esta es una reunión de negocios en español.'
    });

    // 2. Crear un directorio para la prueba
    const testDir = 'test-audio';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }

    // 3. En lugar de un archivo de audio real, vamos a simular con un archivo de texto
    // que Whisper puede manejar, o mejor, descargar un audio de prueba pequeño
    
    console.log('📄 Creando archivo de audio de prueba...');
    
    // Vamos a crear un archivo de audio WAV simple con silencio
    // Esto es solo para probar la integración con Whisper API
    const audioPath = path.join(testDir, 'test-audio.wav');
    
    // Crear un archivo WAV mínimo válido (44 bytes de header + 1 segundo de silencio)
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, // "RIFF"
      0x24, 0x00, 0x00, 0x00, // Tamaño del archivo - 8
      0x57, 0x41, 0x56, 0x45, // "WAVE"
      0x66, 0x6D, 0x74, 0x20, // "fmt "
      0x10, 0x00, 0x00, 0x00, // Tamaño del chunk fmt
      0x01, 0x00,             // Formato PCM
      0x01, 0x00,             // Mono
      0x44, 0xAC, 0x00, 0x00, // Sample rate 44100
      0x88, 0x58, 0x01, 0x00, // Byte rate
      0x02, 0x00,             // Block align
      0x10, 0x00,             // Bits per sample
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00  // Data size (será actualizado)
    ]);

    // Crear 1 segundo de silencio (44100 samples * 2 bytes)
    const silenceData = Buffer.alloc(44100 * 2, 0);
    
    // Actualizar el tamaño en el header
    wavHeader.writeUInt32LE(36 + silenceData.length, 4); // Tamaño total - 8
    wavHeader.writeUInt32LE(silenceData.length, 40);     // Tamaño de datos

    // Escribir el archivo
    fs.writeFileSync(audioPath, Buffer.concat([wavHeader, silenceData]));
    console.log(`✅ Archivo de audio creado: ${audioPath}`);

    // 4. Probar transcripción
    console.log('\n🔄 Enviando a Whisper API...');
    const result = await whisperModule.transcribeAudioFile(audioPath);
    
    console.log('\n📝 Resultado de Whisper:');
    console.log('Transcripción:', result.text || 'Sin texto detectado');
    console.log('Idioma detectado:', result.language);
    console.log('Duración:', result.duration);

    // 5. Limpiar
    fs.unlinkSync(audioPath);
    fs.rmdirSync(testDir);

    console.log('\n🎉 ¡Prueba de Whisper completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error en prueba de Whisper:', error.message);
    if (error.message.includes('API')) {
      console.error('Detalles:', error.message);
    }
  }
}

testWhisperWithRealAudio().catch(console.error);
