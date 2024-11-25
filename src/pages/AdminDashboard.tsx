import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Bell, 
  Calendar, 
  Users, 
  LogOut, 
  Image, 
  FileText,
  ChevronDown,
  GraduationCap,
  UserPlus,
  ClipboardList,
  Settings,
  DollarSign,
  ImageIcon,
  BookOpen,
  School,
  FolderKanban
} from 'lucide-react';

const AdminDashboard = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    students: false,
    academic: false,
    content: false
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
      navigate('/sgnadminpanel');
      toast.error('Unauthorized access');
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      navigate('/sgnadminpanel');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname.split('/sgnadminpanel/')[1] || '';
    return currentPath === path;
  };

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gradient-start to-gradient-end text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-white/70">{user?.email}</p>
        </div>

        <nav className="mt-8">
          <Link
            to="dashboard"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('dashboard') ? 'bg-white/20' : ''
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          {/* Students Menu */}
          <div>
            <button
              onClick={() => toggleMenu('students')}
              className={`w-full flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
                location.pathname.includes('student-') ? 'bg-white/20' : ''
              }`}
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              <span>Students</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openMenus.students ? 'rotate-180' : ''}`} />
            </button>
            
            {openMenus.students && (
              <div className="bg-black/10">
                <Link
                  to="student-admission"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('student-admission') ? 'bg-white/20' : ''
                  }`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Admission
                </Link>
                <Link
                  to="student-list"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('student-list') ? 'bg-white/20' : ''
                  }`}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Students
                </Link>
              </div>
            )}
          </div>

          {/* Academic Menu */}
          <div>
            <button
              onClick={() => toggleMenu('academic')}
              className={`w-full flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
                location.pathname.includes('academic-') ? 'bg-white/20' : ''
              }`}
            >
              <School className="h-5 w-5 mr-3" />
              <span>Academic</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openMenus.academic ? 'rotate-180' : ''}`} />
            </button>
            
            {openMenus.academic && (
              <div className="bg-black/10">
                <Link
                  to="classes"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('classes') ? 'bg-white/20' : ''
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Classes
                </Link>
                <Link
                  to="tc-generator"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('tc-generator') ? 'bg-white/20' : ''
                  }`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  TC Generator
                </Link>
                <Link
                  to="fees-manager"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('fees-manager') ? 'bg-white/20' : ''
                  }`}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Fees
                </Link>
              </div>
            )}
          </div>

          {/* Content Menu */}
          <div>
            <button
              onClick={() => toggleMenu('content')}
              className={`w-full flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
                location.pathname.includes('content-') ? 'bg-white/20' : ''
              }`}
            >
              <FolderKanban className="h-5 w-5 mr-3" />
              <span>Content</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openMenus.content ? 'rotate-180' : ''}`} />
            </button>
            
            {openMenus.content && (
              <div className="bg-black/10">
                <Link
                  to="banner"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('banner') ? 'bg-white/20' : ''
                  }`}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Banners
                </Link>
                <Link
                  to="notice"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('notice') ? 'bg-white/20' : ''
                  }`}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notices
                </Link>
                <Link
                  to="events"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('events') ? 'bg-white/20' : ''
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Link>
                <Link
                  to="gallery-manager"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('gallery-manager') ? 'bg-white/20' : ''
                  }`}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </Link>
                <Link
                  to="staff-manager"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('staff-manager') ? 'bg-white/20' : ''
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Staff
                </Link>
                <Link
                  to="alumni"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('alumni') ? 'bg-white/20' : ''
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Alumni
                </Link>
              </div>
            )}
          </div>

          <Link
            to="admin-profile"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('admin-profile') ? 'bg-white/20' : ''
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;