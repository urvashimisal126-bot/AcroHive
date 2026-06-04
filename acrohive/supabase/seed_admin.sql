-- Seed admin account
-- Run AFTER creating the admin user in Supabase Auth dashboard.
--
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → email: admin@aitr.ac.in, password: your-admin-pass
-- 3. Copy the user's UUID
-- 4. Replace 'YOUR_ADMIN_USER_UUID' below with the actual UUID
-- 5. Run this SQL in the SQL Editor

INSERT INTO profiles (id, role, full_name, roll_number)
VALUES (
  'YOUR_ADMIN_USER_UUID',  -- ← Replace with actual UUID from Auth dashboard
  'admin',
  'AcroHive Admin',
  NULL
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
