import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Upload, Image } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [user] = useAuthState(auth);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    try {
      const unsubscribe = onSnapshot(collection(db, 'banners'), (snapshot) => {
        const bannerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBanners(bannerData);
      }, (error) => {
        console.error('Error fetching banners:', error);
        setError(error);
        toast.error('Error loading banners');
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up banner listener:', error);
      setError(error);
      toast.error('Error loading banners');
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create a new image object to check dimensions
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      img.onload = async () => {
        URL.revokeObjectURL(imageUrl);
        
        // Check if image dimensions are suitable for banner (16:9 or similar aspect ratio)
        const aspectRatio = img.width / img.height;
        if (aspectRatio < 1.3 || aspectRatio > 1.8) {
          toast.error('Please upload an image with landscape orientation (16:9 recommended)');
          setUploading(false);
          return;
        }

        try {
          const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);

          await addDoc(collection(db, 'banners'), {
            imageUrl: downloadUrl,
            storagePath: storageRef.fullPath,
            createdAt: new Date().toISOString(),
            userId: user.uid,
            dimensions: {
              width: img.width,
              height: img.height,
              aspectRatio
            }
          });

          toast.success('Banner uploaded successfully');
        } catch (error) {
          console.error('Error uploading banner:', error);
          toast.error('Error uploading banner');
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        toast.error('Error loading image');
        setUploading(false);
      };

      img.src = imageUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Error uploading banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (banner) => {
    if (!user) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, banner.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'banners', banner.id));
      
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error deleting banner');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        Please log in to manage banners.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Banners</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide uppercase border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
            <Image className="w-8 h-8 text-gray-500" />
            <span className="mt-2 text-base leading-normal">Select banner image</span>
            <span className="text-sm text-gray-500 mt-1">(16:9 aspect ratio recommended, max 5MB)</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Current Banners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative group aspect-[4/3] rounded-lg overflow-hidden shadow-md"
              >
                <img
                  src={banner.imageUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(banner)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {banners.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              No banners uploaded yet.
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              Error loading banners. Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManager;