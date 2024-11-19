import React, { useEffect, useState } from 'react';
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

const Noticeboard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const renderNotices = (key: string = '') => (
    <>
      {notices.map((notice, index) => (
        <span 
          key={`${notice.id}${key}`} 
          className={`
            inline-flex items-center whitespace-normal
            ${isMobile ? 'text-[10px] px-1' : 'text-xs md:text-sm mx-2 md:mx-4'}
          `}
        >
          <span className="font-semibold text-red-400 truncate max-w-[150px]">{notice.title}</span>
          <span className="mx-1">-</span>
          <span className="line-clamp-1 max-w-[200px] md:max-w-[300px]">{notice.content}</span>
          {index < notices.length - 1 && (
            <span className="mx-1 text-red-400 opacity-75">•</span>
          )}
        </span>
      ))}
    </>
  );

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden h-8 md:h-10">
      {/* Title Section with responsive width */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute left-0 top-0 bottom-0 bg-red-600 w-20 md:w-40 flex items-center justify-center z-10"
      >
        <div className="flex items-center space-x-1 px-1 md:px-2">
          <Bell className="h-3 w-3 md:h-4 md:w-4 animate-bounce" />
          <h2 className="text-xs md:text-sm font-bold whitespace-nowrap">
            {isMobile ? 'Updates' : 'Latest Updates'}
          </h2>
        </div>
      </motion.div>

      {/* Marquee container with adjusted padding */}
      <div className="ml-20 md:ml-40 overflow-hidden h-full flex items-center">
        <div className="animate-marquee inline-block">
          {renderNotices()}
        </div>
        <div className="animate-marquee2 inline-block absolute">
          {renderNotices('-copy')}
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute left-20 md:left-40 top-0 bottom-0 w-2 md:w-4 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-2 md:w-4 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
    </div>
  );
};

export default Noticeboard;