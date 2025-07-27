console.log('🚀 TOTS Assistant content script loaded!');

// Config
const CONFIG = {
  SIDEBAR_ID: 'tots-sidebar',
  BOT_SERVER_URL: 'http://127.0.0.1:3001'
};

// State
let totsState = {
  meetingId: null,
  botActive: false,
  recordingActive: false,
  sidebar: null,
  recordingIndicator: null
};

// ===== MAIN INIT =====
async function initTOTSAssistant() {
  console.log('🚀 Initializing TOTS Assistant...');
  extractMeetingId();
  await createSidebar();
  setupMessageListener();
  
  // Test server connection
  testServerConnection();
}

// Extract meeting ID from URL
function extractMeetingId() {
  const url = window.location.href;
  console.log('🔍 Extracting meeting ID from URL:', url);
  
  // Match Google Meet URLs with proper meeting ID format (abc-defg-hij)
  const match = url.match(/meet\.google\.com\/([a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3})/i);
  
  if (match) {
    totsState.meetingId = match[1];
    console.log('✅ Meeting ID extracted:', totsState.meetingId);
  } else {
    // Fallback: try to extract any code after meet.google.com/
    const fallbackMatch = url.match(/meet\.google\.com\/([^\/\?&#]+)/i);
    if (fallbackMatch && fallbackMatch[1] !== 'new') {
      totsState.meetingId = fallbackMatch[1];
      console.log('⚠️ Meeting ID extracted (fallback):', totsState.meetingId);
    } else {
      totsState.meetingId = 'meeting-' + Date.now();
      console.log('❌ No meeting ID found, using fallback:', totsState.meetingId);
    }
  }
}

// Test server connection
async function testServerConnection() {
  console.log('🔍 Testing server connection through background...');
  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success) {
      console.log('✅ Server is healthy:', response.data);
      updateStatus('Server Connected');
    } else {
      console.log('❌ Server connection failed:', response.error);
      updateStatus('Server Error');
    }
  } catch (error) {
    console.error('❌ Background communication failed:', error);
    updateStatus('Extension Error');
  }
}

// Create simple sidebar
async function createSidebar() {
  if (document.getElementById(CONFIG.SIDEBAR_ID)) return;

  const sidebar = document.createElement('div');
  sidebar.id = CONFIG.SIDEBAR_ID;
  sidebar.style.cssText = `
    position: fixed !important;
    top: 100px !important;
    right: 20px !important;
    width: 300px !important;
    height: auto !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    color: white !important;
    padding: 20px !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
  `;
  sidebar.innerHTML = getSidebarHTML();
  
  document.body.appendChild(sidebar);
  totsState.sidebar = sidebar;
  
  console.log('✅ Sidebar created and added to DOM');
  setupSidebarButtons();
}

// Simple sidebar HTML
function getSidebarHTML() {
  return `
    <div style="margin-bottom: 15px; font-size: 18px; font-weight: bold; text-align: center;">
      🤖 TOTS Assistant
    </div>
    
    <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">
      <div id="totsStatus" style="font-size: 14px;">Ready</div>
    </div>
    
    <div id="recordingStatus" style="margin-bottom: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center; display: none;">
      <div style="font-size: 14px; color: #ff6b6b;">
        🔴 Recording Active
      </div>
      <div id="recordingTime" style="font-size: 12px; color: #ffcccb; margin-top: 5px;">
        00:00:00
      </div>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
      <button id="startBot" style="background: rgba(255,255,255,0.2); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
        🚀 Start Bot
      </button>
      <button id="stopBot" style="background: rgba(255,255,255,0.1); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px; display: none;">
        ⏹️ Stop Bot
      </button>
      <button id="startRecording" style="background: rgba(220, 53, 69, 0.8); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px; display: none;">
        🔴 Record
      </button>
      <button id="stopRecording" style="background: rgba(40, 167, 69, 0.8); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px; display: none;">
        ⏹️ Stop Recording
      </button>
    </div>
  `;
}

// Setup button handlers
function setupSidebarButtons() {
  const startBtn = document.getElementById('startBot');
  const stopBtn = document.getElementById('stopBot');
  const startRecBtn = document.getElementById('startRecording');
  const stopRecBtn = document.getElementById('stopRecording');
  
  if (startBtn) {
    startBtn.addEventListener('click', startBot);
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', stopBot);
  }
  
  if (startRecBtn) {
    startRecBtn.addEventListener('click', startRecording);
  }
  
  if (stopRecBtn) {
    stopRecBtn.addEventListener('click', stopRecording);
  }
}

// Start bot
async function startBot() {
  console.log('🚀 Starting bot through background...');
  updateStatus('Starting Bot...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'startBot',
      meetingId: totsState.meetingId,
      meetingUrl: window.location.href
    });
    
    if (response.success) {
      totsState.botActive = true;
      updateStatus('Bot Active');
      toggleButtons(true);
      showRecordingIndicator();
      console.log('✅ Bot started successfully:', response.data);
    } else {
      updateStatus('Server Error');
      console.error('❌ Server returned error:', response.error);
    }
  } catch (error) {
    console.error('❌ Bot start failed:', error);
    updateStatus('Connection Error - Check server');
  }
}

// Stop bot
async function stopBot() {
  console.log('⏹️ Stopping bot through background...');
  updateStatus('Stopping Bot...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'stopBot',
      meetingId: totsState.meetingId
    });
    
    if (response.success) {
      totsState.botActive = false;
      totsState.recordingActive = false;
      updateStatus('Bot Stopped');
      toggleButtons(false);
      hideRecordingIndicator();
      stopRecordingTimer();
      console.log('✅ Bot stopped successfully:', response.data);
    } else {
      updateStatus('Server Error');
      console.error('❌ Server returned error:', response.error);
    }
  } catch (error) {
    console.error('❌ Bot stop failed:', error);
    updateStatus('Connection Error');
  }
}

// Update status
function updateStatus(status) {
  const statusEl = document.getElementById('totsStatus');
  if (statusEl) statusEl.textContent = status;
}

// Toggle button visibility
function toggleButtons(botActive) {
  const startBtn = document.getElementById('startBot');
  const stopBtn = document.getElementById('stopBot');
  const startRecBtn = document.getElementById('startRecording');
  const stopRecBtn = document.getElementById('stopRecording');
  
  if (startBtn) startBtn.style.display = botActive ? 'none' : 'block';
  if (stopBtn) stopBtn.style.display = botActive ? 'block' : 'none';
  
  // Show recording controls only when bot is active
  if (startRecBtn) startRecBtn.style.display = botActive && !totsState.recordingActive ? 'block' : 'none';
  if (stopRecBtn) stopRecBtn.style.display = botActive && totsState.recordingActive ? 'block' : 'none';
}

// Listen for force sidebar message
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);
    if (message.action === 'forceSidebar') {
      console.log('Force sidebar triggered!');
      initTOTSAssistant();
      sendResponse({ success: true });
    }
  });
}

// ===== RECORDING FUNCTIONS =====

// Start recording
async function startRecording() {
  console.log('🔴 Starting recording through background...');
  updateStatus('Starting Recording...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'startRecording',
      meetingId: totsState.meetingId
    });
    
    if (response.success) {
      totsState.recordingActive = true;
      updateStatus('Recording Active');
      toggleButtons(true);
      showRecordingStatus();
      startRecordingTimer();
      console.log('✅ Recording started successfully:', response.data);
    } else {
      updateStatus('Recording Error');
      console.error('❌ Recording start error:', response.error);
    }
  } catch (error) {
    console.error('❌ Recording start failed:', error);
    updateStatus('Connection Error');
  }
}

// Stop recording
async function stopRecording() {
  console.log('⏹️ Stopping recording through background...');
  updateStatus('Stopping Recording...');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'stopRecording',
      meetingId: totsState.meetingId
    });
    
    if (response.success) {
      totsState.recordingActive = false;
      updateStatus('Processing with Whisper...');
      toggleButtons(true);
      hideRecordingStatus();
      stopRecordingTimer();
      
      // Show processing status for a few seconds
      setTimeout(() => {
        updateStatus('Bot Active');
      }, 3000);
      
      console.log('✅ Recording stopped successfully:', response.data);
    } else {
      updateStatus('Recording Error');
      console.error('❌ Recording stop error:', response.error);
    }
  } catch (error) {
    console.error('❌ Recording stop failed:', error);
    updateStatus('Connection Error');
  }
}

// Show recording indicator in top-left corner
function showRecordingIndicator() {
  if (totsState.recordingIndicator) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'tots-recording-indicator';
  indicator.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 20px !important;
    width: 120px !important;
    height: 40px !important;
    background: rgba(220, 53, 69, 0.9) !important;
    border-radius: 20px !important;
    display: none !important;
    align-items: center !important;
    justify-content: center !important;
    color: white !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 12px !important;
    font-weight: bold !important;
    z-index: 1000000 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    animation: pulse 2s infinite !important;
  `;
  indicator.innerHTML = '🔴 RECORDING';
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(indicator);
  totsState.recordingIndicator = indicator;
}

// Hide recording indicator
function hideRecordingIndicator() {
  if (totsState.recordingIndicator) {
    totsState.recordingIndicator.style.display = 'none';
  }
}

// Show recording status in sidebar
function showRecordingStatus() {
  const recordingStatus = document.getElementById('recordingStatus');
  if (recordingStatus) {
    recordingStatus.style.display = 'block';
  }
  
  if (totsState.recordingIndicator) {
    totsState.recordingIndicator.style.display = 'flex';
  }
}

// Hide recording status in sidebar
function hideRecordingStatus() {
  const recordingStatus = document.getElementById('recordingStatus');
  if (recordingStatus) {
    recordingStatus.style.display = 'none';
  }
  
  if (totsState.recordingIndicator) {
    totsState.recordingIndicator.style.display = 'none';
  }
}

// Recording timer
let recordingStartTime = null;
let recordingTimer = null;

function startRecordingTimer() {
  recordingStartTime = Date.now();
  recordingTimer = setInterval(updateRecordingTime, 1000);
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  recordingStartTime = null;
}

function updateRecordingTime() {
  if (!recordingStartTime) return;
  
  const elapsed = Date.now() - recordingStartTime;
  const seconds = Math.floor(elapsed / 1000) % 60;
  const minutes = Math.floor(elapsed / 60000) % 60;
  const hours = Math.floor(elapsed / 3600000);
  
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const recordingTimeEl = document.getElementById('recordingTime');
  if (recordingTimeEl) {
    recordingTimeEl.textContent = timeString;
  }
}

// Auto-init when Meet loads
if (window.location.href.includes('meet.google.com')) {
  setTimeout(initTOTSAssistant, 2000);
}

// Global functions for debugging
window.initTOTSAssistant = initTOTSAssistant;
