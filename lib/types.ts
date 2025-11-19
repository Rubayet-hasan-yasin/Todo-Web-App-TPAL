export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address?: string;
  contact_number?: string;
  birthday?: string;
  profile_image?: string;
  bio?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface Todo {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'moderate' | 'extreme';
  is_completed?: boolean;
  position?: number;
  todo_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  priority: 'low' | 'moderate' | 'extreme';
  todo_date: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'moderate' | 'extreme';
  todo_date?: string;
  is_completed?: boolean;
  position?: number;
}

export interface TodosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Todo[];
}

export interface TodoFilters {
  search?: string;
  is_completed?: boolean;
  priority?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  address?: string;
  contact_number?: string;
  birthday?: string;
  bio?: string;
  profile_image?: File;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}