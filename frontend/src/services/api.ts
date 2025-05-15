import { Attendance, User, OfficeLocation, AttendanceSchedule } from '../types';

// Update the base URL to use port 5000 which is the default backend port
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
});

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
    throw new Error(errorData.message || 'Server error occurred');
  }
  return response.json().catch(() => {
    throw new Error('Failed to parse response data');
  });
};

const handleFetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server took too long to respond');
      }
      throw new Error(error.message || 'Network error occurred');
    }
    throw error;
  }
};

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to login');
      }
    },

    register: async (userData: Partial<User>) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(userData),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to register');
      }
    },

    resetPassword: async (username: string, newPassword: string) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ username, newPassword }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to reset password');
      }
    },

    verifyAdmin: async (password: string) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/verify`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ password }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to verify admin');
      }
    }
  },

  users: {
    getAll: async () => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/users`, {
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to fetch users');
      }
    },

    delete: async (userId: string) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to delete user');
      }
    }
  },

  attendance: {
    getUserAttendance: async () => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/attendance`, {
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to fetch user attendance');
      }
    },

    getAllAttendance: async (params?: { startDate?: string; endDate?: string }) => {
      try {
        const queryParams = params ? new URLSearchParams(params).toString() : '';
        const url = `${BASE_URL}/admin/attendance${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await handleFetchWithTimeout(url, {
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to fetch all attendance');
      }
    },

    checkIn: async (latitude: number, longitude: number) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/attendance/check-in`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ latitude, longitude }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to check in');
      }
    },

    checkOut: async (latitude: number, longitude: number) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/attendance/check-out`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ latitude, longitude }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to check out');
      }
    }
  },

  location: {
    get: async () => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/office-location`, {
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to fetch office location');
      }
    },

    update: async (lat: number, lng: number, radius: number) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/office-location`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ lat, lng, radius }),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to update office location');
      }
    }
  },

  schedule: {
    get: async () => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/attendance-schedule`, {
          headers: getAuthHeaders(),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to fetch schedule');
      }
    },

    update: async (scheduleData: AttendanceSchedule) => {
      try {
        const response = await handleFetchWithTimeout(`${BASE_URL}/admin/attendance-schedule`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(scheduleData),
        });
        return handleApiError(response);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to update schedule');
      }
    }
  }
};

export default api;