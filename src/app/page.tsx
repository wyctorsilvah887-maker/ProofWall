import { VoiceEngine } from '@/components/jarvis/voice-engine';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#141110] selection:bg-primary selection:text-primary-foreground flex flex-col items-center justify-center">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FF8000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Dynamic Scanline Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.01] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="relative z-10 w-full flex justify-center">
        <VoiceEngine />
      </div>
    </main>
  );
}
