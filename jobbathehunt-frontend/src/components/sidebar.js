import React, { useEffect, useState } from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../css/sidebar.css"

const Sidebar = () => {
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);  // Loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:5000/get-pfp/${user.uid}`);
          setProfileImage(response.data.profileImage);
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      } else {
        navigate("/login");   // Redirect to login pag wala user 
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);







  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  const isHomeActive = location.pathname === "/Home";



  

  return (
    <div className="sidebar">
       <div className="triangle-home2"><img src="triangle sa bg1.png" alt="bg2"/></div>
      <div className="sidebar-profile">
        {profileImage ? (
          <img src={profileImage} alt="Profile" />
        ) : (
          <p>Loading...</p>
        )}
        <hr />
      
      </div>
      <div className="sidebar-profile-line"></div>
     

      <nav>
        <ul>
          <li><Link to="/Home" className={isHomeActive ? "active" : ""}><img src="home.png" className="icon"/>Home</Link></li>
          <li><Link to="/interview"><img src="Vector.png" className="icon"/>Interview</Link></li>
          <li><Link to="/progress"><img src="progress bar.png" className="icon"/>Progress</Link></li>
          <li><Link to="/settings"><img src="settings.png" className="icon"/>Settings</Link></li>
          <li onClick={handleLogout} className="logout"><img src="logout.png" className="icon"/>Log out</li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
