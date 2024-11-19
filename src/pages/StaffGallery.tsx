import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, BookOpen, Award, Star, Facebook, Twitter, Linkedin } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Staff } from '../types/staff';

const StaffGallery = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const q = query(
          collection(db, 'staff'),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const staffData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Staff[];
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80"
            alt="Staff Gallery"
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Staff</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet our dedicated team of educators and administrators
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="flex flex-col">
                <div className="relative pt-[100%] w-full">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex flex-col items-start gap-2 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                      {member.position}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                      <BookOpen className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                      <span>{member.qualification}</span>
                    </div>
                    <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                      <Award className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                      <span>{member.experience} Experience</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {staff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No staff members found
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffGallery;