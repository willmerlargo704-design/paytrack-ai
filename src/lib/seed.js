import { STORAGE_KEYS } from './constants';
import { storage } from './storage';
import { today } from './format';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

export function seedDemoData(userId) {
  const clients = [
    { id: 'c1', userId, name: 'Acme Corporation', email: 'billing@acme.com', phone: '+63 917 123 4567', company: 'Acme Corp', notes: 'Net 30 terms', createdAt: new Date().toISOString() },
    { id: 'c2', userId, name: 'TechStart Inc.', email: 'accounts@techstart.io', phone: '+63 918 234 5678', company: 'TechStart', notes: '', createdAt: new Date().toISOString() },
    { id: 'c3', userId, name: 'Design Studio PH', email: 'hello@designstudio.ph', phone: '', company: 'Design Studio PH', notes: 'Prefers email only', createdAt: new Date().toISOString() },
  ];

  const invoices = [
    { id: 'i1', userId, clientId: 'c1', invoiceNumber: 'INV-0001', items: [{ description: 'Website redesign', quantity: 1, rate: 25000 }], subtotal: 25000, tax: 0, total: 25000, status: 'sent', issueDate: daysFromNow(-45), dueDate: daysFromNow(-15), notes: 'Thanks for your business!', createdAt: new Date().toISOString() },
    { id: 'i2', userId, clientId: 'c2', invoiceNumber: 'INV-0002', items: [{ description: 'Landing page development', quantity: 1, rate: 15000 }], subtotal: 15000, tax: 0, total: 15000, status: 'paid', issueDate: daysFromNow(-60), dueDate: daysFromNow(-30), notes: '', createdAt: new Date().toISOString() },
    { id: 'i3', userId, clientId: 'c3', invoiceNumber: 'INV-0003', items: [{ description: 'Brand identity package', quantity: 1, rate: 35000 }, { description: 'Logo variations', quantity: 3, rate: 2000 }], subtotal: 41000, tax: 0, total: 41000, status: 'sent', issueDate: daysFromNow(-10), dueDate: daysFromNow(20), notes: '', createdAt: new Date().toISOString() },
    { id: 'i4', userId, clientId: 'c1', invoiceNumber: 'INV-0004', items: [{ description: 'Monthly retainer — May', quantity: 1, rate: 18000 }], subtotal: 18000, tax: 0, total: 18000, status: 'draft', issueDate: today(), dueDate: daysFromNow(30), notes: '', createdAt: new Date().toISOString() },
  ];

  storage.set(STORAGE_KEYS.CLIENTS, clients);
  storage.set(STORAGE_KEYS.INVOICES, invoices);
  storage.set(STORAGE_KEYS.REMINDERS, []);
}