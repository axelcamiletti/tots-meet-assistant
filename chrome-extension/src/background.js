/**
 * 🔄 TOTS Meet Assistant - Background Service Worker
 */

console.log('🚀 TOTS Meet Assistant - Service Worker iniciado');

// Configuración del servidor bot
const BOT_SERVER_URL = 'http://127.0.0.1:3001';

// Manejar mensajes del content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('� Message received:', request);
  
  if (request.action === 'startBot') {
    handleStartBot(request.meetingId, request.meetingUrl)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'stopBot') {
    handleStopBot(request.meetingId)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'testConnection') {
    handleTestConnection()
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'startRecording') {
    handleStartRecording(request.meetingId)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'stopRecording') {
    handleStopRecording(request.meetingId)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Iniciar bot
async function handleStartBot(meetingId, meetingUrl) {
  console.log('🚀 Starting bot for meeting:', meetingId);
  
  const response = await fetch(`${BOT_SERVER_URL}/api/meetings/${meetingId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meetingUrl, meetingId })
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  
  return await response.json();
}

// Detener bot
async function handleStopBot(meetingId) {
  console.log('⏹️ Stopping bot for meeting:', meetingId);
  
  const response = await fetch(`${BOT_SERVER_URL}/api/meetings/${meetingId}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  
  return await response.json();
}

// Probar conexión
async function handleTestConnection() {
  console.log('🔍 Testing server connection...');
  
  const response = await fetch(`${BOT_SERVER_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  
  return await response.json();
}

// Iniciar grabación
async function handleStartRecording(meetingId) {
  console.log('🔴 Starting recording for meeting:', meetingId);
  
  const response = await fetch(`${BOT_SERVER_URL}/api/meetings/${meetingId}/recording/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  
  return await response.json();
}

// Detener grabación
async function handleStopRecording(meetingId) {
  console.log('⏹️ Stopping recording for meeting:', meetingId);
  
  const response = await fetch(`${BOT_SERVER_URL}/api/meetings/${meetingId}/recording/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  
  return await response.json();
}

// Detectar cuando se activa una pestaña de Meet
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
    console.log('📹 Meet detectado en pestaña:', tabId);
    handleMeetTab(tabId, tab.url);
  }
});

// Manejar pestaña de Meet
async function handleMeetTab(tabId, url) {
  const meetingId = extractMeetingId(url);
  
  if (meetingId && !activeMeetings.has(tabId)) {
    console.log('🆕 Nueva reunión detectada:', meetingId);
    
    // Registrar reunión activa
    activeMeetings.set(tabId, {
      meetingId,
      url,
      startTime: new Date(),
      transcript: [],
      highlights: []
    });
    
    // Inyectar content script si es necesario
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['src/content.js']
      });
    } catch (error) {
      console.log('Content script ya inyectado o error:', error.message);
    }
    
    // Mostrar notificación
    showMeetingStartNotification(meetingId);
  }
}

// Extraer ID de reunión de la URL
function extractMeetingId(url) {
  console.log('🔍 Extracting meeting ID from URL:', url);
  
  // Match Google Meet URLs with proper meeting ID format (abc-defg-hij)
  const matches = url.match(/meet\.google\.com\/([a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3})/i);
  
  if (matches) {
    console.log('✅ Meeting ID extracted:', matches[1]);
    return matches[1];
  }
  
  // Fallback: try to extract any code after meet.google.com/
  const fallbackMatches = url.match(/meet\.google\.com\/([^\/\?&#]+)/i);
  if (fallbackMatches && fallbackMatches[1] !== 'new') {
    console.log('⚠️ Meeting ID extracted (fallback):', fallbackMatches[1]);
    return fallbackMatches[1];
  }
  
  console.log('❌ No valid meeting ID found in URL');
  return null;
}

// Notificación de reunión iniciada
function showMeetingStartNotification(meetingId) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icon48.png',
    title: '📹 Reunión detectada',
    message: `TOTS Assistant está capturando la transcripción automáticamente.`,
    buttons: [
      { title: '👀 Ver transcripción' }
    ]
  });
}

// Detectar cuando se cierra una pestaña de Meet
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeMeetings.has(tabId)) {
    console.log('🔚 Reunión finalizada en pestaña:', tabId);
    handleMeetingEnd(tabId);
  }
});

// Manejar fin de reunión
async function handleMeetingEnd(tabId) {
  const meetingData = activeMeetings.get(tabId);
  
  if (meetingData) {
    meetingData.endTime = new Date();
    
    // Mostrar notificación de fin con opción de generar resumen
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon48.png',
      title: '✅ Reunión finalizada',
      message: 'Haz clic para generar resumen y ver transcripción completa.',
      buttons: [
        { title: '📝 Generar resumen' },
        { title: '👀 Ver transcripción' }
      ]
    });
    
    // Limpiar estado
    activeMeetings.delete(tabId);
    
    // Opcional: Enviar datos al backend automáticamente
    // await saveMeetingToBackend(meetingData);
  }
}

// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Mensaje recibido:', message.type);
  
  switch (message.type) {
    case 'TRANSCRIPT_UPDATE':
      handleTranscriptUpdate(sender.tab.id, message.data);
      break;
      
    case 'HIGHLIGHT_ADDED':
      handleHighlightAdded(sender.tab.id, message.data);
      break;
      
    case 'GENERATE_SUMMARY':
      handleGenerateSummary(sender.tab.id, message.data);
      break;
      
    case 'SAVE_MEETING':
      handleSaveMeeting(sender.tab.id, message.data);
      break;
      
    default:
      console.log('❓ Mensaje no reconocido:', message.type);
  }
  
  // Respuesta asíncrona
  return true;
});

// Actualizar transcripción
function handleTranscriptUpdate(tabId, data) {
  const meeting = activeMeetings.get(tabId);
  if (meeting) {
    meeting.transcript.push({
      text: data.text,
      timestamp: data.timestamp || Date.now(),
      speaker: data.speaker || 'unknown'
    });
    
    // Guardar en storage local para persistencia
    saveMeetingToStorage(tabId, meeting);
  }
}

// Agregar highlight
function handleHighlightAdded(tabId, data) {
  const meeting = activeMeetings.get(tabId);
  if (meeting) {
    meeting.highlights.push({
      type: data.type,
      text: data.text,
      timestamp: data.timestamp || Date.now(),
      transcriptIndex: meeting.transcript.length - 1
    });
    
    console.log(`🎯 Highlight agregado: ${data.type} - ${data.text}`);
    saveMeetingToStorage(tabId, meeting);
  }
}

// Generar resumen
async function handleGenerateSummary(tabId, data) {
  const meeting = activeMeetings.get(tabId);
  if (!meeting) return;
  
  try {
    console.log('🤖 Generando resumen para reunión:', meeting.meetingId);
    
    // Preparar datos para enviar al backend
    const meetingData = {
      meetingId: meeting.meetingId,
      meetingTitle: data.title || `Reunión ${meeting.meetingId}`,
      transcript: meeting.transcript.map(t => t.text).join(' '),
      highlights: meeting.highlights,
      meetingUrl: meeting.url,
      startTime: meeting.startTime.toISOString(),
      endTime: (meeting.endTime || new Date()).toISOString()
    };
    
    // TODO: Llamar al backend para generar resumen
    // const summary = await generateSummaryAPI(meetingData);
    
    // Por ahora, mostrar notificación de éxito
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon48.png',
      title: '✅ Resumen generado',
      message: 'El resumen está disponible en el panel web.'
    });
    
  } catch (error) {
    console.error('❌ Error generando resumen:', error);
  }
}

// Guardar reunión
async function handleSaveMeeting(tabId, data) {
  const meeting = activeMeetings.get(tabId);
  if (!meeting) return;
  
  try {
    console.log('💾 Guardando reunión:', meeting.meetingId);
    
    // TODO: Implementar guardado en backend
    console.log('Datos de reunión preparados:', {
      meetingId: meeting.meetingId,
      transcriptLength: meeting.transcript.length,
      highlightsCount: meeting.highlights.length
    });
    
  } catch (error) {
    console.error('❌ Error guardando reunión:', error);
  }
}

// Guardar en storage local
function saveMeetingToStorage(tabId, meetingData) {
  chrome.storage.local.set({
    [`meeting_${tabId}`]: meetingData
  });
}

// Manejar clics en notificaciones
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  console.log('🔔 Clic en notificación:', notificationId, buttonIndex);
  
  // TODO: Abrir panel web o mostrar resumen según el botón
  if (buttonIndex === 0) {
    // Primer botón - Generar resumen
    chrome.tabs.create({
      url: 'https://tots-meet-assistant.web.app'
    });
  }
});

console.log('✅ Service Worker configurado completamente');
