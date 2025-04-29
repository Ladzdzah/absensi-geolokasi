import { Attendance } from "../types";

// Fungsi untuk mendapatkan nama bulan berdasarkan indeks
export function getMonthName(monthIndex: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return months[monthIndex] || "Tidak Diketahui";
}

// Fungsi untuk menghitung statistik absensi bulanan
export function getAttendanceStats(attendance: Attendance[], year: number, month: number) {
  const filteredAttendance = attendance.filter((record) => {
    const date = new Date(record.check_in_time);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const total = filteredAttendance.length;
  const present = filteredAttendance.filter((record) => record.status === "present").length;
  const late = filteredAttendance.filter((record) => record.status === "late").length;

  const averageCheckIn = filteredAttendance.reduce((sum, record) => {
    const checkInTime = new Date(record.check_in_time);
    return sum + checkInTime.getHours() * 60 + checkInTime.getMinutes();
  }, 0) / (filteredAttendance.length || 1);

  return { total, present, late, averageCheckIn };
}

// Fungsi untuk mengekspor rekap bulanan ke file Excel
export function exportMonthlyRecap(attendance: Attendance[], year: number, month: number) {
  const filteredAttendance = attendance.filter((record) => {
    const date = new Date(record.check_in_time);
    return date.getFullYear() === year && date.getMonth() === month;
  });

  const data = filteredAttendance.map((record) => ({
    Tanggal: new Date(record.check_in_time).toLocaleDateString("id-ID"),
    "Waktu Masuk": new Date(record.check_in_time).toLocaleTimeString("id-ID"),
    "Waktu Keluar": record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString("id-ID")
      : "-",
    Status: record.status === "present" ? "Tepat Waktu" : "Terlambat",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Bulanan");

  const monthName = getMonthName(month);
  XLSX.writeFile(workbook, `Rekap_Absensi_${monthName}_${year}.xlsx`);
}