import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, LogOut, Clock, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar dengan efek glass, gradient, dan shadow di mobile */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-[9999] border-b border-gray-700/40">
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
              <Link 
                to="/admin" 
                className="text-base sm:text-xl font-bold hover:text-blue-300 transition duration-200 drop-shadow-sm"
              >
                Admin Dashboard
              </Link>
            </div>

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-1 sm:space-x-2 bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition duration-200"
              >
                <span>Menu</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50">
                  <Link 
                    to="/admin/location-settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Lokasi
                  </Link>

                  <Link 
                    to="/admin/account-creation"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Akun
                  </Link>

                  <Link 
                    to="/admin/schedule-settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-blue-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Jadwal
                  </Link>

                  <hr className="my-1 border-gray-700" />

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-900 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{title}</h2>
        {children}
      </main>
    </div>
  );
}