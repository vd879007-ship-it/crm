import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Download, Hash, User as UserIcon, Calendar, RefreshCw, Pencil, Trash2, X } from 'lucide-react';

interface SharedFile {
  id: string;
  fileUrl: string;
  content: string;
  createdAt: string;
  user: { name: string; email: string };
  channel: { name: string };
}

export default function Files() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState<SharedFile | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/files`);
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch shared files', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleOpenEdit = (file: SharedFile) => {
    setEditingFile(file);
    setEditContent(file.content || '');
    setShowEditModal(true);
  };

  const handleUpdateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/files/${editingFile.id}`, {
        content: editContent
      });
      setShowEditModal(false);
      setEditingFile(null);
      fetchFiles();
    } catch (err) {
      console.error('Failed to update file details', err);
      alert('Failed to update file details');
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this shared file?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/files/${id}`);
      fetchFiles();
    } catch (err) {
      console.error('Failed to delete file', err);
      alert('Failed to delete file');
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, formData);

      // Get General channel and current user
      const channelsRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/channels`);
      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/employees`);
      
      const channelId = channelsRes.data[0]?.id;
      const userId = usersRes.data[0]?.id;

      if (channelId && userId) {
        // Save as message attachment so it appears in workspace files
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/channels/` + channelId + '/messages', {
          content: `Uploaded file: ${file.name}`,
          channelId,
          userId,
          fileUrl: uploadRes.data.url
        }).catch(() => {
          // Alternatively emit via socket or seed
        });
      }
      
      fetchFiles();
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const parts = url.split('/');
      const fullName = parts[parts.length - 1];
      // Strip timestamp prefix if present (e.g., 1742000000-filename.pdf)
      const subParts = fullName.split('-');
      if (subParts.length > 1 && !isNaN(Number(subParts[0]))) {
        return subParts.slice(1).join('-');
      }
      return fullName;
    } catch {
      return 'Attachment';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Workspace Files</h2>
          <p className="text-sm text-gray-500">All attachments shared across channels and messages</p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchFiles}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh Files"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <label className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input type="file" className="hidden" onChange={handleDirectUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading workspace files...</div>
      ) : files.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50/50">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">No files shared yet</p>
          <p className="text-xs text-gray-400 mb-4">Attach files in chat messages or click Upload File above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => {
            const fileName = getFileNameFromUrl(file.fileUrl);
            return (
              <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate" title={fileName}>
                        {fileName}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{file.content || 'Shared in chat'}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      <span>{file.channel?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{file.user?.name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <a 
                  href={file.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-2 border border-gray-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Open</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

