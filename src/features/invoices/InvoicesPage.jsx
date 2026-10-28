import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trash2, Search, Download } from 'lucide-react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import { useClients } from '@/features/clients/useClients';
import { useInvoices } from './useInvoices';
import InvoiceForm from './InvoiceForm';
import { STATUS_COLORS } from '@/lib/constants';
import { formatCurrency, formatDate, getEffectiveStatus, daysOverdue } from '@/lib/format';
import { useToast } from '@/components/Toast/ToastContext';
import styles from './Invoices.module.css';

export default function InvoicesPage() {
  const { invoices, create, remove } = useInvoices();
  const { clients } = useClients();
  const { addToast } = useToast();
  
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const clientName = (id) => clients.find((c) => c.id === id)?.name || 'Unknown';
  
  const handleCreate = (data) => { 
    create(data); 
    setFormOpen(false); 
    addToast('Invoice created successfully!', 'success');
  };
  
  const handleDelete = (inv) => { 
    if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
      remove(inv.id); 
      addToast('Invoice deleted.', 'error');
    }
  };

  const sorted = [...invoices].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  
  const filteredInvoices = sorted.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clientName(inv.clientId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIC PARA SA EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (invoices.length === 0) return addToast('No invoices to export', 'error');
    
    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status'];
    const rows = sorted.map(inv => [
      inv.invoiceNumber,
      clientName(inv.clientId),
      inv.issueDate,
      inv.dueDate,
      inv.total,
      getEffectiveStatus(inv).toUpperCase()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `paytrack_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Invoices exported successfully!', 'success');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '40px', borderRadius: '8px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }}></div>
        <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.sub}>{invoices.length} total invoices</p>
        </div>
        
        <div className={styles.actionsGroup}>
          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export
          </Button>
          
          <Button onClick={() => setFormOpen(true)}><Plus size={16} /> New invoice</Button>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to start tracking payments." action={<Button onClick={() => setFormOpen(true)}><Plus size={16} /> Create invoice</Button>} />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState icon={Search} title="No results found" description={`We couldn't find any invoices matching "${searchTerm}"`} action={<Button variant="secondary" onClick={() => setSearchTerm('')}>Clear Search</Button>} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const status = getEffectiveStatus(inv);
                const overdue = daysOverdue(inv.dueDate);
                return (
                  <tr key={inv.id}>
                    <td><Link to={`/invoices/${inv.id}`} className={styles.link}>{inv.invoiceNumber}</Link></td>
                    <td>
                      {/* IDINAGDAG NA AVATAR PARA SA CLIENT */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(clientName(inv.clientId))}&background=random&color=fff&rounded=true`} 
                          alt={clientName(inv.clientId)} 
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }} 
                        />
                        <span className={styles.boldText}>{clientName(inv.clientId)}</span>
                      </div>
                    </td>
                    <td className={styles.muted}>{formatDate(inv.issueDate)}</td>
                    <td className={styles.muted}>
                      {formatDate(inv.dueDate)}
                      {overdue > 0 && <span className={styles.overdueNote}>{overdue}d late</span>}
                    </td>
                    <td><strong>{formatCurrency(inv.total)}</strong></td>
                    <td><Badge color={STATUS_COLORS[status]}>{status}</Badge></td>
                    <td className={styles.actions}>
                      <button className={styles.iconBtn} onClick={() => handleDelete(inv)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <InvoiceForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} clients={clients} invoices={invoices} />
    </div>
  );
}