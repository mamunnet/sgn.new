import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import DynamicNoticeBoard from './DynamicNoticeBoard';
import SectionHeading from './SectionHeading';

const Welcome = () => {
  const [statsRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const stats = [
    { count: 1000, label: 'Students', suffix: '+' },
    { count: 25, label: 'Programs', suffix: '+' },
    { count: 50, label: 'Years Legacy', suffix: '+' },
    { count: 100, label: 'Success Rate', suffix: '%' },
  ];

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
                  "At SGN Academy, we believe in nurturing not just students, but future 
                  leaders who embody Islamic values while excelling in contemporary 
                  education. Our unique approach combines spiritual growth with 
                  academic excellence."
                </p>
                <p>
                  "Our dedicated faculty, state-of-the-art facilities, and comprehensive 
                  curriculum ensure that every student receives the best possible 
                  education, preparing them for success in both this world and the 
                  hereafter."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Notice Board */}
          <div>
            <DynamicNoticeBoard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;