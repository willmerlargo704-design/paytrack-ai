import { format, isAfter, parseISO, differenceInDays } from 'date-fns';

export const formatCurrency = (amount, currency = 'PHP') =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (date) =>
  date ? format(new Date(date), 'MMM d, yyyy') : '—';

export const generateInvoiceNumber = (existing) => {
  const nums = existing
    .map((i) => parseInt(i.invoiceNumber.replace('INV-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, '0')}`;
};

export const getEffectiveStatus = (invoice) => {
  if (invoice.status === 'paid') return 'paid';
  if (!invoice.dueDate) return invoice.status;
  const isOverdue = isAfter(new Date(), parseISO(invoice.dueDate));
  return isOverdue ? 'overdue' : invoice.status;
};

export const daysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const diff = differenceInDays(new Date(), parseISO(dueDate));
  return diff > 0 ? diff : 0;
};

export const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const today = () => new Date().toISOString().split('T')[0];