import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { today, generateInvoiceNumber, formatCurrency } from '@/lib/format';
import { INVOICE_STATUS } from '@/lib/constants';
import styles from './Invoices.module.css';

const emptyItem = { description: '', quantity: 1, rate: 0 };

export default function InvoiceForm({ open, onClose, onSubmit, clients, invoices }) {
  const [form, setForm] = useState({ clientId: '', invoiceNumber: '', items: [{ ...emptyItem }], status: INVOICE_STATUS.DRAFT, issueDate: today(), dueDate: today(), notes: '' });

  useEffect(() => {
    if (open) {
      setForm({ clientId: clients[0]?.id || '', invoiceNumber: generateInvoiceNumber(invoices), items: [{ ...emptyItem }], status: INVOICE_STATUS.DRAFT, issueDate: today(), dueDate: today(), notes: '' });
    }
  }, [open, clients, invoices]);

  const updateItem = (i, key, value) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: key === 'description' ? value : Number(value) };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const subtotal = form.items.reduce((s, it) => s + (it.quantity || 0) * (it.rate || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientId) return alert('Please select a client');
    if (form.items.some((it) => !it.description || it.rate <= 0)) return alert('Please fill in all line items');
    onSubmit({ ...form, subtotal, tax: 0, total: subtotal });
  };

  return (
    <Modal open={open} onClose={onClose} title="New invoice" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Create invoice</Button></>}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Client *</label>
            <select className={styles.select} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Select client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Invoice #" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />
        </div>
        <div className={styles.row}>
          <Input label="Issue date" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
          <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        </div>
        <div>
          <label className={styles.label}>Line items</label>
          <div className={styles.items}>
            {form.items.map((item, i) => (
              <div key={i} className={styles.itemRow}>
                <input className={styles.itemInput} placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} style={{ flex: 3 }} required />
                <input className={styles.itemInput} type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} style={{ flex: 1 }} min="1" required />
                <input className={styles.itemInput} type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} style={{ flex: 1.5 }} min="0" step="0.01" required />
                {form.items.length > 1 && <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)}><Trash2 size={15} /></button>}
              </div>
            ))}
          </div>
          <button type="button" className={styles.addItemBtn} onClick={addItem}><Plus size={14} /> Add line item</button>
        </div>
        <div className={styles.totals}>
          <div className={styles.totalRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Notes</label>
          <textarea className={styles.textarea} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, thank you message, etc." />
        </div>
      </form>
    </Modal>
  );
}