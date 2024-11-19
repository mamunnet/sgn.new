import React from 'react';
import Banner from '../components/Banner';
import Noticeboard from '../components/Noticeboard';
import Welcome from '../components/Welcome';
import EventList from '../components/EventList';
import AlumniList from '../components/AlumniList';
import Services from '../components/Services';
import VisionMission from '../components/VisionMission';

const Home = () => {
  return (
    <div>
      <Banner />
      <Noticeboard />
      <Welcome />
      <Services />
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <EventList />
            <VisionMission />
          </div>
          <AlumniList />
        </div>
      </div>
    </div>
  );
};

export default Home;