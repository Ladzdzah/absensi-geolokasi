import React, { useState } from 'react';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Interface untuk props komponen Modal Konfirmasi Admin
 */
interface AdminConfirmationModalProps {
  isOpen: boolean;                                // Status tampilan modal
  onClose: () => void;                           // Handler untuk menutup modal
  onConfirm: (e: React.FormEvent) => void;       // Handler untuk konfirmasi
  password: string;                              // Value password admin
  setPassword: (password: string) => void;        // Handler update password
  error: string;                                 // Pesan error jika ada
  loading: boolean;                              // Status loading
  title?: string;                                // Judul modal (opsional)
}

/**
 * Komponen Modal Konfirmasi Password Admin
 * 
 * Fitur-fitur:
 * 1. Input password admin dengan toggle show/hide
 * 2. Validasi password sebelum aksi
 * 3. Loading state saat proses
 * 4. Pesan error jika validasi gagal
 * 5. Animasi modal smooth
 */
const AdminConfirmationModal: React.FC<AdminConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
  error,
  loading,
  title = "Konfirmasi Password Admin" // Default title
}) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const verifyResponse = await fetch('http://localhost:5000/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ password: password })
      });

      if (!verifyResponse.ok) {
        // Error notification for invalid password
        const errorNotification = document.createElement('div');
        errorNotification.className = `
          fixed top-4 right-4 flex items-center space-x-4
          bg-gray-800/90 border-l-4 border-red-500
          text-gray-100 px-6 py-4 rounded-lg shadow-2xl
          transform transition-all duration-300 ease-out z-50
        `;
        
        errorNotification.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20">
              <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-red-500">Gagal!</h3>
              <p class="text-sm text-gray-300">Password admin tidak valid</p>
            </div>
          </div>
        `;

        document.body.appendChild(errorNotification);
        
        setTimeout(() => {
          errorNotification.style.opacity = '0';
          errorNotification.style.transform = 'translateX(100%)';
          setTimeout(() => errorNotification.remove(), 500);
        }, 3000);

        throw new Error('Password admin tidak valid');
      }

      // Jika verifikasi berhasil, lanjutkan dengan onConfirm
      await onConfirm(e);
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = `
        fixed top-4 right-4 flex items-center space-x-4
        bg-gray-800/90 border-l-4 border-green-500
        text-gray-100 px-6 py-4 rounded-lg shadow-2xl
        transform transition-all duration-300 ease-out z-50
      `;
      
      notification.innerHTML = `
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-500/20">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-green-500">Berhasil!</h3>
            <p class="text-sm text-gray-300">${title.replace('Konfirmasi Password Admin untuk ', '')}</p>
          </div>
        </div>
      `;

      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 500);
      }, 3000);

      // Reset state setelah berhasil
      setPassword('');
      onClose();

    } catch (err: any) {
      console.error('Error:', err);
      setPassword('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/90 rounded-lg border border-gray-700/50 w-full max-w-md p-6 shadow-xl">
        {/* Header Modal */}
        <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
          <Lock className="w-5 h-5 text-blue-500 mr-2" />
          {title}
        </h3>

        {/* Form Input Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-11 bg-gray-900/50 border border-gray-700/50 rounded-lg 
                        text-gray-200 placeholder-gray-500/50 focus:border-blue-500/50 
                        focus:ring-1 focus:ring-blue-500/20 group-hover:border-blue-500/30 
                        transition-all duration-200"
              placeholder="Masukkan password admin"
              required
              autoFocus
            />
            <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3 group-hover:text-blue-500 transition-colors duration-200" />
            
            {/* Tombol Show/Hide Password */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-3 text-gray-500 hover:text-blue-500 transition-colors duration-200 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="flex items-center text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 bg-gray-700/50 text-gray-300 hover:bg-gray-700 
                       rounded-lg transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 h-10 bg-blue-500 text-white hover:bg-blue-600 
                       rounded-lg transition-colors duration-200 flex items-center 
                       disabled:opacity-50 disabled:hover:bg-blue-500"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                'Konfirmasi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfirmationModal;