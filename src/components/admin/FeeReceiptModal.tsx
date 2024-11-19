import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { FeeReceipt } from '../../types/fees';
import { SCHOOL_INFO } from '../../utils/constants';

interface FeeReceiptModalProps {
  payment: FeeReceipt['payment'];
  student: FeeReceipt['student'];
  fee: FeeReceipt['fee'];
  onClose: () => void;
}

const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ 
  payment, 
  student, 
  fee, 
  onClose 
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('fee-receipt');
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
      pdf.save(`FeeReceipt_${student?.name || 'N/A'}_${payment?.receiptNo || 'N/A'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        className="bg-white rounded-lg max-w-2xl w-full p-8 print:p-0 print:shadow-none"
        onClick={e => e.stopPropagation()}
      >
        <div 
          id="fee-receipt" 
          className="bg-white p-8 min-h-[600px] relative print:w-[210mm] print:h-[297mm]"
        >
          {/* School Logo and Header */}
          <div className="text-center mb-8">
            <img 
              src="https://cdn.jsdelivr.net/gh/mamunnet/sgn_academy@32a228d99eda383a1e5ce39ca8f143b62a0ef4c6/public/assets/logo.png"
              alt="School Logo"
              className="w-24 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">{SCHOOL_INFO.name}</h1>
            <p className="text-gray-600">{SCHOOL_INFO.address}</p>
            <p className="text-gray-600">Phone: {SCHOOL_INFO.phone}</p>
          </div>

          {/* Receipt Details */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">FEE RECEIPT</h2>
                <p className="text-gray-600">Receipt No: {payment?.receiptNo || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">
                  Date: {payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Student Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-600">Student Name:</p>
                <p className="font-semibold">{student?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Admission No:</p>
                <p className="font-semibold">{student?.admissionNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Class:</p>
                <p className="font-semibold">{student?.class || 'N/A'} - {student?.section || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Month/Year:</p>
                <p className="font-semibold">
                  {fee?.month ? new Date(0, fee.month - 1).toLocaleString('default', { month: 'long' }) : 'N/A'} {fee?.year || new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tuition Fee</span>
                <span className="font-semibold">₹{(fee?.amount || 0).toLocaleString()}</span>
              </div>

              {/* Additional Fees */}
              {payment?.additionalFees?.map((additionalFee, index) => (
                <div key={index} className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">{additionalFee.type} Fee ({additionalFee.feeType})</span>
                  <span className="font-semibold">₹{additionalFee.amount.toLocaleString()}</span>
                </div>
              ))}

              {/* Discount if applied */}
              {payment?.discountApplied && payment.discountApplied > 0 && (
                <div className="flex justify-between items-center mb-4 text-red-600">
                  <span>{payment.discountType || 'Discount'}</span>
                  <span>-₹{payment.discountApplied.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-4">
                <span>Total Amount</span>
                <span>₹{(payment?.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <p className="text-gray-600">Payment Method:</p>
              <p className="font-semibold capitalize">{payment?.paymentMethod || 'N/A'}</p>
            </div>

            {/* Amount in Words */}
            <div className="mb-6">
              <p className="text-gray-600">Amount in Words:</p>
              <p className="font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(payment?.totalAmount || 0).replace(/^.*?\s/, '')} Only
              </p>
            </div>

            {/* Signature */}
            <div className="flex justify-end mt-12">
              <div className="text-center">
                <div className="w-40 border-b border-gray-400"></div>
                <p className="mt-2">Authorized Signature</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>This is a computer-generated receipt and does not require a signature.</p>
              <p>Thank you for your payment!</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <X className="h-5 w-5 mr-2" />
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeeReceiptModal;