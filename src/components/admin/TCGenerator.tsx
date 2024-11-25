import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Eye, Download, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';
import { AnimatePresence } from 'framer-motion';
import TCPreview from './TCPreview';

interface Student {
  id: string;
  name: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  class: string;
  gender: string;
  admissionDate: string;
  address: string;
  rollNo?: string;
  tempRollNo?: string;
  currentClass?: string;
}

interface Certificate {
  id: string;
  serialNo: string;
  studentName: string;
  currentClass: string;
  generatedAt: any;
  date: string;
  fatherName: string;
  motherName: string;
  village: string;
  district: string;
  state: string;
  admissionDate: string;
  examYear: string;
  examBoard: string;
  dateOfBirth: string;
  character: string;
  reasonForLeaving: string;
  anyOtherRemarks: string;
}

const TCGenerator = () => {
  const [user] = useAuthState(auth);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'new' | 'existing'>('new');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  // Generate serial number
  const generateSerialNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SGN${random}/${month}/${year}`;
  };

  const [formData, setFormData] = useState<Omit<Certificate, 'id' | 'generatedAt'>>({
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
    anyOtherRemarks: ''
  });

  useEffect(() => {
    if (!user) return;

    const classesRef = collection(db, 'classes');
    const classesQuery = query(classesRef, orderBy('name'));

    const classesUnsubscribe = onSnapshot(classesQuery, (snapshot) => {
      const classesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setClasses(classesData);
    });

    const studentsRef = collection(db, 'students');
    let studentsQuery = query(studentsRef);

    if (selectedClass) {
      const selectedClassName = classes.find(cls => cls.id === selectedClass)?.name;
      if (selectedClassName) {
        studentsQuery = query(studentsRef, where('class', '==', selectedClassName));
      }
    }

    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsData);
    });

    // Fetch certificates
    const q = query(
      collection(db, 'certificates'),
      orderBy('generatedAt', 'desc')
    );

    const certificatesUnsubscribe = onSnapshot(q, (snapshot) => {
      const certificateData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Certificate[];
      setCertificates(certificateData);
    });

    return () => {
      unsubscribe();
      classesUnsubscribe();
      certificatesUnsubscribe();
    };
  }, [user, selectedClass]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const student = students.find(s => s.id === e.target.value);
    setSelectedStudent(student || null);
    if (student) {
      setFormData({
        ...formData,
        studentName: student.name,
        fatherName: student.fatherName,
        motherName: student.motherName,
        dateOfBirth: student.dateOfBirth,
        currentClass: student.class,
        admissionDate: student.admissionDate,
        village: student.address.split(',')[0] || '',
        district: student.address.split(',')[1] || '',
        state: student.address.split(',')[2] || ''
      });
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    
    setPreviewMode('new');
    setShowPreview(true);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setPreviewMode('existing');
    setShowPreview(true);
  };

  const handleGenerateAndSave = async () => {
    try {
      if (!selectedStudent || !user) {
        toast.error('Please select a student and ensure you are logged in');
        return;
      }
      
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
        generatedAt: serverTimestamp(),
        generatedBy: user.uid,
        generatedByEmail: user.email,
        anyOtherRemarks: formData.anyOtherRemarks || ''
      });

      toast.success('Certificate generated and saved successfully');
      setShowPreview(false);
      setSelectedStudent(null);
      
      // Reset form
      setFormData({
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
        anyOtherRemarks: ''
      });
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.error('Error saving certificate');
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      // First show the preview
      setSelectedCertificate(certificate);
      setPreviewMode('existing');
      setShowPreview(true);

      // Wait for the preview to be rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      const element = document.getElementById('certificate-preview');
      if (!element) {
        throw new Error('Preview element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
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
      
      // Close the preview after download
      setShowPreview(false);
      setSelectedCertificate(null);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Error downloading certificate');
    }
  };

  const formatFirestoreDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.currentClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Generate Transfer Certificate</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Class Filter */}
            <div className="col-span-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Filter by Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
      </div>

      {/* Certificate Records */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">View Records</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{certificate.serialNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{certificate.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{certificate.currentClass}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFirestoreDate(certificate.generatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="text-emerald-600 hover:text-emerald-900"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <TCPreview
              data={
                previewMode === 'new'
                  ? {
                      ...formData,
                      anyOtherRemarks: formData.anyOtherRemarks || '',
                      gender: selectedStudent?.gender || 'male'
                    }
                  : {
                      ...selectedCertificate!,
                      anyOtherRemarks: selectedCertificate?.anyOtherRemarks || ''
                    }
              }
              onClose={() => {
                setShowPreview(false);
                if (previewMode === 'existing') {
                  setSelectedCertificate(null);
                }
              }}
              onGenerate={handleGenerateAndSave}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TCGenerator;