import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BannerSlider from './BannerSlider';

const Banner = () => {
  return (
    <div className="relative bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center px-4 sm:px-6 lg:px-8 py-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              WELCOME TO
              <span className="block text-red-600 mt-2">SGN ACADEMY</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              We are dedicated to providing exceptional Islamic education while fostering academic excellence and character development. Join us in our journey of knowledge and faith.
            </p>
            <div className="flex space-x-4">
              <button className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors flex items-center group">
                Download Prospectus
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-red-600 text-red-600 px-6 py-3 rounded-md hover:bg-red-50 transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right Image - BannerSlider */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-xl"
          >
            <BannerSlider />
          </motion.div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#f87171_1px,transparent_1px)] opacity-20 [background-size:16px_16px] -z-10" />
    </div>
  );
};

export default Banner;