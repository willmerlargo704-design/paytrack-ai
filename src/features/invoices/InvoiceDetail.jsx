import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, Send, Share2 } from 'lucide-react';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { useInvoices } from './useInvoices';
import { useClients } from '@/features/clients/useClients';
import { useToast } from '@/components/Toast/ToastContext';
import { STATUS_COLORS, INVOICE_STATUS } from '@/lib/constants';
import { formatCurrency, formatDate, getEffectiveStatus } from '@/lib/format';
import styles from './InvoiceDetail.module.css';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, update } = useInvoices();
  const { clients } = useClients();
  const { addToast } = useToast();

  const invoice = invoices.find((i) => i.id === id);
  const client = clients.find((c) => c.id === invoice?.clientId);
  const logo = localStorage.getItem('paytrack_logo');

  if (!invoice) {
    return <div style={{ textAlign: 'center', padding: '4rem 1rem' }}><h2>Invoice not found</h2><Link to="/invoices">← Back to invoices</Link></div>;
  }

  const status = getEffectiveStatus(invoice);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast('Invoice link copied to clipboard!', 'success');
  };

  return (
    <div className={styles.container}>
      {/* TOOLBAR (Hindi ito lalabas sa Print) */}
      <div className={styles.noPrint}>
        <button className={styles.back} onClick={() => navigate('/invoices')}><ArrowLeft size={16} /> Back to invoices</button>
        <div className={styles.toolbar}>
          <div>
            <h1 className={styles.title}>{invoice.invoiceNumber}</h1>
            <p className={styles.sub}><Badge color={STATUS_COLORS[status]}>{status}</Badge><span style={{ marginLeft: '.5rem' }}>Issued {formatDate(invoice.issueDate)}</span></p>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleShare}><Share2 size={16} /> Share</Button>
            {invoice.status !== INVOICE_STATUS.PAID && <Button variant="secondary" onClick={() => update(invoice.id, { status: INVOICE_STATUS.SENT })}><Send size={16} /> Mark as sent</Button>}
            {invoice.status !== INVOICE_STATUS.PAID && <Button variant="primary" onClick={() => update(invoice.id, { status: INVOICE_STATUS.PAID })}><CheckCircle size={16} /> Mark as paid</Button>}
            <Button variant="secondary" onClick={() => window.print()}><Printer size={16} /> Print / PDF</Button>
          </div>
        </div>
      </div>

      {/* PAPER (Ito lang ang lalabas sa Print) */}
      {/* IDINAGDAG NA ANG print-section CLASS DITO */}
      <div className={`${styles.paper} print-section`}>
        <div className={styles.paperHeader}>
          <div>
            {logo ? (
              <img src={logo} alt="Company Logo" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '10px' }} />
            ) : (
              <div className={styles.logo}>💰 PayTrack</div>
            )}
            <p className={styles.logoSub}>Invoice</p>
          </div>
          <div className={styles.metaBlock}>
            <div className={styles.metaRow}><span>Invoice #</span><strong>{invoice.invoiceNumber}</strong></div>
            <div className={styles.metaRow}><span>Issue date</span><strong>{formatDate(invoice.issueDate)}</strong></div>
            <div className={styles.metaRow}><span>Due date</span><strong>{formatDate(invoice.dueDate)}</strong></div>
          </div>
        </div>

        <div className={styles.parties}>
          <div>
            <p className={styles.partyLabel}>Billed to</p>
            <p className={styles.partyName}>{client?.name || 'Unknown client'}</p>
            {client?.company && <p className={styles.partyLine}>{client.company}</p>}
            {client?.email && <p className={styles.partyLine}>{client.email}</p>}
            {client?.phone && <p className={styles.partyLine}>{client.phone}</p>}
          </div>
        </div>

        <table className={styles.items}>
          <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>{formatCurrency(invoice.total)}</span></div>
        </div>

        {invoice.notes && <div className={styles.notes}><p className={styles.partyLabel}>Notes</p><p>{invoice.notes}</p></div>}
      </div>
    </div>
  );
}