import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorAlert({ title = 'Error', message, onRetry }) {
  return (
    <div className="p-5 rounded-xl bg-red-950/30 border border-red-800/50 text-red-200">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-red-500/10 text-red-400 mt-0.5 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-200">{title}</h3>
          {message && <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{message}</p>}
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                icon={RefreshCw}
                className="!py-1.5 !text-xs border-red-800/60 hover:bg-red-900/20 text-red-200"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
