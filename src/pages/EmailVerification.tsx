import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const checkVerificationStatus = async () => {
    if (!email) {
      setMessage({
        text: 'Please enter your email address',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Get current session - if user is logged in and verified
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data?.session) {
        setMessage({
          text: 'Your email has been verified! You can now use your account.',
          type: 'success'
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
        
        return;
      }
      
      // If no session, email is not verified yet
      setMessage({
        text: 'Your email has not been verified yet. Please check your inbox and click the verification link.',
        type: 'info'
      });
    } catch (err) {
      console.error('Error checking verification status:', err);
      setMessage({
        text: 'An error occurred while checking verification. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage({
        text: 'Please enter your email address',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      setMessage({
        text: 'Verification email has been sent! Please check your inbox.',
        type: 'success'
      });
    } catch (err) {
      console.error('Error resending verification email:', err);
      setMessage({
        text: 'Failed to resend verification email. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-center mb-6">
          <Mail className="h-12 w-12 text-indigo-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Email Verification
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Please enter your email address to check verification status or resend the verification link.
        </p>
        
        {message && (
          <div className={`p-4 mb-6 rounded-md ${
            message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' :
            message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' :
            'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
          }`}>
            <p>{message.text}</p>
          </div>
        )}
        
        <div className="mb-6">
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
        
        <div className="flex space-x-3 mb-6">
          <button
            onClick={checkVerificationStatus}
            disabled={loading}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Checking...' : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Status
              </>
            )}
          </button>
          
          <button
            onClick={resendVerificationEmail}
            disabled={loading}
            className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Email
              </>
            )}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-500">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
