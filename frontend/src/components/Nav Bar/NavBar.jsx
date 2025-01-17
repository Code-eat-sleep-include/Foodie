import React, { useState, useEffect } from 'react';
import './NavBar.css';
import ramenlogo from '../../assets/ramenlogo.webp';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    /*useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setIsLoggedIn(true);
                setUserName(decoded?.name || "Guest"); 
            } catch (error) {
                console.error("Invalid token format:", error);
                localStorage.removeItem('token'); 
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const handleProfileClick = () => {
        if (isLoggedIn) {
            navigate('/profile');
        } else {
            navigate('/signup');
        }
    };*/

    return (
        <div className="navbar">
            <div className="logo-container">
                <Link to="/">
                    <img src={ramenlogo} alt="Logo" className="logoo" />
                </Link>
                <Link to="/"><h2 className="website-name">Feastopedia</h2></Link>
            </div>
            <div className="others">
                <Link to="/"><h2 className="other-navs">Home</h2></Link>
                <Link to="/restrev"><h2 className="other-navs">Restaurants & reviews</h2></Link>
                <Link to="/contact"><h2 className="other-navs">Contact Us</h2></Link>

                {isLoggedIn ? (
                    <>
                        <FaUserCircle className="user-icon" onClick={handleProfileClick} size={32} />
                        <span className="username">{userName}</span>
                    </>
                ) : (
                    <Link to="/signup"><h2 className="other-navs">Sign in/up</h2></Link>
                )}

            </div>
        </div>
    );
};

export default NavBar;