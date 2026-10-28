import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, Bell, LogOut, 
  Package, PieChart, Settings, Search, Plus, ChevronDown, Moon, Sun, CheckCircle, AlertTriangle, User, Menu, X
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import AIAssistant from '@/components/AIAssistant';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Bagong state

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={styles.shell}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.workspaceBox}>
          <div className={styles.workspaceIcon}>P</div>
          <div className={styles.workspaceText}>
            <strong>PayTrack HQ</strong>
            <span>Pro Workspace</span>
          </div>
          <button className={styles.closeMobileMenu} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <p className={styles.sectionTitle}>MAIN</p>
          <NavLink to="/" end onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <LayoutDashboard size={18} /><span>Dashboard</span>
          </NavLink>

          <p className={styles.sectionTitle}>MANAGEMENT</p>
          <NavLink to="/clients" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Users size={18} /><span>Clients</span>
          </NavLink>
          <NavLink to="/invoices" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <FileText size={18} /><span>Invoices</span>
          </NavLink>
          <NavLink to="/reminders" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Bell size={18} /><span>Reminders</span>
          </NavLink>
          <NavLink to="/products" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Package size={18} /><span>Products</span>
          </NavLink>
          
          <p className={styles.sectionTitle}>ANALYTICS & SYSTEM</p>
          <NavLink to="/reports" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <PieChart size={18} /><span>Reports</span>
          </NavLink>
          <NavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <Settings size={18} /><span>Settings</span>
          </NavLink>
        </nav>

        <div className={styles.userBoxWrapper} ref={profileRef}>
          <div className={styles.userBox} onClick={() => setShowProfile(!showProfile)}>
            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff&rounded=true&bold=true`} alt="avatar" className={styles.avatarImg} />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" className={showProfile ? styles.rotate : ''} />
          </div>

          {showProfile && (
            <div className={styles.dropdownMenuProfile}>
              <button className={styles.dropdownItem} onClick={() => { navigate('/settings'); setShowProfile(false); }}>
                <User size={16} /> My Profile
              </button>
              <div className={styles.dropdownDivider}></div>
              <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          <div className={styles.searchBar}>
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Search clients, invoices..." />
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} color="var(--text-muted)" /> : <Moon size={20} color="var(--text-muted)" />}
            </button>
            
            <div className={styles.notifWrapper} ref={notifRef}>
              <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} color="var(--text-muted)" />
                <span className={styles.notifDot}></span>
              </button>
              {showNotifications && (
                <div className={styles.dropdownMenuNotif}>
                  <div className={styles.notifHeader}><strong>Notifications</strong></div>
                  <div className={styles.notifList}>
                    <div className={styles.notifItem}><p className={styles.notifText}><strong>Payment Received!</strong> Invoice was paid.</p></div>
                  </div>
                </div>
              )}
            </div>

            <button className={styles.createBtn} onClick={() => navigate('/invoices')}>
              <Plus size={18} /> <span className={styles.createBtnText}>Create New</span>
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>

        <button className={styles.fab} onClick={() => navigate('/invoices')}>
          <Plus size={24} />
        </button>
        
        <AIAssistant />
      </div>
    </div>
  );
}