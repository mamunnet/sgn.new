import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Users, Clock, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  section: string;
  subjects: string[];
  schedule: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

const ClassManager = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    schedule: '',
    capacity: ''
  });
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classData);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      const newSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(newSubjects);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty subjects
      const filteredSubjects = subjects.filter(subject => subject.trim() !== '');
      
      if (filteredSubjects.length === 0) {
        toast.error('Please add at least one subject');
        setLoading(false);
        return;
      }

      const classData = {
        ...formData,
        subjects: filteredSubjects,
        capacity: parseInt(formData.capacity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'classes', editingId), {
          ...classData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Class updated successfully');
      } else {
        await addDoc(collection(db, 'classes'), classData);
        toast.success('Class added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Error saving class');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem: Class) => {
    setFormData({
      name: classItem.name,
      section: classItem.section,
      schedule: classItem.schedule,
      capacity: classItem.capacity.toString()
    });
    setSubjects(classItem.subjects);
    setEditingId(classItem.id);
  };

  const handleDelete = async (classId: string) => {
    try {
      await deleteDoc(doc(db, 'classes', classId));
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Error deleting class');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      schedule: '',
      capacity: ''
    });
    setSubjects(['']);
    setEditingId(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Classes</h2>

      {/* Add/Edit Class Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Class Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Section
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Schedule
            </label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              placeholder="e.g., Mon, Wed, Fri 10:00 AM"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Subjects
              </label>
              <button
                type="button"
                onClick={addSubject}
                className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </button>
            </div>
            <div className="space-y-3">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    placeholder={`Subject ${index + 1}`}
                    className="shadow appearance-none border rounded flex-1 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={resetForm}
            className="mr-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update Class' : 'Add Class'}
          </button>
        </div>
      </form>

      {/* Classes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                <p className="text-sm text-gray-600">Section: {classItem.section}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <BookOpen className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="font-medium">Subjects:</span>
                </div>
                <ul className="list-disc list-inside pl-7 text-gray-600 space-y-1">
                  {classItem.subjects.map((subject, index) => (
                    <li key={index}>{subject}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 text-emerald-600 mr-2" />
                <span>{classItem.schedule}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 text-emerald-600 mr-2" />
                <span>Capacity: {classItem.capacity} students</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClassManager;
