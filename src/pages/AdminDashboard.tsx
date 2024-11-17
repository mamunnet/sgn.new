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
  UserCog,
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Verify admin access
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
            to=""
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('') ? 'bg-white/20' : ''
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          {/* Students Menu */}
          <div>
            <button
              onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
              className={`w-full flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
                location.pathname.includes('students') ? 'bg-white/20' : ''
              }`}
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              <span>Students</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isStudentMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isStudentMenuOpen && (
              <div className="bg-black/10">
                <Link
                  to="students/admission"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('students/admission') ? 'bg-white/20' : ''
                  }`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Admission
                </Link>
                <Link
                  to="students/list"
                  className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 pl-14 ${
                    isActive('students/list') ? 'bg-white/20' : ''
                  }`}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Students
                </Link>
              </div>
            )}
          </div>

          <Link
            to="staff"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('staff') ? 'bg-white/20' : ''
            }`}
          >
            <UserCog className="h-5 w-5 mr-3" />
            Staff
          </Link>

          <Link
            to="fees"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('fees') ? 'bg-white/20' : ''
            }`}
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Fees
          </Link>

          <Link
            to="banners"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('banners') ? 'bg-white/20' : ''
            }`}
          >
            <Image className="h-5 w-5 mr-3" />
            Banners
          </Link>
          
          <Link
            to="notices"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('notices') ? 'bg-white/20' : ''
            }`}
          >
            <Bell className="h-5 w-5 mr-3" />
            Notices
          </Link>
          
          <Link
            to="events"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('events') ? 'bg-white/20' : ''
            }`}
          >
            <Calendar className="h-5 w-5 mr-3" />
            Events
          </Link>
          
          <Link
            to="alumni"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('alumni') ? 'bg-white/20' : ''
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            Alumni
          </Link>
          
          <Link
            to="tc-generator"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('tc-generator') ? 'bg-white/20' : ''
            }`}
          >
            <FileText className="h-5 w-5 mr-3" />
            TC Generator
          </Link>

          <Link
            to="profile"
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors ${
              isActive('profile') ? 'bg-white/20' : ''
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Profile Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-white/90 hover:bg-white/10 transition-colors w-full"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;