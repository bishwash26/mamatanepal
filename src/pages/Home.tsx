import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  ShoppingBag,
  Baby,
  Milk,
  Sofa,
  Gamepad2,
  Home as HomeIcon,
  Sparkles,
  Shirt,
  BookOpen,
  Backpack,
  Heart,
  Lamp,
  UserRound,
  ShowerHead
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

interface Profile {
  id: string;
  username: string;
  role: 'user' | 'doctor';
}

interface Blog {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  youtube_id: string;
  duration: string;
  created_at: string;
  description: string;
  views: number;
  profiles: {
    username: string;
  };
}

interface Short {
  id: string;
  title: string;
  thumbnail_url: string;
  youtube_id: string;
  duration: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'user' | 'doctor'>('user');
  const [loading, setLoading] = useState(true);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [popularVideos, setPopularVideos] = useState<Video[]>([]);
  const [popularShorts, setPopularShorts] = useState<Short[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingShorts, setLoadingShorts] = useState(true);

  const categories = [
    {
      id: 1,
      title: 'Maternity Wear',
      description: 'Comfortable and stylish clothing for every stage of pregnancy',
      image: '/maternity-collections.png',
      link: '/shop/maternity'
    },
    {
      id: 2,
      title: 'Nursing Essentials',
      description: 'Everything you need for a comfortable nursing journey',
      image: '/nursing-essentials.png',
      link: '/shop/nursing'
    },
    {
      id: 3,
      title: 'Baby Care',
      description: 'Premium products for your little one',
      image: '/baby-care3.jpg',
      link: '/shop/baby'
    }
  ];

  // New product categories with icons
  const productCategories = [
    { id: 'diapering', name: 'Diapering', icon: Baby, path: '/shop/diapering' },
    { id: 'feeding', name: 'Feeding And Nursing', icon: Milk, path: '/shop/feeding' },
    { id: 'baby-decor', name: 'Baby Decor', icon: Sofa, path: '/shop/baby-decor' },
    { id: 'toys', name: 'Toys and Gaming', icon: Gamepad2, path: '/shop/toys' },
    { id: 'bath', name: 'Bath And Skincare', icon: ShowerHead, path: '/shop/bath' },
    { id: 'nursery', name: 'Nursery', icon: HomeIcon, path: '/shop/nursery' },
    { id: 'beauty', name: 'Beauty Care', icon: Sparkles, path: '/shop/beauty' },
    { id: 'fashion', name: 'Fashion', icon: Shirt, path: '/shop/fashion' },
    { id: 'books', name: 'Books', icon: BookOpen, path: '/shop/books' },
    { id: 'school', name: 'School Supplies', icon: Backpack, path: '/shop/school' },
    { id: 'health', name: 'Health And Safety', icon: Heart, path: '/shop/health' },
    { id: 'home', name: 'Home and Living', icon: Lamp, path: '/shop/home' },
    { id: 'momma', name: 'Momma Care', icon: UserRound, path: '/shop/momma' },
  ];

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const {user} = useAuth();
      if (!user) return;
      console.log("user", user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log("profile", profile);

      if (error) throw error;
      if (profile) {
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-mother.jpg"
            alt="Mother and baby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Supporting Every Step of Your Motherhood Journey
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Discover curated products and resources designed for modern mothers
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Shop Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            {t('View Categories')}
            <span className="block text-lg font-normal mt-1 text-gray-600">Just for You!</span>
          </h2>
          
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {productCategories.map((category) => (
              <div 
                key={category.id}
                className="group flex flex-col items-center cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1"
                onClick={() => navigate(category.path)}
              >
                {/* Mobile view */}
                <div className="flex md:hidden flex-col items-center">
                  <div className="bg-primary-50 rounded-full p-3 mb-2 shadow-sm group-hover:bg-primary-100 group-hover:shadow-md transition-all">
                    <category.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-center text-xs font-medium text-gray-800 mb-1">
                    {category.name.includes(' And ') 
                      ? category.name.replace(' And ', ' & ')
                      : category.name}
                  </span>
                  <ArrowRight className="h-3 w-3 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                
                {/* Desktop view */}
                <div className="hidden md:flex flex-col items-center">
                  <div className="bg-primary-50 rounded-lg p-4 mb-3 shadow-sm group-hover:bg-primary-100 group-hover:shadow-md transition-all w-full">
                    <div className="flex flex-col items-center">
                      <category.icon className="h-10 w-10 text-primary-600 mb-3" />
                      <span className="text-center text-sm font-medium text-gray-800">
                        {category.name}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Original Categories Section - Now as Collections */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Shop Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => navigate(category.link)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <button className="text-primary-600 font-medium flex items-center group-hover:text-primary-700">
                  Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              New Arrivals
            </h2>
            <button
              onClick={() => navigate('/shop/new')}
              className="text-primary-600 font-medium flex items-center hover:text-primary-700"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          {/* Add your product grid here */}
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Pregnancy Resources
          </h2>
          {/* Add your resources grid here */}
        </div>
      </section>
    </div>
  );
}