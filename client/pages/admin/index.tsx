import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../src/contexts/AuthContext';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  User,
  Mail,
  Calendar,
  MapPin,
  Settings,
  Activity
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalSwaps: number;
  pendingApprovals: number;
  totalPointsInCirculation: number;
  recentUsers: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  location?: string;
  joinedAt: string;
  lastLogin: string;
  isActive: boolean;
  isAdmin: boolean;
  totalListings: number;
  totalSwaps: number;
}

interface AdminItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  condition: string;
  pointsValue: number;
  images: string[];
  uploaderName: string;
  uploaderId: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  views: number;
  likes: number;
}

interface AdminOrder {
  _id: string;
  requesterName: string;
  itemTitle: string;
  type: 'item-swap' | 'point-redemption';
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  pointsOffered?: number;
  createdAt: string;
  completedAt?: string;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'orders'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    totalSwaps: 0,
    pendingApprovals: 0,
    totalPointsInCirculation: 0,
    recentUsers: 0
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        // Mock stats
        setStats({
          totalUsers: 1234,
          totalItems: 2567,
          totalSwaps: 456,
          pendingApprovals: 23,
          totalPointsInCirculation: 45678,
          recentUsers: 89
        });

        // Mock users
        setUsers([
          {
            _id: '1',
            name: 'Sarah Johnson',
            email: 'sarah@email.com',
            avatar: '/api/placeholder/40/40',
            points: 120,
            location: 'San Francisco, CA',
            joinedAt: '2024-01-15',
            lastLogin: '2024-01-20',
            isActive: true,
            isAdmin: false,
            totalListings: 8,
            totalSwaps: 5
          },
          {
            _id: '2',
            name: 'Mike Chen',
            email: 'mike@email.com',
            points: 89,
            location: 'Austin, TX',
            joinedAt: '2024-01-10',
            lastLogin: '2024-01-19',
            isActive: true,
            isAdmin: false,
            totalListings: 12,
            totalSwaps: 7
          },
          {
            _id: '3',
            name: 'Emma Davis',
            email: 'emma@email.com',
            points: 45,
            location: 'Miami, FL',
            joinedAt: '2024-01-05',
            lastLogin: '2024-01-18',
            isActive: false,
            isAdmin: false,
            totalListings: 3,
            totalSwaps: 1
          }
        ]);

        // Mock items
        setItems([
          {
            _id: '1',
            title: 'Vintage Denim Jacket',
            description: 'Classic vintage denim jacket in excellent condition',
            category: 'jackets',
            type: 'unisex',
            condition: 'good',
            pointsValue: 45,
            images: ['/api/placeholder/200/200'],
            uploaderName: 'Sarah Johnson',
            uploaderId: '1',
            status: 'available',
            isApproved: false,
            createdAt: '2024-01-15',
            views: 23,
            likes: 5
          },
          {
            _id: '2',
            title: 'Designer Handbag',
            description: 'Authentic designer handbag in great condition',
            category: 'accessories',
            type: 'womens',
            condition: 'like-new',
            pointsValue: 80,
            images: ['/api/placeholder/200/200'],
            uploaderName: 'Emma Davis',
            uploaderId: '3',
            status: 'available',
            isApproved: true,
            createdAt: '2024-01-14',
            views: 45,
            likes: 12
          }
        ]);

        // Mock orders
        setOrders([
          {
            _id: '1',
            requesterName: 'Mike Chen',
            itemTitle: 'Vintage Denim Jacket',
            type: 'point-redemption',
            status: 'pending',
            pointsOffered: 45,
            createdAt: '2024-01-20'
          },
          {
            _id: '2',
            requesterName: 'Sarah Johnson',
            itemTitle: 'Designer Handbag',
            type: 'item-swap',
            status: 'completed',
            createdAt: '2024-01-18',
            completedAt: '2024-01-19'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchAdminData();
  }, []);

  const handleUserAction = (userId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit') => {
    setUsers(users.map(user => {
      if (user._id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, isActive: true };
          case 'deactivate':
            return { ...user, isActive: false };
          case 'delete':
            // In real app, this would remove from array
            return user;
          default:
            return user;
        }
      }
      return user;
    }));
  };

  const handleItemAction = (itemId: string, action: 'approve' | 'reject' | 'delete') => {
    setItems(items.map(item => {
      if (item._id === itemId) {
        switch (action) {
          case 'approve':
            return { ...item, isApproved: true };
          case 'reject':
            return { ...item, isApproved: false, status: 'removed' };
          case 'delete':
            // In real app, this would remove from array
            return item;
          default:
            return item;
        }
      }
      return item;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && user.isActive;
    if (selectedFilter === 'inactive') return matchesSearch && !user.isActive;
    if (selectedFilter === 'admin') return matchesSearch && user.isAdmin;
    
    return matchesSearch;
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'pending') return matchesSearch && !item.isApproved;
    if (selectedFilter === 'approved') return matchesSearch && item.isApproved;
    
    return matchesSearch;
  });

  // Check admin access
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - ReWear</title>
        <meta name="description" content="ReWear admin panel for managing users, listings, and orders" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-600">Manage users, listings, and platform operations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="btn btn-secondary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
                <Link href="/dashboard" className="btn btn-primary">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'users', name: 'Manage Users', icon: Users },
                { id: 'listings', name: 'Manage Listings', icon: Package },
                { id: 'orders', name: 'Manage Orders', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalItems.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Swaps</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Points in Circulation</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalPointsInCirculation.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">New Users (30d)</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.recentUsers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/users" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">User Management</h4>
                    <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
                  </Link>
                  
                  <Link href="/admin/listings" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Package className="w-6 h-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Review Listings</h4>
                    <p className="text-sm text-gray-600">Approve or reject item listings</p>
                  </Link>
                  
                  <Link href="/admin/orders" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Activity className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Order Management</h4>
                    <p className="text-sm text-gray-600">Monitor swap transactions</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="input w-auto"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar ? (
                                  <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                {user.points} points
                              </div>
                              {user.location && (
                                <div className="flex items-center text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {user.location}
                                </div>
                              )}
                              <div className="flex items-center text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                Joined {new Date(user.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              <div>{user.totalListings} listings</div>
                              <div>{user.totalSwaps} swaps</div>
                              <div className="text-gray-500">Last login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {user.isAdmin && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleUserAction(user._id, 'edit')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                              className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" title="More Actions">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Listings Management Tab */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="input w-auto"
                  >
                    <option value="all">All Items</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                        item.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.isApproved ? 'Approved' : 'Pending'}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {item.pointsValue} points
                        </span>
                        <span>{item.condition}</span>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <div>By: {item.uploaderName}</div>
                        <div>{item.views} views • {item.likes} likes</div>
                        <div>Listed: {new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleItemAction(item._id, 'approve')}
                          className="flex-1 btn btn-primary text-center flex items-center justify-center space-x-1"
                          disabled={item.isApproved}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleItemAction(item._id, 'reject')}
                          className="flex-1 btn btn-accent text-center flex items-center justify-center space-x-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleItemAction(item._id, 'delete')}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Management Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.itemTitle}</div>
                              <div className="text-sm text-gray-500">Requested by: {order.requesterName}</div>
                              {order.pointsOffered && (
                                <div className="text-sm text-gray-500">{order.pointsOffered} points offered</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {order.type.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div>Created: {new Date(order.createdAt).toLocaleDateString()}</div>
                              {order.completedAt && (
                                <div>Completed: {new Date(order.completedAt).toLocaleDateString()}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button className="text-blue-600 hover:text-blue-900" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Cancel">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPanel;