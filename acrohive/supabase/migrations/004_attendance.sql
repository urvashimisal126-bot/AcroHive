-- 004: Attendance table
-- Records check-ins with geofence verification metadata

CREATE TABLE IF NOT EXISTS attendance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id     UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id          UUID NOT NULL REFERENCES auth.users(id),
  checked_in_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified            BOOL NOT NULL DEFAULT false,
  verification_method TEXT CHECK (verification_method IN ('gps','ip','demo','manual')),
  distance_metres     FLOAT8,
  ip_address          TEXT,

  -- Prevent duplicate check-ins
  UNIQUE (registration_id)
);

-- Enable Row Level Security
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Students can read their own attendance
CREATE POLICY "Students read own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = student_id);

-- Admins can read all attendance
CREATE POLICY "Admins read all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Authenticated users can insert attendance (scanner check-in)
CREATE POLICY "Insert attendance on scan"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable Realtime for live feed
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
