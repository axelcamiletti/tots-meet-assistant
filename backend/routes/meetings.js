const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const router = express.Router();

// Import bot-core (compiled version)
const { GoogleMeetBot } = require('../../bot-core/dist/src/platforms/google-meet-bot');

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// GET /api/meetings - Obtener todas las reuniones
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('meetings')
      .select(`
        *,
        transcriptions (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      status: 'OK',
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count
      }
    });
  } catch (error) {
    console.error('Error obteniendo reuniones:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo reuniones',
      error: error.message
    });
  }
});

// POST /api/meetings - Crear nueva reunión
router.post('/', async (req, res) => {
  try {
    const { title, meet_url, meet_id } = req.body;

    // Validar datos requeridos
    if (!title || !meet_url) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'title y meet_url son requeridos'
      });
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert([{
        title,
        meet_url,
        meet_id,
        status: 'active'
      }])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({
      status: 'OK',
      message: 'Reunión creada exitosamente',
      data: data[0]
    });
  } catch (error) {
    console.error('Error creando reunión:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error creando reunión',
      error: error.message
    });
  }
});

// PUT /api/meetings/:id/status - Actualizar estado de reunión
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar status
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Status debe ser: active, completed, o cancelled'
      });
    }

    const { data, error } = await supabase
      .from('meetings')
      .update({ 
        status
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reunión no encontrada'
      });
    }

    res.json({
      status: 'OK',
      message: 'Estado de reunión actualizado exitosamente',
      data: data[0]
    });
  } catch (error) {
    console.error('Error actualizando estado de reunión:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error actualizando estado de reunión',
      error: error.message
    });
  }
});

// GET /api/meetings/:id - Obtener reunión específica con transcripciones
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        transcriptions (
          id,
          speaker_name,
          text,
          timestamp,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Reunión no encontrada'
      });
    }

    res.json({
      status: 'OK',
      data
    });
  } catch (error) {
    console.error('Error obteniendo reunión:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo reunión',
      error: error.message
    });
  }
});

// ===== BOT CONTROL ENDPOINTS =====

// Map to track active bots - now stores actual bot instances
const activeBots = new Map();

// POST /api/meetings/:id/start - Iniciar bot para reunión
router.post('/:id/start', async (req, res) => {
  try {
    const { id: meetingId } = req.params;
    const { meetingUrl } = req.body;

    console.log(`🚀 Starting bot for meeting: ${meetingId}`);

    // Check if bot is already running
    if (activeBots.has(meetingId)) {
      return res.json({
        status: 'OK',
        message: 'Bot ya está activo para esta reunión',
        data: { meetingId, status: 'already_running' }
      });
    }

    // Validate meeting URL
    if (!meetingUrl || !meetingUrl.includes('meet.google.com')) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'URL de Google Meet válida es requerida'
      });
    }

    // Create and start real bot instance
    const bot = new GoogleMeetBot({
      meetingUrl,
      headless: true,
      recordingOptions: {
        outputPath: path.join(__dirname, '../../recordings'),
        audioQuality: 'high'
      }
    });

    try {
      await bot.joinMeeting();
      
      // Store bot instance
      activeBots.set(meetingId, {
        bot: bot,
        status: 'running',
        startTime: new Date(),
        meetingUrl,
        recording: false
      });

      // Update meeting status in database
      await supabase
        .from('meetings')
        .update({ status: 'active' })
        .eq('meet_id', meetingId);

      res.json({
        status: 'OK',
        message: 'Bot iniciado exitosamente',
        data: { meetingId, status: 'started' }
      });
    } catch (botError) {
      console.error('Bot startup error:', botError);
      res.status(500).json({
        status: 'ERROR',
        message: 'Error iniciando bot en Google Meet',
        error: botError.message
      });
    }
  } catch (error) {
    console.error('Error starting bot:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error iniciando bot',
      error: error.message
    });
  }
});

// POST /api/meetings/:id/stop - Detener bot para reunión
router.post('/:id/stop', async (req, res) => {
  try {
    const { id: meetingId } = req.params;

    console.log(`⏹️ Stopping bot for meeting: ${meetingId}`);

    // Check if bot is running
    if (!activeBots.has(meetingId)) {
      return res.json({
        status: 'OK',
        message: 'Bot no está corriendo para esta reunión',
        data: { meetingId, status: 'not_running' }
      });
    }

    const botInfo = activeBots.get(meetingId);
    
    try {
      // Stop recording if active
      if (botInfo.recording) {
        await botInfo.bot.stopRecording();
      }
      
      // Close bot properly
      await botInfo.bot.close();
      
    } catch (botError) {
      console.error('Error closing bot:', botError);
    }
    
    // Remove from active bots
    activeBots.delete(meetingId);

    // Update meeting status in database
    await supabase
      .from('meetings')
      .update({ status: 'completed' })
      .eq('meet_id', meetingId);

    res.json({
      status: 'OK',
      message: 'Bot detenido exitosamente',
      data: { meetingId, status: 'stopped' }
    });
  } catch (error) {
    console.error('Error stopping bot:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error deteniendo bot',
      error: error.message
    });
  }
});

// POST /api/meetings/:id/recording/start - Iniciar grabación
router.post('/:id/recording/start', async (req, res) => {
  try {
    const { id: meetingId } = req.params;

    console.log(`🔴 Starting recording for meeting: ${meetingId}`);

    // Check if bot is running
    if (!activeBots.has(meetingId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Bot debe estar activo para iniciar grabación'
      });
    }

    const botInfo = activeBots.get(meetingId);
    
    // Check if already recording
    if (botInfo.recording) {
      return res.json({
        status: 'OK',
        message: 'Grabación ya está activa',
        data: { meetingId, status: 'already_recording' }
      });
    }

    try {
      // Start real audio recording with bot
      const recordingFile = await botInfo.bot.startRecording();
      
      // Update bot info
      botInfo.recording = true;
      botInfo.recordingStartTime = new Date();
      botInfo.recordingFile = recordingFile;
      activeBots.set(meetingId, botInfo);

      res.json({
        status: 'OK',
        message: 'Grabación iniciada exitosamente',
        data: { 
          meetingId, 
          status: 'recording_started',
          recordingFile 
        }
      });
    } catch (botError) {
      console.error('Bot recording error:', botError);
      res.status(500).json({
        status: 'ERROR',
        message: 'Error iniciando grabación en el bot',
        error: botError.message
      });
    }
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error iniciando grabación',
      error: error.message
    });
  }
});

// POST /api/meetings/:id/recording/stop - Detener grabación
router.post('/:id/recording/stop', async (req, res) => {
  try {
    const { id: meetingId } = req.params;

    console.log(`⏹️ Stopping recording for meeting: ${meetingId}`);

    // Check if bot is running
    if (!activeBots.has(meetingId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Bot no está activo'
      });
    }

    const botInfo = activeBots.get(meetingId);
    
    // Check if recording
    if (!botInfo.recording) {
      return res.json({
        status: 'OK',
        message: 'No hay grabación activa',
        data: { meetingId, status: 'not_recording' }
      });
    }

    try {
      // Stop recording and get transcription
      console.log('🔄 Stopping recording and processing with Whisper...');
      const transcriptionResult = await botInfo.bot.stopRecording();
      
      // Update bot info
      botInfo.recording = false;
      botInfo.recordingEndTime = new Date();
      activeBots.set(meetingId, botInfo);

      // Save transcription to database if we got results
      if (transcriptionResult && transcriptionResult.text) {
        await supabase
          .from('transcriptions')
          .insert([{
            meeting_id: meetingId,
            speaker_name: 'Reunión',
            text: transcriptionResult.text,
            timestamp: new Date().toISOString(),
            audio_file: botInfo.recordingFile
          }]);
      }

      res.json({
        status: 'OK',
        message: 'Grabación detenida y procesada con Whisper',
        data: { 
          meetingId, 
          status: 'recording_stopped',
          transcription: transcriptionResult
        }
      });
    } catch (botError) {
      console.error('Bot recording stop error:', botError);
      res.status(500).json({
        status: 'ERROR',
        message: 'Error deteniendo grabación en el bot',
        error: botError.message
      });
    }
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error deteniendo grabación',
      error: error.message
    });
  }
});

// GET /api/meetings/:id/status - Obtener estado del bot
router.get('/:id/status', async (req, res) => {
  try {
    const { id: meetingId } = req.params;

    const botInfo = activeBots.get(meetingId);
    
    if (!botInfo) {
      return res.json({
        status: 'OK',
        data: { meetingId, botActive: false, recording: false }
      });
    }

    res.json({
      status: 'OK',
      data: {
        meetingId,
        botActive: true,
        recording: botInfo.recording,
        startTime: botInfo.startTime,
        recordingStartTime: botInfo.recordingStartTime || null
      }
    });
  } catch (error) {
    console.error('Error getting bot status:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo estado del bot',
      error: error.message
    });
  }
});

module.exports = router;
