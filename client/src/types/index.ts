export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  location?: string;
  joinedAt: Date;
  isAdmin: boolean;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  size: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'worn';
  tags: string[];
  images: string[];
  uploaderId: string;
  uploaderName: string;
  uploaderAvatar?: string;
  pointsValue: number;
  status: 'available' | 'pending' | 'swapped' | 'removed';
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  location?: string;
}

export interface SwapRequest {
  _id: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  itemId: string;
  itemTitle: string;
  itemImages: string[];
  offeredItemId?: string;
  offeredItemTitle?: string;
  offeredItemImages?: string[];
  pointsOffered?: number;
  type: 'item-swap' | 'point-redemption';
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: string;
  userId: string;
  itemId: string;
  type: 'earn' | 'spend';
  points: number;
  description: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ItemFilters {
  category?: string;
  type?: string;
  size?: string;
  condition?: string;
  minPoints?: number;
  maxPoints?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'points-low' | 'points-high';
}

export interface ItemFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  size: string;
  condition: string;
  tags: string[];
  images: File[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SwapRequestFormData {
  itemId: string;
  offeredItemId?: string;
  pointsOffered?: number;
  type: 'item-swap' | 'point-redemption';
  message?: string;
}

export interface UserStats {
  totalItemsUploaded: number;
  totalSwapsCompleted: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentPoints: number;
  memberSince: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalSwaps: number;
  pendingApprovals: number;
  totalPointsInCirculation: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  swapRequestNotifications: boolean;
  marketingEmails: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  bio?: string;
  notifications: NotificationSettings;
}