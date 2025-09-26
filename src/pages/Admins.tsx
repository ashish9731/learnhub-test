import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCog, Building2, BookOpen, Phone, Mail, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import AddAdminModal from '../components/Forms/AddAdminModal';
import EditAdminModal from '../components/Forms/EditAdminModal';
import { supabaseHelpers } from '../hooks/useSupabase';
import { useRealtimeSync } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';

export default function Admins() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [supabaseData, setSupabaseData] = useState({
    companies: [],
    users: [],
    courses: [],
    userProfiles: [],
    userCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminsData = async () => {
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
      console.error('Failed to load admins data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admins data');
    } finally {
      setLoading(false);
    }
  };

  // Real-time sync for all relevant tables
  useRealtimeSync('users', loadAdminsData);
  useRealtimeSync('user-profiles', loadAdminsData);
  useRealtimeSync('companies', loadAdminsData);
  useRealtimeSync('courses', loadAdminsData);
  useRealtimeSync('user-courses', loadAdminsData);
  useRealtimeSync('podcasts', loadAdminsData);
  useRealtimeSync('pdfs', loadAdminsData);
  useRealtimeSync('quizzes', loadAdminsData);
  useRealtimeSync('content-categories', loadAdminsData);
  useRealtimeSync('podcast-assignments', loadAdminsData);
  useRealtimeSync('podcast-progress', loadAdminsData);
  useRealtimeSync('podcast-likes', loadAdminsData);
  useRealtimeSync('logos', loadAdminsData);
  useRealtimeSync('activity-logs', loadAdminsData);
  useRealtimeSync('temp-passwords', loadAdminsData);
  useRealtimeSync('user-registrations', loadAdminsData);
  useRealtimeSync('approval-logs', loadAdminsData);
  useRealtimeSync('audit-logs', loadAdminsData);
  useRealtimeSync('chat-history', loadAdminsData);
  useRealtimeSync('contact-messages', loadAdminsData);

  useEffect(() => {
    loadAdminsData();
  }, []);
  
  const getAdminProfile = (adminId: string) => {
    return supabaseData.userProfiles.find(profile => profile.user_id === adminId);
  };


  const getCompanyName = (companyId: string) => {
    const company = supabaseData.companies.find(c => c.id === companyId);
    return company ? company.name : '';
  };

  // Get all admin users
  const admins = supabaseData.users.filter(user => 
    user.role === 'admin'
  );

  const filteredAdmins = admins.filter((admin: any) => {
    const companyName = admin.company_id ? getCompanyName(admin.company_id) : '';
    return admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (companyName && companyName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleAddAdmin = async (adminData: any) => {
    try {
      // The actual Supabase operations are now handled in the AddAdminModal component
      // Here we just need to refresh the data
      await loadAdminsData();
    } catch (error) {
      console.error('Failed to add admin:', error);
      alert('Failed to add admin. Please try again.');
    }
  };

  const handleEditAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (adminData: any) => {
    try {
      // Update the admin in Supabase
      await supabaseHelpers.updateUser(adminData.id, {
        email: adminData.adminEmail,
        company_id: adminData.companyId,
        role: 'admin'
      });
      
      // Update profile if it exists
      try {
        const profile = await supabaseHelpers.getUserProfile(adminData.id);
        if (profile) {
          await supabaseHelpers.updateUserProfile(adminData.id, {
            first_name: adminData.adminName.split(' ')[0] || '',
            last_name: adminData.adminName.split(' ').slice(1).join(' ') || '',
            full_name: adminData.adminName,
            phone: adminData.adminPhone,
            department: adminData.department
          });
        } else {
          await supabaseHelpers.createUserProfile({
            user_id: adminData.id,
            first_name: adminData.adminName.split(' ')[0] || '',
            last_name: adminData.adminName.split(' ').slice(1).join(' ') || '',
            full_name: adminData.adminName,
            phone: adminData.adminPhone,
            department: adminData.department
          });
        }
      } catch (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      setIsEditModalOpen(false);
      await loadAdminsData(); // Refresh data
    } catch (error) {
      console.error('Failed to update admin:', error);
      alert('Failed to update admin. Please try again.');
    }
  };

  const handleDeleteClick = (admin: any) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      // Delete dependent records first to avoid foreign key constraint violations
      
      // Delete activity logs
      await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', selectedAdmin.id);
      
      // Delete podcast likes
      await supabase
        .from('podcast_likes')
        .delete()
        .eq('user_id', selectedAdmin.id);
      
      // Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', selectedAdmin.id);
      
      // Delete chat history
      await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', selectedAdmin.id);
      
      // Delete user course assignments
      await supabase
        .from('user_courses')
        .delete()
        .eq('user_id', selectedAdmin.id);
      
      // Finally delete the user
      await supabaseHelpers.deleteUser(selectedAdmin.id);
      setIsDeleteModalOpen(false);
      await loadAdminsData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete admin:', error);
      alert('Failed to delete admin. Please try again.');
    }
  };

  const activeAdmins = admins.length;
  const totalCourses = supabaseData.courses.length;
  const uniqueCompanies = new Set(admins.map((admin: any) => admin.company_id).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading admins...</p>
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
              onClick={loadAdminsData}
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
              All Admins
            </h2>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              Manage all system administrators and their access
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 action-btn"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Admin
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Admins', value: admins.length, icon: UserCog, color: 'bg-[#8b5cf6]' },
            { title: 'Active Admins', value: activeAdmins, icon: CheckCircle, color: 'bg-[#8b5cf6]' },
            { title: 'Total Companies', value: uniqueCompanies, icon: Building2, color: 'bg-[#8b5cf6]' },
            { title: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'bg-[#8b5cf6]' }
          ].map((card, index) => (
            <div key={index} className="bg-[#1e1e1e] overflow-hidden shadow rounded-lg border border-[#333333]">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#a0a0a0] truncate">{card.title}</dt>
                      <dd className="text-lg font-medium text-white">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1e1e1e] shadow overflow-hidden sm:rounded-md border border-[#333333]">
          <div className="px-4 py-5 sm:px-6 border-b border-[#333333]">
            <h3 className="text-lg leading-6 font-medium text-white">Admin Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#a0a0a0]">Admin Name • Company Name • Courses • Contact</p>
          </div>
          {filteredAdmins.length > 0 ? (
            <ul className="divide-y divide-[#333333]">
              {filteredAdmins.map((admin: any) => (
                <li key={admin.id} className="px-4 py-4 hover:bg-[#252525]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                          <UserCog className="h-6 w-6 text-[#8b5cf6]" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-white">
                            {getAdminProfile(admin.id)?.full_name || admin.email}
                          </p>
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {admin.company_id ? 'Active' : 'Unassigned'}
                            </span>
                          </div>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
                            Admin
                          </span>
                        </div>
                        <div className="flex items-center mt-1 space-x-4">
                          <div className="flex items-center text-sm text-[#a0a0a0]">
                            <Building2 className="h-4 w-4 mr-1" />
                            {admin.company_id ? getCompanyName(admin.company_id) : 'No Company Assigned'}
                          </div>
                          <div className="flex items-center text-sm text-[#a0a0a0]">
                            <Mail className="h-4 w-4 mr-1" />
                            {admin.email}
                          </div>
                          {getAdminProfile(admin.id)?.phone && (
                            <div className="flex items-center text-sm text-[#a0a0a0]">
                              <Phone className="h-4 w-4 mr-1" />
                              {getAdminProfile(admin.id)?.phone}
                            </div>
                          )}
                          {getAdminProfile(admin.id)?.department && (
                            <div className="flex items-center text-sm text-[#a0a0a0]">
                              <Building2 className="h-4 w-4 mr-1" />
                              {getAdminProfile(admin.id)?.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#a0a0a0]">Courses</p>
                        <p className="text-sm text-white">
                          {supabaseData.userCourses.filter((uc: any) => {
                            const user = supabaseData.users.find((u: any) => u.id === uc.user_id);
                            return user && user.company_id === admin.company_id;
                          }).length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#a0a0a0]">Joined</p>
                        <p className="text-sm text-white">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-blue-900/20"
                          title="Edit Admin"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(admin)}
                          className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-red-900/20"
                          title="Delete Admin"
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
              {admins.length === 0 ? 'No admins found. Click "Add Admin" to get started.' : 'No admins match your search.'}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e1e1e] rounded-lg shadow-xl max-w-md w-full border border-[#333333]">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white mb-4">Confirm Delete</h3>
                <p className="text-sm text-[#a0a0a0] mb-6">
                  Are you sure you want to delete the admin <span className="font-semibold text-white">{selectedAdmin.email}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-[#333333] rounded-md shadow-sm text-sm font-medium text-white bg-[#252525] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAdmin}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAdmin}
          companies={supabaseData.companies}
        />

        {selectedAdmin && (
          <EditAdminModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateAdmin}
            admin={selectedAdmin}
            companies={supabaseData.companies}
          />
        )}
      </div>
    </div>
  );
}