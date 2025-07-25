// Archivo de pruebas para la API
// Ejecutar con: node test-api.js

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Iniciando pruebas de la API...\n');

  try {
    // 1. Test health check
    console.log('1️⃣ Testing health check...');
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('✅ Health:', healthData.message);
    console.log();

    // 2. Test database connection
    console.log('2️⃣ Testing database connection...');
    const dbTest = await fetch(`${API_BASE}/test-db`);
    const dbData = await dbTest.json();
    console.log('✅ Database:', dbData.message);
    console.log();

    // 3. Create a test meeting
    console.log('3️⃣ Creating test meeting...');
    const meetingResponse = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Reunión de Prueba API',
        meet_url: 'https://meet.google.com/test-meeting-123',
        meet_id: 'test-meeting-123'
      })
    });
    
    const meetingData = await meetingResponse.json();
    if (meetingResponse.ok) {
      console.log('✅ Meeting created:', meetingData.data.title);
      console.log('📝 Meeting ID:', meetingData.data.id);
      
      const meetingId = meetingData.data.id;

      // 4. Add transcriptions to the meeting
      console.log('\n4️⃣ Adding transcriptions...');
      
      const transcriptions = [
        { speaker_name: 'Juan Pérez', text: 'Hola a todos, bienvenidos a la reunión.', timestamp: new Date().toISOString() },
        { speaker_name: 'María García', text: 'Gracias Juan. Vamos a revisar los temas de hoy.', timestamp: new Date().toISOString() },
        { speaker_name: 'Carlos López', text: 'Perfecto, empecemos con el primer punto.', timestamp: new Date().toISOString() }
      ];

      for (const transcript of transcriptions) {
        const transcriptResponse = await fetch(`${API_BASE}/transcriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meeting_id: meetingId,
            ...transcript
          })
        });
        
        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();
          console.log(`✅ Transcripción añadida: "${transcript.text.substring(0, 30)}..."`);
        }
      }

      // 5. Get all transcriptions for the meeting
      console.log('\n5️⃣ Getting meeting transcriptions...');
      const meetingTranscripts = await fetch(`${API_BASE}/transcriptions/meeting/${meetingId}`);
      const transcriptsData = await meetingTranscripts.json();
      
      if (meetingTranscripts.ok) {
        console.log(`✅ Found ${transcriptsData.data.length} transcriptions for meeting`);
        transcriptsData.data.forEach((t, index) => {
          console.log(`   ${index + 1}. ${t.speaker_name}: "${t.text.substring(0, 50)}..."`);
        });
      }

      // 6. Get all meetings
      console.log('\n6️⃣ Getting all meetings...');
      const allMeetings = await fetch(`${API_BASE}/meetings`);
      const meetingsData = await allMeetings.json();
      
      if (allMeetings.ok) {
        console.log(`✅ Found ${meetingsData.data.length} meetings total`);
        meetingsData.data.forEach((m, index) => {
          console.log(`   ${index + 1}. ${m.title} - Status: ${m.status}`);
        });
      }

      // 7. Update meeting status
      console.log('\n7️⃣ Updating meeting status...');
      const statusUpdate = await fetch(`${API_BASE}/meetings/${meetingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        })
      });
      
      if (statusUpdate.ok) {
        const statusData = await statusUpdate.json();
        console.log('✅ Meeting status updated to:', statusData.data.status);
      }

    } else {
      console.log('❌ Error creating meeting:', meetingData.message);
    }

  } catch (error) {
    console.error('❌ Error during API tests:', error.message);
  }

  console.log('\n🎉 API tests completed!');
}

// Ejecutar las pruebas
testAPI();
