import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, AlertCircle, CreditCard, Calendar, IndianRupee, User, BookOpen, Hash, FileText, DollarSign, ClipboardCheck } from 'lucide-react';
import PaymentModal from '../components/admin/PaymentModal';
import FeeReceiptModal from '../components/admin/FeeReceiptModal';
import { initializeRazorpay, openRazorpayCheckout, RazorpayOptions } from '../utils/razorpay';

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
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

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

  const handleAdvancePayment = async () => {
    try {
      const amount = parseInt(advanceAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      await initializeRazorpay();

      // Create a new order in Firebase
      const ordersRef = collection(db, 'orders');
      const orderDoc = await addDoc(ordersRef, {
        studentId: studentData.id,
        amount: amount * 100, // Razorpay expects amount in paise
        status: 'pending',
        type: 'advance',
        createdAt: new Date().toISOString(),
      });

      // Test mode configuration
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Using test key from environment variables
        amount: amount * 100,
        currency: 'INR',
        name: 'SGN School',
        description: 'Advance Fee Payment',
        handler: async (response: any) => {
          // Update order status and create payment record
          await updateDoc(doc(db, 'orders', orderDoc.id), {
            status: 'completed',
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          // Create payment record
          await addDoc(collection(db, 'feePayments'), {
            studentId: studentData.id,
            amount: amount,
            type: 'advance',
            paymentMethod: 'online',
            paymentId: response.razorpay_payment_id,
            orderId: orderDoc.id,
            createdAt: new Date().toISOString(),
          });

          toast.success('Advance payment successful!');
          setShowAdvanceModal(false);
          setAdvanceAmount('');
        },
        prefill: {
          name: studentData.name || 'Test User',
          email: studentData.email || 'test@example.com',
          contact: studentData.phone || '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
        notes: {
          address: 'Test Mode Payment'
        },
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay using test card',
                instruments: [
                  {
                    method: 'card',
                    card: {
                      number: '4111111111111111',
                      expiry: '12/25',
                      cvv: '123'
                    }
                  }
                ]
              }
            }
          }
        }
      };

      openRazorpayCheckout(options);
    } catch (error) {
      console.error('Error processing advance payment:', error);
      toast.error('Failed to process payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Fee Management</h1>
          <p className="text-lg text-gray-600">Search student by admission number to manage fees</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform hover:shadow-xl transition-all duration-300">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="Enter Admission Number"
                className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Student Details and Fees */}
        {studentData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Student Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="h-4 w-4" />
                    <p className="text-sm">Name</p>
                  </div>
                  <p className="font-medium text-lg">{studentData.name}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <p className="text-sm">Class</p>
                  </div>
                  <p className="font-medium text-lg">{studentData.class}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Hash className="h-4 w-4" />
                    <p className="text-sm">Admission Number</p>
                  </div>
                  <p className="font-medium text-lg">{studentData.admissionNo}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Hash className="h-4 w-4" />
                    <p className="text-sm">Roll Number</p>
                  </div>
                  <p className="font-medium text-lg">{studentData.rollNumber || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Fee Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <IndianRupee className="h-6 w-6 text-blue-600" />
                  Fee Details
                </h2>
                <button
                  onClick={() => setShowAdvanceModal(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Pay Advance
                </button>
              </div>
              {studentData.fees && studentData.fees.length > 0 ? (
                <div className="grid gap-4">
                  {studentData.fees.map((fee: any) => (
                    <div
                      key={fee.id}
                      className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">{fee.type}</h3>
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {fee.dueDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4" />
                              <span className="text-lg font-bold text-blue-600">₹{fee.amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {fee.status === 'pending' ? (
                            <button
                              onClick={() => handlePayNow(fee)}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <CreditCard className="h-5 w-5" />
                              Pay Now
                            </button>
                          ) : (
                            <>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Paid
                              </span>
                              <button
                                onClick={() => handleViewReceipt(fee)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Receipt
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No fee records found</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">View Fee Details</h3>
                <p className="text-gray-600">Access complete fee history and payment records for any student</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Process Payments</h3>
                <p className="text-gray-600">Record fee payments and generate digital receipts instantly</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <ClipboardCheck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Due Dates</h3>
                <p className="text-gray-600">Monitor payment schedules and manage due dates efficiently</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Enter Admission Number</h3>
                    <p className="text-gray-600">Type the student's admission number in the search box above</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">View Details</h3>
                    <p className="text-gray-600">Access student information and fee payment history</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Process Payment</h3>
                    <p className="text-gray-600">Record payments and generate digital receipts</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Payment Modal */}
        {showPaymentModal && selectedFee && (
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
              handleSearch({ preventDefault: () => {} } as React.FormEvent);
            }}
          />
        )}

        {/* Receipt Modal */}
        {showReceiptModal && selectedPayment && (
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

        {/* Advance Payment Modal */}
        {showAdvanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Pay Advance Fee</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdvancePayment}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Pay Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFees;
