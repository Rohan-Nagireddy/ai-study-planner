import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  BarChart, 
  Trash2, 
  UserCheck, 
  Loader2,
  ShieldAlert,
  Search,
  RefreshCcw,
  Mail
} from 'lucide-react';
import { adminService } from '../services/dataService';
import { cn } from '../lib/utils';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [burnoutRisk, setBurnoutRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // users, burnout, platform
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, riskRes] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getUsers(),
        adminService.getBurnoutRisk()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setBurnoutRisk(riskRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="text-primary" /> Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Platform management, statistics, and student safety monitoring.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="px-4 py-2 bg-secondary rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <RefreshCcw size={16} />
          Sync Data
        </button>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Study Sessions', value: stats?.totalFocusSessions || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Platform Hours', value: stats?.totalStudyHours.toFixed(0) || 0, icon: BarChart, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Burnout Alerts', value: burnoutRisk.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-card border border-border rounded-2xl shadow-sm"
          >
            <div className={`${item.bg} ${item.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <item.icon size={24} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 pt-6">
          <div className="flex items-center gap-8">
            {['users', 'burnout'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'burnout' && burnoutRisk.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{burnoutRisk.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-secondary/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase",
                            user.role === 'ADMIN' ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'burnout' && (
            <div className="space-y-6">
              {burnoutRisk.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                  <UserCheck className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="font-bold text-lg text-muted-foreground">No users at risk!</h3>
                  <p className="text-sm text-muted-foreground">Great job. All platform users are maintaining healthy study habits.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {burnoutRisk.map((user) => (
                    <motion.div 
                      key={user.userId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 border-2 border-red-500/20 bg-red-500/5 rounded-3xl space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center">
                            <AlertTriangle size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold">{user.name}</h4>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded italic">
                          {user.riskLevel}
                        </span>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Last 3 Days Activity</p>
                        <p className="text-xl font-black">{user.averageDailyHoursLast3Days.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs/day on average</span></p>
                      </div>
                      <button className="w-full py-2 bg-red-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90">
                        <Mail size={16} /> Send Wellness Check-in
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
