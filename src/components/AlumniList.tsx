import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Briefcase, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from './SectionHeading';

interface Alumni {
  id: string;
  name: string;
  batch: string;
  occupation: string;
  testimonial: string;
  photoUrl: string;
  updatedAt: any;
}

const AlumniList = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);

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
      })) as Alumni[];
      setAlumni(alumniData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <SectionHeading 
        title="Our Distinguished Alumni" 
        icon={<Users className="inline-block h-8 w-8 text-red-600" />} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {alumni.map((alumnus) => (
          <motion.div
            key={alumnus.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-red-100 hover:border-red-200"
            onClick={() => setSelectedAlumni(alumnus)}
          >
            <div className="relative h-48">
              <img
                src={alumnus.photoUrl}
                alt={alumnus.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold text-lg group-hover:text-red-100 transition-colors">{alumnus.name}</h3>
                <p className="text-sm opacity-90">Batch {alumnus.batch}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <div className="p-1.5 bg-red-50 rounded-lg mr-2">
                  <Briefcase className="h-4 w-4 text-red-600" />
                </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAlumni(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-red-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedAlumni.photoUrl}
                  alt={selectedAlumni.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-bold text-white mb-2">{selectedAlumni.name}</h3>
                  <div className="flex items-center text-white/90">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Batch {selectedAlumni.batch}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-600 mb-6">
                  <div className="p-2 bg-red-50 rounded-lg mr-3">
                    <Briefcase className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="font-medium">{selectedAlumni.occupation}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{selectedAlumni.testimonial}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAlumni(null)}
                  className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Close
                </motion.button>
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