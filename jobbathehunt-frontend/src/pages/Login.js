import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpWithGoogle } from "./auth";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth"; 
import "../css/login.css";




function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);    // store the authenticated user
  const [showPassword, setShowPassword] = useState(false);
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
   
    
    <div className="login-container" >
       <div className="line-bg"><img src="line.png" alt="line"></img></div>
       <div className="egg-bg"><img src="egg.png" alt="egg"/></div>
            <div className="triangle-bg"><img src="triangle.png" alt="triangle" /></div>
     <h1 className="title">Jobba<span>The</span> Hunt</h1>
    
     
        <div className="login-panel">

      <h1 className="welcome-txt">Welcome Back!</h1>
      <p className="welcome-msg">Ready to ace your next interview?<span>Let's get started!</span></p>

      {user ? (
        <p>Redirecting to Home...</p>
      ) : (
        <>
          <input 
            type="email"
            placeholder ="Username/Email " 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-box"
          />
          <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-box password-input"
          />
          <img src={showPassword ? "open-eye.svg":"close-eye.svg"} 
          alt={"Show Password"? "Hide password" :"Show Password" }
          className="eyecon"
            onClick={() => setShowPassword(!showPassword)}
          />
          </div>
          <div className="forget">Forget Password?</div>
          
          <div className="login-btm"> 
            <button onClick={handleLogin} className="login-btn">Login</button>
            <p className="continue">Or continue with</p>
            <div className="other-acc">
            <button className="microsoft-acc"><img src="microsoft.png" alt="microsoft"/></button>
              <button onClick={handleGoogleSignIn} className="google-acc"><img src="google.png" alt="ggle"/></button>
          </div> 
            
            <p className="no-acc">No Account? <span onClick={handleRegister} >Register now</span>
            </p>
          </div>
        </>
      )}
      </div>
    </div>

  );
}

export default Login;
