import React from "react";
import "./Signup.css";

const Signup = () => {
  return (
    <div className="container">
      <h1 className="title">Jobba <br />The<br /> Hunt</h1>
      <div className="form-box">
        <img src="egg_logo.svg" alt="egg" className="egg-parachute" />
        <h2>Get Started</h2>
        <form>
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email Address" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit">Sign Up</button>
        </form>
        <div className="divider">
          <span>or continue with</span>
        </div>
        <div className="social-icons">
          <img src="microsoft.png" alt="Microsoft" />
          <img src="google.png" alt="Google" />
          <img src="facebook.png" alt="Facebook" />
        </div>
        <p>Already have an account? <a href="#">Login now</a></p>
      </div>
    </div>
  );
};

export default Signup;
