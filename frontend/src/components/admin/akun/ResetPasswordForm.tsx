import React, { useState, useEffect } from 'react';
import { Key, User, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../services/api';

// Add Notification interface
interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface ResetPasswordFormProps {
  resetPasswordData: {
    username: string;
    newPassword: string;
    confirmPassword: string;
  };
  setResetPasswordData: (data: any) => void;
  userList: string[];
  loading: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetPasswordData,
  setResetPasswordData,
  userList,
  loading,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

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
    
    try {
      if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
        setNotification({
          type: 'error',
          message: 'Password baru dan konfirmasi tidak sama'
        });
        return;
      }

      if (resetPasswordData.newPassword.length < 6) {
        setNotification({
          type: 'error',
          message: 'Password minimal 6 karakter'
        });
        return;
      }

      // Reset password
      await api.auth.resetPassword(
        resetPasswordData.username,
        resetPasswordData.newPassword
      );

      // Show success notification
      setNotification({
        type: 'success',
        message: `Password untuk ${resetPasswordData.username} berhasil direset`
      });

      // Reset form
      setResetPasswordData({
        username: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err: any) {
      console.error('Error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Gagal mereset password'
      });
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-red-500/30 transition-colors duration-300">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50 flex items-center bg-gray-900/50">
          <Key className="w-5 h-5 text-red-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-100">Reset Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Username Select */}
          <div className="relative group">
            <select
              value={resetPasswordData.username}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, username: e.target.value });
                setNotification(null);
              }}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 appearance-none cursor-pointer focus:border-red-500/50 
                        focus:ring-1 focus:ring-red-500/20 group-hover:border-red-500/30 
                        transition-all duration-200"
              required
            >
              <option value="" disabled>Pilih username</option>
              {userList.map((username) => (
                <option key={username} value={username}>{username}</option>
              ))}
            </select>
            <User className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-red-500 transition-colors duration-200" />
          </div>

          {/* New Password Input */}
          <div className="relative group">
            <input
              type={showNewPassword ? "text" : "password"}
              value={resetPasswordData.newPassword}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value });
                setNotification(null);
              }}
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
              className="absolute right-3 top-3 text-gray-500"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={resetPasswordData.confirmPassword}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value });
                setNotification(null);
              }}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 placeholder-gray-500/50 focus:border-red-500/50 
                        focus:ring-1 focus:ring-red-500/20 group-hover:border-red-500/30 
                        transition-all duration-200"
              placeholder="Konfirmasi Password"
              required
              minLength={6}
            />
            <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-red-500 transition-colors duration-200" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!(notification && notification.type === 'success')}
            className="w-full h-12 sm:h-11 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500
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

export default ResetPasswordForm;