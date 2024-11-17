import React from 'react';
import { motion } from 'framer-motion';
import { Book, Clock, Users, CheckCircle } from 'lucide-react';

const courses = [
  {
    title: 'Islamic Studies',
    description: 'Comprehensive study of Islamic principles, Quran, and Hadith',
    duration: '2 Years',
    level: 'Beginner to Advanced',
    features: [
      'Quranic Studies',
      'Islamic History',
      'Islamic Law',
      'Arabic Language',
    ],
    image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Arabic Language',
    description: 'Master Arabic language skills from basic to advanced levels',
    duration: '18 Months',
    level: 'All Levels',
    features: [
      'Grammar & Vocabulary',
      'Speaking Skills',
      'Writing Practice',
      'Literature Study',
    ],
    image: 'https://images.unsplash.com/photo-1453747063559-36695c8771bd?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Quran Memorization',
    description: 'Structured program for complete Quran memorization',
    duration: '3 Years',
    level: 'Intermediate',
    features: [
      'Tajweed Rules',
      'Memorization Techniques',
      'Regular Revision',
      'One-on-One Sessions',
    ],
    image: 'https://images.unsplash.com/photo-1584286595398-a59511d7a39e?auto=format&fit=crop&w=800&q=80',
  },
];

const Courses = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-6">
            Our Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of Islamic education programs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-emerald-800 mb-4">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center mb-4">
                  <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-600">{course.duration}</span>
                </div>
                
                <div className="flex items-center mb-6">
                  <Users className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-600">{course.level}</span>
                </div>

                <h4 className="font-semibold text-emerald-800 mb-3">
                  Course Features:
                </h4>
                <ul className="space-y-2">
                  {course.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="mt-6 w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-300">
                  Enroll Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;