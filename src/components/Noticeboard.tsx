import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: Date;
}

const Noticeboard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(noticeData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative bg-gray-900 text-white py-2 md:py-3">
      {/* Title Section - Fixed width on mobile, auto on desktop */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute left-0 top-0 bottom-0 bg-red-600 w-24 md:w-48 flex items-center justify-center z-10"
      >
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 md:h-5 md:w-5 animate-bounce" />
          <h2 className="text-sm md:text-base font-bold whitespace-nowrap">Latest Updates</h2>
        </div>
      </motion.div>

      {/* Marquee Notices - Adjusted padding for mobile */}
      <div className="ml-24 md:ml-48 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {notices.map((notice, index) => (
            <span key={notice.id} className="mx-4 md:mx-8 inline-block text-sm md:text-base">
              <span className="font-semibold text-red-400">{notice.title}</span>
              <span className="mx-2">-</span>
              <span>{notice.content}</span>
              {index < notices.length - 1 && (
                <span className="mx-2 md:mx-4 text-red-400">•</span>
              )}
            </span>
          ))}
        </div>
        <div className="animate-marquee2 inline-block absolute">
          {notices.map((notice, index) => (
            <span key={`${notice.id}-copy`} className="mx-4 md:mx-8 inline-block text-sm md:text-base">
              <span className="font-semibold text-red-400">{notice.title}</span>
              <span className="mx-2">-</span>
              <span>{notice.content}</span>
              {index < notices.length - 1 && (
                <span className="mx-2 md:mx-4 text-red-400">•</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Gradient Overlays - Adjusted for mobile */}
      <div className="absolute left-24 md:left-48 top-0 bottom-0 w-4 md:w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-4 md:w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Noticeboard;