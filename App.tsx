import React, { useState, useEffect, useCallback } from 'react';
import { TEAMS, INITIAL_BATTERS, INITIAL_BOWLERS } from './constants';
import { MatchState, Player, Bowler, CommentaryLine } from './types';
import { ScoreCard } from './components/ScoreCard';
import { PlayerStats } from './components/PlayerStats';
import { CommentaryFeed } from './components/CommentaryFeed';
import { getAICommentary, getMatchSummary } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [matchState, setMatchState] = useState<MatchState>({
    totalRuns: 83,
    wickets: 2,
    overs: 8,
    balls: 2,
    currentRunRate: 9.96,
    target: 180,
    battingTeam: TEAMS.batting,
    bowlingTeam: TEAMS.bowling,
    isMatchActive: false,
    isMatchFinished: false
  });

  const [players, setPlayers] = useState<Player[]>(INITIAL_BATTERS);
  const [bowler, setBowler] = useState<Bowler>(INITIAL_BOWLERS[0]);
  const [commentary, setCommentary] = useState<CommentaryLine[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("Click 'Start Live Simulation' to begin commentary.");

  // Simulation Logic
  const processBall = useCallback(async () => {
    if (matchState.wickets >= 10 || matchState.totalRuns >= matchState.target) {
      setMatchState(prev => ({ ...prev, isMatchActive: false, isMatchFinished: true }));
      return;
    }

    // Determine random event
    const events = ['0', '1', '1', '1', '2', '4', '4', '6', 'W', '0', '1'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Find active batters
    const activeBatters = players.filter(p => !p.out);
    const strikerIndex = players.findIndex(p => p.id === activeBatters[0].id);
    const nonStrikerIndex = players.findIndex(p => p.id === activeBatters[1].id);

    if (strikerIndex === -1 || nonStrikerIndex === -1) return;

    let runs = 0;
    let isWicket = false;
    let commentText = "";
    
    // Handle Event
    if (event === 'W') {
      isWicket = true;
      commentText = `OUT! ${players[strikerIndex].name} is gone. Big wicket for ${matchState.bowlingTeam}!`;
    } else {
      runs = parseInt(event);
      commentText = runs === 4 ? "FOUR! Beautiful shot through the covers." : 
                    runs === 6 ? "SIX! That's huge, straight down the ground!" :
                    runs === 0 ? "No run, good delivery." : `${runs} run(s) taken.`;
    }

    // AI Commentary for big moments
    let aiComment = "";
    if (event === '4' || event === '6' || event === 'W') {
       aiComment = await getAICommentary(event, players[strikerIndex].name, bowler.name, `${matchState.totalRuns}/${matchState.wickets}`);
    }

    // Update Match State
    setMatchState(prev => {
      const newBalls = prev.balls + 1;
      const newOvers = newBalls === 6 ? prev.overs + 1 : prev.overs;
      const calcBalls = newBalls === 6 ? 0 : newBalls;
      
      return {
        ...prev,
        totalRuns: prev.totalRuns + runs,
        wickets: isWicket ? prev.wickets + 1 : prev.wickets,
        overs: newOvers,
        balls: calcBalls,
        currentRunRate: parseFloat(((prev.totalRuns + runs) / (newOvers + calcBalls/6)).toFixed(2))
      };
    });

    // Update Players
    setPlayers(prev => {
      const newPlayers = [...prev];
      const striker = newPlayers[strikerIndex];
      
      striker.runs += runs;
      striker.balls += 1;
      if (runs === 4) striker.fours += 1;
      if (runs === 6) striker.sixes += 1;
      if (isWicket) {
          striker.out = true;
          striker.isStriker = false;
          // Bring in next batsman if available (Mock logic)
          const nextBatIndex = prev.findIndex(p => p.runs === 0 && p.balls === 0 && !p.out && p.id !== activeBatters[1].id);
          if (nextBatIndex !== -1) {
              newPlayers[nextBatIndex].isStriker = true;
          }
      }

      // Rotate strike
      if (runs % 2 !== 0) {
        if (!isWicket) striker.isStriker = false;
        newPlayers[nonStrikerIndex].isStriker = true;
      }
      
      // Rotate strike at end of over
      if (matchState.balls === 5) { // It was the 6th ball
         const currentStriker = newPlayers.find(p => p.isStriker);
         const currentNonStriker = activeBatters.find(p => p.id !== currentStriker?.id);
         if(currentStriker && currentNonStriker) {
            // Simple swap for logic
             const sIdx = newPlayers.findIndex(p => p.id === currentStriker.id);
             const nsIdx = newPlayers.findIndex(p => p.id === currentNonStriker.id);
             newPlayers[sIdx].isStriker = false;
             newPlayers[nsIdx].isStriker = true;
         }
      }

      return newPlayers;
    });

    // Update Bowler
    setBowler(prev => ({
      ...prev,
      runsConceded: prev.runsConceded + runs,
      wickets: isWicket ? prev.wickets + 1 : prev.wickets,
      overs: matchState.balls === 5 ? prev.overs + 1 : prev.overs // Simplified
    }));

    // Add Commentary
    const newLine: CommentaryLine = {
      id: Date.now().toString(),
      over: matchState.overs,
      ball: matchState.balls + 1,
      text: aiComment ? aiComment : commentText,
      event: event,
      isAI: !!aiComment
    };
    
    setCommentary(prev => [newLine, ...prev]);

  }, [matchState, players, bowler]);

  // Game Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (matchState.isMatchActive) {
      interval = setInterval(processBall, 3500); // New ball every 3.5 seconds
    }
    return () => clearInterval(interval);
  }, [matchState.isMatchActive, processBall]);

  // Periodic AI Summary
  useEffect(() => {
    if(matchState.isMatchActive && matchState.balls === 0 && matchState.overs > 0) {
       // End of over summary
       getMatchSummary(`${matchState.totalRuns}/${matchState.wickets}`, `${matchState.overs}`).then(res => setAiSummary(res));
    }
  }, [matchState.overs, matchState.isMatchActive]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight">CricLive<span className="text-blue-500">AI</span></h1>
          </div>
          <button 
            onClick={() => setMatchState(prev => ({...prev, isMatchActive: !prev.isMatchActive}))}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              matchState.isMatchActive 
              ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
              : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
            }`}
          >
            {matchState.isMatchActive ? 'Pause Simulation' : 'Start Live Simulation'}
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-4 max-w-4xl">
        {/* Match Info */}
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm uppercase tracking-widest">T20 World Cup • Group A</p>
          <div className="flex justify-center items-center gap-4 mt-2">
            <span className="text-2xl font-bold text-gray-300">{TEAMS.batting}</span>
            <span className="text-gray-600 font-bold">VS</span>
            <span className="text-2xl font-bold text-gray-500">{TEAMS.bowling}</span>
          </div>
        </div>

        <ScoreCard matchState={matchState} battingTeam={TEAMS.batting} />
        
        {/* AI Insight Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
           <div className="mt-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           </div>
           <div>
             <h4 className="text-blue-400 font-bold text-sm uppercase">Gemini AI Insight</h4>
             <p className="text-gray-300 text-sm mt-1">{aiSummary}</p>
           </div>
        </div>

        <PlayerStats batters={players} currentBowler={bowler} />
        
        <CommentaryFeed commentary={commentary} />

      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-800 bg-slate-900">
        <div className="container mx-auto text-center">
          <p className="text-gray-500 text-sm mb-2">
            &copy; 2024 CricLive AI. All rights reserved.
          </p>
          <p className="text-lg font-semibold text-blue-400 animate-pulse">
            Powered By Irfan Ali
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;