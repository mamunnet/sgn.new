export interface FeeStructure {
  id: string;
  class: string;
  monthlyFee: number;
  admissionFee: number;
  libraryFee: number;
  laboratoryFee: number;
  computerFee: number;
  examFee: number;
  sportsFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'online' | 'cheque';
  receiptNo: string;
  remarks?: string;
  createdAt: string;
}

export interface FeeReceipt {
  payment: FeePayment;
  student: {
    name: string;
    admissionNo: string;
    class: string;
    section: string;
  };
  fee: Fee;
}