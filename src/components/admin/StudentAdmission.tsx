import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Upload, Plus, Minus, Save, Eye, User } from 'lucide-react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { BLOOD_GROUPS, RELIGIONS, CATEGORIES } from '../../utils/constants';
import { generateAdmissionNo } from '../../utils/generateAdmissionNo';
import StudentView from './StudentView';

interface AcademicRecord {
  subject: string;
  marks: string;
  totalMarks: string;
}

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

const StudentAdmission = () => {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([
    { subject: '', marks: '', totalMarks: '100' }
  ]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    tempRollNo: generateTempRollNo(),
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    religion: '',
    category: '',
    nationality: 'Indian',
    aadharNo: '',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    address: '',
    previousSchool: '',
    class: '',
    section: '',
    facility: 'day' as 'day' | 'boarding' | 'both',  
  });

  function generateTempRollNo() {
    const prefix = 'TEMP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}/${timestamp}/${random}`;
  }

  useEffect(() => {
    // Fetch classes from Firestore
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classData);

      // Update available sections if a class is selected
      if (formData.class) {
        const selectedClass = classData.find(cls => cls.name === formData.class);
        if (selectedClass) {
          setAvailableSections(selectedClass.sections);
        }
      }
    });

    return () => unsubscribe();
  }, [formData.class]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // When class changes, update available sections
      if (name === 'class') {
        const selectedClass = classes.find(cls => cls.name === value);
        if (selectedClass) {
          setAvailableSections(selectedClass.sections);
          // Reset section when class changes
          newData.section = '';
        } else {
          setAvailableSections([]);
          newData.section = '';
        }
      }
      
      return newData;
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAcademicRecordChange = (index: number, field: keyof AcademicRecord, value: string) => {
    const newRecords = [...academicRecords];
    newRecords[index][field] = value;
    setAcademicRecords(newRecords);
  };

  const addAcademicRecord = () => {
    setAcademicRecords([...academicRecords, { subject: '', marks: '', totalMarks: '100' }]);
  };

  const removeAcademicRecord = (index: number) => {
    if (academicRecords.length > 1) {
      const newRecords = academicRecords.filter((_, i) => i !== index);
      setAcademicRecords(newRecords);
    }
  };

  const calculatePercentage = () => {
    const totalMarks = academicRecords.reduce((sum, record) => sum + Number(record.marks), 0);
    const totalPossibleMarks = academicRecords.reduce((sum, record) => sum + Number(record.totalMarks), 0);
    return totalPossibleMarks > 0 ? ((totalMarks / totalPossibleMarks) * 100).toFixed(2) : '0';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = '';
      if (photoFile) {
        const photoRef = ref(storage, `students/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoUrl = await getDownloadURL(photoRef);
      }

      const admissionNo = generateAdmissionNo();
      const studentData = {
        ...formData,
        admissionNo,
        photoUrl,
        admissionDate: new Date().toISOString(),
        previousSchoolMarks: {
          year: new Date().getFullYear().toString(),
          percentage: calculatePercentage(),
          subjects: academicRecords.map(record => ({
            name: record.subject,
            marks: record.marks
          }))
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'students'), studentData);
      toast.success('Student admitted successfully');
      resetForm();
    } catch (error) {
      console.error('Error admitting student:', error);
      toast.error('Error admitting student');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tempRollNo: generateTempRollNo(),
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      religion: '',
      category: '',
      nationality: 'Indian',
      aadharNo: '',
      fatherName: '',
      motherName: '',
      phone: '',
      email: '',
      address: '',
      previousSchool: '',
      class: '',
      section: '',
      facility: 'day' as 'day' | 'boarding' | 'both',  
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setAcademicRecords([{ subject: '', marks: '', totalMarks: '100' }]);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Student Admission</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the student details below</p>
        </div>
        {formData.name && (
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Details
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Enhanced Photo Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Student Photo
                  <span className="text-xs text-gray-500 block mt-1">Upload a clear passport size photo</span>
                </label>
                <div className="flex flex-col items-center">
                  {photoPreview ? (
                    <div className="relative group">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-lg shadow-md border-2 border-emerald-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview('');
                          }}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Upload Photo</span>
                      <span className="mt-1 text-xs text-gray-400">(Max 2MB)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Temporary Roll Number</label>
                  <input
                    type="text"
                    value={formData.tempRollNo}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-500"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-generated temporary roll number</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  disabled={!formData.class || availableSections.length === 0}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Section</option>
                  {availableSections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                {!formData.class && (
                  <p className="mt-1 text-xs text-gray-500">Please select a class first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Facility</label>
                <select
                  name="facility"
                  value={formData.facility}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="day">Day Scholar</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
            </div>

            {/* Previous Academic Records */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Previous Academic Records</h4>
                <button
                  type="button"
                  onClick={addAcademicRecord}
                  className="text-emerald-600 hover:text-emerald-700 flex items-center px-3 py-1 rounded-md hover:bg-emerald-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subject
                </button>
              </div>

              {academicRecords.map((record, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={record.subject}
                      onChange={(e) => handleAcademicRecordChange(index, 'subject', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Marks Obtained"
                      value={record.marks}
                      onChange={(e) => handleAcademicRecordChange(index, 'marks', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Total Marks"
                      value={record.totalMarks}
                      onChange={(e) => handleAcademicRecordChange(index, 'totalMarks', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                    {academicRecords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAcademicRecord(index)}
                        className="mt-1 text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-right text-sm text-gray-600">
                Total Percentage: {calculatePercentage()}%
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-emerald-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Religion</label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  required
                >
                  <option value="">Select Religion</option>
                  {RELIGIONS.map(religion => (
                    <option key={religion} value={religion}>{religion}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Aadhar Number
                  <span className="text-xs text-gray-500 ml-1">(12 digits)</span>
                </label>
                <input
                  type="text"
                  name="aadharNo"
                  value={formData.aadharNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    handleChange({ ...e, target: { ...e.target, value } });
                  }}
                  pattern="[0-9]{12}"
                  maxLength={12}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Previous School</label>
                <input
                  type="text"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank if not applicable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-emerald-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 hover:border-emerald-400"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 hover:border-emerald-400"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 hover:border-emerald-400"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 hover:border-emerald-400"
                />
              </div>

              <div className="col-span-2 group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 hover:border-emerald-400 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Admit Student
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showPreview && (
          <StudentView
            student={{
              ...formData,
              id: '',
              rollNo: generateAdmissionNo(), // Adding rollNo property
              admissionNo: generateAdmissionNo(),
              photoUrl: photoPreview,
              admissionDate: new Date().toISOString(),
              previousSchoolMarks: {
                year: new Date().getFullYear().toString(),
                percentage: calculatePercentage(),
                subjects: academicRecords.map(record => ({
                  name: record.subject,
                  marks: record.marks
                }))
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAdmission;