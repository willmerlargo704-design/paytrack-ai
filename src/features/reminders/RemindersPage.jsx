import { Link } from 'react-router-dom';
import { Bell, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { useInvoices } from '@/features/invoices/useInvoices';
import { useClients } from '@/features/clients/useClients';
import { useReminders } from './useReminders';
import { STATUS_COLORS } from '@/lib/constants';
import { formatCurrency, formatDate, getEffectiveStatus, daysOverdue } from '@/lib/format';
import styles from './Reminders.module.css';

export default function RemindersPage() {
  const { invoices, update } = useInvoices();
  const { clients } = useClients();
  const { logReminder, remindersFor } = useReminders();

  const clientName = (id) => clients.find((c) => c.id === id)?.name || 'Unknown';
  const clientEmail = (id) => clients.find((c) => c.id === id)?.email || '';

  const pending = invoices
    .map((i) => ({ ...i, _status: getEffectiveStatus(i) }))
    .filter((i) => i._status === 'overdue' || i._status === 'sent')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const handleSend = async (inv) => {
    const overdue = daysOverdue(inv.dueDate);
    const message = `Hi ${clientName(inv.clientId)}, this is a friendly reminder that invoice ${inv.invoiceNumber} (${formatCurrency(inv.total)}) ${overdue > 0 ? `is ${overdue} day${overdue > 1 ? 's' : ''} overdue` : 'is due soon'}. Please let us know if you have any questions. Thank you!`;

    console.log('📧 Reminder sent to:', clientEmail(inv.clientId));
    
    // Dito natin tinatawag ang Supabase
    await logReminder({ invoiceId: inv.id, type: 'email', message });

    if (overdue > 0 && inv.status !== 'paid') update(inv.id, { status: 'overdue' });
    alert(`✅ Reminder sent to ${clientName(inv.clientId)}!\n\n(Email integration coming soon)`);
  };

  return (
    <div>
      <div className={styles.head}>
        <div><h1 className={styles.title}>Reminders</h1><p className={styles.sub}>Follow up on outstanding invoices</p></div>
      </div>
      {pending.length === 0 ? (
        <EmptyState icon={CheckCircle} title="All caught up!" description="No outstanding invoices to follow up on. Nice work." />
      ) : (
        <div className={styles.list}>
          {pending.map((inv) => {
            const overdue = daysOverdue(inv.dueDate);
            const history = remindersFor(inv.id);
            return (
              <div key={inv.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <div>
                    <Link to={`/invoices/${inv.id}`} className={styles.invoiceNum}>{inv.invoiceNumber}</Link>
                    <p className={styles.client}>{clientName(inv.clientId)}</p>
                    <p className={styles.meta}>Due {formatDate(inv.dueDate)}{overdue > 0 && <span className={styles.overdueBadge}>{overdue}d overdue</span>}</p>
                  </div>
                  <div className={styles.rightSide}>
                    <div className={styles.amount}>{formatCurrency(inv.total)}</div>
                    <Badge color={STATUS_COLORS[inv._status]}>{inv._status}</Badge>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <div className={styles.history}>
                    <Bell size={14} />
                    {/* Pinalitan natin ang history[0].sentAt ng history[0].sent_at */}
                    {history.length > 0 
                      ? `${history.length} reminder${history.length > 1 ? 's' : ''} sent · last ${formatDate(history[0].sent_at)}` 
                      : 'No reminders sent yet'}
                  </div>
                  <Button size="small" onClick={() => handleSend(inv)}><Send size={14} /> Send reminder</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}