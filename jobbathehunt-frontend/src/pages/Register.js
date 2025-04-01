import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Signup.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Register() {
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

      // 3. Store user in MySQL (no profile pic for manual sign-up)
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: firebaseUser.uid,
          email,
          name,
          profile_pic: null
        }),
      });

      if (response.ok) {
        console.log("User stored");
        navigate("/home");
      } else {
        console.error("Failed to store user");
        alert("Failed to register. Please try again.");
      }

    } catch (error) {
      console.error("Error:", error.message);
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

      console.log("Google Sign-In UID:", user.uid);

      // Get profile pic from Google
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
        console.log("Google User stored in MySQL");
        navigate("/home");
      } else {
        console.error("Failed to store Google user in MySQL");
        alert("Failed to register. Please try again.");
      }

    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
      <button onClick={handleGoogleSignUp} className="google-button">
        Continue with Google
      </button>
      <button onClick={() => navigate("/login")} className="back-button">
        Back to Login
      </button>
    </div>
  );
}

export default Register;
