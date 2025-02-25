import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import { validatePassword, validateEmail } from '../utils/validation';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0] || 'Password does not meet requirements');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      try {
        // First check if Supabase is reachable
        const checkResponse = await fetch(import.meta.env.VITE_SUPABASE_URL);
        if (!checkResponse.ok) {
          throw new Error('Unable to connect to authentication service');
        }
      } catch (connectionErr) {
        console.error('Connection error:', connectionErr);
        setError('Unable to connect to the authentication service. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }
      
      const { error, confirmationSent } = await signUp(email, password);
      
      if (error) {
        throw error;
      }
      
      if (confirmationSent) {
        setEmailSent(true);
      } else {
        // If no confirmation needed (unlikely with Supabase)
        navigate('/');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Check for specific error types for better error messages
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('network')) {
          setError('Unable to connect to the authentication service. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="flex justify-center mb-6">
          <Info className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Verification Email Sent
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification email to <span className="font-medium">{email}</span>.
          Please check your inbox and click the verification link to complete your registration.
        </p>
        <Link
          to="/email-verification"
          className="block w-full py-2 px-4 text-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Check Verification Status
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-center mb-6">
          <UserPlus className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create your account
        </h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters and include a number and a special character.
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
