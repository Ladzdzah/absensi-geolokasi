import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigasi tetap di atas */}
      <nav className="bg-gray-800 text-white shadow-lg fixed top-0 left-0 w-full z-[9999] backdrop-blur-md bg-opacity-80 sm:bg-opacity-100 sm:backdrop-blur-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-0.5 sm:p-0">
                <img
                  src="/images/logo-smk.png"
                  alt="Logo SMK"
                  className="h-10 w-10 sm:h-11 sm:w-auto rounded-full shadow-lg border-2 border-white/30 object-cover bg-white"
                  onError={(e) => {
                    const imgElement = e.currentTarget as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-base sm:text-xl font-bold text-gray-100 truncate drop-shadow-sm">ABSENSI PEGAWAI</span>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm font-medium text-gray-200 hidden xs:inline truncate max-w-[100px] sm:max-w-none">
                {user?.full_name || 'Nama Tidak Ditemukan'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-0 sm:space-x-2 bg-gray-700 hover:bg-gray-600 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition duration-200 shadow-md sm:shadow-none"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tambahkan relative dan z-index yang lebih rendah */}
      <main className="relative z-0 pt-14 sm:pt-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}