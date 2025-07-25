-- Script alternativo si las políticas ya existen
-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Enable read access for all users" ON meetings;
DROP POLICY IF EXISTS "Enable insert access for all users" ON meetings;
DROP POLICY IF EXISTS "Enable update access for all users" ON meetings;
DROP POLICY IF EXISTS "Enable read access for all users" ON transcriptions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON transcriptions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON transcriptions;

-- Crear políticas para permitir acceso a los datos
-- Para meetings
CREATE POLICY "Enable read access for all users" ON meetings
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON meetings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON meetings
  FOR UPDATE USING (true);

-- Para transcriptions
CREATE POLICY "Enable read access for all users transcriptions" ON transcriptions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users transcriptions" ON transcriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete access for all users transcriptions" ON transcriptions
  FOR DELETE USING (true);

-- Verificar que todo se creó correctamente
SELECT 'Policies created successfully' as status;
