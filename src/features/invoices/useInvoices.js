import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      // Isinasalin natin ang snake_case ng Supabase pabalik sa camelCase ng React
      const mapped = data.map(inv => ({
        ...inv,
        clientId: inv.client_id,
        invoiceNumber: inv.invoice_number,
        issueDate: inv.issue_date,
        dueDate: inv.due_date
      }));
      setInvoices(mapped);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    // Isinasalin natin ang camelCase ng React papunta sa snake_case ng Supabase
    const newInvoice = {
      user_id: user.id,
      client_id: data.clientId,
      invoice_number: data.invoiceNumber,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      issue_date: data.issueDate,
      due_date: data.dueDate,
      notes: data.notes
    };
    
    const { data: created, error } = await supabase.from('invoices').insert([newInvoice]).select();
    if (!error) load();
    return created;
  };

  const update = async (id, data) => {
    const updates = { ...data };
    if (data.clientId) { updates.client_id = data.clientId; delete updates.clientId; }
    if (data.invoiceNumber) { updates.invoice_number = data.invoiceNumber; delete updates.invoiceNumber; }
    if (data.issueDate) { updates.issue_date = data.issueDate; delete updates.issueDate; }
    if (data.dueDate) { updates.due_date = data.dueDate; delete updates.dueDate; }

    const { error } = await supabase.from('invoices').update(updates).eq('id', id);
    if (!error) load();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) load();
  };

  return { invoices, create, update, remove };
}