export interface Student {
  id: string;
  admissionNo: string;
  tempRollNo?: string;
  rollNo: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  religion: string;
  category: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  previousSchool: string;
  previousSchoolMarks: {
    year: string;
    percentage: string;
    subjects: {
      name: string;
      marks: string;
    }[];
  };
  class: string;
  section: string;
  admissionDate: string;
  bloodGroup: string;
  aadharNo: string;
  photoUrl: string;
  facility: 'day' | 'boarding' | 'both';
  createdAt: string;
  updatedAt: string;
}