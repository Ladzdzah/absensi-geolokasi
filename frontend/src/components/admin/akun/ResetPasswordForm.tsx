import React, { useState } from 'react';
import { Key, User, Lock, Eye, EyeOff } from 'lucide-react';
import AdminConfirmationModal from './AdminConfirmationModal';

/**
 * Interface untuk props komponen Reset Password
 */
interface ResetPasswordFormProps {
  resetPasswordData: {
    username: string;
    newPassword: string;
    confirmPassword: string;
  };
  setResetPasswordData: (data: any) => void;
  userList: string[];
  openModal: (e: React.FormEvent) => void;
  loading: boolean;
}

/**
 * Komponen Form Reset Password
 * 
 * Fitur-fitur:
 * 1. Pemilihan akun:
 *    - Dropdown list username
 * 2. Input password baru:
 *    - Password baru dengan toggle show/hide
 *    - Konfirmasi password dengan toggle show/hide
 *    - Validasi minimal 6 karakter
 * 3. Validasi form:
 *    - Kecocokan password dan konfirmasi
 *    - Semua field wajib diisi
 * 4. Konfirmasi admin:
 *    - Modal verifikasi password admin
 *    - Validasi password admin
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetPasswordData,
  setResetPasswordData,
  userList,
  loading,
}) => {
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setAdminError('Password baru dan konfirmasi tidak sama');
      return;
    }
    setShowAdminConfirm(true);
    setAdminError('');
  };

  const handleAdminConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const verifyResponse = await fetch('http://localhost:5000/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ password: adminPassword })
      });

      if (!verifyResponse.ok) {
        throw new Error('Password admin tidak valid');
      }

      const resetResponse = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          username: resetPasswordData.username,
          newPassword: resetPasswordData.newPassword,
          adminPassword: adminPassword
        })
      });

      if (!resetResponse.ok) {
        throw new Error('Gagal mengubah password');
      }

      // Reset form dan tutup modal
      setShowAdminConfirm(false);
      setAdminPassword('');
      setAdminError('');
      setResetPasswordData({
        username: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err: any) {
      setAdminError(err.message);
    }
  };

  const handleCloseModal = () => {
    setShowAdminConfirm(false);
    setAdminPassword('');
    setAdminError('');
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-red-500/30 transition-colors duration-300">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center bg-gray-900/50">
          <Key className="w-5 h-5 text-red-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-100">Reset Password</h2>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username Select */}
          <div className="relative group">
            <select
              value={resetPasswordData.username}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, username: e.target.value })}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 appearance-none cursor-pointer focus:border-red-500/50 
                        focus:ring-1 focus:ring-red-500/20 group-hover:border-red-500/30 
                        transition-all duration-200"
              required
            >
              <option value="" disabled className="bg-gray-900">Pilih username</option>
              {userList.map((username) => (
                <option key={username} value={username} className="bg-gray-900">{username}</option>
              ))}
            </select>
            <User className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-red-500 transition-colors duration-200" />
          </div>

          {/* Password Input Fields */}
          <div className="relative group">
            <input
              type={showNewPassword ? "text" : "password"}
              value={resetPasswordData.newPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 placeholder-gray-500/50 focus:border-red-500/50 
                        focus:ring-1 focus:ring-red-500/20 group-hover:border-red-500/30 
                        transition-all duration-200"
              placeholder="Password Baru"
              required
              minLength={6}
            />
            <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-red-500 transition-colors duration-200" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={resetPasswordData.confirmPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 placeholder-gray-500/50 focus:border-red-500/50 
                        focus:ring-1 focus:ring-red-500/20 group-hover:border-red-500/30 
                        transition-all duration-200"
              placeholder="Konfirmasi Password Baru"
              required
              minLength={6}
            />
            <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-red-500 transition-colors duration-200" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500
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
                <Key className="w-5 h-5 mr-2" />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Modal Konfirmasi Admin */}
      <AdminConfirmationModal
        isOpen={showAdminConfirm}
        onClose={handleCloseModal}
        onConfirm={handleAdminConfirm}
        password={adminPassword}
        setPassword={setAdminPassword}
        error={adminError}
        loading={loading}
        title="Konfirmasi Password Admin untuk Reset Password"
      />
    </>
  );
};

export default ResetPasswordForm;