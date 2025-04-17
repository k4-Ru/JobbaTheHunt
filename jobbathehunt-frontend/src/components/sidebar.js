import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Sidebar = () => {
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);  // Loading state
  const navigate = useNavigate();

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



  

  return (
    <div>
      <div>
        {profileImage ? (
          <img src={profileImage} alt="Profile" width="80" height="80" style={{ borderRadius: "50%" }} />
        ) : (
          <p>Loading...</p>
        )}
        <hr />
      </div>



      <nav>
        <ul>
          <li><Link to="/Home">Home</Link></li>
          <li><Link to="/interview">Interview</Link></li>
          <li><Link to="/progress">Progress</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><button onClick={handleLogout}>Log out</button></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
