import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Upload, Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../lib/firebase';

interface Banner {
  id: string;
  imageUrl: string;
  storagePath: string;
  fileName: string;
  createdAt: string;
  userId: string;
}

const BannerManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [user] = useAuthState(auth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const bannerData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[];
        setBanners(bannerData);
        setError(null);
      },
      (err) => {
        console.error('Error fetching banners:', err);
        setError('Failed to load banners');
        toast.error('Error loading banners');
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
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

      setUploading(true);

      // Create a temporary image element to check dimensions
      const img = document.createElement('img');
      const imgPromise = new Promise<boolean>((resolve) => {
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio < 1.3 || aspectRatio > 1.8) {
            toast.error('Please upload an image with landscape orientation (16:9 recommended)');
            resolve(false);
          } else {
            resolve(true);
          }
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
          toast.error('Error loading image');
          URL.revokeObjectURL(img.src);
          resolve(false);
        };
      });

      // Create temporary URL for validation
      const tempUrl = URL.createObjectURL(file);
      img.src = tempUrl;

      const isValidDimensions = await imgPromise;
      if (!isValidDimensions) {
        setUploading(false);
        return;
      }

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
      const storagePath = `banners/${timestamp}_${cleanFileName}`;
      
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name
        }
      };

      const uploadResult = await uploadBytes(storageRef, file, metadata);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // Add to Firestore
      await addDoc(collection(db, 'banners'), {
        imageUrl: downloadUrl,
        storagePath: storagePath,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        fileName: cleanFileName
      });

      toast.success('Banner uploaded successfully');
      if (e.target) e.target.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.message || 'Failed to upload banner');
      toast.error(err?.message || 'Error uploading banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!user) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, banner.storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, 'banners', banner.id));

      toast.success('Banner deleted successfully');
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err?.message || 'Error deleting banner');
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Please log in to manage banners.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banner Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage website banners</p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="banner-upload"
            disabled={uploading}
          />
          <label
            htmlFor="banner-upload"
            className={`inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg
              hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50
              disabled:cursor-not-allowed ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Banner
              </>
            )}
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div 
            key={banner.id}
            className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={banner.imageUrl}
              alt={banner.fileName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
        <div className="text-center py-12 text-gray-500">
          No banners uploaded yet.
        </div>
      )}
    </div>
  );
};

export default BannerManager;