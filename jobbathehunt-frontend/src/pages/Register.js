import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]); 
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();













  const handleRegister = async () => {
    const errors = [];

    if (!email || !password || !name) {
      errors.push("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      errors.push("Passwords do not match.");
    }

    if (password.length < 8) errors.push("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number.");

    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: name });

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
        navigate("/home");
      } else {
        setErrorMessages(["Failed to store user in the database. Please try again."]);
      }

    } catch (error) {
      setErrorMessages([error.message]);
    } finally {
      setLoading(false);
    }
  };





  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const profilePic = user.photoURL || null;

      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email: user.email,
          name: user.displayName,
          profile_pic: profilePic
        }),
      });

      if (response.ok) {
        navigate("/home");
      } else {
        setErrorMessages(["Failed to store Google user in the database. Please try again."]);
      }

    } catch (error) {
      setErrorMessages([error.message]); 
    }
  };






  const gotoLogin = () => {
    navigate("/login");
  };





  return (
    <div className="register-container">
      <div className="register-bg1"><img src="assets/register-bg1.png" /></div>
      <div className="register-bg2"><img src="assets/register-bg2.png" /></div>
      <div className="eggshoot"><img src="assets/egg_logo.png" alt="bb" /></div>


      <h1 className="register-title">Jobba<span>The</span>Hunt</h1>



      {errorMessages.length > 0 && (
      <div className="error-register">
        <div className="chat-text">
          {errorMessages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
        <div className="error-bubble-tail-register"></div>
      </div>
    )}






      <div className="register-panel">
        <h2 className="start">Get Started</h2>

        

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-box"
        />


        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-box"
        />





        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-box password-input"
          />
          <img
            src={showPassword ? "assets/open-eye.png" : "assets/close-eye.png"}
            alt={showPassword ? "Hide password" : "Show password"}
            className="register-eyecon"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="password-container">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="register-box password-input"
          />

          <img
            src={showConfirm ? "assets/open-eye.png" : "assets/close-eye.png"}
            alt={showConfirm ? "Hide password" : "Show password"}
            className="register-eyecon"
            onClick={() => setShowConfirm(!showConfirm)}
          />
        </div>




        <button onClick={handleRegister} className="signup-btn" disabled={loading}>
          {loading ? "Registering..." : "Sign-Up"}
        </button>
        <p className="continue">Continue with Google</p>
        <div className="other-acc">
          <button className="microsoft-acc"><img src="assets/microsoft.png" alt="microsoft" /></button>
          <button onClick={handleGoogleSignUp} className="google-acc"><img src="assets/google.png" alt="google" /></button>
        </div>

        <p className="no-acc">Already have an account? <span onClick={gotoLogin}>Login now</span></p>
      </div>
    </div>

    
  );
}

export default Register;
