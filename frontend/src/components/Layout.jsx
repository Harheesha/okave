import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Layout({ navLinks = [] }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        {user && (
          <div className="p-4 border-b border-gray-700">
            <p className="text-white text-sm font-medium">{user.name || user.email}</p>
            <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded mt-1 inline-block">
              {user.role}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-green-200 hover:bg-green-700 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left text-green-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
