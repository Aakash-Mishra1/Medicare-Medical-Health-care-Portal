export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin';
  department?: string;
}

export interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (admin: AdminUser, token: string) => void;
  logout: () => void;
  updateAdmin: (admin: AdminUser) => void;
}
