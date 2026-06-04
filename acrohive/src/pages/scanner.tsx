import React, { useState, useCallback } from 'react';
import { ScanLine, CheckCircle2, XCircle, Shield, ChevronDown, Radio } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useGeofence } from '@/hooks/useGeofence';
import { GeofenceGate } from '@/components/scanner/GeofenceGate';
import { QRCamera } from '@/components/scanner/QRCamera';
import { ScanLog } from '@/components/scanner/ScanLog';
import { VerificationBadge } from '@/components/scanner/VerificationBadge';
import { StatCard } from '@/components/ui/StatCard';
import type { Event, ScanResult, ScanCounters } from '@/types';

export default function ScannerPage() {
  const { events, loading, error } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { geoState, distance, method, verify, reset } = useGeofence(selectedEvent);

  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [counters, setCounters] = useState<ScanCounters>({ valid: 0, invalid: 0 });

  const handleEventChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const eventId = e.target.value;
      const event = events.find((ev) => ev.id === eventId) || null;
      setSelectedEvent(event);
      reset();
      setScanResults([]);
      setCounters({ valid: 0, invalid: 0 });
    },
    [events, reset]
  );

  const handleScanResult = useCallback((result: ScanResult) => {
    setScanResults((prev) => [result, ...prev].slice(0, 20));
  }, []);

  const handleCounterUpdate = useCallback((newCounters: ScanCounters) => {
    setCounters(newCounters);
  }, []);

  const isScannerActive = geoState === 'verified' || geoState === 'demo';

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <div className="border-b border-white/5 bg-surface-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Attendance Scanner
            </h1>
            <p className="text-xs text-muted">Geofenced QR check-in system</p>
          </div>
          {isScannerActive && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs text-emerald-400 font-mono">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Valid scans"
            value={counters.valid}
            icon={<CheckCircle2 className="w-4 h-4" />}
            variant="primary"
          />
          <StatCard
            label="Invalid scans"
            value={counters.invalid}
            icon={<XCircle className="w-4 h-4" />}
            variant="danger"
          />
          <StatCard
            label="Verification"
            value={
              method === 'gps'
                ? 'GPS'
                : method === 'ip'
                ? 'Network'
                : method === 'demo'
                ? 'Demo'
                : '—'
            }
            icon={<Shield className="w-4 h-4" />}
            variant={method === 'demo' ? 'warning' : 'info'}
          />
        </div>

        {/* ─── Event Selector ─── */}
        <div className="space-y-2">
          <label className="text-xs text-muted font-mono uppercase tracking-wider">
            Select Event to Scan For
          </label>
          <div className="relative">
            <select
              value={selectedEvent?.id || ''}
              onChange={handleEventChange}
              disabled={loading}
              className="
                w-full appearance-none bg-surface-card border border-white/10
                rounded-lg px-4 py-3 pr-10 text-sm text-white
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
                transition-colors duration-200 cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed
              "
              id="event-selector"
            >
              <option value="" disabled>
                {loading ? 'Loading events...' : 'Choose an active event...'}
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id} className="bg-surface-card">
                  {event.title} — {event.venue_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>

          {/* Error or empty state */}
          {error && (
            <p className="text-xs text-danger">{error}</p>
          )}
          {!loading && !error && events.length === 0 && (
            <div className="bg-surface-card border border-white/5 rounded-lg p-6 text-center">
              <Radio className="w-8 h-8 text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted">
                No events have opened their attendance window yet.
              </p>
              <p className="text-xs text-muted/60 mt-1">
                Ask your organizer to open attendance for an event.
              </p>
            </div>
          )}
        </div>

        {/* ─── Geofence Gate ─── */}
        {selectedEvent && !isScannerActive && (
          <GeofenceGate
            geoState={geoState}
            distance={distance}
            method={method}
            event={selectedEvent}
            onVerify={verify}
            onReset={reset}
          />
        )}

        {/* ─── Verified / Demo status card (persists above camera) ─── */}
        {selectedEvent && isScannerActive && (
          <GeofenceGate
            geoState={geoState}
            distance={distance}
            method={method}
            event={selectedEvent}
            onVerify={verify}
            onReset={reset}
          />
        )}

        {/* ─── QR Camera (only after verification) ─── */}
        {selectedEvent && isScannerActive && (
          <QRCamera
            eventId={selectedEvent.id}
            verificationMethod={method}
            distance={distance}
            onScanResult={handleScanResult}
            counters={counters}
            onCounterUpdate={handleCounterUpdate}
          />
        )}

        {/* ─── Scan Log ─── */}
        {isScannerActive && <ScanLog results={scanResults} />}
      </div>
    </div>
  );
}
