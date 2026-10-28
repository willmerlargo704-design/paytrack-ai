import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false });
      
    if (!error && data) setReminders(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const logReminder = async ({ invoiceId, type = 'email', message }) => {
    const newReminder = { 
      user_id: user.id, 
      invoice_id: invoiceId, 
      type, 
      message 
    };
    const { data, error } = await supabase.from('reminders').insert([newReminder]).select();
    if (!error) load();
    return data;
  };

  const remindersFor = (invoiceId) =>
    reminders.filter((r) => r.invoice_id === invoiceId);

  return { reminders, logReminder, remindersFor };
}