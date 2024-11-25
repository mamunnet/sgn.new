import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Plus, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Photo {
  id: string;
  url: string;
  category: string;
  title: string;
  timestamp: any;
}

const GalleryManager = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [photoData, setPhotoData] = useState({
    title: '',
    category: 'campus' // default category
  });

  const categories = [
    { id: 'campus', label: 'Campus Life' },
    { id: 'events', label: 'Events & Programs' },
    { id: 'activities', label: 'Student Activities' },
    { id: 'facilities', label: 'Facilities' },
  ];

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !photoData.title || !photoData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `gallery/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // Add document to Firestore
      await addDoc(collection(db, 'gallery'), {
        url: downloadUrl,
        title: photoData.title,
        category: photoData.category,
        timestamp: new Date()
      });

      toast.success('Photo uploaded successfully');
      setUploadOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error uploading photo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Delete from Storage
        const storageRef = ref(storage, photo.url);
        await deleteObject(storageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, 'gallery', photo.id));
        
        toast.success('Photo deleted successfully');
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast.error('Error deleting photo');
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPhotoData({
      title: '',
      category: 'campus'
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Photo Gallery Manager</h2>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Photo
        </button>
      </div>

      {/* Upload Modal */}
      {uploadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-lg w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upload New Photo</h3>
              <button
                onClick={() => setUploadOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 object-contain mb-4"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  )}
                  <span className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </span>
                </label>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={photoData.title}
                  onChange={(e) => setPhotoData({ ...photoData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter photo title"
                />
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={photoData.category}
                  onChange={(e) => setPhotoData({ ...photoData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{photo.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">
                  {photo.category.replace('-', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(photo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManager;
