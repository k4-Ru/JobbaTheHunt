import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";


function UpdatePassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="update-password-container">
      <h1>Reset Your Password</h1>
      <p>Enter your email address to receive a password reset link.</p>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value.toLowerCase())}
        className="input-box"
      />
      <button onClick={handlePasswordReset} className="reset-btn">
        Send Reset Email
      </button>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default UpdatePassword;