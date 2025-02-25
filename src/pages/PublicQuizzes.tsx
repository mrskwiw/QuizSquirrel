import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Clock, User } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  profiles: {
    email: string;
  };
}

const PublicQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPublicQuizzes();
  }, []);

  const fetchPublicQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('quizzes')
        .select('*, profiles(email)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      console.error('Error fetching public quizzes:', err);
      setError('Failed to load public quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchPublicQuizzes();
      return;
    }

    const filteredQuizzes = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setQuizzes(filteredQuizzes);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Public Quizzes</h1>
        
        <form onSubmit={handleSearch} className="relative w-full max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-indigo-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No public quizzes found</h3>
          <p className="text-gray-600">There are no public quizzes available right now.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="mr-3">{new Date(quiz.created_at).toLocaleDateString()}</span>
                  
                  <User className="w-4 h-4 mr-1" />
                  <span className="truncate max-w-[150px]">
                    {quiz.profiles?.email.split('@')[0] || 'Unknown'}
                  </span>
                </div>
                
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Quiz
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicQuizzes;
