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
    <div className="bg-gray-50">
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
        <div className="grid md:grid-cols-2 gap-8">
          {staff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-full">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                      {member.position}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                      <span>{member.qualification}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="h-5 w-5 text-red-600 mr-2" />
                      <span>{member.experience} Experience</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                        >
                          <Star className="h-4 w-4 text-red-600 mr-1" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-red-600 mr-2" />
                      <a href={`mailto:${member.email}`} className="hover:text-red-600">
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-red-600 mr-2" />
                      <a href={`tel:${member.phone}`} className="hover:text-red-600">
                        {member.phone}
                      </a>
                    </div>
                  </div>

                  {/* Social Links */}
                  {member.socialLinks && (
                    <div className="mt-4 flex space-x-4">
                      {member.socialLinks.facebook && (
                        <a
                          href={member.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {member.socialLinks.twitter && (
                        <a
                          href={member.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {member.socialLinks.linkedin && (
                        <a
                          href={member.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-700"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
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