import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 
import Login from "./components/Login";
import Register from "./components/Register";
import Welcome from "./components/Welcome";
import Home from "./components/Home";
import Choose from "./components/ChooseYourPath";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  //loding

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth status changed:", currentUser);
      setUser(currentUser);  
      setLoading(false); 
    });

    return unsubscribe; 
  }, []);

  if (loading) {
    return <p>Loading...</p>; 
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/choose" element={user ? <Choose userId={user.uid} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
