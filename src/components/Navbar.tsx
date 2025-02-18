import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Squirrel } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Squirrel className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl">QuizSquirrel</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/quizzes" className="text-gray-700 hover:text-indigo-600">
              Browse Quizzes
            </Link>
            {user ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
