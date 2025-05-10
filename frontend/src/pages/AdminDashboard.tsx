import React, { useState, useEffect } from 'react';
import { Attendance } from '../types';
import AdminLayout from '../components/admin/AdminLayout';
import { api } from '../services/api';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { Download, Calendar, ChevronLeft, ChevronRight, Check, User, Activity, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getMonthName } from '../utils/attendanceUtils';

export default function AdminDashboard() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'present' | 'absent'>('all');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');
  
  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await api.attendance.getAllAttendance();
      setAttendance(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  // Get monthly attendance with filters
  const getMonthlyAttendances = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    return attendance.filter(att => {
      const attDate = parseISO(att.created_at);
      const isInMonth = attDate >= monthStart && attDate <= monthEnd;
      
      // Apply user filter
      if (selectedUser !== 'all' && att.user_id !== selectedUser) {
        return false;
      }
      
      // Apply status filter - simplified to just present (including late) and absent
      if (selectedStatus === 'present' && att.status !== 'present' && att.status !== 'late') {
        return false;
      }
      
      if (selectedStatus === 'absent' && (att.status === 'present' || att.status === 'late')) {
        return false;
      }
      
      return isInMonth;
    });
  };

  // Get export URL for Excel format
  const getExportUrl = () => {
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    return `/api/reports/attendance?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}&format=xlsx`;
  };

  // Month navigation for views
  const prevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  // Get stats for the dashboard summary
  const getStats = () => {
    const monthlyAttendances = getMonthlyAttendances();
    
    return {
      monthly: {
        present: monthlyAttendances.filter(att => att.status === 'present' || att.status === 'late').length,
        absent: monthlyAttendances.filter(att => att.status !== 'present' && att.status !== 'late').length,
        total: monthlyAttendances.length,
        uniqueUsers: new Set(monthlyAttendances.map(att => att.user_id)).size
      }
    };
  };

  // Group attendance by user for card display
  const groupAttendancesByUser = () => {
    const monthlyAttendances = getMonthlyAttendances();
    const grouped = new Map();
    
    monthlyAttendances.forEach(att => {
      if (!grouped.has(att.user_id)) {
        const user = users.find(u => u.id === att.user_id);
        grouped.set(att.user_id, {
          user: user || { full_name: 'Unknown User' },
          attendances: []
        });
      }
      grouped.get(att.user_id).attendances.push(att);
    });
    
    return Array.from(grouped.values());
  };

  // Export attendance data to Excel
  const exportToExcel = () => {
    const monthlyAttendances = getMonthlyAttendances();
    
    // Prepare data for Excel export
    const data = monthlyAttendances.map(att => {
      const userName = users.find(user => user.id === att.user_id)?.full_name || 'Unknown User';
      
      return {
        'Tanggal': format(parseISO(att.created_at), 'dd/MM/yyyy'),
        'Nama Karyawan': userName,
        'Waktu Masuk': att.check_in_time ? format(parseISO(att.check_in_time), 'HH:mm') : '-',
        'Waktu Keluar': att.check_out_time ? format(parseISO(att.check_out_time), 'HH:mm') : '-',
        'Status': (att.status === 'present' || att.status === 'late') ? 'Hadir' : 'Tidak Hadir'
      };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Absensi');
    
    // Generate Excel file
    const monthYear = format(selectedMonth, 'MMMM_yyyy');
    XLSX.writeFile(workbook, `Rekap_Absensi_${monthYear}.xlsx`);
  };

  return (
    <AdminLayout title="Dashboard Admin">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Stats Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-700/50">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
            <h2 className="text-lg font-medium text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-300" />
              Dashboard Absensi • {format(selectedMonth, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Total Hadir</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().monthly.present}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <Check className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Karyawan</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().monthly.uniqueUsers}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-blue-500/10 rounded-lg p-4 backdrop-blur-sm border border-blue-500/20 flex items-center justify-between group hover:bg-blue-500/15 transition-colors">
                <div>
                  <p className="text-sm text-blue-300 font-medium">Total Absensi</p>
                  <p className="text-2xl font-bold text-blue-100">{getStats().monthly.total}</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Records */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-700/50 overflow-hidden">
          <div className="bg-gray-800/80 border-b border-gray-700/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center">
              <button 
                onClick={prevMonth}
                className="p-1 rounded-md text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h3 className="text-sm font-medium mx-2 text-blue-100">
                {format(selectedMonth, 'MMMM yyyy')}
              </h3>
              
              <button 
                onClick={nextMonth}
                className="p-1 rounded-md text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="rounded-md border border-gray-600 bg-gray-700/60 text-sm text-gray-300 py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by user"
              >
                <option value="all">Semua Karyawan</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'present' | 'absent')}
                className="rounded-md border border-gray-600 bg-gray-700/60 text-sm text-gray-300 py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by status"
              >
                <option value="all">Semua Status</option>
                <option value="present">Hadir</option>
                <option value="absent">Tidak Hadir</option>
              </select>
              
              <button
                onClick={exportToExcel}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-blue-100 bg-blue-600/80 hover:bg-blue-600 transition-colors"
                aria-label="Export to Excel"
              >
                <Download className="h-4 w-4 mr-1" />
                Ekspor Excel
              </button>
            </div>
          </div>
          
          {/* Card-based attendance display */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {getMonthlyAttendances().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupAttendancesByUser().map((userGroup) => (
                      <div key={userGroup.user.id} className="bg-gray-800/50 rounded-lg overflow-hidden shadow-sm border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700/50">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-900/30 border border-blue-700/30 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-200">{userGroup.user.full_name}</h3>
                              <p className="text-xs text-gray-400">{userGroup.attendances.length} absensi</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="divide-y divide-gray-700/30">
                          {userGroup.attendances.slice(0, 5).map((att: Attendance) => (
                            <div key={att.id} className="px-4 py-2 flex justify-between items-center">
                              <div>
                                <div className="text-sm text-gray-300">{format(parseISO(att.created_at), 'dd MMM yyyy')}</div>
                                <div className="flex items-center text-xs text-gray-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {att.check_in_time ? format(parseISO(att.check_in_time), 'HH:mm') : '??:??'}
                                </div>
                              </div>
                              
                              <div>
                                {(att.status === 'present' || att.status === 'late') ? (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-900/30 text-green-300 border border-green-800/30">
                                    Hadir
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-900/30 text-red-300 border border-red-800/30">
                                    Tidak Hadir
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {userGroup.attendances.length > 5 && (
                            <div className="px-4 py-2 text-center text-xs text-blue-400 hover:text-blue-300">
                              +{userGroup.attendances.length - 5} absensi lainnya
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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