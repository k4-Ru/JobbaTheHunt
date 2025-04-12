import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";  // Import Sidebar
import "../css/home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/check-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid: currentUser.uid }),
        });

        const data = await response.json();

        if (!data.hasPreferences) {
          navigate("/choose");  // Go to choose page if no preferences
        }
      } catch (error) {
        console.error("Error checking preferences:", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);



  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="home-container">
        <Sidebar />  {/* Sidebar stays on the side of the screen */}
        <div className="triangle-home1"><img src="triangle sa bg.png" alt="bg1"/></div>
       
    <div className="home-panel" >
  <h1 className="home-title">Home</h1>
  <div className="line"></div>


      {/* Main Content */}
      <div  className="home">  {/* Add margin to avoid overlap */}
        <div className="bro-icon"><img src="bro.png" alt="bro"/></div>
        {user ? (
        <h1 className="welcome-user">Welcome Back, <span> {user.displayName || user.email}!</span> </h1>
      ) : (
        <p>Loading user...</p>
      )}
          <h2>Ready to start your interview?</h2>
            <div className="shortcut-interview">Start Interview</div>


            {/* job-recommendation */}
        <div className="jobroles">
          <h2>Recommended Roles for you</h2>
            <div className="job-line"></div>
         <div className="recommend-jobs">{/* add delete job recommendation*/}
              {[
                "UI/UX",
                "FRONTEND DEVELOPER",
                "MOBILE DEVELOPER",
                "DATA SCIENTIST",
                "BACKEND DEVELOPER",
                "CYBER SECURTY"
              ].map((role, i )=>(
                <div className="job-box" key={i}>
                  <span>{role}</span>
                  <button className="try-btn">Try</button>
                  </div>
              ))
              }
          
        </div>
        </div>
        
      </div>
    </div>
    </div>
  );
}

export default Home;
