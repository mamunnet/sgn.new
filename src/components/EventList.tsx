import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      orderBy('date', 'asc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <SectionHeading 
        title="Upcoming Events" 
        icon={<Calendar className="inline-block h-8 w-8 text-red-600" />} 
      />

      <div className="space-y-4">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>{event.venue}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              className="mt-4 flex items-center text-red-600 font-semibold text-sm group"
            >
              Read More
              <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No upcoming events at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;