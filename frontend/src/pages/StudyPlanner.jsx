import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Calendar, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { taskService, aiService } from '../services/dataService';

export function StudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Form states
  const [newTask, setNewTask] = useState({
    subject: '',
    description: '',
    difficulty: 1,
    estimatedTime: 60
  });

  const [editingTask, setEditingTask] = useState(null);
  
  const [aiFormData, setAIFormData] = useState({
    subjects: [],
    examDates: '',
    dailyStudyHours: 4,
    weakTopics: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getTasks();
      setTasks(res.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id, currentStatus) => {
    try {
      // Backend markCompleted always sets to true, so we use updateTask for generic toggle if needed
      // but for simplicity, we'll follow the "Update task" requirement by allowing full editing.
      const task = tasks.find(t => t.id === id);
      const updatedTask = { ...task, completed: !currentStatus };
      await taskService.updateTask(id, updatedTask);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.createTask(newTask);
      setTasks([res.data.data, ...tasks]);
      setIsTaskModalOpen(false);
      setNewTask({ subject: '', description: '', difficulty: 1, estimatedTime: 60 });
    } catch (error) {
      console.error('Failed to create task', error);
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.updateTask(editingTask.id, editingTask);
      setTasks(tasks.map(t => t.id === editingTask.id ? res.data.data : t));
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const openEditModal = (task) => {
    setEditingTask({ ...task });
    setIsEditModalOpen(true);
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload = {
        subjects: aiFormData.subjects.length > 0 ? aiFormData.subjects : tasks.map(t => t.subject).filter((v, i, a) => a.indexOf(v) === i),
        examDates: aiFormData.examDates ? aiFormData.examDates.split(',').map(s => s.trim()) : [],
        dailyStudyHours: aiFormData.dailyStudyHours,
        weakTopics: aiFormData.weakTopics ? aiFormData.weakTopics.split(',').map(s => s.trim()) : []
      };

      await aiService.generatePlan(payload);
      alert('AI Plan Generated! Check your dashboard for the results.');
      setIsAIModalOpen(false);
    } catch (error) {
      console.error('Failed to generate AI plan', error);
      alert('AI generation failed. Please check your API key and connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 to-blue-500/10 p-8 rounded-3xl border border-primary/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} fill="currentColor" /> AI Powered
          </div>
          <h1 className="text-3xl font-bold">Smart Study Planner</h1>
          <p className="text-muted-foreground">Let AI organize your subjects and exam dates into a high-performance schedule.</p>
        </div>
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-105 transition-all"
        >
          <Sparkles size={20} />
          Optimize My Schedule
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input type="text" placeholder="Find tasks..." className="w-full bg-secondary/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={18} /> New Task
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {tasks.length > 0 ? tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group flex items-center gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all",
                    task.completed && "opacity-60 bg-secondary/30"
                  )}
                >
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      task.completed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground hover:border-primary"
                    )}
                  >
                    {task.completed && <CheckCircle2 size={16} />}
                  </button>
                  
                  <div className="flex-1 min-w-0" onClick={() => openEditModal(task)} role="button">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded text-[10px] font-bold uppercase tracking-wider">{task.subject}</span>
                      {task.difficulty >= 3 && <AlertCircle size={14} className="text-destructive" />}
                    </div>
                    <h4 className={cn("font-bold text-lg leading-tight", task.completed && "line-through")}>{task.description || task.subject}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} /> {task.estimatedTime}m estimated</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => openEditModal(task)}
                      className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-muted-foreground"
                    >
                      <MoreVertical size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all text-muted-foreground"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                  <p className="text-muted-foreground">No tasks found. Create one to get started!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Mini-Stats/Filters */}
        <div className="space-y-6">
          <div className="p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
            <h3 className="text-xl font-bold">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Task Completion</span>
                  <span className="font-bold">{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-card border border-border rounded-3xl shadow-sm">
             <h3 className="text-lg font-bold mb-4">Focus Tips</h3>
             <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Break large tasks into smaller 25-min subtasks.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  Use Focus Mode to track your deep work hours.
                </li>
             </ul>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold">Create New Task</h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={newTask.subject}
                    onChange={e => setNewTask({...newTask, subject: e.target.value})}
                    placeholder="e.g. Mathematics, History" 
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="What specifically do you need to study?" 
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Difficulty (1-3)</label>
                    <input 
                      type="number" 
                      min="1" max="3"
                      value={newTask.difficulty}
                      onChange={e => setNewTask({...newTask, difficulty: parseInt(e.target.value)})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Est. Time (mins)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={newTask.estimatedTime}
                      onChange={e => setNewTask({...newTask, estimatedTime: parseInt(e.target.value)})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity mt-2">
                  Add Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Task</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateTask} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={editingTask.subject}
                    onChange={e => setEditingTask({...editingTask, subject: e.target.value})}
                    placeholder="e.g. Mathematics, History" 
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea 
                    value={editingTask.description}
                    onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                    placeholder="What specifically do you need to study?" 
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Difficulty (1-3)</label>
                    <input 
                      type="number" 
                      min="1" max="3"
                      value={editingTask.difficulty}
                      onChange={e => setEditingTask({...editingTask, difficulty: parseInt(e.target.value)})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Est. Time (mins)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={editingTask.estimatedTime}
                      onChange={e => setEditingTask({...editingTask, estimatedTime: parseInt(e.target.value)})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input 
                    type="checkbox"
                    id="edit-completed"
                    checked={editingTask.completed}
                    onChange={e => setEditingTask({...editingTask, completed: e.target.checked})}
                    className="w-5 h-5 accent-primary"
                  />
                  <label htmlFor="edit-completed" className="text-sm font-semibold">Mark as completed</label>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity mt-2">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Plan Generation Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-500/10">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  <h3 className="text-xl font-bold">AI Study Optimizer</h3>
                </div>
                <button onClick={() => setIsAIModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleGenerateAI} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Target Subjects</label>
                  <input 
                    type="text" 
                    placeholder="Leave empty to use all tasks, or comma-separated" 
                    onChange={e => setAIFormData({...aiFormData, subjects: e.target.value ? e.target.value.split(',').map(s => s.trim()) : []})}
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Exam Dates</label>
                  <input 
                    type="text" 
                    placeholder="Math (Mar 20), Physics (Mar 25)" 
                    value={aiFormData.examDates}
                    onChange={e => setAIFormData({...aiFormData, examDates: e.target.value})}
                    className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Daily Study Hours</label>
                    <input 
                      type="number" 
                      min="1" max="16"
                      value={aiFormData.dailyStudyHours}
                      onChange={e => setAIFormData({...aiFormData, dailyStudyHours: parseInt(e.target.value)})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Weak Topics</label>
                    <input 
                      type="text" 
                      placeholder="Integration, Optics" 
                      value={aiFormData.weakTopics}
                      onChange={e => setAIFormData({...aiFormData, weakTopics: e.target.value})}
                      className="w-full bg-secondary/50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                </div>
                <button 
                  disabled={isGenerating}
                  type="submit" 
                  className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <><RotateCcw className="animate-spin" size={20} /> Optimizing...</> : <><Sparkles size={20} /> Generate My Plan</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

