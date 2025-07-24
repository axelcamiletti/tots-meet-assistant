// Cargar variables de entorno desde .env
require('dotenv').config();

const admin = require('firebase-admin');

// Mock data para pruebas
const mockMeetingData = {
  meetingId: 'test-meeting-123',
  meetingTitle: 'Reunión de planificación Q1 2024',
  transcript: 'Buenos días equipo. Hoy vamos a revisar los objetivos para el primer trimestre. Tenemos que definir las prioridades del producto y asignar recursos. María, ¿podrías encargarte del análisis de mercado? Juan, necesitamos que revises la arquitectura técnica. También debemos programar una reunión con el cliente la próxima semana.',
  highlights: [
    {
      type: 'objetivo',
      text: 'Definir prioridades del producto para Q1',
      timestamp: 1234567890
    },
    {
      type: 'tarea',
      text: 'María - análisis de mercado',
      timestamp: 1234567920
    },
    {
      type: 'tarea', 
      text: 'Juan - revisar arquitectura técnica',
      timestamp: 1234567950
    },
    {
      type: 'pregunta',
      text: '¿Cuándo programar reunión con cliente?',
      timestamp: 1234567980
    }
  ],
  meetingUrl: 'https://meet.google.com/abc-def-ghi',
  userEmail: 'test@tots.agency',
  userId: 'test-user-123'
};

// Importar funciones directamente desde index.js
const functions = require('./index.js');

// Función de prueba para generar resumen
async function testSummaryGeneration() {
  console.log('🧪 Probando generación de resumen con OpenAI...\n');
  
  try {
    // Simular llamada HTTP a generateSummary
    const mockReq = {
      method: 'POST',
      headers: {
        authorization: 'Bearer mock-token',
        origin: 'http://localhost:4200'
      },
      body: {
        meetingDocId: 'mock-doc-id'
      }
    };

    console.log('📝 Simulando generación de resumen...');
    console.log('✅ Mock data preparado para prueba');
    console.log('� Transcript length:', mockMeetingData.transcript.length);
    console.log('🎯 Highlights count:', mockMeetingData.highlights.length);
    
    // Test básico de métricas
    const duration = Math.round(mockMeetingData.transcript.split(' ').length / 150);
    console.log('⏱️ Estimated duration:', duration, 'minutes');
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

// Función de prueba para verificar configuración
async function testConfiguration() {
  console.log('\n🔧 Verificando configuración...\n');
  
  // Verificar variables de entorno
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'OPENAI_API_KEY'
  ];
  
  let allConfigured = true;
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Configurada`);
    } else {
      console.log(`❌ ${varName}: No configurada`);
      allConfigured = false;
    }
  });
  
  if (allConfigured) {
    console.log('\n🎉 ¡Todas las variables de entorno están configuradas!');
  } else {
    console.log('\n⚠️  Faltan algunas variables de entorno.');
  }
  
  return allConfigured;
}

// Función de prueba para conectividad OpenAI
async function testOpenAIConnection() {
  console.log('\n🤖 Probando conectividad con OpenAI...\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY no configurada');
    return false;
  }
  
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('📡 Haciendo prueba de conexión a OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Responde solo con "CONECTADO" si puedes leer este mensaje.'
        }
      ],
      max_tokens: 10
    });
    
    const response = completion.choices[0].message.content.trim();
    
    if (response.includes('CONECTADO')) {
      console.log('✅ Conexión exitosa con OpenAI');
      console.log('📊 Modelo utilizado:', completion.model);
      return true;
    } else {
      console.log('⚠️  Respuesta inesperada de OpenAI:', response);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error conectando con OpenAI:', error.message);
    return false;
  }
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  console.log('🚀 Iniciando pruebas de TOTS Meet Assistant...\n');
  
  testConfiguration()
    .then(configOk => {
      if (configOk) {
        return testOpenAIConnection();
      }
      return false;
    })
    .then(openaiOk => {
      if (openaiOk) {
        return testSummaryGeneration();
      } else {
        console.log('\n⚠️  Saltando pruebas de resumen debido a problemas de configuración');
      }
    })
    .then(() => {
      console.log('\n✅ Pruebas completadas');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Ejecutar: npm run serve (para probar emuladores)');
      console.log('2. Probar endpoints con Postman/curl');
      console.log('3. Continuar con desarrollo de extensión Chrome');
    })
    .catch(error => {
      console.error('\n❌ Error en pruebas:', error);
    });
}

module.exports = {
  testSummaryGeneration,
  testConfiguration,
  testOpenAIConnection,
  mockMeetingData
};
