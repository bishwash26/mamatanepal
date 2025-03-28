import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, LogOut, User, Globe, ChevronDown, Menu, X, Home, Video, BookOpen, Calendar, ShoppingBag, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { LANGUAGE_STORAGE_KEY } from '../i18n';
import { useAuth } from '../context/AuthContext.tsx';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth(); // Use AuthContext instead of direct calls
  const isLoggedIn = !!user; // Derive logged in state from user object

  // Force English as default language if no preference exists
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (!savedLanguage) {
      i18n.changeLanguage('en');
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    }
  }, []);

  // Update HTML lang attribute whenever language changes
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  // Close sidebar when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
    // Save language preference to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    setIsProfileOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const mobileNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/resources', label: 'Resources', icon: Video },
    { path: '/discussions', label: 'Discussions', icon: MessageCircle },
    { path: '/pregnancy-guide', label: 'Pregnancy Guide', icon: Calendar },
    { path: '/about', label: 'About', icon: User }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  Mamata Nepal
                </span>
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link to="/resources" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('resources')}
                </Link>
                <Link to="/discussions" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('discussions')}
                </Link>
                <Link to="/about" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('about')}
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/checkout')}
                className="relative p-2 text-gray-700 hover:text-primary-600"
              >
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  <User className="h-5 w-5" />
                  {isLoggedIn ? (
                    <>
                      <span>Profile</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-primary-100">
                    {/* Language Switcher in Dropdown */}
                    <div 
                      className="px-4 py-2 hover:bg-primary-50 cursor-pointer flex items-center space-x-2" 
                      onClick={toggleLanguage}
                    >
                      <Globe className="h-4 w-4 text-primary-600" />
                      <span className="text-sm">
                        {i18n.language === 'en' ? 'Switch to Nepali' : 'Switch to English'}
                      </span>
                    </div>

                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2 border-b border-primary-100">
                          <div className="text-sm font-medium text-gray-900">user@example.com</div>
                        </div>
                        <div className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-red-600" onClick={handleLogout}>
                          <div className="flex items-center space-x-2 text-sm">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="px-4 py-2 hover:bg-primary-50 cursor-pointer" 
                        onClick={() => navigate('/login')}
                      >
                        <div className="flex items-center space-x-2 text-sm">
                          <LogIn className="h-4 w-4 text-primary-600" />
                          <span>Login</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 sm:hidden z-40 h-14">
        <div className="flex justify-between items-center h-full px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="text-xl font-bold text-primary-600">Mamata Nepal</h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/checkout')}
              className="relative p-2 text-gray-700 hover:text-primary-600"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        {isProfileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 shadow-lg">
            <div className="space-y-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 w-full py-2 hover:bg-gray-50 rounded-lg"
              >
                <Globe size={20} className="text-primary-600" />
                <span>{i18n.language === 'en' ? 'Switch to Nepali' : 'Switch to English'}</span>
              </button>
              
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 w-full py-2 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 text-primary-600 w-full py-2 hover:bg-primary-50 rounded-lg"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar Navigation */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 sm:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsSidebarOpen(false)}>
                <Heart className="h-6 w-6 text-primary-500" />
                <span className="font-bold text-primary-600">Mamata Nepal</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md ${
                          isActivePath(item.path)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="px-3 py-2 text-sm text-gray-500">Settings</div>
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 w-full"
                >
                  <Globe size={20} />
                  <span>{i18n.language === 'en' ? 'Switch to Nepali' : 'Switch to English'}</span>
                </button>
                
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-primary-600 hover:bg-primary-50 w-full"
                  >
                    <LogIn size={20} />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Main Content - Add padding for mobile header but remove bottom padding */}
      <main className="flex-1 pt-16 sm:pt-0">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-primary-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="h-8 w-8 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary-700 mb-2">Mamata Nepal</h2>
            <p className="text-gray-600">{t('supportingMothers')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}