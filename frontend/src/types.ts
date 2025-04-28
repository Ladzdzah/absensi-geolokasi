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
  user?: User;
  check_in_time: string;
  check_out_time: string | null;
  latitude?: number;
  longitude?: number;
  status: 'present' | 'late' | 'absent';
  note?: string;
  created_at: string;
}