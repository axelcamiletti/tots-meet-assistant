#!/usr/bin/env node

/**
 * 🧪 Pruebas HTTP para Cloud Functions - TOTS Meet Assistant
 * ==========================================================
 * Ejecuta: node test-http.js
 */

require('dotenv').config();
const https = require('https');
const http = require('http');

// Configuración de endpoints locales
const BASE_URL = 'http://127.0.0.1:5001/tots-meet-assistant/us-central1';

// Mock data para pruebas
const mockMeetingData = {
  meetingId: 'test-meeting-' + Date.now(),
  meetingTitle: 'Reunión de prueba HTTP',
  transcript: 'Esta es una prueba de transcripción para verificar que las Cloud Functions funcionan correctamente. Vamos a crear algunas tareas importantes y objetivos claros para el equipo.',
  highlights: [
    {
      type: 'objetivo',
      text: 'Verificar funcionamiento de Cloud Functions',
      timestamp: Date.now()
    },
    {
      type: 'tarea', 
      text: 'Completar pruebas de integración',
      timestamp: Date.now() + 1000
    }
  ],
  meetingUrl: 'https://meet.google.com/test-room',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 60000).toISOString()
};

// Función auxiliar para hacer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = BASE_URL + path;
    const urlObj = new URL(url);
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:4200'
    };
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: { ...defaultHeaders, ...headers }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Prueba 1: Guardar transcripción de reunión
async function testSaveMeetingTranscript() {
  console.log('\n🧪 Prueba 1: saveMeetingTranscript');
  console.log('=' .repeat(50));
  
  try {
    const response = await makeRequest('POST', '/saveMeetingTranscript', mockMeetingData, {
      'Authorization': 'Bearer mock-token-for-testing'
    });
    
    console.log('📡 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Prueba EXITOSA');
      return response.data.meetingDocId;
    } else {
      console.log('⚠️  Prueba con warnings:', response.data.error || 'Sin autenticación');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
    return null;
  }
}

// Prueba 2: Generar resumen con IA
async function testGenerateSummary(meetingDocId) {
  console.log('\n🧪 Prueba 2: generateSummary');
  console.log('=' .repeat(50));
  
  if (!meetingDocId) {
    console.log('⏭️  Saltando prueba - no hay meetingDocId');
    return;
  }
  
  try {
    const response = await makeRequest('POST', '/generateSummary', {
      meetingDocId: meetingDocId
    }, {
      'Authorization': 'Bearer mock-token-for-testing'
    });
    
    console.log('📡 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Prueba EXITOSA');
    } else {
      console.log('⚠️  Prueba con warnings:', response.data.error || 'Esperado sin autenticación');
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

// Prueba 3: Obtener reuniones
async function testGetMeetings() {
  console.log('\n🧪 Prueba 3: getMeetings');
  console.log('=' .repeat(50));
  
  try {
    const response = await makeRequest('GET', '/getMeetings?limit=5', null, {
      'Authorization': 'Bearer mock-token-for-testing'
    });
    
    console.log('📡 Status:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ Prueba EXITOSA');
    } else {
      console.log('⚠️  Prueba con warnings:', response.data.error || 'Esperado sin autenticación');
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

// Prueba 4: Verificar que endpoints estén activos
async function testEndpointsHealth() {
  console.log('\n🧪 Prueba 4: Health Check de Endpoints');
  console.log('=' .repeat(50));
  
  const endpoints = [
    '/saveMeetingTranscript',
    '/generateSummary', 
    '/getMeetings',
    '/updateMeeting',
    '/analyzeMeeting'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest('OPTIONS', endpoint);
      console.log(`📡 ${endpoint}: Status ${response.status} (${response.status < 500 ? '✅' : '❌'})`);
    } catch (error) {
      console.log(`📡 ${endpoint}: ❌ Error - ${error.message}`);
    }
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas HTTP para Cloud Functions...');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('\n📝 Nota: Estas pruebas requieren que los emuladores estén ejecutándose');
  console.log('   Ejecuta: npm run serve en otra terminal\n');
  
  try {
    // Verificar que el emulador esté corriendo
    await testEndpointsHealth();
    
    // Pruebas funcionales
    const meetingDocId = await testSaveMeetingTranscript();
    await testGenerateSummary(meetingDocId);
    await testGetMeetings();
    
    console.log('\n🎉 ¡Todas las pruebas HTTP completadas!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisar la UI del emulador: http://127.0.0.1:4000');
    console.log('2. Probar con herramientas como Postman o curl');
    console.log('3. Continuar con desarrollo de extensión Chrome');
    
  } catch (error) {
    console.error('\n❌ Error en ejecución de pruebas:', error);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  makeRequest,
  testSaveMeetingTranscript,
  testGenerateSummary,
  testGetMeetings,
  testEndpointsHealth,
  mockMeetingData
};
