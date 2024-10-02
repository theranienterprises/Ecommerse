import React, { useState } from 'react';
import axios from 'axios';

const OfferBanner2 = () => {
  // State variables for four images
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null); // New state for the fourth image

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);
    formData.append('image3', image3);
    formData.append('image4', image4); // Append the fourth image to formData

    try {
      await axios.post(`${process.env.REACT_APP_BASE_URL}/api/homeBanner/offeradd`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Offer banner images uploaded successfully');
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
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Upload Offer</h2>
        {['image1', 'image2', 'image3', 'image4'].map((imageName, index) => ( // Added 'image4'
          <div key={imageName} style={{ marginBottom: '20px', width: '100%' }}>
            <label htmlFor={imageName} style={{ display: 'block', marginBottom: '5px', color: '#555' }}>
              Offer Image {index + 1}:
            </label>
            <input
              type="file"
              id={imageName}
              onChange={(e) => {
                const setImage = [setImage1, setImage2, setImage3, setImage4][index]; // Added setImage4
                setImage(e.target.files[0]);
              }}
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
        ))}
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
          Upload Offer Images
        </button>
      </form>
    </div>
  );
};

export default OfferBanner2;
