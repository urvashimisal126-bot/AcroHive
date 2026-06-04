import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { ScanResult } from '@/types';

interface ScanLogProps {
  results: ScanResult[];
}

/**
 * Rolling log of recent QR scans displayed below the camera viewport.
 * Shows last scanned student name + timestamp.
 */
export const ScanLog: React.FC<ScanLogProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="mt-4 text-center py-6">
        <p className="text-xs text-muted font-mono">No scans yet. Point camera at a QR ticket.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
      <h4 className="text-xs text-muted font-mono uppercase tracking-wider mb-3">
        Scan Log
      </h4>
      {results.map((result, index) => (
        <div
          key={`${result.timestamp}-${index}`}
          className={`
            flex items-start gap-3 p-3 rounded-lg border text-sm
            animate-fade-in-slide
            ${
              result.success
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-danger/5 border-danger/20'
            }
          `}
        >
          {/* Icon */}
          <div className="mt-0.5 flex-shrink-0">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-danger" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                result.success ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {result.message}
            </p>
            {result.studentName && (
              <p className="text-xs text-muted mt-0.5">{result.studentName}</p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-muted flex-shrink-0">
            <Clock className="w-3 h-3" />
            {new Date(result.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
