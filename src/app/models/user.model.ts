export interface User {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'support';
  department: string;
  password: string;  }
