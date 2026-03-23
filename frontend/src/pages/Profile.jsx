import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Lock, 
  Bell, 
  Save,
  Camera,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <button 
          onClick={logout}
          className="px-4 py-2 border border-destructive/20 text-destructive bg-destructive/5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-card border border-border rounded-3xl text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute -right-2 -bottom-2 p-2 bg-white dark:bg-black rounded-xl border border-border shadow-lg hover:scale-110 transition-transform">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="pt-4 flex justify-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                {user.role} Plan
              </span>
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 text-sm">
            <h4 className="font-bold uppercase tracking-tight text-xs text-muted-foreground px-2">Quick Info</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} /> Joined
                </div>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield size={14} /> Account Type
                </div>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-primary" /> Personal Information
            </h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user.name}
                    className="w-full bg-secondary border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="w-full bg-secondary/50 border-none rounded-2xl py-3 px-4 text-muted-foreground cursor-not-allowed outline-none" 
                  />
                </div>
              </div>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                <Save size={18} /> Update Profile
              </button>
            </form>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Lock size={20} className="text-primary" /> Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl">
                <div>
                  <p className="font-semibold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                </div>
              </div>
              <button className="text-primary text-sm font-semibold hover:underline px-1">Change Password</button>
            </div>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Bell size={20} className="text-primary" /> Notifications
            </h3>
            <div className="space-y-3">
              {[
                'Email reminders for upcoming exams',
                'Desktop notifications for focus sessions',
                'Weekly productivity report',
                'Study streak alerts'
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">{setting}</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
