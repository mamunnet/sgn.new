// Student type
export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;  // Made required
  admissionNo: string;
  rollNo?: string;
  createdAt: string;
  updatedAt: string;
}

// Fee type
export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  month: number;
  year: number;
  amount: number;
  finalAmount?: number;
  totalAmount?: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  discount?: number;
  discountType?: string;
  additionalFees?: AdditionalFee[];
  createdAt: string;
  updatedAt: string;
}

// Additional Fee type
export interface AdditionalFee {
  type: 'REGISTRATION' | 'LABORATORY' | 'LIBRARY' | 'ACTIVITY';
  amount: number;
  feeType: 'one-time' | 'annual' | 'monthly';
}

// Fee Payment type
export interface FeePayment {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  totalAmount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'online' | 'cheque';
  receiptNo: string;
  discountApplied?: number;
  discountType?: string;
  additionalFees?: AdditionalFee[];
  createdAt: string;
}
