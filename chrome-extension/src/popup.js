// Simple popup controller - only essential functionality
const UI = {
    status: document.getElementById('status-text'),
    openMeetBtn: document.getElementById('openMeet'),
    forceSidebarBtn: document.getElementById('forceSidebar')
};

// Simple status update
function updateStatus(text, className = 'status-normal') {
    if (UI.status) {
        UI.status.textContent = text;
        // No aplicamos className porque en este HTML no tenemos clases CSS para el status
    }
}

// Open Google Meet
function openGoogleMeet() {
    chrome.tabs.create({ url: 'https://meet.google.com/new' });
    updateStatus('Opening Google Meet...', 'status-info');
}

// Force sidebar in current tab
function forceSidebar() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('meet.google.com')) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'forceSidebar' });
            updateStatus('Forcing sidebar...', 'status-info');
            setTimeout(() => window.close(), 1000);
        } else {
            updateStatus('Not on Google Meet', 'status-error');
        }
    });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    // Set up buttons
    UI.openMeetBtn?.addEventListener('click', openGoogleMeet);
    UI.forceSidebarBtn?.addEventListener('click', forceSidebar);
    
    // Check current tab status
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url.includes('meet.google.com')) {
            updateStatus('On Google Meet', 'status-success');
        } else {
            updateStatus('Ready', 'status-normal');
        }
    });
});
