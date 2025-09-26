import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { supabaseHelpers } from '../../hooks/useSupabase';
import { useRealtimeSync } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard({ userEmail = '' }: { userEmail?: string }) {
  const [supabaseData, setSupabaseData] = useState({
    companies: [],
    courses: [],
    pdfs: [],
    users: [],
    podcasts: [],
    userCourses: [],
    quizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [podcastProgress, setPodcastProgress] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalHours: 0,
    activeUsers: 0
  });

  const loadDashboardData = async (adminId: string, companyId: string | null) => {
    try {
      setLoading(true);
      setError(null);
      
      const [companiesData, usersData, coursesData, pdfsData, podcastsData, userCoursesData, userProfilesData] = await Promise.all([
        supabaseHelpers.getCompanies(),
        companyId ? supabaseHelpers.getUsersByCompany(companyId) : supabaseHelpers.getUsers(),
        supabaseHelpers.getCourses(),
        supabaseHelpers.getPDFs(),
        supabaseHelpers.getPodcasts(),
        supabaseHelpers.getAllUserCourses(),
        supabaseHelpers.getAllUserProfiles()
      ]);
      
      // Load quizzes separately with error handling
      let quizzesData = [];
      try {
        quizzesData = await supabaseHelpers.getQuizzes();
      } catch (quizError) {
        console.error('Error loading quizzes:', quizError);
        quizzesData = [];
      }
      
      // Load podcast progress
      let progressData = [];
      try {
        const { data } = await supabase
          .from('podcast_progress')
          .select('*');
        progressData = data || [];
      } catch (progressError) {
        console.error('Error loading podcast progress:', progressError);
        progressData = [];
      }
      
      setSupabaseData({
        companies: companiesData || [],
        users: usersData || [],
        courses: coursesData || [],
        pdfs: pdfsData || [],
        podcasts: podcastsData || [],
        userCourses: userCoursesData || [],
        quizzes: quizzesData || []
      });
      
      setUserProfiles(userProfilesData || []);
      setPodcastProgress(progressData || []);
      
      // Calculate real-time metrics
      const adminUsers = companyId 
        ? (usersData || []).filter((user: any) => user.role === 'user' && user.company_id === companyId)
        : (usersData || []).filter((user: any) => user.role === 'user');
      
      const adminUserIds = adminUsers.map(user => user.id);
      const adminUserCourses = (userCoursesData || []).filter((uc: any) => 
        adminUserIds.includes(uc.user_id)
      );
      
      const assignedCourseIds = new Set(adminUserCourses.map((uc: any) => uc.course_id));
      
      // Calculate total hours from podcast progress
      const filteredProgress = (progressData || []).filter((progress: any) => 
        adminUserIds.includes(progress.user_id)
      );
      
      const totalHours = Math.round(filteredProgress.reduce((sum: number, progress: any) => {
        const duration = typeof progress.duration === 'string' ? parseFloat(progress.duration) : (progress.duration || 0);
        const progressPercent = progress.progress_percent || 0;
        return sum + ((duration * (progressPercent / 100)) / 3600 * 10) / 10;
      }, 0) * 10) / 10;
      
      // Active users are those who have any course assignments or progress
      const usersWithCourses = new Set(adminUserCourses.map((uc: any) => uc.user_id));
      const usersWithProgress = new Set(filteredProgress.filter((progress: any) => 
        progress.progress_percent > 0).map((progress: any) => progress.user_id));
      const activeUsers = new Set([...usersWithCourses, ...usersWithProgress]).size;
      
      setRealTimeMetrics({
        totalUsers: adminUsers.length,
        totalCourses: assignedCourseIds.size,
        totalHours: totalHours,
        activeUsers: activeUsers
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time sync for all relevant tables
  useRealtimeSync('users', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('user-courses', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('courses', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('podcast-progress', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('companies', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('user-profiles', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('podcasts', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('pdfs', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('quizzes', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('content-categories', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('podcast-assignments', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('podcast-likes', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('activity-logs', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('logos', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });
  useRealtimeSync('documents', () => {
    if (adminId && companyId) {
      loadDashboardData(adminId, companyId);
    }
  });

  useEffect(() => {
    const getAdminInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setAdminId(user.id);
          
          // Get admin's company
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single();
            
          if (!userError && userData) {
            setCompanyId(userData.company_id);
            loadDashboardData(user.id, userData.company_id);
          }
        }
      } catch (error) {
        console.error('Error getting admin info:', error);
      }
    };
    
    getAdminInfo();
  }, []);

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              onClick={() => adminId && loadDashboardData(adminId, companyId)}
              className="mt-2 text-sm text-red-700 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">Overview of your learning management system.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: realTimeMetrics.totalUsers, icon: Users, color: 'bg-[#8b5cf6]' },
            { title: 'Total Courses', value: realTimeMetrics.totalCourses, icon: BookOpen, color: 'bg-[#8b5cf6]' },
            { title: 'Total Hours', value: realTimeMetrics.totalHours.toFixed(1), icon: Clock, color: 'bg-[#8b5cf6]' },
            { title: 'Active Users', value: realTimeMetrics.activeUsers, icon: CheckCircle, color: 'bg-[#8b5cf6]' }
          ].map((card, index) => (
            <div key={index} className="bg-[#1e1e1e] overflow-hidden shadow-sm rounded-lg border border-[#333333]">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#a0a0a0] truncate">{card.title}</dt>
                      <dd className="text-2xl font-semibold text-white">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-[#1e1e1e] overflow-hidden shadow-sm rounded-lg border border-[#333333]">
            <div className="px-6 py-4 border-b border-[#333333]">
              <h3 className="text-lg font-medium text-white">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-[#333333] rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Manage Users</h4>
                      <p className="text-sm text-[#a0a0a0]">Add, edit, delete users</p>
                    </div>
                    <Users className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-[#333333] rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Assign Courses</h4>
                      <p className="text-sm text-[#a0a0a0]">Assign/Remove courses</p>
                    </div>
                    <BookOpen className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                </button>
                
                <button className="w-full text-left p-4 border border-[#333333] rounded-lg hover:bg-[#252525] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">View Content</h4>
                      <p className="text-sm text-[#a0a0a0]">View content added by Super Admin</p>
                    </div>
                    <BookOpen className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Available Courses */}
          <div className="bg-[#1e1e1e] shadow-sm rounded-lg border border-[#333333]">
            <div className="px-6 py-4 border-b border-[#333333]">
              <h3 className="text-lg font-medium text-white">Courses From Super Admin</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {supabaseData.courses.length > 0 ? (
                  supabaseData.courses.slice(0, 6).map((course: any, index: number) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-white">{course.title}</h4>
                        <p className="text-xs text-[#a0a0a0]">Added by Super Admin</p>
                      </div>
                      <span className="text-xs text-[#a0a0a0]">Available</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#a0a0a0] py-4">No courses available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Progress Overview */}
        <div className="bg-[#1e1e1e] shadow-sm rounded-lg border border-[#333333] mb-8">
          <div className="px-6 py-4 border-b border-[#333333]">
            <h3 className="text-lg font-medium text-white">User Progress Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {supabaseData.users.filter((user: any) => user.role === 'user' && (!companyId || user.company_id === companyId)).length > 0 ? (
                supabaseData.users.filter((user: any) => user.role === 'user' && (!companyId || user.company_id === companyId)).slice(0, 5).map((user: any, index: number) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-[#252525] rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#8b5cf6]" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {userProfiles.find(p => p.user_id === user.id)?.full_name || user.email}
                        </p>
                        <p className="text-xs text-[#a0a0a0]">
                          {supabaseData.userCourses.filter(uc => uc.user_id === user.id).length} courses enrolled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {(() => {
                        const userCourseCount = supabaseData.userCourses.filter(uc => uc.user_id === user.id).length;
                        const userProgress = podcastProgress.filter(p => p.user_id === user.id);
                        const avgProgress = userProgress.length > 0 
                          ? Math.round(userProgress.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / userProgress.length)
                          : 0;
                        
                        return (
                          <>
                      <div className="w-24 bg-[#333333] rounded-full h-2 mr-3">
                              <div className="bg-[#8b5cf6] h-2 rounded-full" style={{ width: `${avgProgress}%` }}></div>
                      </div>
                            <span className="text-sm font-medium text-white">{avgProgress}%</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#a0a0a0] py-4">No users assigned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Companies Overview */}
        <div className="bg-[#1e1e1e] shadow-sm rounded-lg border border-[#333333]">
          <div className="px-6 py-4 border-b border-[#333333]">
            <h3 className="text-lg font-medium text-white">Companies Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#333333]">
              <thead className="bg-[#252525]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1e1e1e] divide-y divide-[#333333]">
                {supabaseData.companies.length > 0 ? (
                  supabaseData.companies.map((company: any, index: number) => (
                    <tr key={company.id} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {(supabaseData.users || []).filter((u: any) => u.company_id === company.id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {(() => {
                          const companyUsers = (supabaseData.users || []).filter((u: any) => u.company_id === company.id);
                          const companyUserIds = companyUsers.map(u => u.id);
                          const companyUserCourses = (supabaseData.userCourses || []).filter((uc: any) => 
                            companyUserIds.includes(uc.user_id)
                          );
                          const uniqueCourses = new Set(companyUserCourses.map(uc => uc.course_id));
                          return uniqueCourses.size;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(company.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#a0a0a0]">
                      No companies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}