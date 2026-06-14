import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    const links = [
      { to: '/marketplace', label: 'Marketplace', icon: '🛒' },
    ];
    if (user?.role === 'AGENT') {
      links.push({ to: '/agent', label: 'My Dashboard', icon: '📊' });
      links.push({ to: '/agent/listings/new', label: 'Create Listing', icon: '➕' });
    }
    if (user?.role === 'ADMIN') {
      links.push({ to: '/admin', label: 'Admin Panel', icon: '🔧' });
    }
    return links;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Okave</p>
              <p className="text-gray-400 text-xs">Farm-to-Market</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user ? (
          <div className="p-4 border-b border-gray-700">
            <p className="text-white text-sm font-medium">{user.name || user.email}</p>
            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded mt-1 inline-block">{user.role}</span>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-700">
            <p className="text-gray-400 text-sm">Browsing as guest</p>
            <button onClick={() => navigate('/login')} className="text-xs text-green-400 hover:text-green-300 mt-1">Sign in →</button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {getNavLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout / Login */}
        <div className="p-3 border-t border-gray-700">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white w-full transition-colors"
            >
              <span>🚪</span> Logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 w-full transition-colors"
            >
              <span>🔑</span> Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
