const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const MeetBot = require('./bot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://meet.google.com", "chrome-extension://*", "http://localhost:*"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: ["https://meet.google.com", "chrome-extension://*", "http://localhost:*"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Store active bots
const activeBots = new Map();

console.log('🤖 TOTS Meet Bot Server - Simple Version');

// ===== API ROUTES =====

app.get('/', (req, res) => {
  res.json({ 
    service: 'TOTS Meet Bot Server',
    version: '1.0.0',
    status: 'running',
    activeBots: activeBots.size
  });
});

// Start bot for meeting (compatible with both endpoints)
app.post('/start-bot', async (req, res) => {
  try {
    const { meetingUrl } = req.body;
    await startBotHandler(req, res);
  } catch (error) {
    console.error('❌ Start bot error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bot/join', async (req, res) => {
  try {
    await startBotHandler(req, res);
  } catch (error) {
    console.error('❌ Join bot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint compatible con la extensión de Chrome
app.post('/api/meetings/:meetingId/start', async (req, res) => {
  try {
    await startBotHandler(req, res);
  } catch (error) {
    console.error('❌ Chrome extension bot error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startBotHandler(req, res) {
  const { meetingUrl } = req.body;
  
  if (!meetingUrl) {
    return res.status(400).json({ error: 'Meeting URL is required' });
  }

  const botId = uuidv4();
  const meetingId = extractMeetingIdFromUrl(meetingUrl);
  
  console.log(`🚀 Starting bot ${botId} for meeting ${meetingId}`);
  
  const bot = new MeetBot(botId, meetingId, meetingUrl);
  
  // Store bot
  activeBots.set(botId, bot);
  
  // Setup bot event listeners
  bot.on('joined', (data) => {
    console.log(`✅ Bot joined: ${data.meetingId}`);
    io.emit('bot-joined', { botId, meetingId: data.meetingId });
  });
  
  bot.on('error', (error) => {
    console.error(`❌ Bot error: ${error.message}`);
    activeBots.delete(botId);
    io.emit('bot-error', { botId, error: error.message });
  });
  
  bot.on('disconnected', () => {
    console.log(`🛑 Bot disconnected: ${botId}`);
    activeBots.delete(botId);
    io.emit('bot-disconnected', { botId });
  });
  
  // Start the bot
  await bot.start();
  
  res.json({
    success: true,
    botId,
    meetingId,
    message: 'Bot started successfully'
  });
}

// Stop bot
app.post('/stop-bot/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    
    const bot = activeBots.get(botId);
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    await bot.stop();
    activeBots.delete(botId);
    
    res.json({
      success: true,
      message: 'Bot stopped successfully'
    });
    
  } catch (error) {
    console.error('❌ Stop bot error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bot status
app.get('/bot-status/:botId', (req, res) => {
  const { botId } = req.params;
  
  const bot = activeBots.get(botId);
  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }
  
  res.json(bot.getStatus());
});

// Get all bots
app.get('/bots', (req, res) => {
  const bots = Array.from(activeBots.values()).map(bot => bot.getStatus());
  res.json({ bots });
});

// ===== SOCKET.IO =====

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
  
  socket.on('start-bot', async (data) => {
    try {
      const { meetingUrl } = data;
      
      if (!meetingUrl) {
        socket.emit('error', { message: 'Meeting URL is required' });
        return;
      }

      const botId = uuidv4();
      const meetingId = extractMeetingIdFromUrl(meetingUrl);
      
      const bot = new MeetBot(botId, meetingId, meetingUrl);
      activeBots.set(botId, bot);
      
      // Setup bot events
      bot.on('joined', (data) => {
        socket.emit('bot-joined', { botId, meetingId: data.meetingId });
      });
      
      bot.on('error', (error) => {
        activeBots.delete(botId);
        socket.emit('bot-error', { botId, error: error.message });
      });
      
      bot.on('disconnected', () => {
        activeBots.delete(botId);
        socket.emit('bot-disconnected', { botId });
      });
      
      await bot.start();
      
      socket.emit('bot-started', { botId, meetingId });
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
});

// ===== UTILITY FUNCTIONS =====

function extractMeetingIdFromUrl(url) {
  try {
    const match = url.match(/meet\.google\.com\/([a-z-]+)/);
    return match ? match[1] : 'unknown-meeting';
  } catch {
    return 'unknown-meeting';
  }
}

// ===== START SERVER =====

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  // Stop all bots
  for (const [botId, bot] of activeBots) {
    try {
      await bot.stop();
      console.log(`🛑 Stopped bot: ${botId}`);
    } catch (error) {
      console.error(`❌ Error stopping bot ${botId}:`, error);
    }
  }
  
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});
