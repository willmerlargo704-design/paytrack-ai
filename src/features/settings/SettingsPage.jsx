import { useState } from 'react';
import { Save, Download, Upload, Shield, User, Image as ImageIcon } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/Toast/ToastContext';
import { STORAGE_KEYS } from '@/lib/constants';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const { user } = useAuth(); 
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || 'Freelance');
  const [logo, setLogo] = useState(() => localStorage.getItem('paytrack_logo') || null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        localStorage.setItem('paytrack_logo', reader.result);
        addToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, name, company } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    
    const updatedSession = { ...user, name, company };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));
    
    addToast('Profile updated successfully!');
    setTimeout(() => window.location.reload(), 1000); 
  };

  const handleBackup = () => {
    const data = {
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)),
      clients: JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS)),
      invoices: JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES)),
      products: JSON.parse(localStorage.getItem('paytrack_products')),
      logo: localStorage.getItem('paytrack_logo')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paytrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast('Backup downloaded!', 'success');
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.clients) localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
        if (data.invoices) localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data.invoices));
        if (data.products) localStorage.setItem('paytrack_products', JSON.stringify(data.products));
        if (data.logo) localStorage.setItem('paytrack_logo', data.logo);
        addToast('Data restored successfully! Refreshing...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        addToast('Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.sub}>Manage your account and data.</p>
      </div>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={20} color="var(--primary)" />
            <h2>Profile Information</h2>
          </div>
          <form onSubmit={handleSaveProfile} className={styles.form}>
            {/* Logo Uploader */}
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--bg)', border: '1px dashed var(--border)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {logo ? <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} color="var(--text-muted)" />}
              </div>
              <div>
                <label className={styles.uploadLabel} style={{ padding: '0.5rem 1rem', width: 'auto' }}>
                  <Upload size={14} /> Upload Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>PNG or JPG, max 2MB.</p>
              </div>
            </div>

            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Email Address" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <Button type="submit" style={{ marginTop: '1rem' }}><Save size={16} /> Save Changes</Button>
          </form>
        </div>

        {/* Data Management Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Shield size={20} color="#10b981" />
            <h2>Data Management</h2>
          </div>
          <div className={styles.dataSection}>
            <p className={styles.helpText}>Since this is a local app, your data is saved in your browser. Download a backup to keep it safe.</p>
            
            <Button variant="secondary" onClick={handleBackup} className={styles.actionBtn}>
              <Download size={16} /> Download Backup (.json)
            </Button>

            <div className={styles.divider}><span>or</span></div>

            <label className={styles.uploadLabel}>
              <Upload size={16} /> Restore from Backup
              <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}