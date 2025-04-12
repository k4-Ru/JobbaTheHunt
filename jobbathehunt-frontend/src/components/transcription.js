import React, { useState } from "react";

function Transcription({ conversation, onUserResponse, userSpeech }) {
  const [manualInput, setManualInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const userResponse = manualInput || userSpeech;
    if (!userResponse) return;
    
    // Add user response and send to parent
    onUserResponse(userResponse);

    setManualInput(""); // Clear input field
  };

  return (
    <div style={{ backgroundColor: "#BBCE8A", padding: "20px", borderRadius: "10px", height: "100%", overflowY: "auto" }}>
      <h2>Transcription</h2>
      <hr />

      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        {conversation.map((entry, index) => (
          <div key={index} style={{ marginBottom: "20px", backgroundColor: entry.role === "User" ? "#f1f1f1" : "#d1e7dd", padding: "10px", borderRadius: "8px" }}>
            <h3 style={{ textAlign: entry.role === "User" ? "right" : "left" }}>{entry.role === "User" ? "You" : "Interviewer"}</h3>
            <p>{entry.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px", position: "relative", width: "100%" }}>
        <input
          type="text"
          placeholder="Type your response"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 80px 10px 10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Transcription;
