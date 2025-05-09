export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'employee';
  created_at: string;
}
