'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Phone, Lock, ArrowLeft } from 'lucide-react';
import { useLogin } from '@/hooks/useLogin';
import { useSession } from 'next-auth/react';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { data: session, status } = useSession();


  const { 
    formData,
    handleSubmission,
    handleLoginInputField,
    errors,
    isLoading,
  } = useLogin();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmission();
  };

  // Show loading state if already authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 shadow-lg mb-4 animate-pulse">
            <span className="text-3xl">🌾</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-600 shadow-lg mb-3">
            <span className="text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to continue to AgroYouth
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6 sm:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Phone Number Input */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="0781234567"
                    value={formData.phoneNumber}
                    onChange={handleLoginInputField}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.phoneNumber 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-600 focus:border-green-600'
                    } rounded-lg focus:ring-2 transition-all outline-none text-gray-900 placeholder:text-gray-400`}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-600 text-xs mt-1 ml-0.5">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleLoginInputField}
                    className={`w-full pl-10 pr-11 py-2.5 border ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-green-600 focus:border-green-600'
                    } rounded-lg focus:ring-2 transition-all outline-none text-gray-900 placeholder:text-gray-400`}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1 ml-0.5">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 flex items-center justify-center mt-6 ${
                  !isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100 text-center rounded-b-2xl">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-gray-700 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-gray-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;