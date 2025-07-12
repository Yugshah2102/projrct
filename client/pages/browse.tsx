import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  Star, 
  MapPin,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  size: string;
  condition: string;
  pointsValue: number;
  images: string[];
  uploaderName: string;
  uploaderAvatar?: string;
  location?: string;
  likes: number;
  views: number;
  createdAt: string;
}

const BrowsePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const categories = [
    { id: 'all', name: 'All Categories', image: '🛍️' },
    { id: 'shirts', name: 'Shirts', image: '👔' },
    { id: 'pants', name: 'Pants', image: '👖' },
    { id: 'dresses', name: 'Dresses', image: '👗' },
    { id: 'shoes', name: 'Shoes', image: '👟' },
    { id: 'accessories', name: 'Accessories', image: '👜' },
    { id: 'jackets', name: 'Jackets', image: '🧥' },
    { id: 'activewear', name: 'Activewear', image: '🏃‍♀️' },
    { id: 'formal', name: 'Formal', image: '🤵' }
  ];

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'mens', name: 'Men\'s' },
    { id: 'womens', name: 'Women\'s' },
    { id: 'kids', name: 'Kids' },
    { id: 'unisex', name: 'Unisex' }
  ];

  const sizes = [
    { id: 'all', name: 'All Sizes' },
    { id: 'XS', name: 'XS' },
    { id: 'S', name: 'S' },
    { id: 'M', name: 'M' },
    { id: 'L', name: 'L' },
    { id: 'XL', name: 'XL' },
    { id: 'XXL', name: 'XXL' }
  ];

  const conditions = [
    { id: 'all', name: 'All Conditions' },
    { id: 'new', name: 'New' },
    { id: 'like-new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'worn', name: 'Worn' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'points-low', name: 'Points: Low to High' },
    { id: 'points-high', name: 'Points: High to Low' },
    { id: 'popular', name: 'Most Popular' }
  ];

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockItems: Item[] = [
          {
            _id: '1',
            title: 'Vintage Denim Jacket',
            description: 'Classic vintage denim jacket in excellent condition. Perfect for layering.',
            category: 'jackets',
            type: 'unisex',
            size: 'M',
            condition: 'good',
            pointsValue: 45,
            images: ['/api/placeholder/300/400', '/api/placeholder/300/400'],
            uploaderName: 'Sarah Johnson',
            uploaderAvatar: '/api/placeholder/40/40',
            location: 'San Francisco, CA',
            likes: 12,
            views: 45,
            createdAt: '2024-01-15'
          },
          {
            _id: '2',
            title: 'Running Sneakers',
            description: 'Barely used Nike running shoes. Great for daily workouts.',
            category: 'shoes',
            type: 'unisex',
            size: '10',
            condition: 'like-new',
            pointsValue: 60,
            images: ['/api/placeholder/300/400'],
            uploaderName: 'Mike Chen',
            uploaderAvatar: '/api/placeholder/40/40',
            location: 'Austin, TX',
            likes: 8,
            views: 32,
            createdAt: '2024-01-14'
          },
          {
            _id: '3',
            title: 'Summer Floral Dress',
            description: 'Beautiful floral print dress, perfect for summer occasions.',
            category: 'dresses',
            type: 'womens',
            size: 'S',
            condition: 'new',
            pointsValue: 35,
            images: ['/api/placeholder/300/400'],
            uploaderName: 'Emma Davis',
            uploaderAvatar: '/api/placeholder/40/40',
            location: 'Miami, FL',
            likes: 15,
            views: 67,
            createdAt: '2024-01-13'
          }
        ];
        setItems(mockItems);
        setLoading(false);
      }, 1000);
    };

    fetchItems();
  }, [selectedCategory, selectedType, selectedSize, selectedCondition, sortBy, searchQuery]);

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (selectedSize !== 'all' && item.size !== selectedSize) return false;
    if (selectedCondition !== 'all' && item.condition !== selectedCondition) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (item.pointsValue < priceRange[0] || item.pointsValue > priceRange[1]) return false;
    return true;
  });

  const handleLike = (itemId: string) => {
    setItems(items.map(item => 
      item._id === itemId 
        ? { ...item, likes: item.likes + 1 }
        : item
    ));
  };

  return (
    <>
      <Head>
        <title>Browse Items - ReWear</title>
        <meta name="description" content="Browse and discover amazing clothing items from the ReWear community" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for clothing items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 pr-4"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Images Section */}
        <div className="bg-white py-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 border-2 border-primary-600'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="text-2xl w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm">
                    {category.image}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 bg-white p-6 rounded-lg shadow-sm h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="input"
                    >
                      {types.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="input"
                    >
                      {sizes.map(size => (
                        <option key={size.id} value={size.id}>{size.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="input"
                    >
                      {conditions.map(condition => (
                        <option key={condition.id} value={condition.id}>{condition.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Points Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points Range: {priceRange[0]} - {priceRange[1]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort and Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {items.length} items
                </p>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input w-auto"
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-300 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Product Grid */
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {filteredItems.map(item => (
                    <div key={item._id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex space-x-4 p-4' : 'overflow-hidden'
                    }`}>
                      {/* Product Image */}
                      <div className={`relative ${
                        viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'w-full h-48'
                      }`}>
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleLike(item._id)}
                          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                        </button>
                      </div>

                      {/* Product Details */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-1 text-sm font-medium text-primary-600">
                            <Star className="w-4 h-4" />
                            <span>{item.pointsValue}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {item.condition}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Size {item.size}
                          </span>
                        </div>

                        {/* Uploader Info */}
                        <div className="flex items-center space-x-2 mb-3">
                          <img
                            src={item.uploaderAvatar || '/api/placeholder/32/32'}
                            alt={item.uploaderName}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-xs text-gray-600">{item.uploaderName}</span>
                          {item.location && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.location}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Link
                            href={`/items/${item._id}`}
                            className="flex-1 btn btn-primary text-center"
                          >
                            View Details
                          </Link>
                          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span>{item.likes} likes</span>
                          <span>{item.views} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSelectedSize('all');
                      setSelectedCondition('all');
                    }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Load More */}
              {!loading && filteredItems.length > 0 && (
                <div className="text-center mt-12">
                  <button className="btn btn-secondary">
                    Load More Items
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrowsePage;