import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Eye, Search, Edit, Trash2, Download, Filter } from 'lucide-react';
import { Student } from '../../types/student';
import StudentView from './StudentView';
import { AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  sections: string[];
  subjects: string[];
  schedule: string;
  capacity: number;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classData);

      // Update available sections when classes change
      if (selectedClass) {
        const selectedClassData = classData.find(cls => cls.name === selectedClass);
        if (selectedClassData) {
          setAvailableSections(selectedClassData.sections);
        } else {
          setAvailableSections([]);
          setSelectedSection(''); // Reset section if class no longer exists
        }
      }
    });

    return () => unsubscribe();
  }, [selectedClass]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(true);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsEditing(false);
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setIsEditing(false);
  };

  const handleDelete = async (student: Student) => {
    const result = await Swal.fire({
      title: 'Delete Student Record',
      html: `
        <p>Are you sure you want to delete the record of:</p>
        <p class="font-semibold mt-2">${student.name}</p>
        <p class="text-sm text-gray-600 mt-1">Admission No: ${student.admissionNo}</p>
        <div class="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          This action cannot be undone. All student data will be permanently removed.
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'students', student.id));
        toast.success('Student record deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Error deleting student record');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(searchString) ||
      student.admissionNo.toLowerCase().includes(searchString) ||
      (student.tempRollNo && student.tempRollNo.toLowerCase().includes(searchString)) ||
      (student.rollNo && student.rollNo.toLowerCase().includes(searchString)) ||
      student.fatherName.toLowerCase().includes(searchString);

    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student List</h2>
        <div className="flex items-center space-x-4">
          {/* Class Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedClass}
              onChange={(e) => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                setSelectedSection('');
                
                // Update available sections
                if (newClass) {
                  const selectedClassData = classes.find(cls => cls.name === newClass);
                  if (selectedClassData) {
                    setAvailableSections(selectedClassData.sections);
                  } else {
                    setAvailableSections([]);
                  }
                } else {
                  setAvailableSections([]);
                }
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          {selectedClass && availableSections.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="">All Sections</option>
              {availableSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Numbers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {student.photoUrl && (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Adm No: {student.admissionNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {student.rollNo ? (
                          <div className="text-emerald-600 font-medium">
                            Roll No: {student.rollNo}
                          </div>
                        ) : (
                          <div className="text-orange-600">
                            Temp: {student.tempRollNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Class {student.class} - {student.section}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.facility === 'day' ? 'Day Scholar' : 
                         student.facility === 'boarding' ? 'Boarding' : 'Both'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleView(student)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Edit Student"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Student"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">No students found</div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedStudent && (
          <StudentView
            student={selectedStudent}
            onClose={handleClose}
            isEditing={isEditing}
            onUpdate={(updatedStudent) => {
              setSelectedStudent(updatedStudent);
              setIsEditing(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentList;