import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  icon?: React.ReactNode;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center mb-8"
    >
      <div className="relative">
        <h2 className="text-3xl font-bold text-gray-900 relative z-10 px-6 py-2">
          <span className="relative">
            {icon && <span className="mr-3">{icon}</span>}
            {title}
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-3 bg-red-100 -z-10"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            />
          </span>
        </h2>
      </div>
      <div className="flex items-center mt-2">
        <div className="w-12 h-1 bg-red-600 rounded-full" />
        <div className="w-3 h-3 bg-red-600 rounded-full mx-2" />
        <div className="w-12 h-1 bg-red-600 rounded-full" />
      </div>
    </motion.div>
  );
};

export default SectionHeading;