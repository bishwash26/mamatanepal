import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && session?.user) {
        const user = session.user;

        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // If no profile exists, create one
        if (!profile) {
          const { error } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
                avatar_url: null,
              }
            ])
            .single();

          if (error && error.code !== '23505') { // Ignore unique constraint violations
            console.error('Error creating profile:', error);
          }
        }

        // Redirect to the page they tried to visit or home
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/mother-baby.jpg"
            alt="Mother and child"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50/90 to-white"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between">
          {/* Left side content */}
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="h-12 w-12 text-pink-600" />
                <h1 className="text-4xl lg:text-6xl font-bold text-pink-600">
                  Mamata Nepal
                </h1>
              </div>
              <p className="text-xl lg:text-2xl text-gray-700 mb-8 max-w-lg">
                {t('A safe space for expecting mothers to share experiences and find support')}
              </p>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <p>{t('Connect with other mothers')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <p>{t('Access valuable resources')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  <p>{t('Get expert advice')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side auth */}
          <div className="lg:w-1/2 max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              {t('Join Our Community')}
            </h2>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#EC4899',
                      brandAccent: '#DB2777',
                    },
                  },
                },
              }}
              providers={['google']}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Everything You Need for Your Pregnancy Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-pink-500 text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Weekly Updates</h3>
              <p className="text-gray-600">
                Track your baby's development with detailed weekly updates and milestones.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-pink-500 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Expert Resources</h3>
              <p className="text-gray-600">
                Access a library of medically-reviewed articles and pregnancy guides.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-pink-500 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600">
                Connect with other expecting parents and share your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-pink-600" />
              <span className="text-lg font-semibold text-pink-600">Mamata Nepal</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Mamata Nepal. {t('allRightsReserved')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;