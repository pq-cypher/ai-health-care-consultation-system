import React, { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import fmcLogo from "../../assets/images/fmc-logo.png";

  
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`/api/admin-login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'check_session' }),
        credentials: 'include'
      });
      
      const result = await response.json();
      if (result.success && result.logged_in) {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required';
      } else if (!validateEmail(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'password') {
      if (!value.trim()) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (fieldName) => {
    if (!formData[fieldName]) {
      setFocusedField('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });

    // If there are errors, don't submit
    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin-login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.login_status) {
        navigate('/admin/dashboard');
      } else {
        setErrors({
          email: result.message || 'Invalid credentials',
          password: ''
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        email: 'Network error. Please try again.',
        password: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md transform transition-all duration-1000 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Logo Section */}
        <div className="flex items-center justify-start flex-col flex-nowrap text-center mb-8 space-y-4">
          <img src={fmcLogo} className={`w-[100px] transform transition-all duration-700 delay-300 ${mounted ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`} />
          <div className={`space-y-2 transform transition-all duration-700 delay-500 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">FMC Keffi</h1>
            <p className="text-gray-600 text-sm leading-relaxed px-4">
              AI Health Care Consultation System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className={`space-y-6 transform transition-all duration-700 delay-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
        }`}>
          {/* Email Field */}
          <div className="relative">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                } bg-white shadow-sm`}
                placeholder={focusedField === 'email' || formData.email ? '' : 'Email'}
              />
              <label className={`absolute left-11 transition-all duration-300 pointer-events-none ${
                focusedField === 'email' || formData.email
                  ? 'top-1 text-xs text-blue-600 font-medium'
                  : 'top-1/2 transform -translate-y-1/2 text-gray-500'
              }`}>
                {focusedField === 'email' || formData.email ? 'Email Address' : ''}
              </label>
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center space-x-2 text-red-500 text-sm animate-in slide-in-from-left duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors duration-200" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
                } bg-white shadow-sm`}
                placeholder={focusedField === 'password' || formData.password ? '' : 'Password'}
              />
              <label className={`absolute left-11 transition-all duration-300 pointer-events-none ${
                focusedField === 'password' || formData.password
                  ? 'top-1 text-xs text-blue-600 font-medium'
                  : 'top-1/2 transform -translate-y-1/2 text-gray-500'
              }`}>
                {focusedField === 'password' || formData.password ? 'Password' : ''}
              </label>
            </div>
            {errors.password && (
              <div className="mt-2 flex items-center space-x-2 text-red-500 text-sm animate-in slide-in-from-left duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
              isLoading ? 'bg-blue-400' : ''
            } active:scale-[0.98]`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <span className="font-semibold">Login</span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className={`mt-8 text-center transform transition-all duration-700 delay-1000 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-xs">
              © 2025 FMC Keffi. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default AdminLogin;