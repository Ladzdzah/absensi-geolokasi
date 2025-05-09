import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import CreateAccountForm from '../components/admin/akun/CreateAccountForm';
import ResetPasswordForm from '../components/admin/akun/ResetPasswordForm';
import AccountList from '../components/admin/akun/AccountList';

/**
 * Komponen Halaman Manajemen Akun
 * 
 * Fitur-fitur:
 * 1. Pembuatan akun baru (admin/user)
 * 2. Reset password pengguna
 * 3. Daftar dan hapus akun
 */
export default function AccountCreation() {
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'user',
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<{
    id: string;
    username: string;
    full_name: string;
    role: string;
  }>>([]);

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi untuk mengambil daftar user dari API
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) setUsers(data);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    }
  };

  // Handler untuk membuat user baru
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat user');
      }

      setNewUser({ username: '', password: '', full_name: '', role: 'user' });
      fetchUsers(); // Refresh daftar user
    } catch (err: any) {
      console.error('Gagal membuat user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk menghapus user
  const handleDeleteUser = async (userId: string) => {
    try {
      // State diupdate langsung setelah penghapusan berhasil
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Gagal menghapus user:', err);
    }
  };

  return (
    <AdminLayout title="Pembuatan Akun dan Lupa Sandi">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CreateAccountForm
            newUser={newUser}
            setNewUser={setNewUser}
            handleCreateUser={handleCreateUser}
            loading={loading}
          />
          <ResetPasswordForm
            resetPasswordData={resetPasswordData}
            setResetPasswordData={setResetPasswordData}
            userList={users.map(user => user.username)}
            loading={loading}
          />
        </div>
        <AccountList 
          userList={users}
          onDeleteUser={handleDeleteUser}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
}