import React from 'react';
import { Player, Bowler } from '../types';

interface PlayerStatsProps {
  batters: Player[];
  currentBowler: Bowler;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ batters, currentBowler }) => {
  const activeBatters = batters.filter(b => !b.out).slice(0, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Batting Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 border-b border-slate-700 pb-2">Batter</h3>
        <div className="space-y-3">
          {activeBatters.map((player) => (
            <div key={player.id} className={`flex justify-between items-center ${player.isStriker ? 'bg-slate-700/50 -mx-2 px-2 py-1 rounded' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{player.name} {player.isStriker && '*'}</span>
              </div>
              <div className="text-sm">
                <span className="font-bold text-white text-lg">{player.runs}</span>
                <span className="text-gray-400 text-xs ml-1">({player.balls})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bowling Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-gray-400 text-xs font-bold uppercase mb-3 border-b border-slate-700 pb-2">Bowler</h3>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="font-semibold text-white text-lg">{currentBowler.name}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">O</p>
              <p className="font-bold">{currentBowler.overs}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">R</p>
              <p className="font-bold">{currentBowler.runsConceded}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">W</p>
              <p className="font-bold">{currentBowler.wickets}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};