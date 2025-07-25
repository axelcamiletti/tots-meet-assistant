// Debug simple de Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabase() {
  console.log('🔍 Debuggeando conexión Supabase...\n');

  // Verificar variables de entorno
  console.log('Variables de entorno:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_SECRET_KEY existe:', !!process.env.SUPABASE_SECRET_KEY);
  console.log('SUPABASE_SECRET_KEY longitud:', process.env.SUPABASE_SECRET_KEY?.length);
  console.log();

  try {
    console.log('✅ Creando cliente Supabase...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    console.log('✅ Cliente creado exitosamente');
    
    // Test de conexión simple
    console.log('🔌 Probando conexión...');
    
    const { data, error } = await supabase
      .from('meetings')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Error en query:', error.message);
      console.log('❌ Código:', error.code);
      console.log('❌ Detalles:', error.details);
      console.log('❌ Hint:', error.hint);
    } else {
      console.log('✅ ¡Conexión exitosa!');
      console.log('📊 Respuesta:', data);
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSupabase();
