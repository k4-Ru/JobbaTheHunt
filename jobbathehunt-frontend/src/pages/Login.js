import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpWithGoogle } from "../components/auth";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth"; 
import "../css/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);    // store the authenticated user
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);  //error messages

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
    const errors = [];

    if (!email || !password) {
      errors.push("Please fill out both fields.");
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }

    try {
      await loginUser(email, password);
      navigate("/home");
    } catch (error) {
      let msg = "";
      switch (error.code) {
        case "auth/invalid-credential":
          msg = "No account found with that email.";
          break;
        case "auth/wrong-password":
          msg = "Incorrect password.";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format.";
          break;
        case "auth/user-disabled":
          msg = "This account has been disabled.";
          break;
        default:
          msg = "Login failed. Please try again.";
      }

      setErrorMessages([msg]); 
    }
  };













  const handleGoogleSignIn = async () => {
    try {
      await signUpWithGoogle();
      navigate("/home"); 
    } catch (error) {
      setErrorMessages([error.message]); 
    }
  };





  const handleRegister = () => {
    navigate("/register");
  };










  return (
    <div className="login-container" >
      <div className="line-bg"><img src="assets/line.png" alt="line" /></div>
      <div className="egg-bg"><img src="assets/egg.png" alt="egg" /></div>
      <div className="triangle-bg"><img src="assets/triangle.png" alt="triangle" /></div>
      <h1 className="title">Jobba<span>The</span> Hunt</h1>

      <div className="login-panel">
        <h1 className="welcome-txt">Welcome Back!</h1>
        <p className="welcome-msg">Ready to ace your next interview?<span>Let's get started!</span></p>

        {errorMessages.length > 0 && (
      <div className="error-container-login">
        <div className="chat-text">
          {errorMessages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
        <div className="chat-bubble-tail-login"></div>
      </div>
    )}

        {user ? (
          <p>Redirecting to Home...</p>
        ) : (
          <>





              <input 
              type="email"
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}  //gawin lowercase
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
              <img 
                src={showPassword ? "assets/open-eye.png" : "assets/close-eye.png"} 
                alt="Show Password"
                className="eyecon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>



            <div 
              className="forget" 
              onClick={() => navigate("/update-password")}
            >
              Forgot Password?
            </div>




            <div className="login-btm"> 
              <button onClick={handleLogin} className="login-btn">Login</button>
              <p className="continue">Or continue with</p>
              <div className="other-acc">
                <button className="microsoft-acc"><img src="assets/microsoft.png" alt="microsoft" /></button>
                <button onClick={handleGoogleSignIn} className="google-acc"><img src="assets/google.png" alt="google" /></button>
              </div> 

              <p className="no-acc">No Account? <span onClick={handleRegister}>Register now</span></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
