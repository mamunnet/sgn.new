import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, Download, Calendar, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  pdfUrl?: string;
}

const DynamicNoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'notices'),
      orderBy('date', 'desc'),
      limit(5)
    );

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg p-6"
    >
      <SectionHeading 
        title="Notice Board" 
        icon={<Bell className="inline-block h-8 w-8 text-red-600" />} 
      />

      <div className="space-y-4 mt-6">
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-4 rounded-lg shadow-md transform hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 rounded-full p-2 mt-1">
                <Bell className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{notice.content}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                {notice.pdfUrl && (
                  <a
                    href={notice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span>View PDF</span>
                    <Download className="h-4 w-4 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {notices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notices available at the moment.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DynamicNoticeBoard;