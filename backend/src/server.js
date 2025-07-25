const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para probar conexión con Supabase
app.get('/api/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      status: 'OK', 
      message: 'Conexión con Supabase exitosa',
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error conectando con Supabase',
      error: error.message
    });
  }
});

// Rutas para transcripciones
const transcriptionRoutes = require('../routes/transcriptions');
app.use('/api/transcriptions', transcriptionRoutes);

// Rutas para reuniones
const meetingRoutes = require('../routes/meetings');
app.use('/api/meetings', meetingRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'ERROR', 
    message: 'Error interno del servidor' 
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'ERROR', 
    message: 'Ruta no encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/test-db`);
});

module.exports = app;
