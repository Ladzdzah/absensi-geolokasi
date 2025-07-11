import { MapPin, Info, Save } from 'lucide-react';

export interface AttendanceSchedule {
  check_in_start: string;    // Format: "HH:mm:ss"
  check_in_end: string;      // Format: "HH:mm:ss"
  check_out_start: string;   // Format: "HH:mm:ss"
  check_out_end: string;     // Format: "HH:mm:ss"
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional karena password tidak selalu dikirim dari backend
  full_name: string;
  role: 'admin' | 'user';
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
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_latitude: number | null;
  check_in_longitude: number | null;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  status: 'present' | 'late';
  created_at: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
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