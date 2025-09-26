import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Building2, BookOpen, Phone, Mail, CheckCircle, XCircle, Edit, Trash2, Users as UsersIcon, Clock } from 'lucide-react';
import { supabaseHelpers } from '../hooks/useSupabase';
import { useRealtimeSync } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import AddUserModal from '../components/Forms/AddUserModal';
import EditUserModal from '../components/Forms/EditUserModal';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [supabaseData, setSupabaseData] = useState({
    companies: [],
    users: [],
    courses: [],
    userProfiles: [],
    userCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [companiesData, usersData, coursesData, userProfilesData, userCoursesData] = await Promise.all([
        supabaseHelpers.getCompanies(),
        supabaseHelpers.getUsers(),
        supabaseHelpers.getCourses(),
        supabaseHelpers.getAllUserProfiles(),
        supabaseHelpers.getAllUserCourses()
      ]);
      
      setSupabaseData({
        companies: companiesData,
        users: usersData,
        courses: coursesData,
        userProfiles: userProfilesData,
        userCourses: userCoursesData
      });
    } catch (err) {
      console.error('Failed to load users data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time sync for all relevant tables
  useRealtimeSync('users', loadUsersData);
  useRealtimeSync('user-profiles', loadUsersData);
  useRealtimeSync('companies', loadUsersData);
  useRealtimeSync('user-courses', loadUsersData);
  useRealtimeSync('courses', loadUsersData);
  useRealtimeSync('podcasts', loadUsersData);
  useRealtimeSync('pdfs', loadUsersData);
  useRealtimeSync('quizzes', loadUsersData);
  useRealtimeSync('content-categories', loadUsersData);
  useRealtimeSync('podcast-assignments', loadUsersData);
  useRealtimeSync('podcast-progress', loadUsersData);
  useRealtimeSync('podcast-likes', loadUsersData);
  useRealtimeSync('logos', loadUsersData);
  useRealtimeSync('activity-logs', loadUsersData);
  useRealtimeSync('temp-passwords', loadUsersData);
  useRealtimeSync('user-registrations', loadUsersData);
  useRealtimeSync('approval-logs', loadUsersData);
  useRealtimeSync('audit-logs', loadUsersData);
  useRealtimeSync('chat-history', loadUsersData);
  useRealtimeSync('contact-messages', loadUsersData);

  useEffect(() => {
    loadUsersData();
  }, []);
  
  const getUserProfile = (userId: string) => {
    return supabaseData.userProfiles.find(profile => profile.user_id === userId);
  };


  const getCompanyName = (companyId: string) => {
    const company = supabaseData.companies.find(c => c.id === companyId);
    return company ? company.name : '';
  };

  const getAdminName = (companyId: string) => {
    const admins = supabaseData.users.filter(user => user.company_id === companyId && user.role === 'admin');
    if (admins.length > 0) {
      const admin = admins[0];
      const profile = getUserProfile(admin.id);
      return profile?.full_name || admin.email;
    }
    return '';
  };

  // Get all regular users
  const users = supabaseData.users.filter(user => 
    user.role === 'user'
  );

  const filteredUsers = users.filter((user: any) => {
    const companyName = user.company_id ? getCompanyName(user.company_id) : '';
    return user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (companyName && companyName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleAddUser = async (userData: any): Promise<string | null> => {
    try {
      console.log('User creation completed successfully in modal:', userData);
      await loadUsersData();
      return null; // Success
    } catch (error) {
      console.error('Failed to add user:', error);
      return error instanceof Error ? error.message : 'Failed to add user. Please try again.';
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      // Update the user in Supabase
      await supabaseHelpers.updateUser(userData.id, {
        email: userData.userEmail,
        company_id: userData.companyId,
        role: 'user'
      });
      
      // Update profile if it exists
      try {
        const profile = await supabaseHelpers.getUserProfile(userData.id);
        if (profile) {
          await supabaseHelpers.updateUserProfile(userData.id, {
            first_name: userData.userName.split(' ')[0] || '',
            last_name: userData.userName.split(' ').slice(1).join(' ') || '',
            full_name: userData.userName,
            phone: userData.userPhone,
            department: userData.department,
            position: userData.position,
            employee_id: userData.employeeId
          });
        } else {
          await supabaseHelpers.createUserProfile({
            user_id: userData.id,
            first_name: userData.userName.split(' ')[0] || '',
            last_name: userData.userName.split(' ').slice(1).join(' ') || '',
            full_name: userData.userName,
            phone: userData.userPhone,
            department: userData.department,
            position: userData.position,
            employee_id: userData.employeeId
          });
        }
      } catch (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      setIsEditModalOpen(false);
      await loadUsersData(); // Refresh data
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete dependent records first to avoid foreign key constraint violations
      
      // Delete activity logs
      await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', selectedUser.id);
      
      // Delete podcast likes
      await supabase
        .from('podcast_likes')
        .delete()
        .eq('user_id', selectedUser.id);
      
      // Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', selectedUser.id);
      
      // Delete chat history
      await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', selectedUser.id);
      
      // Delete user course assignments
      await supabase
        .from('user_courses')
        .delete()
        .eq('user_id', selectedUser.id);
      
      // Finally delete the user
      await supabaseHelpers.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      await loadUsersData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const activeUsers = users.length;
  const totalCourses = supabaseData.courses.length;
  const uniqueCompanies = new Set(users.map((user: any) => user.company_id).filter(Boolean)).size;
  const avgCompletionHours = '24';

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
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
              onClick={loadUsersData}
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
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
              All Users
            </h2>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              Manage all system users and their access
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 action-btn"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: users.length, icon: UsersIcon, color: 'bg-[#8b5cf6]' },
            { title: 'Active Users', value: activeUsers, icon: CheckCircle, color: 'bg-[#8b5cf6]' },
            { title: 'Total Companies', value: uniqueCompanies, icon: Building2, color: 'bg-[#8b5cf6]' },
            { title: 'Avg Completion Hours', value: avgCompletionHours, icon: Clock, color: 'bg-[#8b5cf6]' }
          ].map((card, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                      <dd className="text-2xl font-semibold text-white">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1e1e1e] shadow overflow-hidden sm:rounded-md border border-[#333333]">
          <div className="px-4 py-5 sm:px-6 border-b border-[#333333]">
            <h3 className="text-lg leading-6 font-medium text-white">User Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#a0a0a0]">User Email • Company • Department • Contact • Actions</p>
          </div>
          {filteredUsers.length > 0 ? (
            <ul className="divide-y divide-[#333333]">
              {filteredUsers.map((user: any) => (
                <li key={user.id} className="px-4 py-4 hover:bg-[#252525]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-[#8b5cf6]" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-white">
                            {getUserProfile(user.id)?.full_name || user.email}
                          </p>
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {user.company_id ? 'Active' : 'Unassigned'}
                            </span>
                          </div>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                            User
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-4">
                          <div className="flex items-center text-sm text-[#a0a0a0]">
                            <Building2 className="h-4 w-4 mr-1" />
                            {user.company_id ? getCompanyName(user.company_id) : 'No Company Assigned'}
                          </div>
                          <div className="flex items-center text-sm text-[#a0a0a0]">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {getUserProfile(user.id)?.phone && (
                            <div className="flex items-center text-sm text-[#a0a0a0]">
                              <Phone className="h-4 w-4 mr-1" />
                              {getUserProfile(user.id)?.phone}
                            </div>
                          )}
                          {getUserProfile(user.id)?.department && (
                            <div className="flex items-center text-sm text-[#a0a0a0]">
                              <Building2 className="h-4 w-4 mr-1" />
                              {getUserProfile(user.id)?.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#a0a0a0]">Admin</p>
                        <p className="text-sm text-white">{getAdminName(user.company_id) || 'No Admin'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#a0a0a0]">Courses</p>
                        <p className="text-sm text-white">
                          {supabaseData.userCourses.filter((uc: any) => uc.user_id === user.id).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#a0a0a0]">Joined</p>
                        <p className="text-sm text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-blue-900/20"
                          title="Edit User"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-900/20"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-[#a0a0a0]">
              {users.length === 0 ? 'No users found. Click "Add User" to get started.' : 'No users match your search.'}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] rounded-lg shadow-xl max-w-md w-full border border-[#333333]">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Confirm Delete</h3>
                <p className="text-sm text-[#a0a0a0] mb-6">
                  Are you sure you want to delete the user <span className="font-semibold text-white">{selectedUser.email}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-[#333333] rounded-md shadow-sm text-sm font-medium text-white bg-[#252525] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal would go here */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddUser}
          companies={supabaseData.companies}
          admins={supabaseData.users.filter(user => user.role === 'admin')}
        />
        
        {/* Edit User Modal */}
        {selectedUser && (
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateUser}
            user={selectedUser}
            admins={supabaseData.users.filter(user => user.role === 'admin')}
            companies={supabaseData.companies}
          />
        )}
      </div>
    </div>
  );
}