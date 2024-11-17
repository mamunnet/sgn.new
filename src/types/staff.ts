export interface Staff {
  id: string;
  name: string;
  position: string;
  qualification: string;
  experience: string;
  expertise: string[];
  email: string;
  phone: string;
  bio: string;
  photoUrl: string;
  storagePath?: string;
  joinDate: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}