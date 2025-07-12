import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
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
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      Cookies.remove('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  refreshToken: () => api.post('/auth/refresh'),
};

// Items API functions
export const itemsAPI = {
  getItems: (params?: any) => api.get('/items', { params }),
  
  getItem: (id: string) => api.get(`/items/${id}`),
  
  createItem: (data: FormData) => 
    api.post('/items', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  updateItem: (id: string, data: any) => api.put(`/items/${id}`, data),
  
  deleteItem: (id: string) => api.delete(`/items/${id}`),
  
  getFeaturedItems: () => api.get('/items/featured'),
  
  getUserItems: (userId: string) => api.get(`/items/user/${userId}`),
  
  searchItems: (query: string, filters?: any) => 
    api.get('/items/search', { params: { q: query, ...filters } }),
};

// Swaps API functions
export const swapsAPI = {
  getSwapRequests: () => api.get('/swaps/requests'),
  
  createSwapRequest: (data: any) => api.post('/swaps/request', data),
  
  respondToSwapRequest: (id: string, response: 'accept' | 'reject') =>
    api.put(`/swaps/request/${id}`, { response }),
  
  getSwapHistory: () => api.get('/swaps/history'),
  
  getSwapDetails: (id: string) => api.get(`/swaps/${id}`),
  
  completeSwap: (id: string) => api.put(`/swaps/${id}/complete`),
};

// Points API functions
export const pointsAPI = {
  getTransactionHistory: () => api.get('/points/transactions'),
  
  getPointsBalance: () => api.get('/points/balance'),
  
  redeemPoints: (itemId: string, points: number) =>
    api.post('/points/redeem', { itemId, points }),
};

// Admin API functions
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  
  getPendingItems: () => api.get('/admin/items/pending'),
  
  approveItem: (id: string) => api.put(`/admin/items/${id}/approve`),
  
  rejectItem: (id: string) => api.put(`/admin/items/${id}/reject`),
  
  getUsers: () => api.get('/admin/users'),
  
  updateUserStatus: (id: string, isActive: boolean) =>
    api.put(`/admin/users/${id}`, { isActive }),
  
  getReports: () => api.get('/admin/reports'),
  
  handleReport: (id: string, action: string) =>
    api.put(`/admin/reports/${id}`, { action }),
};

// Upload API functions
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadMultipleImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  Cookies.set('token', token, { expires: 7 }); // 7 days
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  Cookies.remove('token');
  delete api.defaults.headers.common['Authorization'];
};

export const getAuthToken = () => {
  return Cookies.get('token');
};

export default api;