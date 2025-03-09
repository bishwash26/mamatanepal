import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, CreditCard, Check, CreditCard as WalletIcon } from 'lucide-react';
import { generateUUID } from '../utils/uuid';

export default function Checkout() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nepal',
    paymentMethod: 'credit'
  });
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      if (formData.paymentMethod === 'esewa') {
        initiateEsewaPayment();
      } else {
        // Process other payment methods
        alert('Order placed successfully!');
        clearCart();
        navigate('/order-confirmation');
      }
    }
  };

  const initiateEsewaPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Store order details in localStorage to retrieve after payment
      localStorage.setItem('pendingOrder', JSON.stringify({
        items,
        shippingDetails: formData,
        amount: totalPrice
      }));

      // For development, use a mock implementation if the server isn't running
      if (import.meta.env.DEV) {
        // Mock implementation for development
        const mockResponse = {
          success: true,
          paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form", // Use test URL for development
          formData: {
            amt: totalPrice.toFixed(2),
            psc: "0",
            pdc: "0",
            txAmt: "0",
            tAmt: totalPrice.toFixed(2),
            pid: generateUUID(),
            scd: "EPAYTEST", // Test merchant code
            su: `${window.location.origin}/payment/success`,
            fu: `${window.location.origin}/payment/failure`
          }
        };
        
        // Create and submit the form with mock data
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = mockResponse.paymentUrl;
        
        Object.entries(mockResponse.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
        return;
      }

      // For production, use Netlify function
      const response = await fetch('/.netlify/functions/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalPrice.toFixed(2),
          productName: 'MAMATA',
          transactionId: generateUUID(),
          method: 'esewa'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();
      
      if (data.success) {
        // Create and submit the form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        
        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('Payment initialization failed');
      }
      
    } catch (error) {
      console.error('Error initiating eSewa payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {step === 1 ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Country
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          required
                        >
                          <option value="Nepal">Nepal</option>
                          <option value="India">India</option>
                          <option value="Bangladesh">Bangladesh</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <input
                          type="radio"
                          id="credit"
                          name="paymentMethod"
                          value="credit"
                          checked={formData.paymentMethod === 'credit'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="credit" className="ml-2 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Credit/Debit Card
                        </label>
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <input
                          type="radio"
                          id="esewa"
                          name="paymentMethod"
                          value="esewa"
                          checked={formData.paymentMethod === 'esewa'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="esewa" className="ml-2 flex items-center">
                          <WalletIcon className="h-5 w-5 mr-2" />
                          eSewa Wallet
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cod"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="cod" className="ml-2">
                          Cash on Delivery
                        </label>
                      </div>
                    </div>
                    
                    {formData.paymentMethod === 'esewa' && (
                      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex items-center justify-center mb-3">
                          <img src="/esewa-logo.png" alt="eSewa" className="h-8" />
                        </div>
                        <p className="text-gray-600 text-center">
                          You will be redirected to eSewa to complete your payment.
                        </p>
                      </div>
                    )}
                    
                    {formData.paymentMethod === 'credit' && (
                      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <p className="text-gray-600 text-center">
                          Payment integration would be implemented here.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isProcessing}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="max-h-80 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex py-4 border-b">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <p>Subtotal</p>
                  <p>${totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <p>Shipping</p>
                  <p>Free</p>
                </div>
                <div className="flex justify-between text-base font-medium mt-4">
                  <p>Total</p>
                  <p>${totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 