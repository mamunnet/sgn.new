import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: 'HOME', path: '/' },
    { title: 'ABOUT US', path: '/about' },
    { title: 'ADMISSION', path: '/admission' },
    { title: 'GALLERY', path: '/gallery' },
    { title: 'STAFF', path: '/staff' },
    { title: 'CONTACT', path: '/contact' },
    { title: 'FEEDBACK', path: '/feedback' },
  ];

  return (
    <header className="bg-white">
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end space-x-4 text-sm">
            <a href="tel:+1234567890" className="hover:text-gray-200">+1 234 567 890</a>
            <span>|</span>
            <a href="mailto:info@sgnacademy.com" className="hover:text-gray-200">info@sgnacademy.com</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-4">
              <img 
                src="https://cdn.jsdelivr.net/gh/mamunnet/sgn_academy@32a228d99eda383a1e5ce39ca8f143b62a0ef4c6/public/assets/logo.png" 
                alt="SGN Academy" 
                className="h-20 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SGN ACADEMY</h1>
                <p className="text-sm text-gray-600">Excellence in Islamic Education</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.path}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-red-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b">
          <nav className="px-4 pt-2 pb-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;