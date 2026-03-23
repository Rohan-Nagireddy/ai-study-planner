import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar as CalendarIcon,
  CheckCircle2,
  MoreVertical,
  Flame,
  BrainCircuit,
  Sparkles,
  Clock,
  Zap,
  Clock as ClockIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsService, taskService, aiService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [latestPlan, setLatestPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, weeklyRes, streakRes, tasksRes, aiRes] = await Promise.all([
          analyticsService.getDaily(),
          analyticsService.getWeekly(),
          analyticsService.getStreak(),
          taskService.getTasks(),
          aiService.getPlans()
        ]);

        const daily = dailyRes.data.data;
        const weekly = weeklyRes.data.data;
        const streak = streakRes.data.data;
        const taskList = tasksRes.data.data;
        const plans = aiRes.data.data;

        setDailyData(daily);
        setWeeklyData(weekly);
        setStreakData(streak);
        setTasks(taskList.filter(t => !t.completed).slice(0, 4));
        if (plans && plans.length > 0) {
          setLatestPlan(plans[0]);
        }

        setStats([
          { label: 'Today Study', value: `${daily.totalStudyHours}h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Today' },
          { label: 'Focus Score', value: `${daily.averageFocusScore}/100`, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: 'Avg' },
          { label: 'Study Streak', value: `${streak.currentStreak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: `Best: ${streak.longestStreak}` },
          { label: 'Tasks Done', value: `${daily.tasksCompleted}/${daily.totalTasks}`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', trend: `${daily.taskCompletionRate}%` },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: weeklyData?.dailyBreakdown.map(d => d.date.split('-').slice(1).join('/')) || [],
    datasets: [
      {
        fill: true,
        label: 'Hours Studied',
        data: weeklyData?.dailyBreakdown.map(d => d.totalStudyHours) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Good morning, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">Ready to smash your study goals today?</p>
        </div>
        <div className="flex gap-3">
          <Link to="/planner" className="px-4 py-2 rounded-xl bg-card border border-border font-medium hover:bg-secondary transition-colors inline-flex items-center gap-2">
            <CalendarIcon size={18} />
            Planner
          </Link>
          <Link to="/focus" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            Start Focus Session
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical size={16} />
              </button>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs text-green-500 font-semibold mt-2 inline-flex items-center gap-1">
                <TrendingUp size={12} /> {stat.trend}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Productivity Chart */}
        <div className="lg:col-span-2 p-8 bg-card border border-border rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Weekly Performance</h2>
            <div className="px-3 py-1 bg-secondary rounded-lg text-sm font-medium">Last 7 days</div>
          </div>
          <div className="h-[300px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="text-primary" /> AI Recommendations
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {latestPlan ? (
              <>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                    <Target size={14} /> Priority Topics
                  </div>
                  <ul className="space-y-2">
                    {latestPlan.priorityTopics.slice(0, 3).map((topic, i) => (
                      <li key={i} className="text-sm font-medium flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                    <Sparkles size={14} /> Motivation & Tips
                  </div>
                  <p className="text-sm font-medium italic">"{latestPlan.motivationTips[0]}"</p>
                </div>
              </>
            ) : (
              <div className="p-8 text-center bg-white/30 rounded-2xl border border-dashed border-primary/30">
                <Sparkles size={32} className="mx-auto text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground">No AI plan found. Go to the planner to optimize your schedule!</p>
              </div>
            )}
          </div>
          <Link to="/planner" className="w-full py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 block text-center">
            {latestPlan ? 'Update Study Plan' : 'Generate First Plan'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 p-8 bg-card border border-border rounded-3xl">
          <h2 className="text-xl font-bold mb-6">Study Heatmap</h2>
          <div className="flex flex-wrap gap-2">
            {[...Array(28)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-10 h-10 rounded-lg transition-transform hover:scale-110 cursor-pointer",
                  i % 7 === 0 ? "bg-primary/20" : 
                  i % 5 === 0 ? "bg-primary/40" : 
                  i % 3 === 0 ? "bg-primary/60" : 
                  i % 2 === 0 ? "bg-primary/80" : "bg-primary"
                )} 
                title={`${i+1} days ago`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <div className="w-3 h-3 rounded bg-primary/40" />
              <div className="w-3 h-3 rounded bg-primary/60" />
              <div className="w-3 h-3 rounded bg-primary/80" />
              <div className="w-3 h-3 rounded bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Up Next Tasks */}
        <div className="p-8 bg-card border border-border rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Priority Tasks</h2>
            <Link to="/planner" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl hover:bg-secondary transition-colors cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border-2 border-primary group-hover:bg-primary/10 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{task.description || task.subject}</h4>
                    <p className="text-xs text-muted-foreground">{task.subject}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    task.difficulty >= 3 ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"
                  )}>{task.difficulty >= 3 ? 'HIGH' : 'MED'}</div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">No pending tasks!</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
