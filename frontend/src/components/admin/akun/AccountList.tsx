import React, { useState } from 'react';
import { UserX, Users, } from 'lucide-react';
import AdminConfirmationModal from './AdminConfirmationModal';

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

const AccountList: React.FC<AccountListProps> = ({ userList, onDeleteUser, loading }) => {
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [deletedUser, setDeletedUser] = useState('');

  const handleDeleteClick = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setDeletedUser(username);
    setShowAdminConfirm(true);
    setAdminError('');
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Verify admin password first
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

      // Perbaiki endpoint URL untuk delete user
      const deleteResponse = await fetch(`http://localhost:5000/api/admin/users/${selectedUserId}`, { // <-- Perubahan disini
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!deleteResponse.ok) {
        throw new Error('Gagal menghapus akun');
      }

      // Close modal and reset states
      setShowAdminConfirm(false);
      setAdminPassword('');

      // Call parent's onDeleteUser to update UI
      onDeleteUser(selectedUserId);

      // Reset states
      handleCloseModal();

    } catch (err: any) {
      setAdminError(err.message);
    }
  };

  const handleCloseModal = () => {
    setShowAdminConfirm(false);
    setAdminPassword('');
    setAdminError('');
    setSelectedUserId('');
    setDeletedUser('');
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-700/50 flex items-center bg-gray-900/50">
          <Users className="w-5 h-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-100">Daftar Akun Aktif</h2>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
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
                    <td className="py-3 text-sm text-gray-300">
                      {user.full_name}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {user.username}
                    </td>
                    <td className="py-3">
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
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteClick(user.id, user.username)}
                        disabled={loading || user.role === 'admin'}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${
                          user.role === 'admin'
                            ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                      >
                        {loading && selectedUserId === user.id ? (
                          <svg className="animate-spin h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <UserX className="w-4 h-4 mr-1.5" />
                        )}
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {userList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      Tidak ada akun yang tersedia
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminConfirmationModal
        isOpen={showAdminConfirm}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        password={adminPassword}
        setPassword={setAdminPassword}
        error={adminError}
        loading={loading}
        title={`Konfirmasi Password Admin untuk Menghapus Akun ${deletedUser}`}
      />
    </>
  );
};

export default AccountList;