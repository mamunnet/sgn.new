import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, AlertCircle } from 'lucide-react';
import PaymentModal from '../components/admin/PaymentModal';
import FeeReceiptModal from '../components/admin/FeeReceiptModal';

interface Fee {
  id: string;
  studentId: string;
  type: string;
  dueDate: string;
  amount: number;
  status: string;
  academicYear: string;
  month: string;
}

interface FeePayment {
  id: string;
  feeId: string;
  paymentDate: string;
  amount: number;
}

const StudentFees = () => {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber.trim()) {
      toast.error('Please enter admission number');
      return;
    }

    setLoading(true);
    try {
      // Fetch student data using admissionNo field
      const studentsRef = collection(db, 'students');
      const studentQuery = query(studentsRef, where('admissionNo', '==', admissionNumber));
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        toast.error('Student not found');
        setStudentData(null);
        return;
      }

      const studentDoc = studentSnapshot.docs[0];
      const student = {
        id: studentDoc.id,
        ...studentDoc.data()
      };

      // Fetch fee details
      const feesRef = collection(db, 'fees');
      const feesQuery = query(feesRef, where('studentId', '==', student.id));
      const feesSnapshot = await getDocs(feesQuery);
      
      const fees = feesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Fee[];

      // Fetch payment details for paid fees
      const paidFees = fees.filter(fee => fee.status === 'paid');
      const payments: FeePayment[] = [];

      if (paidFees.length > 0) {
        const paymentsRef = collection(db, 'feePayments');
        for (const fee of paidFees) {
          const paymentQuery = query(paymentsRef, where('feeId', '==', fee.id));
          const paymentSnapshot = await getDocs(paymentQuery);
          if (!paymentSnapshot.empty) {
            payments.push({
              id: paymentSnapshot.docs[0].id,
              ...paymentSnapshot.docs[0].data()
            } as FeePayment);
          }
        }
      }

      setStudentData({
        ...student,
        fees: fees.map(fee => {
          const payment = payments.find(p => p.feeId === fee.id);
          return {
            ...fee,
            payment
          };
        })
      });
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Error fetching student data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (fee: any) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  const handleViewReceipt = (fee: any) => {
    if (fee.payment) {
      setSelectedPayment(fee.payment);
      setShowReceiptModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Fee Payment</h1>
          <p className="text-gray-600">Enter admission number to view and pay fees</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="Enter Admission Number"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Student Details and Fees */}
        {studentData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Student Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Student Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{studentData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium">{studentData.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-medium">{studentData.admissionNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-medium">{studentData.rollNumber}</p>
                </div>
              </div>
            </div>

            {/* Fee Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Fee Details</h2>
              {studentData.fees && studentData.fees.length > 0 ? (
                <div className="space-y-4">
                  {studentData.fees.map((fee: any) => (
                    <div
                      key={fee.id}
                      className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-semibold text-lg">{fee.type}</h3>
                        <p className="text-gray-600">Due Date: {fee.dueDate}</p>
                        <p className="text-lg font-bold text-blue-600">₹{fee.amount}</p>
                      </div>
                      {fee.status === 'pending' && (
                        <button
                          onClick={() => handlePayNow(fee)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                        >
                          Pay Now
                        </button>
                      )}
                      {fee.status === 'paid' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                          <button
                            onClick={() => handleViewReceipt(fee)}
                            className="text-blue-600 hover:text-blue-700 underline text-sm"
                          >
                            View Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending fees found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && studentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedFee(null);
          }}
          student={studentData}
          feeAmount={selectedFee.amount}
          feeType={selectedFee.type}
          academicYear={selectedFee.academicYear}
          month={selectedFee.month}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            setSelectedFee(null);
            handleSearch(new Event('submit') as any);
          }}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && studentData && (
        <FeeReceiptModal
          payment={selectedPayment}
          student={studentData}
          fee={selectedFee}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentFees;
