import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Award, TrendingUp, Play, RotateCcw } from 'lucide-react';
import { supabaseHelpers } from '../../hooks/useSupabase';

interface QuizzesProps {
  userEmail?: string;
}

export default function Quizzes({ userEmail = '' }: QuizzesProps) {
  const [supabaseData, setSupabaseData] = useState({
    courses: [],
    quizzes: [],
    userCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We'll use real data from Supabase instead of fake quizzes
  useEffect(() => {
    loadQuizData();
  }, []);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [coursesData, quizzesData] = await Promise.all([
        supabaseHelpers.getCourses(),
        supabaseHelpers.getQuizzes(),
        supabaseHelpers.getAllUserCourses().catch(() => [])
      ]);
      
      setSupabaseData({
        courses: coursesData,
        quizzes: quizzesData,
        userCourses: userCoursesData || []
      });
    } catch (err) {
      console.error('Failed to load quiz data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading quizzes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={loadQuizData}
              className="mt-2 text-sm text-red-700 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get available quizzes from the database
  const availableQuizzes = supabaseData.quizzes || [];

  const availableQuizzesCount = availableQuizzes.length;
  const completedQuizzes = 0;
  const totalAttempts = 0;
  const averageScore = 0;
  
  const getQuizStatus = (quiz: any) => {
    if (quiz.quizCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Available
        </span>
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 bg-red-50 p-6 rounded-lg border border-red-100">
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-red-700">
            <strong>No quizzes available.</strong> Quizzes must be manually added by a Super Admin and assigned to you.
          </p>
          <p className="mt-2 text-sm text-red-700 flex items-center">
            <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-bold">Not Available</span>
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-500 mb-3">No Quizzes Available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Quizzes must be manually added by a Super Admin and then assigned to you.
              Please contact your administrator if you need access to quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}