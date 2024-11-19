import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, X } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import DynamicNoticeBoard from './DynamicNoticeBoard';
import SectionHeading from './SectionHeading';

const Welcome = () => {
  const [statsRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [showModal, setShowModal] = useState(false);

  const stats = [
    { count: 1000, label: 'Students', suffix: '+' },
    { count: 25, label: 'Programs', suffix: '+' },
    { count: 50, label: 'Years Legacy', suffix: '+' },
    { count: 100, label: 'Success Rate', suffix: '%' },
  ];

  const fullMessage = {
    title: "Welcome to SGN Academy",
    subtitle: "A Legacy of Excellence in Islamic Education",
    mainContent: [
      "At SGN Academy, we believe in nurturing not just students, but future leaders who embody Islamic values while excelling in contemporary education. Our unique approach combines spiritual growth with academic excellence.",
      "Our dedicated faculty, state-of-the-art facilities, and comprehensive curriculum ensure that every student receives the best possible education, preparing them for success in both this world and the hereafter.",
      "Founded with a vision to create a harmonious blend of Islamic and modern education, SGN Academy has been at the forefront of educational innovation for over five decades. Our commitment to excellence is reflected in every aspect of our institution.",
      "We focus on character development alongside academic achievement, ensuring our students graduate not only with strong educational foundations but also with strong moral values and leadership qualities.",
      "Our comprehensive curriculum includes:",
      "• Islamic Studies and Quranic Education",
      "• Modern Academic Subjects",
      "• Character Development Programs",
      "• Extra-curricular Activities",
      "• Leadership Training",
      "• Community Service Initiatives"
    ],
    achievements: [
      "• Consistently high academic performance in board examinations",
      "• Recognition for excellence in Islamic education",
      "• Strong alumni network in various professional fields",
      "• Active community engagement programs",
      "• State-of-the-art educational facilities"
    ]
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Welcome to SGN Academy" 
          icon={<Home className="inline-block h-8 w-8 text-red-600" />} 
        />
        
        {/* Stats Section */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <div className="text-4xl font-bold text-red-600 mb-2">
                {inView && (
                  <CountUp
                    end={stat.count}
                    duration={2}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Welcome Content */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Head Master"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-red-100"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Selim Shaikh</h3>
                  <p className="text-gray-600">Head Master, SGN Academy</p>
                </div>
              </div>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  {fullMessage.mainContent[0]}
                </p>
                <p>
                  {fullMessage.mainContent[1]}
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                >
                  Read More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Notice Board */}
          <div>
            <DynamicNoticeBoard />
          </div>
        </div>
      </div>

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
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{fullMessage.title}</h2>
                    <p className="text-lg text-red-600 mt-1">{fullMessage.subtitle}</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="prose prose-red max-w-none">
                  {fullMessage.mainContent.map((paragraph, index) => (
                    <p key={index} className="text-gray-600 mb-4">
                      {paragraph}
                    </p>
                  ))}

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Our Achievements</h3>
                  <ul className="space-y-2 text-gray-600">
                    {fullMessage.achievements.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
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

export default Welcome;