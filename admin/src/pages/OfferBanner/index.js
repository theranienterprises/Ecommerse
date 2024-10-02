import React, { useState } from 'react';
import axios from 'axios';

const BannerUpload = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/homeBanner/uploadofferBanner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Banner images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    }
  };

  return (
<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
}}>
  <form
    onSubmit={handleSubmit}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'lightgrey',
      width: '300px'
    }}
  >
    <h2 style={{ marginBottom: '20px', color: '#333' }}>Upload Banner</h2>
    <div style={{ marginBottom: '20px', width: '100%' }}>
      <label htmlFor="image1" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
        Banner Image 1:
      </label>
      <input
        type="file"
        id="image1"
        onChange={(e) => setImage1(e.target.files[0])}
        required
        style={{ 
          display: 'block',
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    </div>
    <div style={{ marginBottom: '20px', width: '100%' }}>
      <label htmlFor="image2" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
        Banner Image 2:
      </label>
      <input
        type="file"
        id="image2"
        onChange={(e) => setImage2(e.target.files[0])}
        required
        style={{ 
          display: 'block',
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    </div>
    <button
      type="submit"
      style={{
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
    >
      Upload Banner Images
    </button>
  </form>
</div>

  );
};

export default BannerUpload;