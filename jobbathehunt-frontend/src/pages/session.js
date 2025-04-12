import { useParams, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import Transcription from "../components/transcription";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../components/auth";




const Session = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const jobRole = location.state?.jobRole || "Default Role";

  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);


  const [userId, setUserId] = useState(null); // Track authenticated user
  const [checkingAuth, setCheckingAuth] = useState(true); // Handle loading state
  const navigate = useNavigate(); // Navigate to another page if not authenticated



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login"); // Redirect to login if user is not authenticated
      } else {
        setUserId(user.uid); // Set the userId from Firebase
      }
      setCheckingAuth(false); // Done checking auth
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);





  // 🔹 Start interview
  useEffect(() => {

    if (!userId) return;

    const startInterview = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/interview", {
          jobRole,
          userId,
        });
        setConversation([{ role: "GPT", content: res.data.question }]);
        setSessionId(res.data.sessionId);
      } catch (error) {
        console.error("Error starting interview:", error);
        alert("Error starting interview. Please try again.");
      }
    };

    startInterview();
  }, [jobRole, userId]);










  // 🔹 Handle user response
  const handleUserResponse = async (customText) => {
    const responseText = customText || text;
    if (!responseText || !sessionId) return;

    setConversation((prev) => [...prev, { role: "User", content: responseText }]);
    setText(""); // Clear input field

    try {
      const res = await axios.post("http://localhost:5000/api/interview", {
        userResponse: responseText,
        jobRole,
        userId,
      });

      if (res.data?.question) {
        setConversation((prev) => [...prev, { role: "GPT", content: res.data.question }]);
        if (!sessionId) setSessionId(res.data.sessionId); // In case it's newly created
      }
    } catch (err) {
      console.error("Failed to fetch next question:", err);
      alert("Could not continue interview. Try again.");
    }
  };











  // 🔹 Speech Recognition Setup
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false; // Set to false for one-shot response
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      const finalTranscript = transcript.trim();
      setText(finalTranscript);
      handleUserResponse(finalTranscript); // Automatically submit response
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);










  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };







  // 🔹 Camera setup
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };






  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
    } else {
      startCamera();
      setIsCameraOn(true);
    }
  };





  const endSession = () => {
    recognitionRef.current?.abort();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    alert("Interview Session ended.");
  };








  useEffect(() => {
    startCamera();
  }, []);




  
   if (checkingAuth) {
    return <div>Loading...</div>;
  }




  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#BBCE8A" }}>
        <div style={{ position: "relative" }}>
          <img src="interviewer.png" alt="AI" style={{ width: "100%" }} />
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "150px",
                height: "100px",
                objectFit: "cover",
                transform: "scaleX(-1)",
                border: "2px solid #000",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "150px",
                height: "100px",
                backgroundColor: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #000",
              }}
            >
              <p>Camera is off</p>
            </div>
          )}
        </div>

        <div style={{ margin: "20px", padding: "20px" }}>
          <button onClick={toggleListening}>
            {isListening ? "Stop Mic" : "Start Mic"}
          </button>
          <button onClick={toggleCamera}>
            {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
          <button onClick={endSession}>End Call</button>
        </div>
      </div>

      <div style={{ width: "33%", margin: "20px" }}>
        <Transcription
          conversation={conversation}
          onUserResponse={() => handleUserResponse()}
          userSpeech={text}
        />
      </div>
    </div>
  );
};

export default Session;
