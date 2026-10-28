import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';

export function useClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) setClients(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const newClient = { ...data, user_id: user.id };
    const { data: created, error } = await supabase.from('clients').insert([newClient]).select();
    if (!error) load();
    return created;
  };

  const update = async (id, data) => {
    const { error } = await supabase.from('clients').update(data).eq('id', id);
    if (!error) load();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) load();
  };

  return { clients, create, update, remove };
}