import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Briefcase, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from './SectionHeading';

const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'alumni'),
      orderBy('updatedAt', 'desc'),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alumniData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlumni(alumniData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <SectionHeading 
        title="Our Distinguished Alumni" 
        icon={<Users className="inline-block h-8 w-8 text-red-600" />} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alumni.map((alumnus) => (
          <motion.div
            key={alumnus.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedAlumni(alumnus)}
          >
            <div className="relative h-48">
              <img
                src={alumnus.photoUrl}
                alt={alumnus.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg">{alumnus.name}</h3>
                <p className="text-sm opacity-90">Batch {alumnus.batch}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Briefcase className="h-4 w-4 text-red-600 mr-2" />
                <span>{alumnus.occupation}</span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{alumnus.testimonial}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alumni Details Modal */}
      <AnimatePresence>
        {selectedAlumni && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedAlumni.photoUrl}
                  alt={selectedAlumni.name}
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedAlumni.name}</h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-red-600" />
                  <span>Batch {selectedAlumni.batch}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-6">
                  <Briefcase className="h-5 w-5 mr-2 text-red-600" />
                  <span>{selectedAlumni.occupation}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{selectedAlumni.testimonial}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {alumni.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No alumni profiles available.
        </div>
      )}
    </div>
  );
};

export default AlumniList;