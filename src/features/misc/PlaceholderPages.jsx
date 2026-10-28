import EmptyState from '@/components/EmptyState';
import { Package, PieChart, Settings, HelpCircle, CreditCard } from 'lucide-react';

const PageWrapper = ({ icon, title, desc }) => (
  <div style={{ animation: 'slideUpFade 0.5s ease forwards' }}>
    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{title}</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{desc}</p>
    <EmptyState 
      icon={icon} 
      title={`${title} Module`} 
      description="This feature is coming soon in the next update. Stay tuned!" 
    />
  </div>
);

export const ProductsPage = () => <PageWrapper icon={Package} title="Products & Services" desc="Manage your inventory and pricing." />;
export const ExpensesPage = () => <PageWrapper icon={CreditCard} title="Expenses" desc="Track your business spendings." />;
export const ReportsPage = () => <PageWrapper icon={PieChart} title="Reports & Analytics" desc="Deep dive into your business data." />;
export const SettingsPage = () => <PageWrapper icon={Settings} title="Settings" desc="Manage your workspace preferences." />;
export const HelpPage = () => <PageWrapper icon={HelpCircle} title="Help & Support" desc="Get assistance with PayTrack." />;