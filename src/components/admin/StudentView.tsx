import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, User, Phone, GraduationCap, Users } from 'lucide-react';
import { doc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Student } from '../../types/student';
import { BLOOD_GROUPS, RELIGIONS, CATEGORIES } from '../../utils/constants';
import { dateToWords, formatDate } from '../../utils/dateUtils';

interface Class {
  id: string;
  name: string;
  sections: string[];
  subjects: string[];
  schedule: string;
  capacity: number;
}

interface StudentViewProps {
  student: Student;
  onClose: () => void;
  isEditing?: boolean;
  onUpdate?: (updatedStudent: Student) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onClose, isEditing = false, onUpdate }) => {
  const [editData, setEditData] = useState(student);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classData);

      // Update available sections when classes change
      if (editData.class) {
        const selectedClass = classData.find(cls => cls.name === editData.class);
        if (selectedClass) {
          setAvailableSections(selectedClass.sections);
        }
      }
    });

    return () => unsubscribe();
  }, [editData.class]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset section if class changes
      if (name === 'class') {
        const selectedClass = classes.find(cls => cls.name === value);
        if (selectedClass) {
          setAvailableSections(selectedClass.sections);
          newData.section = selectedClass.sections[0] || '';
        } else {
          setAvailableSections([]);
          newData.section = '';
        }
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (!editData.id) return;

    setLoading(true);
    try {
      const studentRef = doc(db, 'students', editData.id);
      const updateData = {
        ...editData,
        updatedAt: new Date().toISOString()
      };

      // Only remove tempRollNo if a permanent rollNo is assigned
      if (editData.rollNo && editData.rollNo.trim() !== '') {
        delete updateData.tempRollNo;
      }

      await updateDoc(studentRef, updateData);
      toast.success('Student information updated successfully');
      if (onUpdate) {
        onUpdate(updateData as Student);
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full p-6 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Student Information' : 'Student Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo and Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="w-40 h-40 rounded-lg overflow-hidden mb-4 border-4 border-emerald-100">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                      <User className="h-20 w-20 text-emerald-300" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                <p className="text-sm text-gray-500 mb-3">Admission No: {student.admissionNo}</p>
                
                {/* Roll Numbers */}
                <div className="w-full space-y-2">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Roll No</label>
                        <input
                          type="text"
                          name="rollNo"
                          value={editData.rollNo}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      {student.tempRollNo && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Temporary Roll No</label>
                          <input
                            type="text"
                            value={student.tempRollNo}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {student.rollNo && (
                        <div className="bg-emerald-50 rounded-md p-3 text-center">
                          <p className="text-sm text-emerald-600 font-medium">Roll No</p>
                          <p className="text-lg font-semibold text-emerald-700">{student.rollNo}</p>
                        </div>
                      )}
                      {student.tempRollNo && (
                        <div className="bg-amber-50 rounded-md p-3 text-center">
                          <p className="text-sm text-amber-600 font-medium">Temporary Roll No</p>
                          <p className="text-lg font-semibold text-amber-700">{student.tempRollNo}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Academic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
                Academic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Class</p>
                  {isEditing ? (
                    <select
                      name="class"
                      value={editData.class}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.class}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Section</p>
                  {isEditing ? (
                    <select
                      name="section"
                      value={editData.section}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      {availableSections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.section}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Facility</p>
                  {isEditing ? (
                    <select
                      name="facility"
                      value={editData.facility}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="day">Day Scholar</option>
                      <option value="boarding">Boarding</option>
                      <option value="both">Both</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {student.facility === 'day' ? 'Day Scholar' : 
                       student.facility === 'boarding' ? 'Boarding' : 'Both'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Previous School</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="previousSchool"
                      value={editData.previousSchool}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.previousSchool}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Admission Date</p>
                  <p className="text-gray-900">
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="space-y-1">
                      <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
                      <p className="text-sm text-gray-600">({dateToWords(student.dateOfBirth)})</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.gender}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Blood Group</p>
                  {isEditing ? (
                    <select
                      name="bloodGroup"
                      value={editData.bloodGroup}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      {BLOOD_GROUPS.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.bloodGroup}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Religion</p>
                  {isEditing ? (
                    <select
                      name="religion"
                      value={editData.religion}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      {RELIGIONS.map(religion => (
                        <option key={religion} value={religion}>{religion}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.religion}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  {isEditing ? (
                    <select
                      name="category"
                      value={editData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{student.category}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nationality</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nationality"
                      value={editData.nationality}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.nationality}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Aadhar Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="aadharNo"
                      value={editData.aadharNo}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.aadharNo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-emerald-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.email}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-emerald-600" />
                Family Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Father's Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherName"
                      value={editData.fatherName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.fatherName}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Mother's Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherName"
                      value={editData.motherName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="text-gray-900">{student.motherName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Previous Academic Records */}
            {student.previousSchoolMarks && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
                  Previous Academic Records
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous School</label>
                    <p className="mt-1 text-gray-900">{student.previousSchool}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <p className="mt-1 text-gray-900">{student.previousSchoolMarks.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Percentage</label>
                    <p className="mt-1 text-gray-900">{student.previousSchoolMarks.percentage}%</p>
                  </div>
                  {student.previousSchoolMarks.subjects && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject Marks</label>
                      <div className="grid grid-cols-2 gap-4">
                        {student.previousSchoolMarks.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-700">{subject.name}</span>
                            <span className="text-gray-900">{subject.marks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {isEditing ? 'Cancel' : 'Close'}
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentView;