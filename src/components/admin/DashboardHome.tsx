import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Activity, Bell, Calendar, Users, GraduationCap, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHome = () => {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeNotices: 0,
    upcomingEvents: 0,
    totalAlumni: 0,
    totalCertificates: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total students
        const studentsSnap = await getDocs(collection(db, 'students'));
        const totalStudents = studentsSnap.size;

        // Fetch active notices
        const noticesSnap = await getDocs(collection(db, 'notices'));
        const activeNotices = noticesSnap.size;

        // Fetch upcoming events
        const now = new Date();
        const eventsQuery = query(
          collection(db, 'events'),
          where('date', '>=', now.toISOString()),
          orderBy('date')
        );
        const eventsSnap = await getDocs(eventsQuery);
        const upcomingEvents = eventsSnap.size;

        // Fetch total alumni
        const alumniSnap = await getDocs(collection(db, 'alumni'));
        const totalAlumni = alumniSnap.size;

        // Fetch total certificates
        const certificatesSnap = await getDocs(collection(db, 'certificates'));
        const totalCertificates = certificatesSnap.size;

        setStats({
          totalStudents,
          activeNotices,
          upcomingEvents,
          totalAlumni,
          totalCertificates
        });

        // Fetch recent activities
        const activities = [];

        // Add recent notices
        const recentNoticesQuery = query(
          collection(db, 'notices'),
          orderBy('date', 'desc'),
          limit(3)
        );
        const recentNoticesSnap = await getDocs(recentNoticesQuery);
        recentNoticesSnap.forEach(doc => {
          activities.push({
            type: 'notice',
            title: doc.data().title,
            date: doc.data().date
          });
        });

        // Add recent events
        const recentEventsQuery = query(
          collection(db, 'events'),
          orderBy('date', 'desc'),
          limit(3)
        );
        const recentEventsSnap = await getDocs(recentEventsQuery);
        recentEventsSnap.forEach(doc => {
          activities.push({
            type: 'event',
            title: doc.data().title,
            date: doc.data().date
          });
        });

        // Sort activities by date
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivities(activities.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-emerald-100">Here's what's happening at SGN Academy today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Notices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeNotices}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Alumni</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAlumni}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Activity className="h-5 w-5 text-emerald-600 mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {activity.type === 'notice' ? (
                  <Bell className="h-5 w-5 text-blue-600" />
                ) : (
                  <Calendar className="h-5 w-5 text-purple-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No recent activities
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 text-emerald-600 mr-2" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/students/admission"
              className="flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <GraduationCap className="h-6 w-6 text-emerald-600 mr-3" />
              <div>
                <h3 className="font-medium text-emerald-900">New Admission</h3>
                <p className="text-sm text-emerald-600">Add new student</p>
              </div>
            </a>

            <a
              href="/admin/notices"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Bell className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-blue-900">Add Notice</h3>
                <p className="text-sm text-blue-600">Post new notice</p>
              </div>
            </a>

            <a
              href="/admin/events"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Calendar className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-purple-900">Create Event</h3>
                <p className="text-sm text-purple-600">Schedule new event</p>
              </div>
            </a>

            <a
              href="/admin/tc-generator"
              className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <FileText className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium text-red-900">Generate TC</h3>
                <p className="text-sm text-red-600">Create transfer certificate</p>
              </div>
            </a>
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-emerald-600 mr-2" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-green-900">Database</p>
              <p className="text-sm text-green-600">Connected</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-green-900">Storage</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-green-900">Authentication</p>
              <p className="text-sm text-green-600">Active</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;