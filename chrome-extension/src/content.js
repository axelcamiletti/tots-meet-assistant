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
  sidebar: null
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
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="startBot" style="background: rgba(255,255,255,0.2); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
        🚀 Start Bot
      </button>
      <button id="stopBot" style="background: rgba(255,255,255,0.1); border: none; padding: 10px 15px; border-radius: 6px; color: white; cursor: pointer; font-size: 14px; display: none;">
        ⏹️ Stop Bot
      </button>
    </div>
  `;
}

// Setup button handlers
function setupSidebarButtons() {
  const startBtn = document.getElementById('startBot');
  const stopBtn = document.getElementById('stopBot');
  
  if (startBtn) {
    startBtn.addEventListener('click', startBot);
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', stopBot);
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
      updateStatus('Bot Stopped');
      toggleButtons(false);
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
  
  if (startBtn) startBtn.style.display = botActive ? 'none' : 'block';
  if (stopBtn) stopBtn.style.display = botActive ? 'block' : 'none';
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

// Auto-init when Meet loads
if (window.location.href.includes('meet.google.com')) {
  setTimeout(initTOTSAssistant, 2000);
}

// Global functions for debugging
window.initTOTSAssistant = initTOTSAssistant;
