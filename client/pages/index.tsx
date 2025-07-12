import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import { 
  ArrowRight, 
  Recycle, 
  Users, 
  Star, 
  ShoppingBag,
  Heart,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Recycle className="w-8 h-8 text-primary-600" />,
      title: "Sustainable Fashion",
      description: "Give your clothes a second life and reduce textile waste while discovering unique pieces."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Community Driven",
      description: "Connect with like-minded individuals who share your passion for sustainable living."
    },
    {
      icon: <Star className="w-8 h-8 text-primary-600" />,
      title: "Earn Points",
      description: "Get rewarded for every item you list and use points to get items you love."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary-600" />,
      title: "Easy Swapping",
      description: "Simple and secure item exchange process with built-in messaging and approval system."
    }
  ];

  const stats = [
    { label: "Items Exchanged", value: "10,000+", icon: <ShoppingBag className="w-6 h-6" /> },
    { label: "Happy Users", value: "2,500+", icon: <Users className="w-6 h-6" /> },
    { label: "CO2 Saved", value: "50 tons", icon: <Globe className="w-6 h-6" /> },
    { label: "Money Saved", value: "$150K+", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <>
      <Head>
        <title>ReWear - Community Clothing Exchange</title>
        <meta name="description" content="Join the sustainable fashion movement. Exchange your unused clothing with others in your community and earn points for every item you share." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Give Your Clothes a
              <span className="text-primary-600"> Second Life</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the sustainable fashion movement. Exchange your unused clothing with others 
              in your community and earn points for every item you share.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link href="/browse" className="btn btn-primary text-lg px-8 py-4">
                    Browse Items
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="/add-item" className="btn btn-secondary text-lg px-8 py-4">
                    List an Item
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
                    Start Swapping
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link href="/browse" className="btn btn-secondary text-lg px-8 py-4">
                    Browse Items
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              More than just a clothing exchange - we're building a community 
              committed to sustainable fashion and conscious consumption.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting started is simple and rewarding
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                List Your Items
              </h3>
              <p className="text-gray-600">
                Upload photos and details of clothes you no longer wear. 
                Each item earns you points when someone claims it.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Browse & Request
              </h3>
              <p className="text-gray-600">
                Discover amazing clothes from others in your community. 
                Request items through direct swaps or using your points.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Exchange & Enjoy
              </h3>
              <p className="text-gray-600">
                Meet up safely to exchange items, or arrange secure shipping. 
                Enjoy your new-to-you clothes and feel good about the impact!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Wardrobe?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion-conscious individuals who are making a difference, 
            one clothing swap at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/add-item" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
                List Your First Item
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Join ReWear Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/login" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;