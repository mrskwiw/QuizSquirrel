import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EmailVerification() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 rounded-full p-3">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
        <p className="text-gray-600 mb-6">
          We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or try signing in again.
          </p>
          
          <Link
            to="/login"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
