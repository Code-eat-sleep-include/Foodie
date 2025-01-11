import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import HomePage from './components/Home Page/HomePage'
import NavBar from './components/Nav Bar/NavBar'
import BackToTop from './components/Back To Top/BackToTop'
import Footer from './components/Footer/Footer'
import ContactUs from './components/Contact Us/ContactUs'
import AboutUs from './components/About Us/AboutUs'
import SignUpIn from './components/Sign up/SignUpIn'
import Profile from './components/Profile/Profile'
import RestaurantList from './components/Restaurants & reviews/RestaurantList'
import { useEffect } from 'react'

const App = () => {
  useEffect(() => {
    try {
      const token = new URLSearchParams(window.location.search).get('token');
      if (token) {
        console.log("Token found:", token);
        localStorage.setItem('token', token);
      } else {
        console.log("No token found in URL");
      }
    } catch (error) {
      console.error("Error handling token:", error);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <NavBar />
        <div className="contents">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/signup" element={<SignUpIn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/restrev" element={<RestaurantList />} />
          </Routes>
        </div>
        <BackToTop/>
        <Footer/>
      </div>
    </Router>
  )
}
export default App