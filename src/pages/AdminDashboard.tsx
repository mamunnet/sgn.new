import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import NoticeManager from '../components/admin/NoticeManager';
import EventManager from '../components/admin/EventManager';
import AlumniManager from '../components/admin/AlumniManager';
import BannerManager from '../components/admin/BannerManager';
import TCGenerator from '../components/admin/TCGenerator';
import StudentAdmission from '../components/admin/StudentAdmission';
import StudentList from '../components/admin/StudentList';
import DashboardHome from '../components/admin/DashboardHome';
import AdminProfile from '../components/admin/AdminProfile';
import StaffManager from '../components/admin/StaffManager';
import FeesManager from '../components/admin/FeesManager';

const AdminDashboard = () => {
  const [isStudentMenuOpen, setIsStudentMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-8">
          <Link
            to="/admin"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          {/* Students Menu */}
          <div>
            <button
              onClick={() => setIsStudentMenuOpen(!isStudentMenuOpen)}
              className="w-full flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
            >
              <GraduationCap className="h-5 w-5 mr-3" />
              <span>Students</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isStudentMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isStudentMenuOpen && (
              <div className="bg-emerald-900">
                <Link
                  to="/admin/students/admission"
                  className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700 pl-14"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Admission
                </Link>
                <Link
                  to="/admin/students/list"
                  className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700 pl-14"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Students
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/admin/staff"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <UserCog className="h-5 w-5 mr-3" />
            Staff
          </Link>

          <Link
            to="/admin/fees"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Fees
          </Link>

          <Link
            to="/admin/banners"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <Image className="h-5 w-5 mr-3" />
            Banners
          </Link>
          
          <Link
            to="/admin/notices"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <Bell className="h-5 w-5 mr-3" />
            Notices
          </Link>
          
          <Link
            to="/admin/events"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <Calendar className="h-5 w-5 mr-3" />
            Events
          </Link>
          
          <Link
            to="/admin/alumni"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <Users className="h-5 w-5 mr-3" />
            Alumni
          </Link>
          
          <Link
            to="/admin/tc-generator"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <FileText className="h-5 w-5 mr-3" />
            TC Generator
          </Link>

          <Link
            to="/admin/profile"
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700"
          >
            <Settings className="h-5 w-5 mr-3" />
            Profile Settings
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-emerald-100 hover:bg-emerald-700 w-full"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/banners" element={<BannerManager />} />
            <Route path="/notices" element={<NoticeManager />} />
            <Route path="/events" element={<EventManager />} />
            <Route path="/alumni" element={<AlumniManager />} />
            <Route path="/tc-generator" element={<TCGenerator />} />
            <Route path="/students/admission" element={<StudentAdmission />} />
            <Route path="/students/list" element={<StudentList />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/staff" element={<StaffManager />} />
            <Route path="/fees" element={<FeesManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;