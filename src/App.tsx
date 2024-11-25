import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Gallery from './pages/Gallery';
import Feedback from './pages/Feedback';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Admission from './pages/Admission';
import StaffGallery from './pages/StaffGallery';
import StudentFees from './pages/StudentFees';

// Admin Components
import DashboardHome from './components/admin/DashboardHome';
import NoticeManager from './components/admin/NoticeManager';
import EventManager from './components/admin/EventManager';
import AlumniManager from './components/admin/AlumniManager';
import BannerManager from './components/admin/BannerManager';
import TCGenerator from './components/admin/TCGenerator';
import StudentAdmission from './components/admin/StudentAdmission';
import StudentList from './components/admin/StudentList';
import AdminProfile from './components/admin/AdminProfile';
import StaffManager from './components/admin/StaffManager';
import FeesManager from './components/admin/FeesManager';
import StudentView from './components/admin/StudentView';
import TCPreview from './components/admin/TCPreview';
import GalleryManager from './components/admin/GalleryManager';
import ClassManager from './components/admin/ClassManager';

const App: React.FC = () => {
  useEffect(() => {
    try {
      AOS.init({
        duration: 1000,
        once: true,
      });
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div 
            className="min-h-screen flex flex-col bg-gradient-to-br from-gradient-start via-gradient-middle to-gradient-end"
            style={{
              '--gradient-start': '#1a365d',
              '--gradient-middle': '#2d3748',
              '--gradient-end': '#742a2a',
            } as React.CSSProperties}
          >
            <div className="absolute inset-0 bg-gradient-radial from-accent-blue/10 via-accent-purple/5 to-transparent animate-gradient pointer-events-none" />
            <Toaster position="top-center" />
            <Navbar />
            <main className="flex-grow relative z-10">
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/admission" element={<Admission />} />
                  <Route path="/staff-gallery" element={<StaffGallery />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/student-fees" element={<StudentFees />} />

                  {/* Admin Routes */}
                  <Route path="/sgnadminpanel" element={<AdminLogin />} />
                  <Route
                    path="/sgnadminpanel/*"
                    element={
                      <ProtectedRoute>
                        <Routes>
                          <Route element={<AdminDashboard />}>
                            <Route path="dashboard" element={<DashboardHome />} />
                            <Route path="notice" element={<NoticeManager />} />
                            <Route path="events" element={<EventManager />} />
                            <Route path="alumni" element={<AlumniManager />} />
                            <Route path="banner" element={<BannerManager />} />
                            <Route path="tc-generator" element={<TCGenerator />} />
                            <Route path="student-admission" element={<StudentAdmission />} />
                            <Route path="student-list" element={<StudentList />} />
                            <Route path="admin-profile" element={<AdminProfile />} />
                            <Route path="staff-manager" element={<StaffManager />} />
                            <Route path="fees-manager" element={<FeesManager />} />
                            <Route path="student-view/:id" element={<StudentView />} />
                            <Route path="tc-preview/:id" element={<TCPreview />} />
                            <Route path="gallery-manager" element={<GalleryManager />} />
                            <Route path="classes" element={<ClassManager />} />
                          </Route>
                        </Routes>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;