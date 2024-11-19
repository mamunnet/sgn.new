import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  Calendar, 
  Search, 
  Printer, 
  Filter,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { Fee, FeePayment, Student, AdditionalFee } from '../../types/index';
import FeeReceiptModal from './FeeReceiptModal';

const FeesManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStudentFeeSettingsModal, setShowStudentFeeSettingsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fee structure constants
  const DEFAULT_CLASS_FEES = {
    'PLAYGROUP': { tuitionFee: 250, examFee: 100, sportsFee: 50 },
    'NURSERY': { tuitionFee: 250, examFee: 100, sportsFee: 50 },
    'KG': { tuitionFee: 250, examFee: 100, sportsFee: 50 },
    'I': { tuitionFee: 350, examFee: 150, sportsFee: 75 },
    'II': { tuitionFee: 350, examFee: 150, sportsFee: 75 },
    'III': { tuitionFee: 350, examFee: 150, sportsFee: 75 },
    'IV': { tuitionFee: 350, examFee: 150, sportsFee: 75 },
    'V': { tuitionFee: 350, examFee: 150, sportsFee: 75 },
    'VI': { tuitionFee: 450, examFee: 200, sportsFee: 100 },
    'VII': { tuitionFee: 450, examFee: 200, sportsFee: 100 },
    'VIII': { tuitionFee: 450, examFee: 200, sportsFee: 100 },
    'IX': { tuitionFee: 450, examFee: 200, sportsFee: 100 },
    'X': { tuitionFee: 450, examFee: 200, sportsFee: 100 },
  } as const;

  // Additional fees structure
  const ADDITIONAL_FEES = {
    'REGISTRATION': { amount: 200, type: 'one-time' },
    'LABORATORY': { amount: 150, type: 'annual' },
    'LIBRARY': { amount: 100, type: 'annual' },
    'ACTIVITY': { amount: 200, type: 'annual' }
  } as const;

  // Discount types
  const DISCOUNT_TYPES = {
    'SIBLING': 10,
    'MERIT': 15,
    'STAFF_WARD': 20
  } as const;

  const [classFees, setClassFees] = useState(DEFAULT_CLASS_FEES);
  const [showFeeSettingsModal, setShowFeeSettingsModal] = useState(false);
  const [loadingFeeStructure, setLoadingFeeStructure] = useState(true);

  // Load fee structure from Firebase
  useEffect(() => {
    const loadFeeStructure = async () => {
      try {
        const feeStructureDoc = await getDocs(collection(db, 'feeStructure'));
        if (!feeStructureDoc.empty) {
          const data = feeStructureDoc.docs[0].data();
          setClassFees(data.classFees || DEFAULT_CLASS_FEES);
        } else {
          // If no fee structure exists, create one with default values
          await addDoc(collection(db, 'feeStructure'), {
            classFees: DEFAULT_CLASS_FEES,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading fee structure:', error);
        toast.error('Error loading fee structure');
      } finally {
        setLoadingFeeStructure(false);
      }
    };

    loadFeeStructure();
  }, []);

  const calculateBaseFee = (studentClass: string): number => {
    const normalizedClass = studentClass.toUpperCase();
    const classFeeStructure = classFees[normalizedClass as keyof typeof classFees];
    if (!classFeeStructure) return 350; // Default fee if class not found
  
    // Sum up all fees for the class
    return Object.values(classFeeStructure).reduce((sum, fee) => sum + fee, 0);
  };

  const generateFee = async (student: Student) => {
    try {
      setIsGenerating(true);
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Check if fee already exists for this month
      const existingFeeQuery = query(
        collection(db, 'fees'),
        where('studentId', '==', student.id),
        where('month', '==', month),
        where('year', '==', year)
      );

      const existingFeeDocs = await getDocs(existingFeeQuery);
      if (!existingFeeDocs.empty) {
        toast.error('Fee already generated for this month');
        return;
      }

      const baseFee = calculateBaseFee(student.class);
      
      // Calculate due date based on student's settings or default to 10th
      const dueDateDay = student.feeSettings?.dueDateDay || 10;
      const dueDate = new Date(year, month - 1, dueDateDay);

      // Check if the start date has been reached
      if (student.feeSettings?.startDate) {
        const startDate = new Date(student.feeSettings.startDate);
        if (currentDate < startDate) {
          toast.error('Fee generation date is before student\'s start date');
          return;
        }
      }

      const feeData: Omit<Fee, 'id'> = {
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        month,
        year,
        amount: baseFee,
        finalAmount: baseFee,
        totalAmount: baseFee,
        dueDate: dueDate.toISOString(),
        status: 'pending',
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
      };

      const feeRef = await addDoc(collection(db, 'fees'), feeData);
      const newFee: Fee = { id: feeRef.id, ...feeData };
      
      setFees(prevFees => [...prevFees, newFee]);
      toast.success('Fee generated successfully');
    } catch (error) {
      console.error('Error generating fee:', error);
      toast.error('Error generating fee');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        setStudents(studentsData);

        // Fetch fees for selected month and year
        const feesQuery = query(
          collection(db, 'fees'),
          where('month', '==', selectedMonth),
          where('year', '==', selectedYear)
        );
        const feesSnapshot = await getDocs(feesQuery);
        const feesData = feesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Fee[];
        setFees(feesData);

        // Fetch all payments for the fees
        const feeIds = feesData.map(fee => fee.id);
        if (feeIds.length > 0) {
          const paymentsQuery = query(
            collection(db, 'feePayments'),
            where('feeId', 'in', feeIds)
          );
          const paymentsSnapshot = await getDocs(paymentsQuery);
          const paymentsData = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as FeePayment[];
          setPayments(paymentsData);
        } else {
          setPayments([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  const recordPayment = async (fee: Fee) => {
    try {
      const paymentData: Omit<FeePayment, 'id'> = {
        feeId: fee.id,
        studentId: fee.studentId,
        amount: fee.finalAmount || fee.amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: 'cash',
        receiptNo: `RCP${Date.now()}`,
        createdAt: new Date().toISOString(),
        discountApplied: fee.discount,
        discountType: fee.discountType,
        additionalFees: fee.additionalFees,
        totalAmount: fee.totalAmount || fee.amount
      };

      // Add payment record
      const paymentRef = await addDoc(collection(db, 'feePayments'), paymentData);
      const payment: FeePayment = { id: paymentRef.id, ...paymentData };

      // Update fee status
      await updateDoc(doc(db, 'fees', fee.id), {
        status: 'paid',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setPayments(prevPayments => [...prevPayments, payment]);
      setFees(prevFees => 
        prevFees.map(f => f.id === fee.id ? { ...f, status: 'paid' } : f)
      );

      // Show receipt
      setSelectedPayment(payment);
      setShowReceiptModal(true);

      toast.success('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Error recording payment');
    }
  };

  const applyDiscount = async (fee: Fee, discountType: keyof typeof DISCOUNT_TYPES) => {
    try {
      const discountPercent = DISCOUNT_TYPES[discountType];
      const discountAmount = (fee.amount * discountPercent) / 100;
      const finalAmount = fee.amount - discountAmount;

      await updateDoc(doc(db, 'fees', fee.id), {
        discount: discountAmount,
        discountType,
        finalAmount,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setFees(fees.map(f => 
        f.id === fee.id ? { 
          ...f, 
          discount: discountAmount, 
          discountType, 
          finalAmount 
        } : f
      ));

      toast.success(`${discountType} discount applied successfully`);
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Error applying discount');
    }
  };

  const addAdditionalFee = async (fee: Fee, feeType: AdditionalFee['type']) => {
    try {
      const additionalFee = ADDITIONAL_FEES[feeType];
      const newAdditionalFees: AdditionalFee[] = [...(fee.additionalFees || []), {
        type: feeType,
        amount: additionalFee.amount,
        feeType: additionalFee.type as 'one-time' | 'annual' | 'monthly'
      }];

      const totalAdditionalAmount = newAdditionalFees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalAmount = fee.amount + totalAdditionalAmount;

      await updateDoc(doc(db, 'fees', fee.id), {
        additionalFees: newAdditionalFees,
        totalAmount,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setFees(fees.map(f => 
        f.id === fee.id ? { 
          ...f, 
          additionalFees: newAdditionalFees,
          totalAmount 
        } : f
      ));

      toast.success(`${feeType} fee added successfully`);
    } catch (error) {
      console.error('Error adding additional fee:', error);
      toast.error('Error adding additional fee');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = 
      fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || fee.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const FeeSettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [tempClassFees, setTempClassFees] = useState(classFees);
    const [saving, setSaving] = useState(false);

    const handleFeeChange = (
      className: keyof typeof DEFAULT_CLASS_FEES,
      feeType: keyof typeof DEFAULT_CLASS_FEES[keyof typeof DEFAULT_CLASS_FEES],
      value: string
    ) => {
      const numValue = parseInt(value) || 0;
      setTempClassFees(prev => ({
        ...prev,
        [className]: {
          ...prev[className],
          [feeType]: numValue
        }
      }));
    };

    const handleSave = async () => {
      try {
        setSaving(true);
        
        // Get the current fee structure document
        const feeStructureQuery = await getDocs(collection(db, 'feeStructure'));
        
        if (!feeStructureQuery.empty) {
          // Update existing fee structure
          const docRef = doc(db, 'feeStructure', feeStructureQuery.docs[0].id);
          await updateDoc(docRef, {
            classFees: tempClassFees,
            updatedAt: new Date().toISOString()
          });
        } else {
          // Create new fee structure if none exists
          await addDoc(collection(db, 'feeStructure'), {
            classFees: tempClassFees,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        setClassFees(tempClassFees);
        toast.success('Fee structure updated successfully');
        onClose();
      } catch (error) {
        console.error('Error saving fee structure:', error);
        toast.error('Error saving fee structure');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Fee Structure Settings</h2>
          
          <div className="space-y-6">
            {Object.entries(tempClassFees).map(([className, fees]) => (
              <div key={className} className="border-b pb-4">
                <h3 className="font-semibold mb-2">Class {className}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(fees).map(([feeType, amount]) => (
                    <div key={feeType} className="flex flex-col">
                      <label className="text-sm text-gray-600 mb-1">
                        {feeType.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleFeeChange(
                          className as keyof typeof DEFAULT_CLASS_FEES,
                          feeType as keyof typeof DEFAULT_CLASS_FEES[keyof typeof DEFAULT_CLASS_FEES],
                          e.target.value
                        )}
                        className="border rounded px-3 py-2"
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StudentFeeSettingsModal = ({ student, onClose }: { student: Student; onClose: () => void }) => {
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
      startDate: student.feeSettings?.startDate || new Date().toISOString().split('T')[0],
      dueDateDay: student.feeSettings?.dueDateDay || 10,
      customFeeStructure: student.feeSettings?.customFeeStructure || false
    });

    const handleSave = async () => {
      try {
        setSaving(true);
        
        // Update student document with fee settings
        await updateDoc(doc(db, 'students', student.id), {
          feeSettings: settings,
          updatedAt: new Date().toISOString()
        });

        // Update local state
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s.id === student.id
              ? { ...s, feeSettings: settings }
              : s
          )
        );

        toast.success('Fee settings updated successfully');
        onClose();
      } catch (error) {
        console.error('Error saving fee settings:', error);
        toast.error('Error saving fee settings');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Fee Settings for {student.name}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Start Date
              </label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
                className="w-full border rounded-md px-3 py-2"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Due Date (Day of Month)
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={settings.dueDateDay}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  dueDateDay: parseInt(e.target.value) || 1
                }))}
                className="w-full border rounded-md px-3 py-2"
                disabled={saving}
              />
              <p className="text-sm text-gray-500 mt-1">
                Choose a day between 1-28 when monthly fees will be due
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="customFeeStructure"
                checked={settings.customFeeStructure}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  customFeeStructure: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                disabled={saving}
              />
              <label htmlFor="customFeeStructure" className="ml-2 block text-sm text-gray-900">
                Enable custom fee structure for this student
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fees Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowFeeSettingsModal(true)}
            disabled={loadingFeeStructure}
            className={`flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${
              loadingFeeStructure ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loadingFeeStructure ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Filter className="h-5 w-5 mr-2" />
                Fee Settings
              </>
            )}
          </button>
          <button
            onClick={() => generateFee(students[0])}
            disabled={loading || isGenerating || loadingFeeStructure}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              loading || isGenerating || loadingFeeStructure ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading || isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Generate Fee
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Search by name or ID..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{fees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Collected</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{fees.filter(f => f.status === 'paid')
                    .reduce((sum, fee) => sum + fee.amount, 0)
                    .toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{fees.filter(f => f.status === 'pending')
                    .reduce((sum, fee) => sum + fee.amount, 0)
                    .toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{fees.filter(f => f.status === 'overdue')
                    .reduce((sum, fee) => sum + fee.amount, 0)
                    .toLocaleString()}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fee.studentName}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {fee.studentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{fee.finalAmount || fee.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-3">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => recordPayment(fee)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Record Payment"
                        >
                          <DollarSign className="h-5 w-5" />
                        </button>
                      )}
                      {fee.status === 'paid' && (
                        <button
                          onClick={() => {
                            const payment = payments.find(p => p.feeId === fee.id);
                            if (payment) {
                              setSelectedPayment(payment);
                              setShowReceiptModal(true);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Receipt"
                        >
                          <Printer className="h-5 w-5" />
                        </button>
                      )}
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => applyDiscount(fee, 'SIBLING')}
                          className="text-orange-600 hover:text-orange-900"
                          title="Apply Sibling Discount"
                        >
                          <Filter className="h-5 w-5" />
                        </button>
                      )}
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => addAdditionalFee(fee, 'REGISTRATION')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Add Registration Fee"
                        >
                          <Calendar className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedStudent(students.find(s => s.id === fee.studentId) || null);
                          setShowStudentFeeSettingsModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Fee Settings"
                      >
                        <Filter className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No fees found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FeeReceiptModal
            payment={selectedPayment}
            student={students.find(s => s.id === selectedPayment.studentId) || {
              id: '',
              name: '',
              admissionNo: '',
              class: '',
              section: '',
              createdAt: '',
              updatedAt: ''
            }}
            fee={fees.find(f => f.id === selectedPayment.feeId) || {
              id: '',
              studentId: '',
              studentName: '',
              class: '',
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              amount: 0,
              dueDate: new Date().toISOString(),
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            onClose={() => setShowReceiptModal(false)}
          />
        </div>
      )}

      {showFeeSettingsModal && (
        <FeeSettingsModal onClose={() => setShowFeeSettingsModal(false)} />
      )}

      {showStudentFeeSettingsModal && selectedStudent && (
        <StudentFeeSettingsModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentFeeSettingsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default FeesManager;