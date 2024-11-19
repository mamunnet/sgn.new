import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass } from 'lucide-react';
import SectionHeading from './SectionHeading'; // Assuming SectionHeading is a separate component

const VisionMission = () => {
  return (
    <div>
      <SectionHeading 
        title="Vision & Mission" 
        icon={<Target className="inline-block h-8 w-8 text-red-600" />} 
      />
      
      <div className="space-y-6 mt-8">
        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-red-100 hover:border-red-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-50 rounded-lg mr-4">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">Our Vision</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To be a leading Islamic educational institution that nurtures individuals who excel in both 
            religious knowledge and academic pursuits.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-red-100 hover:border-red-200"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-50 rounded-lg mr-4">
              <Compass className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">Our Mission</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To provide comprehensive Islamic education integrated with modern academic excellence, 
            fostering spiritual growth and character development.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VisionMission;