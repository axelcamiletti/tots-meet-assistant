const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// GET /api/transcriptions - Obtener todas las transcripciones
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, meetingId } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transcriptions')
      .select(`
        *,
        meetings (
          id,
          title,
          created_at,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por meeting si se proporciona
    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }

    const { data, error, count } = await query;

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
    console.error('Error obteniendo transcripciones:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo transcripciones',
      error: error.message
    });
  }
});

// POST /api/transcriptions - Crear nueva transcripción
router.post('/', async (req, res) => {
  try {
    const { meeting_id, speaker_name, text, timestamp } = req.body;

    // Validar datos requeridos
    if (!meeting_id || !text) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'meeting_id y text son requeridos'
      });
    }

    const { data, error } = await supabase
      .from('transcriptions')
      .insert([{
        meeting_id,
        speaker_name: speaker_name || 'Desconocido',
        text,
        timestamp: timestamp || new Date().toISOString()
      }])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({
      status: 'OK',
      message: 'Transcripción creada exitosamente',
      data: data[0]
    });
  } catch (error) {
    console.error('Error creando transcripción:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error creando transcripción',
      error: error.message
    });
  }
});

// GET /api/transcriptions/meeting/:meetingId - Obtener transcripciones de una reunión específica
router.get('/meeting/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;

    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      status: 'OK',
      data: data || [],
      meeting_id: meetingId
    });
  } catch (error) {
    console.error('Error obteniendo transcripciones de la reunión:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error obteniendo transcripciones de la reunión',
      error: error.message
    });
  }
});

// DELETE /api/transcriptions/:id - Eliminar transcripción
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transcriptions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      status: 'OK',
      message: 'Transcripción eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando transcripción:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error eliminando transcripción',
      error: error.message
    });
  }
});

module.exports = router;
