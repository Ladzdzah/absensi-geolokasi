import React, { useState, useEffect, useRef } from 'react';
import { Attendance } from '../types';
import AdminLayout from '../components/admin/AdminLayout';
import { api } from '../services/api';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addMonths, eachDayOfInterval, isSameDay } from 'date-fns';
import { Download, Calendar, ChevronLeft, ChevronRight, Check, User, Activity, Clock, Filter, X, ArrowLeft, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getMonthName } from '../utils/attendanceUtils';

/**
 * AdminDashboard: Halaman utama untuk administrator.
 * Menampilkan data kehadiran pegawai dan menyediakan fitur ekspor data.
 */
export default function AdminDashboard() {
  // State untuk data kehadiran
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  
  // State untuk filter dan navigasi
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(0);
  const USERS_PER_PAGE = 2;
  const attendanceContainerRef = useRef<HTMLDivElement>(null);
  
  // Mengambil data saat komponen dimuat
  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  // Memperbarui data harian saat user atau tanggal berubah
  useEffect(() => {
    if (users.length > 0 && attendance.length > 0) {
      generateDailyAttendanceData();
    }
  }, [users, attendance, selectedDate]);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedUser, selectedStatus]);

  /**
   * Mengambil data kehadiran dari API
   */
  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getAllAttendance();
      setAttendance(data);
      
      // Regenerate daily attendance data setiap kali ada update
      if (users.length > 0) {
        generateDailyAttendanceData();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mengambil data pengguna dari API
   */
  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      // Menyaring pengguna non-admin
      const nonAdminUsers = data.filter((user: any) => user.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  /**
   * Menghasilkan data kehadiran harian termasuk data ketidakhadiran
   */
  const generateDailyAttendanceData = () => {
    const daily: Attendance[] = [];
    
    // Mendapatkan rekaman kehadiran untuk tanggal yang dipilih
    const dayAttendance = attendance.filter(att => {
      // Add validation to check if created_at exists and is a valid date string
      if (!att.created_at) return false;
      try {
        return isSameDay(parseISO(att.created_at), selectedDate);
      } catch (error) {
        console.error("Invalid date format for attendance:", att);
        return false;
      }
    });
    
    // Memetakan pengguna untuk menandai status kehadiran
    users.forEach(user => {
      // Mencari apakah pengguna memiliki kehadiran untuk hari ini
      const userAttendance = dayAttendance.find(att => att.user_id === user.id);
      
      if (userAttendance) {
        // Jika memiliki kehadiran, gunakan rekaman yang ada
        const updatedAttendance = { ...userAttendance };
        
        // Perbarui status berdasarkan check-in dan check-out
        if (updatedAttendance.check_in_time) {
          updatedAttendance.status = 'present'; // Setel sebagai hadir jika user check-in
        } else if (!updatedAttendance.check_in_time && updatedAttendance.check_out_time) {
          updatedAttendance.status = 'late'; // Setel sebagai terlambat jika hanya check-out tanpa check-in
        }

        // Pastikan data user lengkap
        updatedAttendance.user = {
          full_name: user.full_name,
          username: user.email
        };
        
        daily.push(updatedAttendance);
      } else {
        // Jika tidak ada kehadiran, buat rekaman absen
        const absentRecord: Attendance = {
          id: `absent-${user.id}-${format(selectedDate, 'yyyy-MM-dd')}`,
          user_id: user.id,
          check_in_time: null,
          check_out_time: null,
          check_in_latitude: null,
          check_in_longitude: null,
          check_out_latitude: null,
          check_out_longitude: null,
          status: 'absent',
          created_at: format(selectedDate, 'yyyy-MM-dd\'T\'HH:mm:ss'),
          user: {
            full_name: user.full_name,
            username: user.email
          }
        };
        daily.push(absentRecord);
      }
    });
    
    setDailyAttendance(daily);
  };

  /**
   * Mendapatkan data kehadiran harian dengan filter
   */
  const getDailyAttendances = () => {
    return dailyAttendance.filter(att => {
      // Terapkan filter pengguna
      if (selectedUser !== 'all' && att.user_id !== selectedUser) {
        return false;
      }
      
      // Terapkan filter status
      if (selectedStatus === 'present' && att.status !== 'present') {
        return false;
      }
      
      if (selectedStatus === 'late' && att.status !== 'late') {
        return false;
      }
      
      if (selectedStatus === 'absent' && att.status !== 'absent') {
        return false;
      }
      
      return true;
    });
  };

  /**
   * Mendapatkan data kehadiran bulanan dengan filter untuk ekspor Excel
   */
  const getMonthlyAttendances = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    // Mulai dengan kehadiran reguler
    let monthlyAttendances = attendance.filter(att => {
      // Add validation to check if created_at exists and is a valid date string
      if (!att.created_at) return false;
      try {
        const attDate = parseISO(att.created_at);
        return attDate >= monthStart && attDate <= monthEnd;
      } catch (error) {
        console.error("Invalid date format for attendance:", att);
        return false;
      }
    });
    
    // Perbarui status untuk setiap rekaman kehadiran berdasarkan check-in dan check-out
    monthlyAttendances.forEach(entry => {
      if (entry.check_in_time) {
        entry.status = 'present'; // Pengguna check-in
      } else if (!entry.check_in_time && entry.check_out_time) {
        entry.status = 'late'; // Hanya check-out tanpa check-in
      }
    });
    
    // Dapatkan semua hari dalam bulan
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Untuk setiap pengguna, periksa apakah mereka memiliki kehadiran untuk setiap hari
    users.forEach(user => {
      daysInMonth.forEach(day => {
        // Periksa apakah pengguna memiliki kehadiran untuk hari ini
        const hasAttendance = attendance.some(att => 
          att.user_id === user.id && 
          isSameDay(parseISO(att.created_at), day)
        );
        
        // Jika tidak ada kehadiran, buat rekaman absen
        if (!hasAttendance) {
          const absentRecord: Attendance = {
            id: `absent-${user.id}-${format(day, 'yyyy-MM-dd')}`,
            user_id: user.id,
            check_in_time: null,
            check_out_time: null,
            check_in_latitude: null,
            check_in_longitude: null,
            check_out_latitude: null,
            check_out_longitude: null,
            status: 'absent',
            created_at: format(day, 'yyyy-MM-dd\'T\'HH:mm:ss'),
            user: {
              full_name: user.full_name,
              username: user.email
            }
          };
          monthlyAttendances.push(absentRecord);
        }
      });
    });
    
    // Terapkan filter dan kecualikan kehadiran admin
    if (selectedUser !== 'all') {
      monthlyAttendances = monthlyAttendances.filter(att => att.user_id === selectedUser);
    }
    
    return monthlyAttendances;
  };

  /**
   * Ekspor data kehadiran ke Excel
   */
  const exportToExcel = () => {
    const monthlyAttendances = getMonthlyAttendances();
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Urutkan pengguna berdasarkan abjad
    const sortedUsers = [...users].sort((a, b) => 
      a.full_name.localeCompare(b.full_name)
    );
    
    // Buat workbook dan worksheet
    const workbook = XLSX.utils.book_new();
    
    // Buat lembar ringkasan berdasarkan nama dengan tipe eksplisit
    interface UserSummary {
      'Nama': string;
      'Hadir': number;
      'Terlambat': number;
      'Tidak Hadir': number;
      'Total Hari': number;
    }
    
    const rekapPerNama: UserSummary[] = [];
    
    // Tentukan tipe rekaman detail pengguna
    interface UserDetailRecord {
      'Tanggal': string;
      'Nama': string;
      'Waktu Masuk': string;
      'Waktu Keluar': string;
      'Status': string;
    }
    
    // Proses data untuk setiap pengguna
    sortedUsers.forEach(user => {
      // Dapatkan semua rekaman kehadiran untuk pengguna ini di bulan yang dipilih
      const userAttendances = monthlyAttendances.filter(att => att.user_id === user.id);
      
      // Buat baris ringkasan untuk pengguna ini
      const userSummary: UserSummary = {
        'Nama': user.full_name,
        'Hadir': userAttendances.filter(att => att.status === 'present').length,
        'Terlambat': userAttendances.filter(att => att.status === 'late').length,
        'Tidak Hadir': userAttendances.filter(att => att.status === 'absent').length,
        'Total Hari': daysInMonth.length
      };
      
      rekapPerNama.push(userSummary);
      
      // Kehadiran detail individual untuk pengguna ini
      const userDetail: UserDetailRecord[] = [];
      
      daysInMonth.forEach(day => {
        // Temukan kehadiran untuk hari ini
        const dayAttendance = userAttendances.find(att => 
          isSameDay(parseISO(att.created_at), day)
        );
        
        let status = 'Tidak Hadir';
        if (dayAttendance) {
          if (dayAttendance.status === 'present') {
            status = 'Hadir';
          } else if (dayAttendance.status === 'late') {
            status = 'Terlambat';
          }
        }
        
        const detailRecord: UserDetailRecord = {
          'Tanggal': format(day, 'dd/MM/yyyy'),
          'Nama': user.full_name,
          'Waktu Masuk': dayAttendance && dayAttendance.check_in_time 
            ? format(parseISO(dayAttendance.check_in_time), 'HH:mm') 
            : '-',
          'Waktu Keluar': dayAttendance && dayAttendance.check_out_time 
            ? format(parseISO(dayAttendance.check_out_time), 'HH:mm') 
            : '-',
          'Status': status
        };
        
        userDetail.push(detailRecord);
      });
      
      // Buat lembar individual untuk setiap pengguna dengan kehadiran detail mereka
      const userWs = XLSX.utils.json_to_sheet(userDetail);
      XLSX.utils.book_append_sheet(workbook, userWs, user.full_name.substring(0, 30));
      
      // Atur lebar kolom
      const userColumnWidths = [
        { wch: 12 },  // Tanggal
        { wch: 25 },  // Nama
        { wch: 12 },  // Waktu Masuk
        { wch: 12 },  // Waktu Keluar
        { wch: 12 },  // Status
      ];
      userWs['!cols'] = userColumnWidths;
    });
    
    // Buat dan tambahkan lembar ringkasan
    const summaryWs = XLSX.utils.json_to_sheet(rekapPerNama);
    XLSX.utils.book_append_sheet(workbook, summaryWs, 'Rekap Karyawan');
    
    // Atur lebar kolom untuk lembar ringkasan
    const summaryColumnWidths = [
      { wch: 25 },  // Nama
      { wch: 8 },   // Hadir
      { wch: 12 },  // Terlambat
      { wch: 12 },  // Tidak Hadir
      { wch: 10 },  // Total Hari
    ];
    summaryWs['!cols'] = summaryColumnWidths;
    
    // Buat juga tampilan kronologis tradisional sebagai lembar pertama
    interface ChronologicalRecord {
      'Tanggal': string;
      'Nama Karyawan': string;
      'Waktu Masuk': string;
      'Waktu Keluar': string;
      'Status': string;
    }
    
    const chronologicalData: ChronologicalRecord[] = monthlyAttendances.map(att => {
      const userName = users.find(user => user.id === att.user_id)?.full_name || 'Unknown User';
      
      let status = 'Tidak Hadir';
      if (att.status === 'present') {
        status = 'Hadir';
      } else if (att.status === 'late') {
        status = 'Terlambat';
      }
      
      return {
        'Tanggal': format(parseISO(att.created_at), 'dd/MM/yyyy'),
        'Nama Karyawan': userName,
        'Waktu Masuk': att.check_in_time ? format(parseISO(att.check_in_time), 'HH:mm') : '-',
        'Waktu Keluar': att.check_out_time ? format(parseISO(att.check_out_time), 'HH:mm') : '-',
        'Status': status
      };
    });
    
    // Urutkan berdasarkan tanggal kemudian berdasarkan nama
    chronologicalData.sort((a, b) => {
      // Pertama urutkan berdasarkan tanggal
      const dateComparison = a['Tanggal'].localeCompare(b['Tanggal']);
      if (dateComparison !== 0) return dateComparison;
      
      // Kemudian urutkan berdasarkan nama
      return a['Nama Karyawan'].localeCompare(b['Nama Karyawan']);
    });
    
    const allDataWs = XLSX.utils.json_to_sheet(chronologicalData);
    XLSX.utils.book_append_sheet(workbook, allDataWs, 'Semua Data');
    
    // Atur lebar kolom
    const allDataColumnWidths = [
      { wch: 12 },  // Tanggal
      { wch: 25 },  // Nama Karyawan
      { wch: 12 },  // Waktu Masuk
      { wch: 12 },  // Waktu Keluar
      { wch: 12 },  // Status
    ];
    allDataWs['!cols'] = allDataColumnWidths;
    
    // Hasilkan file Excel
    const monthYear = format(selectedMonth, 'MMMM_yyyy');
    XLSX.writeFile(workbook, `Rekap_Absensi_${monthYear}.xlsx`);
  };

  /**
   * Mendapatkan URL ekspor untuk format Excel
   */
  const getExportUrl = () => {
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    return `/api/reports/attendance?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}&format=xlsx`;
  };

  /**
   * Navigasi ke bulan sebelumnya
   */
  const prevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
    setSelectedDate(prev => subMonths(prev, 1));
  };

  /**
   * Navigasi ke bulan berikutnya
   */
  const nextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
    setSelectedDate(prev => addMonths(prev, 1));
  };

  /**
   * Navigasi ke hari sebelumnya
   */
  const prevDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  /**
   * Navigasi ke hari berikutnya
   */
  const nextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  /**
   * Mendapatkan statistik untuk ringkasan dashboard
   */
  const getStats = () => {
    const dailyAttendances = getDailyAttendances();
    
    return {
      daily: {
        present: dailyAttendances.filter(att => att.status === 'present').length,
        late: dailyAttendances.filter(att => att.status === 'late').length,
        absent: dailyAttendances.filter(att => att.status === 'absent').length,
        total: dailyAttendances.length,
        uniqueUsers: new Set(dailyAttendances.map(att => att.user_id)).size
      }
    };
  };

  /**
   * Mengelompokkan kehadiran berdasarkan pengguna untuk tampilan kartu
   */
  const groupAttendancesByUser = () => {
    const dailyAttendances = getDailyAttendances();
    const grouped = new Map();
    
    dailyAttendances.forEach(att => {
      if (!grouped.has(att.user_id)) {
        const user = users.find(u => u.id === att.user_id);
        grouped.set(att.user_id, {
          user: user || { full_name: 'Unknown User', id: att.user_id },
          attendances: []
        });
      }
      grouped.get(att.user_id).attendances.push(att);
    });
    
    return Array.from(grouped.values());
  };

  /**
   * Mendapatkan tampilan status kehadiran
   */
  const getAttendanceStatusDisplay = (status: string) => {
    if (status === 'present') {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-900/30 text-green-300 border border-green-800/30">
          Hadir
        </span>
      );
    } else if (status === 'late') {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-amber-900/30 text-amber-300 border border-amber-800/30">
          Terlambat
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-900/30 text-red-300 border border-red-800/30">
          Tidak Hadir
        </span>
      );
    }
  };

  /**
   * Mendapatkan halaman pengguna saat ini
   */
  const getPaginatedUsers = () => {
    const filteredAttendances = groupAttendancesByUser();
    const totalPages = Math.ceil(filteredAttendances.length / USERS_PER_PAGE);
    
    // Pastikan halaman saat ini berada dalam batas
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
      return filteredAttendances.slice(0, USERS_PER_PAGE);
    }
    
    const start = currentPage * USERS_PER_PAGE;
    return filteredAttendances.slice(start, start + USERS_PER_PAGE);
  };

  /**
   * Navigasi ke halaman berikutnya
   */
  const goToNextPage = () => {
    const filteredAttendances = groupAttendancesByUser();
    const totalPages = Math.ceil(filteredAttendances.length / USERS_PER_PAGE);
    
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Gulir ke atas container kehadiran saat halaman berubah
      if (attendanceContainerRef.current) {
        attendanceContainerRef.current.scrollTop = 0;
      }
    }
  };

  /**
   * Navigasi ke halaman sebelumnya
   */
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Gulir ke atas container kehadiran saat halaman berubah
      if (attendanceContainerRef.current) {
        attendanceContainerRef.current.scrollTop = 0;
      }
    }
  };

  /**
   * Mendapatkan total halaman
   */
  const getTotalPages = () => {
    const filteredAttendances = groupAttendancesByUser();
    return Math.ceil(filteredAttendances.length / USERS_PER_PAGE);
  };

  return (
    <AdminLayout title="Dashboard Admin">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Ringkasan Statistik */}
        <div className="bg-gray-800/80 sm:bg-gray-800/80 backdrop-blur-md sm:backdrop-blur-sm rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-md overflow-hidden border-0 sm:border border-gray-700/50 relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-tr before:from-blue-500/20 before:via-indigo-500/10 before:to-purple-500/20 before:z-0 sm:before:hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-300" />
              Dashboard Absensi • {format(selectedDate, 'dd MMMM yyyy')}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Total Hadir</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().daily.present}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <Check className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Karyawan</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().daily.uniqueUsers}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Total Absensi</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().daily.total}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tampilan Data Kehadiran Harian */}
        <div className="bg-gray-800/80 sm:bg-gray-800/80 backdrop-blur-md sm:backdrop-blur-sm rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-md border-0 sm:border border-gray-700/50 overflow-hidden relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-tr before:from-blue-500/20 before:via-indigo-500/10 before:to-purple-500/20 before:z-0 sm:before:hidden">
          <div className="bg-gray-800/80 border-b border-gray-700/50 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-2 sm:gap-3 relative z-10">
            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center">
                <button 
                  onClick={prevDay}
                  className="p-1 rounded-md text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  aria-label="Hari sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <h3 className="text-sm font-medium mx-2 text-blue-100">
                  {format(selectedDate, 'dd MMM yyyy')}
                </h3>
                
                <button 
                  onClick={nextDay}
                  className="p-1 rounded-md text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                  aria-label="Hari berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1.5 rounded-md text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 transition-colors flex items-center"
                >
                  <span className="text-xs">Filter</span>
                </button>
                
                <button
                  onClick={exportToExcel}
                  className="p-1.5 rounded-md bg-blue-600/80 text-blue-100 hover:bg-blue-600 transition-colors"
                  aria-label="Ekspor ke Excel"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Panel filter mobile */}
            {showFilters && (
              <div className="w-full py-2 sm:hidden bg-gray-800/90 rounded-md border border-gray-700/50 mt-2">
                <div className="flex items-center justify-between px-3 mb-2">
                  <h4 className="text-xs font-medium text-blue-300">Filter:</h4>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="px-3 space-y-2">
                  <div className="w-full">
                    <label className="block text-xs text-gray-400 mb-1">Karyawan</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full rounded-md border border-gray-600 bg-gray-700/60 text-xs text-gray-300 py-1.5 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Filter berdasarkan pengguna"
                    >
                      <option value="all">Semua Karyawan</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.full_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStatus('all')}
                        className={`flex-1 py-1.5 text-xs rounded-md border ${
                          selectedStatus === 'all' 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                            : 'bg-gray-700/60 text-gray-300 border-gray-600'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => setSelectedStatus('present')}
                        className={`flex-1 py-1.5 text-xs rounded-md border ${
                          selectedStatus === 'present'
                            ? 'bg-green-500/20 text-green-300 border-green-500/50'
                            : 'bg-gray-700/60 text-gray-300 border-gray-600'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        onClick={() => setSelectedStatus('absent')}
                        className={`flex-1 py-1.5 text-xs rounded-md border ${
                          selectedStatus === 'absent'
                            ? 'bg-red-500/20 text-red-300 border-red-500/50'
                            : 'bg-gray-700/60 text-gray-300 border-gray-600'
                        }`}
                      >
                        Absen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter desktop */}
            <div className="hidden sm:flex flex-wrap items-center gap-2">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="rounded-md border border-gray-600 bg-gray-700/60 text-sm text-gray-300 py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter berdasarkan pengguna"
              >
                <option value="all">Semua Karyawan</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'present' | 'late' | 'absent')}
                className="rounded-md border border-gray-600 bg-gray-700/60 text-sm text-gray-300 py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter berdasarkan status"
              >
                <option value="all">Semua Status</option>
                <option value="present">Hadir</option>
                <option value="late">Terlambat</option>
                <option value="absent">Tidak Hadir</option>
              </select>
              
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-blue-100 bg-blue-600/80 hover:bg-blue-600 transition-colors"
                aria-label="Ekspor ke Excel"
              >
                <Download className="h-4 w-4 mr-1" />
                Ekspor Excel Bulanan
              </button>
            </div>
          </div>
          
          {/* Tampilan kehadiran - dengan pagination yang ditingkatkan */}
          <div className="p-4" ref={attendanceContainerRef}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {getDailyAttendances().length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getPaginatedUsers().map((userGroup) => (
                        <div key={userGroup.user.id} className="bg-gray-800/60 sm:bg-gray-800/50 rounded-2xl sm:rounded-lg overflow-hidden shadow-xl sm:shadow-sm border-0 sm:border border-gray-700/50 hover:border-blue-500/30 transition-colors relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-tr before:from-blue-500/10 before:via-indigo-500/10 before:to-purple-500/10 before:z-0 sm:before:hidden">
                          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                  <h3 className="text-sm font-medium text-gray-200">{userGroup.user.full_name}</h3>
                                  <p className="text-xs text-gray-400">
                                    {userGroup.attendances[0].status === 'present' 
                                      ? 'Hadir hari ini' 
                                      : userGroup.attendances[0].status === 'late'
                                        ? 'Terlambat hari ini'
                                        : 'Tidak hadir hari ini'}
                                  </p>
                                </div>
                              </div>
                              {getAttendanceStatusDisplay(userGroup.attendances[0].status)}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between mb-2">
                              <div className="text-sm text-gray-300">Check-in:</div>
                              <div className="text-sm text-gray-300">
                                {userGroup.attendances[0].check_in_time 
                                  ? format(parseISO(userGroup.attendances[0].check_in_time), 'HH:mm') 
                                  : '-- : --'}
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <div className="text-sm text-gray-300">Check-out:</div>
                              <div className="text-sm text-gray-300">
                                {userGroup.attendances[0].check_out_time 
                                  ? format(parseISO(userGroup.attendances[0].check_out_time), 'HH:mm') 
                                  : '-- : --'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Kontrol pagination untuk pengalaman mobile yang lebih baik */}
                    {getTotalPages() > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-gray-700/50">
                        <div className="text-xs text-gray-400 text-center sm:text-left w-full sm:w-auto order-2 sm:order-1">
                          Menampilkan {currentPage * USERS_PER_PAGE + 1}-{Math.min((currentPage + 1) * USERS_PER_PAGE, groupAttendancesByUser().length)} dari {groupAttendancesByUser().length} karyawan
                        </div>
                        
                        <div className="flex items-center space-x-3 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
                          <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 0}
                            className={`p-2 rounded-md border border-gray-700 ${
                              currentPage === 0 
                                ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed' 
                                : 'bg-gray-800 text-blue-300 hover:bg-gray-700 hover:text-blue-200'
                            }`}
                            aria-label="Halaman sebelumnya"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                          
                          <span className="text-sm text-gray-300 min-w-[60px] text-center">
                            {currentPage + 1} / {getTotalPages()}
                          </span>
                          
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage >= getTotalPages() - 1}
                            className={`p-2 rounded-md border border-gray-700 ${
                              currentPage >= getTotalPages() - 1
                                ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-800 text-blue-300 hover:bg-gray-700 hover:text-blue-200'
                            }`}
                            aria-label="Halaman berikutnya"
                          >
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Indikator geser mobile */}
                    {getTotalPages() > 1 && (
                      <div className="sm:hidden flex items-center justify-center mt-1">
                        <div className="flex space-x-1">
                          {Array.from({ length: getTotalPages() }).map((_, index) => (
                            <div 
                              key={index}
                              className={`h-1.5 rounded-full ${
                                currentPage === index
                                  ? 'w-6 bg-blue-500'
                                  : 'w-2 bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 text-gray-400 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                    <p>Tidak ada data absensi untuk periode yang dipilih</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}