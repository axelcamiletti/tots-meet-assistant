const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

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

module.exports = router;
