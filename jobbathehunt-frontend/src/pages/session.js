import { useParams, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import Transcription from "../components/transcription";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth, onAuthStateChanged } from "../components/auth";

const Session = () => {
  //const { jobId } = useParams();
  const location = useLocation();
  const jobRole = location.state?.jobRole;

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





  // Check if user is logged in...
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        console.log("User ID:", user.uid);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);







  // Start interview
  useEffect(() => {
    if (!userId || !jobRole) 
      return;
  
    const startInterview = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/interview", {
          jobRole,
          userId,
          
        });
  
        setConversation([{ role: "GPT", content: res.data.question }]);
        setSessionId(res.data.sessionId);
      } catch (err) {
        console.error("Interview start error:", err.response?.data || err.message);
        alert("Something went wrong. Try refreshing.");
      }
    };
  
    startInterview();
  }, [userId, jobRole]); // add checkingAuth to avoid unnecessary re-renders
  
  
  

  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);



  const handleUserResponse = async (customText) => {
    const responseText = customText || text;
    if (!responseText) return;
  
    setConversation((prev) => [...prev, { role: "User", content: responseText }]);
    setText("");

    console.log("Sending:", { sessionId, userId, jobRole,  userResponse: responseText });
    

  
    try {
      // Send user response to the backend API for processing
      const res = await axios.post("http://localhost:5000/api/interview", {
        userResponse: responseText,
        jobRole,
        userId,
      });
  
      console.log("Sending response:", responseText);
  
      if (res.data?.question) {
        // If there's a question in the response, add it to the conversation
        setConversation((prev) => [...prev, { role: "GPT", content: res.data.question }]);
  
        // If this is the first time receiving a session, set the session ID
        if (!sessionId) setSessionId(res.data.sessionId);
      }
  
      // Check if the interview is completed (final question, rating, and evaluation)
      if (res.data?.status === 'completed') {

        alert(`Interview completed.`);
        
        window.location.href = `/eval?sessionId=${res.data.sessionId}`;
    } else {
      // Handle the normal interview process if not completed
      console.log('Next question:', res.data.question);
    }
  } catch (err) {
    console.error('Failed to fetch next question:', err);
    alert('Could not continue interview. Try again.');
  }
};







  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    let silenceTimeout;

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event) => {
      clearTimeout(silenceTimeout); // Reset if still speaking

      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";

        

      }

      const finalTranscript = transcript.trim();
      setText(finalTranscript);
      
      
      
      console.log("Transcription:", finalTranscript); //test


      // Wait n seconds to see if user stopped talking
      silenceTimeout = setTimeout(() => {
        if (finalTranscript) {
          handleUserResponse(finalTranscript);
          setText(""); // Clear after submission
        }
      }, 3000); // Adjust timeout to match how long you're willing to wait
    };

    return () => {
      recognitionRef.current?.abort();
      clearTimeout(silenceTimeout);
    };
  }, [userId]);

















  // On/Off Mic
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };














  // Camera
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





  // On/Off Camera
  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
    } else {
      startCamera();
      setIsCameraOn(true);
    }
  };










  const endSession = async () => {
    const isConfirmed = window.confirm("Are you sure you want to abandon the session? This will end the interview.");
  
    if (isConfirmed) {
      // Abort recognition
      recognitionRef.current?.abort();
  
      // Stop video tracks
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
  
      // Flag the session as abandoned on the server
      try {
        await axios.post("http://localhost:5000/markAbandoned", { sessionId });
        console.log("Session marked as abandoned");
      } catch (error) {
        console.error("Failed to mark session as abandoned:", error);
      }
  
      alert("Interview Session abandoned.");
      window.location.href = "/interview"; // or "/choose" or wherever you want to go
    }
  };
  





  // Start camera on load
  useEffect(() => {
    startCamera();
  }, []);







  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (sessionId.current) {
        navigator.sendBeacon(
          "http://localhost:5000/markAbandoned",
          new Blob([JSON.stringify({ sessionId: sessionId.current })], {
            type: "application/json",
          })
        );
        console.log("Session marked abandoned (via beacon)");
      }

      const warning = "Leaving this page will mark the session as abandoned.";
      event.returnValue = warning;
      return warning;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  



  // Loading on checking account
  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return (


    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#BBCE8A" }}>
        <div style={{ position: "relative" }}>


          
          <img src="/interviewer.png" alt="AI" style={{ width: "100%" }} />
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
          onUserResponse={(text) => handleUserResponse(text)}
          userSpeech={text}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default Session;
