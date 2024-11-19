import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { title: 'HOME', path: '/' },
    { title: 'ABOUT US', path: '/about' },
    { title: 'ADMISSION', path: '/admission' },
    { title: 'PAY FEES', path: '/student-fees' },
    { title: 'STAFF', path: '/staff-gallery' },
    { title: 'GALLERY', path: '/gallery' },
    { title: 'CONTACT', path: '/contact' },
    { title: 'FEEDBACK', path: '/feedback' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-gradient-start via-gradient-middle to-gradient-end text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end space-x-4 text-sm">
            <a href="tel:+1234567890" className="hover:text-accent-blue transition-colors">+1 234 567 890</a>
            <span>|</span>
            <a href="mailto:info@sgnacademy.com" className="hover:text-accent-blue transition-colors">info@sgnacademy.com</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://cdn.jsdelivr.net/gh/mamunnet/sgn_academy@32a228d99eda383a1e5ce39ca8f143b62a0ef4c6/public/assets/logo.png" 
              alt="SGN Academy" 
              className="h-12 w-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/logo.png';
              }}
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
                SGN Academy
              </h1>
              <p className="text-sm text-gray-600">Excellence in Education</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-accent-blue font-semibold'
                    : 'hover:text-accent-blue'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium transition-colors px-4 py-2 rounded-md ${
                    isActive(item.path)
                      ? 'bg-accent-blue/10 text-accent-blue font-semibold'
                      : 'hover:bg-gray-50 hover:text-accent-blue'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;