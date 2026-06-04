import { useState, useCallback, useRef } from 'react';
import { verifyLocation } from '@/api/verify-location';
import type { GeoState, VerificationMethod, Event } from '@/types';

interface UseGeofenceReturn {
  geoState: GeoState;
  distance: number | null;
  method: VerificationMethod;
  verify: () => void;
  reset: () => void;
}

/**
 * State machine hook for the geofence verification flow.
 *
 * States: idle → checking → verified | failed
 * If event.demo_mode is true, immediately transitions to 'demo'.
 */
export function useGeofence(selectedEvent: Event | null): UseGeofenceReturn {
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [distance, setDistance] = useState<number | null>(null);
  const [method, setMethod] = useState<VerificationMethod>(null);
  const abortRef = useRef(false);

  const verify = useCallback(() => {
    if (!selectedEvent) return;

    // If demo mode is enabled, skip GPS entirely
    if (selectedEvent.demo_mode) {
      setGeoState('demo');
      setDistance(0);
      setMethod('demo');
      return;
    }

    setGeoState('checking');
    abortRef.current = false;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (abortRef.current) return;

        try {
          const result = await verifyLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            selectedEvent.id
          );

          if (abortRef.current) return;

          setDistance(result.distance);
          setMethod(result.method);
          setGeoState(result.verified ? 'verified' : 'failed');
        } catch (err) {
          console.error('[useGeofence] Verification error:', err);
          if (!abortRef.current) {
            setGeoState('failed');
            setDistance(null);
          }
        }
      },
      (err) => {
        console.warn('[useGeofence] Geolocation error:', err.message);
        if (!abortRef.current) {
          setGeoState('failed');
          setDistance(null);
        }
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
  }, [selectedEvent]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setGeoState('idle');
    setDistance(null);
    setMethod(null);
  }, []);

  return { geoState, distance, method, verify, reset };
}
