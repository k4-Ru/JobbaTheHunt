import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Choose from "./pages/ChooseYourPath";
import Interview from "./pages/Interview";
import JobDesc from "./pages/JobDesc";

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
        <Route path="/choose" element={user ? <Choose userId={user.uid} /> : <Navigate to="/login" />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />        
        <Route path="/interview" element={user ? <Interview /> : <Navigate to="/login" />} />
        <Route path="/job/:id" element={user ? <JobDesc /> : <Navigate to="/login" />} />  
      </Routes>
    </Router>
  );
}

export default App;
