import React, { useRef, useEffect } from 'react';
import { CommentaryLine } from '../types';

interface CommentaryFeedProps {
  commentary: CommentaryLine[];
}

export const CommentaryFeed: React.FC<CommentaryFeedProps> = ({ commentary }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [commentary]);

  const getEventColor = (event: string) => {
    if (event === '4') return 'bg-green-600 text-white';
    if (event === '6') return 'bg-purple-600 text-white';
    if (event === 'W') return 'bg-red-600 text-white';
    return 'bg-slate-700 text-gray-300';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 h-96 flex flex-col">
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 rounded-t-lg">
        <h3 className="font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Live Commentary
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {commentary.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Match starting soon...</p>
        )}
        {commentary.map((line) => (
          <div key={line.id} className={`flex gap-3 animate-fade-in`}>
            <div className="flex flex-col items-center">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getEventColor(line.event)}`}>
                {line.event}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-gray-500">{line.over}.{line.ball}</span>
                <p className={`text-sm ${line.isAI ? 'text-blue-300 italic' : 'text-gray-300'}`}>
                  {line.isAI && <span className="text-xs bg-blue-900/50 text-blue-300 px-1 rounded mr-1">AI</span>}
                  {line.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};