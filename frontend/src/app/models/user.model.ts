export type UserRole = 'admin' | 'user';

export interface LibraryUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
}

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}
