import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, BookOpen, Clock, CreditCard, Shield, HelpCircle } from 'lucide-react';

const FeesStructure = () => {
  const feeCategories = [
    {
      title: 'Primary Level',
      monthly: 250,
      annual: 2500,
      features: [
        'Basic Islamic Studies',
        'Core Academic Subjects',
        'Physical Education',
        'Art & Craft Activities',
      ],
    },
    {
      title: 'Secondary Level',
      monthly: 350,
      annual: 3500,
      features: [
        'Advanced Islamic Studies',
        'Extended Academic Curriculum',
        'Language Classes',
        'Sports Activities',
      ],
    },
    {
      title: 'Higher Level',
      monthly: 450,
      annual: 4500,
      features: [
        'Specialized Islamic Studies',
        'College Preparation',
        'Career Guidance',
        'Leadership Programs',
      ],
    },
  ];

  const additionalFees = [
    { name: 'Registration Fee', amount: 200, type: 'One-time' },
    { name: 'Laboratory Fee', amount: 150, type: 'Annual' },
    { name: 'Library Fee', amount: 100, type: 'Annual' },
    { name: 'Activity Fee', amount: 200, type: 'Annual' },
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
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1920&q=80"
            alt="Fees Structure"
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Fees Structure</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transparent and affordable education fees for all levels
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Fee Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {feeCategories.map((category, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{category.title}</h3>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-red-600">
                    ${category.monthly}
                    <span className="text-base font-normal text-gray-600">/month</span>
                  </p>
                  <p className="text-gray-600">
                    or ${category.annual} annually
                  </p>
                </div>
                <ul className="space-y-3">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <BookOpen className="h-5 w-5 text-red-600 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors">
                  Enroll Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Fees */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUpVariants}
          className="bg-white rounded-lg shadow-lg p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Additional Fees</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFees.map((fee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 rounded-lg"
              >
                <DollarSign className="h-8 w-8 text-red-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{fee.name}</h3>
                <p className="text-2xl font-bold text-red-600">${fee.amount}</p>
                <p className="text-sm text-gray-600">{fee.type}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payment Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-red-600" />
                <span className="text-gray-700">Credit/Debit Cards</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-red-600" />
                <span className="text-gray-700">Monthly Installments</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-red-600" />
                <span className="text-gray-700">Secure Payment Gateway</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUpVariants}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <HelpCircle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Financial Aid</h3>
                  <p className="text-gray-600">We offer scholarships and financial assistance for eligible students.</p>
                </div>
              </div>
              <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors mt-4">
                Contact Financial Aid Office
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeesStructure;