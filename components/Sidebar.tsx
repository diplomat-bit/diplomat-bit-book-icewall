
import React, { useState } from 'react';
import type { Book } from '../types';
import { ChevronRightIcon, ChevronDownIcon, DownloadIcon } from './IconComponents';

interface SidebarProps {
  book: Book;
  selectedPath: string;
  onSelectPath: (key: string) => void;
  onDownload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ book, selectedPath, onSelectPath, onDownload }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <aside className="w-80 bg-slate-950 border-r border-sky-900/30 flex flex-col p-5 shadow-2xl relative z-20">
      <div className="mb-10 p-5 bg-sky-900/10 border border-sky-400/10 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <h2 className="text-[10px] font-mono-tech text-sky-400 uppercase tracking-[0.3em] mb-2 font-bold">Archive Log</h2>
        <p className="text-xl font-black text-white tracking-tighter uppercase italic">Frozen Relics</p>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar pr-3">
        {book.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 px-2 flex items-center justify-between">
              <span>Tier 0{sIdx + 1}</span>
              <div className="h-[1px] flex-1 ml-4 bg-slate-800"></div>
            </h3>
            <ul className="space-y-1.5">
              {section.chapters.map((chapter, cIdx) => {
                const key = `${sIdx}-${cIdx}`;
                const isExp = expanded.has(key);
                const isSel = selectedPath.startsWith(key);

                return (
                  <li key={cIdx}>
                    <button
                      onClick={() => { toggle(key); onSelectPath(key); }}
                      className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group relative overflow-hidden ${
                        isSel ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight uppercase tracking-wide truncate pr-4">
                        {chapter.title}
                      </span>
                      {isExp ? <ChevronDownIcon className="w-3 h-3 opacity-40" /> : <ChevronRightIcon className="w-3 h-3 opacity-40" />}
                    </button>
                    {isExp && (
                      <ul className="mt-2 ml-4 border-l border-sky-900/40 pl-4 space-y-1">
                        {chapter.pages.map((p, pIdx) => {
                          const pKey = `${key}-${pIdx}`;
                          const isPSel = selectedPath === pKey;
                          return (
                            <li key={pIdx}>
                              <button
                                onClick={() => onSelectPath(pKey)}
                                className={`w-full text-left py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border-l-2 ${
                                  isPSel ? 'border-sky-400 bg-sky-400/5 text-sky-200' : 'border-transparent text-slate-500 hover:text-slate-200'
                                }`}
                              >
                                {p.title}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 space-y-3">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-900/20 border border-sky-400/50"
        >
          <DownloadIcon className="w-4 h-4" />
          Export Log
        </button>
      </div>
    </aside>
  );
};
