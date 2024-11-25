import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Upload, X, Save } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  position: string;
  qualification: string;
  experience: string;
  email: string;
  phone: string;
  bio: string;
  joinDate: string;
  expertise: string[];
  photoUrl?: string;
  storagePath?: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  position: string;
  qualification: string;
  experience: string;
  email: string;
  phone: string;
  bio: string;
  joinDate: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  status: 'active' | 'inactive';
}

const StaffManager = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expertise, setExpertise] = useState<string[]>(['']);

  const initialFormState: FormData = {
    name: '',
    position: '',
    qualification: '',
    experience: '',
    email: '',
    phone: '',
    bio: '',
    joinDate: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    status: 'active'
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      setStaff(staffData);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertise = [...expertise];
    newExpertise[index] = value;
    setExpertise(newExpertise);
  };

  const addExpertise = () => {
    setExpertise([...expertise, '']);
  };

  const removeExpertise = (index: number) => {
    if (expertise.length > 1) {
      const newExpertise = expertise.filter((_, i) => i !== index);
      setExpertise(newExpertise);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = '';
      let storagePath = '';

      if (photoFile) {
        const photoRef = ref(storage, `staff/${Date.now()}_${photoFile.name}`);
        await uploadBytes(photoRef, photoFile);
        photoUrl = await getDownloadURL(photoRef);
        storagePath = photoRef.fullPath;
      }

      const staffData: Partial<Staff> = {
        ...formData,
        expertise: expertise.filter(e => e.trim() !== ''),
        photoUrl: photoUrl || (editingId ? staff.find(s => s.id === editingId)?.photoUrl : ''),
        storagePath: storagePath || (editingId ? staff.find(s => s.id === editingId)?.storagePath : ''),
        socialLinks: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          linkedin: formData.linkedin
        },
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        const oldStaff = staff.find(s => s.id === editingId);
        if (oldStaff?.storagePath && photoFile) {
          const oldStorageRef = ref(storage, oldStaff.storagePath);
          await deleteObject(oldStorageRef);
        }
        await updateDoc(doc(db, 'staff', editingId), staffData);
        toast.success('Staff updated successfully');
      } else {
        staffData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'staff'), staffData as Staff);
        toast.success('Staff added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Error saving staff');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setPhotoFile(null);
    setPhotoPreview('');
    setExpertise(['']);
    setEditingId(null);
  };

  const handleEdit = (staffMember: Staff) => {
    setFormData({
      name: staffMember.name,
      position: staffMember.position,
      qualification: staffMember.qualification,
      experience: staffMember.experience,
      email: staffMember.email,
      phone: staffMember.phone,
      bio: staffMember.bio,
      joinDate: staffMember.joinDate,
      facebook: staffMember.socialLinks?.facebook || '',
      twitter: staffMember.socialLinks?.twitter || '',
      linkedin: staffMember.socialLinks?.linkedin || '',
      status: staffMember.status
    });
    setExpertise(staffMember.expertise);
    setPhotoPreview(staffMember.photoUrl || '');
    setEditingId(staffMember.id);
  };

  const handleDelete = async (staffMember: Staff) => {
    try {
      if (staffMember.storagePath) {
        const storageRef = ref(storage, staffMember.storagePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'staff', staffMember.id));
      toast.success('Staff deleted successfully');
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Error deleting staff');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Staff</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Upload */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Photo
            </label>
            <div className="flex flex-col items-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Upload Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Join Date</label>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Expertise */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Areas of Expertise</label>
            <button
              type="button"
              onClick={addExpertise}
              className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More
            </button>
          </div>
          {expertise.map((exp, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={exp}
                onChange={(e) => handleExpertiseChange(index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g., Mathematics, Science, etc."
                required
              />
              {expertise.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExpertise(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook Profile</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="https://facebook.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Twitter Profile</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {editingId ? 'Update Staff' : 'Add Staff'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Staff List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((staffMember) => (
              <div
                key={staffMember.id}
                className="bg-gray-50 rounded-lg overflow-hidden shadow"
              >
                <img
                  src={staffMember.photoUrl}
                  alt={staffMember.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{staffMember.name}</h4>
                      <p className="text-gray-600">{staffMember.position}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      staffMember.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {staffMember.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{staffMember.qualification}</p>
                  <p className="text-gray-600">{staffMember.experience}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(staffMember)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No staff members added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffManager;