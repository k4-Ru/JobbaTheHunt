import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../css/password.css"; 
import { useNavigate } from "react-router-dom";


function UpdatePassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
      setError(""); // Clear any previous errors
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        default:
          setError("Failed to send password reset email. Please try again.");
      }
    }
  };
  const gotoLogin = () => {
    navigate("/login");
  };

  return (
    <div className="reset-password-container">
       <div className="triangle-reset1"><img src="triangle sa bg.png" alt="bg1"/></div>
       <div className="triangle-reset2"><img src="triangle sa bg1.png" alt="bg2"/></div>
       <div className="egg-reset"><img src="eggshoot.png"></img></div>
      <div className="reset-panel">
      <h1>Reset Your Password</h1>
      <p>Enter your email address to receive a password reset link.</p>
      <div className="reset-line"></div>


      <div className="reset-box">Email Address</div>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
        className="input-box-reset"
      />



      <button onClick={handlePasswordReset} className="reset-btn">
        Send Reset Email
      </button>
      <div className="reset-msg">
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      </div>


      <div className="reset-login">Remember Password?<span onClick={gotoLogin}> Login</span></div>
      </div>
    </div>
  );
}

export default UpdatePassword;
