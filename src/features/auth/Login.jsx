import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useToast } from '@/components/Toast/ToastContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Logged in successfully!', 'success');
      navigate('/');
    } catch (err) { 
      setError(err.message || 'Invalid email or password'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>💰 PayTrack AI</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to manage your invoices</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Tinanggal na ang placeholder sa Email */}
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          
          {/* Tinanggal na rin ang placeholder sa Password para malinis */}
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          
          <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</Button>
        </form>
        
        <p className={styles.footer}>No account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}