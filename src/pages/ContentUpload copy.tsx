import React, { useState } from 'react';
import { Upload, BookOpen, Headphones, FileText, Plus, Search, Play, X, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ContentUpload() {
  const [selectedCategory, setSelectedCategory] = useState('Books');
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'podcast' | 'document' | 'quiz'>('podcast');
  const [courses, setCourses] = useLocalStorage('courses', []);
  const [assignments, setAssignments] = useLocalStorage('assignments', []);
  const [companies] = useLocalStorage('companies', []);
  
  // Assignment form state
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const categories = ['Books', 'HBR', 'TED Talks', 'Concept', 'Role Play', 'Quizzes'];

  // Get counts for different content types
  const totalCourses = courses.length;
  const totalPodcasts = courses.filter((course: any) => course.fileType === 'MP3').length;
  const totalDocuments = courses.filter((course: any) => course.fileType === 'PDF').length;
  const totalQuizzes = courses.filter((course: any) => course.fileType === 'QUIZ').length;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!contentTitle || !selectedFile) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    // Determine file type based on content type and file extension
    let fileType = selectedFile.name.split('.').pop()?.toUpperCase() as 'MP3' | 'MP4' | 'PDF' | 'MOV' | 'QUIZ';
    if (contentType === 'quiz') {
      fileType = 'QUIZ';
    }
    
    const newCourse = {
      id: Date.now().toString(),
      title: contentTitle,
      description: contentDescription,
      category: selectedCategory,
      uploadedBy: 'Super Admin',
      uploadDate: new Date(),
      duration: 0,
      enrollments: 0,
      completions: 0,
      isActive: true,
      fileType: fileType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    };
    
    setCourses([...courses, newCourse]);
    alert('Content uploaded successfully!');
    
    // Reset form
    setContentTitle('');
    setContentDescription('');
    setSelectedFile(null);
  };

  const handleCreateAssignment = () => {
    if (!assignmentTitle || !selectedCompanyId || selectedCourses.length === 0) {
      alert('Please fill in all required fields and select at least one course');
      return;
    }

    const selectedCompany = companies.find((c: any) => c.id === selectedCompanyId);
    
    const newAssignment = {
      id: Date.now().toString(),
      title: assignmentTitle,
      description: assignmentDescription,
      companyId: selectedCompanyId,
      companyName: selectedCompany?.companyName || '',
      adminId: selectedCompany?.adminId || '',
      adminName: selectedCompany?.adminName || '',
      adminEmail: selectedCompany?.adminEmail || '',
      selectedCourses: selectedCourses,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active'
    };

    setAssignments([...assignments, newAssignment]);
    alert('Assignment created successfully!');

    // Reset assignment form
    setAssignmentTitle('');
    setAssignmentDescription('');
    setSelectedCompanyId('');
    setSelectedCourses([]);
  };

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const filteredCourses = courses.filter((course: any) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const coursesByCategory = categories.reduce((acc, category) => {
    acc[category] = courses.filter((course: any) => course.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  const totalCourses = courses.length;
  const totalPodcasts = courses.filter((course: any) => course.fileType === 'MP3').length;
  const totalDocuments = courses.filter((course: any) => course.fileType === 'PDF').length;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Content Upload
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage and upload learning content across different categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Total Courses Uploaded', value: totalCourses, icon: BookOpen, color: 'bg-green-500' },
            { title: 'No. of Podcasts', value: totalPodcasts, icon: Headphones, color: 'bg-blue-500' },
            { title: 'Documents', value: totalDocuments, icon: FileText, color: 'bg-purple-500' },
            { title: 'Quizzes', value: totalQuizzes, icon: BookMarked, color: 'bg-yellow-500' }
          ].map((card, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-500 rounded-md p-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Quizzes</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{totalQuizzes}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Content Form</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Content Category
                  </label>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as 'podcast' | 'document' | 'quiz')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 mb-4"
                  >
                    <option value="podcast">Podcast</option>
                    <option value="document">Document</option>
                    <option value="quiz">Quiz</option>
                  </select>
                  
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Content Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter content description"
                  />
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload *
                  </label>
                  {contentType === 'podcast' && (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Headphones className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-podcast" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                            <span>Upload a podcast</span>
                            <input 
                              id="file-upload-podcast" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept=".mp3,.mp4,.mov"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">MP3, MP4, MOV files supported</p>
                        {selectedFile && (
                          <p className="text-sm text-green-600 font-medium">{selectedFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {contentType === 'document' && (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-document" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                            <span>Upload a document</span>
                            <input 
                              id="file-upload-document" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT files supported</p>
                        {selectedFile && (
                          <p className="text-sm text-green-600 font-medium">{selectedFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {contentType === 'quiz' && (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload-quiz" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                            <span>Upload a quiz</span>
                            <input 
                              id="file-upload-quiz" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept=".json"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">JSON quiz format supported</p>
                        {selectedFile && (
                          <p className="text-sm text-green-600 font-medium">{selectedFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setContentTitle('');
                      setContentDescription('');
                      setSelectedFile(null);
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>

            {/* Category Statistics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content by Category</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">{coursesByCategory[category] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Content</h3>
                  <div className="relative">
                    <Search className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {filteredCourses.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredCourses.map((course: any) => (
                    <div key={course.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              {course.fileType === 'MP3' && <Headphones className="h-5 w-5 text-green-600" />}
                              {course.fileType === 'MP4' && <Play className="h-5 w-5 text-green-600" />}
                              {course.fileType === 'PDF' && <FileText className="h-5 w-5 text-green-600" />}
                            {course.fileType === 'MOV' && <Play className="h-5 w-5 text-green-600" />}
                             {course.fileType === 'QUIZ' && <BookOpen className="h-5 w-5 text-green-600" />}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{course.title}</p>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {course.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{course.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500">Type</p>
                            <p className="text-sm text-gray-900">{course.fileType}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500">Uploaded</p>
                            <p className="text-sm text-gray-900">
                              {new Date(course.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  {courses.length === 0 ? 'No content uploaded yet' : 'No content matches your search'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Create Assignment Form</h3>
          <p className="text-sm text-gray-600 mb-6">Assign Content to Organization and Set Learning Objectives</p>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                id="assignment-title"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter assignment title"
              />
            </div>

            <div>
              <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Description
              </label>
              <textarea
                id="assignment-description"
                rows={3}
                value={assignmentDescription}
                onChange={(e) => setAssignmentDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter assignment description and learning objectives"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Select Company Name *
              </label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Choose a company...</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Content *
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {courses.length > 0 ? (
                  courses.map((course: any) => (
                    <div key={course.id} className="flex items-center">
                      <input
                        id={`course-${course.id}`}
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseSelection(course.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`course-${course.id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{course.title}</p>
                            <p className="text-xs text-gray-500">{course.category} • {course.fileType}</p>
                          </div>
                          {selectedCourses.includes(course.id) && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No courses available. Please upload content first.
                  </div>
                )}
              </div>
              {selectedCourses.length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  {selectedCourses.length} course(s) selected
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAssignmentTitle('');
                  setAssignmentDescription('');
                  setSelectedCompanyId('');
                  setSelectedCourses([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAssignment}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}