import { supabase } from '@/lib/supabase';
import { haversine } from '@/lib/haversine';
import type { VerificationResult } from '@/types';

/**
 * Verify whether the user is within the geofence of the selected event.
 *
 * Checks in order:
 *   1. Demo mode bypass
 *   2. GPS haversine distance
 *   3. IP subnet fallback (if configured)
 */
export async function verifyLocation(
  lat: number,
  lng: number,
  eventId: string
): Promise<VerificationResult> {
  // Fetch event details from Supabase
  const { data: event, error } = await supabase
    .from('events')
    .select('venue_lat, venue_lng, radius_metres, allowed_ip_prefix, demo_mode')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    console.error('[verifyLocation] Failed to fetch event:', error);
    return { verified: false, method: null, distance: -1 };
  }

  // Layer 0: Demo mode bypass
  if (event.demo_mode) {
    return { verified: true, method: 'demo', distance: 0 };
  }

  // Layer 1: GPS haversine check
  const dist = haversine(lat, lng, event.venue_lat, event.venue_lng);
  const roundedDist = Math.round(dist);

  if (dist <= event.radius_metres) {
    return { verified: true, method: 'gps', distance: roundedDist };
  }

  // Layer 2: IP subnet fallback
  // NOTE: In a real deployment, the IP check would run server-side.
  // For the hackathon demo, we skip the IP layer on the client and
  // rely on the demo_mode toggle instead.
  if (event.allowed_ip_prefix) {
    // Client can't reliably determine its own public IP,
    // so this remains a placeholder for edge-function migration.
    console.info(
      '[verifyLocation] IP fallback configured but skipped on client side.'
    );
  }

  return { verified: false, method: null, distance: roundedDist };
}
