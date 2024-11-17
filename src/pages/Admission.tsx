import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Calendar, ClipboardList, GraduationCap, FileText } from 'lucide-react';

const Admission = () => {
  const requirements = [
    'Completed application form',
    'Birth certificate',
    'Previous academic records',
    'Passport size photographs',
    'Character certificate from previous institution',
    'Interview clearance',
  ];

  const steps = [
    {
      icon: FileText,
      title: 'Submit Application',
      description: 'Fill out and submit the online application form with required documents.',
    },
    {
      icon: ClipboardList,
      title: 'Document Verification',
      description: 'Our team will verify your submitted documents and credentials.',
    },
    {
      icon: Calendar,
      title: 'Schedule Interview',
      description: 'Selected candidates will be called for a personal interview.',
    },
    {
      icon: GraduationCap,
      title: 'Final Selection',
      description: 'Successful candidates will receive admission confirmation.',
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
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80"
            alt="Admission"
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Admission Process</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join our prestigious institution and embark on a journey of knowledge and spiritual growth
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <button className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors inline-flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download Prospectus
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Admission Steps */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Admission Steps</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="bg-white rounded-lg shadow-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Admission Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {requirements.map((requirement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-gray-700">{requirement}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Important Dates */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Important Dates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { date: 'March 1, 2024', event: 'Application Opens' },
              { date: 'April 15, 2024', event: 'Application Deadline' },
              { date: 'May 1, 2024', event: 'Interview Process Begins' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <Calendar className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{item.event}</h3>
                <p className="text-gray-600">{item.date}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Admission;