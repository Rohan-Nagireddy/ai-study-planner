import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Award, 
  Zap,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { analyticsService } from '../services/dataService';
import { cn } from '../lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState(null);
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [weeklyRes, streakRes] = await Promise.all([
          analyticsService.getWeekly(),
          analyticsService.getStreak()
        ]);
        setWeeklyData(weeklyRes.data.data);
        setStreakData(streakRes.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const lineChartData = {
    labels: weeklyData?.dailyBreakdown.map(d => d.date.split('-').slice(1).join('/')) || [],
    datasets: [
      {
        fill: true,
        label: 'Study Hours',
        data: weeklyData?.dailyBreakdown.map(d => d.totalStudyHours) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: weeklyData?.dailyBreakdown.map(d => d.date.split('-').slice(1).join('/')) || [],
    datasets: [
      {
        label: 'Focus Score',
        data: weeklyData?.dailyBreakdown.map(d => d.averageFocusScore) || [],
        backgroundColor: 'rgba(234, 179, 8, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your productivity metrics and study habits.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium flex items-center gap-2">
            <Calendar size={16} />
            Last 7 Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{streakData?.currentStreak || 0}</span>
            <span className="text-muted-foreground">Days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Longest streak: {streakData?.longestStreak || 0} days</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold">Avg. Daily Study</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {(weeklyData?.totalStudyHours / 7).toFixed(1)}
            </span>
            <span className="text-muted-foreground">Hours</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total this week: {weeklyData?.totalStudyHours.toFixed(1)}h</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <Award size={20} />
            </div>
            <h3 className="font-semibold">Completion Rate</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{weeklyData?.taskCompletionRate || 0}%</span>
            <span className="text-muted-foreground">Tasks</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{weeklyData?.tasksCompleted} of {weeklyData?.totalTasks} completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-card border border-border rounded-3xl">
          <h2 className="text-xl font-bold mb-6">Study Time Consistency</h2>
          <div className="h-[300px]">
            <Line data={lineChartData} options={options} />
          </div>
        </div>
        <div className="p-8 bg-card border border-border rounded-3xl">
          <h2 className="text-xl font-bold mb-6">Focus Score Trends</h2>
          <div className="h-[300px]">
            <Bar data={barChartData} options={options} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="text-primary" /> AI Insights
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20">
            <div className="mt-1 p-1 bg-green-500 text-white rounded-full">
              <TrendingUp size={14} />
            </div>
            <div>
              <p className="font-semibold text-sm">Consistency is improving!</p>
              <p className="text-sm text-muted-foreground">Your study hours have been increasing by 12% over the last 3 days. Keep this momentum for your upcoming exams.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20">
            <div className="mt-1 p-1 bg-yellow-500 text-white rounded-full">
              <ChevronRight size={14} />
            </div>
            <div>
              <p className="font-semibold text-sm">Optimization Tip</p>
              <p className="text-sm text-muted-foreground">You tend to have higher focus scores in the morning. Consider scheduling your most difficult subjects before 11:00 AM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
