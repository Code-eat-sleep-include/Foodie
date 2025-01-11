import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
    
        if (token) {
            localStorage.setItem('token', token);
            queryParams.delete('token');
            window.history.replaceState(null, null, `/profile?${queryParams.toString()}`);
        } else {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                navigate('/signup'); 
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/signup');
    };

    return (
        <div className="profile-container">
            <h1>Welcome to Your Profile</h1>
            <p>You are successfully logged in!</p>
            <button className="logout-btn" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Profile;