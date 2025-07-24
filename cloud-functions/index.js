const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

// Cargar variables de entorno en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Configuración de CORS con dominios permitidos
const allowedOrigins = [
  'https://meet.google.com',
  'chrome-extension://*',
  'https://*.web.app',
  'https://*.firebaseapp.com',
  'http://localhost:4200' // Para desarrollo local Angular
];

const cors = require('cors')({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests with no origin
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  }
});

// Inicializar Firebase Admin con configuración de entorno
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: functions.config().firebase?.project_id || process.env.FIREBASE_PROJECT_ID,
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

// Constantes de configuración
const config = {
  collections: {
    meetings: process.env.MEETINGS_COLLECTION || 'meetings',
    users: process.env.USERS_COLLECTION || 'users',
    analytics: process.env.ANALYTICS_COLLECTION || 'analytics'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

// Middleware para validar autenticación
const validateAuth = async (req) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    throw new Error('Token de autorización requerido');
  }
  
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
};

// Cloud Function: Guardar transcripción de reunión
exports.saveMeetingTranscript = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      // Validar autenticación
      const user = await validateAuth(req);
      
      const { 
        meetingId, 
        meetingTitle,
        transcript, 
        highlights, 
        meetingUrl,
        startTime,
        endTime 
      } = req.body;

      // Validar datos requeridos
      if (!meetingId || !transcript) {
        return res.status(400).json({ 
          error: 'meetingId y transcript son requeridos' 
        });
      }

      const meetingData = {
        meetingId,
        meetingTitle: meetingTitle || 'Reunión sin título',
        transcript,
        highlights: highlights || [],
        meetingUrl,
        startTime: startTime || admin.firestore.FieldValue.serverTimestamp(),
        endTime: endTime || admin.firestore.FieldValue.serverTimestamp(),
        userEmail: user.email,
        userId: user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
        summaryGenerated: false
      };

      // Guardar en Firestore
      const docRef = await db.collection(config.collections.meetings).add(meetingData);

      res.status(200).json({ 
        success: true, 
        meetingDocId: docRef.id,
        message: 'Transcripción guardada exitosamente'
      });

    } catch (error) {
      console.error('Error guardando transcripción:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  });
});

// Cloud Function: Generar resumen con IA
exports.generateSummary = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      const user = await validateAuth(req);
      const { meetingDocId } = req.body;

      if (!meetingDocId) {
        return res.status(400).json({ 
          error: 'meetingDocId es requerido' 
        });
      }

      // Obtener datos de la reunión
      const meetingRef = db.collection(config.collections.meetings).doc(meetingDocId);
      const meetingDoc = await meetingRef.get();

      if (!meetingDoc.exists) {
        return res.status(404).json({ error: 'Reunión no encontrada' });
      }

      const meetingData = meetingDoc.data();
      
      // Verificar que el usuario es el propietario
      if (meetingData.userId !== user.uid) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      // Generar resumen con OpenAI
      const summary = await generateAISummary(meetingData);

      // Actualizar documento con el resumen
      await meetingRef.update({
        summary: summary.summary,
        actionItems: summary.actionItems,
        keyPoints: summary.keyPoints,
        summaryGenerated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ 
        success: true,
        summary: summary.summary,
        actionItems: summary.actionItems,
        keyPoints: summary.keyPoints,
        message: 'Resumen generado exitosamente'
      });

    } catch (error) {
      console.error('Error generando resumen:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  });
});

// Cloud Function: Obtener reuniones del usuario
exports.getMeetings = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      const user = await validateAuth(req);
      
      // Parámetros de consulta
      const { 
        limit = 20, 
        page = 1, 
        startDate, 
        endDate,
        searchText 
      } = req.query;

      let query = db.collection(config.collections.meetings)
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc');

      // Filtros opcionales
      if (startDate) {
        query = query.where('startTime', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('startTime', '<=', new Date(endDate));
      }

      // Paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query = query.limit(parseInt(limit)).offset(offset);

      const snapshot = await query.get();
      const meetings = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        meetings.push({
          id: doc.id,
          ...data,
          // Convertir timestamps para serialización
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          startTime: data.startTime?.toDate(),
          endTime: data.endTime?.toDate()
        });
      });

      // Filtro de búsqueda en memoria (mejorar con índices en producción)
      let filteredMeetings = meetings;
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        filteredMeetings = meetings.filter(meeting => 
          meeting.meetingTitle?.toLowerCase().includes(searchLower) ||
          meeting.transcript?.toLowerCase().includes(searchLower)
        );
      }

      res.status(200).json({
        success: true,
        meetings: filteredMeetings,
        total: filteredMeetings.length,
        page: parseInt(page),
        limit: parseInt(limit)
      });

    } catch (error) {
      console.error('Error obteniendo reuniones:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  });
});

// Cloud Function: Análisis avanzado de reunión
exports.analyzeMeeting = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      const user = await validateAuth(req);
      const { meetingDocId, analysisType = 'full' } = req.body;

      if (!meetingDocId) {
        return res.status(400).json({ 
          error: 'meetingDocId es requerido' 
        });
      }

      // Obtener datos de la reunión
      const meetingRef = db.collection(config.collections.meetings).doc(meetingDocId);
      const meetingDoc = await meetingRef.get();

      if (!meetingDoc.exists) {
        return res.status(404).json({ error: 'Reunión no encontrada' });
      }

      const meetingData = meetingDoc.data();
      
      // Verificar que el usuario es el propietario
      if (meetingData.userId !== user.uid) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      let analysis = {};

      if (analysisType === 'sentiment' || analysisType === 'full') {
        analysis.sentiment = await analyzeSentiment(meetingData);
      }

      if (analysisType === 'keywords' || analysisType === 'full') {
        analysis.keywords = await extractKeywords(meetingData);
      }

      if (analysisType === 'metrics' || analysisType === 'full') {
        analysis.metrics = await calculateMeetingMetrics(meetingData);
      }

      // Actualizar documento con análisis
      await meetingRef.update({
        analysis,
        analysisGenerated: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ 
        success: true,
        analysis,
        message: 'Análisis completado exitosamente'
      });

    } catch (error) {
      console.error('Error analizando reunión:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  });
});

// Cloud Function: Actualizar reunión
exports.updateMeeting = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      const user = await validateAuth(req);
      const { meetingDocId, updates } = req.body;

      if (!meetingDocId) {
        return res.status(400).json({ 
          error: 'meetingDocId es requerido' 
        });
      }

      const meetingRef = db.collection(config.collections.meetings).doc(meetingDocId);
      const meetingDoc = await meetingRef.get();

      if (!meetingDoc.exists) {
        return res.status(404).json({ error: 'Reunión no encontrada' });
      }

      const meetingData = meetingDoc.data();
      
      // Verificar que el usuario es el propietario
      if (meetingData.userId !== user.uid) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      // Campos permitidos para actualizar
      const allowedFields = ['meetingTitle', 'highlights', 'notes'];
      const filteredUpdates = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      filteredUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await meetingRef.update(filteredUpdates);

      res.status(200).json({
        success: true,
        message: 'Reunión actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando reunión:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  });
});

// Función para generar resumen con OpenAI
async function generateAISummary(meetingData) {
  const { transcript, highlights, meetingTitle } = meetingData;
  
  // Verificar que tenemos API key
  if (!config.openai.apiKey) {
    console.warn('OpenAI API key no configurada, usando resumen básico');
    return generateBasicSummary(meetingData);
  }
  
  try {
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    
    // Preparar highlights por tipo para el contexto
    const highlightsByType = {
      notas: highlights?.filter(h => h.type === 'nota') || [],
      objetivos: highlights?.filter(h => h.type === 'objetivo') || [],
      tareas: highlights?.filter(h => h.type === 'tarea') || [],
      preguntas: highlights?.filter(h => h.type === 'pregunta') || []
    };
    
    // Construir contexto de highlights
    let highlightsContext = '';
    if (highlightsByType.notas.length > 0) {
      highlightsContext += `\nNotas importantes marcadas:\n${highlightsByType.notas.map(n => `- ${n.text || n.timestamp}`).join('\n')}`;
    }
    if (highlightsByType.objetivos.length > 0) {
      highlightsContext += `\nObjetivos identificados:\n${highlightsByType.objetivos.map(o => `- ${o.text || o.timestamp}`).join('\n')}`;
    }
    if (highlightsByType.tareas.length > 0) {
      highlightsContext += `\nTareas mencionadas:\n${highlightsByType.tareas.map(t => `- ${t.text || t.timestamp}`).join('\n')}`;
    }
    if (highlightsByType.preguntas.length > 0) {
      highlightsContext += `\nPreguntas planteadas:\n${highlightsByType.preguntas.map(p => `- ${p.text || p.timestamp}`).join('\n')}`;
    }
    
    // Limitar el tamaño de la transcripción para no exceder tokens
    const maxTranscriptLength = 8000;
    const truncatedTranscript = transcript.length > maxTranscriptLength 
      ? transcript.substring(0, maxTranscriptLength) + '...[transcripción truncada]'
      : transcript;
    
    // Prompt optimizado para generar resúmenes de reuniones
    const prompt = `Eres un asistente experto en análisis de reuniones corporativas. Analiza la siguiente transcripción de reunión y genera un resumen estructurado.

TÍTULO DE LA REUNIÓN: ${meetingTitle || 'Reunión sin título'}

TRANSCRIPCIÓN:
${truncatedTranscript}

ELEMENTOS DESTACADOS POR EL USUARIO:
${highlightsContext || 'No se marcaron elementos específicos durante la reunión.'}

INSTRUCCIONES:
1. Genera un resumen ejecutivo conciso (2-3 párrafos máximo)
2. Identifica los puntos clave más importantes
3. Lista las tareas y acciones específicas mencionadas
4. Mantén un tono profesional y objetivo
5. Si hay elementos destacados por el usuario, dales prioridad en el análisis

Responde en formato JSON con la siguiente estructura:
{
  "summary": "Resumen ejecutivo de la reunión...",
  "keyPoints": ["Punto clave 1", "Punto clave 2", ...],
  "actionItems": ["Tarea/acción 1", "Tarea/acción 2", ...]
}`;

    // Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en análisis de reuniones. Respondes únicamente en formato JSON válido sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    const responseContent = completion.choices[0].message.content;
    const aiSummary = JSON.parse(responseContent);
    
    // Validar que la respuesta tenga la estructura esperada
    return {
      summary: aiSummary.summary || 'Resumen no disponible',
      keyPoints: Array.isArray(aiSummary.keyPoints) ? aiSummary.keyPoints : [],
      actionItems: Array.isArray(aiSummary.actionItems) ? aiSummary.actionItems : []
    };
    
  } catch (error) {
    console.error('Error generando resumen con OpenAI:', error);
    console.warn('Fallback a resumen básico debido al error');
    return generateBasicSummary(meetingData);
  }
}

// Función de fallback para generar resumen básico sin IA
async function generateBasicSummary(meetingData) {
  const { transcript, highlights } = meetingData;
  
  // Análisis básico de highlights por tipo
  const highlightsByType = {
    notas: highlights?.filter(h => h.type === 'nota') || [],
    objetivos: highlights?.filter(h => h.type === 'objetivo') || [],
    tareas: highlights?.filter(h => h.type === 'tarea') || [],
    preguntas: highlights?.filter(h => h.type === 'pregunta') || []
  };
  
  // Estadísticas básicas
  const wordCount = transcript?.split(' ').length || 0;
  const duration = Math.round(wordCount / 150); // Estimación basada en 150 palabras por minuto
  
  // Generar resumen básico
  let summary = `Reunión completada con aproximadamente ${duration} minutos de duración (${wordCount} palabras en transcripción).\n\n`;
  
  if (highlightsByType.objetivos.length > 0) {
    summary += `Se identificaron ${highlightsByType.objetivos.length} objetivos clave durante la reunión.\n`;
  }
  if (highlightsByType.tareas.length > 0) {
    summary += `Se asignaron ${highlightsByType.tareas.length} tareas específicas.\n`;
  }
  if (highlightsByType.notas.length > 0) {
    summary += `Se marcaron ${highlightsByType.notas.length} notas importantes.\n`;
  }
  if (highlightsByType.preguntas.length > 0) {
    summary += `Quedaron ${highlightsByType.preguntas.length} preguntas pendientes por resolver.\n`;
  }
  
  if (highlights?.length === 0) {
    summary += 'No se marcaron elementos específicos durante la reunión. Revisa la transcripción completa para más detalles.';
  }

  return {
    summary: summary.trim(),
    actionItems: highlightsByType.tareas.map((t, index) => 
      t.text || `Tarea ${index + 1} (revisar transcripción en marca de tiempo)`
    ),
    keyPoints: [
      ...highlightsByType.objetivos.map((o, index) => 
        o.text || `Objetivo ${index + 1} (revisar transcripción)`
      ),
      ...highlightsByType.notas.map((n, index) => 
        n.text || `Nota importante ${index + 1} (revisar transcripción)`
      )
    ]
  };
}

// Funciones auxiliares para análisis avanzado
async function analyzeSentiment(meetingData) {
  const { transcript } = meetingData;
  
  if (!config.openai.apiKey || !transcript) {
    return { sentiment: 'neutral', confidence: 0, reason: 'Análisis no disponible' };
  }
  
  try {
    const openai = new OpenAI({ apiKey: config.openai.apiKey });
    
    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: 'Analiza el sentimiento general de esta transcripción de reunión. Responde con un JSON que contenga: sentiment ("positive", "negative", "neutral"), confidence (0-1), y reason (explicación breve).'
        },
        {
          role: 'user',
          content: transcript.substring(0, 4000) // Limitar para no exceder tokens
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error en análisis de sentimiento:', error);
    return { sentiment: 'neutral', confidence: 0, reason: 'Error en análisis' };
  }
}

async function extractKeywords(meetingData) {
  const { transcript } = meetingData;
  
  if (!transcript) {
    return [];
  }
  
  // Análisis básico de palabras frecuentes (mejorar con OpenAI si es necesario)
  const words = transcript.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = ['that', 'this', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'think', 'know', 'just', 'like', 'going', 'really', 'actually'];
  
  const wordCount = {};
  words.forEach(word => {
    if (!stopWords.includes(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

async function calculateMeetingMetrics(meetingData) {
  const { transcript, highlights, startTime, endTime } = meetingData;
  
  const wordCount = transcript?.split(' ').length || 0;
  const estimatedDuration = Math.round(wordCount / 150); // 150 palabras por minuto
  
  // Calcular duración real si tenemos timestamps
  let actualDuration = estimatedDuration;
  if (startTime && endTime) {
    const start = startTime.toDate ? startTime.toDate() : new Date(startTime);
    const end = endTime.toDate ? endTime.toDate() : new Date(endTime);
    actualDuration = Math.round((end - start) / (1000 * 60)); // en minutos
  }
  
  const highlightsByType = {
    notas: highlights?.filter(h => h.type === 'nota').length || 0,
    objetivos: highlights?.filter(h => h.type === 'objetivo').length || 0,
    tareas: highlights?.filter(h => h.type === 'tarea').length || 0,
    preguntas: highlights?.filter(h => h.type === 'pregunta').length || 0
  };
  
  return {
    wordCount,
    estimatedDuration,
    actualDuration,
    highlightsByType,
    totalHighlights: highlights?.length || 0,
    engagementScore: Math.min(100, (highlights?.length || 0) * 10), // Score básico basado en interacciones
    efficiency: actualDuration > 0 ? Math.round((highlightsByType.objetivos + highlightsByType.tareas) / actualDuration * 100) / 100 : 0
  };
}