import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { VerificationMethod, ScanResult, ScanCounters } from '@/types';

interface QRCameraProps {
  eventId: string;
  verificationMethod: VerificationMethod;
  distance: number | null;
  onScanResult: (result: ScanResult) => void;
  counters: ScanCounters;
  onCounterUpdate: (counters: ScanCounters) => void;
}

const QR_READER_ID = 'qr-reader';

export const QRCamera: React.FC<QRCameraProps> = ({
  eventId,
  verificationMethod,
  distance,
  onScanResult,
  counters,
  onCounterUpdate,
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const processedCodesRef = useRef<Set<string>>(new Set());

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Prevent duplicate scans of the same code in one session
      if (processedCodesRef.current.has(decodedText)) return;
      processedCodesRef.current.add(decodedText);

      const timestamp = new Date().toISOString();

      try {
        // Validate: look up the registration by qr_code_hash
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .select('id, student_name, student_id, event_id')
          .eq('qr_code_hash', decodedText)
          .eq('event_id', eventId)
          .single();

        if (regError || !registration) {
          // Invalid QR — either wrong event or non-existent
          onScanResult({
            success: false,
            studentName: null,
            registrationId: null,
            timestamp,
            message: 'Invalid QR code — not registered for this event.',
          });
          onCounterUpdate({ valid: counters.valid, invalid: counters.invalid + 1 });
          return;
        }

        // Check for duplicate check-in
        const { data: existing } = await supabase
          .from('attendance')
          .select('id')
          .eq('registration_id', registration.id)
          .single();

        if (existing) {
          onScanResult({
            success: false,
            studentName: registration.student_name,
            registrationId: registration.id,
            timestamp,
            message: `${registration.student_name} has already checked in.`,
          });
          onCounterUpdate({ valid: counters.valid, invalid: counters.invalid + 1 });
          return;
        }

        // Insert attendance record
        const { error: insertError } = await supabase.from('attendance').insert({
          registration_id: registration.id,
          event_id: eventId,
          student_id: registration.student_id,
          verified: true,
          verification_method: verificationMethod || 'manual',
          distance_metres: distance,
        });

        if (insertError) {
          console.error('[QRCamera] Attendance insert error:', insertError);
          onScanResult({
            success: false,
            studentName: registration.student_name,
            registrationId: registration.id,
            timestamp,
            message: 'Failed to record attendance. Please try again.',
          });
          onCounterUpdate({ valid: counters.valid, invalid: counters.invalid + 1 });
          return;
        }

        // Success!
        onScanResult({
          success: true,
          studentName: registration.student_name,
          registrationId: registration.id,
          timestamp,
          message: `✓ ${registration.student_name} checked in successfully!`,
        });
        onCounterUpdate({ valid: counters.valid + 1, invalid: counters.invalid });
      } catch (err) {
        console.error('[QRCamera] Scan processing error:', err);
        onScanResult({
          success: false,
          studentName: null,
          registrationId: null,
          timestamp,
          message: 'Scan processing failed. Check connection.',
        });
        onCounterUpdate({ valid: counters.valid, invalid: counters.invalid + 1 });
      }
    },
    [eventId, verificationMethod, distance, onScanResult, counters, onCounterUpdate]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);

    try {
      const scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        handleScanSuccess,
        // Ignore scan failures (no QR found in frame)
        () => {}
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('[QRCamera] Camera start error:', err);
      setCameraError(
        err?.message || 'Could not access camera. Please allow camera permissions.'
      );
    }
  }, [handleScanSuccess]);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('[QRCamera] Camera stop warning:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="mt-6 animate-fade-in-slide">
      {/* Camera controls */}
      {!isCameraActive ? (
        <button
          onClick={startCamera}
          className="cyber-btn w-full flex items-center justify-center gap-2 mb-4"
          id="open-camera-btn"
        >
          <Camera className="w-4 h-4" />
          Open Camera Scanner
        </button>
      ) : (
        <button
          onClick={stopCamera}
          className="cyber-btn-outline w-full flex items-center justify-center gap-2 mb-4 border-danger text-danger hover:bg-danger/10"
          id="close-camera-btn"
        >
          <CameraOff className="w-4 h-4" />
          Close Camera
        </button>
      )}

      {cameraError && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 mb-4 text-sm text-danger">
          {cameraError}
        </div>
      )}

      {/* QR reader viewport */}
      <div
        id={QR_READER_ID}
        className={`w-full max-w-md mx-auto ${!isCameraActive ? 'hidden' : ''}`}
      />
    </div>
  );
};
