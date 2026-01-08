import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCog, FaSave, FaUsers } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const location = useLocation();
  const { user, logout, isSuperadmin } = useAuth();

  // Navigation items based on role
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, roles: ['SUPERADMIN', 'EVENT_ORGANIZER'] },
    { path: '/configuration', label: 'Configuration', icon: <FaCog />, roles: ['SUPERADMIN', 'EVENT_ORGANIZER'] },
    { path: '/saved', label: 'Saved Configs', icon: <FaSave />, roles: ['SUPERADMIN', 'EVENT_ORGANIZER'] },
    { path: '/manage-clients', label: 'Manage Clients', icon: <FaUsers />, roles: ['SUPERADMIN'] },
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800">Landing Page Builder</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation Links */}
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline text-sm">{item.label}</span>
              </Link>
            ))}

            {/* User Info & Logout */}
            {user && (
              <>
                <div className="ml-2 px-3 py-2 text-sm text-gray-700 hidden sm:block">
                  <span className="font-medium">{user.name}</span>
                  {isSuperadmin && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
