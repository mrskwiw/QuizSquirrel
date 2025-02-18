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

export default function PublicQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            profiles:user_id (
              email
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (err) {
        setError('Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Public Quizzes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {quiz.description}
              </p>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(quiz.created_at)}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {quiz.profiles.email.split('@')[0]}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
