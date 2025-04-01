import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import "../css/Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: name });
      console.log("UID:", firebaseUser.uid);
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: firebaseUser.uid,
          email,
          name,
          profile_pic: null,
        }),
      });
      if (response.ok) {
        console.log("User stored");
        navigate("/home");
      } else {
        alert("Failed to register. Please try again.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          name: user.displayName,
          profile_pic: user.photoURL || null,
        }),
      });
      if (response.ok) {
        navigate("/home");
      } else {
        alert("Failed to register. Please try again.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <img src="line_bg.svg" alt="background lines" className="line-bg" />
      <img src="egg_logo.svg" alt="background egg" className="egg-bg" />
      <img src="triangle_bg.svg" alt="background triangle" className="triangle-bg" />
      <h1 className="title">Jobba <br /> The <br /> Hunt</h1>
      <div className="login-panel">
        <h2 className="welcome-txt">Get Started</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="input-box" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-box" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-box" />
        <button onClick={handleRegister} disabled={loading} className="register-btn">
          {loading ? "Registering..." : "Sign Up"}
        </button>
        <div className="divider"><span>or continue with</span></div>
        <div className="social-icons">
          <img src="google.png" alt="Google" onClick={handleGoogleSignUp} />
        </div>
        <p>Already have an account? <a href="#" onClick={() => navigate("/login")}>Login now</a></p>
      </div>
    </div>
  );
};

export default Register;
