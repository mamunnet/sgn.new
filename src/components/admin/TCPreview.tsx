import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface TCPreviewProps {
  data: {
    serialNo: string;
    date: string;
    studentName: string;
    fatherName: string;
    motherName: string;
    village: string;
    district: string;
    state: string;
    admissionDate: string;
    currentClass: string;
    examYear: string;
    examBoard: string;
    dateOfBirth: string;
    character: string;
    reasonForLeaving: string;
    anyOtherRemarks: string;
    gender?: string; // Added gender field
  };
  onClose: () => void;
  onGenerate: () => void;
}

const TCPreview: React.FC<TCPreviewProps> = ({ data, onClose, onGenerate }) => {
  // Helper function to get gender-specific pronouns
  const getPronouns = () => {
    const gender = data.gender?.toLowerCase() || 'male';
    return {
      childType: gender === 'female' ? 'Daughter' : 'Son',
      subjective: gender === 'female' ? 'She' : 'He',
      possessive: gender === 'female' ? 'Her' : 'His',
      objective: gender === 'female' ? 'her' : 'him'
    };
  };

  const pronouns = getPronouns();

  const dateToWords = (date: string) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('en-US', { dateStyle: 'long' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('certificate-preview');
      if (!element) {
        throw new Error('Preview element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9f4e8'
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
      pdf.save(`TC_${data.studentName}_${data.serialNo}.pdf`);

      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full p-8 print:p-0 print:shadow-none"
        onClick={e => e.stopPropagation()}
      >
        <div 
          id="certificate-preview" 
          className="relative bg-[#f9f4e8] p-12 min-h-[842px] w-full mx-auto print:w-[210mm] print:h-[297mm]"
        >
          {/* Decorative Border */}
          <div className="absolute inset-0 border-[16px] border-double border-[#234f1e] m-4"></div>
          
          {/* Inner Border */}
          <div className="absolute inset-0 border-2 border-[#234f1e] m-8"></div>

          {/* Background Watermark */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0.05 }}
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/mamunnet/sgn_academy@32a228d99eda383a1e5ce39ca8f143b62a0ef4c6/public/assets/logo.png"
              alt=""
              className="w-3/4 h-auto"
              style={{ filter: 'grayscale(100%)' }}
            />
          </div>

          {/* Certificate Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <img 
                src="https://cdn.jsdelivr.net/gh/mamunnet/sgn_academy@32a228d99eda383a1e5ce39ca8f143b62a0ef4c6/public/assets/logo.png"
                alt="SGN Academy"
                className="w-24 mx-auto mb-4"
              />
              <h1 className="text-4xl font-bold text-[#234f1e] mb-2 font-serif">SGN ACADEMY</h1>
              <p className="text-base text-gray-700 font-serif">Haripur, Rajarampur, Lalgola, Murshidabad</p>
              <p className="text-base text-gray-700 font-serif">Phone: 8017528621</p>
              <p className="text-base text-gray-700 font-serif">DISE Code: 45748</p>
              
              <div className="flex justify-between items-center text-gray-700 mb-6 px-4">
                <span className="text-lg font-serif">Sl. No: {data.serialNo}</span>
                <span className="text-lg font-serif">Date: {new Date(data.date).toLocaleDateString()}</span>
              </div>
              
              <h2 className="text-3xl font-bold text-[#234f1e] border-2 border-[#234f1e] inline-block px-8 py-2 font-serif">
                TRANSFER CERTIFICATE
              </h2>
            </div>

            {/* Certificate Body */}
            <div className="space-y-6 text-gray-800 leading-relaxed font-serif text-lg">
              <p>
                This is to certify that <span className="font-semibold">{data.studentName}</span>
              </p>
              <p>
                {pronouns.childType} of <span className="font-semibold">{data.fatherName}</span> of
                Village/Town <span className="font-semibold">{data.village}</span> of District{' '}
                <span className="font-semibold">{data.district}</span>, State{' '}
                <span className="font-semibold">{data.state}</span>
              </p>
              <p>
                was admitted to this School on <span className="font-semibold">
                  {new Date(data.admissionDate).toLocaleDateString()}
                </span>
              </p>
              <p>
                {pronouns.subjective} was reading in class <span className="font-semibold">{data.currentClass}</span>{' '}
                and passed in class/detained in Class <span className="font-semibold">{data.currentClass}</span>
              </p>
              <p>
                {pronouns.subjective} passed/failed in the All India Secondary School Examination/All India Senior Secondary
                School Examination held in <span className="font-semibold">{data.examYear}</span> under
                the <span className="font-semibold">{data.examBoard}</span>
              </p>
              <p>All the dues are cleared.</p>
              <p>
                {pronouns.possessive} date of birth according to our Admission Register is{' '}
                <span className="font-semibold">{dateToWords(data.dateOfBirth)}</span>
              </p>
              <p>
                {pronouns.possessive} character and conduct were <span className="font-semibold">{data.character}</span>
              </p>

              {/* Reason for Leaving */}
              <div className="mt-8">
                <p className="font-semibold">Reason for leaving School:</p>
                <p>{data.reasonForLeaving}</p>
              </div>

              {/* Other Remarks */}
              {data.anyOtherRemarks && (
                <div className="mt-4">
                  <p className="font-semibold">Remarks:</p>
                  <p>{data.anyOtherRemarks}</p>
                </div>
              )}

              {/* Signature Section */}
              <div className="mt-16 flex justify-between items-end">
                <div>
                  <p>Date: {new Date(data.date).toLocaleDateString()}</p>
                  <p>Place: Lalgola</p>
                </div>
                <div className="relative">
                  {/* School Seal */}
                  <div 
                    className="absolute -top-24 right-4 w-32 h-32 border-2 border-[#234f1e] rounded-full flex items-center justify-center"
                    style={{ opacity: 0.3 }}
                  >
                    <div className="text-center text-[#234f1e] text-xs rotate-45">
                      <strong>SGN ACADEMY</strong>
                      <br />
                      OFFICIAL SEAL
                      <br />
                      LALGOLA
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 w-40 border-b-2 border-gray-600"></div>
                    <p className="font-semibold text-lg">Principal</p>
                    <p className="text-base">SGN Academy</p>
                    <p className="text-base">Lalgola, Murshidabad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={async () => {
              const success = await handleDownload();
              if (success) {
                onGenerate();
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate & Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TCPreview;