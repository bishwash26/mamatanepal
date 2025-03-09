import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Filter, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  options: {
    sizes?: string[];
    colors?: string[];
  };
}

export default function ProductListing() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from your database
    // For now, we'll use mock data
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data based on category
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Maternity Dress',
            price: 59.99,
            discountPrice: 49.99,
            image: '/product-1.jpg',
            category: 'maternity',
            options: {
              sizes: ['S', 'M', 'L', 'XL'],
              colors: ['Black', 'Navy', 'Burgundy']
            }
          },
          {
            id: '2',
            name: 'Pregnancy Support Belt',
            price: 29.99,
            image: '/product-2.jpg',
            category: 'maternity',
            options: {
              sizes: ['S', 'M', 'L']
            }
          },
          {
            id: '3',
            name: 'Nursing Bra',
            price: 34.99,
            discountPrice: 29.99,
            image: '/product-3.jpg',
            category: 'nursing',
            options: {
              sizes: ['S', 'M', 'L', 'XL'],
              colors: ['Black', 'Beige', 'White']
            }
          },
          {
            id: '4',
            name: 'Baby Onesie Set',
            price: 24.99,
            image: '/product-4.jpg',
            category: 'baby',
            options: {
              sizes: ['0-3m', '3-6m', '6-12m'],
              colors: ['Blue', 'Pink', 'Yellow']
            }
          },
          {
            id: '5',
            name: 'Postpartum Recovery Kit',
            price: 49.99,
            discountPrice: 39.99,
            image: '/product-5.jpg',
            category: 'wellness',
            options: {}
          },
          {
            id: '6',
            name: 'New Mom Gift Box',
            price: 79.99,
            image: '/product-6.jpg',
            category: 'gifts',
            options: {}
          }
        ];
        
        // Filter by category if provided
        const filtered = categoryId 
          ? mockProducts.filter(p => p.category === categoryId)
          : mockProducts;
          
        setProducts(filtered);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryId]);

  const handleAddToCart = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Save the product to localStorage for after login
      localStorage.setItem('pendingCartItem', JSON.stringify(product));
      // Redirect to login
      navigate('/login', { state: { from: location, action: 'addToCart' } });
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      quantity: 1
    });
    alert('Product added to cart!');
  };

  const handleBuyNow = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Save the product to localStorage for after login
      localStorage.setItem('pendingBuyNow', JSON.stringify(product));
      // Redirect to login
      navigate('/login', { state: { from: location, action: 'buyNow' } });
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      quantity: 1
    });
    navigate('/checkout');
  };

  const getCategoryTitle = () => {
    switch(categoryId) {
      case 'maternity': return 'Maternity Wear';
      case 'nursing': return 'Nursing Essentials';
      case 'baby': return 'Baby Care';
      case 'wellness': return 'Maternal Wellness';
      case 'gifts': return 'Gift Sets';
      default: return 'All Products';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="bg-primary-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">{getCategoryTitle()}</h1>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button className="flex items-center text-gray-700 hover:text-gray-900">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Sort by:</span>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Featured
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                  {product.discountPrice && (
                    <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm font-medium">
                      Sale
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                  <div className="flex items-center mb-3">
                    {product.discountPrice ? (
                      <>
                        <span className="text-primary-600 font-semibold">${product.discountPrice.toFixed(2)}</span>
                        <span className="text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {product.options.sizes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.options.sizes.map(size => (
                          <button key={size} className="border border-gray-300 px-2 py-1 text-xs rounded hover:border-primary-600">
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {product.options.colors && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Colors:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.options.colors.map(color => (
                          <button key={color} className="border border-gray-300 px-2 py-1 text-xs rounded hover:border-primary-600">
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-white border border-primary-600 text-primary-600 py-2 rounded-md hover:bg-primary-50 flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 