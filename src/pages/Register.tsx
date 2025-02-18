import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import { validatePassword, validateEmail } from '../utils/validation';

interface SignupError {
  step: string;
  message: string;
  details?: any;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<SignupError[]>([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: SignupError[] = [];
    setDebugInfo(null);

    try {
      // Step 1: Input Validation
      setDebugInfo('Step 1: Validating input fields...');
      
      if (!validateEmail(email)) {
        newErrors.push({
          step: 'input_validation',
          message: 'Please enter a valid email address'
        });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.push({
          step: 'input_validation',
          message: 'Password validation failed',
          details: passwordValidation.errors
        });
      }

      if (password !== confirmPassword) {
        newErrors.push({
          step: 'input_validation',
          message: 'Passwords do not match'
        });
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
        return;
      }

      // Step 2: Signup Process
      setLoading(true);
      setDebugInfo('Step 2: Initiating signup with Supabase...');
      
      const { error, confirmationSent, debugDetails } = await signUp(email, password);
      
      if (error) {
        newErrors.push({
          step: 'supabase_signup',
          message: error.message,
          details: debugDetails
        });
        setErrors(newErrors);
        setDebugInfo(`Signup failed: ${error.message}\nDetails: ${JSON.stringify(debugDetails, null, 2)}`);
        return;
      }

      // Step 3: Handle Response
      setDebugInfo('Step 3: Processing signup response...');
      
      if (confirmationSent) {
        setDebugInfo('Email confirmation sent successfully. Redirecting to verification page...');
        navigate('/email-verification');
      } else {
        setDebugInfo('No email confirmation required. Redirecting to dashboard...');
        navigate('/');
      }

    } catch (err) {
      const error = err as Error;
      newErrors.push({
        step: 'unexpected_error',
        message: 'An unexpected error occurred during signup',
        details: {
          errorMessage: error.message,
          errorStack: error.stack
        }
      });
      setErrors(newErrors);
      setDebugInfo(`Unexpected error: ${error.message}\nStack: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-8">
          <UserPlus className="w-8 h-8 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Registration failed:</span>
            </div>
            {errors.map((error, index) => (
              <div key={index} className="mb-2">
                <div className="font-semibold">Step: {error.step}</div>
                <div className="ml-4">{error.message}</div>
                {error.details && Array.isArray(error.details) ? (
                  <ul className="list-disc ml-8">
                    {error.details.map((detail, i) => (
                      <li key={i} className="text-sm">{detail}</li>
                    ))}
                  </ul>
                ) : error.details && typeof error.details === 'object' ? (
                  <pre className="text-xs bg-red-100 p-2 mt-1 rounded">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-md mb-6">
            <div className="flex items-center mb-2">
              <Info className="w-5 h-5 mr-2" />
              <span className="font-medium">Debug Information:</span>
            </div>
            <pre className="text-xs overflow-auto max-h-40">
              {debugInfo}
            </pre>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long and contain uppercase, lowercase, number, and special characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
