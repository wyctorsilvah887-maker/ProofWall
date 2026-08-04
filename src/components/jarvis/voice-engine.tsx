
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { processSpokenQuery } from '@/ai/flows/process-spoken-query';
import { speakGenAIResponse } from '@/ai/flows/speak-gen-ai-response';
import { AssistantStatus, StatusCircle } from './status-circle';
import { Button } from '@/components/ui/button';
import { Mic, Power, Terminal, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

export const VoiceEngine = () => {
  const [status, setStatus] = useState<AssistantStatus>('off');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [history, setHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isManuallyStopping = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'pt-BR';
      }

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setHistory(prev => [...prev, { role: 'user', text }]);
        await handleProcessQuery(text);
      };

      recognitionRef.current.onend = () => {
        if (status === 'listening' && !isManuallyStopping.current) {
          setStatus('processing');
        } else if (isManuallyStopping.current) {
          isManuallyStopping.current = false;
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.error('Speech recognition error', event);
        }
        setStatus('idle');
      };
    }
  }, [status]);

  const handleProcessQuery = async (query: string) => {
    setStatus('processing');
    try {
      const { response } = await processSpokenQuery({ query });
      setAiResponse(response);
      setHistory(prev => [...prev, { role: 'assistant', text: response }]);
      
      const { audioDataUri } = await speakGenAIResponse({ text: response });
      
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        setStatus('speaking');
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Processing error', error);
      setStatus('idle');
    }
  };

  const togglePower = () => {
    if (status === 'off') {
      setStatus('idle');
    } else {
      stopAll();
      setStatus('off');
    }
  };

  const startListening = () => {
    if (status === 'off') return;
    stopAll();
    setStatus('listening');
    isManuallyStopping.current = false;
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setStatus('idle');
    }
  };

  const stopListening = () => {
    isManuallyStopping.current = true;
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }
    setStatus('idle');
  };

  const stopAll = () => {
    try {
      recognitionRef.current?.abort();
    } catch (e) {
      // Ignore
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleAudioEnd = useCallback(() => {
    setStatus('idle');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl px-4 py-8">
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />

      {/* Main Dashboard Area */}
      <div className="flex flex-col items-center gap-12 w-full">
        
        {/* Status Display Text */}
        <div className="text-center space-y-2">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary">
            JARVIS
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm flex items-center justify-center gap-2">
            <span className={cn(
              "w-2 h-2 rounded-full",
              status === 'off' ? "bg-red-500" : "bg-green-500 animate-pulse"
            )} />
            {status === 'off' ? 'System Offline' : `System ${status}`}
          </p>
        </div>

        {/* Central Circle */}
        <div 
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={status === 'off' ? togglePower : (status === 'listening' ? stopListening : startListening)}
        >
          <StatusCircle status={status} />
        </div>

        {/* Interaction Details Area */}
        <div className="w-full h-48 bg-card/50 rounded-2xl border border-primary/10 overflow-hidden flex flex-col glow-primary/5">
          <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary/80 uppercase tracking-widest">Interface Log</span>
            </div>
            {status !== 'off' && (
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/20" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="w-2 h-2 rounded-full bg-primary/60" />
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto font-body space-y-3">
            {history.length === 0 ? (
              <p className="text-muted-foreground italic text-center text-sm py-4">
                {status === 'off' ? 'System in standby. Activate to initiate uplink.' : 'Awaiting voice command...'}
              </p>
            ) : (
              history.map((item, idx) => (
                <div key={idx} className={cn(
                  "flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2",
                  item.role === 'assistant' ? "text-primary" : "text-foreground"
                )}>
                  <span className="font-bold font-mono opacity-50 uppercase min-w-[80px]">
                    [{item.role}]:
                  </span>
                  <p className={cn(
                    item.role === 'assistant' ? "font-medium" : "opacity-80"
                  )}>{item.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            className={cn(
              "rounded-full w-14 h-14 border-2 transition-all duration-300",
              status === 'off' ? "border-muted text-muted" : "border-accent text-accent hover:bg-accent/10 hover:text-accent"
            )}
            onClick={togglePower}
          >
            <Power className="w-6 h-6" />
          </Button>

          <Button 
            size="lg" 
            disabled={status === 'off'}
            className={cn(
              "rounded-full h-16 px-8 font-headline font-bold text-lg tracking-wide glow-primary transition-all duration-300",
              status === 'listening' ? "bg-accent hover:bg-accent/90 animate-pulse" : "bg-primary hover:bg-primary/90"
            )}
            onClick={status === 'listening' ? stopListening : startListening}
          >
            {status === 'listening' ? (
              <><VolumeX className="mr-2" /> Stop Listening</>
            ) : (
              <><Mic className="mr-2" /> Speak Now</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
