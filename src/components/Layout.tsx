import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, LogOut, User, Globe, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      setIsProfileOpen(false);
      navigate('/login');
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="bg-white shadow-lg border-b border-primary-100">
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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