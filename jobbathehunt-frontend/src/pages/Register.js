import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Signup.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");/* para sa confirm pass*/
  const [showPassword, setShowPassword] = useState(false);/* para sa show pass*/
  const [showConfirm,setShowConfirm] = useState(false);/* para sa hide pass*/
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !==confirmPassword){
      alert("Password is Incorrect!");
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
  const handleLogin = () => {/*ginaya ko ung sa login tinangal ko kc ung button para maka back sa login */
    navigate("/login");
  };

  return (
    <div className="register-container">
      <div className="register-bg1"></div>
      <div className="register-bg2"></div>
      <div className="eggshoot"><img src="eggshoot.png" alt="bb"></img></div>
      <h1 className="register-title">Jobba<span>The</span>Hunt</h1>
      <div className="register-panel">
        <div>
        <h2 className="start">Get Started</h2></div>
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
        type={showPassword?"text":"password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="register-box password-input"
      />
      <img src={showPassword?  "open-eye.png":"close-eye.png"}
      alt={"Show Password"?"hide pasword":"Show password"}
      className="register-eyecon"
      onClick={()=> setShowPassword(!showPassword)}
      />
       </div>


       <div className="password-container">
      <input
      type={showConfirm?"text":"password"}/*toggle para sa show and hide ng pass */
      placeholder="Confirm Password"
      value={confirmPassword}
      onChange={(e)=> setConfirmPassword(e.target.value)}
      className="register-box password-input"
      />
      <img src={showConfirm? "open-eye.png":"close-eye.png"}
      alt={"Show Password"?"hide pasword":"Show password"}
      className="register-eyecon"
      onClick={()=> setShowConfirm(!showConfirm)}
      />  
     </div>



      <button onClick={handleRegister} className="signup-btn" disabled={loading}>
        {loading ? "Registering..." : "Sign-Up"}
      </button>
      <p className="continue">Continue with Google</p>
      <div className="other-acc">
            <button className="microsoft-acc"><img src="microsoft.png" alt="microsoft"/></button>
              <button onClick={handleGoogleSignUp} className="google-acc"><img src="google.png" alt="ggle"/></button>
          </div> 
  
      <p className="no-acc">No Account? <span onClick={handleLogin} >Register now</span>
      </p>

      </div>
    </div>  
  );
}

export default Register;
