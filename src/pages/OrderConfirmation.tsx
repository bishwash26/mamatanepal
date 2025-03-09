import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear the pending order from localStorage
    localStorage.removeItem('pendingOrder');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <p className="text-gray-600 mb-8">
            A confirmation email has been sent to your email address.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
} 