import React from 'react';
import { MatchState } from '../types';

interface ScoreCardProps {
  matchState: MatchState;
  battingTeam: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ matchState, battingTeam }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg border border-slate-700 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Batting</h2>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <img src={`https://picsum.photos/seed/${battingTeam}/40/40`} alt="flag" className="w-8 h-8 rounded-full" />
            {battingTeam}
          </h1>
        </div>
        <div className="text-right">
          <div className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse-fast mb-1">
            LIVE
          </div>
          <p className="text-gray-400 text-sm">Target: {matchState.target}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <span className="text-6xl font-black text-white tracking-tighter">
            {matchState.totalRuns}/{matchState.wickets}
          </span>
          <span className="text-xl text-gray-400 ml-3">
            ({matchState.overs}.{matchState.balls} Overs)
          </span>
        </div>
        
        <div className="flex gap-4">
          <div className="text-center bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-gray-500">CRR</p>
            <p className="text-xl font-bold text-blue-400">{matchState.currentRunRate}</p>
          </div>
          <div className="text-center bg-slate-800 p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-gray-500">REQ</p>
            <p className="text-xl font-bold text-orange-400">
              {matchState.isMatchFinished ? '-' : ((matchState.target - matchState.totalRuns) / (120 - (matchState.overs * 6 + matchState.balls)) * 6).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};