import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import { 
  Plus, 
  Star, 
  ShoppingBag, 
  Package, 
  Eye, 
  Heart,
  TrendingUp,
  User,
  Settings,
  Calendar,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardStats {
  totalListings: number;
  totalPurchases: number;
  currentPoints: number;
  totalViews: number;
  totalLikes: number;
  completedSwaps: number;
}

interface UserItem {
  _id: string;
  title: string;
  images: string[];
  pointsValue: number;
  status: 'available' | 'pending' | 'swapped' | 'removed';
  views: number;
  likes: number;
  createdAt: string;
  isApproved: boolean;
}

interface Purchase {
  _id: string;
  item: {
    title: string;
    images: string[];
    pointsValue: number;
  };
  type: 'item-swap' | 'point-redemption';
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  createdAt: string;
  completedAt?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'purchases'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalPurchases: 0,
    currentPoints: 0,
    totalViews: 0,
    totalLikes: 0,
    completedSwaps: 0
  });
  const [myListings, setMyListings] = useState<UserItem[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        // Mock stats
        setStats({
          totalListings: 8,
          totalPurchases: 5,
          currentPoints: user?.points || 120,
          totalViews: 234,
          totalLikes: 45,
          completedSwaps: 3
        });

        // Mock listings
        setMyListings([
          {
            _id: '1',
            title: 'Vintage Denim Jacket',
            images: ['/api/placeholder/200/200'],
            pointsValue: 45,
            status: 'available',
            views: 23,
            likes: 5,
            createdAt: '2024-01-15',
            isApproved: true
          },
          {
            _id: '2',
            title: 'Summer Dress',
            images: ['/api/placeholder/200/200'],
            pointsValue: 30,
            status: 'pending',
            views: 12,
            likes: 3,
            createdAt: '2024-01-14',
            isApproved: false
          },
          {
            _id: '3',
            title: 'Running Shoes',
            images: ['/api/placeholder/200/200'],
            pointsValue: 60,
            status: 'swapped',
            views: 45,
            likes: 8,
            createdAt: '2024-01-10',
            isApproved: true
          }
        ]);

        // Mock purchases
        setMyPurchases([
          {
            _id: '1',
            item: {
              title: 'Designer Handbag',
              images: ['/api/placeholder/200/200'],
              pointsValue: 80
            },
            type: 'point-redemption',
            status: 'completed',
            createdAt: '2024-01-12',
            completedAt: '2024-01-14'
          },
          {
            _id: '2',
            item: {
              title: 'Wool Coat',
              images: ['/api/placeholder/200/200'],
              pointsValue: 90
            },
            type: 'item-swap',
            status: 'pending',
            createdAt: '2024-01-13'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'swapped': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'removed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'swapped': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your dashboard</h2>
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - ReWear</title>
        <meta name="description" content="Manage your ReWear account, listings, and purchases" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {stats.currentPoints} points
                    </span>
                    {user.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Member since {new Date(user.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link href="/add-item" className="btn btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </Link>
                <Link href="/profile" className="btn btn-secondary flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
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
                { id: 'listings', name: 'My Listings', icon: Package },
                { id: 'purchases', name: 'My Purchases', icon: ShoppingBag }
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
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Listings</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalListings}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingBag className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Purchases</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalPurchases}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Points</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.currentPoints}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalViews}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Heart className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Likes</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalLikes}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed Swaps</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.completedSwaps}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Your item "Designer Handbag" was successfully swapped</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Plus className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">You listed a new item "Vintage Denim Jacket"</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Heart className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Your item received 3 new likes</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Listings Tab */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                <Link href="/add-item" className="btn btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add New Item</span>
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map(item => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status}</span>
                        </div>
                        {!item.isApproved && (
                          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Pending Approval
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {item.pointsValue} points
                          </span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {item.views} views
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {item.likes} likes
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            href={`/items/${item._id}`}
                            className="flex-1 btn btn-secondary text-center"
                          >
                            View
                          </Link>
                          <Link
                            href={`/items/${item._id}/edit`}
                            className="flex-1 btn btn-primary text-center"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Purchases</h2>
                <Link href="/browse" className="btn btn-primary">
                  Browse Items
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded"></div>
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {myPurchases.map(purchase => (
                    <div key={purchase._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <img
                          src={purchase.item.images[0]}
                          alt={purchase.item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{purchase.item.title}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(purchase.status)}`}>
                              {getStatusIcon(purchase.status)}
                              <span className="capitalize">{purchase.status}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              {purchase.item.pointsValue} points
                            </span>
                            <span className="capitalize">{purchase.type.replace('-', ' ')}</span>
                            <span>Requested: {new Date(purchase.createdAt).toLocaleDateString()}</span>
                            {purchase.completedAt && (
                              <span>Completed: {new Date(purchase.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            href={`/swaps/${purchase._id}`}
                            className="btn btn-secondary"
                          >
                            View Details
                          </Link>
                          {purchase.status === 'pending' && (
                            <button className="btn btn-accent">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;