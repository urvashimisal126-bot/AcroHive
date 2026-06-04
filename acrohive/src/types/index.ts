/* ─── Geofence Types ─── */

export type GeoState = 'idle' | 'checking' | 'verified' | 'failed' | 'demo';

export type VerificationMethod = 'gps' | 'ip' | 'demo' | null;

export interface VerificationResult {
  verified: boolean;
  method: VerificationMethod;
  distance: number;
}

/* ─── Database Row Types ─── */

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date_time: string;
  venue_name: string;
  venue_lat: number;
  venue_lng: number;
  radius_metres: number;
  capacity: number;
  registered_count: number;
  allowed_ip_prefix: string | null;
  attendance_open: boolean;
  demo_mode: boolean;
  created_by: string;
  category: 'Workshop' | 'Hackathon' | 'Bootcamp' | 'Competition' | 'Exhibition';
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  roll_number: string;
  registered_at: string;
  qr_code_hash: string;
  ticket_sent: boolean;
}

export interface Attendance {
  id: string;
  registration_id: string;
  event_id: string;
  student_id: string;
  checked_in_at: string;
  verified: boolean;
  verification_method: 'gps' | 'ip' | 'demo' | 'manual';
  distance_metres: number | null;
  ip_address: string | null;
}

export interface Profile {
  id: string;
  role: 'student' | 'admin';
  full_name: string | null;
  roll_number: string | null;
  created_at: string;
}

/* ─── Scanner Types ─── */

export interface ScanResult {
  success: boolean;
  studentName: string | null;
  registrationId: string | null;
  timestamp: string;
  message: string;
}

export interface ScanCounters {
  valid: number;
  invalid: number;
}
