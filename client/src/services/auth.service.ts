import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  first_name?: string;
  last_name?: string;
}

export async function login(data: LoginData) {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function register(data: RegisterData) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}
