import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  feeAmount: number;
  feeType: string;
  academicYear: string;
  month: string;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  feeAmount,
  feeType,
  academicYear,
  month,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cheque'>('cash');
  const [chequeNumber, setChequeNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Validate cheque number if payment method is cheque
      if (paymentMethod === 'cheque' && !chequeNumber.trim()) {
        toast.error('Please enter cheque number');
        return;
      }

      // Generate receipt number
      const receiptNo = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create payment record
      const paymentData = {
        studentId: student.id,
        amount: feeAmount,
        paymentDate: new Date().toISOString(),
        paymentMethod,
        receiptNo,
        remarks: remarks.trim() || undefined,
        ...(paymentMethod === 'cheque' && { chequeNumber }),
        createdAt: serverTimestamp()
      };

      // Add payment record
      const paymentRef = await addDoc(collection(db, 'feePayments'), paymentData);

      // Update fee status to paid
      const feeRef = doc(db, 'fees', student.id);
      await updateDoc(feeRef, {
        status: 'paid',
        paymentId: paymentRef.id,
        updatedAt: serverTimestamp()
      });

      toast.success('Payment recorded successfully');
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Record Fee Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Student Details */}
          <div>
            <p className="text-sm text-gray-600">Student Name</p>
            <p className="font-medium">{student.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Fee Details</p>
            <p className="font-medium">{feeType} - {month} {academicYear}</p>
            <p className="text-lg font-semibold text-blue-600">₹{feeAmount.toLocaleString()}</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                  className="mr-2"
                />
                Cash
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cheque"
                  checked={paymentMethod === 'cheque'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cheque')}
                  className="mr-2"
                />
                Cheque
              </label>
            </div>
          </div>

          {/* Cheque Number */}
          {paymentMethod === 'cheque' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cheque Number
              </label>
              <input
                type="text"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter cheque number"
              />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Add any additional notes"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Record Payment'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal;
