import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, LogOut, User, Globe, ChevronDown, Menu, X, Home, Video, BookOpen, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

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
    setIsProfileOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const mobileNavItems = [
    { path: '/', label: 'home', icon: Home },
    { path: '/resources', label: 'resources', icon: Video },
    { path: '/discussions', label: 'discussions', icon: MessageCircle },
    { path: '/pregnancy-guide', label: 'Pregnancy Guide', icon: Calendar }
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
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-primary-100">
                    <div className="px-4 py-2 border-b border-primary-100">
                      <div className="text-sm font-medium text-gray-900">user@example.com</div>
                    </div>
                    <div className="px-4 py-2 hover:bg-primary-50 cursor-pointer" onClick={toggleLanguage}>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Globe className="h-4 w-4" />
                        <span>{t('switchLanguage')}</span>
                      </div>
                    </div>
                    <div className="px-4 py-2 hover:bg-primary-50 cursor-pointer text-red-600" onClick={handleLogout}>
                      <div className="flex items-center space-x-2 text-sm">
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 sm:hidden z-40 h-14">
        <div className="flex justify-between items-center h-full px-4">
          <h1 className="text-xl font-bold text-primary-600">{t('Mamata Nepal')}</h1>
          <div className="flex items-center space-x-4">
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
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 w-full py-2 hover:bg-primary-50 rounded-lg"
              >
                <Globe size={20} />
                <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 w-full py-2 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Add padding for mobile header and bottom nav */}
      <main className="flex-1 pt-16 pb-16 sm:pt-0 sm:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
        <div className="grid grid-cols-3 h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActivePath(item.path)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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