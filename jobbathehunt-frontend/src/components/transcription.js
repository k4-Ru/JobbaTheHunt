import React from "react";

const Transcription = ({ text }) => {
  return (
    <div className="p-6 mt-4">
      <h2 className="text-2xl font-bold">Live Transcription</h2>
      <p className="mt-4 p-4 border rounded bg-gray-100">
        {text || "Listening..."} 
      </p>
    </div>
  );
};

export default Transcription;
