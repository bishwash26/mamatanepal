import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown, User, ShoppingCart, Search, Heart, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        fetchUserRole(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        fetchUserRole(user.id);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="block h-8 w-auto"
                src="/logo.svg"
                alt="Mamata Nepal"
              />
              <span className="ml-2 text-xl font-bold text-primary-600">Mamata Nepal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('home')}
            </Link>
            <Link to="/resources" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('resources')}
            </Link>
            <Link to="/shop" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('shop')}
            </Link>
            <Link to="/blogs" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('blogs')}
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('about')}
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('contact')}
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            <button className="text-gray-600 hover:text-primary-600">
              <Search className="h-5 w-5" />
            </button>
            
            <Link to="/wishlist" className="text-gray-600 hover:text-primary-600">
              <Heart className="h-5 w-5" />
            </Link>
            
            <Link to="/cart" className="text-gray-600 hover:text-primary-600 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {/* Only show profile section if authenticated */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-primary-600">
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {t('profile')}
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {t('orders')}
                  </Link>
                  {userRole === 'doctor' && (
                    <Link to="/doctor-dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {t('doctorDashboard')}
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/resources"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('resources')}
            </Link>
            <Link
              to="/shop"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('shop')}
            </Link>
            <Link
              to="/blogs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('blogs')}
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('about')}
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('contact')}
            </Link>
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-between px-4">
              <LanguageSwitcher />
              
              <div className="flex space-x-4">
                <button className="text-gray-600 hover:text-primary-600">
                  <Search className="h-5 w-5" />
                </button>
                
                <Link 
                  to="/wishlist" 
                  className="text-gray-600 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                </Link>
                
                <Link 
                  to="/cart" 
                  className="text-gray-600 hover:text-primary-600 relative"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    0
                  </span>
                </Link>
              </div>
            </div>
            
            {/* Mobile profile section - only show if authenticated */}
            {isAuthenticated ? (
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('profile')}
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('orders')}
                </Link>
                {userRole === 'doctor' && (
                  <Link
                    to="/doctor-dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('doctorDashboard')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <div className="mt-3 px-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 