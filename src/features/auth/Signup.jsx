import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useToast } from '@/components/Toast/ToastContext';
import styles from './Auth.module.css';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      addToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) { 
      setError(err.message || 'Failed to create account'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>💰 PayTrack AI</div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start tracking invoices in 30 seconds</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input label="Full name" placeholder="Juan Dela Cruz" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
        </form>
        
        <p className={styles.footer}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}