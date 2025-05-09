import { Attendance, User, OfficeLocation, AttendanceSchedule } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    register: async (userData: Partial<User>) => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    resetPassword: async (username: string, newPassword: string) => {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          username, 
          newPassword
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },

    verifyAdmin: async (password: string) => {
      const response = await fetch(`${BASE_URL}/admin/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    }
  },

  users: {
    getAll: async () => {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    delete: async (userId: string) => {
      const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    }
  },

  attendance: {
    getUserAttendance: async () => {
      const response = await fetch(`${BASE_URL}/attendance`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    getAllAttendance: async () => {
      const response = await fetch(`${BASE_URL}/admin/attendance`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    checkIn: async (latitude: number, longitude: number) => {
      const response = await fetch(`${BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    checkOut: async (latitude: number, longitude: number) => {
      const response = await fetch(`${BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    }
  },

  location: {
    get: async () => {
      const response = await fetch(`${BASE_URL}/admin/office-location`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    update: async (lat: number, lng: number, radius: number) => {
      const response = await fetch(`${BASE_URL}/admin/office-location`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lat, lng, radius }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    }
  },

  schedule: {
    get: async () => {
      const response = await fetch(`${BASE_URL}/admin/attendance-schedule`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    },

    update: async (scheduleData: AttendanceSchedule) => {
      const response = await fetch(`${BASE_URL}/admin/attendance-schedule`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      return response.json();
    }
  }
};