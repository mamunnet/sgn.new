import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import BannerSlider from './BannerSlider';

const Banner = () => {
  const [showModal, setShowModal] = useState(false);

  const heroContent = {
    title: "Welcome to SGN Academy",
    mainContent: [
      "SGN Academy stands as a beacon of educational excellence, where traditional Islamic values meet modern academic pursuits. Our institution is committed to nurturing well-rounded individuals who excel both in their spiritual journey and academic endeavors.",
      "Our comprehensive approach to education encompasses:",
      "• Strong Foundation in Islamic Studies",
      "• Excellence in Academic Education",
      "• Character Development",
      "• Leadership Skills",
      "• Extra-Curricular Activities",
      "• Community Engagement",
      "At SGN Academy, we believe that true education goes beyond textbooks. We focus on developing:",
      "• Critical Thinking Skills",
      "• Moral Values",
      "• Cultural Awareness",
      "• Social Responsibility",
      "• Personal Growth",
      "Our dedicated faculty members are committed to providing personalized attention and guidance to each student, ensuring their success in both academic and spiritual pursuits."
    ]
  };

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
              <button 
                onClick={() => setShowModal(true)}
                className="border-2 border-red-600 text-red-600 px-6 py-3 rounded-md hover:bg-red-50 transition-colors"
              >
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{heroContent.title}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="prose prose-red max-w-none">
                  {heroContent.mainContent.map((paragraph, index) => (
                    <p key={index} className="text-gray-600 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Banner;