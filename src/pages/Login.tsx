import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Eye, EyeOff, Mail, Lock, LogIn, CheckCircle, AlertCircle, X, XCircle, Save } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext.tsx';

type ViewType = 'sign_in' | 'sign_up';
type NotificationType = 'success' | 'error' | 'info' | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const Login = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [view, setView] = useState<ViewType>('sign_in');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Password validation states
  const [passwordLengthValid, setPasswordLengthValid] = useState(false);
  const [passwordUppercaseValid, setPasswordUppercaseValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // New password validation states
  const [newPasswordLengthValid, setNewPasswordLengthValid] = useState(false);
  const [newPasswordUppercaseValid, setNewPasswordUppercaseValid] = useState(false);
  const [newPasswordsMatch, setNewPasswordsMatch] = useState(false);

  useEffect(() => {
    // Check password requirements
    setPasswordLengthValid(password.length >= 8);
    setPasswordUppercaseValid(/[A-Z]/.test(password));
    setPasswordsMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  useEffect(() => {
    // Check password requirements for new password
    setNewPasswordLengthValid(newPassword.length >= 8);
    setNewPasswordUppercaseValid(/[A-Z]/.test(newPassword));
    setNewPasswordsMatch(newPassword === confirmNewPassword);
  }, [newPassword, confirmNewPassword]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
  };

  const handleSuccessfulLogin = () => {
    // Handle pending actions based on where the user came from
    const from = location.state?.from?.pathname || '/';
    const action = location.state?.action;
    
    // Handle pending cart item
    const pendingCartItem = localStorage.getItem('pendingCartItem');
    if (pendingCartItem) {
      const product = JSON.parse(pendingCartItem);
      addToCart({
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.image,
        quantity: 1
      });
      localStorage.removeItem('pendingCartItem');
      
      if (action === 'buyNow') {
        navigate('/checkout');
        return;
      }
    }
    
    // Navigate back to where the user came from
    navigate(from);
  };

  const { user } = useAuth();
  if (user) {
    handleSuccessfulLogin();
  }
  

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      
      handleSuccessfulLogin();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (!passwordLengthValid || !passwordUppercaseValid) {
      setError('Password must be at least 8 characters with at least one uppercase letter');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // First check if the email is already registered
      const { data: existingUser, error: emailCheckError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create a user, just check if email exists
        }
      });

      // If no error occurs during OTP sending, it means the email exists
      // In this case, Supabase will return a 422 error for non-existent users
      if (!emailCheckError) {
        setError('');
        showNotification('info', t('This email is already registered. Please sign in instead.'));
        setView('sign_in');
        setLoading(false);
        return;
      }

      // Proceed with signup if the email doesn't exist
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (signUpError) {
        // If the error is about duplicate email, show a specific message
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw signUpError;
      }
      
      // Success message for sign up
      setError('');
      showNotification('success', t('Please check your email for the verification link. You need to verify your email before you can sign in.'));
      
      // Clear the form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // Switch to sign in view
      setView('sign_in');
    } catch (err) {
      const error = err as Error;
      
      // If the error message suggests the email is already registered
      if (error.message.includes('already registered')) {
        showNotification('info', t('This email is already registered. Please sign in instead.'));
        setView('sign_in');
      } else {
        setError(error.message || 'An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (signInError) throw signInError;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred during Google sign in');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      // Show success notification
      showNotification('success', t('Password reset link sent to your email. Please check your inbox.'));
      
      // Close the modal and clear the email
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
    } catch (err) {
      const error = err as Error;
      showNotification('error', error.message || t('Failed to send password reset email.'));
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate new password
    if (!newPasswordLengthValid || !newPasswordUppercaseValid) {
      showNotification('error', t('Password must be at least 8 characters with at least one uppercase letter'));
      return;
    }

    if (!newPasswordsMatch) {
      showNotification('error', t('Passwords do not match'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      // Success message for password update
      showNotification('success', t('Your password has been updated successfully. You can now sign in with your new password.'));
      
      // Clear the form and close the modal
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordResetModal(false);
      
      // Remove the query parameter
      navigate('/', { replace: true });
      
    } catch (err) {
      const error = err as Error;
      showNotification('error', error.message || t('Failed to update password.'));
    } finally {
      setLoading(false);
    }
  };

  // Notification component
  const NotificationComponent = () => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'success' ? 'bg-green-50 border-green-500' : 
                    notification.type === 'error' ? 'bg-red-50 border-red-500' : 
                    'bg-blue-50 border-blue-500';
                    
    const textColor = notification.type === 'success' ? 'text-green-800' : 
                      notification.type === 'error' ? 'text-red-800' : 
                      'text-blue-800';
                      
    const Icon = notification.type === 'success' ? CheckCircle : 
                 notification.type === 'error' ? AlertCircle : 
                 AlertCircle;
                 
    const iconColor = notification.type === 'success' ? 'text-green-500' : 
                      notification.type === 'error' ? 'text-red-500' : 
                      'text-blue-500';
    
    return (
      <div className={`${bgColor} border-l-4 p-4 mb-4 rounded-md relative`}>
        <div className="flex items-start">
          <div className={`${iconColor} flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className={`${textColor} text-sm font-medium`}>{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-500 rounded-md p-1.5 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Forgot Password Modal Component
  const ForgotPasswordModal = () => {
    if (!showForgotPasswordModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          {/* Modal panel */}
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowForgotPasswordModal(false)}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {t('Reset Password')}
                </h3>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('Email Address')}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {t('We\'ll send a password reset link to this email address')}
                    </p>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={resetPasswordLoading}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        resetPasswordLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {resetPasswordLoading ? t('Sending...') : t('Send Reset Link')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      {t('Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Password Reset Modal Component
  const PasswordResetModal = () => {
    if (!showPasswordResetModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          {/* Modal panel */}
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setShowPasswordResetModal(false);
                  navigate('/', { replace: true });
                }}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {t('Set New Password')}
                </h3>
                
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('New Password (min 8 characters, 1 uppercase)')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? 
                          <EyeOff className="h-5 w-5 text-gray-400" /> : 
                          <Eye className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Confirm New Password')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className={`block w-full pl-10 pr-10 py-2 border ${
                          confirmNewPassword && !newPasswordsMatch ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        {showConfirmNewPassword ? 
                          <EyeOff className="h-5 w-5 text-gray-400" /> : 
                          <Eye className="h-5 w-5 text-gray-400" />
                        }
                      </button>
                    </div>
                    {confirmNewPassword && !newPasswordsMatch && (
                      <p className="mt-1 text-sm text-red-600">
                        {t('Passwords do not match')}
                      </p>
                    )}
                  </div>
                  
                  {/* Password validation indicators */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className={`flex items-center ${newPasswordLengthValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${newPasswordLengthValid ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('At least 8 characters')}
                      </div>
                      <div className={`flex items-center ${newPasswordUppercaseValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${newPasswordUppercaseValid ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('At least one uppercase letter')}
                      </div>
                      <div className={`flex items-center ${newPasswordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${newPasswordsMatch ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('Passwords match')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading || !newPasswordLengthValid || !newPasswordUppercaseValid || !newPasswordsMatch}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-pink-600 text-base font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        loading || !newPasswordLengthValid || !newPasswordUppercaseValid || !newPasswordsMatch ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading ? t('Updating...') : t('Update Password')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordResetModal(false);
                        navigate('/', { replace: true });
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      {t('Cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Forgot Password Modal */}
      <ForgotPasswordModal />
      
      {/* Password Reset Modal */}
      <PasswordResetModal />
      
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
              {view === 'sign_in' ? t('Welcome Back') : t('Join Our Community')}
            </h2>
            
            <div className="w-full">
              {/* Notification area */}
              <NotificationComponent />
              
              {/* Google sign-in button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={`w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-6 ${
                  googleLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <img src="/google-logo.png" alt="Google" className="h-5 w-5 mr-2" />
                {googleLoading ? t('Connecting...') : t('Continue with Google')}
              </button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t('Or continue with email')}
                  </span>
                </div>
              </div>
              
              <form onSubmit={view === 'sign_up' ? handleSignUp : handleSignIn} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {view === 'sign_up' ? t('Password (min 8 characters, 1 uppercase)') : t('Password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOff className="h-5 w-5 text-gray-400" /> : 
                        <Eye className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password Field - shown for signup only */}
                {view === 'sign_up' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Confirm Password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`block w-full pl-10 pr-10 py-2 border ${
                        confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 
                        <EyeOff className="h-5 w-5 text-gray-400" /> : 
                        <Eye className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-sm text-red-600">
                      {t('Passwords do not match')}
                    </p>
                  )}
                </div> 
                )}
                
                {view === 'sign_up' && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className={`flex items-center ${passwordLengthValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${passwordLengthValid ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('At least 8 characters')}
                      </div>
                      <div className={`flex items-center ${passwordUppercaseValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${passwordUppercaseValid ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('At least one uppercase letter')}
                      </div>
                      <div className={`flex items-center ${passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${passwordsMatch ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                        {t('Passwords match')}
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || (view === 'sign_up' && (!passwordLengthValid || !passwordUppercaseValid || !passwordsMatch))}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${
                    loading || (view === 'sign_up' && (!passwordLengthValid || !passwordUppercaseValid || !passwordsMatch))
                      ? 'opacity-70 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {loading ? t('Processing...') : view === 'sign_up' ? t('Sign Up') : t('Sign In')}
                </button>
              </form>

              {view === 'sign_in' && (
                <div className="mt-3 text-sm text-center">
                  <button 
                    className="text-pink-600 hover:text-pink-700"
                    onClick={() => setShowForgotPasswordModal(true)}
                    type="button"
                  >
                    {t('Forgot your password?')}
                  </button>
                </div>
              )}

              <div className="mt-4 text-sm text-center">
                {view === 'sign_up' ? (
                  <p>
                    {t('Already have an account?')}{' '}
                    <button 
                      className="font-medium text-pink-600 hover:text-pink-700"
                      onClick={() => setView('sign_in')}
                    >
                      {t('Sign In')}
                    </button>
                  </p>
                ) : (
                  <p>
                    {t('Don\'t have an account?')}{' '}
                    <button 
                      className="font-medium text-pink-600 hover:text-pink-700"
                      onClick={() => setView('sign_up')}
                    >
                      {t('Sign Up')}
                    </button>
                  </p>
                )}
              </div>
              
              {view === 'sign_up' && (
                <div className="mt-6 text-xs text-center text-gray-500">
                  {t('By signing up, you agree to our Terms of Service and Privacy Policy')}
                </div>
              )}
            </div>
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