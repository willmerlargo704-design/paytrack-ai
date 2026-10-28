import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, AlertTriangle, FileText, Users, ArrowUpRight, 
  Clock, Target, Plus, UserPlus, Send, Lightbulb, CheckSquare, Square, X 
} from 'lucide-react';
import Badge from '@/components/Badge';
import { useInvoices } from '@/features/invoices/useInvoices';
import { useClients } from '@/features/clients/useClients';
import { useAuth } from '@/features/auth/AuthContext';
import { STATUS_COLORS } from '@/lib/constants';
import { formatCurrency, formatDate, getEffectiveStatus } from '@/lib/format';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);

  // --- TASK MANAGER LOGIC ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('paytrack_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Follow up with Acme Corp', done: false },
      { id: 2, text: 'Send retainer invoice', done: true }
    ];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('paytrack_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // --- DASHBOARD DATA LOGIC ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const enriched = invoices.map((i) => ({ ...i, _status: getEffectiveStatus(i) }));
  
  const totalPaid = enriched.filter((i) => i._status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = enriched.filter((i) => i._status === 'sent').reduce((s, i) => s + i.total, 0);
  const totalOverdue = enriched.filter((i) => i._status === 'overdue').reduce((s, i) => s + i.total, 0);
  
  const recent = [...enriched].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 4);
  const recentActivity = [...enriched].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 3);

  const monthlyGoal = 100000;
  const goalProgress = Math.min((totalPaid / monthlyGoal) * 100, 100).toFixed(1);

  const clientName = (id) => clients.find((c) => c.id === id)?.name || 'Unknown';

  // --- SMART INSIGHTS LOGIC ---
  let insightMessage = "Add your first client and create an invoice to start tracking!";
  let insightType = "info";
  
  if (totalOverdue > 0) {
    insightMessage = `You have ${formatCurrency(totalOverdue)} in overdue invoices. Sending a reminder today could speed up your cash flow!`;
    insightType = "warning";
  } else if (totalOutstanding > 0) {
    insightMessage = `You have ${formatCurrency(totalOutstanding)} pending. Your clients are doing great, keep it up!`;
    insightType = "info";
  } else if (totalPaid > 0) {
    insightMessage = `Amazing! You have no overdue invoices. You've collected ${formatCurrency(totalPaid)} so far.`;
    insightType = "success";
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="skeleton" style={{ width: '250px', height: '40px', borderRadius: '10px' }}></div>
        <div className={styles.stats}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>)}
        </div>
        <div className={styles.middleGrid}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '350px', borderRadius: '20px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.sub}>Welcome back, {user?.name}. Here is your summary.</p>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.actionBtn} onClick={() => navigate('/invoices')}>
          <Plus size={16} /> New Invoice
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/clients')}>
          <UserPlus size={16} /> Add Client
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/reminders')}>
          <Send size={16} /> Send Reminder
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statHeader}>
            <div className={`${styles.icon} ${styles.green}`}><DollarSign size={20} /></div>
            <span className={styles.trendUp}><ArrowUpRight size={14} /> +12%</span>
          </div>
          <p className={styles.statLabel}>Total Revenue</p>
          <p className={styles.statValue}>{formatCurrency(totalPaid)}</p>
        </div>
        <div className={styles.stat}>
          <div className={styles.statHeader}>
            <div className={`${styles.icon} ${styles.blue}`}><TrendingUp size={20} /></div>
          </div>
          <p className={styles.statLabel}>Outstanding</p>
          <p className={styles.statValue}>{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className={styles.stat}>
          <div className={styles.statHeader}>
            <div className={`${styles.icon} ${styles.red}`}><AlertTriangle size={20} /></div>
          </div>
          <p className={styles.statLabel}>Overdue</p>
          <p className={styles.statValue}>{formatCurrency(totalOverdue)}</p>
        </div>
        <div className={styles.stat}>
          <div className={styles.statHeader}>
            <div className={`${styles.icon} ${styles.indigo}`}><Users size={20} /></div>
          </div>
          <p className={styles.statLabel}>Active Clients</p>
          <p className={styles.statValue}>{clients.length}</p>
        </div>
      </div>

      <div className={styles.middleGrid}>
        {/* 1. Monthly Goal */}
        <div className={styles.chartPanel}>
          <div className={styles.chartHeader}>
            <h2 className={styles.panelTitle}>Monthly Goal</h2>
            <span className={styles.goalText}>{goalProgress}%</span>
          </div>
          <div className={styles.goalContainer}>
            <div className={styles.goalBarBg}>
              <div className={styles.goalBarFill} style={{ width: `${goalProgress}%` }}></div>
            </div>
            <div className={styles.goalLabels}>
              <span>₱0</span>
              <span>{formatCurrency(monthlyGoal)}</span>
            </div>
          </div>
          <div className={styles.goalMotivation}>
            {goalProgress < 100 ? (
              <p>Need <strong>{formatCurrency(monthlyGoal - totalPaid)}</strong> more to hit target. Keep going! 🚀</p>
            ) : (
              <p>🎉 Target Reached! Great job!</p>
            )}
          </div>
        </div>

        {/* 2. Quick Tasks (NEW) */}
        <div className={styles.tasksPanel}>
          <div className={styles.chartHeader}>
            <h2 className={styles.panelTitle}>Quick Tasks</h2>
          </div>
          <form onSubmit={addTask} className={styles.taskInputWrap}>
            <input 
              type="text" 
              placeholder="Add a task..." 
              value={newTask} 
              onChange={(e) => setNewTask(e.target.value)} 
              className={styles.taskInput}
            />
            <button type="submit" className={styles.taskAddBtn}><Plus size={16} /></button>
          </form>
          <div className={styles.taskList}>
            {tasks.map(task => (
              <div key={task.id} className={`${styles.taskItem} ${task.done ? styles.taskDone : ''}`}>
                <button onClick={() => toggleTask(task.id)} className={styles.taskCheck}>
                  {task.done ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#94a3b8" />}
                </button>
                <span className={styles.taskText}>{task.text}</span>
                <button onClick={() => removeTask(task.id)} className={styles.taskDelete}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Smart Insights (NEW) */}
        <div className={`${styles.insightPanel} ${styles[insightType]}`}>
          <div className={styles.insightIcon}><Lightbulb size={24} /></div>
          <h2 className={styles.panelTitle}>Smart Insight</h2>
          <p className={styles.insightText}>{insightMessage}</p>
          {totalOverdue > 0 && (
            <button className={styles.insightBtn} onClick={() => navigate('/reminders')}>
              Send Reminders Now →
            </button>
          )}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Recent Invoices</h2>
          <Link to="/invoices" className={styles.panelLink}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className={styles.empty}><FileText size={32} /><p>No invoices yet.</p></div>
        ) : (
          <ul className={styles.list}>
            {recent.map((inv) => (
              <li key={inv.id} className={styles.listItem}>
                <Link to={`/invoices/${inv.id}`} className={styles.listLink}>
                  <div>
                    <div className={styles.listTitle}>{inv.invoiceNumber} <span className={styles.dot}>•</span> {clientName(inv.clientId)}</div>
                    <div className={styles.listSub}>Due {formatDate(inv.dueDate)}</div>
                  </div>
                  <div className={styles.listRight}>
                    <span className={styles.amount}>{formatCurrency(inv.total)}</span>
                    <Badge color={STATUS_COLORS[inv._status]}>{inv._status}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}