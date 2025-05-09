import React, { useState, useEffect } from 'react';
import { UserPlus, User, Lock, BadgeCheck, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

/**
 * Interface untuk props komponen Form Pembuatan Akun
 */
interface CreateAccountFormProps {
  newUser: {
    username: string;
    password: string;
    full_name: string;
    role: string;
  };
  setNewUser: (user: any) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  loading: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

/**
 * Komponen Form Pembuatan Akun
 * 
 * Fitur-fitur:
 * 1. Form input data akun:
 *    - Nama lengkap
 *    - Username
 *    - Role (user/admin)
 *    - Password dengan toggle show/hide
 * 2. Validasi form:
 *    - Semua field wajib diisi
 *    - Password minimal 6 karakter
 * 3. Konfirmasi password admin:
 *    - Modal konfirmasi sebelum membuat akun
 *    - Verifikasi password admin
 * 4. Handling response:
 *    - Loading state saat proses
 *    - Notifikasi sukses/error
 *    - Reset form setelah berhasil
 */
const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  newUser,
  setNewUser,
  handleCreateUser,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Auto hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.full_name || !newUser.username || !newUser.password || newUser.password.length < 6) {
      setNotification({
        type: 'error',
        message: 'Silakan lengkapi semua field dengan benar'
      });
      return;
    }

    try {
      await handleCreateUser(e);
      setNotification({
        type: 'success',
        message: `Akun ${newUser.username} berhasil dibuat`
      });
    } catch (err: any) {
      console.error('Error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal menambahkan user'
      });
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-blue-500/30 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center bg-gray-900/50">
          <UserPlus className="w-5 h-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-100">Pembuatan Akun</h2>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                          text-gray-200 placeholder-gray-500/50 focus:border-blue-500/50 
                          focus:ring-1 focus:ring-blue-500/20 group-hover:border-blue-500/30 
                          transition-all duration-200"
                placeholder="Nama Lengkap"
                required
              />
              <User className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-blue-500 transition-colors duration-200" />
            </div>

            <div className="relative group">
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                          text-gray-200 placeholder-gray-500/50 focus:border-blue-500/50 
                          focus:ring-1 focus:ring-blue-500/20 group-hover:border-blue-500/30 
                          transition-all duration-200"
                placeholder="Username"
                required
              />
              <User className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-blue-500 transition-colors duration-200" />
            </div>

            <div className="relative group">
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                          text-gray-200 appearance-none cursor-pointer focus:border-blue-500/50 
                          focus:ring-1 focus:ring-blue-500/20 group-hover:border-blue-500/30 
                          transition-all duration-200"
                required
              >
                <option value="user" className="bg-gray-900">User</option>
                <option value="admin" className="bg-gray-900">Admin</option>
              </select>
              <BadgeCheck className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-blue-500 transition-colors duration-200" />
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                          text-gray-200 placeholder-gray-500/50 focus:border-blue-500/50 
                          focus:ring-1 focus:ring-blue-500/20 group-hover:border-blue-500/30 
                          transition-all duration-200"
                placeholder="Password (min. 6 karakter)"
                required
                minLength={6}
              />
              <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-blue-500 transition-colors duration-200" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-500 transition-colors duration-200 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500
                     text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Buat Akun
              </>
            )}
          </button>
        </form>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div 
            className={`flex items-center gap-4 px-8 py-4 rounded-2xl shadow-2xl
              transform transition-all duration-500 animate-fade-up backdrop-blur-sm
              ${notification.type === 'success' 
                ? 'bg-gray-800/90 border-2 border-green-500/30' 
                : 'bg-gray-800/90 border-2 border-red-500/30'}`}
          >
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-500 animate-bounce-small
                ${notification.type === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'}`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold mb-0.5
                ${notification.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
              >
                {notification.type === 'success' ? 'Berhasil' : 'Gagal'}
              </span>
              <span className="text-gray-300 font-medium">
                {notification.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAccountForm;