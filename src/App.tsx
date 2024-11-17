import type { FC } from 'react';
import { useEffect } from 'react';
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
import StaffGallery from './pages/StaffGallery';
import Feedback from './pages/Feedback';
import Admission from './pages/Admission';
import FeesStructure from './pages/FeesStructure';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: FC = () => {
  useEffect(() => {
    // Initialize AOS
    try {
      AOS.init({
        duration: 1000,
        once: true,
      });
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }

    // Log environment check
    console.log('Environment Check:', {
      nodeEnv: process.env.NODE_ENV,
      hasFirebaseKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      baseUrl: window.location.origin,
    });
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/admission" element={<Admission />} />
                <Route path="/fees" element={<FeesStructure />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/staff" element={<StaffGallery />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;