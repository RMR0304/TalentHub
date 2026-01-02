import React, { useState } from 'react';
import api from '../utils/api';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    media: null,
    mediaType: 'text'
  });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    let mediaType = 'text';
    if (file.type.includes('image')) mediaType = 'image';
    else if (file.type.includes('pdf') || file.type.includes('document') || 
             file.type.includes('msword') || file.type.includes('sheet') || 
             file.type.includes('presentation') || file.type.includes('text')) mediaType = 'file';
    
    setFormData({
      ...formData,
      media: file,
      mediaType
    });

    if (mediaType === 'image') {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (mediaType === 'file') {
      setPreview(null);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (!formData.tags.trim()) {
      setError('At least one tag is required');
      return;
    }
    
    if (formData.mediaType !== 'text' && !formData.media) {
      setError(`${formData.mediaType} upload is required for this post type`);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('mediaType', formData.mediaType);
      if (formData.media) formDataToSend.append('media', formData.media);
      
      console.log('Sending post data:', Object.fromEntries(formDataToSend));
      
      const res = await api.post('/api/posts', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log('Post created successfully:', res.data);
      onCreate(res.data);
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Content*</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <div className="form-group">
            <label>Tags* (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="art, photography, writing"
              required
            />
          </div>
          <div className="form-group">
            <label>Media Type*</label>
            <select
              name="mediaType"
              value={formData.mediaType}
              onChange={handleChange}
              required
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="file">File</option>
            </select>
          </div>
          {formData.mediaType !== 'text' && (
            <div className="form-group">
              <label>Upload {formData.mediaType}*</label>
              <input
                type="file"
                name="media"
                onChange={handleFileChange}
                accept={
                  formData.mediaType === 'image' ? 'image/*' : 
                  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
                }
                required
              />
              {preview && (
                <div className="media-preview">
                  {formData.mediaType === 'image' ? (
                    <img src={preview} alt="Preview" />
                  ) : (
                    <div className="file-preview">
                      <span>File: {formData.media.name}</span>
                      <span>Size: {(formData.media.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span>{uploadProgress}%</span>
            </div>
          )}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={formData.mediaType !== 'text' && !formData.media}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
