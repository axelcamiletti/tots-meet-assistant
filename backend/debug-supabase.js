// Debug de conexión Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Debuggeando conexión Supabase...\n');

console.log('Variables de entorno:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SECRET_KEY (primeros 50 chars):', process.env.SUPABASE_SECRET_KEY?.substring(0, 50) + '...');
console.log();

try {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
  );

  console.log('✅ Cliente Supabase creado exitosamente');
  
  // Test simple
  supabase
    .from('meetings')
    .select('count')
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Error:', error.message);
        console.log('❌ Detalles:', error.details);
        console.log('❌ Hint:', error.hint);
      } else {
        console.log('✅ Conexión exitosa con Supabase');
        console.log('📊 Data:', data);
      }
    })
    .catch(err => {
      console.log('❌ Error de conexión:', err.message);
    });

} catch (error) {
  console.log('❌ Error creando cliente:', error.message);
}
