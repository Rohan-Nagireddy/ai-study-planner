import React, { useState, useEffect } from 'react';
import { Bell, Search, Hexagon, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const initials = user?.name.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <header className="h-16 px-8 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-96 max-w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks, sessions..." 
            className="w-full bg-secondary border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors flex items-center justify-center"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary font-medium text-sm">
          <Hexagon size={16} fill="currentColor" />
          <span>Lvl 12</span>
        </div>
        
        <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || 'USER'} Plan</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 border-2 border-card shadow-sm flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
