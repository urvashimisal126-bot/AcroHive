-- 003: Registrations table
-- Links students to events with unique QR code hashes

CREATE TABLE IF NOT EXISTS registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES auth.users(id),
  student_name    TEXT NOT NULL,
  student_email   TEXT NOT NULL,
  roll_number     TEXT,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  qr_code_hash    TEXT NOT NULL UNIQUE,
  ticket_sent     BOOL NOT NULL DEFAULT false,

  -- Prevent duplicate registrations
  UNIQUE (event_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Students can read their own registrations
CREATE POLICY "Students read own registrations"
  ON registrations FOR SELECT
  USING (auth.uid() = student_id);

-- Admins can read all registrations
CREATE POLICY "Admins read all registrations"
  ON registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Students can insert their own registrations
CREATE POLICY "Students register for events"
  ON registrations FOR INSERT
  WITH CHECK (auth.uid() = student_id);
