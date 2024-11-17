import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Play } from 'lucide-react';

const Gallery = () => {
  const categories = [
    { id: 'campus', label: 'Campus Life' },
    { id: 'events', label: 'Events & Programs' },
    { id: 'activities', label: 'Student Activities' },
    { id: 'facilities', label: 'Facilities' },
  ];

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      category: 'campus',
      title: 'Main Campus Building',
    },
    {
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      category: 'facilities',
      title: 'Modern Library',
    },
    {
      url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
      category: 'activities',
      title: 'Islamic Studies Class',
    },
    {
      url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&w=800&q=80',
      category: 'events',
      title: 'Annual Gathering',
    },
    {
      url: 'https://images.unsplash.com/photo-1453747063559-36695c8771bd?auto=format&fit=crop&w=800&q=80',
      category: 'activities',
      title: 'Student Workshop',
    },
    {
      url: 'https://images.unsplash.com/photo-1584286595398-a59511d7a39e?auto=format&fit=crop&w=800&q=80',
      category: 'events',
      title: 'Graduation Ceremony',
    },
  ];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1920&q=80"
            alt="Gallery"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Gallery</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our vibrant campus life and student activities through our photo gallery
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-6 py-2 rounded-full bg-white text-gray-700 hover:bg-red-600 hover:text-white transition-colors shadow-md"
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg shadow-lg bg-white"
            >
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-red-600 text-white p-3 rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ImageIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{image.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{image.category.replace('-', ' ')}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Campus Tour Video</h2>
              <p className="text-gray-600 mb-6">
                Take a virtual tour of our campus and experience the vibrant atmosphere of SGN Academy.
              </p>
              <button className="inline-flex items-center text-red-600 font-semibold group">
                <Play className="h-5 w-5 mr-2 transform group-hover:scale-110 transition-transform" />
                Watch Video
              </button>
            </div>
            <div className="relative h-72 bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80"
                alt="Campus Video Thumbnail"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transform hover:scale-110 transition-all">
                  <Play className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Gallery;