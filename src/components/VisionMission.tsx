import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass } from 'lucide-react';

const VisionMission = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-4 border-l-4 border-red-600 bg-red-50"
        >
          <div className="flex items-center mb-3">
            <Target className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Our Vision</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            To be a leading Islamic educational institution that nurtures individuals who excel in both 
            religious knowledge and academic pursuits.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-4 border-l-4 border-red-600 bg-red-50"
        >
          <div className="flex items-center mb-3">
            <Compass className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Our Mission</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            To provide comprehensive Islamic education integrated with modern academic excellence, 
            fostering spiritual growth and character development.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VisionMission;