import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useClients } from './useClients';
import { useToast } from '@/components/Toast/ToastContext';
import styles from './Clients.module.css';

const EMPTY = { name: '', email: '', phone: '', company: '', notes: '' };

export default function ClientsPage() {
  const { clients, create, update, remove } = useClients();
  const { addToast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...EMPTY, ...c }); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      update(editing.id, form);
      addToast('Client updated successfully!');
    } else {
      create(form);
      addToast('New client added!');
    }
    setModalOpen(false);
  };

  const handleDelete = (c) => { 
    if (window.confirm(`Delete client "${c.name}"?`)) {
      remove(c.id); 
      addToast('Client deleted.', 'error');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clients</h1>
          <p className={styles.sub}>{clients.length} total clients</p>
        </div>
        
        <div className={styles.actionsGroup}>
          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreate}><Plus size={16} /> New client</Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="No clients yet" description="Add your first client to start creating invoices." action={<Button onClick={openCreate}><Plus size={16} /> Add client</Button>} />
      ) : filteredClients.length === 0 ? (
        <EmptyState icon={Search} title="No results found" description={`We couldn't find any clients matching "${searchTerm}"`} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {filteredClients.map((c) => (
                <tr key={c.id}>
                  <td>
                    {/* HETO NA YUNG BAGONG AVATAR IMAGE PARA SA CLIENT */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff&rounded=true`} 
                        alt={c.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <strong className={styles.boldText}>{c.name}</strong>
                    </div>
                  </td>
                  <td className={styles.muted}>{c.company || '—'}</td>
                  <td className={styles.muted}>{c.email || '—'}</td>
                  <td className={styles.muted}>{c.phone || '—'}</td>
                  <td className={styles.actions}>
                    <button className={styles.iconBtn} onClick={() => openEdit(c)}><Pencil size={15} /></button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(c)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit client' : 'New client'} footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? 'Save changes' : 'Create client'}</Button></>}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  );
}