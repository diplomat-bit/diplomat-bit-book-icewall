
import React from 'react';
import { SparklesIcon, BookOpenIcon } from './IconComponents';
import type { Section, Chapter, Page } from '../types';

interface EditorProps {
  section?: Section;
  chapter?: Chapter;
  page?: Page;
  sectionNumber?: number;
  chapterNumber?: number;
  pageNumber?: number;
  error: string | null;
  onPageContentChange: (newContent: string) => void;
  onSelectPage: (pageIndex: number) => void;
  onAutoGenerateChapter: () => void;
  chapterGenerationStatus: { active: boolean; message: string };
  onAudioSummary?: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  section,
  chapter,
  page,
  sectionNumber,
  chapterNumber,
  pageNumber,
  onPageContentChange,
  onSelectPage,
  onAutoGenerateChapter,
  chapterGenerationStatus,
  onAudioSummary
}) => {

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onPageContentChange(e.currentTarget.innerText);
  };

  return (
    <div className="h-full flex flex-col glass-card rounded-3xl border border-sky-900/20 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <SparklesIcon className="w-32 h-32 text-sky-400" />
      </div>

      <div className="bg-slate-900/40 p-8 border-b border-sky-900/20 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <span className="text-[10px] font-mono-tech text-sky-400 uppercase tracking-[0.4em] font-black">Memory Fragment</span>
             <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{page ? page.title : chapter?.title}</h2>
          <div className="flex gap-4 mt-5">
             <span className="text-[10px] bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full border border-sky-400/20 font-black uppercase tracking-widest">EXPEDITION_{sectionNumber}{chapterNumber}</span>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Uncovering...</span>
          </div>
        </div>
        {page && (
          <button 
            onClick={onAudioSummary}
            className="flex items-center gap-3 px-6 py-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-400/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all frost-glow"
          >
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></div>
            The Dreamer's Voice
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        {page ? (
          <div className="max-w-3xl mx-auto">
             <div 
               contentEditable 
               onBlur={handleBlur}
               suppressContentEditableWarning 
               className="text-slate-300 text-xl font-light leading-relaxed focus:outline-none min-h-[500px] whitespace-pre-wrap selection:bg-sky-500/40 first-letter:text-5xl first-letter:font-black first-letter:text-sky-400 first-letter:mr-3 first-letter:float-left"
             >
               {page.content || "Silence. The data-glacier is yet to be parsed. Initiate the Synchronization Protocol to uncover the archetypes' journey here."}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {chapter?.pages.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => onSelectPage(idx)}
                  className="p-8 text-left bg-slate-900/40 hover:bg-sky-900/10 border border-slate-800 hover:border-sky-500/40 rounded-3xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[10px] font-mono-tech text-slate-600 group-hover:text-sky-400 uppercase tracking-widest font-bold">Fragment 0{idx+1}</span>
                  <h4 className="text-xl font-black text-white mt-3 group-hover:text-sky-300 transition-colors uppercase italic">{p.title}</h4>
                  <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                     <span className="text-[10px] text-slate-600 font-mono-tech uppercase font-bold tracking-widest">
                       {p.content ? `Bit-Depth: ${p.content.length}b` : 'Data Null'}
                     </span>
                     {p.content && <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_#38bdf8]"></div>}
                  </div>
                </button>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
