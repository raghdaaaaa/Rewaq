export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: 'user' | 'admin' | string;
  tokenVersion?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  msg?: string;
}
