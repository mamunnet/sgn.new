import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Blocks, Users, GraduationCap, Baby, Clock, BookOpen } from 'lucide-react';
import SectionHeading from './SectionHeading';

const services = [
  {
    id: 'playgroup',
    title: 'PLAYGROUP',
    icon: Blocks,
    color: 'bg-red-600',
    description: 'A Well Planned and articulated teaching experience for age group between 1.5-2.5 years.',
    details: [
      'Special attention for all round development of every child',
      'We blend "PLAY TIME" and "SEAT WORK"',
      'Helps develop academics skills while allowing children to learn through our GAME APPROACH',
      'Keen focus on FINE and GROSS motor skill development of every child',
      'Apt Teacher Child ratio for precision and focus',
    ],
    image: 'https://images.unsplash.com/photo-1545062090-7e0b30649f9d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'nursery',
    title: 'NURSERY',
    icon: Baby,
    color: 'bg-red-600',
    description: 'An extensively decorated curriculum for Progressive Toddlers of age group between 2.5-3.5 years of age.',
    details: [
      'Building the first block of foundation for child\'s cognitive and emotional development.',
      'We blend "PLAY TIME" and "SEAT WORK", which helps develop academics skills while allowing children to learn through our GAME APPROACH.',
      'Inculcating the importance of Teamwork and habit of learning together.',
      'Apt Teacher Child Ratio for precision and focus.',
    ],
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kg',
    title: 'JR.KG & SR.KG',
    icon: GraduationCap,
    color: 'bg-red-600',
    description: 'Comprehensive early education program for ages 3.5-5.5 years.',
    details: [
      'Structured learning approach',
      'Foundation for primary education',
      'Development of basic concepts',
      'Focus on language and numeracy',
      'Creative activities and projects',
    ],
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'daycare',
    title: 'DAY CARE',
    icon: Users,
    color: 'bg-red-600',
    description: 'Safe and nurturing environment for children during working hours.',
    details: [
      'Flexible timing options',
      'Nutritious meals provided',
      'Supervised activities',
      'Regular health monitoring',
      'Safe and secure environment',
    ],
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'afterschool',
    title: 'AFTER SCHOOL',
    icon: Clock,
    color: 'bg-red-600',
    description: 'Enriching after-school programs for holistic development.',
    details: [
      'Homework assistance',
      'Extra-curricular activities',
      'Sports and recreation',
      'Skill development programs',
      'Supervised study time',
    ],
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
];

const Services = () => {
  const [selectedService, setSelectedService] = useState(services[0]); // Default to Playgroup

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Our Services" 
          icon={<BookOpen className="inline-block h-8 w-8 text-red-600" />} 
        />

        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3">
            <div className="space-y-2">
              {services.map((service) => (
                <motion.button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-4 flex items-center space-x-3 rounded-lg shadow-md transition-all ${
                    selectedService?.id === service.id
                      ? 'bg-white ring-2 ring-red-500 text-red-600'
                      : 'bg-white hover:ring-2 hover:ring-red-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <service.icon className={`h-6 w-6 ${
                    selectedService?.id === service.id ? 'text-red-600' : 'text-gray-500'
                  }`} />
                  <span className="font-semibold">{service.title}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {selectedService && (
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-12 md:col-span-9 bg-white rounded-lg shadow-lg p-8"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-gray-900">{selectedService.title}</h3>
                  <p className="text-gray-600">{selectedService.description}</p>
                  <div className="space-y-4">
                    {selectedService.details.map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white border border-red-100 text-gray-600 rounded-lg shadow-sm"
                      >
                        {detail}
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-lg uppercase font-semibold shadow-md"
                  >
                    READ MORE
                  </motion.button>
                </div>
                <div className="relative">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="w-full h-full object-cover rounded-lg shadow-lg ring-4 ring-red-100"
                  />
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-4 -right-4 w-8 h-8 bg-red-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;