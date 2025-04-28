import { MapPin, Info, Save } from 'lucide-react';

export interface AttendanceSchedule {
  checkIn: {
    start: string;
    end: string;
  };
  checkOut: {
    start: string;
    end: string;
  };
}

export interface User {
  id: string;
  username: string;
  password: string;
  full_name: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface OfficeLocation {
  lat: number;
  lng: number;
  radius: number;
} 