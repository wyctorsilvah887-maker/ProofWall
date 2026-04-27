"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export type AssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'off';

interface StatusCircleProps {
  status: AssistantStatus;
}

export const StatusCircle: React.FC<StatusCircleProps> = ({ status }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
      {/* Outer Ripple effect for active states */}
      {(status === 'listening' || status === 'speaking') && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ripple opacity-20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ripple opacity-10 [animation-delay:1s]" />
        </>
      )}

      {/* Main decorative rings */}
      <div className={cn(
        "absolute inset-4 rounded-full border-4 status-ring border-primary/20",
        status !== 'off' && "border-primary/40"
      )} />
      
      <div className={cn(
        "absolute inset-8 rounded-full border-2 status-ring border-primary/10 transition-all duration-700",
        status === 'processing' && "animate-spin border-t-primary border-r-primary border-b-transparent border-l-transparent"
      )} />

      {/* Central Interactive Circle */}
      <div className={cn(
        "relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500",
        status === 'off' ? "bg-secondary scale-90 opacity-50" : "bg-primary glow-primary",
        status === 'listening' && "scale-110",
        status === 'speaking' && "scale-105",
        status === 'processing' && "opacity-80 scale-95"
      )}>
        {/* Core glow and detail */}
        <div className={cn(
          "w-3/4 h-3/4 rounded-full border-4 border-background/20 flex items-center justify-center",
          status === 'listening' && "animate-pulse"
        )}>
          {/* Internal tech bars/lines */}
          <div className="flex gap-1.5 h-8 items-center">
            {status === 'speaking' || status === 'listening' ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="w-1.5 bg-background/80 rounded-full transition-all duration-300"
                  style={{ 
                    height: status === 'speaking' ? `${Math.random() * 100 + 20}%` : '20%',
                    animation: status === 'speaking' ? `height-bounce ${0.3 + i * 0.1}s infinite alternate` : 'none'
                  }}
                />
              ))
            ) : (
              <div className={cn(
                "w-12 h-1.5 bg-background/40 rounded-full transition-all duration-500",
                status === 'off' ? "scale-0" : "scale-100"
              )} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes height-bounce {
          from { height: 20%; }
          to { height: 100%; }
        }
      `}</style>
    </div>
  );
};
