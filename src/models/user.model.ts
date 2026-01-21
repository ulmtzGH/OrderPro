export type UserRole = 'Admin' | 'Waiter';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  username: string;
}
