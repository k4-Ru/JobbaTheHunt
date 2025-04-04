import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  const [fade, setFade] = useState(false);

  useEffect(() => {


    // fade-in effect
    setFade(true);

    // 3 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-container">
      <h1 className={`welcome-text ${fade ? "fade-in-out" : ""}`}>Welcome</h1>
    </div>
  );
};

export default Welcome;
