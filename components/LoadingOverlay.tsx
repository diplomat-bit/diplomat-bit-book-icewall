
import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  message: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => (t <= 1 ? 30 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[100] text-sky-400 overflow-hidden">
      {/* Background Ice Shards effect */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[1px] h-[120%] bg-sky-400 rotate-[45deg]"></div>
        <div className="absolute top-[-10%] left-[50%] w-[1px] h-[120%] bg-sky-400 rotate-[-15deg]"></div>
        <div className="absolute top-[-10%] left-[80%] w-[1px] h-[120%] bg-sky-400 rotate-[30deg]"></div>
      </div>
      
      <div className="relative w-56 h-56 mb-16 flex items-center justify-center">
        <div className="absolute inset-0 border-[4px] border-sky-500/5 rounded-[30%] animate-spin [animation-duration:10s]"></div>
        <div className="absolute inset-2 border-[2px] border-transparent border-t-sky-400 rounded-full animate-spin [animation-duration:2s]"></div>
        <div className="absolute inset-6 border-[1px] border-transparent border-b-sky-300 rounded-full animate-spin [animation-duration:4s]"></div>
        
        <div className="text-center z-10">
          <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">{timer}s</span>
          <p className="text-[10px] font-mono-tech text-sky-400 uppercase tracking-widest mt-2">Cycle Reset</p>
        </div>
      </div>
      
      <div className="text-center max-w-xl px-10">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">
          Uncovering Forgotten Lore
        </h2>
        <div className="bg-sky-500/10 border border-sky-400/20 px-6 py-4 rounded-2xl inline-block mb-12 shadow-2xl">
            <p className="text-sky-300 font-mono-tech text-xs uppercase tracking-[0.2em]">{message}</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-4 gap-8 opacity-60">
        <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mb-3 animate-ping"></div>
            <span className="text-[9px] font-bold font-mono-tech uppercase">Brains</span>
        </div>
        <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mb-3 animate-ping [animation-delay:0.5s]"></div>
            <span className="text-[9px] font-bold font-mono-tech uppercase">Serious</span>
        </div>
        <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mb-3 animate-ping [animation-delay:1s]"></div>
            <span className="text-[9px] font-bold font-mono-tech uppercase">Clown</span>
        </div>
        <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mb-3 animate-ping [animation-delay:1.5s]"></div>
            <span className="text-[9px] font-bold font-mono-tech uppercase">Dreamer</span>
        </div>
      </div>
    </div>
  );
};
