import { MapPin, Info, Save } from 'lucide-react';

export interface AttendanceSchedule {
  checkIn: {
    start: string; // Format waktu: "HH:mm:ss"
    end: string;   // Format waktu: "HH:mm:ss"
  };
  checkOut: {
    start: string; // Format waktu: "HH:mm:ss"
    end: string;   // Format waktu: "HH:mm:ss"
  };
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional karena password tidak selalu dikirim dari backend
  full_name: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface OfficeLocation {
  lat: number;
  lng: number;
  radius: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  check_in_time: string; // Format waktu ISO (e.g., "2025-05-07T07:00:00Z")
  check_out_time: string | null; // Null jika belum check-out
  check_in_latitude: number;
  check_in_longitude: number;
  check_out_latitude: number | null; // Null jika belum check-out
  check_out_longitude: number | null; // Null jika belum check-out
  status: 'present' | 'late'; // Status absensi
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
  username?: string; // Optional untuk data admin
  full_name?: string; // Optional untuk data admin
}

export interface AttendanceStats {
  total: number; // Total absensi
  present: number; // Jumlah hadir tepat waktu
  late: number; // Jumlah terlambat
  averageCheckIn: number; // Rata-rata waktu check-in dalam menit
}

export interface ScheduleSettingsFormProps {
  scheduleSettings: AttendanceSchedule;
  setScheduleSettings: React.Dispatch<React.SetStateAction<AttendanceSchedule>>;
  handleScheduleUpdate: (e: React.FormEvent) => void;
  error: string;
  success: boolean;
  loading: boolean;
}

export interface LocationSettingsFormProps {
  locationSettings: OfficeLocation;
  setLocationSettings: React.Dispatch<React.SetStateAction<OfficeLocation>>;
  handleLocationUpdate: (e: React.FormEvent) => void;
  error: string;
  success: string;
  loading: boolean;
}

export interface TodayStatusProps {
  attendance: Attendance[];
}

export interface AttendanceButtonsProps {
  canCheckIn: boolean;
  canCheckOut: boolean;
  handleCheckIn: () => void;
  handleCheckOut: () => void;
  loading: boolean;
  isWithinOfficeRadius: () => boolean;
  isWithinCheckInTime: () => boolean;
  isWithinCheckOutTime: () => boolean;
  currentLocation: GeolocationPosition | null;
  scheduleTime?: AttendanceSchedule;
}