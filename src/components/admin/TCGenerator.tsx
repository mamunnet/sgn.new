import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { FileText, Save, Eye, Download, Search, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { AnimatePresence } from 'framer-motion';
import TCPreview from './TCPreview';
import { SCHOOL_INFO } from '../../utils/constants';

const TCGenerator = () => {
  const [user] = useAuthState(auth);
  const [showPreview, setShowPreview] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Generate serial number
  const generateSerialNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SGN${random}/${month}/${year}`;
  };

  const [formData, setFormData] = useState({
    serialNo: generateSerialNo(),
    date: new Date().toISOString().split('T')[0],
    studentName: '',
    fatherName: '',
    motherName: '',
    village: '',
    district: '',
    state: '',
    admissionDate: '',
    currentClass: '',
    examYear: new Date().getFullYear().toString(),
    examBoard: 'Central Board of Secondary Education, New Delhi',
    dateOfBirth: '',
    character: 'Satisfactory',
    reasonForLeaving: '',
    anyOtherRemarks: '',
    gender: ''
  });

  useEffect(() => {
    if (!user) return;

    // Fetch certificates
    const q = query(
      collection(db, 'certificates'),
      orderBy('generatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const certificateData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertificates(certificateData);
      setLoading(false);
    });

    // Fetch students
    const fetchStudents = async () => {
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    };

    fetchStudents();

    return () => unsubscribe();
  }, [user]);

  const handleStudentSelect = (e) => {
    const student = students.find(s => s.id === e.target.value);
    if (student) {
      setSelectedStudent(student);
      setFormData({
        ...formData,
        studentName: student.name,
        fatherName: student.fatherName,
        motherName: student.motherName,
        dateOfBirth: student.dateOfBirth,
        currentClass: student.class,
        gender: student.gender || 'male',
        admissionDate: student.admissionDate,
        village: student.address.split(',')[0] || '',
        district: student.address.split(',')[1] || '',
        state: student.address.split(',')[2] || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    
    setShowPreview(true);
  };

  const handleGenerateAndSave = async () => {
    try {
      const element = document.getElementById('certificate-preview');
      if (!element) {
        throw new Error('Preview element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TC_${formData.studentName}_${formData.serialNo}.pdf`);

      // Save to Firestore
      await addDoc(collection(db, 'certificates'), {
        ...formData,
        studentId: selectedStudent.id,
        type: 'TC',
        generatedAt: new Date().toISOString(),
        generatedBy: user.uid,
        generatedByEmail: user.email
      });

      toast.success('Certificate generated and saved successfully');
      setShowPreview(false);
      setSelectedStudent(null);
      
      // Reset form
      setFormData({
        ...formData,
        serialNo: generateSerialNo(),
        date: new Date().toISOString().split('T')[0],
        studentName: '',
        fatherName: '',
        motherName: '',
        village: '',
        district: '',
        state: '',
        admissionDate: '',
        currentClass: '',
        examYear: new Date().getFullYear().toString(),
        examBoard: 'Central Board of Secondary Education, New Delhi',
        dateOfBirth: '',
        character: 'Satisfactory',
        reasonForLeaving: '',
        anyOtherRemarks: '',
        gender: ''
      });
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Error saving certificate');
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  const handleDownloadCertificate = async (certificate) => {
    try {
      const element = document.getElementById('certificate-preview');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TC_${certificate.studentName}_${certificate.serialNo}.pdf`);

      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Error downloading certificate');
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const searchStr = searchTerm.toLowerCase();
    return (
      cert.studentName.toLowerCase().includes(searchStr) ||
      cert.serialNo.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Generate Transfer Certificate</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Student Selection */}
          <div className="col-span-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent?.id || ''}
              onChange={handleStudentSelect}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} - Class {student.class} {student.rollNo ? `(Roll No: ${student.rollNo})` : `(Temp: ${student.tempRollNo})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Serial No
            </label>
            <input
              type="text"
              value={formData.serialNo}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Character
            </label>
            <select
              name="character"
              value={formData.character}
              onChange={(e) => setFormData({ ...formData, character: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="Satisfactory">Satisfactory</option>
              <option value="Good">Good</option>
              <option value="Very Good">Very Good</option>
              <option value="Excellent">Excellent</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Reason for Leaving
            </label>
            <input
              type="text"
              name="reasonForLeaving"
              value={formData.reasonForLeaving}
              onChange={(e) => setFormData({ ...formData, reasonForLeaving: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="col-span-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Any Other Remarks
            </label>
            <textarea
              name="anyOtherRemarks"
              value={formData.anyOtherRemarks}
              onChange={(e) => setFormData({ ...formData, anyOtherRemarks: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 flex items-center"
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview Certificate
          </button>
        </div>
      </form>

      {/* Certificate Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">View Records</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {certificate.serialNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {certificate.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {certificate.currentClass}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(certificate.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewCertificate(certificate)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Certificate"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate(certificate)}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Download Certificate"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCertificates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No certificates found
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <TCPreview
            data={selectedCertificate || formData}
            onClose={() => {
              setShowPreview(false);
              setSelectedCertificate(null);
            }}
            onGenerate={handleGenerateAndSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TCGenerator;