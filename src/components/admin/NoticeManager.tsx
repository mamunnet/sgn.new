import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';
import { Trash2, Edit, Plus, Upload, FileText } from 'lucide-react';

const NoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notices'), (snapshot) => {
      const noticeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticeData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let pdfUrl = null;
      let pdfPath = null;

      if (selectedFile) {
        const storageRef = ref(storage, `notices/${Date.now()}_${selectedFile.name}`);
        await uploadBytes(storageRef, selectedFile);
        pdfUrl = await getDownloadURL(storageRef);
        pdfPath = storageRef.fullPath;
      }

      const noticeData = {
        title,
        content,
        date: new Date().toISOString(),
        ...(pdfUrl && { pdfUrl, pdfPath })
      };

      if (editingId) {
        const oldNotice = notices.find(n => n.id === editingId);
        if (oldNotice?.pdfPath && selectedFile) {
          // Delete old PDF if exists and new file is uploaded
          const oldStorageRef = ref(storage, oldNotice.pdfPath);
          await deleteObject(oldStorageRef);
        }
        await updateDoc(doc(db, 'notices', editingId), noticeData);
        toast.success('Notice updated successfully');
      } else {
        await addDoc(collection(db, 'notices'), noticeData);
        toast.success('Notice added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving notice:', error);
      toast.error('Error saving notice');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setContent(notice.content);
    setEditingId(notice.id);
  };

  const handleDelete = async (notice) => {
    try {
      if (notice.pdfPath) {
        const storageRef = ref(storage, notice.pdfPath);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'notices', notice.id));
      toast.success('Notice deleted successfully');
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Error deleting notice');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Notices</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Attach PDF (Optional)
          </label>
          <label className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-lg tracking-wide border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
            <Upload className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">Select PDF file</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {selectedFile.name}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          {uploading ? 'Processing...' : (editingId ? 'Update Notice' : 'Add Notice')}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Current Notices</h3>
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border-l-4 border-emerald-500 bg-gray-50 p-4 rounded flex justify-between items-start"
              >
                <div>
                  <h4 className="font-semibold">{notice.title}</h4>
                  <p className="text-gray-600 mt-1">{notice.content}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(notice.date).toLocaleDateString()}
                    </span>
                    {notice.pdfUrl && (
                      <span className="text-sm text-emerald-600 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        PDF Attached
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeManager;