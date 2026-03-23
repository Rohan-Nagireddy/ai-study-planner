import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Flame, 
  BookOpen, 
  Clock,
  Lock,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const ACHIEVEMENTS = [
  {
    id: 1,
    title: "Fresh Start",
    description: "Complete your first study task.",
    icon: Star,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    unlocked: true,
    progress: 100
  },
  {
    id: 2,
    title: "Focus Master",
    description: "Reach a focus score of 90+ in a session.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    unlocked: true,
    progress: 100
  },
  {
    id: 3,
    title: "Study Streak",
    description: "Maintain a study streak for 7 consecutive days.",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    unlocked: false,
    progress: 42
  },
  {
    id: 4,
    title: "Nerd Status",
    description: "Complete 50 study tasks total.",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    unlocked: false,
    progress: 24
  },
  {
    id: 5,
    title: "Time Well Spent",
    description: "Log more than 100 hours of focused study.",
    icon: Clock,
    color: "text-green-500",
    bg: "bg-green-500/10",
    unlocked: false,
    progress: 15
  },
  {
    id: 6,
    title: "Admin Choice",
    description: "Receive a platform-wide commendation.",
    icon: Award,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    unlocked: false,
    progress: 0
  }
];

export function Achievements() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="text-primary" /> Achievements
          </h1>
          <p className="text-muted-foreground mt-1">Track your milestones and celebrate your academic growth.</p>
        </div>
        <div className="px-6 py-2 bg-primary/10 text-primary rounded-2xl flex items-center gap-3 font-bold">
          <Target size={20} />
          Level 4 Scholar
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-6 bg-card border border-border rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-all",
              !achievement.unlocked && "opacity-75 grayscale-[0.5]"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", achievement.bg, achievement.color)}>
                <achievement.icon size={28} />
              </div>
              {!achievement.unlocked && <Lock size={16} className="text-muted-foreground mt-2" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {achievement.description}
              </p>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Progress</span>
                <span>{achievement.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${achievement.progress}%` }}
                  className={cn("h-full transition-all duration-1000", achievement.unlocked ? "bg-primary" : "bg-muted-foreground/30")}
                />
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <achievement.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-3xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-black/20 flex items-center justify-center p-4">
            <Trophy size={40} className="text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">Hall of Fame</h2>
            <p className="text-muted-foreground">Keep pushing! You're in the top 15% of students this month. Completing 3 more tasks will unlock the "Scholar" badge.</p>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">
            View Leaderboard <ChevronRight className="inline ml-1" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
