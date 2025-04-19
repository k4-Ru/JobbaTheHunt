import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function VerificationSent() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        console.log("Checking verification status...");
        await auth.currentUser.reload(); 
        const user = auth.currentUser;

        if (user?.emailVerified) {
          console.log("Email verified!");

          const response = await fetch("http://localhost:5000/update-verification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firebase_uid: user.uid }),
          });

          if (response.ok) {
            console.log("Verification status updated in the database.");
            window.location.reload(); // f5
          } else {
            console.error("Failed to update verification status in the database.");//console messages, can be deleted
            alert("There was an issue updating your verification status. Please try again.");
          }
        } else {
          console.log("Email not verified yet.");
          console.log("User email:", user.email);  //testing purpose, delete pag mag deploy na
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        alert("An error occurred while checking your verification status. Please try again.");
      }
    };

    // every 5 seconds
    const interval = setInterval(checkVerificationStatus, 5000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="verification-sent-container">
      <h1>Verification Email Sent</h1>
      <p>
        A verification link has been sent to your email. Please check your email inbox.
      </p>
      <p>We are checking your verification status. This may take a few moments...</p>
      <button
        onClick={() => navigate("/register")}
        className="back-button"
      >
        Back to Registration
      </button>
    </div>
  );
}

export default VerificationSent;
