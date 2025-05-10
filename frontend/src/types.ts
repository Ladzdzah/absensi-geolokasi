export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'employee';
  created_at: string;
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
  status: 'present' | 'late' | 'absent';
  created_at: string;
  user?: {
    full_name: string;
    username: string;
  };
}

export interface AttendanceSchedule {
  check_in_start: string;
  check_in_end: string;
  check_out_start: string;
  check_out_end: string;
}

export interface OfficeLocation {
  lat: number;
  lng: number;
  radius: number;
}
