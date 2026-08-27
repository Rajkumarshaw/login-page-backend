import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, LogOut, LayoutDashboard, User } from 'lucide-react';
import { logout } from '../services/authService';

const Navbar = ({ admin, setAdmin, showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setAdmin(null);
      showToast('Logged out successfully.', 'success');
      navigate('/admin/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log out.', 'error');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl hover:opacity-90">
              <Calendar className="w-6 h-6" />
              <span>AgeFlow</span>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {admin ? (
              <>
                <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{admin.email}</span>
                </div>
                
                {location.pathname !== '/admin/dashboard' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold text-gray-700 hover:text-primary-600 flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-700 hover:text-rose-600 flex items-center gap-1.5 border border-gray-200 hover:border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {location.pathname !== '/admin/login' && (
                  <Link
                    to="/admin/login"
                    className="text-sm font-semibold text-gray-700 hover:text-primary-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Admin Portal
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
