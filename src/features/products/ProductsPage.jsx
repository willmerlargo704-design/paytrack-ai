import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Package, Box, Layers, Tag, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { useProducts } from './useProducts';
import { useToast } from '@/components/Toast/ToastContext';
import { formatCurrency } from '@/lib/format';
import styles from './Products.module.css';

const EMPTY = { name: '', description: '', price: '', unit: 'pcs' };

const getRandomStyle = (id) => {
  const styles = [
    { bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#3b82f6', icon: Box },
    { bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#10b981', icon: Package },
    { bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', color: '#ef4444', icon: Tag },
    { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#f59e0b', icon: Layers },
    { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', color: '#8b5cf6', icon: Sparkles },
  ];
  const charCode = id.charCodeAt(id.length - 1) || 0;
  return styles[charCode % styles.length];
};

export default function ProductsPage() {
  const { products, create, update, remove } = useProducts();
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
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY, ...p }); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedForm = { ...form, price: parseFloat(form.price) || 0 };
    if (editing) {
      update(editing.id, formattedForm);
      addToast('Product updated successfully!');
    } else {
      create(formattedForm);
      addToast('New product added!');
    }
    setModalOpen(false);
  };

  const handleDelete = (p) => { 
    if (window.confirm(`Delete product "${p.name}"?`)) {
      remove(p.id); 
      addToast('Product deleted.', 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '40px', borderRadius: '8px' }}></div>
        <div className={styles.grid}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '20px' }}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products & Services</h1>
          <p className={styles.sub}>{products.length} items in your catalog</p>
        </div>
        
        <div className={styles.actionsGroup}>
          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreate}><Plus size={16} /> Add Item</Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          {/* Pinalitan natin ang external image ng magandang icon */}
          <div className={styles.emptyIconWrap}>
            <Package size={48} />
          </div>
          <h2 className={styles.emptyTitle}>Your catalog is empty</h2>
          <p className={styles.emptyDesc}>Save your frequent items here to easily add them to invoices later.</p>
          <Button onClick={openCreate} style={{ marginTop: '1.5rem' }}><Plus size={16} /> Create Product</Button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Search size={48} />
          </div>
          <h2 className={styles.emptyTitle}>No results found</h2>
          <p className={styles.emptyDesc}>We couldn't find anything matching "{searchTerm}".</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map((p, index) => {
            const style = getRandomStyle(p.id);
            const Icon = style.icon;
            
            return (
              <div 
                key={p.id} 
                className={styles.card}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrap} style={{ background: style.bg, color: style.color }}>
                    <Icon size={24} />
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.actionBtn} onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.cardDesc}>{p.description || 'No description provided.'}</p>
                
                <div className={styles.cardFooter}>
                  <div className={styles.priceWrap}>
                    <span className={styles.priceLabel}>Price</span>
                    <span className={styles.price}>{formatCurrency(p.price)}</span>
                  </div>
                  <span className={styles.unit}>per {p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'New Product/Service'} footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>{editing ? 'Save changes' : 'Create'}</Button></>}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Item Name *" required placeholder="e.g. Website Design" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" placeholder="Short details about this service" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Price (₱) *" type="number" min="0" step="0.01" required placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Unit" placeholder="e.g. pcs, hrs, project" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}