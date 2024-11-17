import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Upload, X } from 'lucide-react';

const AlumniManager = () => {
  const [alumni, setAlumni] = useState([]);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [occupation, setOccupation] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'alumni'), (snapshot) => {
      const alumniData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlumni(alumniData);
    });

    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `alumni/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return { url: downloadUrl, path: storageRef.fullPath };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageData = null;

      if (selectedImage) {
        imageData = await uploadImage(selectedImage);
      }

      const alumniData = {
        name,
        batch,
        occupation,
        testimonial,
        updatedAt: new Date().toISOString()
      };

      if (imageData) {
        alumniData.photoUrl = imageData.url;
        alumniData.storagePath = imageData.path;
      }

      if (editingId) {
        const oldAlumni = alumni.find(a => a.id === editingId);
        if (oldAlumni?.storagePath && imageData) {
          // Delete old image if exists and new image is uploaded
          const oldStorageRef = ref(storage, oldAlumni.storagePath);
          await deleteObject(oldStorageRef);
        }
        await updateDoc(doc(db, 'alumni', editingId), alumniData);
        toast.success('Alumni updated successfully');
      } else {
        if (!imageData) {
          toast.error('Please upload an image');
          return;
        }
        await addDoc(collection(db, 'alumni'), alumniData);
        toast.success('Alumni added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving alumni:', error);
      toast.error('Error saving alumni');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setBatch('');
    setOccupation('');
    setTestimonial('');
    setSelectedImage(null);
    setPreviewUrl('');
    setEditingId(null);
  };

  const handleEdit = (alumnus) => {
    setName(alumnus.name);
    setBatch(alumnus.batch);
    setOccupation(alumnus.occupation);
    setTestimonial(alumnus.testimonial);
    setPreviewUrl(alumnus.photoUrl);
    setEditingId(alumnus.id);
  };

  const handleDelete = async (alumnus) => {
    try {
      // Delete image from storage
      if (alumnus.storagePath) {
        const storageRef = ref(storage, alumnus.storagePath);
        await deleteObject(storageRef);
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, 'alumni', alumnus.id));
      toast.success('Alumni deleted successfully');
    } catch (error) {
      console.error('Error deleting alumni:', error);
      toast.error('Error deleting alumni');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Alumni</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Batch Year
            </label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Current Occupation
          </label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Testimonial
          </label>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Photo
          </label>
          <div className="flex items-center space-x-4">
            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl('');
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide uppercase border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <Upload className="w-8 h-8 text-gray-500" />
              <span className="mt-2 text-base leading-normal">Select photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={uploading}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            {uploading ? 'Processing...' : (editingId ? 'Update Alumni' : 'Add Alumni')}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Alumni List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="bg-gray-50 rounded-lg overflow-hidden shadow"
              >
                <img
                  src={alumnus.photoUrl}
                  alt={alumnus.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-lg">{alumnus.name}</h4>
                  <p className="text-gray-600">Batch: {alumnus.batch}</p>
                  <p className="text-gray-600">{alumnus.occupation}</p>
                  <p className="text-gray-600 mt-2 line-clamp-2">{alumnus.testimonial}</p>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(alumnus)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(alumnus)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniManager;