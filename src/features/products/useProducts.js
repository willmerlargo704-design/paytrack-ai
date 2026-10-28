import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) setProducts(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const newProduct = { ...data, user_id: user.id };
    const { data: created, error } = await supabase.from('products').insert([newProduct]).select();
    if (!error) load();
    return created;
  };

  const update = async (id, data) => {
    const { error } = await supabase.from('products').update(data).eq('id', id);
    if (!error) load();
  };

  const remove = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) load();
  };

  return { products, create, update, remove };
}