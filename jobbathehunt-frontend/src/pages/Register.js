import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";




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



    useEffect(() => {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      console.log("User is already logged in and verified. Redirecting to /home...");
      navigate("/home");
    }
  }, [navigate]);










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
        
            // email verification
          await sendEmailVerification(firebaseUser);
        
          console.log(`Verification email sent to ${email}`);
        
            // Store the user in the database
          const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firebase_uid: firebaseUser.uid,
                email,
                name,
                profile_pic: null, // You can add a default profile picture if needed
              }),
            });
        
            if (response.ok) {
              console.log("User stored in the database successfully.");
            } else {
              console.error("Failed to store user in the database.");
            }
        
        
          navigate("/verification-sent", { state: { email } });
          } catch (error) {
            let customMessage = "";
            if (error.code === "auth/email-already-in-use") {
              customMessage = "This email is already in use. If you haven't verified your email, please resend the verification email.";
            } else if (error.code === "auth/weak-password") {
              customMessage = "Your password is too weak. Please use a stronger password.";
            } else {
              customMessage = error.message;
            }
            setErrorMessages([customMessage]);
          }finally {
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






  const gotoLogin = async () => {
    try {
      await auth.signOut(); // Log out the current user
      console.log("User logged out successfully.");
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
          onChange={(e) => setEmail(e.target.value.toLowerCase())} 
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
