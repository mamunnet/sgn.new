import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar, MapPin, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from './SectionHeading';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string | number;
  venue: string;
  additionalDetails?: string;
}

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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
      })) as Event[];
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <SectionHeading 
        title="Upcoming Events" 
        icon={<Calendar className="inline-block h-8 w-8 text-red-600" />} 
      />

      <div className="space-y-4 mt-8">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-red-100 hover:border-red-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-red-600" />
                </div>
                <span>{event.venue}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
              onClick={() => setSelectedEvent(event)}
            >
              Read More
            </motion.button>
          </motion.div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-red-100">
            No upcoming events at the moment.
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-red-100"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-white/20" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60">
                  <h2 className="text-3xl font-bold text-white">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Date and Venue */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Clock className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Venue</p>
                        <p className="font-medium text-gray-900">{selectedEvent.venue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Event</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Additional Details if any */}
                  {selectedEvent.additionalDetails && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Details</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {selectedEvent.additionalDetails}
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedEvent(null)}
                    className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm w-full"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventList;