import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Loader2, AlertCircle, Info } from 'lucide-react';
import { authService } from '../lib/auth';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: 'GhanaPay123!', // Default password for testing
    fullName: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await authService.signIn(formData.email, formData.password);
      } else {
        await authService.signUp(formData.email, formData.password, formData.fullName, formData.phone);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Handle specific error types with more helpful messages
      if (err.message?.includes('User already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.message?.includes('Invalid login credentials')) {
        if (isLogin) {
          setError('No account found with these credentials. Try signing up first or check your email/password.');
        } else {
          setError('Invalid credentials provided. Please check your information.');
        }
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError(''); // Clear error when switching modes
    // Clear form data except password when switching modes
    setFormData(prev => ({
      email: '',
      password: 'GhanaPay123!',
      fullName: '',
      phone: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GhanaPay</h1>
          <p className="text-gray-600">Your trusted mobile money wallet</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Join thousands of users'}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700 text-sm">
                {isLogin ? (
                  <div>
                    <p className="font-medium mb-1">To sign in:</p>
                    <p>Use an email you've already registered with the password: <code className="bg-blue-100 px-1 rounded">GhanaPay123!</code></p>
                    <p className="mt-1 text-blue-600">Don't have an account? Switch to "Create Account" below.</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">To create an account:</p>
                    <p>Use a new email address. Password is pre-filled: <code className="bg-blue-100 px-1 rounded">GhanaPay123!</code></p>
                    <p className="mt-1 text-blue-600">Fill in all required fields below.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                <p className="text-error-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required={!isLogin}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required={!isLogin}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={isLogin ? "Enter your registered email" : "Enter a new email address"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleModeSwitch}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-600 text-xs text-center">
              Having trouble? Make sure your PlanetScale database is properly configured and connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}