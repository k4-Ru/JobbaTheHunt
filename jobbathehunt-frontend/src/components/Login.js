import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpWithGoogle } from "./auth";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);    // store the authenticated user
  const navigate = useNavigate();

  useEffect(() => {
   
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        navigate("/home"); //goto home pag already logged in
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      navigate("/home"); 
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signUpWithGoogle();
      navigate("/home"); 
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>

      {user ? (
        <p>Redirecting to Home...</p>
      ) : (
        <>
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
          
          <div style={{ marginTop: "20px" }}>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleGoogleSignIn}>Continue with Google</button>
            <button onClick={handleRegister}>Register</button> 
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
