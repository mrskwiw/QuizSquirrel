import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        if (!user) return;

        setLoading(true);
        // This query would need a 'quizzes' table in your Supabase database
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load your quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [user]);

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Ensure user can only delete their own quizzes

      if (error) throw error;
      
      // Update local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to QuizSquirrel</h2>
        <p className="text-gray-600 mb-6">Please log in to manage your quizzes</p>
        <Link
          to="/login"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Quizzes</h1>
        <Link
          to="/create-quiz"
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create New Quiz
        </Link>
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
          <h3 className="text-lg font-medium text-gray-800 mb-2">No quizzes yet</h3>
          <p className="text-gray-600 mb-4">Create your first quiz to get started!</p>
          <Link
            to="/create-quiz"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            Create a Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-3">{new Date(quiz.created_at).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${quiz.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {quiz.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    title="View Quiz"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/edit-quiz/${quiz.id}`}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    title="Edit Quiz"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded text-red-600 hover:bg-red-50"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
