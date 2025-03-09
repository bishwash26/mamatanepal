import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Shop() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categories = [
    {
      id: 'maternity',
      title: 'Maternity Wear',
      description: 'Comfortable and stylish clothing for every stage of pregnancy',
      image: '/maternity-collections.png',
    },
    {
      id: 'nursing',
      title: 'Nursing Essentials',
      description: 'Everything you need for a comfortable nursing journey',
      image: '/nursing-essentials.png',
    },
    {
      id: 'baby',
      title: 'Baby Care',
      description: 'Premium products for your little one',
      image: '/baby-care.png',
    },
    {
      id: 'wellness',
      title: 'Maternal Wellness',
      description: 'Self-care products designed for new and expecting mothers',
      image: '/wellness.png',
    },
    {
      id: 'gifts',
      title: 'Gift Sets',
      description: 'Thoughtful gift collections for mothers and babies',
      image: '/gifts.png',
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-primary-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover our curated collection of products for mothers and babies.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/shop/${category.id}`)}
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.png';
                  }}
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
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 