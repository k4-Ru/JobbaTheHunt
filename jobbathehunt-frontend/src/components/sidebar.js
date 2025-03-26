import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";  // Import Firebase auth
import axios from "axios";
import { onAuthStateChanged , signOut} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const response = await axios.get(`http://localhost:5000/get-profile/${user.uid}`);
          setProfileImage(response.data.profileImage);
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
    };

    fetchProfileImage();
  }, []);















  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };














  return (
    <div>
      {/* Display Profile Image */}
      <div>
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            width="80"
            height="80"
          />
        ) : (
          <p>Loading...</p>
        )}
        <hr />
      </div>


      {/* Navigation Links */}
      <nav>
  <ul>
    <li><Link to="/">Home</Link></li>
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
