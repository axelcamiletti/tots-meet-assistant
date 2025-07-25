-- Crear tabla de reuniones
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  meet_url VARCHAR(500) NOT NULL,
  meet_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transcripciones
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_name VARCHAR(255) DEFAULT 'Desconocido',
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_transcriptions_meeting_id ON transcriptions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_timestamp ON transcriptions(timestamp);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

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

-- Insertar datos de ejemplo (opcional)
INSERT INTO meetings (title, meet_url, meet_id, status) VALUES 
('Reunión de ejemplo', 'https://meet.google.com/abc-defg-hij', 'abc-defg-hij', 'completed')
ON CONFLICT DO NOTHING;

-- Verificar que todo se creó correctamente
SELECT 'Tables created successfully' as status;
