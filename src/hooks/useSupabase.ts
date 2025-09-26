import React from 'react';
import { supabase } from '../lib/supabase';

// Custom hook for real-time data syncing
export const useRealtimeSync = (tableName: string, callback: () => void) => {
  React.useEffect(() => {
    const eventName = `supabase-${tableName.replace('_', '-')}-changed`;
    
    const handleChange = (event: CustomEvent) => {
      console.log(`🔄 Handling ${tableName} change:`, event.detail);
      callback();
    };
    
    window.addEventListener(eventName, handleChange as EventListener);
    
    return () => {
      window.removeEventListener(eventName, handleChange as EventListener);
    };
  }, [tableName, callback]);
};

// Helper functions for Supabase operations
export const supabaseHelpers = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // User operations
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get users with RLS policies applied
  getUsersWithRLS: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Get current user's role and company
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('role, company_id')
      .eq('id', user.id)
      .single();
    
    if (userError) throw userError;
    
    let query = supabase.from('users').select('*');
    
    // Apply role-based filtering
    if (currentUser.role === 'admin') {
      // Admins can only see users in their company
      query = query.eq('company_id', currentUser.company_id);
    } else if (currentUser.role === 'user') {
      // Users can only see themselves
      query = query.eq('id', user.id);
    }
    // Super admins can see all users (no additional filter)
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getUsersByCompany: async (companyId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createUser: async (userData: any) => {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateUser: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  },

  // Company operations
  getCompanies: async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createCompany: async (companyData: any) => {
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateCompany: async (companyId: string, updates: any) => {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteCompany: async (companyId: string) => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    
    if (error) throw error;
  },

  // Course operations
  getCourses: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createCourse: async (courseData: any) => {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateCourse: async (courseId: string, updates: any) => {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteCourse: async (courseId: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    if (error) throw error;
  },

  // Podcast operations
  getPodcasts: async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createPodcast: async (podcastData: any) => {
    const { data, error } = await supabase
      .from('podcasts')
      .insert(podcastData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // PDF operations
  getPDFs: async () => {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createPDF: async (pdfData: any) => {
    const { data, error } = await supabase
      .from('pdfs')
      .insert(pdfData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Quiz operations
  getQuizzes: async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createQuiz: async (quizData: any) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Content category operations
  getContentCategories: async () => {
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getCategories: async () => {
    return supabaseHelpers.getContentCategories();
  },

  createContentCategory: async (categoryData: any) => {
    const { data, error } = await supabase
      .from('content_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User profile operations
  getAllUserProfiles: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  createUserProfile: async (profileData: any) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User course operations
  getAllUserCourses: async () => {
    const { data, error } = await supabase
      .from('user_courses')
      .select('*')
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Podcast assignment operations
  getAllPodcastAssignments: async () => {
    const { data, error } = await supabase
      .from('podcast_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createPodcastAssignment: async (assignmentData: any) => {
    const { data, error } = await supabase
      .from('podcast_assignments')
      .insert(assignmentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getUserCourses: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_courses')
      .select(`
        *,
        courses (
          id,
          title,
          description,
          company_id,
          image_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Podcast progress operations
  getAllPodcastProgress: async () => {
    const { data, error } = await supabase
      .from('podcast_progress')
      .select('*')
      .order('last_played_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  savePodcastProgress: async (userId: string, podcastId: string, currentTime: number, duration: number) => {
    const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
    
    const { error } = await supabase
      .from('podcast_progress')
      .upsert({
        user_id: userId,
        podcast_id: podcastId,
        playback_position: currentTime,
        duration: duration,
        progress_percent: progressPercent,
        last_played_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,podcast_id'
      });
    
    if (error) throw error;
  },

  savePodcastProgressWithRetry: async (userId: string, podcastId: string, currentTime: number, duration: number, progressPercent: number, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { error } = await supabase
          .from('podcast_progress')
          .upsert({
            user_id: userId,
            podcast_id: podcastId,
            playback_position: currentTime,
            duration: duration,
            progress_percent: progressPercent,
            last_played_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,podcast_id'
          });
        
        if (error) throw error;
        return; // Success, exit retry loop
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  },

  calculateUserLearningMetrics: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_current_user_metrics');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const metrics = data[0];
        return {
          totalHours: parseFloat(metrics.total_hours) || 0,
          completedCourses: parseInt(metrics.completed_courses) || 0,
          inProgressCourses: parseInt(metrics.in_progress_courses) || 0,
          averageCompletion: parseFloat(metrics.average_completion) || 0
        };
      }
      
      return {
        totalHours: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageCompletion: 0
      };
    } catch (error) {
      console.error('Error calculating user metrics:', error);
      return {
        totalHours: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageCompletion: 0
      };
    }
  },

  // Logo operations
  getLogos: async (companyId?: string) => {
    let query = supabase
      .from('logos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  createLogo: async (logoData: any) => {
    const { data, error } = await supabase
      .from('logos')
      .insert(logoData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteLogo: async (logoId: string) => {
    const { error } = await supabase
      .from('logos')
      .delete()
      .eq('id', logoId);
    
    if (error) throw error;
  },

  // File upload operations
  uploadFile: async (bucket: string, fileName: string, file: File) => {
    console.log(`Uploading file to bucket: ${bucket}, fileName: ${fileName}`);
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log(`File uploaded successfully. Public URL: ${publicUrl}`);
    return { data, publicUrl };
  },

  // Temporary passwords operations
  getTempPasswords: async () => {
    const { data, error } = await supabase
      .from('temp_passwords')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createTempPassword: async (tempPasswordData: any) => {
    const { data, error } = await supabase
      .from('temp_passwords')
      .insert(tempPasswordData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  markTempPasswordAsUsed: async (tempPasswordId: string) => {
    const { data, error } = await supabase
      .from('temp_passwords')
      .update({ is_used: true })
      .eq('id', tempPasswordId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteTempPassword: async (tempPasswordId: string) => {
    const { error } = await supabase
      .from('temp_passwords')
      .delete()
      .eq('id', tempPasswordId);
    
    if (error) throw error;
  },

  // User registration operations
  getUserRegistrations: async () => {
    const { data, error } = await supabase
      .from('user_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  approveUserRegistration: async (registrationId: string, action: string, companyId?: string, notes?: string) => {
    const { data, error } = await supabase.rpc('approve_user_registration', {
      registration_id_param: registrationId,
      action_param: action,
      company_id_param: companyId,
      notes_param: notes
    });
    
    if (error) throw error;
    return data;
  },

  rejectUserRegistration: async (registrationId: string, notes?: string) => {
    const { data, error } = await supabase.rpc('reject_user_registration', {
      registration_id_param: registrationId,
      notes_param: notes
    });
    
    if (error) throw error;
    return data;
  }
};