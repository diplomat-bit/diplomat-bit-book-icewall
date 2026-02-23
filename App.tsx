
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { LoadingOverlay } from './components/LoadingOverlay';
import { INITIAL_BOOK_DATA } from './constants';
import { generateSectionPageTitles, generateChapterContent, playExecutiveSummary } from './services/geminiService';
import { downloadBookAsHtml } from './utils/downloadHelper';
import { SparklesIcon, DownloadIcon } from './components/IconComponents';
import type { Book, Section, Chapter, Page } from './types';

const LOCAL_STORAGE_KEY = 'ice-wall-expedition-v1';

const App: React.FC = () => {
  const [bookData, setBookData] = useState<Book>(() => {
    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_BOOK_DATA;
  });

  const [selectedPath, setSelectedPath] = useState<string>('0-0');
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [genProgress, setGenProgress] = useState({ pillar: '', domain: '', step: 0 });

  useEffect(() => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookData));
  }, [bookData]);

  const { sectionIndex, chapterIndex, pageIndex } = useMemo(() => {
    const [sec, chap, page] = selectedPath.split('-').map(Number);
    return { sectionIndex: sec, chapterIndex: chap, pageIndex: page };
  }, [selectedPath]);

  const selectedSection: Section | undefined = bookData[sectionIndex];
  const selectedChapter: Chapter | undefined = selectedSection?.chapters[chapterIndex];
  const selectedPage: Page | undefined = !isNaN(pageIndex) ? selectedChapter?.pages[pageIndex] : undefined;

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    setError(null);
    let currentBook = JSON.parse(JSON.stringify(bookData));

    try {
      // Parallelize Pillars at the start
      const sectionPromises = currentBook.map(async (section: Section, sIdx: number) => {
        setGenProgress(prev => ({ ...prev, pillar: `Architecting: ${section.title}`, step: sIdx + 1 }));
        
        // Stage 1: The Brains maps the section
        const titlesData = await generateSectionPageTitles(section.title, section.chapters.map(c => c.title));
        
        // Process chapters sequentially within the pillar to maintain flow, 
        // but pillars themselves run in parallel
        for (let c = 0; c < section.chapters.length; c++) {
          const chapter = section.chapters[c];
          setGenProgress(prev => ({ ...prev, domain: `Narrating: ${chapter.title}` }));
          
          const match = titlesData.find(t => t.chapterTitle === chapter.title);
          if (match) {
            chapter.pages = match.titles.map(t => ({ title: t, content: '' }));
          }

          const content = await generateChapterContent(section.title, chapter.title, chapter.pages.map(p => p.title));
          chapter.pages.forEach(p => {
            const cMatch = content.find(lc => lc.title === p.title);
            if (cMatch) p.content = cMatch.content;
          });

          // Sync local state copy
          setBookData(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next[sIdx].chapters[c] = chapter;
            return next;
          });
        }
      });

      await Promise.all(sectionPromises);
    } catch (err: any) {
      setError(`Expedition Aborted: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handlePlayAudio = () => {
    if (selectedPage?.content) {
      playExecutiveSummary(selectedPage.content);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex selection:bg-sky-500/30 selection:text-white relative">
      {isGeneratingAll && (
        <LoadingOverlay message={`${genProgress.pillar} — ${genProgress.domain}`} />
      )}
      
      <Sidebar
        book={bookData}
        selectedPath={selectedPath}
        onSelectPath={setSelectedPath}
        onDownload={() => downloadBookAsHtml(bookData)}
      />

      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="flex justify-between items-center mb-8 glass-card p-5 rounded-2xl border-sky-500/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"></div>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-sky-500/10 border border-sky-400/20 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-900/20">
              <SparklesIcon className="w-8 h-8 text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
                Ice Wall Expedition
              </h1>
              <p className="text-[10px] font-mono-tech text-sky-400/60 uppercase tracking-[0.4em] mt-2">Archetype Synchronization Protocol v5.0</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleGenerateAll}
              disabled={isGeneratingAll}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all frost-glow disabled:opacity-50 disabled:cursor-not-allowed border border-sky-400/50"
            >
              {isGeneratingAll ? 'BREACHING...' : 'UNCOVER THE FORGOTTEN'}
            </button>
            <button 
              onClick={() => downloadBookAsHtml(bookData)}
              className="px-6 py-3 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-slate-700 hover:border-sky-500/30"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-0 left-0 right-0 z-50 p-5 bg-red-950/80 border border-red-500/50 text-red-200 rounded-2xl backdrop-blur-xl animate-pulse shadow-2xl flex items-center gap-4">
              <div className="bg-red-500 text-white p-2 rounded-lg font-black text-xs uppercase">Crit</div>
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}
          
          <div className="h-full">
            {selectedChapter ? (
              <Editor
                section={selectedSection}
                chapter={selectedChapter}
                page={selectedPage}
                sectionNumber={sectionIndex + 1}
                chapterNumber={chapterIndex + 1}
                pageNumber={!isNaN(pageIndex) ? pageIndex + 1 : undefined}
                error={null}
                onPageContentChange={(content) => {
                   setBookData(prev => {
                     const next = JSON.parse(JSON.stringify(prev));
                     next[sectionIndex].chapters[chapterIndex].pages[pageIndex].content = content;
                     return next;
                   });
                }}
                onSelectPage={(idx) => setSelectedPath(`${sectionIndex}-${chapterIndex}-${idx}`)}
                onAutoGenerateChapter={async () => {
                   setError(null);
                   try {
                     const content = await generateChapterContent(selectedSection.title, selectedChapter.title, selectedChapter.pages.map(p => p.title));
                     setBookData(prev => {
                       const next = JSON.parse(JSON.stringify(prev));
                       next[sectionIndex].chapters[chapterIndex].pages = content;
                       return next;
                     });
                   } catch (e: any) {
                     setError(e.message);
                   }
                }}
                chapterGenerationStatus={{ active: false, message: '' }}
                onAudioSummary={handlePlayAudio}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 font-mono-tech uppercase tracking-widest opacity-30">
                <div className="w-32 h-1 bg-sky-900 mb-6 animate-pulse"></div>
                Initializing Expedition HUD
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
