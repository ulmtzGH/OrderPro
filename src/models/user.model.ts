export type UserRole = 'Admin' | 'Waiter' | 'Customer';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  username: string;
  phone: string;
  email: string | null;
}