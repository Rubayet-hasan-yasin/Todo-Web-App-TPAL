import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthTokens,
  LoginRequest,
  SignupRequest,
  User,
  Todo,
  TodosResponse,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
} from '@/lib/types';
import Cookies from 'js-cookie';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://todo-app.pioneeralpha.com';
    
    this.api = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use((config) => {
      const token = Cookies.get('access_token');
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          config.headers.Authorization = `Bearer ${parsedToken}`;
        } catch {
        }
      }
      return config;
    });

    
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refresh_token = Cookies.get('refresh_token');
            if (refresh_token) {
              const parsedRefreshToken = JSON.parse(refresh_token);
              if (parsedRefreshToken) {
                
                const newTokens = await this.refreshToken(parsedRefreshToken);
                Cookies.set('refresh_token', JSON.stringify(newTokens.refresh), { expires: 7 });
                Cookies.set('access_token', JSON.stringify(newTokens.access), { expires: 1/24 });
                
                
                originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
     
          Cookies.remove('tokens');
          Cookies.remove('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return formData;
  }

  
  async signup(data: SignupRequest): Promise<User> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<User> = await this.api.post('/api/users/signup/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthTokens> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<AuthTokens> = await this.api.post('/api/auth/login/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const formData = this.createFormData({ refresh: refreshToken });
    const response: AxiosResponse<AuthTokens> = await this.api.post('/api/auth/refresh/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }


  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/users/me/');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<User> = await this.api.patch('/api/users/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

 
  async getTodos(filters?: TodoFilters): Promise<TodosResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<TodosResponse> = await this.api.get(
      `/api/todos/${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  }

  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<Todo> = await this.api.post('/api/todos/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateTodo(id: number, data: UpdateTodoRequest): Promise<Todo> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<Todo> = await this.api.patch(`/api/todos/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteTodo(id: number): Promise<void> {
    await this.api.delete(`/api/todos/${id}/`);
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<{ detail: string }> = await this.api.post('/api/users/change-password/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ detail: string }> {
    const formData = this.createFormData(data);
    const response: AxiosResponse<{ detail: string }> = await this.api.post('/api/users/forgot-password/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiService = new ApiService();