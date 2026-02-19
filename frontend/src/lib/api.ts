import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const BASE_URL = import.meta.env.VITE_UPLOAD_URL || API_URL.replace('/api', '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Permission {
  id: number;
  name: string;
  module: string;
  category: string;
  description: string;
  actions: string; // JSON string containing array of actions
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: Permission[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  role_id?: number;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),
  
  getProfile: () => 
    api.get<User>('/auth/profile'),
};

export const usersApi = {
  getAll: () => 
    api.get<{ data: User[] }>('/users'),
  
  getById: (id: number) => 
    api.get<{ data: User }>(`/users/${id}`),
  
  create: (data: any) => 
    api.post<{ data: User }>('/users', data),
  
  update: (id: number, data: any) => 
    api.put<{ data: User }>(`/users/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/users/${id}`),
};

export const rolesApi = {
  getAll: () => 
    api.get('/roles'),
  
  getById: (id: number) => 
    api.get(`/roles/${id}`),
  
  create: (data: any) => 
    api.post('/roles', data),
  
  update: (id: number, data: any) => 
    api.put(`/roles/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/roles/${id}`),
};

export const permissionsApi = {
  getAll: () => 
    api.get('/permissions'),
  
  getById: (id: number) => 
    api.get(`/permissions/${id}`),
  
  create: (data: any) => 
    api.post('/permissions', data),
  
  update: (id: number, data: any) => 
    api.put(`/permissions/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/permissions/${id}`),
};

export const settingsApi = {
  getAll: () => 
    api.get('/settings'),
  
  update: (data: Record<string, string>) => 
    api.put('/settings', data),

  uploadLogo: (file: File, type: 'logo' | 'favicon' | 'og-image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/settings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ============ Blog Interfaces ============

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: string;
  author_id: number;
  author?: User;
  category_id?: number;
  category?: BlogCategory;
  tags?: BlogTag[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  featured_image: string;
  images: string;
  project_url: string;
  github_url: string;
  tech_stack: string;
  category_id?: number;
  category?: PortfolioCategory;
  status: string;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

// ============ Blog API ============

export const blogsApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Blog[] }>('/blogs', { params }),
  
  getById: (id: number) =>
    api.get<{ data: Blog }>(`/blogs/${id}`),
  
  create: (data: any) =>
    api.post<{ data: Blog }>('/blogs', data),
  
  update: (id: number, data: any) =>
    api.put<{ data: Blog }>(`/blogs/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/blogs/${id}`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/blogs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const blogCategoriesApi = {
  getAll: () =>
    api.get<{ data: BlogCategory[] }>('/blog-categories'),
  
  getById: (id: number) =>
    api.get<{ data: BlogCategory }>(`/blog-categories/${id}`),
  
  create: (data: any) =>
    api.post<{ data: BlogCategory }>('/blog-categories', data),
  
  update: (id: number, data: any) =>
    api.put<{ data: BlogCategory }>(`/blog-categories/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/blog-categories/${id}`),
};

export const blogTagsApi = {
  getAll: () =>
    api.get<{ data: BlogTag[] }>('/blog-tags'),
  
  create: (data: any) =>
    api.post<{ data: BlogTag }>('/blog-tags', data),
  
  delete: (id: number) =>
    api.delete(`/blog-tags/${id}`),
};

// ============ Portfolio API ============

export const portfoliosApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: Portfolio[] }>('/portfolios', { params }),
  
  getById: (id: number) =>
    api.get<{ data: Portfolio }>(`/portfolios/${id}`),
  
  create: (data: any) =>
    api.post<{ data: Portfolio }>('/portfolios', data),
  
  update: (id: number, data: any) =>
    api.put<{ data: Portfolio }>(`/portfolios/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/portfolios/${id}`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/portfolios/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ Contact Messages API ============

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const contactMessagesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: ContactMessage[]; unread_count: number }>('/messages', { params }),

  getById: (id: number) =>
    api.get<{ data: ContactMessage }>(`/messages/${id}`),

  markRead: (id: number, isRead: boolean) =>
    api.put(`/messages/${id}/read`, { is_read: isRead }),

  delete: (id: number) =>
    api.delete(`/messages/${id}`),
};

export const portfolioCategoriesApi = {
  getAll: () =>
    api.get<{ data: PortfolioCategory[] }>('/portfolio-categories'),
  
  create: (data: any) =>
    api.post<{ data: PortfolioCategory }>('/portfolio-categories', data),
  
  update: (id: number, data: any) =>
    api.put<{ data: PortfolioCategory }>(`/portfolio-categories/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/portfolio-categories/${id}`),
};
