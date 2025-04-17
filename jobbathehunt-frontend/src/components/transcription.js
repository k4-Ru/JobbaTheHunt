import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Transcription = ({ conversation, onUserResponse, userSpeech, userId }) => {
  const [manualInput, setManualInput] = useState("");
  const conversationEndRef = useRef(null);
  const[userProfilePic, setUserProfilePic] = useState("/user.png");

  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const handleInputChange = (event) => {
    setManualInput(event.target.value);
  };

  const handleSendClick = () => {
    const responseText = manualInput || userSpeech;
    if (responseText) {
      onUserResponse(responseText);
      setManualInput("");
    }
  };



useEffect(() => {
    const fetchUserProfilePic = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:5000/get-pfp/${userId}`);
          if (response.data.profileImage) {
            setUserProfilePic(response.data.profileImage);

          //console.log("Profile picture URL:", response.data.profileImage);

          }
        } catch (error) {
          console.error("Error fetching profile picture:", error);
        }
      }
    };

    fetchUserProfilePic();
  }, [userId]);



  return (
    <div
      style={{
        padding: "16px",
        background: "#b8d99e",
        borderRadius: "20px",
        width: "320px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <h3 style={{ margin: 0, paddingBottom: "8px" }}>Transcription</h3>
      <hr style={{ border: "none", borderTop: "1px solid #333", marginBottom: "10px" }} />

      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "0 4px",
          marginBottom: "12px",
        }}
      >
        {conversation.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: entry.role === "User" ? "flex-end" : "flex-start",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img
                src={entry.role === "User" ? userProfilePic : "/interviewer.png"}
                alt={entry.role}
                onError={(e) => { e.target.src = "/user.png"; }}
                style={{ width: 28, height: 28, borderRadius: "50%" }}
              />
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                {entry.role === "User" ? "You" : "Interviewer"}
              </span>
            </div>

            <div
              style={{
                backgroundColor: entry.role === "User" ? "#c0e0b2" : "#e4f3c6",
                padding: "10px",
                borderRadius: "12px",
                maxWidth: "80%",
                marginTop: "6px",
              }}
            >
              {entry.content}
            </div>
          </div>
        ))}
        <div ref={conversationEndRef} />
      </div>

      {/* Current speech display */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {userSpeech || "Waiting for speech..."}
        </div>
      </div>

      {/* Input field */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          value={manualInput}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendClick(); // Trigger send on Enter key press
            }
          }}
          placeholder="Type in your response"
          style={{
            flexGrow: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleSendClick}
          style={{
            padding: "10px",
            backgroundColor: "#7fb77e",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            width: "40px",
            height: "40px",
            fontSize: "18px",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Transcription;
