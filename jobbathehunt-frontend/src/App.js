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
import UpdatePassword from "./pages/updatePassword";
import VerificationSent from "./pages/verificationSent";
import Session from "./pages/session";
import Eval from "./pages/Eval";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const response = await fetch("http://localhost:5000/check-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firebase_uid: currentUser.uid }),
        });

        const data = await response.json();
        setHasChosen(data.hasChosen);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route
          path="/login"
          element={user && user.emailVerified ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/register"
          element={user && user.emailVerified ? <Navigate to="/home" /> : <Register />}
        />

        {/* Verification Route */}
        <Route
          path="/verification-sent"
          element={
            user && !user.emailVerified ? (
              <VerificationSent />
            ) : (
              <Navigate to={user ? "/home" : "/login"} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/choose"
          element={
            user
              ? user.emailVerified
                ? hasChosen
                  ? <Navigate to="/home" />
                  : <Choose userId={user.uid} />
                : <Navigate to="/verification-sent" />
              : <Navigate to="/login" />
          }
        />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/interview" element={user ? <Interview /> : <Navigate to="/login" />} />
        <Route path="/job/:id" element={user ? <JobDesc /> : <Navigate to="/login" />} />


        {/* CHANGE URL MAMAYA*/}
        <Route path="/session/:jobId" element={user ? <Session /> : <Navigate to="/login" />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/eval/:sessionId" element={user ? <Eval /> : <Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
