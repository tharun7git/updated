import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { photoService, folderService } from '../services/api';
import PhotoCard from '../components/PhotoCard';

const FolderView = () => {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    image: null,
    folder: id
  });
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook

  useEffect(() => {
    fetchFolder();
    fetchPhotos();
  }, [id]);

  const fetchFolder = async () => {
    const response = await folderService.getFolder(id);
    setFolder(response.data);
  };

  const fetchPhotos = async () => {
    const response = await photoService.getPhotosByFolder(id);
    setPhotos(response.data);
  };

  const handleDeletePhoto = async (photoId) => {
    await photoService.deletePhoto(photoId);
    fetchPhotos();
  };

  const handleUpdatePhoto = async (photoId, updateData) => {
    await photoService.updatePhoto(photoId, updateData);
    fetchPhotos();
  };

  const handleInputChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      image: e.target.files[0]
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.image) {
      alert('Please select an image to upload');
      return;
    }
    
    setIsUploading(true);
    try {
      await photoService.uploadPhoto(uploadData);
      setUploadData({
        title: '',
        description: '',
        image: null,
        folder: id
      });
      // Reset the file input
      document.getElementById('photoUpload').value = '';
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its photos?`)) {
      try {
        await folderService.deleteFolder(id);
        navigate('/');
      } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder');
      }
    }
  };

  if (!folder) return <div>Loading...</div>;

  return (
    <div className="folder-view">
      <h2>Folder: {folder.name}</h2>
      
      {/* Photo Upload Form */}
      <div className="upload-section">
        <h3>Upload Photo</h3>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="photoUpload">Select Image</label>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={uploadData.title}
              onChange={handleInputChange}
              placeholder="Photo Title"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              value={uploadData.description}
              onChange={handleInputChange}
              placeholder="Description (optional)"
            />
          </div>
          <button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>
      
      <div className="photo-grid">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <PhotoCard 
              key={photo.id} 
              photo={photo} 
              onDelete={handleDeletePhoto} 
              onUpdate={handleUpdatePhoto}
            />
          ))
        ) : (
          <p>No photos in this folder yet. Upload some photos!</p>
        )}
      </div>
      <button onClick={handleDeleteFolder} className="btn btn-danger">Delete Folder</button>
      <Link to="/">Back to Dashboard</Link>
    </div>
  );
};

export default FolderView;
