import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Process the callback URL
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error processing auth callback:', error);
          setError(error.message);
          return;
        }

        // Redirect to the dashboard on success
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Authentication...</h2>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
