import React, { useState, useEffect } from 'react';
import { MapPin, Satellite, Wifi, Wrench, AlertTriangle, CheckCircle2, XCircle, Radio } from 'lucide-react';
import type { GeoState, VerificationMethod, Event } from '@/types';
import { VerificationBadge } from './VerificationBadge';

interface GeofenceGateProps {
  geoState: GeoState;
  distance: number | null;
  method: VerificationMethod;
  event: Event;
  onVerify: () => void;
  onReset: () => void;
}

/** Alternating status text for the checking state */
const CHECKING_TEXTS = ['Acquiring GPS signal...', 'Verifying position...'];

export const GeofenceGate: React.FC<GeofenceGateProps> = ({
  geoState,
  distance,
  method,
  event,
  onVerify,
  onReset,
}) => {
  const [checkingTextIndex, setCheckingTextIndex] = useState(0);

  // Alternate checking text every 1.2s
  useEffect(() => {
    if (geoState !== 'checking') return;
    const interval = setInterval(() => {
      setCheckingTextIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1200);
    return () => clearInterval(interval);
  }, [geoState]);

  /* ─── STATE: idle ─── */
  if (geoState === 'idle') {
    return (
      <div className="gate-card gate-idle animate-fade-in-slide">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Satellite className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              LOCATION VERIFICATION REQUIRED
            </h3>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <InfoRow label="Event" value={event.title} />
          <InfoRow label="Venue" value={event.venue_name} />
          <InfoRow label="Required proximity" value={`${event.radius_metres}m`} />
        </div>

        <p className="text-sm text-muted leading-relaxed mb-8">
          The attendance scanner is geofenced. You must be physically present at
          the event venue to scan and record attendance.
        </p>

        <button
          onClick={onVerify}
          className="cyber-btn w-full flex items-center justify-center gap-2 text-sm"
          id="verify-location-btn"
        >
          <MapPin className="w-4 h-4" />
          Verify My Location
        </button>
      </div>
    );
  }

  /* ─── STATE: checking ─── */
  if (geoState === 'checking') {
    return (
      <div className="gate-card gate-checking animate-fade-in-slide">
        <div className="flex flex-col items-center justify-center py-8">
          {/* Pulsing ring */}
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
            <div className="absolute inset-1 rounded-full border-2 border-primary/60 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse-ring" style={{ animationDelay: '0.8s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="w-7 h-7 text-primary" />
            </div>
          </div>

          <p className="text-primary font-mono text-sm tracking-wider animate-pulse">
            {CHECKING_TEXTS[checkingTextIndex]}
          </p>
          <p className="text-muted text-xs mt-2">
            Checking your position against venue coordinates.
          </p>
        </div>
      </div>
    );
  }

  /* ─── STATE: verified ─── */
  if (geoState === 'verified') {
    return (
      <div className="gate-card gate-verified animate-fade-in-slide">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-400 tracking-tight">
              LOCATION VERIFIED
            </h3>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-300">
            You are <span className="text-white font-semibold">{distance}m</span> from the venue.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Method:</span>
            <VerificationBadge method={method} />
          </div>
        </div>

        <div className="border-t border-emerald-500/20 pt-4">
          <p className="text-sm text-gray-400">
            Scanner is now active. Point camera at student QR tickets to record attendance.
          </p>
        </div>
      </div>
    );
  }

  /* ─── STATE: failed ─── */
  if (geoState === 'failed') {
    return (
      <div className="gate-card gate-failed animate-fade-in-slide">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-danger/15 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-danger tracking-tight">
              OUTSIDE GEOFENCE
            </h3>
          </div>
        </div>

        {distance !== null && distance >= 0 ? (
          <div className="space-y-1 mb-4">
            <p className="text-sm text-gray-300">
              You are approximately <span className="text-white font-semibold">{distance}m</span> away.
            </p>
            <p className="text-sm text-gray-400">
              Required: within <span className="text-white">{event.radius_metres}m</span> of venue.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-300 mb-4">
            Unable to determine your location. GPS may be blocked or unavailable.
          </p>
        )}

        <div className="bg-danger/5 border border-danger/15 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-400 font-medium mb-2">
            If you are at the venue, try these fixes:
          </p>
          <ul className="text-xs text-gray-500 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-danger mt-0.5">•</span>
              Move closer to a window for GPS signal
            </li>
            <li className="flex items-start gap-2">
              <span className="text-danger mt-0.5">•</span>
              Connect to campus Wi-Fi
            </li>
            <li className="flex items-start gap-2">
              <span className="text-danger mt-0.5">•</span>
              Ask your admin to enable Demo Mode
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onVerify}
            className="cyber-btn flex-1 text-sm flex items-center justify-center gap-2"
            id="retry-verify-btn"
          >
            Try Again
          </button>
          <button
            onClick={() => window.open('mailto:admin@aitr.ac.in', '_blank')}
            className="cyber-btn-outline flex-1 text-sm"
            id="contact-organizer-btn"
          >
            Contact Organizer
          </button>
        </div>
      </div>
    );
  }

  /* ─── STATE: demo ─── */
  if (geoState === 'demo') {
    return (
      <div className="gate-card gate-demo animate-fade-in-slide">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-warning tracking-tight">
              DEMO MODE ACTIVE
            </h3>
          </div>
        </div>

        <p className="text-sm text-gray-400">
          Geofence bypassed for demonstration. Scanner is open.
        </p>
      </div>
    );
  }

  return null;
};

/* ─── Helper: Info row used in idle state ─── */
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-muted font-mono uppercase tracking-wider min-w-[140px]">
      {label}
    </span>
    <span className="text-sm text-white font-medium">{value}</span>
  </div>
);
