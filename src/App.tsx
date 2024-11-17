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
import StaffGallery from './pages/StaffGallery';
import Feedback from './pages/Feedback';
import Admission from './pages/Admission';
import FeesStructure from './pages/FeesStructure';
import ProtectedRoute from './components/ProtectedRoute';

// Add error tracking
const logError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Application Error:', error);
  console.error('Error Info:', errorInfo);
};

function App() {
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
  );
}

export default App;