import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Skull, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { focusService, analyticsService } from '../services/dataService';

export function FocusMode() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, break
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [stats, setStats] = useState({ distractions: 0, todayTotal: '0h 0m', sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const res = await focusService.getActive();
      if (res.data.data) {
        const session = res.data.data;
        setCurrentSessionId(session.id);
        setIsActive(true);
        // Calculate remaining time
        const start = new Date(session.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        const totalFocusSeconds = 25 * 60;
        
        if (elapsedSeconds < totalFocusSeconds) {
          const remainingSeconds = totalFocusSeconds - elapsedSeconds;
          setMinutes(Math.floor(remainingSeconds / 60));
          setSeconds(remainingSeconds % 60);
        } else {
          // Session already completed its 25 mins
          setMinutes(0);
          setSeconds(0);
        }
      }
    } catch (error) {
      console.error('Failed to check active session', error);
    }
  };

  const fetchStats = async () => {
    try {
      const analyticsRes = await analyticsService.getDaily();
      const daily = analyticsRes.data.data;
      setStats(prev => ({
        ...prev,
        todayTotal: `${daily.totalStudyHours}h ${Math.round((daily.totalStudyHours % 1) * 60)}m`,
        sessions: daily.sessionsCompleted
      }));
    } catch (error) {
      console.error('Failed to fetch focus stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerComplete();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (mode === 'focus' && currentSessionId) {
      try {
        await focusService.endSession(currentSessionId, stats.distractions);
        setCurrentSessionId(null);
        fetchStats();
      } catch (error) {
        console.error('Failed to end session', error);
      }
    }
    setMode(mode === 'focus' ? 'break' : 'focus');
    setMinutes(mode === 'focus' ? 5 : 25);
    setSeconds(0);
  };

  const toggleTimer = async () => {
    if (!isActive && mode === 'focus' && !currentSessionId) {
      try {
        const res = await focusService.startSession();
        setCurrentSessionId(res.data.data.id);
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start session', error);
        alert(error.response?.data?.message || 'Failed to start session');
      }
    } else {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const progress = ((mode === 'focus' ? 25 : 5) * 60 - (minutes * 60 + seconds)) / ((mode === 'focus' ? 25 : 5) * 60) * 100;

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter">Deep Focus Zone</h1>
        <p className="text-muted-foreground text-lg">Silence the noise. Conquer your modules.</p>
      </div>

      <div className="relative aspect-square max-w-sm mx-auto flex items-center justify-center">
        {/* Progress Circle (SVG) */}
        <svg className="w-full h-full -rotate-90">
          <circle 
            cx="50%" cy="50%" r="48%" 
            className="stroke-secondary fill-transparent stroke-[8]" 
          />
          <motion.circle 
            cx="50%" cy="50%" r="48%" 
            className={cn(
              "fill-transparent stroke-[8]", 
              mode === 'focus' ? "stroke-primary" : "stroke-green-500"
            )}
            style={{ 
              pathLength: progress / 100, 
              transition: { duration: 0.5, ease: "linear" } 
            }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2"
            >
              {mode === 'focus' ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                  <Skull size={14} /> Focus session
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Coffee size={14} /> Break time
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <span className="text-7xl font-light tracking-tighter tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw size={28} />
        </button>
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center text-primary-foreground shadow-2xl transition-all hover:scale-105 active:scale-95",
            isActive ? "bg-secondary text-foreground" : "bg-primary shadow-primary/30"
          )}
        >
          {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
        </button>
        <button 
          onClick={() => setStats(s => ({ ...s, distractions: s.distractions + 1 }))}
          className="p-4 rounded-2xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          title="Mark distraction"
        >
          <AlertCircle size={28} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Distractions</p>
          <h4 className="text-2xl font-bold mt-1">{stats.distractions}</h4>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Today Total</p>
          <h4 className="text-2xl font-bold mt-1">{stats.todayTotal}</h4>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl text-center">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Sessions</p>
          <h4 className="text-2xl font-bold mt-1">{stats.sessions}</h4>
        </div>
      </div>
    </div>
  );
}



