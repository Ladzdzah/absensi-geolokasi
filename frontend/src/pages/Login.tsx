import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaShieldAlt, FaSignInAlt } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email.includes('@')) {
        throw new Error('Masukkan alamat email yang valid');
      }

      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter');
      }

      // For demo purposes - seed default users if no users exist
      const storedUsers = localStorage.getItem('users');
      if (!storedUsers || JSON.parse(storedUsers).length === 0) {
        const defaultUsers = [
          {
            id: '1',
            email: 'admin@example.com',
            password: 'admin123',
            full_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            email: 'employee@example.com',
            password: 'employee123',
            full_name: 'Employee User',
            role: 'employee',
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
      }
      
      // Get users from localStorage (after potential seeding)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user with matching email and password
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        // Save auth info to localStorage
        localStorage.setItem('authToken', 'dummy-auth-token');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'employee') {
          navigate('/employee');
        }
      } else {
        throw new Error('Email atau password tidak valid');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-blue-900 px-8 py-6 text-center">
            <img 
              src="/assets/logo.png" 
              alt="TPQ AL IKHLAS Logo" 
              className="w-40 h-40 mx-auto mb-5 object-contain"
            />
            <h1 className="text-3xl font-bold text-white">SPS TPQ AL IKHLAS</h1>
            <p className="text-blue-200">Sistem absensi pegawai berbasis geolokasi</p>
          </div>
          <div className="p-8">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  <div className="flex items-center">
                    <FaUser className="w-5 h-5 mr-2" />
                    Email
                  </div>
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Masukkan email anda"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan kata sandi"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 font-semibold"
                disabled={loading}
              >
                <FaSignInAlt className="w-5 h-5" />
                <span>{loading ? 'Sedang Masuk...' : 'Masuk'}</span>
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400">
              Selamat datang di sistem absensi sekolah kami
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}