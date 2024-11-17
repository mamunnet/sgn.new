import React from 'react';
import { motion } from 'framer-motion';
import { Book, Users, Award, Target, CheckCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const [statsRef, statsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [missionRef, missionInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const stats = [
    { icon: Book, count: 50, label: 'Courses Offered', suffix: '+' },
    { icon: Users, count: 1000, label: 'Students Enrolled', suffix: '+' },
    { icon: Award, count: 150, label: 'Certified Teachers', suffix: '+' },
    { icon: Target, count: 95, label: 'Success Rate', suffix: '%' },
  ];

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 text-white py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1920&q=80"
            alt="About Us"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/70" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SGN Academy</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Nurturing minds, fostering faith, and building character since 1970
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={statsRef}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate={statsInView ? "visible" : "hidden"}
                variants={fadeInUpVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
              >
                <stat.icon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {statsInView && (
                    <CountUp
                      end={stat.count}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div
        ref={missionRef}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial="hidden"
              animate={missionInView ? "visible" : "hidden"}
              variants={fadeInUpVariants}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-red-600" />
                </span>
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                To be a leading Islamic educational institution that nurtures individuals who excel in both religious knowledge and academic pursuits, embodying Islamic values while contributing positively to society.
              </p>
              <ul className="space-y-3">
                {['Academic Excellence', 'Islamic Values', 'Character Building'].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center text-gray-600"
                  >
                    <CheckCircle className="h-5 w-5 text-red-600 mr-3" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden"
              animate={missionInView ? "visible" : "hidden"}
              variants={fadeInUpVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <Book className="h-6 w-6 text-red-600" />
                </span>
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                To provide comprehensive Islamic education integrated with modern academic excellence, fostering spiritual growth, intellectual development, and moral character in a nurturing environment.
              </p>
              <ul className="space-y-3">
                {['Quality Education', 'Spiritual Growth', 'Community Service'].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center text-gray-600"
                  >
                    <CheckCircle className="h-5 w-5 text-red-600 mr-3" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From our humble beginnings to where we are today, every step has been guided by our commitment to excellence in Islamic education.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-100" />

            {/* Timeline Events */}
            {[
              { year: '1970', title: 'Foundation', description: 'SGN Academy was established with a vision to provide quality Islamic education.' },
              { year: '1985', title: 'Expansion', description: 'Added new facilities and expanded our curriculum to include modern subjects.' },
              { year: '2000', title: 'Modernization', description: 'Integrated technology and modern teaching methods into our Islamic curriculum.' },
              { year: '2020', title: 'Golden Jubilee', description: 'Celebrated 50 years of excellence in Islamic education.' },
            ].map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative mb-8 ${
                  index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'
                }`}
              >
                <div className={`md:w-1/2 ${
                  index % 2 === 0 ? 'md:text-right' : ''
                }`}>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <span className="inline-block px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-semibold mb-3">
                      {event.year}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;