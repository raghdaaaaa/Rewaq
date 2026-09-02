import { User } from './user';

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
