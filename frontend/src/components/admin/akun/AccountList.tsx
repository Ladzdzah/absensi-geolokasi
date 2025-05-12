import React, { useState, useEffect } from 'react';
import { UserX, Users, Lock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../services/api';

interface AccountListProps {
  userList: Array<{
    id: string;
    username: string;
    full_name: string;
    role: string;
  }>;
  onDeleteUser: (userId: string) => void;
  loading: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const AccountList: React.FC<AccountListProps> = ({ userList, onDeleteUser, loading }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [deletedUsername, setDeletedUsername] = useState('');
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

  const handleDeleteClick = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setDeletedUsername(username);
    setShowConfirmModal(true);
    setError('');
  };

  const handleConfirmDelete = async () => {
    try {
      // Verifikasi password admin
      await api.auth.verifyAdmin(adminPassword);

      // Hapus user jika verifikasi berhasil
      await api.users.delete(selectedUserId);
      
      // Update UI langsung menggunakan callback
      onDeleteUser(selectedUserId);

      // Reset state dan tutup modal
      handleCloseModal();
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Akun ${deletedUsername} berhasil dihapus`
      });

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Gagal menghapus user');
      
      // Show error notification
      setNotification({
        type: 'error',
        message: err.message || 'Gagal menghapus user'
      });
    }
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setAdminPassword('');
    setError('');
    setSelectedUserId('');
    setDeletedUsername('');
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center bg-gray-900/50">
          <Users className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-100">Daftar Akun Aktif</h2>
        </div>

        <div className="p-3 sm:p-6">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="pb-3 px-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="pb-3 px-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="pb-3 px-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="pb-3 px-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {userList.map((user) => (
                  <tr 
                    key={user.id} 
                    className="group hover:bg-gray-700/20 transition-colors duration-200"
                  >
                    <td className="py-3 px-2 text-sm text-gray-300 max-w-[120px] truncate">
                      {user.full_name}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300 max-w-[120px] truncate">
                      {user.username}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md inline-flex items-center ${
                          user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleDeleteClick(user.id, user.username)}
                        disabled={loading || user.role === 'admin'}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${
                          user.role === 'admin'
                            ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                      >
                        <UserX className="w-4 h-4 mr-1.5" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-400">
                      Tidak ada akun yang tersedia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-gray-800/90 rounded-xl p-8 w-full max-w-md shadow-2xl transform 
                       transition-all duration-300 scale-100 border border-gray-700/50"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100">
                Konfirmasi Password Admin
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Untuk keamanan, masukkan password admin untuk melanjutkan
              </p>
            </div>

            {/* Input Password */}
            <div className="relative mb-6">
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                            text-gray-200 placeholder-gray-500/50 focus:border-red-500/50 
                            focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  placeholder="Password Admin"
                  autoFocus
                />
                <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 
                              rounded-lg px-4 py-2.5 flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                  {error}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-lg 
                          hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 
                          text-white rounded-lg hover:from-red-600 hover:to-red-700 
                          transition-all duration-200 font-medium shadow-lg 
                          shadow-red-500/25"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountList;

/*
@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-small {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.animate-fade-up {
  animation: fade-up 0.5s ease-out;
}

.animate-bounce-small {
  animation: bounce-small 2s infinite;
}
*/