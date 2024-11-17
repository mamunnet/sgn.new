import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import SectionHeading from './SectionHeading';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const videos = [
  {
    id: 1,
    url: 'https://www.youtube.com/watch?v=XClgVRaSzQ0',
    title: 'SGN Academy - স্টুডেন্ট ভর্তি সম্পর্কে আলোচনা',
    duration: '13:40',
    thumbnail: 'https://img.youtube.com/vi/XClgVRaSzQ0/maxresdefault.jpg'
  },
  {
    id: 2,
    url: 'https://www.youtube.com/watch?v=Hs_0L0V6YzI',
    title: 'SGN Academy - মাদ্রাসা বোর্ড পরীক্ষার ফলাফল',
    duration: '2:15',
    thumbnail: 'https://img.youtube.com/vi/Hs_0L0V6YzI/maxresdefault.jpg'
  },
  {
    id: 3,
    url: 'https://www.youtube.com/watch?v=qYCwgpZU9Yk',
    title: 'SGN Academy - Annual Sports Day Celebration',
    duration: '5:30',
    thumbnail: 'https://img.youtube.com/vi/qYCwgpZU9Yk/maxresdefault.jpg'
  }
];

const VideoGallery = () => {
  const [activeVideo, setActiveVideo] = React.useState(videos[0]);
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <SectionHeading 
        title="Video Gallery" 
        icon={<Play className="inline-block h-8 w-8 text-red-600" />} 
      />

      {/* Main Video Player */}
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-8 bg-black">
        <ReactPlayer
          url={activeVideo.url}
          width="100%"
          height="100%"
          controls
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* Video Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-6 px-2">
        {activeVideo.title}
      </h3>

      {/* Video Thumbnails */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }}
        className="pb-12"
      >
        {videos.map((video) => (
          <SwiperSlide key={video.id}>
            <motion.div
              whileHover={{ y: -5 }}
              className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer ${
                activeVideo.id === video.id ? 'ring-2 ring-red-600' : ''
              }`}
              onClick={() => {
                setActiveVideo(video);
                setIsPlaying(true);
              }}
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded-md flex items-center">
                  <Clock className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs">{video.duration}</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
                  {video.title}
                </h4>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* View More Button */}
      <div className="text-center mt-6">
        <a
          href="https://www.youtube.com/@sgnacademy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Play className="h-5 w-5 mr-2" />
          View More Videos
        </a>
      </div>
    </div>
  );
};

export default VideoGallery;