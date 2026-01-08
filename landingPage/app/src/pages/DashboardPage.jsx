import { useAuth } from '../hooks/useAuth';
import SuperadminDashboard from './SuperadminDashboard';
import OrganizerDashboard from './OrganizerDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'SUPERADMIN') {
    return <SuperadminDashboard />;
  }

  if (user?.role === 'EVENT_ORGANIZER') {
    return <OrganizerDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Invalid user role</p>
    </div>
  );
}
