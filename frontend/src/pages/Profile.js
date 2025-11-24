import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <h2>Personal Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            {user?.isAdmin && (
              <div className="info-row">
                <label>Role:</label>
                <span className="admin-badge">Administrator</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-card">
          <h2>Address</h2>
          {user?.address ? (
            <div className="profile-info">
              <div className="info-row">
                <label>Street:</label>
                <span>{user.address.street || 'Not set'}</span>
              </div>
              <div className="info-row">
                <label>City:</label>
                <span>{user.address.city || 'Not set'}</span>
              </div>
              <div className="info-row">
                <label>State:</label>
                <span>{user.address.state || 'Not set'}</span>
              </div>
              <div className="info-row">
                <label>Zip Code:</label>
                <span>{user.address.zipCode || 'Not set'}</span>
              </div>
              <div className="info-row">
                <label>Country:</label>
                <span>{user.address.country || 'Not set'}</span>
              </div>
            </div>
          ) : (
            <p>No address saved</p>
          )}
          <p className="note">Note: Address will be saved when you place an order</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;


