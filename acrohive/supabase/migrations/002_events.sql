-- 002: Events table
-- Stores campus events with geofencing coordinates

CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  date_time       TIMESTAMPTZ NOT NULL,
  venue_name      TEXT NOT NULL,
  venue_lat       FLOAT8 NOT NULL,
  venue_lng       FLOAT8 NOT NULL,
  radius_metres   INT4 NOT NULL DEFAULT 100,
  capacity        INT4 NOT NULL DEFAULT 100,
  registered_count INT4 NOT NULL DEFAULT 0,
  allowed_ip_prefix TEXT,
  attendance_open BOOL NOT NULL DEFAULT false,
  demo_mode       BOOL NOT NULL DEFAULT false,
  created_by      UUID REFERENCES auth.users(id),
  category        TEXT NOT NULL CHECK (category IN ('Workshop','Hackathon','Bootcamp','Competition','Exhibition')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read events
CREATE POLICY "Public read events"
  ON events FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
