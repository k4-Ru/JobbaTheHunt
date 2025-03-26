import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";  // Import Sidebar

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
    <div className="flex">
      <Sidebar />  {/* Sidebar stays on the side of the screen */}
      
      {/* Main Content */}
      <div className="flex-1 p-10 ml-16 md:ml-64">  {/* Add margin to avoid overlap */}
        <h1 className="text-3xl font-bold">Welcome to Home</h1>
        {user ? (
          <div className="mt-4">
            <h2 className="text-xl">Hello, {user.displayName || user.email}!</h2>
        
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>
    </div>
  );
}

export default Home;
