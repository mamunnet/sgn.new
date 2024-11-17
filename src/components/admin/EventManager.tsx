import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus } from 'lucide-react';

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title,
        description,
        date,
        venue,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), eventData);
        toast.success('Event updated successfully');
      } else {
        await addDoc(collection(db, 'events'), eventData);
        toast.success('Event added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Error saving event');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setVenue('');
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date);
    setVenue(event.venue);
    setEditingId(event.id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Error deleting event');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Events</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Venue
          </label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            required
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {editingId ? 'Update Event' : 'Add Event'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-l-4 border-emerald-500 bg-gray-50 p-4 rounded"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                      <p>Venue: {event.venue}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManager;