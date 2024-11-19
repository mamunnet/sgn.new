import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  fileName: string;
  createdAt: string;
}

const BannerSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const bannerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[];
        setBanners(bannerData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching banners:', err);
        setError('Failed to load banners');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const nextSlide = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const prevSlide = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">No banners available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={banners[currentIndex].imageUrl}
            alt={banners[currentIndex].fileName}
            className="w-full h-full object-cover"
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
          />
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 
              bg-black/50 text-white p-2 rounded-full 
              hover:bg-black/70 transition-colors
              focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 
              bg-black/50 text-white p-2 rounded-full 
              hover:bg-black/70 transition-colors
              focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors 
                  ${index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;