import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, BookOpen, Users, Clock, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { SECTIONS } from '../../utils/constants';
import Swal from 'sweetalert2';

interface Class {
  id: string;
  name: string;
  sections: string[];
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
    schedule: '',
    capacity: ''
  });
  const [sections, setSections] = useState<string[]>([]);
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

  const handleSectionChange = (section: string) => {
    setSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
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

      if (sections.length === 0) {
        toast.error('Please select at least one section');
        setLoading(false);
        return;
      }

      const classData = {
        ...formData,
        sections,
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
    setEditingId(classItem.id);
    setFormData({
      name: classItem.name,
      schedule: classItem.schedule,
      capacity: classItem.capacity.toString()
    });
    setSections(classItem.sections || []);
    setSubjects(classItem.subjects);
  };

  const handleDelete = async (classId: string) => {
    const result = await Swal.fire({
      title: 'Delete Class',
      text: 'Are you sure you want to delete this class? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'classes', classId));
        toast.success('Class deleted successfully');
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Error deleting class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      schedule: '',
      capacity: ''
    });
    setSections([]);
    setSubjects(['']);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sections</label>
              <div className="flex flex-wrap gap-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => handleSectionChange(section)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${sections.includes(section)
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                required
                placeholder="e.g., Mon-Fri 9:00 AM - 3:00 PM"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity (per section)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Subjects</h3>
              <button
                type="button"
                onClick={addSubject}
                className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    placeholder={`Subject ${index + 1}`}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingId ? 'Update Class' : 'Add Class'}
          </button>
        </div>
      </form>

      {/* Class List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <motion.div
            key={classItem.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sections</p>
                  <p className="text-sm text-gray-500">{classItem.sections.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Subjects</p>
                  <p className="text-sm text-gray-500">{classItem.subjects.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Schedule</p>
                  <p className="text-sm text-gray-500">{classItem.schedule}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Capacity (per section)</p>
                  <p className="text-sm text-gray-500">{classItem.capacity} students</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClassManager;
