import { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { useInvoices } from '@/features/invoices/useInvoices';
import { useClients } from '@/features/clients/useClients';
import { formatCurrency } from '@/lib/format';
import styles from './Reports.module.css';

export default function ReportsPage() {
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // DYNAMIC DATA CALCULATIONS
  const { monthlyRevenue, topClients, maxRevenue } = useMemo(() => {
    // 1. Calculate Monthly Revenue
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = Array(12).fill(0);
    
    invoices.forEach(inv => {
      if (inv.status === 'paid') {
        const date = new Date(inv.issueDate);
        revenueByMonth[date.getMonth()] += inv.total;
      }
    });

    // Kunin lang ang last 6 months (para sa demo, kukunin natin lahat ng may value)
    const activeMonths = months.map((m, i) => ({ name: m, value: revenueByMonth[i] }));
    const max = Math.max(...activeMonths.map(m => m.value), 1); // 1 para hindi divide by zero

    // 2. Calculate Top Clients
    const clientTotals = clients.map(client => {
      const total = invoices
        .filter(inv => inv.clientId === client.id && inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);
      return { ...client, total };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

    return { monthlyRevenue: activeMonths, topClients: clientTotals, maxRevenue: max };
  }, [invoices, clients]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '350px', borderRadius: '20px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.head}>
        <h1 className={styles.title}>Reports & Analytics</h1>
        <p className={styles.sub}>Deep dive into your business performance.</p>
      </div>

      <div className={styles.grid}>
        {/* Chart Panel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Revenue Overview</h3>
            <span className={styles.badgeGreen}><TrendingUp size={14} /> Real-time Data</span>
          </div>
          
          <div className={styles.barChart}>
            {monthlyRevenue.map((m, i) => {
              const heightPercent = (m.value / maxRevenue) * 100;
              return (
                <div key={i} className={styles.barWrap}>
                  <div className={styles.barContainer}>
                    {/* Tooltip on Hover */}
                    <div className={styles.tooltip}>{formatCurrency(m.value)}</div>
                    <div 
                      className={`${styles.bar} ${m.value > 0 ? styles.activeBar : ''}`} 
                      style={{ height: `${Math.max(heightPercent, 5)}%` }} // Minimum 5% height para kita kahit zero
                    ></div>
                  </div>
                  <span>{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients Panel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Top Clients</h3>
          </div>
          <div className={styles.topList}>
            {topClients.length === 0 ? (
              <p className={styles.emptyText}>No paid invoices yet.</p>
            ) : (
              topClients.map((client, i) => (
                <div key={client.id} className={styles.topItem}>
                  <div className={styles.avatar} style={{ 
                    background: i === 0 ? '#fef3c7' : i === 1 ? '#dbeafe' : '#e0e7ff',
                    color: i === 0 ? '#b45309' : i === 1 ? '#1d4ed8' : '#4338ca'
                  }}>
                    {client.name[0].toUpperCase()}
                  </div>
                  <div className={styles.topInfo}>
                    <strong>{client.name}</strong>
                    <span>{client.company || 'Client'}</span>
                  </div>
                  <strong className={styles.topAmount}>{formatCurrency(client.total)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}